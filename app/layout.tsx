import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import AntiInspectGuard from "@/components/AntiInspectGuard";
import StructuredData from "@/components/StructuredData";

export const viewport: Viewport = {
  themeColor: "#EA2525",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://scholarship.idigitalstudies.com"),
  title: {
    default: "Digital Marketing Scholarship Test 2026 (DMST) | Institute of Digital Studies",
    template: "%s | IDS Scholarship Portal",
  },
  description:
    "Official 5-Minute Digital Marketing Scholarship Assessment (DMST) by Institute of Digital Studies (IDS). Qualify for Up to 70% Merit Scholarship on advanced digital marketing master programs in Noida & Delhi NCR.",
  keywords: [
    "digital marketing scholarship",
    "digital marketing scholarship test",
    "DMST scholarship test 2026",
    "institute of digital studies scholarship",
    "digital marketing assessment test",
    "digital marketing course scholarship Noida",
    "digital marketing entrance exam",
    "free digital marketing test with certificate",
    "SEO PPC scholarship exam Delhi NCR",
    "iDigital Studies scholarship portal",
  ],
  authors: [{ name: "Institute of Digital Studies", url: "https://idigitalstudies.com" }],
  creator: "Institute of Digital Studies",
  publisher: "Institute of Digital Studies",
  applicationName: "IDS Scholarship Portal",
  alternates: {
    canonical: "https://scholarship.idigitalstudies.com",
    languages: {
      "en-IN": "https://scholarship.idigitalstudies.com",
      "en-US": "https://scholarship.idigitalstudies.com",
    },
  },
  openGraph: {
    title: "Digital Marketing Scholarship Test 2026 - Up to 70% Scholarship | IDS",
    description:
      "Take the official 5-minute online aptitude assessment. Score eligible marks to qualify for up to 70% merit scholarship on master programs at Institute of Digital Studies.",
    url: "https://scholarship.idigitalstudies.com",
    siteName: "Institute of Digital Studies (IDS) Scholarship Portal",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://scholarship.idigitalstudies.com/og-image.png",
        secureUrl: "https://scholarship.idigitalstudies.com/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Digital Marketing Scholarship Test 2026 - Institute of Digital Studies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Marketing Scholarship Test (DMST 2026) | IDS",
    description:
      "Take the official 5-minute online assessment and qualify for Up to 70% Merit Scholarship on advanced master programs.",
    creator: "@idigitalstudies",
    images: ["https://scholarship.idigitalstudies.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/IDS_LOGO.svg",
    shortcut: "/IDS_LOGO.svg",
    apple: "/IDS_LOGO.svg",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
        <meta property="og:image" content="https://scholarship.idigitalstudies.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://scholarship.idigitalstudies.com/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col select-none font-sans">
        <AntiInspectGuard />
        {children}

        {/* Google Analytics 4 (GA4) Hook */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel (Facebook Ads) Hook */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
