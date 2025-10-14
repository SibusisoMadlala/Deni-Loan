# System Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  - Homepage (loan calculator)                                │
│  - Multi-step loan application                               │
│  - Borrower dashboard                                        │
│  - Admin dashboard                                           │
│  - Authentication (login/signup)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS API Calls
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Server (Hono Edge Function)               │
│  - Authentication routes                                     │
│  - Loan application CRUD                                     │
│  - Document upload/retrieval                                 │
│  - Credit check (mock Experian)                              │
│  - Admin operations                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   Auth        │  │  Key-Value DB  │  │  File Storage │  │
│  │   (Users)     │  │  (Applications)│  │  (Documents)  │  │
│  └───────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
/
├── App.tsx                          # Main app with routing
├── hooks/
│   └── useAuth.ts                   # Authentication hook
├── services/
│   ├── loanService.ts               # Loan API calls
│   ├── documentService.ts           # Document API calls
│   └── adminService.ts              # Admin API calls
├── components/
│   ├── Navbar.tsx                   # Navigation bar
│   ├── ProtectedRoute.tsx           # Route guard
│   ├── HomePage.tsx                 # Landing page
│   ├── LoginPage.tsx                # Login form
│   ├── SignupPage.tsx               # Signup form
│   ├── LoanApplicationPage.tsx      # Multi-step form
│   ├── BorrowerDashboard.tsx        # Borrower portal
│   ├── AdminDashboard.tsx           # Admin portal
│   ├── application-steps/
│   │   ├── PersonalDetailsStep.tsx
│   │   ├── WorkIncomeStep.tsx
│   │   ├── BankingDetailsStep.tsx
│   │   ├── DocumentUploadStep.tsx
│   │   ├── CreditCheckStep.tsx
│   │   └── LoanAgreementStep.tsx
│   └── ui/                          # Shadcn components
├── supabase/functions/server/
│   ├── index.tsx                    # Server routes
│   └── kv_store.tsx                 # KV utilities (protected)
└── docs/
    ├── CREATE_ADMIN.md
    ├── TESTING_GUIDE.md
    ├── DEPENDENCIES.md
    └── SYSTEM_OVERVIEW.md
```

## Data Models

### User (Supabase Auth)
```typescript
{
  id: string
  email: string
  user_metadata: {
    fullName: string
    phone: string
    role: 'borrower' | 'admin'
  }
}
```

### Loan Application (KV Store)
```typescript
{
  id: string
  userId: string
  status: 'pending' | 'approved' | 'declined' | 'disbursed' | 'repaid'
  
  // Personal Details
  idNumber: string
  fullName: string
  phone: string
  email: string
  
  // Work & Income
  employerName: string
  paydayCycle: string
  netSalary: number
  
  // Banking Details
  bankName: string
  accountType: string
  branchCode: string
  accountNumber: string
  
  // Loan Details
  requestedAmount: number
  approvedAmount?: number
  
  // Credit Check
  creditScore?: number
  creditCheckPassed?: boolean
  declineReason?: string
  
  createdAt: string
  updatedAt: string
}
```

### Document (KV Store + Storage)
```typescript
{
  id: string
  userId: string
  applicationId: string
  documentType: 'id' | 'bank_statement' | 'proof_of_residence' | 'payslip'
  fileName: string
  filePath: string
  signedUrl?: string
  uploadedAt: string
  verified: boolean
  verificationNotes?: string
}
```

## User Flows

### Borrower Flow
1. **Sign Up** → Create account with personal details
2. **Apply** → Complete 6-step application
   - Personal details + consents
   - Work & income information
   - Banking details
   - Upload documents
   - Automated credit check
   - Sign loan agreement
3. **Dashboard** → View application status
4. **Repayments** → Manage loan repayments

### Admin Flow
1. **Login** → Access admin dashboard
2. **Review Applications** → View all submissions
3. **Verify Documents** → Check uploaded files
4. **Make Decision** → Approve or decline
5. **Monitor** → Track disbursements and collections

## Key Features

### NCR Compliance
- ✅ POPIA consent collection
- ✅ Experian affordability check (mocked)
- ✅ 3 months bank statements
- ✅ Transparent fee disclosure
- ✅ NCR-compliant agreement
- ✅ Cooling-off period notice
- ✅ Audit trail

### Security
- 🔒 JWT authentication
- 🔒 Role-based access control
- 🔒 Protected routes
- 🔒 Secure file storage with signed URLs
- 🔒 Service role key isolation
- 🔒 User data isolation

### Performance
- ⚡ Edge functions for low latency
- ⚡ Optimistic UI updates
- ⚡ Client-side routing
- ⚡ Lazy loading of documents

## API Endpoints

### Public Routes
- `POST /signup` - Create user account

### Protected Routes (Borrower)
- `POST /loan-application` - Create application
- `GET /loan-application/:id` - Get application
- `GET /my-applications` - List user applications
- `PATCH /loan-application/:id` - Update application
- `POST /upload-document` - Upload document
- `GET /documents/:applicationId` - List documents
- `POST /credit-check` - Run credit check
- `GET /payments/:applicationId` - View payments

### Admin Routes
- `GET /admin/applications` - List all applications
- `POST /admin/verify-document` - Verify document
- `POST /admin/update-loan-status` - Approve/decline
- `POST /admin/record-payment` - Record payment

## Environment Variables

The following are automatically provided by Supabase:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side key
- `SUPABASE_ANON_KEY` - Public client key

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| UI Components | Shadcn/ui |
| Icons | Lucide React |
| Backend | Hono (Edge Functions) |
| Database | Supabase KV Store |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Runtime | Deno (server-side) |

## Development Workflow

1. **Frontend Changes**
   - Edit React components
   - Changes auto-reload in browser

2. **Backend Changes**
   - Edit `/supabase/functions/server/index.tsx`
   - Server automatically restarts

3. **Add New Route**
   - Add route in server
   - Create frontend component
   - Add route in App.tsx
   - Update services if needed

4. **Add New Feature**
   - Plan data model
   - Create server endpoints
   - Create service functions
   - Build UI components
   - Connect with hooks

## Best Practices

### Code Organization
- Keep components focused and single-purpose
- Extract reusable logic into hooks
- Use services for API calls
- Type everything with TypeScript

### Security
- Never expose service role key to frontend
- Always validate user permissions on server
- Use signed URLs for private files
- Sanitize user inputs

### Performance
- Lazy load heavy components
- Optimize images
- Use React.memo for expensive renders
- Debounce search/filter inputs

### Error Handling
- Always catch API errors
- Show user-friendly error messages
- Log errors to console
- Handle edge cases gracefully