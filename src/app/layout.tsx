import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Resume Analyzer & Job Match Tool | ATS Resume Optimizer",
  description:
    "Upload your resume and instantly get AI-powered job matching, ATS scoring, keyword optimization, and personalized improvement suggestions. Optimize your resume for real job roles with smart career insights.",
  keywords: [
    "AI resume analyzer",
    "ATS resume checker",
    "resume job matching tool",
    "resume optimizer",
    "resume scoring AI",
    "job compatibility resume tool",
    "resume improvement assistant",
    "resume keyword analyzer",
    "career resume optimizer",
    "resume ATS checker",
  ],
  openGraph: {
    title: "AI Resume Analyzer & Job Match Tool",
    description:
      "Optimize your resume with AI job matching and ATS scoring.",
    type: "website",
    siteName: "ResumeMatchAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Resume Analyzer & Job Match Tool",
    description:
      "Optimize your resume with AI job matching and ATS scoring.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Public+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AI Resume Job Match Analyzer",
              applicationCategory: "Career Tool",
              operatingSystem: "Web",
              description:
                "AI-powered resume analyzer that checks ATS compatibility, job matching, and provides resume optimization suggestions.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}
