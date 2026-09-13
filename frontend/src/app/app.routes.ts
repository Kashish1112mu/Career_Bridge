import { Routes } from '@angular/router';
import { authGuard, recruiterGuard, studentGuard } from './core/auth.guard';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { JobListComponent } from './components/job-list/job-list.component';
import { JobDetailComponent } from './components/job-detail/job-detail.component';
import { RecruiterDashboardComponent } from './components/recruiter-dashboard/recruiter-dashboard.component';
import { MyApplicationsComponent } from './components/my-applications/my-applications.component';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/:id', component: JobDetailComponent, canActivate: [authGuard] },
  { path: 'my-applications', component: MyApplicationsComponent, canActivate: [authGuard, studentGuard] },
  { path: 'dashboard', component: RecruiterDashboardComponent, canActivate: [authGuard, recruiterGuard] },
  { path: '**', redirectTo: 'jobs' },
];
