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
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Departemen</h1>
        <button onClick={() => {
          setEditData(null)
          reset({
            max_clock_in_time: '',
            max_clock_out_time: ''
          })
          setModalOpen(true)
        }} className="bg-green-600 text-white px-4 py-2 rounded">
          Tambah
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center transition-opacity duration-300 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md px-6 py-6 relative border animate-slide-up">
                <button
                    onClick={() => setModalOpen(false)}
                    className="absolute right-4 top-4 text-gray-500 hover:text-black text-lg"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-6 text-gray-800">{editData ? 'Edit' : 'Tambah'} Departemen</h2>

                <form onSubmit={handleSubmit(data => createOrUpdate.mutate(data))} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-800">Nama Departemen</label>
                        <input {...register('departement_name')} className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full" />
                        {errors.departement_name && <p className="text-red-600 text-sm">{errors.departement_name.message}</p>}
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-gray-800">Jam Maksimal Masuk</label>
                        <input type='time' {...register('max_clock_in_time')} className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full" placeholder="09:00:00" />
                        {errors.max_clock_in_time && <p className="text-red-600 text-sm">{errors.max_clock_in_time.message}</p>}
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-gray-800">Jam Maksimal Pulang</label>
                        <input type='time' {...register('max_clock_out_time')} className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full" placeholder="17:00:00" />
                        {errors.max_clock_out_time && <p className="text-red-600 text-sm">{errors.max_clock_out_time.message}</p>}
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Save size={16} />
                        {createOrUpdate.isPending ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border mt-2 text-sm text-gray-800">
        <thead className="bg-gray-100">
            <tr>
            <th className="border px-2 py-2">No</th>
            <th className="border px-2 py-2">Nama</th>
            <th className="border px-2 py-2">Jam Maksimal Masuk</th>
            <th className="border px-2 py-2">Jam Maksimal Pulang</th>
            <th className="border px-2 py-2">Aksi</th>
            </tr>
        </thead>
        <tbody>
            {(departments ?? []).map((d, i) => (
                <tr key={d.id} className="bg-white hover:bg-gray-50 transition">
                    <td className="border px-2 py-2  text-center">{i + 1}</td>
                    <td className="border px-2 py-2">{d.departement_name}</td>
                    <td className="border px-2 py-2 text-center">{d.max_clock_in_time}</td>
                    <td className="border px-2 py-2 text-center">{d.max_clock_out_time}</td>
                    <td className="border px-2 py-2 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => onEdit(d)}
                                className="bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Yakin hapus?')) deleteMutation.mutate(d.id)
                                }}
                                className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
