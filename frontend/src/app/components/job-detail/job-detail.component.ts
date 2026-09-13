import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../core/job.service';
import { AuthService } from '../../core/auth.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="job" class="row justify-content-center">
      <div class="col-md-8">
        <a routerLink="/jobs" class="small">&larr; Back to all jobs</a>
        <div class="card shadow-sm mt-2">
          <div class="card-body">
            <h3>{{ job.title }}</h3>
            <h6 class="text-muted mb-3">{{ job.company }} · {{ job.location }}</h6>
            <span class="badge bg-secondary mb-3">{{ job.job_type }}</span>
            <p style="white-space: pre-line">{{ job.description }}</p>

            <div class="alert alert-success py-2" *ngIf="applied">
              Application submitted successfully!
            </div>
            <div class="alert alert-danger py-2" *ngIf="error">{{ error }}</div>

            <button
              class="btn btn-primary"
              *ngIf="auth.isStudent()"
              [disabled]="applying || applied"
              (click)="apply()"
            >
              {{ applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now' }}
            </button>

            <p class="text-muted small mb-0" *ngIf="!auth.isLoggedIn()">
              <a routerLink="/login">Log in</a> as a student to apply.
            </p>
            <p class="text-muted small mb-0" *ngIf="auth.isRecruiter()">
              Recruiters view applicants from the <a routerLink="/dashboard">Dashboard</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  applying = false;
  applied = false;
  error = '';

  constructor(private route: ActivatedRoute, private jobService: JobService, public auth: AuthService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJob(id).subscribe((job) => (this.job = job));
  }

  apply(): void {
    if (!this.job) return;
    this.applying = true;
    this.error = '';

    this.jobService.applyToJob(this.job.id).subscribe({
      next: () => {
        this.applying = false;
        this.applied = true;
      },
      error: (err) => {
        this.applying = false;
        this.error = err?.error?.error || 'Could not apply to this job';
      },
    });
  }
}
