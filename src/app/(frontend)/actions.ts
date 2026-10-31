'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export type RSVPState = {
  success: boolean
  message: string
}

export async function submitRSVP(
  _previousState: RSVPState,
  formData: FormData,
): Promise<RSVPState> {
  const guestId = String(formData.get('guestId') || '')
  const guestName = String(formData.get('guestName') || '').trim()
  const attendance = String(formData.get('attendance') || '')
  const guestCount = Number(formData.get('guestCount'))
  const message = String(formData.get('message') || '').trim()

  if (!guestId || !guestName || !['attending', 'declined'].includes(attendance)) {
    return { success: false, message: 'Mohon lengkapi konfirmasi kehadiran.' }
  }

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
    return { success: false, message: 'Jumlah tamu tidak valid.' }
  }

  if (message.length > 500) {
    return { success: false, message: 'Ucapan maksimal 500 karakter.' }
  }

  const payload = await getPayload({ config })
  const guest = await payload.findByID({
    collection: 'guests',
    id: guestId,
    overrideAccess: true,
  })

  if (!guest || guest.name !== guestName || guestCount > guest.maxGuests) {
    return { success: false, message: 'Data tamu tidak sesuai dengan undangan.' }
  }

  await payload.create({
    collection: 'rsvps',
    overrideAccess: false,
    data: {
      guest: guest.id,
      guestName: guest.name,
      attendance: attendance as 'attending' | 'declined',
      guestCount,
      message,
    },
  })

  return {
    success: true,
    message: 'Terima kasih. Konfirmasi dan ucapan Anda telah kami terima.',
  }
}
