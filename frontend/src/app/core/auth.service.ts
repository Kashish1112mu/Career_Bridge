import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from './models';

const API_URL = 'http://localhost:5000/api';

/**
 * Single source of truth for "who is logged in".
 * Keeps the JWT + user object in localStorage (so a page refresh
 * doesn't log the user out) and exposes them as an observable so
 * any component (e.g. the navbar) can react to login/logout.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    company_name?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isRecruiter(): boolean {
    return this.currentUser?.role === 'recruiter';
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
