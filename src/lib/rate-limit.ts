import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import type { Payload } from 'payload'

type Rule = { action: string; limit: number; windowSeconds: number }

/** Sidik jari klien. Alamat IP tidak disimpan mentah. */
export async function clientFingerprint() {
  const h = await headers()
  const ip =
    h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  return createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${ip}`)
    .digest('hex')
    .slice(0, 32)
}

/** true = boleh lanjut, false = batas terlampaui. Bersifat pengaman lunak (tidak atomik). */
export async function checkRateLimit(payload: Payload, scope: string, rule: Rule) {
  const key = `${rule.action}:${scope}`
  const now = Date.now()

  const found = await payload.find({
    collection: 'rate-limits',
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = found.docs[0]
  const windowExpired =
    !doc || now - new Date(doc.windowStart).getTime() > rule.windowSeconds * 1000

  if (windowExpired) {
    const data = { key, count: 1, windowStart: new Date(now).toISOString() }
    if (doc) {
      await payload.update({ collection: 'rate-limits', id: doc.id, data, overrideAccess: true })
    } else {
      await payload.create({ collection: 'rate-limits', data, overrideAccess: true })
    }
    return true
  }

  if (doc.count >= rule.limit) return false

  await payload.update({
    collection: 'rate-limits',
    id: doc.id,
    data: { count: doc.count + 1 },
    overrideAccess: true,
  })
  return true
}