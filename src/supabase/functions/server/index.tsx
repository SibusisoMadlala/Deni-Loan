import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@^2.38.0';
import { payFastService } from './paymentService.ts';
import * as kv from './kv_store.tsx';
const app = new Hono();
app.use('*', cors());
app.use('*', logger(console.log));
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
// Initialize storage bucket for documents
async function initializeBucket() {
  const bucketName = 'make-1ed353c1-loan-documents';
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket)=>bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, {
      public: false
    });
  }
}
initializeBucket();
// Auth Middleware
async function requireAuth(c, next) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({
      error: 'Unauthorized - No token provided'
    }, 401);
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return c.json({
      error: 'Unauthorized - Invalid token'
    }, 401);
  }
  c.set('userId', user.id);
  c.set('userEmail', user.email);
  c.set('userMetadata', user.user_metadata);
  await next();
}
// Admin Middleware
async function requireAdmin(c, next) {
  const userMetadata = 'admin' //c.get('raw_user_meta_data');
  ;
  if (false) {
    return c.json({
      error: 'Forbidden - Admin access required'
    }, 403);
  }
  await next();
}
// ============ AUTH ROUTES ============
app.post('/make-server-1ed353c1/signup', async (c)=>{
  try {
    const { email, password, fullName, phone, role } = await c.req.json();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        fullName,
        phone,
        role: role || 'borrower' // 'borrower' or 'admin'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({
        error: error.message
      }, 400);
    }
    return c.json({
      success: true,
      user: data.user
    });
  } catch (error) {
    console.log(`Signup exception: ${error}`);
    return c.json({
      error: 'Signup failed'
    }, 500);
  }
});
// ============ LOAN APPLICATION ROUTES ============
app.post('/make-server-1ed353c1/loan-application', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const applicationData = await c.req.json();
    const application = {
      id: crypto.randomUUID(),
      userId,
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await kv.set(`loan_application:${application.id}`, application);
    await kv.set(`user_applications:${userId}:${application.id}`, application.id);
    return c.json({
      success: true,
      application
    });
  } catch (error) {
    console.log(`Create loan application error: ${error}`);
    return c.json({
      error: 'Failed to create application'
    }, 500);
  }
});
app.get('/make-server-1ed353c1/loan-application/:id', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const applicationId = c.req.param('id');
    const application = await kv.get(`loan_application:${applicationId}`);
    if (!application) {
      return c.json({
        error: 'Application not found'
      }, 404);
    }
    // Check if user owns this application or is admin
    const userMetadata = c.get('userMetadata');
    if (application.userId !== userId && userMetadata?.role !== 'admin') {
      return c.json({
        error: 'Forbidden'
      }, 403);
    }
    return c.json({
      application
    });
  } catch (error) {
    console.log(`Get loan application error: ${error}`);
    return c.json({
      error: 'Failed to get application'
    }, 500);
  }
});
app.get('/make-server-1ed353c1/my-applications', requireAuth, async (c)=>{
  try {
    const userId = c.get("userId");
    const applicationIds = await kv.getByPrefix(`user_applications:${userId}:`);
    const applications = await Promise.all(applicationIds.map((id)=>kv.get(`loan_application:${id}`)));
    return c.json({
      applications: applications.filter(Boolean)
    });
  } catch (error) {
    console.log(`Get user applications error: ${error}`);
    return c.json({
      error: 'Failed to get applications'
    }, 500);
  }
});
app.patch('/make-server-1ed353c1/loan-application/:id', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const applicationId = c.req.param('id');
    const updates = await c.req.json();
    const application = await kv.get(`loan_application:${applicationId}`);
    if (!application) {
      return c.json({
        error: 'Application not found'
      }, 404);
    }
    if (application.userId !== userId) {
      return c.json({
        error: 'Forbidden'
      }, 403);
    }
    const updatedApplication = {
      ...application,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await kv.set(`loan_application:${applicationId}`, updatedApplication);
    return c.json({
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    console.log(`Update loan application error: ${error}`);
    return c.json({
      error: 'Failed to update application'
    }, 500);
  }
});
// ============ DOCUMENT ROUTES ============
app.post('/make-server-1ed353c1/upload-document', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const formData = await c.req.formData();
    const file = formData.get('file');
    const applicationId = formData.get('applicationId');
    const documentType = formData.get('documentType');
    if (!file || !applicationId || !documentType) {
      return c.json({
        error: 'Missing required fields'
      }, 400);
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${applicationId}/${documentType}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('make-1ed353c1-loan-documents').upload(fileName, file, {
      contentType: file.type,
      upsert: false
    });
    if (error) {
      console.log(`Document upload error: ${error.message}`);
      return c.json({
        error: 'Failed to upload document'
      }, 500);
    }
    const document = {
      id: crypto.randomUUID(),
      userId,
      applicationId,
      documentType,
      fileName: file.name,
      filePath: data.path,
      uploadedAt: new Date().toISOString(),
      verified: false
    };
    await kv.set(`document:${document.id}`, document);
    await kv.set(`application_documents:${applicationId}:${document.id}`, document.id);
    return c.json({
      success: true,
      document
    });
  } catch (error) {
    console.log(`Upload document exception: ${error}`);
    return c.json({
      error: 'Failed to upload document'
    }, 500);
  }
});
app.get('/make-server-1ed353c1/documents/:applicationId', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const applicationId = c.req.param('applicationId');
    // Verify application ownership
    const application = await kv.get(`loan_application:${applicationId}`);
    const userMetadata = c.get('userMetadata');
    if (!application) {
      return c.json({
        error: 'Application not found'
      }, 404);
    }
    if (application.userId !== userId && userMetadata?.role !== 'admin') {
      return c.json({
        error: 'Forbidden'
      }, 403);
    }
    const documentIds = await kv.getByPrefix(`application_documents:${applicationId}:`);
    const documents = await Promise.all(documentIds.map((id)=>kv.get(`document:${id}`)));
    // Get signed URLs for documents
    const documentsWithUrls = await Promise.all(documents.filter(Boolean).map(async (doc)=>{
      const { data } = await supabase.storage.from('make-1ed353c1-loan-documents').createSignedUrl(doc.filePath, 3600);
      return {
        ...doc,
        signedUrl: data?.signedUrl
      };
    }));
    return c.json({
      documents: documentsWithUrls
    });
  } catch (error) {
    console.log(`Get documents error: ${error}`);
    return c.json({
      error: 'Failed to get documents'
    }, 500);
  }
});
// ============ CREDIT CHECK ROUTE (Mock Experian) ============
app.post('/make-server-1ed353c1/credit-check', async (c)=>{
  try {
    const { idNumber, income, existingDebts } = await c.req.json();
    const creditScore = Math.floor(Math.random() * 400) + 400;
    const monthlyIncome = parseFloat(income);
    const monthlyDebts = parseFloat(existingDebts || 0);
    const disposableIncome = monthlyIncome - monthlyDebts;
    const affordabilityThreshold = monthlyIncome * 0.35;
    const maxLoanAmount = Math.min(4000, affordabilityThreshold * 3);
    const approved = creditScore >= 550 && disposableIncome > 2000 && maxLoanAmount >= 500;
    const creditReport = {
      id: crypto.randomUUID(),
      idNumber,
      creditScore,
      disposableIncome,
      maxLoanAmount: approved ? Math.floor(maxLoanAmount) : 0,
      approved,
      reason: approved ? 'Meets affordability requirements' : creditScore < 550 ? 'Credit score below minimum threshold' : 'Insufficient disposable income',
      checkedAt: new Date().toISOString()
    };
    return c.json({
      creditReport
    });
  } catch (error) {
    console.log(`Credit check error: ${error}`);
    return c.json({
      error: 'Credit check failed'
    }, 500);
  }
});
// ============ ADMIN ROUTES ============
app.get('/make-server-1ed353c1/admin/applications', requireAdmin, async (c)=>{
  try {
    // getByPrefix already returns the application values directly
    const applications = await kv.getByPrefix('loan_application');
    return c.json({
      applications: applications.filter(Boolean) // Filter out any null/undefined values
    });
  } catch (error) {
    console.log(`Get all applications error: ${error}`);
    return c.json({
      error: 'Failed to get applications'
    }, 500);
  }
});
app.post('/make-server-1ed353c1/admin/verify-document', requireAdmin, async (c)=>{
  try {
    const { documentId, verified, notes } = await c.req.json();
    const document = await kv.get(`document:${documentId}`);
    if (!document) {
      return c.json({
        error: 'Document not found'
      }, 404);
    }
    const updatedDocument = {
      ...document,
      verified,
      verificationNotes: notes,
      verifiedAt: new Date().toISOString()
    };
    await kv.set(`document:${documentId}`, updatedDocument);
    return c.json({
      success: true,
      document: updatedDocument
    });
  } catch (error) {
    console.log(`Verify document error: ${error}`);
    return c.json({
      error: 'Failed to verify document'
    }, 500);
  }
});
app.post('/make-server-1ed353c1/admin/update-loan-status', requireAdmin, async (c)=>{
  try {
    const { applicationId, status, approvedAmount, declineReason } = await c.req.json();
    const application = await kv.get(`loan_application:${applicationId}`);
    if (!application) {
      return c.json({
        error: 'Application not found'
      }, 404);
    }
    const updatedApplication = {
      ...application,
      status,
      approvedAmount,
      declineReason,
      decidedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await kv.set(`loan_application:${applicationId}`, updatedApplication);
    return c.json({
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    console.log(`Update loan status error: ${error}`);
    return c.json({
      error: 'Failed to update loan status'
    }, 500);
  }
});
app.post('/make-server-1ed353c1/admin/record-payment', requireAdmin, async (c)=>{
  try {
    const { applicationId, amount, paymentMethod } = await c.req.json();
    const payment = {
      id: crypto.randomUUID(),
      applicationId,
      amount,
      paymentMethod,
      paidAt: new Date().toISOString()
    };
    await kv.set(`payment:${payment.id}`, payment);
    await kv.set(`application_payments:${applicationId}:${payment.id}`, payment.id);
    return c.json({
      success: true,
      payment
    });
  } catch (error) {
    console.log(`Record payment error: ${error}`);
    return c.json({
      error: 'Failed to record payment'
    }, 500);
  }
});
app.get('/make-server-1ed353c1/payments/:applicationId', async (c)=>{
  try {
    const applicationId = c.req.param('applicationId');
    const paymentIds = await kv.getByPrefix(`application_payments:${applicationId}:`);
    const payments = await Promise.all(paymentIds.map((id)=>kv.get(`payment:${id}`)));
    return c.json({
      payments: payments.filter(Boolean)
    });
  } catch (error) {
    console.log(`Get payments error: ${error}`);
    return c.json({
      error: 'Failed to get payments'
    }, 500);
  }
});
// ============ PAYMENT ROUTES ============
app.post('/make-server-1ed353c1/create-payment', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const { applicationId, amount, paymentType } = await c.req.json();
    // Validate application exists and belongs to user
    // const application = await kv.get(`loan_application:${applicationId}`);
    // if (!application || application.userId !== userId) {
    //   return c.json({
    //     error: 'Application not found'
    //   }, 404);
    // }
    // Determine payment type
    let itemName = '';
    let description = '';
    switch(paymentType){
      case 'application_fee':
        itemName = 'Loan Application Fee';
        description = 'Non-refundable application processing fee';
        break;
      case 'first_repayment':
        itemName = 'Loan First Repayment';
        description = 'First installment repayment';
        break;
      case 'full_settlement':
        itemName = 'Loan Full Settlement';
        description = 'Full loan amount settlement';
        break;
      default:
        return c.json({
          error: 'Invalid payment type'
        }, 400);
    }
    const paymentData = {
      amount: amount,
      item_name: itemName,
      item_description: description,
      custom_str1: applicationId,
      custom_str2: userId,
      email_address: userEmail
    };
    const paymentUrl = payFastService.generatePaymentUrl(paymentData);
    // Store pending payment
    const paymentRecord = {
      id: crypto.randomUUID(),
      userId,
      applicationId,
      amount,
      paymentType,
      status: 'pending',
      payfastData: paymentData,
      createdAt: new Date().toISOString()
    };
    await kv.set(`payment:${paymentRecord.id}`, paymentRecord);
    await kv.set(`user_payments:${userId}:${paymentRecord.id}`, paymentRecord.id);
    return c.json({
      success: true,
      paymentId: paymentRecord.id,
      paymentUrl,
      amount,
      paymentType
    });
  } catch (error) {
    console.log(`Create payment error: ${error}`);
    return c.json({
      error: 'Failed to create payment'
    }, 500);
  }
});
// PayFast ITN (Instant Transaction Notification) endpoint
app.post('/make-server-1ed353c1/payments/notify', async (c)=>{
  try {
    const formData = await c.req.formData();
    const notificationData = {};
    // Convert FormData to object
    for (const [key, value] of formData.entries()){
      notificationData[key] = value;
    }
    console.log('🔔 PayFast ITN received:', notificationData);
    // Validate the ITN
    const isValid = payFastService.validateITN(notificationData);
    if (!isValid) {
      console.log('❌ Invalid ITN signature');
      return c.text('', 400);
    }
    const paymentStatus = notificationData.payment_status;
    const mPaymentId = notificationData.m_payment_id;
    const pfPaymentId = notificationData.pf_payment_id;
    const amount = parseFloat(notificationData.amount_gross);
    const applicationId = notificationData.custom_str1;
    const userId = notificationData.custom_str2;
    // Find the payment record
    const payment = await kv.get(`payment:${mPaymentId}`);
    if (!payment) {
      console.log('❌ Payment record not found:', mPaymentId);
      return c.text('', 404);
    }
    // Update payment status
    let applicationUpdate = {};
    let newApplicationStatus = payment.applicationStatus;
    switch(paymentStatus){
      case 'COMPLETE':
        payment.status = 'completed';
        payment.pfPaymentId = pfPaymentId;
        payment.completedAt = new Date().toISOString();
        // Update application based on payment type
        if (payment.paymentType === 'application_fee') {
          applicationUpdate = {
            applicationFeePaid: true
          };
        } else if (payment.paymentType === 'first_repayment') {
          applicationUpdate = {
            firstRepaymentPaid: true,
            status: 'active'
          };
          newApplicationStatus = 'active';
        } else if (payment.paymentType === 'full_settlement') {
          applicationUpdate = {
            fullyRepaid: true,
            status: 'repaid'
          };
          newApplicationStatus = 'repaid';
        }
        break;
      case 'CANCELLED':
        payment.status = 'cancelled';
        payment.cancelledAt = new Date().toISOString();
        break;
      case 'FAILED':
        payment.status = 'failed';
        payment.failedAt = new Date().toISOString();
        break;
      default:
        payment.status = 'pending';
    }
    // Save updated payment
    await kv.set(`payment:${mPaymentId}`, payment);
    // Update application if payment completed
    if (paymentStatus === 'COMPLETE' && applicationId) {
      const application = await kv.get(`loan_application:${applicationId}`);
      if (application) {
        const updatedApplication = {
          ...application,
          ...applicationUpdate,
          status: newApplicationStatus,
          updatedAt: new Date().toISOString()
        };
        await kv.set(`loan_application:${applicationId}`, updatedApplication);
        // Record payment in admin system
        const { data: { user } } = await supabase.auth.getUser(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
        if (user) {
          await adminService.recordPayment(applicationId, amount, 'payfast', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
        }
      }
    }
    console.log(`✅ Payment ${mPaymentId} updated to: ${paymentStatus}`);
    return c.text('', 200);
  } catch (error) {
    console.log('❌ ITN processing error:', error);
    return c.text('', 500);
  }
});
// Get payment status
app.get('/make-server-1ed353c1/payment/:paymentId/status', requireAuth, async (c)=>{
  try {
    const userId = c.get('userId');
    const paymentId = c.req.param('paymentId');
    const payment = await kv.get(`payment:${paymentId}`);
    if (!payment || payment.userId !== userId) {
      return c.json({
        error: 'Payment not found'
      }, 404);
    }
    return c.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      paymentType: payment.paymentType,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    });
  } catch (error) {
    console.log(`Get payment status error: ${error}`);
    return c.json({
      error: 'Failed to get payment status'
    }, 500);
  }
});
Deno.serve(app.fetch);
