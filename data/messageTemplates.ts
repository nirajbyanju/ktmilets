export type TemplateChannel = 'WhatsApp' | 'Email' | 'Internal' | 'WhatsApp/Email';

export interface MessageTemplate {
  id: string;
  name: string;
  whenToUse: string;
  message: string;
  channel: TemplateChannel;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'welcome-lead',
    name: 'Welcome Lead',
    whenToUse: 'New IELTS/PTE enquiry',
    message: 'Namaste! KTM Test Preparation Class ma welcome. IELTS/PTE ko barema help garnu parcha?',
    channel: 'WhatsApp',
  },
  {
    id: 'ask-missing-details',
    name: 'Ask Missing Details',
    whenToUse: 'Interested student',
    message:
      'Please send your full name, course, plan, preferred class time, and target score.',
    channel: 'WhatsApp',
  },
  {
    id: 'payment-qr',
    name: 'Payment QR',
    whenToUse: 'Student wants to pay',
    message:
      'Sure. Please send your full name, course, plan, and preferred time. Ma official QR/payment details pathaidinchhu. Payment garepachi screenshot pathaidinu hola.',
    channel: 'WhatsApp',
  },
  {
    id: 'screenshot-received',
    name: 'Screenshot Received',
    whenToUse: 'Student sends screenshot',
    message:
      'Thank you. I will forward this to admin for verification. Admin le verify गरेपछि seat confirm huncha.',
    channel: 'WhatsApp',
  },
  {
    id: 'payment-verified',
    name: 'Payment Verified',
    whenToUse: 'Admin verifies payment',
    message:
      'Your payment is verified and seat is confirmed. We will send your class details shortly.',
    channel: 'WhatsApp/Email',
  },
  {
    id: 'teacher-notification',
    name: 'Teacher Notification',
    whenToUse: 'Payment verified/enrolled',
    message:
      'New student enrolled. Please check CRM for name, course, plan, time, and contact details.',
    channel: 'WhatsApp/Email',
  },
  {
    id: 'reminder-1',
    name: 'Reminder 1',
    whenToUse: 'Pending docs/payment/info',
    message:
      'Gentle reminder: your document/payment/information is still pending. Please send it when possible.',
    channel: 'WhatsApp',
  },
  {
    id: 'reminder-stop',
    name: 'Reminder Stop',
    whenToUse: 'No response after 3 reminders',
    message: 'No response after 3 reminders. Follow-up stopped in CRM.',
    channel: 'Internal',
  },
  {
    id: 'exam-booking-details',
    name: 'Exam Booking Details',
    whenToUse: 'Exam booking enquiry',
    message:
      'For IELTS/PTE exam booking, please send passport copy, test type, passport name/number, DOB, email, preferred date/time/centre. For PTE, send login details if available.',
    channel: 'WhatsApp',
  },
  {
    id: 'mock-subscription',
    name: 'Mock Subscription',
    whenToUse: 'Mock test package',
    message:
      'Mock test practice package is NPR 1,500 for 1 month. After payment verification, login details will be sent to your email.',
    channel: 'WhatsApp',
  },
  {
    id: 'abroad-study-enquiry',
    name: 'Abroad Study Enquiry',
    whenToUse: 'Abroad study question',
    message:
      'For abroad study enquiries, please contact KTM office or WhatsApp +977 9851240326.',
    channel: 'WhatsApp',
  },
];

export const CHANNEL_COLORS: Record<TemplateChannel, { bg: string; text: string; border: string }> = {
  WhatsApp:         { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200' },
  Email:            { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200'    },
  Internal:         { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200'   },
  'WhatsApp/Email': { bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200'  },
};
