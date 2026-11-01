'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'

export type RSVPState = {
  success: boolean
  message: string
}

export async function submitRSVP(
  _previousState: RSVPState,
  formData: FormData,
): Promise<RSVPState> {
  // Kolom "guestId" di form berisi slug undangan
  const slug = String(formData.get('guestId') || '').trim()
  const typedName = String(formData.get('guestName') || '').trim().replace(/\s+/g, ' ')
  const attendance = String(formData.get('attendance') || '')
  const requestedCount = Number(formData.get('guestCount'))
  const wish = String(formData.get('message') || '').trim()

  // Kolom jebakan untuk bot: manusia tidak melihatnya (perlu input tersembunyi bernama "website")
    if (String(formData.get('hp_catatan') || '').trim()) {
    return { success: true, message: 'Terima kasih.' }
  }

  if (!slug || !['attending', 'declined'].includes(attendance)) {
    return { success: false, message: 'Mohon lengkapi konfirmasi kehadiran.' }
  }
  if (wish.length > 500) {
    return { success: false, message: 'Ucapan maksimal 500 karakter.' }
  }

  try {
    const payload = await getPayload({ config })

    const found = await payload.find({
      collection: 'guests',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const guest = found.docs[0]
    if (!guest) {
      return { success: false, message: 'Undangan tidak ditemukan. Mohon buka tautan undangan Anda.' }
    }

    const isGroup = guest.invitationType === 'group'

    // Perorangan memakai nama dari data tamu. Grup memakai nama yang diketik pengunjung.
    let respondentName = guest.name
    if (isGroup) {
      if (typedName.length < 2 || typedName.length > 80) {
        return { success: false, message: 'Mohon isi nama Anda (2 sampai 80 karakter).' }
      }
      respondentName = typedName
    }

    const guestCount = attendance === 'declined' ? 0 : requestedCount
    if (
      attendance === 'attending' &&
      (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > guest.maxGuests)
    ) {
      return { success: false, message: `Jumlah tamu harus antara 1 dan ${guest.maxGuests}.` }
    }

    // Pencarian data lama: perorangan per tamu, grup per tamu + nama yang sama
    const sameRespondent: Where = isGroup
      ? { and: [{ guest: { equals: guest.id } }, { guestName: { equals: respondentName } }] }
      : { guest: { equals: guest.id } }

    const rsvpData = {
      guest: guest.id,
      guestName: respondentName,
      attendance: attendance as 'attending' | 'declined',
      guestCount,
    }

    const existingRsvp = await payload.find({
      collection: 'rsvps',
      where: sameRespondent,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existingRsvp.docs[0]) {
      await payload.update({
        collection: 'rsvps',
        id: existingRsvp.docs[0].id,
        data: rsvpData,
        overrideAccess: true,
      })
    } else {
      if (isGroup && guest.maxResponses) {
        const total = await payload.count({
          collection: 'rsvps',
          where: { guest: { equals: guest.id } },
          overrideAccess: true,
        })
        if (total.totalDocs >= guest.maxResponses) {
          return {
            success: false,
            message: 'Batas konfirmasi untuk undangan ini sudah penuh. Silakan hubungi mempelai.',
          }
        }
      }
      await payload.create({ collection: 'rsvps', data: rsvpData, overrideAccess: true })
    }

    if (wish) {
      const wishData = {
        guest: guest.id,
        guestName: respondentName,
        message: wish,
        status: 'pending' as const, // setiap ucapan baru atau diubah ditinjau ulang
      }
      const existingWish = await payload.find({
        collection: 'guest-messages',
        where: sameRespondent,
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existingWish.docs[0]) {
        await payload.update({
          collection: 'guest-messages',
          id: existingWish.docs[0].id,
          data: wishData,
          overrideAccess: true,
        })
      } else {
        await payload.create({ collection: 'guest-messages', data: wishData, overrideAccess: true })
      }
    }

    return {
      success: true,
      message: wish
        ? 'Terima kasih. Konfirmasi Anda telah kami terima, dan ucapan akan tampil setelah ditinjau.'
        : 'Terima kasih. Konfirmasi Anda telah kami terima.',
    }
  } catch (error) {
    console.error('submitRSVP gagal:', error)
    return { success: false, message: 'Terjadi kendala. Silakan coba lagi sebentar lagi.' }
  }
}