# Booking System

A comprehensive booking system for scheduling meetings with automatic time slot management.

## Features

- **Dynamic Time Slots**: Automatically generates available time slots for the next 7 days
- **Operational Hours**: 7 AM to 7 PM with 12 PM - 1 PM lunch break
- **Real-time Updates**: Automatically removes past time slots and updates availability
- **Form Validation**: Complete client-side validation for all required fields
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Confirmation Flow**: Two-step booking process with review and confirmation

## File Structure

```
bookmeeting/
├── components/
│   ├── booking-form.tsx          # Main booking form with validation
│   ├── booking-schedule.tsx      # Available time slots display
│   └── booking-confirmation.tsx  # Booking review and confirmation
├── utils/
│   └── time-slots.ts            # Time slot generation and management logic
├── page.tsx                     # Main booking page component
└── README.md                    # This documentation
```

## Components

### BookingForm

- Collects user information (name, phone, email)
- Optional description field for meeting topics
- Date and time selection with validation
- Real-time form validation with error messages

### BookingSchedule

- Displays available time slots for the next 7 days
- Shows operational status (open/closed)
- Interactive slot selection
- Automatically updates every minute

### BookingConfirmation

- Reviews all booking details before confirmation
- Shows selected date, time, and contact information
- Edit and confirm actions
- Important notes and policies

## Time Slot Logic

The system automatically:

- Generates slots from 7 AM to 7 PM (excluding 12 PM - 1 PM lunch)
- Creates 1-hour time slots
- Removes past time slots for the current day
- Updates availability every minute
- Maintains a 7-day rolling window

## Usage

1. Navigate to `/bookmeeting`
2. Fill out the booking form with required information
3. Select an available date and time slot
4. Review your booking details
5. Confirm your appointment

## Customization

To modify operational hours or slot duration, update the constants in `utils/time-slots.ts`:

```typescript
// Change these values as needed
const START_HOUR = 7; // 7 AM
const END_HOUR = 19; // 7 PM
const LUNCH_START = 12; // 12 PM
const LUNCH_END = 13; // 1 PM
const SLOT_DURATION = 1; // 1 hour
```

## Future Enhancements

- Database integration for persistent bookings
- Email notifications
- Calendar integration
- Admin panel for managing bookings
- Recurring appointment options
- Payment integration
