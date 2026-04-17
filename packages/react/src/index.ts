export { ClndrProvider, useClndr } from './provider';
export type { ClndrProviderProps } from './provider';

export { useBookingPage, useAvailableSlots, useCreateBooking } from './hooks';

export { BookingForm } from './components';
export type { BookingFormProps, ComponentSlots, ClassNameMap } from './components';

export { BookingInline } from './inline';
export { BookingModal } from './modal';
export type { BookingModalProps } from './modal';

export type {
  BookingPage,
  BookingPageDetail,
  BookingQuestion,
  Booking,
  TimeSlot,
  UserProfile,
  CreateBookingInput,
} from '@clndr/sdk';
export { Clndr, ClndrError } from '@clndr/sdk';
