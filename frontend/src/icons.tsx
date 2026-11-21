export type IconName =
  | 'home' | 'community' | 'plus' | 'message' | 'user' | 'heart' | 'bookmark'
  | 'share' | 'comment' | 'sun' | 'moon' | 'search' | 'bell' | 'play'
  | 'clock' | 'calendar' | 'arrow' | 'send' | 'settings' | 'lock' | 'chevron'
  | 'fire' | 'sparkle' | 'qr' | 'video' | 'check' | 'practice'

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
  community: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-4 2.7-6 6-6s6 2 6 6"/><path d="M15 15c3.2 0 5 1.8 5 4.5"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  message: <path d="M4 5h16v12H8l-4 3V5Z"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.6-5 3.2-7 8-7s7.4 2 8 7"/></>,
  heart: <path d="M20.8 5.7c-2.1-2.2-5.6-2.2-7.8 0L12 6.8l-1.1-1.1a5.3 5.3 0 0 0-7.7 0 5.7 5.7 0 0 0 0 7.9L12 22l8.8-8.4a5.7 5.7 0 0 0 0-7.9Z"/>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z"/>,
  share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></>,
  comment: <path d="M4 4h16v13H9l-5 4V4Z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  moon: <path d="M20 16.4A9 9 0 0 1 7.6 4a8 8 0 1 0 12.4 12.4Z"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  bell: <><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Z"/><path d="M10 20h4"/></>,
  play: <path d="m9 7 9 5-9 5V7Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  arrow: <><path d="m15 18-6-6 6-6"/></>,
  send: <><path d="m3 4 18 8-18 8 3-8-3-8Z"/><path d="M6 12h15"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H2.6v-3.6h.2A2 2 0 0 0 4.6 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8v-.2h3.6v.2A2 2 0 0 0 15 4.6a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 0 1.8 1.2h.2v3.6h-.2a2 2 0 0 0-1.8 1.2Z"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  fire: <path d="M12 22c4 0 7-2.6 7-7 0-3-1.7-5.8-5-8 .2 2-1 3.5-2 4-1-3-3-5-5-6 .2 3-2 5-2 9.5C5 19 8 22 12 22Z"/>,
  sparkle: <><path d="m12 2 1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></>,
  qr: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h4v4h-7v-7Z"/></>,
  video: <><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  practice: <><circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.2 1.4M9 3.5h6"/></>,
}

export function Icon({ name, size = 22, fill = 'none' }: { name: IconName; size?: number; fill?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
