import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const RSVPs: CollectionConfig = {
  slug: 'rsvps',
  access: {
    create: () => true,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Wedding OS',
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'attendance', 'guestCount', 'approved', 'createdAt'],
  },
  fields: [
    {
      name: 'guest',
      type: 'relationship',
      relationTo: 'guests',
      required: true,
    },
    {
      name: 'guestName',
      type: 'text',
      required: true,
    },
    {
      name: 'attendance',
      type: 'select',
      required: true,
      options: [
        { label: 'Hadir', value: 'attending' },
        { label: 'Tidak hadir', value: 'declined' },
      ],
    },
    {
      name: 'guestCount',
      type: 'number',
      required: true,
      min: 1,
      max: 10,
    },
    {
      name: 'message',
      type: 'textarea',
      maxLength: 500,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      access: {
        create: () => false,
        update: ({ req }) => req.user?.collection === "admins",
      },
    },
  ],
}
