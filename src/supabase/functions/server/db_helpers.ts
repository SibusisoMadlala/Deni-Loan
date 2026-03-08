import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Maps camelCase JS objects to snake_case PostgreSQL columns
 */
const mapToSnakeCase = (app: any) => {
  return {
    id: app.id,
    user_id: app.userId,
    full_name: app.fullName,
    id_number: app.idNumber,
    email: app.email,
    phone: app.phone,
    address: app.address,
    employment_status: app.employmentStatus,
    employer_name: app.employerName,
    job_title: app.jobTitle,
    years_employed: app.yearsEmployed,
    monthly_income: app.monthlyIncome,
    net_salary: app.netSalary,
    loan_amount: app.loanAmount,
    loan_term: app.loanTerm,
    loan_purpose: app.loanPurpose,
    bank_name: app.bankName,
    account_number: app.accountNumber,
    account_type: app.accountType,
    branch_code: app.branchCode,
    status: app.status,
    created_at: app.createdAt,
    updated_at: app.updatedAt || new Date().toISOString(),
    data: app 
  };
};

/**
 * Maps snake_case PostgreSQL columns back to camelCase JS objects
 */
const mapToCamelCase = (row: any) => {
  if (!row) return null;
  if (row.data) {
    return {
      ...row.data,
      id: row.id,
      userId: row.user_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name || '',
    idNumber: row.id_number || '',
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    employmentStatus: row.employment_status || '',
    employerName: row.employer_name || '',
    jobTitle: row.job_title || '',
    yearsEmployed: row.years_employed || 0,
    monthlyIncome: row.monthly_income || 0,
    netSalary: row.net_salary || 0,
    loanAmount: row.loan_amount || 0,
    loanTerm: row.loan_term || 0,
    loanPurpose: row.loan_purpose || '',
    bankName: row.bank_name || '',
    accountNumber: row.account_number || '',
    accountType: row.account_type || '',
    branchCode: row.branch_code || '',
    status: row.status || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const db = {
  async saveApplication(app: any) {
    const data = mapToSnakeCase(app);
    const { error } = await supabase
      .from('loan_applications')
      .upsert(data);
    
    if (error) {
      console.error('Save Application DB Error:', error);
      throw error;
    }
    return app;
  },

  async getApplication(id: string) {
    const { data: row, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !row) return null;
    return mapToCamelCase(row);
  },

  async getApplicationsByUser(userId: string) {
    const { data: rows, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get User Apps DB Error:', error);
      throw error;
    }
    return (rows || []).map(mapToCamelCase);
  },

  async getAllApplications(status?: string, limit = 10000) {
    let allRows: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data: rows, error } = await query;
      
      if (error) {
        console.error('Get All Apps DB Error:', error);
        throw error;
      }
      
      if (rows && rows.length > 0) {
        allRows = [...allRows, ...rows];
        if (rows.length < pageSize || allRows.length >= limit) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    return (allRows || []).slice(0, limit).map(mapToCamelCase);
  },

  async deleteApplication(id: string) {
    const { error } = await supabase
      .from('loan_applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async saveDocumentMetadata(data: any) {
    const docType = data.usageType || data.documentType;
    const { data: result, error } = await supabase
      .from('documents')
      .insert({
        id: data.id,
        application_id: data.applicationId,
        user_id: data.userId,
        file_path: data.filePath,
        file_name: data.fileName,
        file_type: data.fileType,
        // usage_type: docType, // Removed as column might start missing
        uploaded_at: data.createdAt || new Date().toISOString(),
        data: { ...data, usageType: docType, documentType: docType }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Save Document DB Error:', error);
      throw error;
    }
    return result;
  },

  async getApplicationDocuments(applicationId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('application_id', applicationId);
    
    if (error) throw error;
    return (data || []).map(doc => {
      const meta = doc.data || {};
      const type = doc.usage_type || meta.usageType || meta.documentType || 'unknown';
      return {
        ...doc,
        id: doc.id,
        applicationId: doc.application_id,
        userId: doc.user_id,
        filePath: doc.file_path,
        fileName: doc.file_name,
        fileType: doc.file_type,
        usageType: type,
        documentType: type,
        uploadedAt: doc.uploaded_at || doc.created_at
      }
    });
  }
};
