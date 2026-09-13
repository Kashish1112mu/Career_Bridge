import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, Job } from './models';

const API_URL = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private http: HttpClient) {}

  // ---- Jobs (public / student-facing) ----
  getJobs(filters: { search?: string; location?: string; job_type?: string } = {}): Observable<Job[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<Job[]>(`${API_URL}/jobs`, { params });
  }

  getJob(id: number): Observable<Job> {
    return this.http.get<Job>(`${API_URL}/jobs/${id}`);
  }

  applyToJob(jobId: number): Observable<Application> {
    return this.http.post<Application>(`${API_URL}/jobs/${jobId}/apply`, {});
  }

  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${API_URL}/applications/my`);
  }

  // ---- Jobs (recruiter-facing) ----
  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${API_URL}/jobs/mine`);
  }

  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${API_URL}/jobs`, job);
  }

  updateJob(id: number, job: Partial<Job>): Observable<Job> {
    return this.http.put<Job>(`${API_URL}/jobs/${id}`, job);
  }

  deleteJob(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/jobs/${id}`);
  }

  getApplicants(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${API_URL}/jobs/${jobId}/applicants`);
  }

  updateApplicationStatus(applicationId: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${API_URL}/applications/${applicationId}/status`, { status });
  }
}
