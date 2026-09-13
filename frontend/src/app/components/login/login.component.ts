import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="card-title mb-3">Log in</h4>

            <div class="alert alert-info small">
              Demo accounts — Recruiter: recruiter&#64;demo.com / password123 &nbsp;|&nbsp;
              Student: student&#64;demo.com / password123
            </div>

            <form (ngSubmit)="onSubmit()">
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
                {{ loading ? 'Logging in...' : 'Log in' }}
              </button>
            </form>

            <p class="mt-3 mb-0 small">
              No account yet? <a routerLink="/register">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([res.user.role === 'recruiter' ? '/dashboard' : '/jobs']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Login failed';
      },
    });
  }
}
