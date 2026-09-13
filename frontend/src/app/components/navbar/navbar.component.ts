import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand navbar-dark bg-dark px-3">
      <a class="navbar-brand" routerLink="/jobs">CareerBridge</a>
      <div class="d-flex ms-auto align-items-center gap-3">
        <a class="nav-link text-white-50" routerLink="/jobs">Jobs</a>

        <ng-container *ngIf="auth.currentUser$ | async as user; else guestLinks">
          <a *ngIf="user.role === 'student'" class="nav-link text-white-50" routerLink="/my-applications">
            My Applications
          </a>
          <a *ngIf="user.role === 'recruiter'" class="nav-link text-white-50" routerLink="/dashboard">
            Dashboard
          </a>
          <span class="text-white small">{{ user.name }} ({{ user.role }})</span>
          <button class="btn btn-sm btn-outline-light" (click)="logout()">Logout</button>
        </ng-container>

        <ng-template #guestLinks>
          <a class="nav-link text-white-50" routerLink="/login">Login</a>
          <a class="btn btn-sm btn-primary" routerLink="/register">Sign up</a>
        </ng-template>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/jobs']);
  }
}
