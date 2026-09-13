export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'recruiter';
  company_name?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: string;
  posted_by: number;
  created_at: string;
  applicant_count?: number;
}

export interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: 'Applied' | 'Shortlisted' | 'Rejected' | 'Selected';
  applied_at: string;
  student_name: string;
  student_email: string;
  job_title: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
