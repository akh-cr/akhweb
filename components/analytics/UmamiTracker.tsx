"use client"

import Script from "next/script"

export function UmamiTracker() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_URL

  if (!websiteId || !scriptUrl) {
    return null
  }

  // Ensure scriptUrl points to the script file, or construct it if base url is given
  // However, simpler to just expect the full script url or defaulting to /script.js if usage is standard
  // Let's assume the user provides the base URL e.g. https://analytics.akhweb.cz
  // Standard umami script is at /script.js
  
  const src = scriptUrl.endsWith(".js") ? scriptUrl : `${scriptUrl}/script.js`

  return (
    <Script
      defer
      src={src}
      data-website-id={websiteId}
      data-domains="akhweb.cz,www.akhweb.cz,akhweb.netlify.app"
      strategy="afterInteractive"
    />
  )
}
