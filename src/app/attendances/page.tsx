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
    const params = new URLSearchParams(values as Record<string, string>).toString()
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
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message || 'Gagal check-in')
    }
  }

  const handleCheckOut = async (attendance_id: string) => {
    try {
      await api.put(`/attendances/checkout/${attendance_id}`)
      toast.success('Check-out berhasil')
      fetchData(form.getValues())
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
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
    <div className="w-full flex flex-col gap-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <h1 className="text-xl font-bold text-slate-800">Manajemen Absensi</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola proses check-in/out dan pantau riwayat kehadiran harian karyawan.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-700">Aksi Absensi Cepat</h3>
          <p className="text-xs text-slate-500 mt-0.5">Lakukan check-in atau check-out manual untuk karyawan hari ini.</p>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIP</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Karyawan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departemen</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi Manual</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading data karyawan...</td></tr>
              ) : (
                employees.map((emp, i) => {
                  const att = getTodayAttendance(emp.employee_id)
                  const isCheckedIn = att?.clock_in
                  const isCheckedOut = att?.clock_out
                  return (
                    <tr key={emp.employee_id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{emp.employee_id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{emp.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/50">
                          {emp.department?.departement_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCheckedIn && (
                          <button
                            onClick={() => handleCheckIn(emp.employee_id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
                          >
                            Check-in
                          </button>
                        )}
                        {isCheckedIn && !isCheckedOut && (
                          <button
                            onClick={() => handleCheckOut(att.attendance_id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-amber-500/20 active:scale-95"
                          >
                            Check-out
                          </button>
                        )}
                        {isCheckedIn && isCheckedOut && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Selesai Hari Ini
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="font-semibold text-slate-700">Riwayat Kehadiran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter riwayat kehadiran berdasarkan tanggal dan departemen.</p>
          </div>
          
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(fetchData)} className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal</label>
                <input
                  type="date"
                  {...form.register('date')}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Departemen</label>
                <select
                  {...form.register('department_id')}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm min-w-[180px]"
                >
                  <option value="">Semua Departemen</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.departement_name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 active:scale-95 h-[38px]"
              >
                Terapkan Filter
              </button>
            </form>
          </FormProvider>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Karyawan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departemen</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Check-in</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-out</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Check-out</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-slate-50 rounded-full">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <p>Tidak ada riwayat absensi ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.department}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.clock_in ?? '-'}</td>
                    <td className="px-6 py-4">
                      {item.check_in_status ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                          ${item.check_in_status.toLowerCase() === 'ontime' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 
                            item.check_in_status.toLowerCase() === 'late' ? 'bg-rose-50 text-rose-700 border-rose-200/50' : 
                            'bg-slate-50 text-slate-700 border-slate-200/50'}`}
                        >
                          {item.check_in_status}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.clock_out ?? '-'}</td>
                    <td className="px-6 py-4">
                      {item.check_out_status ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                          ${item.check_out_status.toLowerCase() === 'ontime' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 
                            item.check_out_status.toLowerCase() === 'early leave' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 
                            'bg-slate-50 text-slate-700 border-slate-200/50'}`}
                        >
                          {item.check_out_status}
                        </span>
                      ) : '-'}
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
