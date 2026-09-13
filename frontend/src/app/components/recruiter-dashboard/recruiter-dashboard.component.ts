import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/job.service';
import { Application, Job } from '../../core/models';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Recruiter Dashboard</h3>
      <button class="btn btn-primary" (click)="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ Post a Job' }}
      </button>
    </div>

    <div class="card shadow-sm mb-4" *ngIf="showForm">
      <div class="card-body">
        <h5 class="card-title">New Job Posting</h5>
        <form (ngSubmit)="createJob()">
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label">Title</label>
              <input class="form-control" name="title" [(ngModel)]="newJob.title" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Company</label>
              <input class="form-control" name="company" [(ngModel)]="newJob.company" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Location</label>
              <input class="form-control" name="location" [(ngModel)]="newJob.location" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Job Type</label>
              <select class="form-select" name="job_type" [(ngModel)]="newJob.job_type">
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label">Description</label>
              <textarea class="form-control" rows="3" name="description" [(ngModel)]="newJob.description" required></textarea>
            </div>
          </div>
          <button class="btn btn-success mt-3" type="submit" [disabled]="creating">
            {{ creating ? 'Posting...' : 'Post Job' }}
          </button>
        </form>
      </div>
    </div>

    <div *ngIf="jobs.length === 0" class="text-muted">You haven't posted any jobs yet.</div>

    <div class="card shadow-sm mb-3" *ngFor="let job of jobs">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title mb-1">{{ job.title }}</h5>
            <h6 class="card-subtitle text-muted mb-2">{{ job.location }} · {{ job.job_type }}</h6>
          </div>
          <div class="text-end">
            <span class="badge bg-info text-dark mb-2">{{ job.applicant_count }} applicant(s)</span><br />
            <button class="btn btn-sm btn-outline-secondary me-1" (click)="toggleApplicants(job)">
              {{ expandedJobId === job.id ? 'Hide' : 'View' }} Applicants
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteJob(job)">Delete</button>
          </div>
        </div>

        <div *ngIf="expandedJobId === job.id" class="mt-3">
          <div *ngIf="applicants.length === 0" class="text-muted small">No applicants yet.</div>

          <table class="table table-sm table-bordered" *ngIf="applicants.length > 0">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of applicants">
                <td>{{ app.student_name }}</td>
                <td>{{ app.student_email }}</td>
                <td>{{ app.applied_at | date: 'short' }}</td>
                <td>
                  <select
                    class="form-select form-select-sm"
                    [ngModel]="app.status"
                    (ngModelChange)="updateStatus(app, $event)"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class RecruiterDashboardComponent implements OnInit {
  jobs: Job[] = [];
  applicants: Application[] = [];
  expandedJobId: number | null = null;
  showForm = false;
  creating = false;

  newJob = {
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    description: '',
  };

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getMyJobs().subscribe((jobs) => (this.jobs = jobs));
  }

  createJob(): void {
    this.creating = true;
    this.jobService.createJob(this.newJob).subscribe({
      next: () => {
        this.creating = false;
        this.showForm = false;
        this.newJob = { title: '', company: '', location: '', job_type: 'Full-time', description: '' };
        this.loadJobs();
      },
      error: () => (this.creating = false),
    });
  }

  toggleApplicants(job: Job): void {
    if (this.expandedJobId === job.id) {
      this.expandedJobId = null;
      this.applicants = [];
      return;
    }
    this.expandedJobId = job.id;
    this.jobService.getApplicants(job.id).subscribe((apps) => (this.applicants = apps));
  }

  updateStatus(app: Application, newStatus: string): void {
    this.jobService.updateApplicationStatus(app.id, newStatus).subscribe((updated) => {
      app.status = updated.status;
    });
  }

  deleteJob(job: Job): void {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    this.jobService.deleteJob(job.id).subscribe(() => this.loadJobs());
  }
}
