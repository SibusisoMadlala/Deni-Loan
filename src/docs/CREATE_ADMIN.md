# Creating an Admin User

There are two ways to create an admin user for testing:

## Option 1: Using the Signup Endpoint (Recommended for Testing)

You can use the browser console or a tool like Postman/curl to create an admin user directly:

```javascript
// Run this in your browser console after the app loads
const projectId = 'YOUR_PROJECT_ID'; // Get from utils/supabase/info.tsx
const publicAnonKey = 'YOUR_PUBLIC_ANON_KEY'; // Get from utils/supabase/info.tsx

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
    role: 'admin'  // Important: Set role to 'admin'
  })
})
.then(res => res.json())
.then(data => console.log('Admin user created:', data))
.catch(err => console.error('Error:', err));
```

Then login with:
- Email: admin@example.com
- Password: admin123

## Option 2: Update Existing User via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Find your user account
4. Click on the user to edit
5. Scroll to **User Metadata** section
6. Add or update the JSON to include:
   ```json
   {
     "fullName": "Your Name",
     "phone": "0821234567",
     "role": "admin"
   }
   ```
7. Save changes
8. Log out and log back in

## Testing Admin Features

Once you have an admin account:

1. Login with admin credentials
2. You'll be redirected to `/admin` dashboard
3. You can:
   - View all loan applications
   - Verify uploaded documents
   - Approve or decline applications
   - View credit reports
   - Manage collections

## Creating Test Borrower Accounts

For testing the full flow, create regular borrower accounts:

1. Sign up normally through the app
2. These will automatically have `role: 'borrower'`
3. Complete loan applications
4. View them from the admin dashboard