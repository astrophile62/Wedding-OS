'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type MusicTrack = { title: string; url: string }
export type MusicStatus = 'idle' | 'playing' | 'userPaused' | 'autoPaused' | 'error'

type Options = { onTrackStart?: (track: MusicTrack) => void }

export function useMusicPlayer(tracks: MusicTrack[], options: Options = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tracksRef = useRef(tracks)
  const onTrackStartRef = useRef(options.onTrackStart)
  const indexRef = useRef(0)
  const statusRef = useRef<MusicStatus>('idle')
  const [index, setIndex] = useState(0)
  const [status, setStatusState] = useState<MusicStatus>('idle')

  useEffect(() => {
    tracksRef.current = tracks
    onTrackStartRef.current = options.onTrackStart
  })

  const setStatus = useCallback((next: MusicStatus) => {
    statusRef.current = next
    setStatusState(next)
  }, [])

  const handlePlayError = useCallback(
    (error: unknown) => {
      const name = (error as DOMException | undefined)?.name
      if (name === 'NotAllowedError') setStatus('autoPaused') // browser menolak, tampilkan tombol Play
      else if (name !== 'AbortError') setStatus('error')
    },
    [setStatus],
  )

  const loadAndPlay = useCallback(
    async (nextIndex: number) => {
      const audio = audioRef.current
      const list = tracksRef.current
      if (!audio || list.length === 0) return
      const safeIndex = ((nextIndex % list.length) + list.length) % list.length
      indexRef.current = safeIndex
      setIndex(safeIndex)
      const track = list[safeIndex]
      if (audio.src !== new URL(track.url, window.location.href).href) audio.src = track.url
      try {
        await audio.play()
        setStatus('playing')
        onTrackStartRef.current?.(track)
      } catch (error) {
        handlePlayError(error)
      }
    },
    [handlePlayError, setStatus],
  )

  const resume = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.getAttribute('src')) {
      await loadAndPlay(indexRef.current)
      return
    }
    try {
      await audio.play()
      setStatus('playing')
    } catch (error) {
      handlePlayError(error)
    }
  }, [handlePlayError, loadAndPlay, setStatus])

  // Satu objek Audio saja, tidak dibuat ulang saat render ulang
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audio.volume = 0.7
    audioRef.current = audio

    const onEnded = () => void loadAndPlay(indexRef.current + 1)
    const onError = () => {
      if (audio.getAttribute('src')) setStatus('error')
    }
    const pauseBecauseHidden = () => {
      if (statusRef.current === 'playing') {
        audio.pause()
        setStatus('autoPaused')
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') pauseBecauseHidden()
      // Dijeda otomatis karena tersembunyi: coba lanjutkan. Jeda manual tidak dilanjutkan.
      else if (statusRef.current === 'autoPaused') void resume()
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', pauseBecauseHidden)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', pauseBecauseHidden)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [loadAndPlay, resume, setStatus])

  // Dipanggil dari klik "Buka Undangan" (interaksi pengguna yang sah)
  const start = useCallback(() => {
    if (statusRef.current === 'idle') void loadAndPlay(0)
  }, [loadAndPlay])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (statusRef.current === 'playing') {
      audio.pause()
      setStatus('userPaused')
    } else {
      void resume()
    }
  }, [resume, setStatus])

  const next = useCallback(() => void loadAndPlay(indexRef.current + 1), [loadAndPlay])

  return {
    status,
    playing: status === 'playing',
    hasTracks: tracks.length > 0,
    current: tracks[index] ?? null,
    start,
    toggle,
    next,
  }
}