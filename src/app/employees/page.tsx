'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Pencil, Trash2, Save } from 'lucide-react'
import { employeeSchema, EmployeeSchema } from '@/utils/employee.schema'
import { Employee } from '@/types/employee'
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

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments')
      return Array.isArray(res.data) ? res.data : []
    },
    refetchOnWindowFocus: false,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeSchema>({
    resolver: zodResolver(employeeSchema)
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
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Karyawan</h1>
        <button onClick={() => {
          setEditData(null)
          reset()
          setModalOpen(true)
        }} className="bg-green-600 text-white px-4 py-2 rounded">
          Tambah
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md px-6 py-6 relative border animate-slide-up">
            <button onClick={() => setModalOpen(false)} className="absolute right-4 top-4 text-gray-500 hover:text-black text-lg">×</button>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">{editData ? 'Edit' : 'Tambah'} Karyawan</h2>

            <form onSubmit={handleSubmit(data => createOrUpdate.mutate(data))} className="space-y-4">
              <div>
                <label className="block font-medium mb-1 text-gray-800">NIP</label>
                <input {...register('employee_id')} className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full" />
                {errors.employee_id && <p className="text-red-600 text-sm">{errors.employee_id.message}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-800">Nama</label>
                <input {...register('name')} className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full" />
                {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-800">Alamat</label>
                <textarea {...register('address')} className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full" />
                {errors.address && <p className="text-red-600 text-sm">{errors.address.message}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-800">Departemen</label>
                <select {...register('departement_id')} defaultValue="" className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full">
                    <option value="" disabled hidden>-- Pilih Departemen --</option>
                    {(departments ?? []).map((d: any) => (
                    <option key={d.id} value={d.id}>{d.departement_name}</option>
                  ))}
                </select>
                {errors.departement_id && <p className="text-red-600 text-sm">{errors.departement_id.message}</p>}
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                <Save size={16} />
                {createOrUpdate.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border mt-4 text-sm text-gray-800">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-2">No</th>
            <th className="border px-2 py-2">NIP</th>
            <th className="border px-2 py-2">Nama</th>
            <th className="border px-2 py-2">Alamat</th>
            <th className="border px-2 py-2">Departemen</th>
            <th className="border px-2 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {(employees ?? []).map((e, i) => (
            <tr key={e.id} className="bg-white hover:bg-gray-50 transition">
              <td className="border px-2 py-2 text-center">{i + 1}</td>
              <td className="border px-2 py-2">{e.employee_id}</td>
              <td className="border px-2 py-2">{e.name}</td>
              <td className="border px-2 py-2">{e.address}</td>
              <td className="border px-2 py-2">{e.department?.departement_name}</td>
              <td className="border px-2 py-2 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onEdit(e)} className="bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => {
                    if (confirm('Yakin hapus?')) deleteMutation.mutate(e.id)
                  }} className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">
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
