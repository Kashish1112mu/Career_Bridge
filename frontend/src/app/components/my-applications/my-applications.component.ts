import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../core/job.service';
import { Application } from '../../core/models';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="mb-3">My Applications</h3>

    <div *ngIf="applications.length === 0" class="text-muted">
      You haven't applied to any jobs yet.
    </div>

    <table class="table table-bordered bg-white" *ngIf="applications.length > 0">
      <thead>
        <tr>
          <th>Job Title</th>
          <th>Applied On</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let app of applications">
          <td>{{ app.job_title }}</td>
          <td>{{ app.applied_at | date: 'medium' }}</td>
          <td>
            <span class="badge" [ngClass]="'status-badge-' + app.status">{{ app.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.jobService.getMyApplications().subscribe((apps) => (this.applications = apps));
  }
}
