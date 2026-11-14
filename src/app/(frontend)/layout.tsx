import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Playfair_Display } from 'next/font/google'
import { BodyCustomCode, renderHeadCustomCode } from '@/lib/make-custom-code'
import { makeSiteSettings, sanitizeHtmlAttribute } from '@/lib/make-site-settings'
import './styles.css'

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const defaultTitle = 'Dina & Wira — #DIRAngkaiCerita'
const title = makeSiteSettings.title ?? defaultTitle
const description =
  makeSiteSettings.description ?? 'Undangan pernikahan Dina & Wira. Mari merangkai cerita bersama.'
const favicon = makeSiteSettings.icons?.icon
const googleAnalyticsId = sanitizeHtmlAttribute(makeSiteSettings.analytics?.googleAnalyticsId)

const siteUrl = 'https://dirangkai-cerita-dina.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  robots: { follow: false, index: false },
  icons: favicon ? { icon: favicon } : undefined,
  openGraph: {
    title,
    description,
    type: 'website',
    // Next.js akan otomatis menyuntikkan gambar dari file opengraph-image.jpg
  },
  twitter: {
    card: 'summary_large_image', // Tetap paksa format banner besar
    title,
    description,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const language = sanitizeHtmlAttribute(makeSiteSettings.language) || 'id'
  const addBypassLinks = makeSiteSettings.accessibility?.addBypassLinks === true
  const customScripts = makeSiteSettings.customScripts

  return (
    <html lang={language} className={`${serif.variable} ${sans.variable}`}>
      <head>
        {renderHeadCustomCode(customScripts?.headStart, 'head-start')}
        {renderHeadCustomCode(customScripts?.headEnd, 'head-end')}
      </head>
      <body className="min-h-screen bg-ivory text-charcoal antialiased">
        <BodyCustomCode html={customScripts?.bodyStart} />
        {addBypassLinks && (
          <a className="figma-bypass-link" href="#root">
            Skip to content
          </a>
        )}
        <div id="root" tabIndex={-1}>
          {children}
        </div>
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="figma-google-analytics" strategy="afterInteractive">
              {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(googleAnalyticsId)});
`}
            </Script>
          </>
        )}
        <BodyCustomCode html={customScripts?.bodyEnd} />
      </body>
    </html>
  )
}