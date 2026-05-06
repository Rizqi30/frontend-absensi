import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { QueryProvider } from "@/lib/queryClient"
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Absensi App",
  description: "Aplikasi Absensi Karyawan",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
        <QueryProvider>
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  )
}