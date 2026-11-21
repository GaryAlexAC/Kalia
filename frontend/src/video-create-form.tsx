import { useState, type FormEvent } from 'react'
import { createVideo } from './api'

export function VideoCreateForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Matemáticas')
  const [topic, setTopic] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError(null)
    try {
      await createVideo({
        title,
        description: description || undefined,
        category,
        topic: topic || undefined,
        sourceUrl,
        durationSeconds: duration ? Number(duration) : undefined,
      })
      onCreated()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible registrar el video.')
    } finally {
      setSending(false)
    }
  }

  return <div className="view create-overlay">
    <div className="explore-head"><div><span>COMPARTIR</span><h1>Crear un video</h1></div><button onClick={onClose}>Cerrar</button></div>
    <form className="auth-card create-video-form" onSubmit={submit}>
      <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160}/></label>
      <label>Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000}/></label>
      <label>Materia<input value={category} onChange={(event) => setCategory(event.target.value)} required maxLength={80}/></label>
      <label>Tema<input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={120}/></label>
      <label>URL pública de TikTok<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://www.tiktok.com/@usuario/video/..." required maxLength={1024}/></label>
      <label>Duración en segundos<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)}/></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-btn" disabled={sending}>{sending ? 'Guardando…' : 'Publicar video'}</button>
    </form>
  </div>
}
