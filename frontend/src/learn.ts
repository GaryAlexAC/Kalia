export type Skill = 'densidad' | 'frac-suma' | 'decimales' | 'ecuaciones' | 'porcentajes' | 'roma'

export type Question = {
  prompt: string
  options: string[]
  answer: number
  explain: string
}

export type Video = {
  id: string
  title: string
  text: string
  creator: string
  materia: string
  grado: string | null
  tema: string
  skill: Skill
  duration: number
  visual: 'science' | 'math' | 'history' | 'percent' | 'equation'
  embedUrl?: string
  sourceUrl?: string
}

export type Profile = {
  id: string
  name: string
  handle: string
  gradeLabel: string
  initials: string
  avatar: string
  classId: '2b' | '1b'
  gaps: Skill[]
  mastered: Skill[]
  interests: string[]
  gapLabels: string[]
  masteredLabels: string[]
  streak: number
  friends: number
  xp: number
}

export type Assignment =
  | { id: string; kind: 'video'; videoId: string }
  | { id: string; kind: 'micro'; skill: Skill; title: string; materia: string; grado: string | null; tema: string }

export type ClassTopic = {
  skill: Skill
  label: string
  peerWrong: number
  peerAnswers: number
  move: string
}

export type ClassGroup = {
  id: '2b' | '1b'
  name: string
  teacher: string
  teacherInitials: string
  avatar: string
  assignments: Assignment[]
  topics: ClassTopic[]
}

export type Attempt = { classId: string; profileId: string; skill: Skill; correct: boolean }

export type FeedItem =
  | { type: 'video'; video: Video }
  | { type: 'reto'; tema: string }
  | { type: 'circulo'; tema: string }

export type Filters = { materia: string | null; grado: string | null; tema: string | null }

export const QUESTIONS: Record<Skill, Question[]> = {
  densidad: [
    { prompt: 'Si el objeto es más denso que el agua, ¿qué pasa?', options: ['Se hunde', 'Flota', 'Desaparece'], answer: 0, explain: 'Se hunde. El video compara la densidad del objeto con la del agua.' },
    { prompt: '¿Cuál de estos suele flotar?', options: ['Una piedra', 'Un corcho', 'Una llave'], answer: 1, explain: 'El corcho es menos denso que el agua, por eso flota.' },
  ],
  'frac-suma': [
    { prompt: '¿Cuánto es 1/2 + 1/3?', options: ['2/5', '5/6', '2/6'], answer: 1, explain: 'El denominador común es 6. 1/2 es 3/6 y 1/3 es 2/6. Juntas suman 5/6.' },
    { prompt: '¿Cuánto es 1/4 + 1/6?', options: ['2/10', '5/12', '1/5'], answer: 1, explain: 'El común es 12. 1/4 es 3/12 y 1/6 es 2/12. Juntas suman 5/12.' },
  ],
  decimales: [
    { prompt: '¿Cuál es mayor?', options: ['0.45', '0.5', 'Son iguales'], answer: 1, explain: '0.5 es 0.50. Cinco décimas son más que cuarenta y cinco centésimas.' },
    { prompt: '¿Cuánto es 0.5 + 0.25?', options: ['0.30', '0.75', '0.55'], answer: 1, explain: '0.50 + 0.25 = 0.75.' },
  ],
  ecuaciones: [
    { prompt: 'Si x + 4 = 11, ¿cuánto vale x?', options: ['15', '7', '44'], answer: 1, explain: 'Se quita el 4 de los dos lados. x = 7.' },
    { prompt: 'Si 2x = 10, ¿cuánto vale x?', options: ['8', '12', '5'], answer: 2, explain: 'Los dos lados se dividen entre 2. x = 5.' },
  ],
  porcentajes: [
    { prompt: '¿Cuánto es el 10% de Q80?', options: ['Q8', 'Q10', 'Q18'], answer: 0, explain: 'El 10% es la décima parte. 80 entre 10 es 8.' },
    { prompt: '¿Cuánto es el 25% de Q40?', options: ['Q4', 'Q10', 'Q25'], answer: 1, explain: 'La cuarta parte de 40 es 10.' },
  ],
  roma: [
    { prompt: '¿Qué se está contando en el video?', options: ['Un día en Roma', 'Una fórmula', 'Un experimento'], answer: 0, explain: 'El video recorre un día común en la antigua Roma.' },
    { prompt: '¿Para qué sirve ordenar la línea del tiempo?', options: ['Ver qué pasó antes', 'Sumar fracciones', 'Medir densidad'], answer: 0, explain: 'La línea muestra qué ocurrió primero y qué vino después.' },
  ],
}

export const VIDEOS: Video[] = [
  { id: 'v-den-short', title: 'Densidad en un vaso', text: 'Un minuto para predecir qué se hunde y qué flota.', creator: '@laura.ciencia', materia: 'Ciencias', grado: null, tema: 'Densidad', skill: 'densidad', duration: 32, visual: 'science' },
  { id: 'v-float', title: '¿Por qué flotan algunas cosas?', text: 'Descubre la densidad con un experimento que puedes repetir en casa.', creator: '@laura.ciencia', materia: 'Ciencias', grado: '2º', tema: 'Densidad', skill: 'densidad', duration: 48, visual: 'science' },
  { id: 'v-mcd', title: 'El mínimo común en 40 segundos', text: 'El paso que falta antes de sumar fracciones distintas.', creator: '@mateconluis', materia: 'Matemáticas', grado: null, tema: 'Fracciones', skill: 'frac-suma', duration: 38, visual: 'math' },
  { id: 'v-frac', title: 'El truco visual de las fracciones', text: 'Mira las partes iguales antes de sumar.', creator: '@mateconluis', materia: 'Matemáticas', grado: '2º', tema: 'Fracciones', skill: 'frac-suma', duration: 42, visual: 'math' },
  { id: 'v-dec', title: 'Comparar decimales', text: 'Cuál precio es mayor cuando hay un punto decimal.', creator: '@mateconluis', materia: 'Matemáticas', grado: '1º', tema: 'Decimales', skill: 'decimales', duration: 36, visual: 'equation' },
  { id: 'v-dec-long', title: 'Repaso largo de decimales', text: 'Un recorrido completo. Conviene solo si todavía hace falta.', creator: '@mateconluis', materia: 'Matemáticas', grado: '1º', tema: 'Decimales', skill: 'decimales', duration: 150, visual: 'equation' },
  { id: 'v-eq', title: 'Ecuaciones sin miedo', text: 'La balanza para despejar la x.', creator: '@mateconluis', materia: 'Matemáticas', grado: '2º', tema: 'Ecuaciones', skill: 'ecuaciones', duration: 50, visual: 'equation' },
  { id: 'v-eq-long', title: 'Ecuaciones con paréntesis', text: 'Primero se abre el paréntesis y después se despeja.', creator: '@mateconluis', materia: 'Matemáticas', grado: null, tema: 'Ecuaciones', skill: 'ecuaciones', duration: 96, visual: 'equation' },
  { id: 'v-pct', title: 'El 10% sin calculadora', text: 'Sacar la décima parte de un precio.', creator: '@mateconluis', materia: 'Matemáticas', grado: null, tema: 'Porcentajes', skill: 'porcentajes', duration: 28, visual: 'percent' },
  { id: 'v-pct2', title: 'Porcentaje de una cantidad', text: 'Del 10% al 25% con un ejemplo del mercado.', creator: '@mateconluis', materia: 'Matemáticas', grado: '2º', tema: 'Porcentajes', skill: 'porcentajes', duration: 46, visual: 'percent' },
  { id: 'v-roma', title: 'Un día en la antigua Roma', text: 'Cómo se veía una jornada común.', creator: '@historia.clara', materia: 'Historia', grado: '2º', tema: 'Roma', skill: 'roma', duration: 70, visual: 'history' },
]

export const PROFILES: Profile[] = [
  { id: 'vale', name: 'Valentina Álvarez', handle: '@valeaprende', gradeLabel: '2º de secundaria', initials: 'VA', avatar: 'avatar-coral', classId: '2b', gaps: ['densidad', 'frac-suma'], mastered: ['decimales'], interests: ['Densidad', 'Fracciones'], gapLabels: ['Densidad', 'Sumar fracciones'], masteredLabels: ['Decimales'], streak: 12, friends: 8, xp: 640 },
  { id: 'diego', name: 'Diego Morales', handle: '@diego.mora', gradeLabel: '1º de secundaria', initials: 'DM', avatar: 'avatar-teal', classId: '1b', gaps: ['ecuaciones'], mastered: ['densidad', 'frac-suma'], interests: ['Ecuaciones'], gapLabels: ['Ecuaciones'], masteredLabels: ['Densidad', 'Fracciones'], streak: 4, friends: 5, xp: 210 },
  { id: 'lucia', name: 'Lucía Gómez', handle: '@lucia.gomez', gradeLabel: '2º de secundaria', initials: 'LG', avatar: 'avatar-yellow', classId: '2b', gaps: ['porcentajes'], mastered: ['frac-suma'], interests: ['Porcentajes'], gapLabels: ['Porcentajes'], masteredLabels: ['Fracciones'], streak: 9, friends: 6, xp: 480 },
]

export const CLASSES: Record<Profile['classId'], ClassGroup> = {
  '2b': {
    id: '2b',
    name: '2º B',
    teacher: 'Profa. Andrea',
    teacherInitials: 'AM',
    avatar: 'avatar-coral',
    assignments: [
      { id: 'a-frac', kind: 'video', videoId: 'v-frac' },
      { id: 'm-frac', kind: 'micro', skill: 'frac-suma', title: 'Tres sumas, cinco minutos', materia: 'Matemáticas', grado: '2º', tema: 'Fracciones' },
      { id: 'a-den', kind: 'video', videoId: 'v-float' },
      { id: 'm-den', kind: 'micro', skill: 'densidad', title: '¿Flota o se hunde?', materia: 'Ciencias', grado: '2º', tema: 'Densidad' },
    ],
    topics: [
      { skill: 'frac-suma', label: 'Sumar fracciones con distinto denominador', peerWrong: 21, peerAnswers: 31, move: 'Tres sumas en la pizarra. Primero el denominador común, después la suma.' },
      { skill: 'densidad', label: 'Densidad', peerWrong: 8, peerAnswers: 31, move: 'Un objeto y un vaso de agua. Que predigan en voz alta antes de soltarlo.' },
    ],
  },
  '1b': {
    id: '1b',
    name: '1º B',
    teacher: 'Profe Javier',
    teacherInitials: 'JR',
    avatar: 'avatar-yellow',
    assignments: [
      { id: 'a-eq', kind: 'video', videoId: 'v-eq' },
      { id: 'm-eq', kind: 'micro', skill: 'ecuaciones', title: 'Despejar sin calculadora', materia: 'Matemáticas', grado: '1º', tema: 'Ecuaciones' },
      { id: 'a-dec', kind: 'video', videoId: 'v-dec' },
      { id: 'm-dec', kind: 'micro', skill: 'decimales', title: '¿Cuál decimal es mayor?', materia: 'Matemáticas', grado: '1º', tema: 'Decimales' },
    ],
    topics: [
      { skill: 'ecuaciones', label: 'Despejar la x', peerWrong: 22, peerAnswers: 34, move: 'Tres ecuaciones cortas en la pizarra, diciendo qué se deshace primero.' },
      { skill: 'decimales', label: 'Decimales', peerWrong: 5, peerAnswers: 30, move: 'Comparar dos precios del recreo.' },
    ],
  },
}

export const EXTRAS: Record<string, { retoTitle: string; reto: string; circle: string; peers: [string, string]; when: string }> = {
  Densidad: { retoTitle: 'Cinco predicciones de flotación', reto: 'Una por día. Si faltas, lo que ya hiciste se queda.', circle: 'Laura y Mateo practican densidad en este momento.', peers: ['Laura', 'Mateo'], when: 'Ahora · 15 min' },
  Fracciones: { retoTitle: 'Cinco sumas con distinto denominador', reto: 'Una micropráctica por día. Sin ranking y sin borrar el avance.', circle: 'Emilia y Andrés practican exactamente sumar fracciones.', peers: ['Emilia', 'Andrés'], when: 'Ahora · 15 min' },
  Decimales: { retoTitle: 'Cinco precios para comparar', reto: 'Un decimal por día, con precios de verdad.', circle: 'Camila y Hugo comparan decimales hoy.', peers: ['Camila', 'Hugo'], when: 'Hoy · 5:00 pm' },
  Ecuaciones: { retoTitle: 'Despejar la x cinco veces', reto: 'Sin calculadora. Si un día no entras, los otros días siguen contando.', circle: 'Luis y Andrea se juntan a practicar ecuaciones.', peers: ['Luis', 'Andrea'], when: 'Hoy · 4:30 pm' },
  Porcentajes: { retoTitle: 'Cinco descuentos del mercado', reto: 'Un precio por día, empezando por el 10%.', circle: 'Sofía y Pablo practican porcentajes ahora.', peers: ['Sofía', 'Pablo'], when: 'Ahora · 15 min' },
  Roma: { retoTitle: 'Cinco escenas de un día romano', reto: 'Ordenar qué pasaba primero, una escena por día.', circle: 'Clara y Leo están en el mismo recorrido de Roma.', peers: ['Clara', 'Leo'], when: 'Mañana · 4:00 pm' },
}

export const TEMAS = ['Densidad', 'Fracciones', 'Ecuaciones', 'Porcentajes', 'Decimales', 'Roma']

export type HomeTab = 'Para ti' | 'Intereses' | 'Clases'
export type UserRole = 'alumno' | 'maestro' | 'padre' | 'tutor'

/** Título en la barra superior según el rol (sesión / login). */
export const ROLE_NAV_TITLE: Record<UserRole, string | undefined> = {
  alumno: undefined,
  maestro: 'Maestro',
  padre: 'Familia',
  tutor: 'Tutor',
}

export type TutorRegisterField = { id: string; label: string; hint: string; required: boolean }

export type TutorRegisterStep = {
  id: string
  title: string
  intro: string
  fields: TutorRegisterField[]
  footer?: string
}

/** Pasos del flujo «Registrarse como tutor». */
export const TUTOR_REGISTER_STEPS: TutorRegisterStep[] = [
  {
    id: 'academic',
    title: 'Académico y seguridad',
    intro: 'Validación de respaldo y confianza ante padres o estudiantes. Clave para trabajar con menores.',
    fields: [
      { id: 'acad', label: 'Respaldo académico', hint: 'Título de nivel medio, constancia de cursos, pensum cerrado o título profesional (colegiado activo si aplica).', required: true },
      { id: 'cert', label: 'Certificaciones', hint: 'TOEFL, IELTS, Cambridge u otra certificación del área que enseñas.', required: false },
      { id: 'pj', label: 'Antecedentes penales', hint: 'Organismo Judicial · vigente · tramitable en línea.', required: true },
      { id: 'pnc', label: 'Antecedentes policiales', hint: 'PNC · vigente · tramitable en línea.', required: true },
      { id: 'refs', label: 'Referencias y evidencia', hint: 'Cartas de recomendación, reseñas o oferta de sesión diagnóstica de prueba.', required: true },
    ],
    footer: 'Kalia revisa estos documentos antes de mostrar tu perfil a familias.',
  },
  {
    id: 'fiscal',
    title: 'Validación fiscal',
    intro: 'Si das tutorías de forma constante, trabajas con empresas o padres piden factura.',
    fields: [
      { id: 'rtu', label: 'RTU en SAT', hint: 'Registro Tributario Unificado · actividad servicios educativos o profesionales independientes.', required: true },
      { id: 'regimen', label: 'Régimen', hint: 'Lo común: Pequeño Contribuyente (5% sobre lo facturado).', required: true },
      { id: 'fel', label: 'Factura electrónica (FEL)', hint: 'Habilitación para emitir FEL a quien lo solicite.', required: true },
    ],
    footer: 'Las tutorías particulares independientes no están exentas como un colegio autorizado por MINEDUC.',
  },
  {
    id: 'institutional',
    title: 'Validación institucional',
    intro: 'Kalia y, si aplica, una universidad o academia validan tu perfil.',
    fields: [
      { id: 'dpi', label: 'Identidad', hint: 'DPI y copia de títulos o constancias universitarias.', required: true },
      { id: 'interview', label: 'Entrevista y clase modelo', hint: 'Entrevista técnica y una clase muestra (plataforma o academia).', required: true },
      { id: 'uni', label: 'Tutoría universitaria (opcional)', hint: 'Facultad revisa promedio, nota del curso y entrevista con catedrático.', required: false },
      { id: 'mineduc', label: 'Alcance MINEDUC', hint: 'Confirmas que el refuerzo no otorga calificación oficial del ministerio.', required: true },
    ],
    footer: 'Para validez oficial MINEDUC se requiere título docente y registro en el sistema educativo; Kalia es refuerzo complementario.',
  },
]

export type TutorCheckStatus = 'ok' | 'pending' | 'info'

export type TutorCheck = { id: string; title: string; detail: string; status: TutorCheckStatus; renewed?: string }

/** Lo que padres y estudiantes pueden revisar antes de unirse a un vivo o tutoría. */
export const TUTOR_TRUST_PUBLIC = {
  name: 'Mtra. Valeria Narváez',
  area: 'Ciencias · química básica',
  rating: '4,8',
  sessions: 126,
  checks: [
    { id: 'acad', title: 'Respaldo académico', detail: 'Licenciatura en Química · pensum cerrado USAC (constancia 2024).', status: 'ok' as TutorCheckStatus, renewed: 'Ago 2025' },
    { id: 'cert', title: 'Especialidad', detail: 'Diploma laboratorio seguro · curso MINEDUC modalidad virtual.', status: 'ok' as TutorCheckStatus },
    { id: 'pj', title: 'Antecedentes penales', detail: 'Organismo Judicial · vigente · tramitado en línea.', status: 'ok' as TutorCheckStatus, renewed: 'Oct 2025' },
    { id: 'pnc', title: 'Antecedentes policiales', detail: 'PNC · vigente · tramitado en línea.', status: 'ok' as TutorCheckStatus, renewed: 'Oct 2025' },
    { id: 'refs', title: 'Referencias', detail: '12 reseñas verificadas · 1 sesión diagnóstica gratuita disponible.', status: 'ok' as TutorCheckStatus },
  ] satisfies TutorCheck[],
  disclaimer: 'Refuerzo en Kalia. No otorga nota oficial del MINEDUC ni reemplaza al maestro del grupo.',
}

export function clock(total: number) {
  const safe = Math.max(0, total)
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

export function videoById(id: string) {
  const video = VIDEOS.find((item) => item.id === id)
  if (!video) throw new Error(`Video faltante: ${id}`)
  return video
}

export function profileById(id: string) {
  return PROFILES.find((item) => item.id === id) ?? PROFILES[0]
}

function tier(video: Video, profile: Profile) {
  if (profile.gaps.includes(video.skill)) return 0
  if (profile.mastered.includes(video.skill)) return 2
  return 1
}

export function rankVideos(profile: Profile, filters: Filters, videos: Video[] = VIDEOS) {
  return videos.filter((video) => {
    if (filters.materia && video.materia !== filters.materia) return false
    if (filters.grado && video.grado !== filters.grado) return false
    if (filters.tema && video.tema !== filters.tema) return false
    return true
  }).sort((a, b) => tier(a, profile) - tier(b, profile) || a.duration - b.duration || a.title.localeCompare(b.title, 'es'))
}

export function whyLine(video: Video, profile: Profile) {
  const place = tier(video, profile)
  const time = clock(video.duration)
  const grade = video.grado ? '' : ' · sirve a más de un grado'
  if (place === 0) return `${time} · va primero: es una laguna tuya${video.duration <= 45 ? ' y es corto' : ''}${grade}`
  if (place === 2) return `${time} · va al final: ya dominas esto${grade}`
  return `${time} · después de tus lagunas${grade}`
}

export function interestFeed(temas: string[], videos: Video[] = VIDEOS): FeedItem[] {
  const items: FeedItem[] = []
  for (const tema of temas) {
    const topicVideos = videos.filter((video) => video.tema === tema).sort((a, b) => a.duration - b.duration)
    topicVideos.forEach((video, index) => {
      items.push({ type: 'video', video })
      if (index === 0) items.push({ type: 'reto', tema })
      if (index === topicVideos.length - 1) items.push({ type: 'circulo', tema })
    })
  }
  return items
}

export function classmates(profile: Profile) {
  return PROFILES.filter((item) => item.classId === profile.classId && item.id !== profile.id)
}

export function topicStats(group: ClassGroup, attempts: Attempt[]) {
  return group.topics.map((topic) => {
    const demo = attempts.filter((item) => item.classId === group.id && item.skill === topic.skill)
    const wrong = topic.peerWrong + demo.filter((item) => !item.correct).length
    const total = topic.peerAnswers + demo.length
    return { ...topic, wrong, total, ratio: total ? wrong / total : 0, live: demo.length > 0 }
  }).sort((a, b) => b.ratio - a.ratio || b.wrong - a.wrong)
}
