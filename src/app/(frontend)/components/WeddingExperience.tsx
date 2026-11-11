'use client'

import Image from 'next/image'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { submitRSVP, type RSVPState } from '../actions'
import { useMusicPlayer, type MusicTrack } from './useMusicPlayer'

// --- KOMPONEN EFEK MESIN TIK (TYPEWRITER) ---
function TypewriterEffect({ text, delay = 100 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTyping(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isTyping) return
    let i = 0
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(timer)
    }, delay)
    return () => clearInterval(timer)
  }, [text, delay, isTyping])

  return (
    <span ref={ref} className="inline-block">
      {displayedText}
      <span className="animate-pulse border-r-2 border-current ml-1" style={{ animationDuration: '0.8s' }}>&nbsp;</span>
    </span>
  )
}

type Media = { id: string | number; url?: string | null; alt?: string; width?: number | null; height?: number | null }
type GalleryItem = { id: string | number; role: 'cover' | 'bride' | 'groom' | 'story' | 'gallery'; caption: string; order: number; image: string | number | Media }
type Settings = { brideName?: string; groomName?: string; hashtag?: string; weddingDate?: string; musicEnabled?: boolean | null; verse?: string; venue?: { name?: string; address?: string; mapsUrl?: string }; people?: { brideFullName?: string; brideParents?: string; groomFullName?: string; groomParents?: string }; loveStory?: { id?: string | null; year: string; title: string; description: string }[] | null; bankAccounts?: { id?: string | null; bank: string; accountNumber: string; accountName: string }[] | null }
type Message = { id: string | number; guestName: string; message?: string | null }
type Guest = { id: string; name: string; partnerLabel: string; maxGuests: number; invitationType: 'personal' | 'group' }

const initialRSVPState: RSVPState = { success: false, message: '' }

function Icon({ name, className = 'size-5' }: { name: 'arrow' | 'calendar' | 'check' | 'chevron' | 'copy' | 'gift' | 'location' | 'music' | 'pause' | 'play' | 'x'; className?: string }) {
  const paths = {
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    calendar: <><path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /><path d="M8 13h3v3H8z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    gift: <><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" /><path d="M12 7c-3-5-7-3-5-1 1 1 3 1 5 1Zm0 0c3-5 7-3 5-1-1 1-3 1-5 1Z" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    pause: <path d="M9 6v12M15 6v12" />,
    play: <path d="m9 6 9 6-9 6Z" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function getMedia(item?: GalleryItem) {
  return item && typeof item.image === 'object' ? item.image : null
}

function SectionTitle({ kicker, children, light = true }: { kicker: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 text-center relative z-10">
      <p className={`mb-3 text-[0.65rem] font-bold tracking-[0.3em] uppercase ${light ? 'text-ivory/70' : 'text-sage'}`}>
        {kicker}
      </p>
      <h2 className={`font-serif text-4xl leading-tight font-medium ${light ? 'text-ivory' : 'text-charcoal'}`}>
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

  // BYPASS CMS: Menggunakan file lokal dengan awalan "Copy of" sesuai folder
  const galleryPhotos = useMemo(() => [
    { id: 1, url: '/media/Copy of ARG-27.JPG', alt: 'Gallery 1', caption: '' },
    { id: 2, url: '/media/Copy of ARG-37.JPG', alt: 'Gallery 2', caption: '' },
    { id: 3, url: '/media/Copy of ARG-74.JPG', alt: 'Gallery 3', caption: '' },
    { id: 4, url: '/media/Copy of ARG-79.JPG', alt: 'Gallery 4', caption: '' },
    { id: 5, url: '/media/Copy of ARG-81.JPG', alt: 'Gallery 5', caption: '' },
    { id: 6, url: '/media/Copy of ARG-82.JPG', alt: 'Gallery 6', caption: '' },
    { id: 7, url: '/media/Copy of ARG-84.JPG', alt: 'Gallery 7', caption: '' },
    { id: 8, url: '/media/Copy of ARG-92.JPG', alt: 'Gallery 8', caption: '' },
  ], [])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % galleryPhotos.length))
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i - 1 + galleryPhotos.length) % galleryPhotos.length))
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [lightboxIndex, galleryPhotos.length])

  function showPhoto(step: number) {
    setLightboxIndex((i) => (i === null ? i : (i + step + galleryPhotos.length) % galleryPhotos.length))
  }

  const tracks: MusicTrack[] = useMemo(() => [{ title: 'JKT48 - Rapsodi', url: '/media/JKT48_Rapsodi.mp3' }], [])
  const player = useMusicPlayer(tracks, { onTrackStart: () => setShowTrack(true) })

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
    player.start()
    window.setTimeout(() => { document.querySelector('#invitation')?.scrollIntoView({ behavior: 'smooth' }) }, 450)
  }

  async function copyText(value: string, key: string) {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1800)
  }

  // Helper untuk menghilangkan gelar (memotong teks setelah tanda koma)
  const cleanName = (fullName: string | undefined, fallback: string) => {
    return (fullName || fallback).split(',')[0].trim();
  }

  return (
    <main className="bg-charcoal text-ivory selection:bg-gold-soft selection:text-charcoal font-sans">
      
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
          <div className="flex flex-col items-center gap-2 text-[0.65rem] font-bold tracking-[0.3em] uppercase opacity-90 mt-10">
            <span>The Wedding of</span>
            <span className="h-[2px] w-12 bg-gold-soft/80" />
          </div>
          <div className="min-h-[140px] flex flex-col justify-center">
            {/* TYPEWRITER EFFECT DI NAMA MEMPELAI */}
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.1] font-medium tracking-wide drop-shadow-md">
              <TypewriterEffect text={cleanName(settings.brideName, 'Dina Yuliarty')} delay={150} /> <br />
              <span className="font-serif text-3xl italic text-gold-soft my-1 block">&amp;</span>
              <TypewriterEffect text={cleanName(settings.groomName, 'Wirahilman')} delay={150} />
            </h1>
            <p className="mt-8 text-[0.7rem] tracking-[0.3em] uppercase opacity-80 font-medium">{coverDateText}</p>
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
        
        {/* 1. AYAT SUCI (DARK OVERLAY) */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center snap-start">
          <div className="absolute inset-0 z-0">
            <Image src="/media/MLJ01773.jpeg" alt="Verse" fill sizes="100vw" quality={75} className="object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 p-6 max-w-md">
            <blockquote className="font-serif text-lg md:text-xl leading-relaxed italic text-ivory/90 font-light">
              " {settings.verse || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...'} "
            </blockquote>
            <p className="mt-8 text-[0.65rem] font-bold tracking-[0.25em] text-gold-soft uppercase">
              QS. Ar-Rum : 21
            </p>
          </div>
        </section>

        {/* 2. THE BRIDE (FULLSCREEN NO BOX) */}
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden text-center snap-start">
          <div className="absolute inset-0 z-0">
            <Image src="/media/MLJ02061.jpeg" alt="Bride" fill sizes="100vw" quality={85} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-charcoal/10" />
          </div>
          <div className="relative z-10 w-full px-6 pb-20">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-ivory/70 uppercase mb-2">The Bride</p>
            <h3 className="font-serif text-4xl md:text-5xl font-medium drop-shadow-md text-ivory">
              {cleanName(settings.people?.brideFullName, 'Dina Yuliarty')}
            </h3>
            <p className="mx-auto mt-4 max-w-xs text-[0.7rem] font-medium leading-relaxed text-ivory/60 tracking-widest uppercase">
              Putri Dari <br/> <span className="text-ivory/90">{settings.people?.brideParents}</span>
            </p>
          </div>
        </section>

        {/* 3. THE GROOM (FULLSCREEN NO BOX) */}
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden text-center snap-start">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ02105.jpeg" alt="Groom" fill sizes="100vw" quality={85} className="object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-charcoal/10" />
          </div>
          <div className="relative z-10 w-full px-6 pb-20">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-ivory/70 uppercase mb-2">The Groom</p>
            <h3 className="font-serif text-4xl md:text-5xl font-medium drop-shadow-md text-ivory">
              {cleanName(settings.people?.groomFullName, 'Wirahilman')}
            </h3>
            <p className="mx-auto mt-4 max-w-xs text-[0.7rem] font-medium leading-relaxed text-ivory/60 tracking-widest uppercase">
              Putra Dari <br/> <span className="text-ivory/90">{settings.people?.groomParents}</span>
            </p>
          </div>
        </section>

        {/* 4. OUR LOVE STORY */}
        <section className="relative overflow-hidden px-6 py-28 snap-start">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ01954.jpeg" alt="Love Story" fill sizes="100vw" quality={60} className="object-cover" />
             <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10">
            <SectionTitle kicker="Our Journey">Merangkai Cerita</SectionTitle>
            <div className="relative mx-auto max-w-xl">
              <div className="absolute top-3 bottom-3 left-[2.75rem] w-px bg-gold-soft/30 md:left-1/2" />
              {settings.loveStory?.map((story, index) => {
                const storyMedia = getMedia(byRole.story[index % Math.max(1, byRole.story.length)])
                return (
                  <article key={story.id || story.year} className={`relative mb-14 grid grid-cols-[5.5rem_1fr] gap-6 md:grid-cols-2 ${index % 2 ? 'md:[&>*:last-child]:col-start-1 md:[&>*:last-child]:row-start-1' : ''}`}>
                    <div className={`relative z-10 size-[5.5rem] overflow-hidden rounded-full border border-ivory/20 bg-charcoal shadow-xl ${index % 2 ? 'md:ml-5' : 'md:ml-auto md:mr-5'}`}>
                      {storyMedia?.url && (
                        <Image src={storyMedia.url} alt={storyMedia.alt || story.title} fill sizes="88px" className="object-cover" />
                      )}
                    </div>
                    <div className={`pt-2 md:px-6 ${index % 2 ? 'md:text-right' : ''}`}>
                      <p className="text-[0.65rem] font-bold tracking-[0.2em] text-gold-soft uppercase">{story.year}</p>
                      <h3 className="mt-2 font-serif text-2xl font-medium text-ivory">{story.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-ivory/70 font-light">{story.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. SAVE THE DATE */}
        <section className="relative overflow-hidden bg-charcoal px-6 py-28 text-ivory snap-start flex flex-col items-center justify-center min-h-svh">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ01952.jpeg" alt="Save the Date" fill sizes="100vw" quality={60} className="object-cover" />
             <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 w-full text-center">
            <h2 className="font-serif text-4xl leading-tight font-medium mb-2 uppercase tracking-widest text-gold-soft">
              Resepsi
            </h2>
            <p className="text-[0.7rem] tracking-[0.3em] text-ivory/80 uppercase mb-12">
              {longDateText}
            </p>

            <div className="mx-auto mb-16 grid max-w-sm grid-cols-4 divide-x divide-ivory/20">
              {Object.entries(countdown).map(([label, value]) => (
                <div key={label}>
                  <p className="font-serif text-3xl font-light text-ivory" suppressHydrationWarning>
                    {clientNow === null ? '--' : String(value).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-[0.55rem] tracking-[0.2em] text-ivory/50 uppercase font-bold">{label}</p>
                </div>
              ))}
            </div>

            <div>
               <p className="text-[0.7rem] font-bold tracking-[0.3em] text-gold-soft uppercase mb-4">Location</p>
               <h3 className="font-serif text-2xl font-medium">{settings.venue?.name || 'Ballroom Puri Mega Hotel'}</h3>
               <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ivory/60 font-light">{settings.venue?.address || 'Jakarta Pusat'}</p>
               <a href={settings.venue?.mapsUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex h-10 items-center justify-center rounded-full border border-ivory/40 px-8 text-[0.65rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-charcoal backdrop-blur-sm">
                  Google Maps
               </a>
            </div>
          </div>
        </section>

        {/* 6. OUR GALLERY (MASONRY GRID, DARK BG) */}
        {galleryPhotos.length > 0 && (
          <section className="bg-[#1a1a1a] py-28 px-4 md:px-10 snap-start">
            <SectionTitle kicker="Our Moment">Terekam dalam waktu</SectionTitle>
            <div className="columns-2 md:columns-3 gap-4 space-y-4 max-w-5xl mx-auto">
              {galleryPhotos.map((photo, index) => (
                <div key={photo.id} className="relative break-inside-avoid cursor-pointer overflow-hidden rounded-xl group" onClick={() => setLightboxIndex(index)}>
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    width={500}
                    height={700}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    quality={75}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. RSVP */}
        <section className="relative overflow-hidden px-6 py-28 snap-start">
          <div className="absolute inset-0 z-0">
            <Image src="/media/MLJ01728.jpeg" alt="RSVP" fill sizes="100vw" quality={60} className="object-cover" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10">
            <SectionTitle kicker="RSVP">Kehadiran Anda</SectionTitle>
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
                    { label: 'Maaf', value: 'declined' },
                  ].map((option) => (
                    <label key={option.value} className="flex h-12 cursor-pointer items-center justify-center gap-3 rounded-xl border border-ivory/20 px-4 text-xs font-bold tracking-widest uppercase text-ivory/80 has-[:checked]:border-gold-soft has-[:checked]:bg-gold-soft/10 transition-colors">
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
          </div>
        </section>

        {/* 8. WEDDING GIFT */}
        <section className="relative overflow-hidden px-6 py-28 snap-start">
          <div className="absolute inset-0 z-0">
             <Image src="/media/MLJ02074.jpeg" alt="Wedding Gift" fill sizes="100vw" quality={60} className="object-cover" />
             <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative z-10">
            <SectionTitle kicker="Wedding Gift">Tanda Kasih</SectionTitle>
            <p className="mx-auto -mt-6 max-w-md text-center text-xs font-light leading-relaxed text-ivory/70 mb-12">
              Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami.
            </p>
            <div className="mx-auto grid max-w-lg gap-6">
              {settings.bankAccounts?.map((account) => (
                <article key={account.id || account.accountNumber} className="relative overflow-hidden rounded-3xl border border-ivory/10 bg-white/5 p-8 text-ivory backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-medium tracking-wide">{account.bank}</p>
                      <p className="mt-1 text-[0.55rem] font-bold tracking-[0.2em] text-gold-soft uppercase">Digital Envelope</p>
                    </div>
                  </div>
                  <p className="mt-8 font-serif text-2xl tracking-[0.1em]">{account.accountNumber}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-[0.65rem] font-medium tracking-[0.15em] text-ivory/80 uppercase">{account.accountName}</p>
                    <button type="button" onClick={() => copyText(account.accountNumber, account.accountNumber)} className="grid size-10 place-items-center rounded-full border border-ivory/30 transition-colors hover:bg-ivory hover:text-charcoal" aria-label={`Salin nomor rekening ${account.bank}`}>
                      <Icon name={copied === account.accountNumber ? 'check' : 'copy'} className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer className="bg-[#111] px-6 py-24 text-center text-ivory snap-start">
          <div className="mx-auto mb-8 grid size-16 place-items-center rounded-full border border-ivory/20 font-serif text-xl text-ivory/80">
            D<span className="mx-1 text-sm italic text-gold-soft">&amp;</span>W
          </div>
          <p className="font-serif text-3xl leading-snug font-medium">
            Merangkai <br /> Cerita
          </p>
          <p className="mt-6 text-[0.65rem] text-gold-soft font-bold tracking-[0.2em] uppercase">{settings.hashtag}</p>
          <div className="mx-auto my-12 h-px w-12 bg-ivory/20" />
          <p className="text-[0.55rem] font-bold tracking-[0.2em] text-ivory/30 uppercase">
            © 2026 Dina Yuliarty & Wirahilman
          </p>
        </footer>
      </div>

      {/* ================= MUSIC PLAYER ================= */}
      {player.hasTracks && (
        <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-3">
          <button type="button" onClick={() => { player.toggle(); setShowTrack(true); }} className={`grid size-12 place-items-center rounded-full bg-ivory/10 text-ivory backdrop-blur-md border border-ivory/20 transition-all hover:bg-ivory hover:text-charcoal ${player.playing ? 'animate-pulse' : ''}`} aria-label={player.playing ? 'Jeda musik' : 'Putar musik'}>
            <Icon name={player.playing ? 'pause' : 'play'} className="size-4" />
          </button>
        </div>
      )}

      {/* ================= LIGHTBOX GALLERY ================= */}
      {lightboxIndex !== null && galleryPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg" onClick={() => setLightboxIndex(null)}>
          <button type="button" autoFocus onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 grid size-10 place-items-center rounded-full bg-white/10 text-ivory hover:bg-white/20 transition-colors">
            <Icon name="x" className="size-4" />
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl px-4" onClick={(e) => e.stopPropagation()}>
            <Image src={galleryPhotos[lightboxIndex].url} alt={galleryPhotos[lightboxIndex].alt} fill sizes="100vw" quality={90} className="object-contain" />
          </div>
        </div>
      )}
    </main>
  )
}