import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const GuestMessages: CollectionConfig = {
  slug: 'guest-messages',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Wedding OS',
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'status', 'createdAt'],
  },
  fields: [
    { name: 'guest', type: 'relationship', relationTo: 'guests', index: true },
    { name: 'guestName', type: 'text', required: true, maxLength: 80 },
    { name: 'message', type: 'textarea', required: true, maxLength: 500 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Menunggu moderasi', value: 'pending' },
        { label: 'Tampil', value: 'approved' },
        { label: 'Disembunyikan', value: 'hidden' },
      ],
    },
  ],
}