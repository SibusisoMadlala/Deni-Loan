# Testing Guide

## Quick Start Testing

### 1. Create Your First Borrower Account

1. Click "Sign Up" in the navigation
2. Fill in:
   - Full Name: John Doe
   - Phone: 0821234567
   - Email: john@example.com
   - Password: password123
3. Click "Create Account"
4. You'll be redirected to your dashboard

### 2. Apply for a Loan

1. Click "New Application" or navigate to "Apply Now"
2. Complete all 6 steps:

#### Step 1: Personal Details
- ID Number: 8001015009087 (use a valid SA ID format)
- Full Name: John Doe
- Phone: 0821234567
- Email: john@example.com
- ✅ Check both consent boxes

#### Step 2: Work & Income
- Employer: ABC Company (Pty) Ltd
- Payday Cycle: Monthly
- Net Salary: R5000 (minimum R2000)
- Requested Amount: R2000

#### Step 3: Banking Details
- Bank: Select any bank (e.g., Capitec Bank)
- Account Type: Cheque/Current Account
- Branch Code: 470010
- Account Number: 1234567890

#### Step 4: Upload Documents
- Upload any image/PDF for each required document
- Required: ID, Bank Statements, Proof of Residence
- Optional: Payslip

#### Step 5: Credit Check
- System will automatically perform credit check
- Mock credit score between 400-800
- Approval based on:
  - Credit score ≥ 550
  - Disposable income > R2000
  - Affordability calculation

#### Step 6: Loan Agreement
- Review loan terms
- Check "I agree" box
- Click "Sign Agreement"
- Wait for completion

### 3. View Your Dashboard

After completing the application:
- View loan status (Pending/Approved/Declined)
- See loan details
- Access documents
- Check repayment information

## Admin Testing

### 1. Create Admin Account

Run this in browser console (see CREATE_ADMIN.md for details):

```javascript
// Get values from your app
const projectId = 'YOUR_PROJECT_ID';
const publicAnonKey = 'YOUR_PUBLIC_KEY';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Admin User',
    phone: '0821234567',
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 2. Login as Admin

1. Logout if logged in
2. Click "Login"
3. Enter admin credentials:
   - Email: admin@example.com
   - Password: admin123
4. You'll be redirected to the Admin Dashboard

### 3. Review Applications

1. See all applications in the sidebar
2. Filter by status (All, Pending, Approved, Declined)
3. Click on an application to view details

### 4. Verify Documents

1. Select an application
2. Go to "Documents" tab
3. Click "View Document" to see uploaded files
4. Click "Approve" or "Reject" for each document

### 5. Make Loan Decision

1. Select a pending application
2. Go to "Decision" tab
3. Choose "Approve" or "Decline"
4. If approving:
   - Enter approved amount (R500-R4000)
5. If declining:
   - Enter reason for decline
6. Click "Submit Decision"

## Test Scenarios

### Scenario 1: Successful Approval
- Create borrower account
- Apply with:
  - Net Salary: R8000
  - Requested Amount: R2000
- Upload all documents
- Should be approved with good credit score
- Admin can view and approve

### Scenario 2: Low Income Decline
- Create borrower account
- Apply with:
  - Net Salary: R1500 (below minimum)
  - Requested Amount: R3000
- System should decline during credit check
- Reason: Insufficient disposable income

### Scenario 3: High Amount Request
- Create borrower account
- Apply with:
  - Net Salary: R5000
  - Requested Amount: R4000
- May be approved but with lower amount
- Based on 35% debt service ratio

### Scenario 4: Document Verification
- Admin reviews uploaded documents
- Verifies each document individually
- Can reject if documents are unclear/fake
- Application pending until documents verified

## Expected Behaviors

### Credit Check Results

**Approved if:**
- Credit score ≥ 550
- Disposable income > R2000
- Requested amount ≤ affordability limit

**Declined if:**
- Credit score < 550
- Insufficient income
- Debt service ratio too high

### Loan Calculation
- Interest: 5% per month
- Admin Fee: R50
- Example for R2000:
  - Principal: R2000
  - Interest: R100
  - Fee: R50
  - Total Due: R2150

### Document Requirements
**Required:**
- ✅ South African ID
- ✅ 3 months bank statements
- ✅ Proof of residence

**Optional:**
- Payslip

## Troubleshooting

### Can't login after signup
- Make sure email is correct
- Password must be at least 6 characters
- Check browser console for errors

### Application not showing in admin
- Refresh the page
- Check that application was created (check console logs)
- Ensure you're logged in as admin

### Documents not uploading
- File size should be reasonable (< 10MB)
- Supported formats: images (jpg, png) and PDF
- Check browser console for errors

### Credit check not working
- Ensure all required fields are filled
- Net salary must be > 0
- ID number should be 13 digits

## Testing Checklist

- [ ] Create borrower account
- [ ] Login as borrower
- [ ] Start loan application
- [ ] Complete all 6 steps
- [ ] Upload documents
- [ ] View credit check result
- [ ] Sign loan agreement
- [ ] View borrower dashboard
- [ ] Create admin account
- [ ] Login as admin
- [ ] View all applications
- [ ] Verify documents
- [ ] Approve/decline application
- [ ] Test different scenarios (approval, decline)

## Browser Console Tips

Open browser console (F12) to see:
- API request/response logs
- Error messages
- Server responses
- Authentication status

Useful console commands:
```javascript
// Check current user
console.log(localStorage.getItem('supabase.auth.token'))

// Clear auth and reload
localStorage.clear()
location.reload()
```