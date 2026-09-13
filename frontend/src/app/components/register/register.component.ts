import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="card-title mb-3">Create an account</h4>

            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label">I am a...</label>
                <select class="form-select" name="role" [(ngModel)]="role">
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Full name</label>
                <input class="form-control" name="name" [(ngModel)]="name" required />
              </div>

              <div class="mb-3" *ngIf="role === 'recruiter'">
                <label class="form-label">Company name</label>
                <input class="form-control" name="company_name" [(ngModel)]="company_name" />
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input class="form-control" type="email" name="email" [(ngModel)]="email" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input class="form-control" type="password" name="password" [(ngModel)]="password" required />
              </div>

              <div class="alert alert-danger py-2" *ngIf="error">{{ error }}</div>

              <button class="btn btn-primary w-100" type="submit" [disabled]="loading">
                {{ loading ? 'Creating account...' : 'Sign up' }}
              </button>
            </form>

            <p class="mt-3 mb-0 small">
              Already have an account? <a routerLink="/login">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  role: 'student' | 'recruiter' = 'student';
  name = '';
  email = '';
  password = '';
  company_name = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.auth
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        company_name: this.company_name || undefined,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate([res.user.role === 'recruiter' ? '/dashboard' : '/jobs']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.error || 'Registration failed';
        },
      });
  }
}
