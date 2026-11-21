import { useState, type FormEvent } from 'react'
import kaliaLogo from './assets/kalia-logo.png'
import { ApiError, login, register, type AuthSession, type Nivel } from './api'
import { Icon } from './icons'

const NIVELES: { id: Nivel; title: string; hint: string }[] = [
  { id: 'EXPLORADORES', title: 'Exploradores', hint: 'Empiezas a descubrir.' },
  { id: 'CONSTRUCTORES', title: 'Constructores', hint: 'Ya estás armando ideas.' },
  { id: 'AVANZADOS', title: 'Avanzados', hint: 'Vas por más reto.' },
]

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nivel, setNivel] = useState<Nivel>('EXPLORADORES')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Escribe un correo electrónico válido.')
      return
    }
    if (mode === 'register') {
      if (!nombre.trim()) {
        setError('El nombre es obligatorio.')
        return
      }
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.')
        return
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.')
        return
      }
    }

    setSending(true)
    try {
      const session = mode === 'login'
        ? await login(trimmedEmail, password)
        : await register({ nombre: nombre.trim(), email: trimmedEmail, password, nivel })
      onAuthenticated(session)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No fue posible conectar con Kalia.')
    } finally {
      setSending(false)
    }
  }

  const changeMode = (next: 'login' | 'register') => {
    setMode(next)
    setError(null)
    setConfirmPassword('')
  }

  return <div className="auth-view">
    <section className="auth-hero">
      <span className="auth-logo-wrap"><img src={kaliaLogo} alt="Kalia" width={132} height={49}/></span>
      <small>ACCESO A LA ACADEMIA</small>
      <h1>{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
      <p>{mode === 'login' ? 'Entra con tu correo para seguir tus videos, actividades e insignias.' : 'Regístrate para guardar tu progreso y tu XP en Kalia.'}</p>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <div className="segmented auth-tabs">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Iniciar sesión</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Registrarme</button>
      </div>
      {mode === 'register' && <label>Nombre completo<input value={nombre} onChange={(event) => setNombre(event.target.value)} autoComplete="name" required maxLength={120} placeholder="Ana Torres"/></label>}
      <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={320} placeholder="ana@kalia.edu"/></label>
      <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1} maxLength={128} placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}/></label>
      {mode === 'register' && <label>Confirmar contraseña<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} maxLength={128} placeholder="Repite la contraseña"/></label>}
      {mode === 'register' && <fieldset className="auth-niveles">
        <legend>Nivel</legend>
        {NIVELES.map((item) => <button type="button" key={item.id} className={nivel === item.id ? 'is-on' : ''} onClick={() => setNivel(item.id)}>
          <b>{item.title}</b>
          <small>{item.hint}</small>
        </button>)}
      </fieldset>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-btn" disabled={sending}>{sending ? 'Conectando…' : mode === 'login' ? 'Entrar a Kalia' : 'Crear cuenta'}</button>
      <div className="auth-note"><Icon name="lock" size={16}/><span>Tu sesión queda en este dispositivo y puedes cerrarla desde el perfil.</span></div>
    </form>
  </div>
}
