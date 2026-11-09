'use client'

import Image from 'next/image'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { submitRSVP, type RSVPState } from '../actions'
import { useMusicPlayer, type MusicTrack } from './useMusicPlayer'

type Media = {
  id: string | number
  url?: string | null
  alt?: string
  width?: number | null
  height?: number | null
}

type GalleryItem = {
  id: string | number
  role: 'cover' | 'bride' | 'groom' | 'story' | 'gallery'
  caption: string
  order: number
  image: string | number | Media
}

type Settings = {
  brideName?: string
  groomName?: string
  hashtag?: string
  weddingDate?: string
  musicEnabled?: boolean | null
  musicTracks?: { id?: string | null; title?: string; audio?: number | { url?: string | null } | null }[] | null
  verse?: string
  venue?: { name?: string; address?: string; mapsUrl?: string }
  people?: {
    brideFullName?: string
    brideParents?: string
    groomFullName?: string
    groomParents?: string
  }
  loveStory?: { id?: string | null; year: string; title: string; description: string }[] | null
  bankAccounts?: { id?: string | null; bank: string; accountNumber: string; accountName: string }[] | null
}

type Message = {
  id: string | number
  guestName: string
  message?: string | null
}

type Guest = {
  id: string
  name: string
  partnerLabel: string
  maxGuests: number
  invitationType: 'personal' | 'group'
}

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

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function getMedia(item?: GalleryItem) {
  return item && typeof item.image === 'object' ? item.image : null
}

function SectionTitle({ kicker, children, light = false }: { kicker: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 text-center">
      <p className={`mb-3 text-[0.65rem] font-semibold tracking-[0.3em] uppercase ${light ? 'text-gold-soft' : 'text-sage'}`}>
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
  const rollerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [copied, setCopied] = useState('')
  const [state, formAction, pending] = useActionState(submitRSVP, initialRSVPState)

  const byRole = useMemo(() => ({
    cover: gallery.find((item) => item.role === 'cover'),
    bride: gallery.find((item) => item.role === 'bride'),
    groom: gallery.find((item) => item.role === 'groom'),
    story: gallery.filter((item) => item.role === 'story'),
    gallery: gallery.filter((item) => item.role === 'gallery'),
  }), [gallery])

  // CMS Gallery fallback to Manual Local Gallery
  const manualGalleryPhotos = [
    { id: 1, url: '/media/ARG-27.JPG', alt: 'Gallery 1', caption: '' },
    { id: 2, url: '/media/ARG-37.JPG', alt: 'Gallery 2', caption: '' },
    { id: 3, url: '/media/ARG-74.JPG', alt: 'Gallery 3', caption: '' },
    { id: 4, url: '/media/ARG-79.JPG', alt: 'Gallery 4', caption: '' },
    { id: 5, url: '/media/ARG-81.JPG', alt: 'Gallery 5', caption: '' },
    { id: 6, url: '/media/ARG-82.JPG', alt: 'Gallery 6', caption: '' },
    { id: 7, url: '/media/ARG-84.JPG', alt: 'Gallery 7', caption: '' },
    { id: 8, url: '/media/ARG-92.JPG', alt: 'Gallery 8', caption: '' },
  ]

  const galleryPhotos = useMemo(() => {
    const cmsPhotos = byRole.gallery.flatMap((item) => {
      const media = getMedia(item)
      return media?.url ? [{ id: item.id, url: media.url, alt: media.alt || item.caption || 'Foto', caption: item.caption }] : []
    })
    return cmsPhotos.length > 0 ? cmsPhotos : manualGalleryPhotos
  }, [byRole.gallery])

  const lightboxOpen = lightboxIndex !== null

  useEffect(() => {
    if (!lightboxOpen) return
    const count = galleryPhotos.length
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      else if (event.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % count))
      else if (event.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i - 1 + count) % count))
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, galleryPhotos.length])

  function showPhoto(step: number) {
    const count = galleryPhotos.length
    setLightboxIndex((i) => (i === null || count === 0 ? i : (i + step + count) % count))
  }

  function scrollRoller(direction: 1 | -1) {
    const element = rollerRef.current
    if (element) element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!showTrack) return
    const timeout = window.setTimeout(() => setShowTrack(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [showTrack])

  // HARDCODED MUSIC JKT48
  const tracks: MusicTrack[] = useMemo(() => settings.musicEnabled === false ? [] : [{ title: 'JKT48 - Rapsodi', url: '/media/JKT48_Rapsodi.mp3' }], [settings.musicEnabled])
  const player = useMusicPlayer(tracks, { onTrackStart: () => setShowTrack(true) })

  // Data Tanggal
  const eventDate = new Date(settings.weddingDate || '2026-12-26T01:00:00.000Z')
  const dateParts = (options: Intl.DateTimeFormatOptions) => Object.fromEntries(new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', ...options }).formatToParts(eventDate).map((part): [string, string] => [part.type, part.value]))
  const numericDate = dateParts({ day: '2-digit', month: '2-digit', year: 'numeric' })
  const longDate = dateParts({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const coverDateText = `${numericDate.day} · ${numericDate.month} · ${numericDate.year}`
  const longDateText = `${longDate.weekday} · ${longDate.day} ${longDate.month} ${longDate.year}`

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

  const coverVideoRef = useRef<HTMLVideoElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    setReduceMotion(query.matches || Boolean(connection?.saveData))
  }, [])

  useEffect(() => {
    const video = coverVideoRef.current
    if (!video) return
    video.muted = true 
    const sync = () => {
      if (isOpen || document.visibilityState === 'hidden') video.pause()
      else void video.play().catch(() => {})
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [isOpen, reduceMotion])

  function openInvitation() {
    setIsOpen(true)
    player.start()
    window.setTimeout(() => {
      document.querySelector('#invitation')?.scrollIntoView({ behavior: 'smooth' })
    }, 450)
  }

  async function copyText(value: string, key: string) {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1800)
  }

  return (
    <main className="bg-ivory text-charcoal">
      {/* ================= COVER PAGE ================= */}
      <section className={`fixed inset-0 z-50 overflow-hidden bg-charcoal transition-all duration-700 ${isOpen ? 'pointer-events-none -translate-y-10 opacity-0' : ''}`}>
        <div aria-hidden="true" className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl" style={{ backgroundImage: "url('/media/poster.jpg')" }} />
        {reduceMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/media/poster.jpg" alt="" aria-hidden="true" className="absolute inset-0 size-full object-contain" />
        ) : (
          <video ref={coverVideoRef} className="absolute inset-0 size-full object-contain" autoPlay muted loop playsInline preload="metadata" poster="/media/poster.jpg" aria-hidden="true" tabIndex={-1}>
            <source src="/media/cover.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/85" />
        <div className="relative flex min-h-svh flex-col items-center justify-between px-6 py-12 text-center text-ivory">
          <div className="flex items-center gap-3 text-[0.62rem] font-semibold tracking-[0.34em] uppercase">
            <span className="h-px w-8 bg-ivory/50" />
            The Wedding of
            <span className="h-px w-8 bg-ivory/50" />
          </div>
          <div>
            <p className="mb-5 text-[0.66rem] tracking-[0.25em] uppercase">{coverDateText}</p>
            <h1 className="font-serif text-6xl leading-[0.88] font-medium">
              {settings.brideName || 'Dina'}
              <span className="my-3 block font-serif text-3xl font-normal italic text-gold-soft">&amp;</span>
              {settings.groomName || 'Wira'}
            </h1>
            <p className="mt-6 font-serif text-lg italic text-ivory/80">{settings.hashtag || '#DIRAngkaiCerita'}</p>
          </div>
          <div className="w-full max-w-sm">
            <p className="mb-5 text-xs leading-relaxed text-ivory/80">
              Dear
              <strong className="mt-1 block font-serif text-lg font-normal text-ivory">{guest?.name || 'Tamu Undangan'} {guest?.partnerLabel}</strong>
            </p>
            <button type="button" onClick={openInvitation} className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-ivory px-7 text-xs font-semibold tracking-[0.16em] text-charcoal uppercase transition hover:bg-gold-soft active:scale-[0.98]">
              Buka Undangan
              <Icon name="arrow" className="size-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= CONTENT INVITATION ================= */}
      <div id="invitation" className={isOpen ? 'opacity-100' : 'opacity-0'}>
        
        {/* 1. AYAT SUCI */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 blur-[2px]" style={{ backgroundImage: "url('/media/ARG-393.JPG')" }} />
          <div className="relative z-10 p-6 backdrop-blur-sm bg-ivory/20 rounded-3xl">
            <p className="mb-6 font-serif text-5xl text-gold">“</p>
            <blockquote className="relative mx-auto max-w-md font-serif text-xl leading-relaxed italic drop-shadow-md">
              {settings.verse}
            </blockquote>
            <div className="mx-auto mt-8 h-px w-12 bg-gold/80" />
            <p className="mt-5 text-[0.62rem] font-semibold tracking-[0.24em] text-sage uppercase drop-shadow-sm">
              QS. Ar-Rum · 21
            </p>
          </div>
        </section>

        {/* 2. THE BRIDE (FULLSCREEN) */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 blur-sm" style={{ backgroundImage: "url('/media/MLJ01888.jpeg')" }} />
          <div className="relative z-10 w-full">
            <SectionTitle kicker="The Bride">Dua jiwa, satu cerita</SectionTitle>
            <article className="mx-auto max-w-sm backdrop-blur-md bg-ivory/40 p-8 rounded-[3rem] shadow-xl border border-ivory/50">
              <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-t-[10rem] rounded-b-2xl bg-sage/10 shadow-inner">
                <Image
                  src="/media/MLJ01728.jpeg" 
                  alt="Bride"
                  fill
                  sizes="(max-width: 768px) 85vw, 40vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-7 text-[0.62rem] font-semibold tracking-[0.28em] text-sage uppercase">The Bride</p>
              <h3 className="mt-3 font-serif text-3xl font-bold">{settings.people?.brideFullName || 'Dina Yuliana, S.K.M.'}</h3>
              <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-charcoal/80 font-medium">
                {settings.people?.brideParents}
              </p>
            </article>
          </div>
        </section>

        {/* 3. THE GROOM (FULLSCREEN) */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 blur-sm" style={{ backgroundImage: "url('/media/MLJ01954.jpeg')" }} />
          <div className="relative z-10 w-full">
            <SectionTitle kicker="The Groom">Bersatu dalam doa</SectionTitle>
            <article className="mx-auto max-w-sm backdrop-blur-md bg-ivory/40 p-8 rounded-[3rem] shadow-xl border border-ivory/50">
              <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-t-[10rem] rounded-b-2xl bg-sage/10 shadow-inner">
                <Image
                  src="/media/MLJ01763.jpeg" 
                  alt="Groom"
                  fill
                  sizes="(max-width: 768px) 85vw, 40vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-7 text-[0.62rem] font-semibold tracking-[0.28em] text-sage uppercase">The Groom</p>
              <h3 className="mt-3 font-serif text-3xl font-bold">{settings.people?.groomFullName || 'Wirahilman, S.Tr.Inst.'}</h3>
              <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-charcoal/80 font-medium">
                {settings.people?.groomParents}
              </p>
            </article>
          </div>
        </section>

        {/* 4. OUR LOVE STORY */}
        <section className="relative overflow-hidden px-6 py-24">
          <div className="absolute inset-0 bg-cover bg-center opacity-15 blur-[2px]" style={{ backgroundImage: "url('/media/ARG-430.JPG')" }} />
          <div className="relative z-10">
            <SectionTitle kicker="Our Love Story">Sejak 2018</SectionTitle>
            <div className="relative mx-auto max-w-xl backdrop-blur-sm bg-ivory/30 p-8 rounded-3xl border border-ivory/30 shadow-lg">
              <div className="absolute top-3 bottom-3 left-[2.75rem] w-px bg-gold/50 md:left-1/2" />
              {settings.loveStory?.map((story, index) => {
                const storyMedia = getMedia(byRole.story[index % Math.max(1, byRole.story.length)])
                return (
                  <article key={story.id || story.year} className={`relative mb-12 grid grid-cols-[5.5rem_1fr] gap-5 md:grid-cols-2 ${index % 2 ? 'md:[&>*:last-child]:col-start-1 md:[&>*:last-child]:row-start-1' : ''}`}>
                    <div className={`relative z-10 size-[5.5rem] overflow-hidden rounded-full border-4 border-ivory bg-sand shadow-sm ${index % 2 ? 'md:ml-5' : 'md:ml-auto md:mr-5'}`}>
                      {storyMedia?.url && (
                        <Image src={storyMedia.url} alt={storyMedia.alt || story.title} fill sizes="88px" className="object-cover" />
                      )}
                    </div>
                    <div className={`pt-2 md:px-6 ${index % 2 ? 'md:text-right' : ''}`}>
                      <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold-soft uppercase drop-shadow-md">{story.year}</p>
                      <h3 className="mt-2 font-serif text-2xl font-bold">{story.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-charcoal/90 font-medium">{story.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. SAVE THE DATE */}
        <section className="relative overflow-hidden bg-sage-deep px-6 py-24 text-ivory">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm" style={{ backgroundImage: "url('/media/ARG-413.JPG')" }} />
          <div className="relative z-10">
            <SectionTitle kicker="Save The Date" light>Hari yang kami nanti</SectionTitle>
            <div className="mx-auto mb-14 grid max-w-lg grid-cols-4 divide-x divide-ivory/30 rounded-2xl border border-ivory/30 bg-black/20 p-5 text-center backdrop-blur-md shadow-xl">
              {Object.entries(countdown).map(([label, value]) => (
                <div key={label}>
                  <p className="font-serif text-3xl font-bold drop-shadow-lg" suppressHydrationWarning>
                    {clientNow === null ? '--' : String(value).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-[0.52rem] tracking-[0.15em] text-ivory/80 uppercase font-medium">{label}</p>
                </div>
              ))}
            </div>
            <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
              {[
                { title: 'Akad Nikah', time: '08.00 WIB — Selesai' },
                { title: 'Resepsi', time: '11.00 — 13.00 WIB' },
              ].map((event) => (
                <article key={event.title} className="rounded-3xl border border-ivory/30 bg-black/20 p-7 text-center backdrop-blur-md shadow-lg">
                  <Icon name="calendar" className="mx-auto size-6 text-gold-soft drop-shadow-md" />
                  <p className="mt-5 text-[0.58rem] tracking-[0.24em] text-ivory/90 uppercase font-medium">{longDateText}</p>
                  <h3 className="mt-3 font-serif text-3xl font-bold drop-shadow-lg">{event.title}</h3>
                  <p className="mt-3 text-xs text-ivory/90 font-medium">{event.time}</p>
                </article>
              ))}
            </div>
            <div className="mx-auto mt-5 max-w-3xl rounded-3xl bg-ivory/95 p-7 text-center text-charcoal shadow-2xl backdrop-blur-sm border border-ivory">
              <Icon name="location" className="mx-auto size-6 text-sage" />
              <h3 className="mt-4 font-serif text-2xl font-bold">{settings.venue?.name}</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-charcoal/80 font-medium">{settings.venue?.address}</p>
              <a href={settings.venue?.mapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border border-sage px-6 text-[0.62rem] font-bold tracking-[0.15em] text-sage uppercase transition hover:bg-sage hover:text-ivory shadow-sm">
                Open Location <Icon name="arrow" className="size-4" />
              </a>
            </div>
          </div>
        </section>

        {/* 6. OUR GALLERY (NO BACKGROUND, INTERACTIVE SLIDER) */}
        {galleryPhotos.length > 0 && (
          <section className="bg-sand py-24">
            <SectionTitle kicker="Our Gallery">Captured in time</SectionTitle>
            <div ref={rollerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-8 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {galleryPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[3/4] w-[75vw] max-w-[18rem] shrink-0 snap-center overflow-hidden rounded-3xl bg-ivory shadow-lg border border-charcoal/5"
                  aria-label={`Buka foto ${index + 1} dari ${galleryPhotos.length}`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 75vw, 288px"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-charcoal/0 transition duration-500 group-hover:bg-charcoal/20" />
                </button>
              ))}
            </div>
            {galleryPhotos.length > 1 && (
              <div className="mt-2 hidden justify-center gap-4 md:flex">
                <button type="button" onClick={() => scrollRoller(-1)} className="grid size-12 place-items-center rounded-full border-2 border-sage/30 bg-ivory/50 text-sage transition hover:bg-sage hover:text-ivory shadow-sm">
                  <Icon name="arrow" className="size-5 rotate-180" />
                </button>
                <button type="button" onClick={() => scrollRoller(1)} className="grid size-12 place-items-center rounded-full border-2 border-sage/30 bg-ivory/50 text-sage transition hover:bg-sage hover:text-ivory shadow-sm">
                  <Icon name="arrow" className="size-5" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* 7. RSVP */}
        <section className="relative overflow-hidden px-6 py-24">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 blur-sm" style={{ backgroundImage: "url('/media/ARG-397.JPG')" }} />
          <div className="relative z-10">
            <SectionTitle kicker="RSVP">Kehadiran Anda berarti</SectionTitle>
            <form action={formAction} className="mx-auto max-w-xl rounded-[2.5rem] border border-ivory/40 bg-ivory/80 p-6 shadow-[0_24px_70px_rgba(56,52,45,0.15)] backdrop-blur-xl md:p-10">
              <input type="hidden" name="guestId" value={guest?.id || ''} />
              <input type="text" name="hp_catatan" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
              {guest?.invitationType === 'group' ? (
                <>
                  <label htmlFor="rsvp-name" className="mb-2 block text-[0.6rem] font-bold tracking-[0.16em] text-sage-deep uppercase">Nama Anda</label>
                  <input id="rsvp-name" type="text" name="guestName" required minLength={2} maxLength={80} autoComplete="name" placeholder="Tulis nama lengkap Anda" className="mb-6 min-h-14 w-full rounded-2xl border border-sage/20 bg-white/70 px-5 font-serif text-lg outline-none placeholder:text-stone/50 focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all shadow-sm" />
                </>
              ) : (
                <>
                  <input type="hidden" name="guestName" value={guest?.name || ''} />
                  <label className="mb-2 block text-[0.6rem] font-bold tracking-[0.16em] text-sage-deep uppercase">Nama Tamu</label>
                  <div className="mb-6 flex min-h-14 items-center rounded-2xl border border-sage/20 bg-white/70 px-5 font-serif text-lg shadow-sm font-medium">{guest?.name || 'Tamu Undangan'}</div>
                </>
              )}
              <fieldset className="mb-6">
                <legend className="mb-3 text-[0.6rem] font-bold tracking-[0.16em] text-sage-deep uppercase">Konfirmasi Kehadiran</legend>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Ya, saya hadir', value: 'attending' },
                    { label: 'Maaf, tidak hadir', value: 'declined' },
                  ].map((option) => (
                    <label key={option.value} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-sage/20 bg-white/70 px-4 text-xs font-semibold has-[:checked]:border-sage has-[:checked]:bg-sage/10 transition-all shadow-sm">
                      <input type="radio" name="attendance" value={option.value} required className="size-4 accent-sage" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="mb-2 block text-[0.6rem] font-bold tracking-[0.16em] text-sage-deep uppercase">Jumlah Tamu</label>
              <div className="relative mb-6">
                <select name="guestCount" className="min-h-14 w-full appearance-none rounded-2xl border border-sage/20 bg-white/70 px-5 text-sm font-semibold outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all shadow-sm">
                  {Array.from({ length: guest?.maxGuests || 1 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>{index + 1} orang</option>
                  ))}
                </select>
                <Icon name="chevron" className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-sage-deep" />
              </div>
              <label className="mb-2 block text-[0.6rem] font-bold tracking-[0.16em] text-sage-deep uppercase">Ucapan & Doa</label>
              <textarea name="message" maxLength={500} rows={4} placeholder="Tuliskan doa terbaik Anda..." className="w-full resize-none rounded-2xl border border-sage/20 bg-white/70 p-5 text-sm font-medium outline-none placeholder:text-stone/50 focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all shadow-sm" />
              <button type="submit" disabled={pending || !guest} className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-sage px-6 text-[0.65rem] font-bold tracking-[0.18em] text-ivory uppercase transition hover:bg-sage-deep disabled:opacity-50 shadow-md">
                {pending ? 'Mengirim...' : 'Kirim Konfirmasi'}
                <Icon name="arrow" className="size-4" />
              </button>
              {state.message && (
                <p className={`mt-5 text-center text-xs font-bold ${state.success ? 'text-sage-deep' : 'text-red-600'}`}>{state.message}</p>
              )}
            </form>

            <div className="mx-auto mt-24 max-w-xl">
              <h3 className="text-center font-serif text-3xl font-bold bg-ivory/60 py-2 rounded-2xl backdrop-blur-sm border border-ivory shadow-sm inline-block px-8 mx-auto flex w-max">Memory Wall</h3>
              <p className="mt-3 text-center text-xs text-charcoal/80 font-semibold drop-shadow-sm">Doa-doa hangat dari orang tersayang</p>
              <div className="mt-10 space-y-[-0.7rem]">
                {messages.map((message, index) => (
                  <article key={message.id} className={`relative rounded-3xl border border-ivory/50 bg-ivory/90 p-7 shadow-lg backdrop-blur-md ${index % 2 ? '-rotate-2' : 'rotate-2'}`}>
                    <p className="font-serif text-lg leading-relaxed italic text-charcoal">“{message.message}”</p>
                    <p className="mt-4 text-[0.58rem] font-bold tracking-[0.18em] text-sage uppercase">— {message.guestName}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. WEDDING GIFT */}
        <section className="relative overflow-hidden px-6 py-24">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 blur-sm" style={{ backgroundImage: "url('/media/ARG-120.JPG')" }} />
          <div className="relative z-10">
            <SectionTitle kicker="Wedding Gift">Tanda kasih</SectionTitle>
            <p className="mx-auto -mt-5 max-w-md text-center text-sm font-medium leading-relaxed text-charcoal/90 bg-ivory/40 p-4 rounded-2xl backdrop-blur-sm border border-ivory/30 shadow-sm">
              Doa restu Anda adalah hadiah terindah. Namun jika ingin memberikan tanda kasih, Anda dapat menggunakan amplop digital berikut.
            </p>
            <div className="mx-auto mt-10 grid max-w-2xl gap-5 md:grid-cols-2">
              {settings.bankAccounts?.map((account) => (
                <article key={account.id || account.accountNumber} className="relative overflow-hidden rounded-[2rem] bg-charcoal/95 p-8 text-ivory shadow-2xl backdrop-blur-md border border-charcoal/50">
                  <div className="absolute -top-10 -right-8 size-32 rounded-full border-2 border-gold-soft/20" />
                  <div className="absolute -top-4 -right-14 size-32 rounded-full border border-gold-soft/10" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold tracking-tight">{account.bank}</p>
                      <p className="mt-1 text-[0.5rem] font-bold tracking-[0.2em] text-gold-soft uppercase">Digital Envelope</p>
                    </div>
                    <Icon name="gift" className="size-7 text-gold-soft" />
                  </div>
                  <p className="mt-10 font-mono text-2xl font-medium tracking-[0.12em]">{account.accountNumber}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <p className="text-[0.6rem] font-bold tracking-[0.15em] text-ivory/80 uppercase">{account.accountName}</p>
                    <button type="button" onClick={() => copyText(account.accountNumber, account.accountNumber)} className="grid size-12 place-items-center rounded-full border-2 border-ivory/20 transition-all hover:bg-gold-soft hover:border-gold-soft hover:text-charcoal hover:scale-105 active:scale-95" aria-label={`Salin nomor rekening ${account.bank}`}>
                      <Icon name={copied === account.accountNumber ? 'check' : 'copy'} className="size-5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FOOTER (PLAIN) */}
        <footer className="bg-charcoal px-6 py-20 text-center text-ivory">
          <div className="mx-auto mb-7 grid size-16 place-items-center rounded-full border border-gold-soft/40 font-serif text-xl text-gold-soft">
            D<span className="mx-0.5 text-sm">&amp;</span>W
          </div>
          <p className="font-serif text-3xl leading-relaxed">
            Sampai jumpa di hari <br /> bahagia kami
          </p>
          <p className="mt-5 text-xs text-ivory/60 font-medium tracking-wide">{settings.hashtag}</p>
          <div className="mx-auto my-10 h-px w-16 bg-gold-soft/35" />
          <p className="text-[0.55rem] font-bold tracking-[0.2em] text-ivory/40 uppercase">
            © 2026 Dina & Wira · Wedding OS
          </p>
        </footer>
      </div>

      {/* ================= MUSIC PLAYER (Z-INDEX 60) ================= */}
      {player.hasTracks && (
        <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-3">
          <span
            role="status"
            className={`max-w-[55vw] truncate rounded-full bg-charcoal/90 px-4 py-2 text-[0.65rem] font-bold tracking-wide text-ivory shadow-lg backdrop-blur-md border border-charcoal transition duration-500 ${
              showTrack || player.status === 'error' ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-3 opacity-0'
            }`}
          >
            {player.status === 'error' ? 'Musik tidak dapat diputar' : player.current?.title}
          </span>
          {tracks.length > 1 && (
            <button type="button" onClick={() => player.next()} className="grid size-12 place-items-center rounded-full bg-charcoal/90 text-ivory shadow-lg backdrop-blur-md transition hover:bg-charcoal border border-charcoal/50" aria-label="Lagu berikutnya">
              <Icon name="arrow" className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              player.toggle()
              setShowTrack(true)
            }}
            className={`grid size-14 place-items-center rounded-full bg-sage text-ivory shadow-2xl transition-all hover:bg-sage-deep hover:scale-105 active:scale-95 border-2 border-sage-deep/20 ${player.playing ? 'music-pulse' : ''}`}
            aria-label={player.playing ? 'Jeda musik' : 'Putar musik'}
          >
            <Icon name={player.playing ? 'pause' : 'play'} className="size-5" />
          </button>
        </div>
      )}

      {/* ================= LIGHTBOX GALLERY ================= */}
      {lightboxIndex !== null && galleryPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-charcoal/95 backdrop-blur-lg" role="dialog" aria-modal="true" aria-label="Tampilan foto penuh" onClick={() => setLightboxIndex(null)} onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null }} onTouchEnd={(event) => { const start = touchStartX.current; touchStartX.current = null; const end = event.changedTouches[0]?.clientX; if (start === null || end === undefined) return; const delta = end - start; if (Math.abs(delta) > 50) showPhoto(delta < 0 ? 1 : -1) }}>
          <button type="button" autoFocus onClick={(event) => { event.stopPropagation(); setLightboxIndex(null); }} className="absolute top-5 right-5 grid size-12 place-items-center rounded-full border-2 border-ivory/30 text-ivory hover:bg-white/10 transition-colors" aria-label="Tutup foto">
            <Icon name="x" />
          </button>
          {galleryPhotos.length > 1 && (
            <>
              <button type="button" onClick={(event) => { event.stopPropagation(); showPhoto(-1); }} className="absolute top-1/2 left-4 grid size-14 -translate-y-1/2 place-items-center rounded-full border-2 border-ivory/30 bg-charcoal/60 text-ivory hover:bg-white/20 transition-colors" aria-label="Foto sebelumnya">
                <Icon name="arrow" className="size-6 rotate-180" />
              </button>
              <button type="button" onClick={(event) => { event.stopPropagation(); showPhoto(1); }} className="absolute top-1/2 right-4 grid size-14 -translate-y-1/2 place-items-center rounded-full border-2 border-ivory/30 bg-charcoal/60 text-ivory hover:bg-white/20 transition-colors" aria-label="Foto berikutnya">
                <Icon name="arrow" className="size-6" />
              </button>
            </>
          )}
          <div className="relative h-[80vh] w-full max-w-4xl px-4" onClick={(event) => event.stopPropagation()}>
            <Image key={galleryPhotos[lightboxIndex].id} src={galleryPhotos[lightboxIndex].url} alt={galleryPhotos[lightboxIndex].alt} fill sizes="(max-width: 768px) 100vw, 1024px" className="object-contain drop-shadow-2xl rounded-lg" />
          </div>
          <p className="mt-6 px-6 text-center text-sm font-medium text-ivory/90">
            {galleryPhotos[lightboxIndex].caption || ''}
            <span className="ml-3 text-ivory/50 font-bold tracking-widest">{lightboxIndex + 1} / {galleryPhotos.length}</span>
          </p>
        </div>
      )}
    </main>
  )
}