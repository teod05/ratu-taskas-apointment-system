// types/index.ts

export interface Worker {
  id: number;
  name: string;
}

export interface AppointmentWorker {
  worker_id: number;
  appointment_id: number;
  worker: Worker;
}

export interface Appointment {
  id: number;
  customer_name: string;
  customer_phone?: string;
  description: string;
  date: string;        // ISO date string
  start_time: string;  // ISO datetime string (time stored as UTC)
  duration: number;    // minutes
  created_at: string;
  workers: AppointmentWorker[];
}
