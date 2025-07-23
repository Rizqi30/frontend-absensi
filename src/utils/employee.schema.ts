import { z } from 'zod'

export const employeeSchema = z.object({
  employee_id: z.string().min(1, 'NIP wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  departement_id: z.coerce.number().min(1, 'Departemen wajib dipilih')
})

export type EmployeeSchema = z.infer<typeof employeeSchema>