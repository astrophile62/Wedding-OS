'use client'

import Image from 'next/image'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { submitRSVP, type RSVPState } from '../actions'
import { useMusicPlayer, type MusicTrack } from './useMusicPlayer'

// --- KOMPONEN EFEK MESIN TIK ---
function TypewriterEffect({ text, delay = 80 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsTyping(true); observer.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isTyping) return
    let i = 0
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1))
      i++
      if (i >= text.length) { clearInterval(timer); setIsComplete(true) }
    }, delay)
    return () => clearInterval(timer)
  }, [text, delay, isTyping])

  return (
    <span ref={ref} className="inline-block transition-opacity duration-300">
      {displayedText}
      {!isComplete && <span className="animate-pulse border-r-[1.5px] border-current ml-[2px]" style={{ animationDuration: '0.8s' }}>&nbsp;</span>}
    </span>
  )
}

// --- KOMPONEN EFEK TULISAN TANGAN ---
function HandwritingEffect({ text, delay = 0, speed = 120 }: { text: string; delay?: number, speed?: number }) {
  const [visibleChars, setVisibleChars] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setStart(true), delay); observer.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  useEffect(() => {
    if (!start) return
    let timer: NodeJS.Timeout
    timer = setInterval(() => {
      setVisibleChars((prev) => {
        if (prev >= text.length) { clearInterval(timer); return prev }
        return prev + 1
      })
    }, speed)
    return () => clearInterval(timer)
  }, [start, text.length, speed])

  return (
    <span ref={ref} className="inline-block drop-shadow-md" style={{ fontFamily: "'Alex Brush', cursive", paddingRight: '0.1em' }}>
      {text.split('').map((char, index) => (
        <span key={index} className="transition-opacity duration-500 ease-out" style={{ opacity: index < visibleChars ? 1 : 0 }}>{char}</span>
      ))}
    </span>
  )
}

// --- KOMPONEN EFEK POP-UP ---
function PopUpEffect({ children, delay = 0, isReady = true }: { children: React.ReactNode; delay?: number; isReady?: boolean }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isReady) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setIsVisible(true), delay); observer.disconnect() }
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay, isReady])

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}>
      {children}
    </div>
  )
}

type Media = { id: string | number; url?: string | null; alt?: string; width?: number | null; height?: number | null }
type GalleryItem = { id: string | number; role: 'cover' | 'bride' | 'groom' | 'story' | 'gallery'; caption: string; order: number; image: string | number | Media }
type Settings = { brideName?: string; groomName?: string; hashtag?: string; weddingDate?: string; musicEnabled?: boolean | null; verse?: string; venue?: { name?: string; address?: string; mapsUrl?: string }; people?: { brideFullName?: string; brideParents?: string; groomFullName?: string; groomParents?: string }; loveStory?: { id?: string | null; year: string; title: string; description: string }[] | null; bankAccounts?: { id?: string | null; bank: string; accountNumber: string; accountName: string }[] | null }
type Message = { id: string | number; guestName: string; message?: string | null; createdAt?: string | null }
type Guest = { id: string | number; name: string; partnerLabel?: string | null; maxGuests?: number | null; invitationType?: 'personal' | 'group' | string | null }
const initialRSVPState: RSVPState = { success: false, message: '' }

function Icon({ name, className = 'size-5' }: { name: 'arrow' | 'calendar' | 'check' | 'chevron' | 'copy' | 'gift' | 'location' | 'music' | 'next' | 'pause' | 'play' | 'x'; className?: string }) {
  const paths = {
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    calendar: <><path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /><path d="M8 13h3v3H8z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    gift: <><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" /><path d="M12 7c-3-5-7-3-5-1 1 1 3 1 5 1Zm0 0c3-5 7-3 5-1-1 1-3 1-5 1Z" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    next: <><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></>, // <--- Tambahkan baris ini
    pause: <path d="M9 6v12M15 6v12" />,
    play: <path d="m9 6 9 6-9 6Z" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

// --- FONT JUDUL  ---
// isHandwriting default = true (seperti yang Abang minta untuk semua halaman)
// khusus RSVP nanti dipanggil dengan isHandwriting = false
function SectionTitle({ kicker, children, light = true, isHandwriting = true }: { kicker: string; children: React.ReactNode; light?: boolean; isHandwriting?: boolean }) {
  return (
    <div className="mb-12 text-center relative z-10">
      {isHandwriting ? (
        <p className={`mb-1 text-5xl font-normal drop-shadow-sm ${light ? 'text-gold-soft' : 'text-sage'}`} style={{ fontFamily: "'Alex Brush', cursive" }}>
          {kicker}
        </p>
      ) : (
        <p className={`mb-3 text-[0.65rem] font-bold tracking-[0.3em] uppercase ${light ? 'text-ivory/70' : 'text-sage'}`}>
          {kicker}
        </p>
      )}
      <h2 className={`font-serif text-3xl md:text-4xl leading-tight font-medium tracking-wide ${light ? 'text-ivory' : 'text-charcoal'}`}>
        {children}
      </h2>
    </div>
  )
}

export default function WeddingExperience({ settings, gallery, messages, guest }: { settings: Settings; gallery: GalleryItem[]; messages: Message[]; guest: Guest | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTrack, setShowTrack] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const [copied, setCopied] = useState('')
  const [state, formAction, pending] = useActionState(submitRSVP, initialRSVPState)

  const byRole = useMemo(() => ({
    story: gallery.filter((item) => item.role === 'story'),
  }), [gallery])

  // FOTO PRE-WEDDING (Ditampilkan lebih dulu)
  // Fix 02000 ekstensinya .JPEG besar karena Vercel Case-Sensitive
  const preWeddingPhotos = ['01728','01763','01773','01789','01797','01799','01811','01846','01860','01888','01941','01952','01954','02000','02019','02031','02061','02074','02078','02105'].map(n => ({
    id: `p-${n}`, url: `/media/MLJ${n}.${n === '02000' ? 'JPEG' : 'jpeg'}`, alt: `Pre-Wedding ${n}`
  }))

  // FOTO ENGAGEMENT
  const engagementPhotos = [27,37,74,79,81,82,84,92,99,102,110,111,120,372,375,377,386,387,393,397,411,413,419,428,430,438,443,449,451,457].map(n => ({
    id: `e-${n}`, url: `/media/Copy of ARG-${n}.JPG`, alt: `Engagement ${n}`
  }))

  const allGalleryPhotos = [...preWeddingPhotos, ...engagementPhotos]

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % allGalleryPhotos.length))
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i - 1 + allGalleryPhotos.length) % allGalleryPhotos.length))
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [lightboxIndex, allGalleryPhotos.length])

  function showPhoto(step: number) {
    setLightboxIndex((i) => (i === null ? i : (i + step + allGalleryPhotos.length) % allGalleryPhotos.length))
  }

 // Masukkan daftar lagu di sini
  const tracks: MusicTrack[] = useMemo(() => [
    { title: 'JKT48 - Rapsodi', url: '/media/JKT48_Rapsodi.mp3' },
    { title: 'Lagu Kedua', url: '/media/Lagu_Kedua.mp3' }, // Ganti dengan lagu Abang
  ], [])

  // State untuk mengontrol pop-up judul lagu
  const [showTrackTitle, setShowTrackTitle] = useState(false)
  const trackTitleTimer = useRef<NodeJS.Timeout | null>(null)

  const player = useMusicPlayer(tracks, { 
    onTrackStart: () => { 
      // Tampilkan pop-up judul lagu selama 4 detik lalu hilangkan
      setShowTrackTitle(true)
      if (trackTitleTimer.current) clearTimeout(trackTitleTimer.current)
      trackTitleTimer.current = setTimeout(() => setShowTrackTitle(false), 4000)
    } 
  })

  // Gunakan ref agar sensor sentuhan/scroll HANYA BEKERJA 1 KALI seumur hidup halaman
  const hasInteracted = useRef(false)

  useEffect(() => {
    const initAudio = () => {
      if (hasInteracted.current) return
      hasInteracted.current = true
      player.start()
    }
    
    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('touchstart', initAudio, { once: true })
    document.addEventListener('scroll', initAudio, { once: true })
    
    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('touchstart', initAudio)
      document.removeEventListener('scroll', initAudio)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // <--- KUNCI UTAMANYA DI SINI: Array kosong agar tidak dipanggil ulang terus

  const eventDate = new Date(settings.weddingDate || '2026-12-26T01:00:00.000Z')
  const dateParts = (options: Intl.DateTimeFormatOptions) => Object.fromEntries(new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', ...options }).formatToParts(eventDate).map((part): [string, string] => [part.type, part.value]))
  const numericDate = dateParts({ day: '2-digit', month: '2-digit', year: 'numeric' })
  const longDate = dateParts({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const coverDateText = `${numericDate.day} · ${numericDate.month} · ${numericDate.year}`
  const longDateText = `${longDate.weekday}, ${longDate.day} ${longDate.month} ${longDate.year}`

  const eventTime = eventDate.getTime()
  const [clientNow, setClientNow] = useState<number | null>(null)

  useEffect(() => {
    setClientNow(Date.now())
    const timer = window.setInterval(() => setClientNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const countdown = useMemo(() => {
    const diff = clientNow === null ? 0 : Math.max(0, eventTime - clientNow)
    return {
      hari: Math.floor(diff / 86_400_000),
      jam: Math.floor((diff / 3_600_000) % 24),
      menit: Math.floor((diff / 60_000) % 60),
      detik: Math.floor((diff / 1000) % 60),
    }
  }, [eventTime, clientNow])

  function openInvitation() {
    setIsOpen(true)
    if (!player.playing) player.start()
    window.setTimeout(() => { document.querySelector('#invitation')?.scrollIntoView({ behavior: 'smooth' }) }, 450)
  }

  async function copyText(value: string, key: string) {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1800)
  }

  const cleanName = (fullName: string | undefined, fallback: string) => {
    return (fullName || fallback).split(',')[0].trim();
  }

  const storyFallbackImages = ['/media/MLJ01763.jpeg', '/media/MLJ01789.jpeg', '/media/MLJ01797.jpeg', '/media/MLJ01811.jpeg']

  return (
    <main className="bg-charcoal text-ivory selection:bg-gold-soft selection:text-charcoal font-sans">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');` }} />

      {/* ================= COVER PAGE ================= */}
      <section className={`fixed inset-0 z-50 overflow-hidden bg-charcoal transition-all duration-[1200ms] ease-in-out ${isOpen ? 'pointer-events-none -translate-y-full opacity-0' : ''}`}>
        <div className="absolute inset-0 z-0">
          <Image src="/media/poster.jpg" alt="Poster" fill sizes="100vw" quality={60} className="object-cover scale-110 opacity-40 blur-xl" />
        </div>
        <video className="absolute inset-0 z-0 size-full object-cover opacity-80" autoPlay muted loop playsInline preload="metadata" poster="/media/poster.jpg" aria-hidden="true" tabIndex={-1}>
            <source src="/media/cover.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-charcoal/60 via-charcoal/20 to-charcoal/95" />
        <div className="relative z-10 flex min-h-svh flex-col items-center justify-between px-6 py-16 text-center text-ivory">
          <div className="flex flex-col items-center gap-2 text-[0.65rem] font-bold tracking-[0.3em] uppercase opacity-90 mt-10 min-h-[30px]">
            <TypewriterEffect text="The Wedding of" delay={120} />
            <span className="h-[2px] w-12 bg-gold-soft/80 mt-1" />
          </div>
          <div className="min-h-[160px] flex flex-col justify-center">
            <h1 className="text-6xl md:text-7xl leading-[1.2] font-medium tracking-normal drop-shadow-md text-ivory">
              <HandwritingEffect text={cleanName(settings.brideName, 'Dina Yuliarty')} delay={1200} speed={120} /> <br />
              <span className="font-serif text-3xl italic text-gold-soft my-1 block">&amp;</span>
              <HandwritingEffect text={cleanName(settings.groomName, 'Wirahilman')} delay={2800} speed={120} />
            </h1>
            <p className="mt-8 text-[0.7rem] tracking-[0.3em] uppercase opacity-80 font-medium min-h-[20px]">
              <TypewriterEffect text={coverDateText} delay={100} />
            </p>
          </div>
          <div className="w-full max-w-sm mb-10">
            <p className="mb-6 text-xs leading-relaxed text-ivory/70 font-medium tracking-widest uppercase">
              Yth. Bapak/Ibu/Saudara/i
              <strong className="mt-2 block font-serif text-xl font-normal text-ivory capitalize tracking-normal">{guest?.name || 'Tamu Undangan'} {guest?.partnerLabel}</strong>
            </p>
            <button type="button" onClick={openInvitation} className="group flex mx-auto h-12 w-48 items-center justify-center gap-3 rounded-full bg-transparent border border-ivory/50 text-[0.65rem] font-bold tracking-[0.2em] text-ivory uppercase transition-all duration-500 hover:bg-ivory hover:text-charcoal active:scale-95 backdrop-blur-sm">
              Buka Undangan
            </button>
          </div>
        </div>
      </section>

      {/* ================= CONTENT INVITATION ================= */}
      <div id="invitation" className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. AYAT SUCI */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center snap-start">
          <div className="absolute inset-0 z-0">
            <Image src="/media/MLJ01773.jpeg" alt="Verse" fill sizes="100vw" quality={75} className="object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 p-6 max-w-lg">
            <PopUpEffect delay={200} isReady={isOpen}>
              <blockquote className="font-serif text-lg md:text-xl leading-relaxed italic text-ivory/90 font-light min-h-[120px] whitespace-pre-line drop-shadow-md">
                "{settings.verse || 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri,\n\nagar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.\n\nSesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.'}"
              </blockquote>
            </PopUpEffect>
            <PopUpEffect delay={400} isReady={isOpen}>
              <p className="mt-10 text-[0.65rem] font-bold tracking-[0.25em] text-gold-soft uppercase">
                QS. Ar-Rum : 21
              </p>
            </PopUpEffect>
          </div>
        </section>

        {/* 2. THE BRIDE */}
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden text-center snap-start">
          <div className="absolute inset-0 z-0">
            <Image src="/media/MLJ02061.jpeg" alt="Bride" fill sizes="100vw" quality={85} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-charcoal/10" />
          </div>
          <div className="relative z-10 w-full px-6 pb-20">
             <PopUpEffect isReady={isOpen}>
                <p className="text-[0.65rem] font-bold tracking-[0.3em] text-ivory/70 uppercase mb-2">The Bride</p>
                <h3 className="font-serif text-4xl md:text-5xl font-medium drop-shadow-md text-ivory">
                  {cleanName(settings.people?.brideFullName, 'Dina Yuliarty')}
                </h3>
                <p className="mx-auto mt-4 max-w-xs text-[0.7rem] font-medium leading-relaxed text-ivory/60 tracking-widest uppercase">
                  Putri Dari <br/> <span className="text-ivory/90">{settings.people?.brideParents}</span>
                </p>
             </PopUpEffect>
          </div>
        </section>

        {/* 3. THE GROOM */}
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden text-center snap-start">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ02105.jpeg" alt="Groom" fill sizes="100vw" quality={85} className="object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-charcoal/10" />
          </div>
          <div className="relative z-10 w-full px-6 pb-20">
            <PopUpEffect isReady={isOpen}>
                <p className="text-[0.65rem] font-bold tracking-[0.3em] text-ivory/70 uppercase mb-2">The Groom</p>
                <h3 className="font-serif text-4xl md:text-5xl font-medium drop-shadow-md text-ivory">
                  {cleanName(settings.people?.groomFullName, 'Wirahilman')}
                </h3>
                <p className="mx-auto mt-4 max-w-xs text-[0.7rem] font-medium leading-relaxed text-ivory/60 tracking-widest uppercase">
                  Putra Dari <br/> <span className="text-ivory/90">{settings.people?.groomParents}</span>
                </p>
            </PopUpEffect>
          </div>
        </section>

        {/* 4. OUR LOVE STORY */}
        <section className="relative overflow-hidden px-6 py-28 snap-start">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ01954.jpeg" alt="Love Story" fill sizes="100vw" quality={60} className="object-cover" />
             <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10">
             <PopUpEffect isReady={isOpen}>
                <SectionTitle kicker="Our Journey">Merangkai Cerita</SectionTitle>
             </PopUpEffect>
            <div className="relative mx-auto max-w-xl">
              <div className="absolute top-3 bottom-3 left-[2.75rem] w-px bg-gold-soft/30 md:left-1/2" />
              {settings.loveStory?.map((story, index) => {
                const imageUrl = storyFallbackImages[index % storyFallbackImages.length]
                return (
                  <PopUpEffect key={story.id || story.year} delay={index * 100} isReady={isOpen}>
                    <article className={`relative mb-14 grid grid-cols-[5.5rem_1fr] gap-6 md:grid-cols-2 ${index % 2 ? 'md:[&>*:last-child]:col-start-1 md:[&>*:last-child]:row-start-1' : ''}`}>
                      <div className={`relative z-10 size-[5.5rem] overflow-hidden rounded-full border border-ivory/20 bg-charcoal shadow-xl ${index % 2 ? 'md:ml-5' : 'md:ml-auto md:mr-5'}`}>
                        <Image src={imageUrl} alt={story.title} fill sizes="88px" className="object-cover" />
                      </div>
                      <div className={`pt-2 md:px-6 ${index % 2 ? 'md:text-right' : ''}`}>
                        <p className="text-[0.65rem] font-bold tracking-[0.2em] text-gold-soft uppercase">{story.year}</p>
                        <h3 className="mt-2 font-serif text-2xl font-medium text-ivory">{story.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-ivory/70 font-light">{story.description}</p>
                      </div>
                    </article>
                  </PopUpEffect>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. SAVE THE DATE */}
        <section className="relative overflow-hidden bg-charcoal px-6 py-28 text-ivory snap-start flex flex-col items-center justify-center min-h-svh">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ01952.jpeg" alt="Save the Date" fill sizes="100vw" quality={60} className="object-cover" />
             <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative z-10 w-full max-w-4xl text-center">
            
            <PopUpEffect isReady={isOpen}>
                <SectionTitle kicker="Save The Date">Hari yang kami nanti</SectionTitle>
            </PopUpEffect>

            <PopUpEffect delay={150} isReady={isOpen}>
                <div className="mx-auto mb-16 grid max-w-sm grid-cols-4 divide-x divide-ivory/20 border border-ivory/20 rounded-2xl bg-black/20 backdrop-blur-sm p-4">
                  {Object.entries(countdown).map(([label, value]) => (
                    <div key={label}>
                      <p className="font-serif text-3xl font-light text-ivory" suppressHydrationWarning>
                        {clientNow === null ? '--' : String(value).padStart(2, '0')}
                      </p>
                      <p className="mt-2 text-[0.55rem] tracking-[0.2em] text-ivory/50 uppercase font-bold">{label}</p>
                    </div>
                  ))}
                </div>
            </PopUpEffect>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
               <PopUpEffect delay={300} isReady={isOpen}>
                  <div className="border border-ivory/20 bg-black/30 backdrop-blur-md rounded-3xl p-8 text-center h-full">
                     <Icon name="calendar" className="mx-auto size-6 text-gold-soft mb-4 opacity-80" />
                     <p className="text-[0.65rem] font-bold tracking-[0.2em] text-ivory/70 uppercase mb-3">
                         {longDateText.toUpperCase()}
                     </p>
                     <h3 className="font-serif text-3xl font-medium mb-3 text-ivory">Akad Nikah</h3>
                     <p className="text-sm font-light text-ivory/80 tracking-wide">08.00 WIB — Selesai</p>
                  </div>
               </PopUpEffect>

               <PopUpEffect delay={450} isReady={isOpen}>
                  <div className="border border-ivory/20 bg-black/30 backdrop-blur-md rounded-3xl p-8 text-center h-full">
                     <Icon name="calendar" className="mx-auto size-6 text-gold-soft mb-4 opacity-80" />
                     <p className="text-[0.65rem] font-bold tracking-[0.2em] text-ivory/70 uppercase mb-3">
                         {longDateText.toUpperCase()}
                     </p>
                     <h3 className="font-serif text-3xl font-medium mb-3 text-ivory">Resepsi</h3>
                     <p className="text-sm font-light text-ivory/80 tracking-wide">11.00 — 13.00 WIB</p>
                  </div>
               </PopUpEffect>
            </div>

            <PopUpEffect delay={600} isReady={isOpen}>
                <div className="bg-ivory/95 rounded-3xl p-8 text-charcoal shadow-2xl backdrop-blur-sm mx-auto max-w-2xl">
                   <Icon name="location" className="mx-auto size-6 text-charcoal opacity-70 mb-3" />
                   <h3 className="font-serif text-2xl font-bold mb-2">{settings.venue?.name || 'Ballroom Puri Mega Hotel'}</h3>
                   <p className="mx-auto max-w-md text-xs leading-relaxed text-charcoal/80 font-medium">
                       {settings.venue?.address || 'Jl. Pramuka No.59, Rawasari, Cempaka Putih, Jakarta Pusat'}
                   </p>
                   <a href={settings.venue?.mapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-charcoal bg-charcoal px-8 text-[0.65rem] font-bold tracking-[0.2em] text-ivory uppercase transition-all hover:bg-transparent hover:text-charcoal">
                      Buka Google Maps
                   </a>
                </div>
            </PopUpEffect>

          </div>
        </section>

        {/* 6. OUR GALLERY (SCROLLABLE HORIZONTAL) */}
        <section className="bg-[#1a1a1a] py-28 px-0 snap-start overflow-hidden">
           <PopUpEffect isReady={isOpen}>
              <SectionTitle kicker="Our Moment">Terekam dalam waktu</SectionTitle>
           </PopUpEffect>

           {/* SECTION 1: PRE-WEDDING */}
           <PopUpEffect delay={100} isReady={isOpen}>
              <h3 className="text-center font-serif text-2xl text-ivory mb-6 tracking-wide">Pre-Wedding</h3>
           </PopUpEffect>
           <PopUpEffect delay={150} isReady={isOpen}>
            <div className="flex overflow-x-auto gap-4 px-6 pb-12 snap-x snap-mandatory hide-scrollbar">
              {preWeddingPhotos.map((photo) => {
                const index = allGalleryPhotos.findIndex(p => p.id === photo.id)
                return (
                  <div key={photo.id} className="relative flex-none w-[70vw] md:w-[30vw] aspect-[3/4] cursor-pointer overflow-hidden rounded-xl group snap-center shadow-lg" onClick={() => setLightboxIndex(index)}>
                    <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 70vw, 30vw" quality={70} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                  </div>
                )
              })}
            </div>
           </PopUpEffect>

           {/* SECTION 2: ENGAGEMENT */}
           <PopUpEffect delay={100} isReady={isOpen}>
              <h3 className="text-center font-serif text-2xl text-ivory mb-6 mt-8 tracking-wide">Engagement</h3>
           </PopUpEffect>
           <PopUpEffect delay={150} isReady={isOpen}>
            <div className="flex overflow-x-auto gap-4 px-6 pb-6 snap-x snap-mandatory hide-scrollbar">
              {engagementPhotos.map((photo) => {
                const index = allGalleryPhotos.findIndex(p => p.id === photo.id)
                return (
                  <div key={photo.id} className="relative flex-none w-[70vw] md:w-[30vw] aspect-[3/4] cursor-pointer overflow-hidden rounded-xl group snap-center shadow-lg" onClick={() => setLightboxIndex(index)}>
                    <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 70vw, 30vw" quality={70} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                  </div>
                )
              })}
            </div>
           </PopUpEffect>
           
           <style dangerouslySetInnerHTML={{__html: `
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
           `}} />
        </section>

        {/* 7. RSVP (POIN 1: FONT RSVP BUKAN HANDWRITING) */}
        <section className="relative overflow-hidden px-6 py-28 snap-start">
          <div className="absolute inset-0 z-0">
            <Image src="/media/MLJ01728.jpeg" alt="RSVP" fill sizes="100vw" quality={60} className="object-cover" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10">
             <PopUpEffect isReady={isOpen}>
                {/* RSVP menggunakan sans-serif tebal (isHandwriting=false) */}
                <SectionTitle kicker="RSVP" isHandwriting={false}>Kehadiran Anda</SectionTitle>
             </PopUpEffect>
            
            <PopUpEffect delay={150} isReady={isOpen}>
                <form action={formAction} className="mx-auto max-w-xl rounded-3xl border border-ivory/10 bg-black/40 p-6 md:p-10 backdrop-blur-xl">
                  <input type="hidden" name="guestId" value={guest?.id || ''} />
                  <input type="text" name="hp_catatan" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
                  {guest?.invitationType === 'group' ? (
                    <>
                      <label htmlFor="rsvp-name" className="mb-2 block text-[0.65rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">Nama Anda</label>
                      <input id="rsvp-name" type="text" name="guestName" required minLength={2} maxLength={80} autoComplete="name" placeholder="Nama lengkap" className="mb-6 h-12 w-full rounded-xl border-b border-ivory/20 bg-transparent px-4 font-serif text-lg outline-none placeholder:text-ivory/30 focus:border-gold-soft text-ivory transition-colors" />
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="guestName" value={guest?.name || ''} />
                      <label className="mb-2 block text-[0.65rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">Nama Tamu</label>
                      <div className="mb-6 flex h-12 items-center border-b border-ivory/20 px-4 font-serif text-lg text-ivory">{guest?.name || 'Tamu Undangan'}</div>
                    </>
                  )}
                  <fieldset className="mb-6">
                    <legend className="mb-3 block text-[0.65rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">Konfirmasi</legend>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Hadir', value: 'attending' },
                        { label: 'Tidak Hadir', value: 'declined' },
                      ].map((option) => (
                        <label key={option.value} className="flex h-12 cursor-pointer items-center justify-center gap-3 rounded-xl border border-ivory/20 px-4 text-[0.65rem] font-bold tracking-widest uppercase text-ivory/80 has-[:checked]:border-gold-soft has-[:checked]:bg-gold-soft/10 transition-colors">
                          <input type="radio" name="attendance" value={option.value} required className="sr-only" />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="mb-2 block text-[0.65rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">Jumlah Tamu</label>
                  <div className="relative mb-6">
                    <select name="guestCount" className="h-12 w-full appearance-none rounded-xl border border-ivory/20 bg-transparent px-4 text-sm font-medium text-ivory outline-none focus:border-gold-soft transition-colors">
                      {Array.from({ length: guest?.maxGuests || 1 }, (_, index) => (
                        <option key={index + 1} value={index + 1} className="bg-charcoal text-ivory">{index + 1} Orang</option>
                      ))}
                    </select>
                    <Icon name="chevron" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ivory/50" />
                  </div>
                  <label className="mb-2 block text-[0.65rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">Pesan</label>
                  <textarea name="message" maxLength={500} rows={3} placeholder="Doa terbaik..." className="w-full resize-none rounded-xl border border-ivory/20 bg-transparent p-4 text-sm font-light text-ivory outline-none placeholder:text-ivory/30 focus:border-gold-soft transition-colors" />
                  <button type="submit" disabled={pending || !guest} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-ivory text-[0.65rem] font-bold tracking-[0.2em] text-charcoal uppercase transition-colors hover:bg-gold-soft disabled:opacity-50">
                    {pending ? 'Mengirim...' : 'Kirim RSVP'}
                  </button>
                  {state.message && (
                    <p className={`mt-4 text-center text-xs font-medium tracking-wide ${state.success ? 'text-gold-soft' : 'text-red-400'}`}>{state.message}</p>
                  )}
                </form>
            </PopUpEffect>
          </div>
        </section>
        
        {/* ================= MEMORY WALL (KUMPULAN UCAPAN) ================= */}
        {messages.length > 0 && (
          <section className="relative overflow-hidden bg-charcoal px-6 py-28 snap-start flex flex-col items-center min-h-svh">
            <PopUpEffect isReady={isOpen}>
              <SectionTitle kicker="Memory Wall">Harapan & Doa</SectionTitle>
            </PopUpEffect>
            
            <div className="relative w-full max-w-4xl columns-1 gap-6 sm:columns-2 lg:columns-3 mt-8">
              {messages.map((msg, idx) => (
                <PopUpEffect key={msg.id} delay={idx * 150} isReady={isOpen}>
                  <div className="break-inside-avoid mb-6 rounded-2xl border border-ivory/10 bg-ivory/5 p-6 backdrop-blur-sm relative overflow-hidden group hover:bg-ivory/10 transition-colors">
                    <div className="absolute -right-4 -top-4 opacity-5 text-ivory text-8xl font-serif">"</div>
                    <p className="text-sm font-light leading-relaxed text-ivory/80 mb-6 italic relative z-10 whitespace-pre-wrap">
                      "{msg.message}"
                    </p>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="size-8 rounded-full bg-gold-soft/20 text-gold-soft grid place-items-center font-serif text-sm border border-gold-soft/30">
                        {msg.guestName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-[0.7rem] font-bold tracking-[0.15em] text-ivory/90 uppercase">
                          {msg.guestName}
                        </h4>
                        {msg.createdAt && (
                          <span className="text-[0.55rem] font-medium tracking-[0.2em] text-ivory/40 uppercase">
                            {new Date(msg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </PopUpEffect>
              ))}
            </div>
          </section>
        )}

        {/* 8. WEDDING GIFT */}
        <section className="relative overflow-hidden px-6 py-28 snap-start">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ02074.jpeg" alt="Wedding Gift" fill sizes="100vw" quality={60} className="object-cover" />
             <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative z-10">
             <PopUpEffect isReady={isOpen}>
                <SectionTitle kicker="Wedding Gift">Tanda Kasih</SectionTitle>
                <p className="mx-auto -mt-6 max-w-md text-center text-xs font-light leading-relaxed text-ivory/70 mb-12">
                  Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami.
                </p>
             </PopUpEffect>
            <div className="mx-auto grid max-w-lg gap-6">
              {settings.bankAccounts?.map((account, index) => (
                <PopUpEffect key={account.id || account.accountNumber} delay={index * 150} isReady={isOpen}>
                    <article className="relative overflow-hidden rounded-3xl border border-ivory/10 bg-white/5 p-8 text-ivory backdrop-blur-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xl font-medium tracking-wide">{account.bank}</p>
                          <p className="mt-1 text-[0.55rem] font-bold tracking-[0.2em] text-gold-soft uppercase">Digital Envelope</p>
                        </div>
                      </div>
                      <p className="mt-8 font-sans text-xl font-semibold tracking-widest text-ivory">{account.accountNumber}</p>
                      <div className="mt-4 flex items-end justify-between">
                        <p className="text-[0.65rem] font-medium tracking-[0.15em] text-ivory/80 uppercase">{account.accountName}</p>
                        <button type="button" onClick={() => copyText(account.accountNumber, account.accountNumber)} className="grid size-10 place-items-center rounded-full border border-ivory/30 transition-colors hover:bg-ivory hover:text-charcoal" aria-label={`Salin nomor rekening ${account.bank}`}>
                          <Icon name={copied === account.accountNumber ? 'check' : 'copy'} className="size-4" />
                        </button>
                      </div>
                    </article>
                </PopUpEffect>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer className="bg-[#111] px-6 py-32 text-center text-ivory snap-start">
           <PopUpEffect isReady={isOpen}>
              {/* POIN 3: Logo D&W Vertikal (ditumpuk) */}
              <div className="mx-auto mb-10 flex flex-col size-28 items-center justify-center rounded-full border border-ivory/20 leading-none shadow-md">
                <span className="font-serif text-4xl text-ivory/90">D</span>
                <span className="text-xl italic text-gold-soft my-1" style={{ fontFamily: "'Alex Brush', cursive" }}>&amp;</span>
                <span className="font-serif text-4xl text-ivory/90">W</span>
              </div>
              <p className="font-serif text-3xl md:text-4xl leading-snug font-medium tracking-wide">
                Dari Kami yang<br />Berbahagia
              </p>
              {/* POIN 3: Hashtag tidak kapital semua */}
              <p className="mt-8 text-[0.75rem] text-gold-soft font-bold tracking-[0.2em]">#DIRAngkaicerita</p>
              <div className="mx-auto my-12 h-px w-16 bg-ivory/20" />
              <p className="text-[0.55rem] font-bold tracking-[0.2em] text-ivory/30 uppercase">
                © 2026 Dina Yuliarty & Wirahilman
              </p>
           </PopUpEffect>
        </footer>
      </div>

      {/* ================= LIGHTBOX GALLERY ================= */}
      {lightboxIndex !== null && allGalleryPhotos[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg animate-in fade-in duration-300"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const delta = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(delta) > 50) showPhoto(delta > 0 ? -1 : 1)
            touchStartX.current = null
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <button type="button" autoFocus onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 z-[90] grid size-12 place-items-center rounded-full bg-white/10 text-ivory hover:bg-white/20 transition-colors shadow-lg">
            <Icon name="x" className="size-5" />
          </button>
          
          <div className="relative h-[85vh] w-full max-w-5xl px-4 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
            <Image src={allGalleryPhotos[lightboxIndex].url} alt={allGalleryPhotos[lightboxIndex].alt} fill sizes="100vw" quality={90} className="object-contain" priority />
          </div>
          
          <div className="absolute bottom-6 text-ivory/50 text-xs font-bold tracking-widest z-[90]">
            {lightboxIndex + 1} / {allGalleryPhotos.length}
          </div>
        </div>
      )}

          {/* ================= MUSIC PLAYER ================= */}
      {player.hasTracks && (
        <div className="fixed right-5 bottom-5 z-[60] flex items-center">
          
          {/* Notif 1: "Click to play" HANYA DI COVER (!isOpen) dan saat pause */}
          {!player.playing && !isOpen && (
             <div className="animate-bounce mr-3 rounded-lg bg-black/40 backdrop-blur-md px-3 py-2 text-[0.6rem] font-bold tracking-[0.2em] text-ivory uppercase border border-ivory/20 shadow-xl relative">
               Click to play music
               <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-black/40 border-r border-t border-ivory/20 transform -translate-y-1/2 rotate-45 backdrop-blur-md"></div>
             </div>
          )}

          {/* Notif 2: Judul Lagu (Muncul 4 detik saat awal play atau ganti lagu) */}
          {player.playing && showTrackTitle && (
            <div className="animate-in fade-in slide-in-from-right-5 mr-3 rounded-lg bg-black/70 backdrop-blur-md px-4 py-2 text-[0.6rem] font-bold tracking-[0.1em] text-gold-soft uppercase border border-ivory/20 shadow-xl transition-all duration-500">
               <span className="text-ivory/60 text-[0.5rem] tracking-[0.2em] block mb-0.5">Now Playing</span>
               {player.currentTrack?.title}
            </div>
          )}

          {/* Tombol Play & Next */}
          <div className="flex bg-black/50 backdrop-blur-md border border-ivory/20 rounded-full p-1 shadow-2xl">
            <button type="button" onClick={() => player.toggle()} className={`grid size-11 place-items-center rounded-full transition-all ${player.playing ? 'bg-gold-soft text-charcoal shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-ivory/10 text-ivory hover:bg-ivory hover:text-charcoal'}`} aria-label="Putar musik">
              <Icon name={player.playing ? 'pause' : 'play'} className="size-4" />
            </button>
            <button type="button" onClick={player.nextTrack} className="grid size-11 place-items-center rounded-full text-ivory transition-all hover:bg-ivory/20" aria-label="Lagu selanjutnya">
              <Icon name="next" className="size-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}