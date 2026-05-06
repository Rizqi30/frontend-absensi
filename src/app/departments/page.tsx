'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { departmentSchema, DepartmentSchema } from '@/utils/departement.schema'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Department } from '@/types/department'
import { toast } from 'sonner'
import { useState } from 'react'
import { Pencil, Save, Trash2 } from 'lucide-react'

export default function DepartmentPage() {
  const queryClient = useQueryClient()

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments')
      return Array.isArray(res.data) ? res.data : []
    },
    refetchOnWindowFocus: false,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<Department | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DepartmentSchema>({
    resolver: zodResolver(departmentSchema)
  })

  const createOrUpdate = useMutation({
    mutationFn: async (data: DepartmentSchema) => {
      if (editData) {
        return api.put(`/departments/${editData.id}`, data)
      } else {
        return api.post('/departments', data)
      }
    },
    onSuccess: () => {
      toast.success(editData ? 'Departemen diperbarui' : 'Departemen ditambahkan')
      reset()
      setEditData(null)
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
    onError: () => {
      toast.error('Gagal menyimpan data')
    }
  })

  const onEdit = (dept: Department) => {
    setEditData(dept)

    const clockIn = dept.max_clock_in_time ? dept.max_clock_in_time.slice(0, 5) : ''
    const clockOut = dept.max_clock_out_time ? dept.max_clock_out_time.slice(0, 5) : ''

    setValue('departement_name', dept.departement_name)
    setValue('max_clock_in_time', clockIn)
    setValue('max_clock_out_time', clockOut)

    setModalOpen(true)
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      toast.success('Departemen dihapus')
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
    onError: () => {
      toast.error('Gagal menghapus')
    }
  })

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Departemen</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data dan jam kerja departemen.</p>
        </div>
        <button onClick={() => {
          setEditData(null)
          reset({ max_clock_in_time: '', max_clock_out_time: '' })
          setModalOpen(true)
        }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2">
          <span>+ Tambah Departemen</span>
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{editData ? 'Edit' : 'Tambah'} Departemen</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(data => createOrUpdate.mutate(data))} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Departemen</label>
                <input {...register('departement_name')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm" placeholder="Contoh: IT Support" />
                {errors.departement_name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.departement_name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Masuk</label>
                  <input type='time' {...register('max_clock_in_time')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm" />
                  {errors.max_clock_in_time && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.max_clock_in_time.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Pulang</label>
                  <input type='time' {...register('max_clock_out_time')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm" />
                  {errors.max_clock_out_time && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.max_clock_out_time.message}</p>}
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={createOrUpdate.isPending} className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                  <Save size={18} />
                  {createOrUpdate.isPending ? 'Menyimpan...' : 'Simpan Departemen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Departemen</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jam Masuk</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jam Pulang</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading data...</td></tr>
              ) : (departments ?? []).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Belum ada departemen.</td></tr>
              ) : (
                (departments ?? []).map((d, i) => (
                  <tr key={d.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{d.departement_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100/50">
                        {d.max_clock_in_time ? d.max_clock_in_time.slice(0, 5) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100/50">
                        {d.max_clock_out_time ? d.max_clock_out_time.slice(0, 5) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(d)}
                          className="p-2 bg-slate-50 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200 hover:border-blue-200"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Yakin hapus departemen ini?')) deleteMutation.mutate(d.id)
                          }}
                          className="p-2 bg-slate-50 text-rose-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
