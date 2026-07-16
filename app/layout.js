import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";
import AuthProvider from "@/components/providers/AuthProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata = {
  title: {
    template: "%s | SimuFlux Lab",
    default: "SimuFlux Lab | Engineering Training & Consultancy",
  },
  description:
    "SimuFlux Lab provides professional engineering training and consultancy in CFD, FEA, CAD, 3D modelling, and product design — empowering students, professionals, and industries with practical engineering solutions.",
  metadataBase: new URL("https://simufluxlab.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SimuFlux  Lab",
    description:
      "Professional engineering training and consultancy in CFD, FEA, CAD, 3D modelling, and product design.",
    url: "https://simufluxlab.com",
    siteName: "SimuFlux  Lab",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased bg-navy text-offwhite min-h-screen flex flex-col justify-between">
        <ErrorBoundary>
          <AuthProvider>
            <PublicShell>{children}</PublicShell>
          </AuthProvider>
        </ErrorBoundary>
        <Script 
          src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

