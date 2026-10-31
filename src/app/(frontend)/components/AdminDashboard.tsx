'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Guest = {
  id: string
  name: string
  slug: string
  invitationStatus: 'draft' | 'sent' | 'opened'
}

type RSVP = {
  attendance: 'attending' | 'declined'
  guestCount: number
}

type Section = {
  id: string
  label: string
  enabled: boolean
}

function DashIcon({
  name,
  className = 'size-5',
}: {
  name:
    | 'chart'
    | 'chevron'
    | 'copy'
    | 'drag'
    | 'edit'
    | 'external'
    | 'gallery'
    | 'guests'
    | 'heart'
    | 'menu'
    | 'search'
    | 'settings'
    | 'trash'
  className?: string
}) {
  const paths = {
    chart: (
      <>
        <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    drag: <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />,
    edit: <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm10-13 3 3" />,
    external: (
      <path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    ),
    gallery: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="2" />
        <path d="m21 15-5-5L5 20" />
      </>
    ),
    guests: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2" />
        <path d="M3 20a6 6 0 0 1 12 0m1-5a4 4 0 0 1 5 4" />
      </>
    ),
    heart: (
      <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    search: <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.7V21H10v-.1A1.8 1.8 0 0 0 8.9 19a1.8 1.8 0 0 0-2 .4l-.1.1L4 16.7l.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 2.8 14H2v-4h.8a1.8 1.8 0 0 0 1.7-1.1 1.8 1.8 0 0 0-.4-2L4 6.8 6.8 4l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 2.8V2h4v.8a1.8 1.8 0 0 0 1.1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1L20 6.8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1.1h.8v4h-.8a1.8 1.8 0 0 0-1.8 1Z" />
      </>
    ),
    trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />,
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

export default function AdminDashboard({
  guests,
  rsvps,
  sections: initialSections,
}: {
  guests: Guest[]
  rsvps: RSVP[]
  sections: Section[]
}) {
  const [active, setActive] = useState('Overview')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const [sections, setSections] = useState(initialSections)
  const [sidebar, setSidebar] = useState(false)

  const attending = rsvps.filter((item) => item.attendance === 'attending').length
  const declined = rsvps.filter((item) => item.attendance === 'declined').length
  const pending = Math.max(0, guests.length - rsvps.length)
  const filteredGuests = useMemo(
    () => guests.filter((guest) => guest.name.toLowerCase().includes(query.toLowerCase())),
    [guests, query],
  )

  const menu = [
    { label: 'Overview', icon: 'chart' as const },
    { label: 'Guest Management', icon: 'guests' as const },
    { label: 'RSVP Stats', icon: 'heart' as const },
    { label: 'Wedding Settings', icon: 'settings' as const },
    { label: 'Gallery Upload', icon: 'gallery' as const },
  ]

  async function copyLink(slug: string) {
    const link = `${window.location.origin}/?to=${slug}`
    await navigator.clipboard.writeText(link)
    setCopied(slug)
    window.setTimeout(() => setCopied(''), 1500)
  }

  return (
    <main className="min-h-screen bg-dashboard text-slate-900 lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[16.5rem] flex-col bg-ink p-5 text-white transition lg:sticky lg:top-0 lg:translate-x-0 ${
          sidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid size-10 place-items-center rounded-xl bg-sage text-sm font-bold">
            DW
          </div>
          <div>
            <p className="text-sm font-semibold">Wedding OS</p>
            <p className="text-[0.65rem] text-white/45">Dina & Wira</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {menu.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setActive(item.label)
                setSidebar(false)
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs transition ${
                active === item.label ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5'
              }`}
            >
              <DashIcon name={item.icon} className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[0.6rem] tracking-[0.14em] text-white/40 uppercase">
            Invitation Status
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full bg-emerald-400" />
            Published
          </div>
          <Link
            href="/"
            className="mt-4 flex items-center gap-2 text-[0.65rem] text-white/55 hover:text-white"
          >
            Preview invitation <DashIcon name="external" className="size-3.5" />
          </Link>
        </div>
      </aside>

      {sidebar && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setSidebar(false)}
          aria-label="Tutup menu"
        />
      )}

      <section className="min-w-0">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebar(true)}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
              aria-label="Buka menu"
            >
              <DashIcon name="menu" />
            </button>
            <div>
              <p className="text-[0.65rem] text-slate-400">Wedding workspace</p>
              <h1 className="text-lg font-semibold">{active}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-medium md:flex"
            >
              Open CMS <DashIcon name="external" className="size-3.5" />
            </Link>
            <div className="grid size-10 place-items-center rounded-full bg-sage-light text-xs font-semibold text-sage">
              DA
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[90rem] p-5 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm text-slate-500">Selamat datang kembali, Dina.</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Everything is beautifully on track.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="size-2 rounded-full bg-emerald-500" />
              Last synced just now
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Total Guest',
                value: guests.length,
                detail: 'Invited guests',
                tone: 'bg-indigo-50 text-indigo-600',
              },
              {
                label: 'Confirmed',
                value: attending,
                detail: 'Will attend',
                tone: 'bg-emerald-50 text-emerald-600',
              },
              {
                label: 'Declined',
                value: declined,
                detail: 'Unable to attend',
                tone: 'bg-rose-50 text-rose-500',
              },
              {
                label: 'Pending',
                value: pending,
                detail: `${Math.round((pending / Math.max(1, guests.length)) * 100)}% response rate`,
                tone: 'bg-amber-50 text-amber-600',
              },
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className={`mb-5 grid size-10 place-items-center rounded-xl ${stat.tone}`}>
                  <DashIcon
                    name={stat.label === 'Total Guest' ? 'guests' : 'chart'}
                    className="size-4"
                  />
                </div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-3 text-[0.65rem] text-slate-400">{stat.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
                <div>
                  <h3 className="text-sm font-semibold">Guest Management</h3>
                  <p className="mt-1 text-[0.65rem] text-slate-400">
                    Manage invitations and personalized links
                  </p>
                </div>
                <div className="relative">
                  <DashIcon
                    name="search"
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search guest..."
                    className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sage md:w-56"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left">
                  <thead className="bg-slate-50/70 text-[0.6rem] tracking-[0.08em] text-slate-400 uppercase">
                    <tr>
                      <th className="px-5 py-3 font-medium">Nama</th>
                      <th className="px-5 py-3 font-medium">Slug</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id} className="text-xs hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-medium">{guest.name}</td>
                        <td className="px-5 py-4 font-mono text-[0.65rem] text-slate-400">
                          /{guest.slug}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[0.6rem] font-medium ${
                              guest.invitationStatus === 'opened'
                                ? 'bg-emerald-50 text-emerald-600'
                                : guest.invitationStatus === 'sent'
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {guest.invitationStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => copyLink(guest.slug)}
                              className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                              aria-label={`Salin tautan ${guest.name}`}
                            >
                              <DashIcon
                                name={copied === guest.slug ? 'chevron' : 'copy'}
                                className="size-4"
                              />
                            </button>
                            <button
                              type="button"
                              className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                              aria-label={`Edit ${guest.name}`}
                            >
                              <DashIcon name="edit" className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                              aria-label={`Hapus ${guest.name}`}
                            >
                              <DashIcon name="trash" className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Section Builder</h3>
                  <p className="mt-1 text-[0.65rem] text-slate-400">
                    Drag to reorder your invitation
                  </p>
                </div>
                <span className="rounded-lg bg-sage-light px-2 py-1 text-[0.58rem] font-medium text-sage">
                  Live
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-3"
                  >
                    <DashIcon name="drag" className="size-4 text-slate-300" />
                    <span className="flex-1 text-xs font-medium">{section.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSections((current) =>
                          current.map((item) =>
                            item.id === section.id ? { ...item, enabled: !item.enabled } : item,
                          ),
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition ${
                        section.enabled ? 'bg-sage' : 'bg-slate-200'
                      }`}
                      aria-label={`${section.enabled ? 'Nonaktifkan' : 'Aktifkan'} ${section.label}`}
                    >
                      <span
                        className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
                          section.enabled ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/globals/wedding-settings"
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-medium transition hover:border-sage hover:text-sage"
              >
                Manage in CMS <DashIcon name="external" className="size-3.5" />
              </Link>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
