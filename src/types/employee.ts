export interface Employee {
  id: number
  employee_id: string
  name: string
  address: string
  departement_id: number
  created_at: string
  updated_at: string
  department?: {
    id: number
    departement_name: string
  }
}