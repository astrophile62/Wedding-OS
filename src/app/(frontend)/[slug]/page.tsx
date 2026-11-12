import WeddingExperience from './components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'

// Segarkan paling lama tiap 60 detik, supaya perubahan admin dan ucapan baru muncul
export const revalidate = 60

export default async function HomePage() {
  const { settings, gallery, messages } = await loadWeddingData()
  return <WeddingExperience settings={settings} gallery={gallery} messages={messages} guest={null} />
}