import type { GlobalConfig } from 'payload'

export const WeddingSettings: GlobalConfig = {
  slug: 'wedding-settings',
  admin: {
    group: 'Wedding OS',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'brideName', type: 'text', required: true },
        { name: 'groomName', type: 'text', required: true },
      ],
    },
    { name: 'hashtag', type: 'text', required: true },
    { name: 'weddingDate', type: 'date', required: true },
    {
      name: 'verse',
      type: 'textarea',
      required: true,
    },
    {
      name: 'venue',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'address', type: 'textarea', required: true },
        { name: 'mapsUrl', type: 'text', required: true },
      ],
    },
    {
      name: 'people',
      type: 'group',
      fields: [
        { name: 'brideFullName', type: 'text', required: true },
        { name: 'brideParents', type: 'text', required: true },
        { name: 'groomFullName', type: 'text', required: true },
        { name: 'groomParents', type: 'text', required: true },
      ],
    },
    {
      name: 'loveStory',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'year', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'bankAccounts',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'bank', type: 'select', required: true, options: ['BNI', 'BSI', 'BCA', 'BRI'] },
        { name: 'accountNumber', type: 'text', required: true },
        { name: 'accountName', type: 'text', required: true },
      ],
    },
    {
      name: 'sectionOrder',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
