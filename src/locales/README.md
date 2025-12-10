# Translation Files Structure

This directory contains internationalization (i18n) files for the LINCE application in English (EN) and Portuguese (PT).

## File Organization

Translation files are organized into modular JSON files by feature area:

```
locales/
├── en/
│   ├── index.ts              # Combines all EN modules
│   ├── common.json           # Common UI elements (buttons, labels, etc.)
│   ├── navigation.json       # Navigation menu items
│   ├── auth.json            # Authentication/login
│   ├── dashboard.json       # Dashboard page
│   ├── systems.json         # Systems, monitoring points, checklists
│   ├── dailyLogs.json       # Daily logs module
│   ├── inspections.json     # Inspections module
│   ├── incidents.json       # Incidents module
│   ├── products.json        # Products and dosage
│   ├── reports.json         # Reports module
│   ├── users.json           # User management
│   ├── library.json         # Document library
│   ├── settings.json        # Settings page
│   ├── profile.json         # User profile
│   └── notifications.json   # Notifications and photo gallery
└── pt/
    └── [same structure as en/]
```

## Module Contents

- **common.json** - Shared UI text: buttons (save, cancel, delete), form labels, status messages
- **navigation.json** - Menu items and navigation links
- **auth.json** - Login page, authentication errors, password reset
- **dashboard.json** - Dashboard sections, statistics, welcome messages
- **systems.json** - Systems, monitoring points, checklist items (uses named exports)
- **dailyLogs.json** - Daily log entries, filters, forms (uses named export)
- **inspections.json** - Inspection status, filters, lists (uses named export)
- **incidents.json** - Incident tracking, severity levels, forms (uses named export)
- **products.json** - Product management, dosage information (uses named exports)
- **reports.json** - Report generation, filters, export options (uses named export)
- **users.json** - User roles, status, management forms (uses named export)
- **library.json** - Document categories, table columns, search (uses named export)
- **settings.json** - System parameters, units configuration (uses named export)
- **profile.json** - User profile info, password change (uses named export)
- **notifications.json** - Notifications, photo gallery (uses named exports)

## How It Works

Each language has an `index.ts` file that imports all JSON modules and exports a combined translation object:

```typescript
import common from './common.json';
import { systems, monitoringPoints } from './systems.json';
// ... other imports

export default {
  common,
  systems,
  monitoringPoints,
  // ... other exports
};
```

The main `i18n.ts` file imports these combined objects for use throughout the application.

## Adding New Translations

1. **Add to both EN and PT files** - Keep both languages synchronized
2. **Use nested objects** - Organize related keys into subsections
3. **Validate JSON** - Ensure proper syntax (no trailing commas, matching brackets)
4. **Use descriptive keys** - Make keys self-documenting (e.g., `users.form.nameRequired`)

### Example

```json
{
  "users": {
    "form": {
      "nameRequired": "Name is required",
      "emailInvalid": "Invalid email format"
    }
  }
}
```

## Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return <div>{t('common.save')}</div>;
};
```

## Current Status

✅ All translation keys are organized into logical modules
✅ Both EN and PT translations are complete and synchronized
✅ Build validates JSON structure automatically
✅ Structure is working well in production
