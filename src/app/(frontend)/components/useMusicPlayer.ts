import { useState, useEffect, useRef, useCallback } from 'react'

export type MusicTrack = { title: string; url: string }

export function useMusicPlayer(tracks: MusicTrack[], options?: { onTrackStart?: () => void }) {
  const [playing, setPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const optionsRef = useRef(options)
  
  // Ref untuk mengingat apakah musik sedang diputar sebelum tab ditinggalkan
  const wasPlayingRef = useRef(false) 

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    if (!audioRef.current && tracks.length > 0) {
      audioRef.current = new Audio(tracks[0].url)
    }
  }, [tracks])

  // FITUR BARU: Pause otomatis saat pindah tab / minimize browser
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return
      
      if (document.hidden) {
        // Tab disembunyikan: catat status terakhir dan pause
        wasPlayingRef.current = !audioRef.current.paused
        if (wasPlayingRef.current) {
          audioRef.current.pause()
          setPlaying(false)
        }
      } else {
        // Tab dibuka kembali: jika sebelumnya play, lanjutkan
        if (wasPlayingRef.current) {
          audioRef.current.play()
            .then(() => setPlaying(true))
            .catch(e => console.error("Resume gagal:", e))
        }
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const nextTrack = useCallback(() => {
    if (!audioRef.current || tracks.length === 0) return
    
    setCurrentTrackIndex((prev) => {
      const nextIdx = (prev + 1) % tracks.length
      audioRef.current!.src = tracks[nextIdx].url
      
      setPlaying((isPlaying) => {
        if (isPlaying) {
          audioRef.current!.play()
            .then(() => optionsRef.current?.onTrackStart?.())
            .catch(e => console.error("Audio error:", e))
        }
        return isPlaying
      })
      
      return nextIdx
    })
  }, [tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => nextTrack()
    
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [nextTrack])

  const play = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.play().then(() => {
      setPlaying(true)
      wasPlayingRef.current = true
      optionsRef.current?.onTrackStart?.() 
    }).catch(e => console.error("Play gagal:", e))
  }, [])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setPlaying(false)
    wasPlayingRef.current = false // Reset agar tidak jalan sendiri
  }, [])

  const toggle = useCallback(() => {
    playing ? pause() : play()
  }, [playing, play, pause])

  return { 
    playing, 
    toggle, 
    start: play, 
    nextTrack, 
    hasTracks: tracks.length > 0,
    currentTrack: tracks[currentTrackIndex] 
  }
}