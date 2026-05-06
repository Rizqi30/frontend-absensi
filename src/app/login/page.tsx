'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  rememberMe: z.boolean().optional()
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      })
      
      const token = res.data.access_token
      // Set cookie (kadaluarsa dalam 7 hari)
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
      
      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      if (e.response?.data?.message) {
        setErrorMessage(e.response.data.message)
      } else {
        setErrorMessage('Gagal masuk. Periksa kembali email dan password Anda.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 sm:p-6">
      {/* Form Login */}
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Selamat Datang 👋</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Masuk ke akun Anda untuk mengelola absensi dan aktivitas pekerjaan lainnya.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input 
                type="email"
                {...register('email')}
                placeholder="nama@perusahaan.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} text-slate-800 rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all text-sm`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} text-slate-800 rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
            ) : (
              <p className="text-slate-400 text-xs mt-1.5">Password must be at least 8 characters.</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" {...register('rememberMe')} className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>
              <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
            </label>

            <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Lupa Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Sedang Masuk...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer Form */}
        <div className="mt-8 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
