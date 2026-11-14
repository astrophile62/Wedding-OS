import { useState, useEffect, useRef, useCallback } from 'react'

export type MusicTrack = { title: string; url: string }

export function useMusicPlayer(tracks: MusicTrack[], options?: { onTrackStart?: () => void }) {
  const [playing, setPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const optionsRef = useRef(options)

  // 1. Amankan opsi tambahan (seperti pop-up judul) agar tidak memicu re-render
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // 2. Buat mesin audionya SEKALI SAJA saat web pertama kali dibuka
  useEffect(() => {
    if (!audioRef.current && tracks.length > 0) {
      audioRef.current = new Audio(tracks[0].url)
    }
  }, [tracks])

  // 3. Fungsi pindah lagu yang aman dari jebakan re-render
  const nextTrack = useCallback(() => {
    if (!audioRef.current || tracks.length === 0) return
    
    setCurrentTrackIndex((prev) => {
      const nextIdx = (prev + 1) % tracks.length
      audioRef.current!.src = tracks[nextIdx].url
      
      // Jika saat ganti lagu kondisinya sedang diputar, langsung putar lagu barunya
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

  // 4. Otomatis ganti lagu kalau lagu sebelumnya habis (ended)
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
      optionsRef.current?.onTrackStart?.() // Panggil pop-up judul lagu
    }).catch(e => console.error("Play gagal (mungkin diblokir browser):", e))
  }, [])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setPlaying(false)
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