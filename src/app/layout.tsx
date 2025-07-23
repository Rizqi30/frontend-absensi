import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Toaster } from "sonner"
import { QueryProvider } from "@/lib/queryClient"

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
          <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r shadow-sm p-6 flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-gray-800">Absensi</h1>
              <nav className="flex flex-col gap-4 text-sm font-medium text-gray-700">
                <Link href="/departments" className="hover:text-blue-600">Departemen</Link>
                <Link href="/employees" className="hover:text-blue-600">Karyawan</Link>
                <Link href="/attendances" className="hover:text-blue-600">Absensi</Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-[#f9fafb] p-6 overflow-x-auto">
              {children}
            </main>
          </div>
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  )
}