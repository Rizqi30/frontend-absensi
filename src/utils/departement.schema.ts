import {z} from 'zod';

export const departmentSchema = z.object({
    departement_name: z.string().min(1, "Wajib diisi"),
    max_clock_in_time: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"),
    max_clock_out_time: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"),
})

export type DepartmentSchema = z.infer<typeof departmentSchema>;