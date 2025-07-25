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