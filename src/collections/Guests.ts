import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { randomBytes } from 'node:crypto'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

// Tanpa karakter yang mudah tertukar (i, l, o, 0, 1)
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

function randomSuffix(length = 6) {
  const bytes = randomBytes(length)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

const generateSlug: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || !data) return data

  const typed = typeof data.slug === 'string' ? slugify(data.slug) : ''

  if (data.invitationType === 'group') {
    // Grup: tautan mudah dibaca. Akhiran acak hanya jika namanya sudah dipakai.
    const base = typed || slugify(String(data.name || '')) || 'undangan'
    const taken = await req.payload.find({
      collection: 'guests',
      where: { slug: { equals: base } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    data.slug = taken.totalDocs > 0 ? `${base}-${randomSuffix(4)}` : base
  } else {
    // Perorangan: nama + kode acak, supaya tidak bisa ditebak
    const base =
      slugify(
        [data.name, data.partnerName ? `dan ${data.partnerName}` : ''].filter(Boolean).join(' '),
      ) || 'tamu'
    data.slug = `${base}-${randomSuffix()}`
  }
  return data
}

export const Guests: CollectionConfig = {
  slug: 'guests',
  versions: false,
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Wedding OS',
    useAsTitle: 'name',
    defaultColumns: ['name', 'invitationType', 'slug', 'maxGuests', 'invitationStatus'],
  },
  hooks: {
    beforeValidate: [generateSlug],
  },
  fields: [
    {
      name: 'invitationType',
      type: 'select',
      required: true,
      defaultValue: 'personal',
      options: [
        { label: 'Perorangan / pasangan', value: 'personal' },
        { label: 'Grup (tautan dibagikan ke banyak orang)', value: 'group' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Nama tamu, atau nama grup (mis. "Grup Dhira Janitra"). Tampil di sapaan.' },
    },
    {
      name: 'partnerName',
      type: 'text',
      admin: {
        description: 'Nama pasangan. Kosongkan jika tidak ada.',
        condition: (data) => data?.invitationType !== 'group',
      },
    },
    {
      name: 'partnerLabel',
      type: 'text',
      defaultValue: '& Partner',
      admin: {
        description: 'Dipakai di sapaan hanya jika "Nama partner" kosong.',
        condition: (data) => data?.invitationType !== 'group',
      },
    },
    {
      name: 'maxGuests',
      type: 'number',
      required: true,
      defaultValue: 2,
      min: 1,
      max: 10,
      admin: {
        description:
          'Perorangan: jumlah maksimal tamu yang boleh hadir. Grup RSVP terbuka: maksimal per satu pengisian.',
      },
    },
    {
      name: 'maxResponses',
      type: 'number',
      defaultValue: 300,
      min: 1,
      max: 2000,
      admin: {
        description: 'Batas jumlah RSVP yang bisa masuk lewat tautan grup ini (pengaman dari spam).',
        condition: (data) => data?.invitationType === 'group',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      access: { update: () => false },
      admin: {
        description:
          'Boleh dikosongkan. Perorangan: nama + kode acak. Grup: nama yang mudah dibaca (bisa diketik sendiri, mis. "dhira-janitra"). Tidak bisa diubah setelah dibuat. Tautan: /invite/<slug>.',
      },
    },
    { name: 'contact', type: 'text' },
    {
      name: 'guestGroup',
      type: 'text',
      admin: { description: 'Kategori untuk pengelompokan di admin (mis. keluarga, kantor, kuliah).' },
    },
    {
      name: 'invitationStatus',
      type: 'select',
      required: true,
      defaultValue: 'sent',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Opened', value: 'opened' },
      ],
    },
  ],
}