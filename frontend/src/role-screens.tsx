import { Icon } from './icons'
import {
  CLASSES,
  TUTOR_REGISTER_STEPS,
  TUTOR_TRUST_PUBLIC,
  profileById,
  topicStats,
  type Attempt,
} from './learn'

export function ParentHome() {
  const child = profileById('vale')
  const group = CLASSES[child.classId]
  return (
    <div className="scroll-view padded parent-view">
      <section className="parent-hero">
        <p className="parent-kicker">Familia · acompañamiento</p>
        <h2>Hola, Carmen</h2>
        <p>Resumen de {child.name.split(' ')[0]} · {group.name}</p>
      </section>
      <article className="parent-card">
        <span className="parent-pill ok">Hoy sí practicó</span>
        <h3>Micro-actividad de fracciones</h3>
        <p>Entregó la actividad del grupo a las 18:40. No necesitas corregir: Kalia ya explicó el error.</p>
      </article>
      <article className="parent-card accent">
        <p className="parent-kicker">Tutoría opcional · miércoles 17:00</p>
        <h3>Preguntas de química en vivo</h3>
        <p>Solo tutores con registro aprobado en Kalia. Valeria puede entrar si Carmen acepta; el tutor ya completó antecedentes y respaldo al inscribirse.</p>
      </article>
      <article className="parent-card">
        <h3>Esta semana</h3>
        <div className="parent-stats">
          <div><b>4</b><span>días con práctica</span></div>
          <div><b>Fracciones</b><span>habilidad en refuerzo</span></div>
          <div><b>12</b><span>racha flexible</span></div>
        </div>
      </article>
      <article className="parent-card accent">
        <h3>Cómo acompañar hoy</h3>
        <p>Pregúntale: «¿qué parte igual tiene que tener cada fracción antes de sumar?» Solo escucha; no des la respuesta.</p>
      </article>
      <p className="parent-note">Sin calificaciones ni ranking. Solo constancia y una habilidad concreta.</p>
    </div>
  )
}

export function TeacherHome({ attempts }: { attempts: Attempt[] }) {
  const group = CLASSES['2b']
  const stats = topicStats(group, attempts)
  const top = stats[0]
  return (
    <div className="scroll-view padded teacher-role-view">
      <section className="teacher-role-head">
        <div className={`mini-avatar ${group.avatar}`}>{group.teacherInitials}</div>
        <div>
          <p>Vista docente</p>
          <h2>{group.teacher}</h2>
          <span>{group.name} · {group.assignments.length} elementos en lista</span>
        </div>
      </section>
      <section className="teacher-panel">
        <p className="ribbon live">Panel del aula</p>
        <article className="reinforce">
          <p>REFUERZO DE INICIO</p>
          <div className="minutes">15 min</div>
          <h2>{top.label}</h2>
          <p className="failcount">{top.wrong} de {top.total} entregas fallaron este tema</p>
          <div className="bar"><span style={{ width: `${Math.round(top.ratio * 100)}%` }}/></div>
          <p>{top.move}</p>
          <p>Usa los primeros 15 minutos de clase presencial en este tema.</p>
        </article>
        <div className="topic-rows">{stats.slice(1).map((topic) => (
          <div className="topic-row" key={topic.skill}><strong>{topic.label}</strong><p>{topic.wrong} de {topic.total} entregas</p></div>
        ))}</div>
        <p className="panel-note">Sin tabla de estudiantes. Solo el tema donde falló la mayoría del grupo.</p>
      </section>
      <section className="teacher-quick">
        <h3>Lista asignada</h3>
        <ol>{group.assignments.map((item, index) => <li key={item.id}>{index + 1}. {item.kind === 'video' ? 'Video' : 'Micro 5 min'} · tema del grupo</li>)}</ol>
      </section>
    </div>
  )
}

function TutorStudio({ live, onToggle }: { live: boolean; onToggle: () => void }) {
  const t = TUTOR_TRUST_PUBLIC
  return (
    <>
      <p className="ribbon trust">Registro aprobado · puedes transmitir</p>
      <article className={`tutor-live-card${live ? ' is-live' : ''}`} id="tutor-live">
        <div className="live-visual">
          <span>{live ? 'EN VIVO' : 'LISTO'}</span>
          <b>H₂O</b>
        </div>
        <div>
          <span className="live-tag">{live ? 'Transmitiendo' : 'Programar'}</span>
          <h3>Preguntas de química</h3>
          <p>{live ? '42 estudiantes · chat moderado' : 'Miércoles 17:00 · 25 min'}</p>
          <button type="button" className="primary-btn" onClick={onToggle}>{live ? 'Finalizar transmisión' : 'Iniciar transmisión'}</button>
        </div>
      </article>
      <article className="parent-card">
        <h3>Lo que ven las familias</h3>
        <p>{t.name} · insignia verificado · antecedentes PJ/PNC vigentes desde el registro.</p>
        <p className="parent-note">{t.disclaimer}</p>
      </article>
    </>
  )
}

export function TutorRoleHome({
  registered,
  registerStep,
  uploads,
  live,
  onToggle,
  onToggleUpload,
  onNextStep,
  onPrevStep,
  onSubmitRegister,
  onResetRegister,
}: {
  registered: boolean
  registerStep: number
  uploads: Record<string, boolean>
  live: boolean
  onToggle: () => void
  onToggleUpload: (id: string) => void
  onNextStep: () => void
  onPrevStep: () => void
  onSubmitRegister: () => void
  onResetRegister: () => void
}) {
  const step = TUTOR_REGISTER_STEPS[registerStep]
  const doneInStep = step ? step.fields.filter((f) => f.required).every((f) => uploads[f.id]) : true
  const allRequired = TUTOR_REGISTER_STEPS.flatMap((s) => s.fields.filter((f) => f.required).map((f) => f.id))
  const registerReady = allRequired.every((id) => uploads[id])

  return (
    <div className="scroll-view padded tutor-view" id="tutor-register">
      <section className="tutor-hero">
        <p className="parent-kicker">Tutor · {registered ? 'estudio en vivo' : 'registro'}</p>
        <h2>Mtra. Valeria Narváez</h2>
        <p>{registered ? TUTOR_TRUST_PUBLIC.area : 'Completa los pasos para ofrecer tutorías en Kalia'}</p>
        {!registered && <span className="trust-badge inline">Sin publicar hasta aprobar</span>}
      </section>

      {!registered && step && <>
        <p className="register-progress">Paso {registerStep + 1} de {TUTOR_REGISTER_STEPS.length}</p>
        <div className="register-stepper">
          {TUTOR_REGISTER_STEPS.map((item, index) => (
            <span key={item.id} className={index === registerStep ? 'active' : index < registerStep ? 'done' : ''}>{index + 1}</span>
          ))}
        </div>
        <article className={`parent-card register-card${step.id === 'academic' ? ' highlight-register' : ''}`}>
          <h3>{step.title}</h3>
          <p>{step.intro}</p>
          <ul className="register-fields">
            {step.fields.map((field) => (
              <li key={field.id}>
                <div>
                  <strong>{field.label}{field.required ? ' *' : ''}</strong>
                  <p>{field.hint}</p>
                </div>
                <button type="button" className={uploads[field.id] ? 'uploaded' : ''} onClick={() => onToggleUpload(field.id)}>
                  {uploads[field.id] ? 'Adjuntado' : 'Adjuntar (demo)'}
                </button>
              </li>
            ))}
          </ul>
          {step.footer && <p className="parent-note">{step.footer}</p>}
        </article>
        <div className="register-nav">
          <button type="button" className="outline-btn" onClick={onPrevStep} disabled={registerStep === 0}>Anterior</button>
          {registerStep < TUTOR_REGISTER_STEPS.length - 1
            ? <button type="button" className="primary-btn" disabled={!doneInStep} onClick={onNextStep}>Siguiente</button>
            : <button type="button" className="primary-btn" disabled={!registerReady} onClick={onSubmitRegister}>Enviar registro</button>}
        </div>
      </>}

      {registered && <>
        <TutorStudio live={live} onToggle={onToggle}/>
        <button type="button" className="outline-btn" onClick={onResetRegister}>Volver a simular registro</button>
      </>}
    </div>
  )
}