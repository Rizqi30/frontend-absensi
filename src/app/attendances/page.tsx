'use client'

import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AttendanceFilterValues, attendanceFilterSchema } from '@/utils/attedance.schema'
import { Attendance } from '@/types/attendance'
import { Department } from '@/types/department'
import { Employee } from '@/types/employee'
import { api } from '@/lib/api'

export default function AttendancePage() {
  const form = useForm<AttendanceFilterValues>({
    resolver: zodResolver(attendanceFilterSchema),
    defaultValues: {
      date: '',
      department_id: '',
    },
  })

  const [data, setData] = useState<Attendance[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const fetchData = async (values: AttendanceFilterValues) => {
    const params = new URLSearchParams(values as any).toString()
    const res = await api.get(`/attendances?${params}`)
    setData(Array.isArray(res.data) ? res.data : [])
    }

    const fetchEmployees = async () => {
    const res = await api.get('/employees') // ❗ tanpa query filter
    setEmployees(Array.isArray(res.data) ? res.data : [])
    }

  const handleCheckIn = async (employee_id: string) => {
    try {
      await api.post('/attendances/checkin', { employee_id })
      toast.success('Check-in berhasil')
      fetchData(form.getValues())
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal check-in')
    }
  }

  const handleCheckOut = async (attendance_id: string) => {
    try {
      await api.put(`/attendances/checkout/${attendance_id}`)
      toast.success('Check-out berhasil')
      fetchData(form.getValues())
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal check-out')
    }
  }

  const getTodayAttendance = (employee_id: string) => {
    return data.find((a) => a.employee_id === employee_id)
  }

  useEffect(() => {
    api.get('/departments').then((res) => {
      setDepartments(Array.isArray(res.data) ? res.data : [])
    })
    fetchEmployees()
    fetchData({})
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Log Absensi Karyawan</h2>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Daftar Karyawan</h3>
        <table className="w-full border text-sm text-gray-800">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-2 py-2">No</th>
              <th className="border px-2 py-2">NIP</th>
              <th className="border px-2 py-2">Nama</th>
              <th className="border px-2 py-2">Departemen</th>
              <th className="border px-2 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => {
              const att = getTodayAttendance(emp.employee_id)
              const isCheckedIn = att?.clock_in
              const isCheckedOut = att?.clock_out

              return (
                <tr key={emp.employee_id}>
                  <td className="border px-2 py-2 text-center">{i + 1}</td>
                  <td className="border px-2 py-2">{emp.employee_id}</td>
                  <td className="border px-2 py-2">{emp.name}</td>
                  <td className="border px-2 py-2">{emp.department?.departement_name}</td>
                  <td className="border px-2 py-2 text-center">
                    {!isCheckedIn && (
                      <button
                        onClick={() => handleCheckIn(emp.employee_id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Check-in
                      </button>
                    )}

                    {isCheckedIn && !isCheckedOut && (
                      <button
                        onClick={() => handleCheckOut(att.attendance_id)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Check-out
                      </button>
                    )}

                    {isCheckedIn && isCheckedOut && (
                      <span className="text-gray-500 italic">Selesai</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(fetchData)}
          className="flex items-end gap-4 mb-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-800">Tanggal</label>
            <input
              type="date"
              {...form.register('date')}
              className="border border-gray-300 rounded px-2 py-1 text-gray-800 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800">Departemen</label>
            <select
              {...form.register('department_id')}
              className="border border-gray-400 text-gray-800 rounded px-3 py-2 w-full"
            >
              <option value="">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departement_name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Filter
          </button>
        </form>
      </FormProvider>

      <div className="overflow-auto">
        <table className="w-full border mt-2 text-sm text-gray-800">
          <thead className="bg-gray-100">
            <tr className="bg-gray-100 text-left">
              <th className="border px-2 py-2">No</th>
              <th className="border px-2 py-2">Nama</th>
              <th className="border px-2 py-2">Departemen</th>
              <th className="border px-2 py-2">Check-in</th>
              <th className="border px-2 py-2">Status</th>
              <th className="border px-2 py-2">Check-out</th>
              <th className="border px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Tidak ada data
                </td>
              </tr>
            )}
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-2 py-2 text-center">{i + 1}</td>
                <td className="border px-2 py-2">{item.name}</td>
                <td className="border px-2 py-2">{item.department}</td>
                <td className="border px-2 py-2">{item.clock_in ?? '-'}</td>
                <td className="border px-2 py-2">{item.check_in_status}</td>
                <td className="border px-2 py-2">{item.clock_out ?? '-'}</td>
                <td className="border px-2 py-2">{item.check_out_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
