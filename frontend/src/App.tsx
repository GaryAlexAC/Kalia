import { useEffect, useState } from 'react'
import kaliaLogo from './assets/kalia-logo.png'
import { AuthScreen } from './auth-screen'
import {
  ApiError, TOKEN_STORAGE_KEY, clearToken, completeActivity, getActivities,
  getCurrentStudent, getProgress, getRanking, getStoredSessionExpiry,
  getStoredToken, getStudentBadges, getVideos, reviewStudentBadges,
  storeToken, type Activity, type ApiVideo, type AuthSession, type AuthStudent,
  type EarnedBadge, type Progress, type RankingEntry,
} from './api'
import { Icon, type IconName } from './icons'
import { ClassesFeed, InterestsFeed, MicroSheet, ParaTiFeed, PracticeSheet, TopicPicker } from './learn-screens'
import { ParentHome, TeacherHome, TutorRoleHome } from './role-screens'
import { CLASSES, ROLE_NAV_TITLE, TUTOR_REGISTER_STEPS, VIDEOS, profileById, type Attempt, type HomeTab, type Skill, type UserRole, type Video } from './learn'
import { VideoCreateForm } from './video-create-form'

const ACTIVITY_XP = 50

type MainView = 'home' | 'community' | 'create' | 'messages' | 'profile'

function mapVideo(video: ApiVideo): Video {
  const terms = `${video.title} ${video.topic ?? ''} ${video.category}`.toLowerCase()
  let skill: Skill = 'frac-suma'
  if (terms.includes('densidad') || terms.includes('ciencia')) skill = 'densidad'
  else if (terms.includes('decimal')) skill = 'decimales'
  else if (terms.includes('ecuaci')) skill = 'ecuaciones'
  else if (terms.includes('porcent')) skill = 'porcentajes'
  else if (terms.includes('roma') || terms.includes('historia')) skill = 'roma'
  const visual: Video['visual'] = skill === 'densidad' ? 'science' : skill === 'roma' ? 'history' : skill === 'porcentajes' ? 'percent' : skill === 'ecuaciones' || skill === 'decimales' ? 'equation' : 'math'
  return {
    id: video.id,
    title: video.title,
    text: video.description ?? 'Contenido educativo de Kalia.',
    creator: '@kalia',
    materia: video.category,
    grado: null,
    tema: video.topic ?? video.category,
    skill,
    duration: video.durationSeconds ?? 60,
    visual,
    embedUrl: video.embedUrl,
    sourceUrl: video.sourceUrl,
  }
}

function isAuthFailure(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

function materiaLabel(materia: Activity['materia']) {
  return materia === 'MATEMATICAS' ? 'Matemáticas' : materia === 'LECTURA' ? 'Lectura' : 'Ciencias'
}

function materiaTone(materia: Activity['materia']): 'lavender' | 'yellow' | 'coral' {
  return materia === 'MATEMATICAS' ? 'lavender' : materia === 'LECTURA' ? 'yellow' : 'coral'
}

function nivelLabel(nivel: AuthStudent['nivel']) {
  return nivel === 'EXPLORADORES' ? 'Exploradores' : nivel === 'CONSTRUCTORES' ? 'Constructores' : 'Avanzados'
}

function formatCompletedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Completada'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function developedActivities(progress: Progress[]) {
  const byActivity = new Map<number, Progress & { veces: number; xpAcumulado: number }>()
  for (const item of progress) {
    const current = byActivity.get(item.actividadId)
    if (!current) {
      byActivity.set(item.actividadId, { ...item, veces: 1, xpAcumulado: item.xp })
      continue
    }
    current.veces += 1
    current.xpAcumulado += item.xp
  }
  return [...byActivity.values()]
}

function profileFromStudent(student: AuthStudent) {
  const base = profileById('vale')
  const initials = student.nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || base.initials
  return {
    ...base,
    name: student.nombre,
    handle: `@${student.email.split('@')[0]}`,
    initials,
    gradeLabel: nivelLabel(student.nivel),
    xp: student.xpTotal,
  }
}

const nav: { id: MainView; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'community', label: 'Comunidad', icon: 'community' },
  { id: 'create', label: 'Explorar', icon: 'plus' },
  { id: 'messages', label: 'Mensajes', icon: 'message' },
  { id: 'profile', label: 'Perfil', icon: 'user' },
]

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return <button className="theme-toggle" onClick={onToggle} aria-label="Cambiar tema">
    <span className={!dark ? 'active' : ''}><Icon name="sun" size={15}/></span>
    <span className={dark ? 'active' : ''}><Icon name="moon" size={15}/></span>
  </button>
}

function BottomNav({ active, onChange }: { active: MainView; onChange: (v: MainView) => void }) {
  return <nav className="bottom-nav">
    {nav.map((item) => <button key={item.id} className={`${active === item.id ? 'active' : ''} ${item.id === 'create' ? 'create-nav' : ''}`} onClick={() => onChange(item.id)}>
      <span className="nav-icon"><Icon name={item.icon} size={item.id === 'create' ? 25 : 22}/></span>
      <span>{item.label}</span>
    </button>)}
  </nav>
}

function TopBar({ title, dark, onToggle }: { title?: string; dark: boolean; onToggle: () => void }) {
  return <header className="topbar">
    <div className="brand-mark">{title ? <span className="page-title">{title}</span> : <span className="brand-logo-wrap"><img src={kaliaLogo} alt="Kalia" width={108} height={40} decoding="async"/></span>}</div>
    <div className="top-actions">
      <ThemeToggle dark={dark} onToggle={onToggle}/>
      <button className="icon-button" aria-label="Notificaciones"><Icon name="bell" size={20}/><i/></button>
    </div>
  </header>
}

function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return <div className="segmented">{options.map((o) => <button className={value === o ? 'active' : ''} onClick={() => onChange(o)} key={o}>{o}</button>)}</div>
}

function Tag({ children, tone = 'lavender' }: { children: React.ReactNode; tone?: 'lavender' | 'yellow' | 'coral' | 'neutral' }) {
  return <span className={`tag ${tone}`}>{children}</span>
}

function Home({ dark, onToggle, tab, onTab, profile, videos, activities, completedActivityIds, temas, panel, onPanel, attempts, onPractice, onCompleteActivity, onEdit }: {
  dark: boolean
  onToggle: () => void
  tab: HomeTab
  onTab: (tab: HomeTab) => void
  profile: ReturnType<typeof profileById>
  videos: Video[]
  activities: Activity[]
  completedActivityIds: Set<number>
  temas: string[]
  panel: boolean
  onPanel: (panel: boolean) => void
  attempts: Attempt[]
  onPractice: (id: string) => void
  onCompleteActivity: (activity: Activity) => void
  onEdit: () => void
}) {
  return <div className={`view home-view ${tab === 'Para ti' ? 'immersive' : ''}`}>
    <TopBar dark={dark} onToggle={onToggle}/>
    <div className="home-tabs"><Segmented options={['Para ti', 'Intereses', 'Clases']} value={tab} onChange={(value) => onTab(value as HomeTab)}/></div>
    {tab === 'Para ti' && <ParaTiFeed profile={profile} videos={videos} onPractice={(video) => onPractice(video.id)}/>} 
    {tab === 'Intereses' && <InterestsFeed profile={profile} videos={videos} temas={temas} onEdit={onEdit}/>} 
    {tab === 'Clases' && <ClassesFeed profile={profile} activities={activities} completedActivityIds={completedActivityIds} panel={panel} onPanel={onPanel} attempts={attempts} onCompleteActivity={onCompleteActivity}/>} 
  </div>
}

function Mascot() {
  return <div className="mascot-scene">
    <div className="plant">⌁</div><div className="shelf"><i/><i/></div>
    <div className="mascot">
      <div className="ear left"/><div className="ear right"/>
      <div className="face"><i className="eye left"/><i className="eye right"/><span/></div>
      <div className="body"><b>AL</b></div>
    </div>
    <div className="rug"/>
  </div>
}

function Community({ dark, onToggle, goMessages, ranking }: { dark: boolean; onToggle: () => void; goMessages: () => void; ranking: RankingEntry[] }) {
  const [tab, setTab] = useState('Amigos')
  const [showRanking, setShowRanking] = useState(false)
  return <div className="view">
    <TopBar title="Comunidad" dark={dark} onToggle={onToggle}/>
    <div className="page-tabs"><Segmented options={['Amigos', 'Sociales']} value={tab} onChange={setTab}/></div>
    <div className="scroll-view padded community-content">
      {tab === 'Amigos' ? <>
        <section className="streak-card">
          <div className="streak-copy"><div className="eyebrow"><Icon name="fire" size={17} fill="currentColor"/> RACHA EN EQUIPO</div><h2>¡12 días aprendiendo juntos!</h2><p>Tú, Dani y Sofi están a 3 días de desbloquear una lámpara para Nilo.</p><div className="streak-progress"><span/><i/><i/><i/></div><button className="light-btn">Ver nuestra casa</button></div>
          <Mascot/>
        </section>
        <div className="invite-row"><button><span><Icon name="plus"/></span><div><b>Invitar amigos</b><small>Comparte tu enlace</small></div></button><button><span><Icon name="qr"/></span><div><b>Mi código</b><small>Escanear QR</small></div></button></div>
        <section>
          <div className="section-head"><h3>Tus amigos <span className="count">8</span></h3><button>Ver todos</button></div>
          <div className="friends-strip">
            {[
              ['DS','Dani','avatar-teal'], ['SP','Sofi','avatar-coral'], ['MC','Mateo','avatar-yellow'], ['+','Agregar','add-avatar']
            ].map(([initials, name, color]) => <button key={name}><span className={`friend-avatar ${color}`}>{initials}<i/></span><small>{name}</small></button>)}
          </div>
        </section>
        <section>
          <div className="section-head"><h3>Reto del grupo</h3><button onClick={() => setShowRanking((value) => !value)}>Tabla</button></div>
          <div className="challenge-card">
            <div className="challenge-icon"><Icon name="sparkle"/></div><div><span>CIERRA EL CICLO</span><h3>Reto de ciencias</h3><p>18 de 24 actividades · quedan 2 días</p><div className="small-progress"><span style={{width: '75%'}}/></div></div>
          </div>
          {showRanking && <div className="ranking-list">{ranking.map((entry, index) => <div key={`${entry.nombre}-${index}`}><b>{index + 1}</b><span>{entry.nombre}</span><strong>{entry.xpTotal} XP</strong></div>)}</div>}
        </section>
        <button className="recover-card"><span><Icon name="fire"/></span><div><b>¿Perdieron una racha?</b><small>Recupérenla completando una actividad juntos.</small></div><Icon name="chevron"/></button>
      </> : <>
        <div className="social-intro"><div><span>Aprender es mejor en compañía</span><h2>Tus espacios</h2></div><button><Icon name="search"/></button></div>
        <div className="live-card"><div className="live-visual"><span>EN VIVO</span><b>H₂O</b></div><div><Tag tone="coral">Ahora</Tag><h3>Preguntas de química</h3><p>Con Mtra. Valeria · 42 conectados</p><button className="primary-btn">Unirme</button></div></div>
        <section><div className="section-head"><h3>Comunidades activas</h3><button>Explorar</button></div>
          <button className="group-row" onClick={goMessages}><span className="group-icon space">∞</span><div><h4>Club del espacio</h4><p>Leo: ¿Vieron el eclipse?</p></div><time>12:40<b>3</b></time></button>
          <button className="group-row" onClick={goMessages}><span className="group-icon english">Hi</span><div><h4>English everyday</h4><p>Actividad: Describe tu ciudad</p></div><time>10:15</time></button>
          <button className="group-row" onClick={goMessages}><span className="group-icon history">V</span><div><h4>Viajeros de la historia</h4><p>Próxima tutoría: miércoles 17:00</p></div><time>Ayer</time></button>
        </section>
        <div className="group-note"><Icon name="check"/><div><b>Tú tienes el control</b><p>Puedes silenciar o salir de cualquier grupo cuando quieras.</p></div></div>
      </>}
    </div>
  </div>
}

const conversations = [
  { initials: 'DS', name: 'Dani', text: '¡Ya entendí el ejercicio 4!', time: '12:42', unread: 2, color: 'avatar-teal' },
  { initials: 'CE', name: 'Club del espacio', text: 'Leo compartió un video', time: '11:08', unread: 3, color: 'avatar-yellow' },
  { initials: 'SP', name: 'Sofi', text: '¿Hacemos el reto juntas?', time: 'Ayer', unread: 0, color: 'avatar-coral' },
  { initials: '2B', name: 'Ciencias · 2º B', text: 'Mtra. Andrea: Recuerden la entrega', time: 'Ayer', unread: 0, color: 'avatar-green' },
]

function Messages({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [chat, setChat] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  if (chat) return <div className="view chat-view">
    <header className="chat-header"><button onClick={() => setChat(null)}><Icon name="arrow"/></button><div className="mini-avatar avatar-teal">DS<i/></div><div><b>{chat}</b><span>En línea</span></div><button><Icon name="video"/></button></header>
    <div className="chat-body">
      <div className="day-divider"><span>HOY</span></div>
      <div className="bubble theirs">¿Ya viste el video de ecuaciones?<time>12:32</time></div>
      <div className="shared-video"><div className="shared-thumb"><span><Icon name="play" fill="currentColor"/></span></div><div><Tag tone="yellow">Matemáticas</Tag><b>Ecuaciones sin miedo</b><small>@mateconluis · 1:24</small></div></div>
      <div className="bubble mine">Sí, justo lo terminé. La balanza lo explica súper bien.<time>12:39 ✓✓</time></div>
      <div className="bubble theirs">¡Ya entendí el ejercicio 4!<time>12:42</time></div>
      {sent && <div className="bubble mine">¡Vamos por el reto!<time>Ahora ✓</time></div>}
      <div className="typing"><i/><i/><i/></div>
    </div>
    <div className="chat-compose"><button><Icon name="plus"/></button><div><span>Escribe un mensaje</span><button onClick={() => setSent(true)}><Icon name="send" size={20}/></button></div></div>
  </div>
  return <div className="view">
    <TopBar title="Mensajes" dark={dark} onToggle={onToggle}/>
    <div className="scroll-view padded messages-content">
      <div className="search-box"><Icon name="search" size={19}/><span>Buscar conversaciones</span></div>
      <div className="message-filter"><button className="active">Todos</button><button>No leídos</button><button>Grupos</button></div>
      <section className="conversation-list">
        {conversations.map((c) => <button key={c.name} onClick={() => setChat(c.name)}><span className={`conversation-avatar ${c.color}`}>{c.initials}<i/></span><div><h3>{c.name}</h3><p>{c.text}</p></div><time>{c.time}{c.unread > 0 && <b>{c.unread}</b>}</time></button>)}
      </section>
      <div className="safe-note"><Icon name="lock" size={18}/><span>Tus conversaciones son privadas y están protegidas.</span></div>
    </div>
  </div>
}

function Profile({ dark, onToggle, profile, badges, progress, temas, onEdit, onLogout }: { dark: boolean; onToggle: () => void; profile: ReturnType<typeof profileById>; badges: EarnedBadge[]; progress: Progress[]; temas: string[]; onEdit: () => void; onLogout: () => void }) {
  const developed = developedActivities(progress)
  return <div className="view">
    <TopBar title="Mi perfil" dark={dark} onToggle={onToggle}/>
    <div className="scroll-view profile-content">
      <section className="profile-hero">
        <button className="settings-float"><Icon name="settings"/></button>
        <div className="profile-avatar">{profile.initials}<span><Icon name="sparkle" size={16}/></span></div>
        <h2>{profile.name}</h2><p>{profile.gradeLabel} · {profile.handle}</p>
        <div className="profile-stats"><div><b>{profile.streak}</b><span>Días de racha</span></div><div><b>{profile.friends}</b><span>Amigos</span></div><div><b>{profile.xp}</b><span>XP total</span></div></div>
      </section>
      <div className="padded profile-sections">
        <section><div className="section-head"><h3>Esta semana</h3><button onClick={onEdit}>Cambiar</button></div><div className="interest-tags">{temas.length ? temas.map((tema) => <Tag tone="yellow" key={tema}>{tema}</Tag>) : <Tag tone="neutral">Sin tema elegido</Tag>}</div></section>
        <section className="learning-card"><div className="learning-top"><div><span>PROGRESO SEMANAL</span><h3>4 h 20 min aprendiendo</h3></div><div className="trend">+18%</div></div><div className="bars">{[45,70,55,90,75,35,20].map((h,i)=><div key={i}><i style={{height: `${h}%`}}/><span>{'LMXJVSD'[i]}</span></div>)}</div></section>
        <section>
          <div className="section-head"><h3>Actividades desarrolladas</h3><span className="count">{developed.length}</span></div>
          {developed.length ? <div className="progress-activity-list">{developed.map((item) => {
            const materia = item.actividad?.materia ?? 'MATEMATICAS'
            return <article className="assignment-card progress-activity-card" key={item.actividadId}>
              <div className="assignment-top"><span className="kind"><Icon name="check" size={13}/> Entregada{item.veces > 1 ? ` · ${item.veces} veces` : ''}</span><span className="status">+{item.xpAcumulado} XP</span></div>
              <h3>{item.actividad?.titulo ?? 'Actividad'}</h3>
              <div className="interest-tags"><Tag tone={materiaTone(materia)}>{materiaLabel(materia)}</Tag><Tag tone="neutral">{nivelLabel(item.nivel)}</Tag></div>
              <p>{formatCompletedAt(item.completadoEn)}</p>
            </article>
          })}</div> : <div className="filter-empty"><span>✓</span><h3>Todavía no hay entregas</h3><p>Completa una actividad en Clases y aparecerá aquí.</p></div>}
        </section>
        <section><div className="section-head"><h3>Insignias</h3><button>Ver todas</button></div><div className="badges">
          {badges.length ? badges.slice(0, 3).map((badge, index) => <div key={badge.id}><span className={`badge ${index === 0 ? 'sun-badge' : index === 1 ? 'streak-badge' : 'team-badge'}`}><Icon name={index === 0 ? 'sun' : index === 1 ? 'fire' : 'community'} fill={index === 1 ? 'currentColor' : undefined}/></span><b>{badge.nombre}</b><small>{badge.descripcion}</small></div>) : <div><span className="badge sun-badge"><Icon name="sparkle"/></span><b>Tu primera insignia</b><small>Completa actividades para conseguirla.</small></div>}
        </div></section>
        <section className="settings-list">
          <button><span><Icon name="settings"/></span><b>Configuración</b><Icon name="chevron"/></button>
          <button><span><Icon name="lock"/></span><b>Privacidad y seguridad</b><Icon name="chevron"/></button>
          <button onClick={onLogout}><span><Icon name="arrow"/></span><b>Cerrar sesión</b><Icon name="chevron"/></button>
          <div className="theme-setting"><span><Icon name={dark ? 'moon' : 'sun'}/></span><div><b>Apariencia</b><small>{dark ? 'Modo noche' : 'Modo día'}</small></div><ThemeToggle dark={dark} onToggle={onToggle}/></div>
        </section>
      </div>
    </div>
  </div>
}

function Explore({ back, onCreateVideo }: { back: () => void; onCreateVideo: () => void }) {
  return <div className="view create-overlay">
    <div className="explore-head"><div><span>CREA Y DESCUBRE</span><h1>¿Qué quieres hacer?</h1></div><button onClick={back}>Cerrar</button></div>
    <div className="create-options">
      <button className="create-card coral-option" onClick={onCreateVideo}><span><Icon name="video" size={30}/></span><div><small>COMPARTIR</small><h2>Crear un video</h2><p>Explica algo que aprendiste en menos de 3 minutos.</p></div><Icon name="chevron"/></button>
      <button className="create-card lavender-option"><span><Icon name="search" size={30}/></span><div><small>DESCUBRIR</small><h2>Explorar temas</h2><p>Encuentra videos, actividades y comunidades.</p></div><Icon name="chevron"/></button>
      <button className="create-card yellow-option"><span><Icon name="sparkle" size={30}/></span><div><small>EN EQUIPO</small><h2>Iniciar un reto</h2><p>Invita a tus amigos a aprender algo nuevo.</p></div><Icon name="chevron"/></button>
    </div>
    <div className="prompt-card"><Icon name="sparkle"/><p><b>Idea del día</b>Explica un concepto usando solo objetos que tengas cerca.</p></div>
  </div>
}

function RoleShell({
  dark, onToggle, role, attempts, tutorLive, onTutorToggle,
  tutorRegistered, tutorRegisterStep, tutorUploads, onTutorUpload, onTutorRegNext, onTutorRegPrev, onTutorRegSubmit, onTutorRegReset,
}: {
  dark: boolean
  onToggle: () => void
  role: Exclude<UserRole, 'alumno'>
  attempts: Attempt[]
  tutorLive: boolean
  onTutorToggle: () => void
  tutorRegistered: boolean
  tutorRegisterStep: number
  tutorUploads: Record<string, boolean>
  onTutorUpload: (id: string) => void
  onTutorRegNext: () => void
  onTutorRegPrev: () => void
  onTutorRegSubmit: () => void
  onTutorRegReset: () => void
}) {
  return <div className={`view role-view role-${role}`}>
    <TopBar title={ROLE_NAV_TITLE[role]} dark={dark} onToggle={onToggle}/>
    {role === 'maestro' && <TeacherHome attempts={attempts}/>}
    {role === 'padre' && <ParentHome/>}
    {role === 'tutor' && <TutorRoleHome registered={tutorRegistered} registerStep={tutorRegisterStep} uploads={tutorUploads} live={tutorLive} onToggle={onTutorToggle} onToggleUpload={onTutorUpload} onNextStep={onTutorRegNext} onPrevStep={onTutorRegPrev} onSubmitRegister={onTutorRegSubmit} onResetRegister={onTutorRegReset}/>}
  </div>
}

export default function App() {
  /** Sustituir por sesión tras login (alumno, maestro, padre, tutor). */
  const userRole: UserRole = 'alumno'
  const [view, setView] = useState<MainView>('home')
  const [student, setStudent] = useState<AuthStudent | null | undefined>(undefined)
  const [lastView, setLastView] = useState<MainView>('home')
  const [dark, setDark] = useState(false)
  const [tutorLive, setTutorLive] = useState(false)
  const [tutorRegistered, setTutorRegistered] = useState(false)
  const [tutorRegisterStep, setTutorRegisterStep] = useState(0)
  const [tutorUploads, setTutorUploads] = useState<Record<string, boolean>>({})
  const [interestOverrides, setInterestOverrides] = useState<Record<string, string[]>>({})
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [done, setDone] = useState<Record<string, { correct?: boolean }>>({})
  const [tab, setTab] = useState<HomeTab>('Para ti')
  const [classPanel, setClassPanel] = useState(false)
  const [practiceId, setPracticeId] = useState<string | null>(null)
  const [microId, setMicroId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [creatingVideo, setCreatingVideo] = useState(false)
  const [contentEpoch, setContentEpoch] = useState(0)
  const [feedVideos, setFeedVideos] = useState<Video[]>(VIDEOS)
  const [activities, setActivities] = useState<Activity[]>([])
  const [completedActivityIds, setCompletedActivityIds] = useState<Set<number>>(new Set())
  const [progress, setProgress] = useState<Progress[]>([])
  const [badges, setBadges] = useState<EarnedBadge[]>([])
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setStudent(null)
      return
    }
    getCurrentStudent(token)
      .then(setStudent)
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) clearToken()
        setStudent(null)
      })
  }, [])

  useEffect(() => {
    const synchronizeSession = (event: StorageEvent) => {
      if (event.key !== TOKEN_STORAGE_KEY) return
      const token = getStoredToken()
      if (!token) {
        setStudent(null)
        return
      }
      getCurrentStudent(token).then(setStudent).catch(() => setStudent(null))
    }
    window.addEventListener('storage', synchronizeSession)
    return () => window.removeEventListener('storage', synchronizeSession)
  }, [])

  useEffect(() => {
    if (!student) return
    const expiresAt = getStoredSessionExpiry()
    if (!expiresAt) return
    const timeout = window.setTimeout(() => {
      clearToken()
      setStudent(null)
    }, Math.max(0, expiresAt - Date.now()))
    return () => window.clearTimeout(timeout)
  }, [student])

  useEffect(() => {
    if (!student) return
    const token = getStoredToken()
    if (!token) return
    let cancelled = false

    const load = async () => {
      await reviewStudentBadges(student.id, token).catch(() => null)
      if (cancelled) return
      const [videosResult, activitiesResult, progressResult, badgesResult, rankingResult] = await Promise.allSettled([
        getVideos(20),
        getActivities(),
        getProgress(student.id, token),
        getStudentBadges(student.id, token),
        getRanking(),
      ])
      if (cancelled) return

      const authFailed = [progressResult, badgesResult].some((result) => result.status === 'rejected' && isAuthFailure(result.reason))
      if (authFailed) {
        clearToken()
        setStudent(null)
        return
      }

      if (videosResult.status === 'fulfilled' && videosResult.value.items.length) {
        setFeedVideos(videosResult.value.items.map(mapVideo))
      } else {
        setFeedVideos(VIDEOS)
      }
      if (activitiesResult.status === 'fulfilled') setActivities(activitiesResult.value)
      if (progressResult.status === 'fulfilled') {
        setProgress(progressResult.value)
        setCompletedActivityIds(new Set(progressResult.value.map((item) => item.actividadId)))
      }
      if (badgesResult.status === 'fulfilled') setBadges(badgesResult.value.obtenidas)
      if (rankingResult.status === 'fulfilled') setRanking(rankingResult.value)
    }

    void load()
    return () => { cancelled = true }
  }, [student?.id, contentEpoch])

  const authenticated = (session: AuthSession) => {
    storeToken(session.accessToken, session.expiresIn)
    setStudent(session.estudiante)
  }
  const logout = () => {
    clearToken()
    setStudent(null)
    setView('home')
    setCreatingVideo(false)
    setActivities([])
    setCompletedActivityIds(new Set())
    setProgress([])
    setBadges([])
    setRanking([])
    setFeedVideos(VIDEOS)
  }

  if (student === undefined) return <main className={dark ? 'app-shell dark' : 'app-shell'}><div className="phone-frame"><div className="auth-loading">Cargando Kalia…</div></div></main>
  if (student === null) return <main className={dark ? 'app-shell dark' : 'app-shell'}><div className="phone-frame"><AuthScreen onAuthenticated={authenticated}/></div></main>

  const profile = profileFromStudent(student)
  const temas = interestOverrides[profile.id] ?? profile.interests
  const group = CLASSES[profile.classId]
  const micro = group.assignments.find((item) => item.id === microId && item.kind === 'micro')
  const practiceVideo = practiceId ? feedVideos.find((video) => video.id === practiceId) : undefined
  const navigate = (next: MainView) => { if (next !== 'create') setLastView(next); setView(next); if (next !== 'create') setCreatingVideo(false) }
  const toggleTutorUpload = (id: string) => setTutorUploads((prev) => ({ ...prev, [id]: !prev[id] }))
  const submitMicro = (correct: boolean) => {
    if (!micro || micro.kind !== 'micro') return
    setAttempts((prev) => [...prev.filter((item) => !(item.classId === group.id && item.profileId === profile.id && item.skill === micro.skill)), { classId: group.id, profileId: profile.id, skill: micro.skill, correct }])
    setDone((prev) => ({ ...prev, [`${profile.id}:${micro.id}`]: { correct } }))
  }
  const handleCompleteActivity = async (activity: Activity) => {
    const token = getStoredToken()
    if (!token) return
    try {
      const result = await completeActivity({
        estudianteId: student.id,
        actividad: activity.slug,
        nivel: student.nivel,
        xp: ACTIVITY_XP,
      }, token)
      setCompletedActivityIds((prev) => new Set(prev).add(activity.id))
      setProgress((prev) => [{
        ...result.progreso,
        actividad: result.progreso.actividad ?? { titulo: activity.titulo, materia: activity.materia },
      }, ...prev.filter((item) => item.id !== result.progreso.id)])
      setStudent(await getCurrentStudent(token))
      if (result.insigniasNuevas.length) {
        const nextBadges = await getStudentBadges(student.id, token)
        setBadges(nextBadges.obtenidas)
      }
      setRanking(await getRanking())
    } catch (error) {
      if (isAuthFailure(error)) {
        clearToken()
        setStudent(null)
      }
    }
  }
  const isStudent = userRole === 'alumno'
  return <main className={dark ? 'app-shell dark' : 'app-shell'}>
    <div className="phone-frame" data-profile={profile.id} data-role={userRole} data-tab={tab}>
      {view === 'home' && isStudent && <Home dark={dark} onToggle={() => setDark(!dark)} tab={tab} onTab={(next) => { setTab(next); setClassPanel(false) }} profile={profile} videos={feedVideos} activities={activities} completedActivityIds={completedActivityIds} temas={temas} panel={classPanel} onPanel={setClassPanel} attempts={attempts} onPractice={setPracticeId} onCompleteActivity={(activity) => { void handleCompleteActivity(activity) }} onEdit={() => { setPickerOpen(true); setView('home'); setTab('Intereses') }}/>}
      {view === 'home' && !isStudent && <RoleShell dark={dark} onToggle={() => setDark(!dark)} role={userRole} attempts={attempts} tutorLive={tutorLive} onTutorToggle={() => setTutorLive((v) => !v)} tutorRegistered={tutorRegistered} tutorRegisterStep={tutorRegisterStep} tutorUploads={tutorUploads} onTutorUpload={toggleTutorUpload} onTutorRegNext={() => setTutorRegisterStep((s) => Math.min(s + 1, TUTOR_REGISTER_STEPS.length - 1))} onTutorRegPrev={() => setTutorRegisterStep((s) => Math.max(s - 1, 0))} onTutorRegSubmit={() => setTutorRegistered(true)} onTutorRegReset={() => { setTutorRegistered(false); setTutorRegisterStep(0); setTutorUploads({}); setTutorLive(false) }}/>}
      {view === 'community' && <Community dark={dark} onToggle={() => setDark(!dark)} goMessages={() => navigate('messages')} ranking={ranking}/>}
      {view === 'messages' && <Messages dark={dark} onToggle={() => setDark(!dark)}/>}
      {view === 'profile' && <Profile dark={dark} onToggle={() => setDark(!dark)} profile={profile} badges={badges} progress={progress} temas={temas} onEdit={() => { setPickerOpen(true); setView('home'); setTab('Intereses') }} onLogout={logout}/>}
      {view === 'create' && creatingVideo && <VideoCreateForm onClose={() => setCreatingVideo(false)} onCreated={() => { setCreatingVideo(false); setContentEpoch((value) => value + 1) }}/>}
      {view === 'create' && !creatingVideo && <Explore back={() => setView(lastView)} onCreateVideo={() => setCreatingVideo(true)}/>}
      {view !== 'create' && isStudent && <BottomNav active={view} onChange={navigate}/>}
      {practiceVideo && <PracticeSheet video={practiceVideo} onClose={() => setPracticeId(null)}/>}
      {micro && micro.kind === 'micro' && <MicroSheet item={micro} onClose={() => setMicroId(null)} onSubmit={submitMicro} onOpenPanel={() => { setMicroId(null); setView('home'); setTab('Clases'); setClassPanel(true) }}/>}
      {pickerOpen && <TopicPicker selected={temas} onClose={() => setPickerOpen(false)} onSave={(next) => { setInterestOverrides((prev) => ({ ...prev, [profile.id]: next })); setPickerOpen(false); setView('home'); setTab('Intereses') }}/>}
    </div>
  </main>
}
