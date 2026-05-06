'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Pencil, Trash2, Save } from 'lucide-react'
import { employeeSchema, EmployeeSchema } from '@/utils/employee.schema'
import { Employee } from '@/types/employee'
import { Department } from '@/types/department'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function EmployeePage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<Employee | null>(null)

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
        const res = await api.get('/employees');
        return Array.isArray(res.data) ? res.data : []
    },
    refetchOnWindowFocus: false,
  })

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments')
      return Array.isArray(res.data) ? res.data : []
    },
    refetchOnWindowFocus: false,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeSchema>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeSchema) as any
  })

  const createOrUpdate = useMutation({
    mutationFn: async (data: EmployeeSchema) => {
      if (editData) {
        return api.put(`/employees/${editData.id}`, data)
      } else {
        return api.post('/employees', data)
      }
    },
    onSuccess: () => {
      toast.success(editData ? 'Karyawan diperbarui' : 'Karyawan ditambahkan')
      reset()
      setEditData(null)
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: () => toast.error('Gagal menyimpan karyawan')
  })

  const onEdit = (e: Employee) => {
    setEditData(e)
    setValue('employee_id', e.employee_id)
    setValue('name', e.name)
    setValue('address', e.address)
    setValue('departement_id', e.departement_id)
    setModalOpen(true)
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      toast.success('Karyawan dihapus')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: () => toast.error('Gagal menghapus karyawan')
  })

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Karyawan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data dan informasi karyawan.</p>
        </div>
        <button onClick={() => {
          setEditData(null)
          reset()
          setModalOpen(true)
        }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2">
          <span>+ Tambah Karyawan</span>
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{editData ? 'Edit' : 'Tambah'} Karyawan</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(data => createOrUpdate.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">NIP</label>
                <input {...register('employee_id')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm" placeholder="Contoh: 12345" />
                {errors.employee_id && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.employee_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input {...register('name')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm" placeholder="Contoh: John Doe" />
                {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat</label>
                <textarea {...register('address')} rows={3} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm" placeholder="Alamat lengkap..." />
                {errors.address && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.address.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departemen</label>
                <select {...register('departement_id')} defaultValue="" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm">
                  <option value="" disabled hidden>-- Pilih Departemen --</option>
                  {(departments ?? []).map((d: Department) => (
                    <option key={d.id} value={d.id}>{d.departement_name}</option>
                  ))}
                </select>
                {errors.departement_id && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.departement_id.message}</p>}
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={createOrUpdate.isPending} className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                  <Save size={18} />
                  {createOrUpdate.isPending ? 'Menyimpan...' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIP</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Karyawan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departemen</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(employees ?? []).length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Belum ada data karyawan.</td></tr>
              ) : (
                (employees ?? []).map((e, i) => (
                  <tr key={e.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{e.employee_id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{e.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate" title={e.address}>{e.address}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/50">
                        {e.department?.departement_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(e)}
                          className="p-2 bg-slate-50 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200 hover:border-blue-200"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Yakin hapus karyawan ini?')) deleteMutation.mutate(e.id)
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
