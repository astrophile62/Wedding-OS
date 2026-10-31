import type { CollectionConfig } from 'payload'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Wedding OS',
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'role', 'order'],
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Bride', value: 'bride' },
        { label: 'Groom', value: 'groom' },
        { label: 'Story', value: 'story' },
        { label: 'Gallery', value: 'gallery' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
  ],
}
