export type ChatFormType =
  | 'customer'
  | 'booking'
  | 'intake'
  | 'customer_profile'
  | 'body_metrics';

export interface CustomerProfileFormData {
  customer_name: string;
  height: string;
  weight: string;
  goal: string;
  health_note: string;
  note: string;
}

/** Thu thập đủ thông tin đặt lịch trong một bước (tên, SĐT, ngày giờ) */
export interface IntakeFormData {
  customer_name: string;
  phone: string;
  date: string;
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  form?: ChatFormType;
  formIntro?: string;
  formDisabled?: boolean;
  formCustomerName?: string;
  responseType?: 'text' | 'form_request' | 'booking_success' | 'customer_saved';
}

export interface CustomerFormData {
  customer_name: string;
  phone: string;
  goal: string;
  health_note: string;
  note: string;
}

export interface BookingFormData {
  customer_name: string;
  date: string;
  time: string;
  note: string;
}
