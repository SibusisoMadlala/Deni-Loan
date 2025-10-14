# QuickLoan - NCR Compliant Loan Application System

A comprehensive loan application system built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Borrower Features
- **Homepage** with interactive loan calculator
- **Multi-step loan application** process:
  1. Personal Details (ID, contact info, POPIA consent)
  2. Work & Income (employer, salary, payday cycle)
  3. Banking Details (account info for disbursement)
  4. Document Upload (ID, bank statements, proof of residence)
  5. Credit Check (automated Experian-style assessment)
  6. Loan Agreement (NCR-compliant digital contract)
- **Borrower Dashboard** to track applications, view documents, and manage repayments
- Authentication (signup/login)

### Admin Features
- **Admin Dashboard** with application management
- View all loan applications with filtering
- Document verification system
- Approve/decline loans with reasons
- View applicant details and credit reports
- Collections management
- NCR compliance audit trail

## Tech Stack

- **Frontend**: React, TypeScript, React Router, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Server**: Hono (Edge Functions)
- **Database**: Key-Value Store
- **File Storage**: Supabase Storage (for documents)

## Test Accounts

### Create Admin Account
To test admin features, create an account and manually update your user metadata:

1. Sign up normally
2. Use the server endpoint to create an admin user, or use Supabase dashboard to update user_metadata.role to 'admin'

### Testing Flow

1. **Borrower Flow:**
   - Sign up as a borrower
   - Fill out the loan application (all 6 steps)
   - Upload required documents
   - View credit check results
   - Sign loan agreement
   - Access borrower dashboard

2. **Admin Flow:**
   - Login as admin
   - View all applications
   - Verify documents
   - Approve/decline applications
   - Track disbursements

## NCR Compliance Features

- ✅ POPIA consent collection
- ✅ Experian credit check integration (mocked)
- ✅ 3 months bank statement requirement
- ✅ Affordability assessment
- ✅ NCR-compliant loan agreement
- ✅ 5-day cooling-off period notice
- ✅ Clear disclosure of interest rates and fees
- ✅ Audit trail for all decisions

## Credit Check Logic

The system performs an automated affordability assessment:
- Minimum credit score: 550
- Minimum disposable income: R2000
- Maximum debt service ratio: 35% of income
- Loan amount: R500 - R4000
- Interest rate: 5% per month
- Admin fee: R50

## Document Requirements

### Required Documents
- South African ID (both sides)
- 3 months bank statements
- Proof of residence (utility bill, lease, or rates letter)

### Optional Documents
- Payslip (if bank statements don't clearly show income)

## API Routes

### Authentication
- `POST /signup` - Create new user account
- Uses Supabase Auth for login/logout

### Loan Application
- `POST /loan-application` - Create new application
- `GET /loan-application/:id` - Get application details
- `GET /my-applications` - Get user's applications
- `PATCH /loan-application/:id` - Update application

### Documents
- `POST /upload-document` - Upload document
- `GET /documents/:applicationId` - Get application documents

### Credit Check
- `POST /credit-check` - Perform credit assessment

### Admin
- `GET /admin/applications` - Get all applications (admin only)
- `POST /admin/verify-document` - Verify/reject document (admin only)
- `POST /admin/update-loan-status` - Approve/decline loan (admin only)
- `POST /admin/record-payment` - Record payment (admin only)
- `GET /payments/:applicationId` - Get payment history

## Security Features

- Protected routes with authentication
- Role-based access control (borrower/admin)
- Secure file storage with signed URLs
- Service role key kept server-side only
- User data isolation

## Future Enhancements

- Real Experian API integration
- Bank account verification via Stitch/Akiba
- Automated debit order collection
- SMS/Email notifications
- Payment gateway integration (Ozow, PayFast)
- Credit bureau reporting
- Early settlement calculator
- Arrears management system
- Automated reminders
- WhatsApp bot integration

## Development Notes

This is a prototype/demo application. For production use, you would need:
- Real credit bureau integration
- KYC/FICA compliance
- Payment gateway integration
- Email server configuration
- SMS gateway for OTP
- Additional security hardening
- Full NCR registration
- Legal review of loan agreements
- Proper encryption for sensitive data