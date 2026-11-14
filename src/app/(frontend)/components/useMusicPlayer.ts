import { useState, useEffect, useRef, useCallback } from 'react'

export type MusicTrack = { title: string; url: string }

export function useMusicPlayer(tracks: MusicTrack[], options?: { onTrackStart?: () => void }) {
  const [playing, setPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current && tracks.length > 0) {
      audioRef.current = new Audio(tracks[0].url)
      audioRef.current.addEventListener('ended', nextTrack)
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', nextTrack)
        audioRef.current.pause()
      }
    }
  }, [tracks])

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setPlaying(true)
        options?.onTrackStart?.()
      }).catch(e => console.log("Audio play failed:", e))
    }
  }, [options])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const toggle = useCallback(() => {
    playing ? pause() : play()
  }, [playing, play, pause])

  const nextTrack = useCallback(() => {
    if (!audioRef.current || tracks.length === 0) return
    const nextIndex = (currentTrackIndex + 1) % tracks.length
    setCurrentTrackIndex(nextIndex)
    audioRef.current.src = tracks[nextIndex].url
    if (playing) {
      audioRef.current.play().catch(e => console.log(e))
    }
  }, [currentTrackIndex, tracks, playing])

  return { playing, toggle, start: play, nextTrack, hasTracks: tracks.length > 0 }
}