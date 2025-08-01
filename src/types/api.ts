export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  full_name: string;
  email: string;
  professional_title: string;
  phone: string;
  specialty: string;
  professional_license: string;
  cpf_nif: string;
  office_address: string;
  image_url?: string;
}

export interface ClientPayload {
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  cpf_nif?: string;
  emergency_contact?: string;
  case_summary?: string;
  status: 'Active' | 'Inactive';
}

export interface AddSessionPayload {
  client_ids: number[];
  start_time: string; // ISO string
  duration_min: number;
  focus_topic: string;
  session_notes: string;
  type: string; // ex: 'Online', 'Presencial'
  meeting_url?: string;
  payment_status: string; // ex: 'Paid', 'Pending'
  payment_method?: string;
  price: number;
  session_status: string; // ex: 'Completed', 'Scheduled'
}

export interface UpdateSessionPayload {
  client_ids: number[];
  start_time: string; // ISO string
  duration_min: number;
  focus_topic: string;
  session_notes: string;
  type: string; // ex: 'Online', 'Presencial'
  meeting_url?: string;
  payment_status: string; // ex: 'Paid', 'Pending'
  payment_method?: string;
  price: number;
  session_status: string; // ex: 'Completed', 'Scheduled'
}