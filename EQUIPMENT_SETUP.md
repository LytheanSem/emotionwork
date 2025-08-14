# Equipment Management System Setup

## Overview

This system allows administrators to manage equipment inventory for the concert and events company through Payload CMS, and displays the equipment on the frontend equipment page.

## Features

- **Equipment Collection**: Store equipment with name, brand, quantity, category, image, and specifications
- **Category Management**: Organize equipment by categories (already implemented)
- **Image Upload**: Support for equipment images through Payload Media collection
- **Status Tracking**: Track equipment availability (Available, In Use, Maintenance, Out of Service)
- **Frontend Display**: Responsive grid layout with category filtering

## Setup Instructions

### 1. Database Setup

Make sure your MongoDB connection is properly configured in your environment variables:

```env
DATABASE_URI=your_mongodb_connection_string
PAYLOAD_SECRET=your_payload_secret
```

### 2. Generate Types

After making changes to collections, regenerate Payload types:

```bash
npm run generate:types
```

### 3. Admin Panel Access

1. Start your development server: `npm run dev`
2. Navigate to `/admin` to access the Payload admin panel
3. Create an admin user if you haven't already

### 4. Adding Equipment

1. In the admin panel, go to "Equipment" collection
2. Click "Create New" to add new equipment
3. Fill in the required fields:
   - **Name**: Equipment name (e.g., "Moving Head Beam 330")
   - **Brand**: Manufacturer (e.g., "LQE") - Optional
   - **Quantity**: Available quantity (e.g., 50)
   - **Category**: Select from existing categories
   - **Image**: Upload equipment photo (Optional)
   - **Description**: Equipment description (Optional)
   - **Specifications**: Power, dimensions, weight (Optional)
   - **Status**: Equipment availability status

### 5. Equipment Categories

Based on your images, consider creating these main categories:

- **Lighting Consoles**: GrandMA, Lighting Console 2048, etc.
- **Moving Heads**: Moving Head Beam 330, Moving Head Beam 380, etc.
- **LED Lights**: Matrix LED Light, LED Motor Light, etc.
- **Staging Equipment**: Truss, Ringlock, Barricades, etc.
- **Effects**: Smoke Machines, Haze Machines, CO2 Jets, etc.

## Frontend Features

### Equipment Page (`/equipment`)

- Displays all equipment in a responsive grid
- Category filtering buttons
- Equipment count display
- Responsive design for mobile and desktop

### Equipment Cards

Each equipment card shows:

- Equipment image (or placeholder)
- Name and brand
- Category badge
- Quantity and power specifications
- Status indicator
- Description (if available)

## File Structure

```
src/
├── collections/
│   └── Equipment.ts          # Equipment collection definition
├── components/
│   ├── equipment-card.tsx    # Individual equipment display
│   └── equipment-grid.tsx    # Equipment grid with filtering
├── modules/
│   └── equipment/
│       ├── types.ts          # TypeScript types
│       └── server/
│           └── procedures.ts # tRPC procedures
└── app/(app)/(home)/equipment/
    ├── page.tsx              # Equipment page component
    └── layout.tsx            # Equipment page layout
```

## Customization

### Adding New Fields

To add new equipment fields:

1. Update the `Equipment.ts` collection
2. Regenerate types: `npm run generate:types`
3. Update the `EquipmentCard` component to display new fields

### Styling

The equipment cards use Tailwind CSS classes and can be customized in:

- `src/components/equipment-card.tsx`
- `src/components/equipment-grid.tsx`

### Filtering

Additional filtering options can be added to the `EquipmentGrid` component by:

1. Adding new filter state variables
2. Creating filter UI components
3. Updating the filtering logic

## Troubleshooting

### Build Errors

- Ensure all TypeScript types are correct
- Run `npm run generate:types` after collection changes
- Check for unused imports and variables

### Database Issues

- Verify MongoDB connection string
- Check IP whitelist for MongoDB Atlas
- Ensure database user has proper permissions

### Image Issues

- Check that Media collection is properly configured
- Verify image upload permissions
- Ensure placeholder image exists at `/public/placeholder-equipment.svg`
