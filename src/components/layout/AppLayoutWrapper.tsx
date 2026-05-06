'use client'

import { usePathname } from 'next/navigation'
import { DashboardLayout } from './DashboardLayout'

const authRoutes = ['/login', '/register']

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
