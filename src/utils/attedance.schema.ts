import { z } from 'zod'

export const attendanceFilterSchema = z.object({
  date: z.string().optional(),
  department_id: z.string().optional(),
})

export type AttendanceFilterValues = z.infer<typeof attendanceFilterSchema>