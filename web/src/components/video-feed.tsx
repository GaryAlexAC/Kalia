"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

type FeedVideo = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  topic: string | null;
  durationSeconds: number | null;
  provider: "tiktok";
  sourceUrl: string;
  embedUrl: string;
  createdAt: string;
};

type FeedResponse = {
  items: FeedVideo[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchVideoPage(cursor?: string, signal?: AbortSignal) {
  const parameters = new URLSearchParams({ limit: "10" });
  if (cursor) parameters.set("cursor", cursor);

  const response = await fetch(`${API_URL}/api/videos?${parameters}`, { signal });
  if (!response.ok) throw new Error("No fue posible cargar los videos.");

  return (await response.json()) as FeedResponse;
}

export function VideoFeed() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const loadVideos = useEffectEvent(async (cursor?: string) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const page = await fetchVideoPage(cursor);
      setVideos((current) => {
        const knownIds = new Set(current.map((video) => video.id));
        return [...current, ...page.items.filter((video) => !knownIds.has(video.id))];
      });
      setNextCursor(page.pagination.nextCursor);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchVideoPage(undefined, controller.signal)
      .then((page) => {
        setVideos(page.items);
        setNextCursor(page.pagination.nextCursor);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const root = feedRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          const index = Number((mostVisible.target as HTMLElement).dataset.index);
          setActiveIndex(index);

          if (nextCursor && index >= videos.length - 3) {
            void loadVideos(nextCursor);
          }
        }
      },
      { root, threshold: [0.65, 0.85] },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [nextCursor, videos.length]);

  async function retryInitialLoad() {
    setLoading(true);
    setError(null);

    try {
      const page = await fetchVideoPage();
      setVideos(page.items);
      setNextCursor(page.pagination.nextCursor);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="app-shell" aria-label="Microlecciones">
      <header className="feed-header">
        <span className="brand-mark" aria-label="02Track">
          02<span>track</span>
        </span>
        <div className="feed-tabs" aria-label="Tipo de contenido">
          <button type="button">Repasar</button>
          <button className="is-active" type="button">
            Para ti
          </button>
        </div>
        <span className="streak-pill">Aprende</span>
      </header>

      <div className="feed" ref={feedRef}>
        {videos.map((video, index) => (
          <article
            className="lesson-slide"
            data-index={index}
            key={video.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
          >
            <TikTokSlide
              active={index === activeIndex}
              loadVideo={Math.abs(index - activeIndex) <= 1}
              position={index + 1}
              video={video}
            />
          </article>
        ))}

        {loading && videos.length === 0 && (
          <div className="feed-state">Cargando microlecciones...</div>
        )}

        {error && videos.length === 0 && (
          <div className="feed-state">
            <p>{error}</p>
            <button onClick={() => void retryInitialLoad()} type="button">
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="feed-state">Todavía no hay videos publicados.</div>
        )}
      </div>
    </section>
  );
}

type TikTokSlideProps = {
  active: boolean;
  loadVideo: boolean;
  position: number;
  video: FeedVideo;
};

function TikTokSlide({ active, loadVideo, position, video }: TikTokSlideProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  function sendPlayerMessage(type: "play" | "pause" | "mute" | "unMute") {
    iframeRef.current?.contentWindow?.postMessage(
      { type, value: undefined, "x-tiktok-player": true },
      "https://www.tiktok.com",
    );
  }

  useEffect(() => {
    if (!ready) return;

    if (active) {
      sendPlayerMessage(muted ? "mute" : "unMute");
      sendPlayerMessage("play");
    } else {
      sendPlayerMessage("pause");
    }
  }, [active, muted, ready]);

  function toggleSound() {
    const nextMuted = !muted;
    sendPlayerMessage(nextMuted ? "mute" : "unMute");
    setMuted(nextMuted);
  }

  return (
    <div className="video-card accent-turquoise">
      {loadVideo && (
        <iframe
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="lesson-video"
          loading={active ? "eager" : "lazy"}
          onLoad={() => setReady(true)}
          ref={iframeRef}
          src={video.embedUrl}
          title={video.title}
        />
      )}

      <div className="video-shade" aria-hidden="true" />
      {!ready && loadVideo && <span className="loading-indicator">Cargando...</span>}

      <div className="session-progress" aria-label={`Video ${position}`}>
        <span>Para ti · Video {position}</span>
      </div>

      <div className="video-actions">
        <button className="action-button" onClick={toggleSound} type="button">
          {muted ? <MutedIcon /> : <SoundIcon />}
          <span>{muted ? "Activar" : "Silenciar"}</span>
        </button>
        <button className="action-button" type="button">
          <BookmarkIcon />
          <span>Guardar</span>
        </button>
      </div>

      <div className="lesson-copy">
        <div className="lesson-meta">
          <span>{video.category}</span>
          <span>TikTok</span>
        </div>
        <h1>{video.title}</h1>
        {video.description && <p>{video.description}</p>}
        <a
          className="prompt-button"
          href={video.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span>Ver publicación original</span>
          <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

function MutedIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 9v6h4l5 4V5L8 9H4Zm12.5.5 3 3m0-3-3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 9v6h4l5 4V5L8 9H4Zm12-1c1.4 1 2 2.3 2 4s-.6 3-2 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.5 4.5h11v15L12 16l-5.5 3.5v-15Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
