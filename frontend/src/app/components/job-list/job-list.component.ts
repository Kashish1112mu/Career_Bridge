import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/job.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h3 class="mb-3">Browse Jobs</h3>

    <div class="row g-2 mb-4">
      <div class="col-md-4">
        <input class="form-control" placeholder="Search title or company" [(ngModel)]="search" (ngModelChange)="onFilterChange()" />
      </div>
      <div class="col-md-4">
        <input class="form-control" placeholder="Location" [(ngModel)]="location" (ngModelChange)="onFilterChange()" />
      </div>
      <div class="col-md-4">
        <select class="form-select" [(ngModel)]="jobType" (ngModelChange)="onFilterChange()">
          <option value="">All types</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
    </div>

    <div *ngIf="loading" class="text-muted">Loading jobs...</div>
    <div *ngIf="!loading && jobs.length === 0" class="text-muted">No jobs match your filters.</div>

    <div class="row g-3">
      <div class="col-md-6" *ngFor="let job of jobs">
        <div class="card job-card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ job.title }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">{{ job.company }} · {{ job.location }}</h6>
            <span class="badge bg-secondary mb-2">{{ job.job_type }}</span>
            <p class="card-text">{{ job.description | slice: 0:120 }}{{ job.description.length > 120 ? '...' : '' }}</p>
            <a class="btn btn-sm btn-outline-primary" [routerLink]="['/jobs', job.id]">View & Apply</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  loading = false;
  search = '';
  location = '';
  jobType = '';
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  onFilterChange(): void {
    // small debounce so we don't fire a request on every keystroke
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.fetchJobs(), 300);
  }

  fetchJobs(): void {
    this.loading = true;
    this.jobService
      .getJobs({ search: this.search, location: this.location, job_type: this.jobType })
      .subscribe({
        next: (jobs) => {
          this.jobs = jobs;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }
}
