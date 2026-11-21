import { useEffect, useState } from 'react'
import { Icon } from './icons'
import {
  CLASSES, EXTRAS, QUESTIONS, TEMAS,
  classmates, clock, interestFeed, rankVideos, topicStats, videoById, whyLine,
  type Assignment, type Attempt, type Filters, type Profile, type Video,
} from './learn'

const emptyFilters: Filters = { materia: null, grado: null, tema: null }

export function Pill({ kind, value, active, onClick }: { kind: 'materia' | 'grado' | 'tema'; value: string; active?: boolean; onClick?: () => void }) {
  const label = kind === 'materia' ? 'Materia' : kind === 'grado' ? 'Grado' : 'Tema'
  const className = `learn-pill learn-pill-${kind}${active ? ' is-on' : ''}`
  if (!onClick) return <span className={className}><small>{label}</small>{value}</span>
  return <button className={className} onClick={onClick} aria-pressed={active}><small>{label}</small>{value}</button>
}

function Pills({ video, filters, onFilter }: { video: Pick<Video, 'materia' | 'grado' | 'tema'>; filters?: Filters; onFilter?: (kind: keyof Filters, value: string) => void }) {
  return <div className="tag-row">
    <Pill kind="materia" value={video.materia} active={filters?.materia === video.materia} onClick={onFilter ? () => onFilter('materia', video.materia) : undefined}/>
    {video.grado && <Pill kind="grado" value={video.grado} active={filters?.grado === video.grado} onClick={onFilter ? () => onFilter('grado', video.grado!) : undefined}/>}
    <Pill kind="tema" value={video.tema} active={filters?.tema === video.tema} onClick={onFilter ? () => onFilter('tema', video.tema) : undefined}/>
  </div>
}

function FeedArt({ video }: { video: Video }) {
  if (video.visual === 'science') return <img src="/science-lab.png" alt=""/>
  const symbol = video.visual === 'math' ? '½' : video.visual === 'percent' ? '10%' : video.visual === 'history' ? 'V' : 'x'
  return <div className="feed-art" aria-hidden="true">{symbol}<small>{video.tema}</small></div>
}

export function ParaTiFeed({ profile, onPractice }: { profile: Profile; onPractice: (video: Video) => void }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  useEffect(() => { setFilters(emptyFilters) }, [profile.id])
  const ranked = rankVideos(profile, filters)
  const toggle = (kind: keyof Filters, value: string) => setFilters((prev) => ({ ...prev, [kind]: prev[kind] === value ? null : value }))
  const filtering = Boolean(filters.materia || filters.grado || filters.tema)

  return <div className="video-feed">
    {ranked.length === 0 && <article className="video-card feed-empty">
      <div className="video-shade"/>
      <div className="video-copy">
        <h2>Ningún video con esas píldoras</h2>
        <p>Quita un filtro para volver a tu feed.</p>
        <button className="primary-btn" onClick={() => setFilters(emptyFilters)}>Quitar filtros</button>
      </div>
    </article>}
    {ranked.map((video, index) => <article className={`video-card visual-${video.visual}${index === 0 ? ' is-first' : ''}`} key={video.id}>
      <FeedArt video={video}/>
      <div className="video-shade"/>
      <div className="video-progress"><span style={{ width: `${Math.min(100, Math.round(video.duration / 90 * 100))}%` }}/></div>
      <div className="video-copy">
        <div className="creator-row"><div className="mini-avatar avatar-teal">{video.creator.slice(1, 3).toUpperCase()}</div><b>{video.creator}</b></div>
        <h1 data-first-title={index === 0 ? video.title : undefined}>{video.title}</h1>
        <p>{video.text}</p>
        <p className="why-line">{whyLine(video, profile)}</p>
        <Pills video={video} filters={filters} onFilter={toggle}/>
        {filtering && index === 0 && <button className="clear-filters" onClick={() => setFilters(emptyFilters)}>Quitar filtros</button>}
      </div>
      <div className="video-actions">
        <button onClick={() => setLiked((prev) => ({ ...prev, [video.id]: !prev[video.id] }))} className={liked[video.id] ? 'selected coral' : ''} aria-label="Me gusta"><span><Icon name="heart" fill={liked[video.id] ? 'currentColor' : 'none'}/></span><small>Me gusta</small></button>
        <button aria-label="Comentarios"><span><Icon name="comment"/></span><small>Notas</small></button>
        <button onClick={() => setSaved((prev) => ({ ...prev, [video.id]: !prev[video.id] }))} className={saved[video.id] ? 'selected yellow' : ''} aria-label="Guardar"><span><Icon name="bookmark" fill={saved[video.id] ? 'currentColor' : 'none'}/></span><small>Guardar</small></button>
        <button className="practice" onClick={() => onPractice(video)} aria-label="Practicar esto ya"><span><Icon name="practice"/></span><small>Practicar esto ya</small></button>
      </div>
      {index === 0 && <div className="swipe-hint">Desliza para seguir el orden de tus lagunas <span>↓</span></div>}
    </article>)}
  </div>
}

export function InterestsFeed({ profile, temas, onEdit }: { profile: Profile; temas: string[]; onEdit: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [noted, setNoted] = useState<Record<string, boolean>>({})
  const [joined, setJoined] = useState<Record<string, boolean>>({})
  const items = interestFeed(temas)
  return <div className="scroll-view interests-view">
    <div className="interests-sticky">
      <div className="interest-heading"><div><p>Aprendizaje autónomo guiado</p><h2>¿Qué tema te está costando esta semana?</h2></div><span><Icon name="sparkle" size={18}/></span></div>
      <div className="chips-scroll">
        {temas.map((tema) => <Pill kind="tema" value={tema} key={tema}/>)}
        <button onClick={onEdit}>{temas.length ? 'Cambiar' : 'Elegir temas'}</button>
      </div>
    </div>
    <div className="interest-stream">
      {items.length === 0 && <div className="filter-empty"><span>?</span><h3>Elige al menos un tema</h3><p>Con eso se arma tu feed, el reto y el círculo.</p></div>}
      {items.map((item) => {
        if (item.type === 'video') {
          const video = item.video
          return <article className="interest-video" key={video.id}>
            <button className={`interest-visual ${video.visual === 'science' ? 'science' : video.visual === 'history' ? 'history' : 'math'}`} onClick={() => setPlaying(playing === video.id ? null : video.id)} aria-label={playing === video.id ? 'Pausar video' : 'Reproducir video'}>
              <FeedArt video={video}/>
              <div className="interest-shade"/>
              <span className={`interest-play ${playing === video.id ? 'playing' : ''}`}>{playing === video.id ? <><i/><i/><i/></> : <Icon name="play" size={23} fill="currentColor"/>}</span>
              <small>{playing === video.id ? 'Reproduciendo' : clock(video.duration)}</small>
            </button>
            <div className="interest-video-copy">
              <Pills video={video}/>
              <h3>{video.title}</h3>
              <p className="why-quiet">Porque {profile.name.split(' ')[0]} marcó {video.tema} esta semana{video.grado ? '' : ' · sirve a más de un grado'}</p>
            </div>
          </article>
        }
        const extra = EXTRAS[item.tema]
        if (item.type === 'reto') return <article className="activity-feed-card" key={`reto-${item.tema}`}>
          <div className="activity-orbit"><span>5</span><i/><i/><i/></div>
          <div className="activity-feed-copy">
            <div className="activity-label"><Icon name="sparkle" size={14}/> RETO SEMANAL · {item.tema.toUpperCase()}</div>
            <h3>{extra.retoTitle}</h3>
            <p>{noted[item.tema] ? 'Anotado en tu semana. Si faltas un día, el avance se queda.' : extra.reto}</p>
            <Pills video={{ materia: item.tema === 'Densidad' ? 'Ciencias' : item.tema === 'Roma' ? 'Historia' : 'Matemáticas', grado: null, tema: item.tema }}/>
            <button onClick={() => setNoted((prev) => ({ ...prev, [item.tema]: true }))}>{noted[item.tema] ? 'En tu semana' : 'Anotarlo en mi semana'} <Icon name="chevron" size={16}/></button>
          </div>
        </article>
        return <article className="circle-card" key={`circulo-${item.tema}`}>
          <p className="activity-label quiet"><Icon name="community" size={14}/> CÍRCULO DE ESTUDIO</p>
          <h3>{extra.circle}</h3>
          <Pills video={{ materia: item.tema === 'Densidad' ? 'Ciencias' : item.tema === 'Roma' ? 'Historia' : 'Matemáticas', grado: null, tema: item.tema }}/>
          <div className="circle-peers">{extra.peers.map((name) => <div key={name}><span className="mini-avatar avatar-teal">{name.slice(0, 2).toUpperCase()}</span><small>{name}</small></div>)}</div>
          <p>{extra.when}. Mismo tema, sin tabla de posiciones.</p>
          <button className="outline-btn" onClick={() => setJoined((prev) => ({ ...prev, [item.tema]: true }))}>{joined[item.tema] ? `Estás con ${extra.peers[0]} y ${extra.peers[1]}` : 'Unirme al círculo'}</button>
        </article>
      })}
    </div>
  </div>
}

export function ClassesFeed({ profile, panel, onPanel, attempts, done, onSeen, onMicro }: {
  profile: Profile
  panel: boolean
  onPanel: (panel: boolean) => void
  attempts: Attempt[]
  done: Record<string, { correct?: boolean }>
  onSeen: (id: string) => void
  onMicro: (id: string) => void
}) {
  const group = CLASSES[profile.classId]
  const mates = classmates(profile)
  const stats = topicStats(group, attempts)
  const top = stats[0]
  const finished = group.assignments.filter((item) => done[`${profile.id}:${item.id}`]).length
  const pct = Math.round(finished / group.assignments.length * 100)
  return <div className="scroll-view padded">
    <section className="class-summary">
      <div><span>{group.teacher} · {group.name}</span><h2>{panel ? 'Panel del aula' : 'Lista del grupo'}</h2></div>
      <div className="progress-ring" style={{ background: `conic-gradient(var(--yellow) ${pct}%, rgba(255,255,255,.16) 0)` }}><b>{finished}/{group.assignments.length}</b></div>
    </section>
    <div className="status-filter">
      <button className={!panel ? 'active' : ''} onClick={() => onPanel(false)}>Mi lista</button>
      <button className={panel ? 'active' : ''} onClick={() => onPanel(true)}>Panel del aula</button>
    </div>
    {panel ? <section className="teacher-panel">
      <p className="ribbon">Demo · esto lo ve la docente, no el estudiante</p>
      <article className="reinforce">
        <p>REFUERZO DE INICIO</p>
        <div className="minutes">15 min</div>
        <h2>{top.label}</h2>
        <p className="failcount" data-role="fail-count">{top.wrong} de {top.total} entregas fallaron este tema</p>
        <div className="bar"><span style={{ width: `${Math.round(top.ratio * 100)}%` }}/></div>
        <p>{top.move}</p>
        <p>En la clase presencial, usa los primeros 15 minutos en este tema.</p>
        {top.live && <p className="live-note">Incluye entregas hechas en este demo.</p>}
      </article>
      <div className="topic-rows">{stats.slice(1).map((topic) => <div className="topic-row" key={topic.skill}><strong>{topic.label}</strong><p>{topic.wrong} de {topic.total} entregas</p><div className="small-progress"><span style={{ width: `${Math.round(topic.ratio * 100)}%` }}/></div></div>)}</div>
      <p className="panel-note">Sin ranking de estudiantes. El panel muestra el tema en el que falló la mayoría.</p>
    </section> : <>
      <p className="panel-note">{mates.length ? `${mates.map((mate) => mate.name).join(' y ')} ${mates.length === 1 ? 've esta misma lista' : 'ven esta misma lista'}.` : `Esta es la lista de todo ${group.name}.`} El orden lo puso {group.teacher}.</p>
      <div className="teacher-line"><div className={`mini-avatar ${group.avatar}`}>{group.teacherInitials}</div><div><b>{group.teacher}</b><span>{group.name}</span></div></div>
      {group.assignments.map((item, index) => {
        const video = item.kind === 'video' ? videoById(item.videoId) : null
        const record = done[`${profile.id}:${item.id}`]
        const title = item.kind === 'video' ? videoById(item.videoId).title : item.title
        const meta = item.kind === 'video' ? videoById(item.videoId) : item
        return <article className={`assignment-card${index === 0 ? ' is-first' : ''}`} key={item.id}>
          <div className="assignment-top"><span className="kind">{index + 1} · {item.kind === 'video' ? `Video · ${clock(video!.duration)}` : 'Micro-actividad · 5 min'}</span><span className="status">{record ? (record.correct === false ? 'Entregada · puedes repetir' : item.kind === 'video' ? 'Visto' : 'Entregada') : 'Por hacer'}</span></div>
          <h3>{title}</h3>
          <Pills video={meta}/>
          {item.kind === 'video' ? <button className="primary-btn" onClick={() => onSeen(item.id)}>{record ? 'Visto' : 'Marcar como visto'}</button> : <button className="primary-btn" onClick={() => onMicro(item.id)}>{record ? 'Repetir actividad' : 'Hacer actividad'}</button>}
        </article>
      })}
    </>}
  </div>
}

function Sheet({ title, kicker, onClose, children }: { title: string; kicker: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="sheet-layer">
    <button className="sheet-scrim" aria-label="Cerrar" onClick={onClose}/>
    <section className="overlay-sheet" role="dialog" aria-label={title}>
      <div className="sheet-grabber"/>
      <p className="sheet-kicker">{kicker}</p>
      <h2>{title}</h2>
      {children}
    </section>
  </div>
}

export function PracticeSheet({ video, onClose }: { video: Video; onClose: () => void }) {
  const question = QUESTIONS[video.skill][0]
  const [left, setLeft] = useState(60)
  const [picked, setPicked] = useState<number | null>(null)
  useEffect(() => { setLeft(60); setPicked(null) }, [video.id])
  useEffect(() => {
    if (picked !== null) return
    const id = window.setInterval(() => setLeft((value) => (value > 0 ? value - 1 : 0)), 1000)
    return () => window.clearInterval(id)
  }, [video.id, picked])
  return <Sheet title="Practicar esto ya" kicker="60 segundos · el mismo video" onClose={onClose}>
    <p className="sheet-sub">{video.title}</p>
    <div className="timer" data-timer>{clock(left)}</div>
    {left === 0 && picked === null && <p className="timer-note">Se acabó el minuto. Puedes responder igual.</p>}
    <p className="sheet-q">{question.prompt}</p>
    <div className="sheet-options">
      {question.options.map((option, index) => <button key={option} disabled={picked !== null} className={picked !== null && index === question.answer ? 'is-right' : picked === index ? 'is-miss' : ''} onClick={() => setPicked(index)}>{option}</button>)}
    </div>
    {picked !== null && <p className="sheet-explain">{question.explain}</p>}
    {picked !== null && <button className="primary-btn" onClick={onClose}>Listo</button>}
  </Sheet>
}

export function MicroSheet({ item, onClose, onSubmit, onOpenPanel }: { item: Extract<Assignment, { kind: 'micro' }>; onClose: () => void; onSubmit: (correct: boolean) => void; onOpenPanel: () => void }) {
  const questions = QUESTIONS[item.skill]
  const [answers, setAnswers] = useState<(number | null)[]>([null, null])
  const [sent, setSent] = useState(false)
  const correct = answers.every((answer, index) => answer === questions[index].answer)
  return <Sheet title={item.title} kicker="Micro-actividad · 5 min" onClose={onClose}>
    <p className="sheet-sub">En el demo hay 2 preguntas. En la actividad completa son 5 minutos. El resultado entra al panel del grupo, sin tu nombre en un ranking.</p>
    {questions.map((question, questionIndex) => <div key={question.prompt}>
      <p className="sheet-q">{questionIndex + 1}. {question.prompt}</p>
      <div className="sheet-options">
        {question.options.map((option, index) => <button key={option} disabled={sent} className={`${answers[questionIndex] === index ? 'is-picked' : ''} ${sent && index === question.answer ? 'is-right' : ''} ${sent && answers[questionIndex] === index && index !== question.answer ? 'is-miss' : ''}`} onClick={() => setAnswers((prev) => prev.map((value, place) => place === questionIndex ? index : value))}>{option}</button>)}
      </div>
      {sent && <p className="sheet-explain">{question.explain}</p>}
    </div>)}
    {!sent && <button className="primary-btn" disabled={answers.some((answer) => answer === null)} onClick={() => { setSent(true); onSubmit(correct) }}>Entregar al grupo</button>}
    {sent && <button className="primary-btn" onClick={onOpenPanel}>Ver el panel del aula</button>}
  </Sheet>
}

export function TopicPicker({ selected, onSave, onClose }: { selected: string[]; onSave: (next: string[]) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(selected)
  const toggle = (tema: string) => setDraft((prev) => prev.includes(tema) ? prev.filter((item) => item !== tema) : [...prev, tema])
  return <Sheet title="¿Qué tema te está costando esta semana?" kicker="Al entrar" onClose={onClose}>
    <p className="sheet-sub">El feed de Intereses, el reto y el círculo salen de esta respuesta.</p>
    <div className="choice-grid">{TEMAS.map((tema) => <button key={tema} className={draft.includes(tema) ? 'is-on' : ''} onClick={() => toggle(tema)} aria-pressed={draft.includes(tema)}>{tema}</button>)}</div>
    <button className="primary-btn" onClick={() => onSave(draft)}>Guardar mi semana</button>
  </Sheet>
}

