export interface Attendance {
  attendance_id: string
  id: number
  employee_id: string
  name: string
  department: string
  clock_in: string | null
  clock_out: string | null
  check_in_status: string
  check_out_status: string
}