import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Guests: CollectionConfig = {
  slug: 'guests',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Wedding OS',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'invitationStatus', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'partnerLabel',
      type: 'text',
      defaultValue: '& Partner',
    },
    {
      name: 'maxGuests',
      type: 'number',
      required: true,
      defaultValue: 2,
      min: 1,
      max: 10,
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
