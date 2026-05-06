'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Loader2, User, IdCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  employeeId: z.string().min(1, 'NIP wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak cocok dengan konfirmasi',
  path: ['confirmPassword']
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      await api.post('/auth/register', {
        name: data.fullName,
        employee_id: data.employeeId,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword
      })
      
      // Registrasi berhasil, redirect ke login
      router.push('/login')
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      if (e.response?.data?.message) {
        setErrorMessage(e.response.data.message)
      } else {
        setErrorMessage('Gagal mendaftar. Periksa kembali data Anda.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 sm:p-6">
      {/* Form Register */}
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Buat Akun Baru 🚀</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Daftarkan diri Anda untuk mendapatkan akses ke Enterprise Absensi System.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Input Nama Lengkap */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input 
                type="text"
                {...register('fullName')}
                placeholder="Contoh: John Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.fullName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} text-slate-800 rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all text-sm`}
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fullName.message}</p>}
          </div>

          {/* Input NIP */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor Induk Pegawai (NIP)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IdCard size={18} />
              </div>
              <input 
                type="text"
                {...register('employeeId')}
                placeholder="Contoh: 12345678"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.employeeId ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} text-slate-800 rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all text-sm`}
              />
            </div>
            {errors.employeeId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.employeeId.message}</p>}
          </div>

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

          {/* Grid untuk Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
              ) : (
                <p className="text-slate-400 text-xs mt-1.5">Min. 8 karakter</p>
              )}
            </div>

            {/* Input Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} text-slate-800 rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <span>Daftar Sekarang</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer Form */}
        <div className="mt-8 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
