import type { CollectionConfig } from 'payload'

const noAccess = () => false

export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  access: {
    create: noAccess,
    update: noAccess,
    delete: ({ req }) => req.user?.collection === 'admins',
    read: ({ req }) => req.user?.collection === 'admins',
  },
  admin: { group: 'Sistem', useAsTitle: 'key' },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
    { name: 'windowStart', type: 'date', required: true },
  ],
}