# Project Dependencies

## Core Dependencies

The following packages are used in this project:

### React & Router
- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing

### Supabase
- `@supabase/supabase-js` - Supabase client for auth, database, and storage

### UI Components (Shadcn/ui)
All UI components are pre-installed in `/components/ui`:
- alert, alert-dialog, badge, button, card, checkbox, dialog
- input, label, progress, select, slider, tabs, textarea
- sonner (toast notifications)

### Icons
- `lucide-react` - Icon library

### Styling
- `tailwindcss` - Utility-first CSS framework
- Custom CSS in `styles/globals.css`

## Server-side Dependencies (Deno)

The server runs on Deno and uses:
- `npm:hono` - Web framework
- `npm:hono/cors` - CORS middleware
- `npm:hono/logger` - Logging middleware
- `npm:@supabase/supabase-js@2.39.3` - Supabase client

## No Additional Installation Required

All dependencies are already configured in this environment. You don't need to run `npm install` or similar commands.

## Import Syntax

### Frontend (React)
```typescript
import { useState } from 'react'
import { Button } from './components/ui/button'
import { useAuth } from './hooks/useAuth'
import { loanService } from './services/loanService'
```

### Backend (Deno)
```typescript
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
```