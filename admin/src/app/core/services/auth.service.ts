import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AuthResponse,
  RegisterPayload,
  User,
} from '../models/user.model';
import { ACCESS_TOKEN_KEY } from '../tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);

  /** Gọi trước khi bootstrap app (APP_INITIALIZER). */
  bootstrapSession(): Promise<void> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      return Promise.resolve();
    }
    return firstValueFrom(
      this.http.get<User>(`${environment.apiUrl}/api/v1/auth/me`).pipe(
        tap((u) => this.user.set(u)),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      ),
    ).then(() => undefined);
  }

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.user();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/login`, { email, password })
      .pipe(tap((res) => this.applyAuthResponse(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/register`, payload)
      .pipe(tap((res) => this.applyAuthResponse(res)));
  }

  refreshMe(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/api/v1/auth/me`)
      .pipe(tap((u) => this.user.set(u)));
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.user.set(null);
  }

  private applyAuthResponse(res: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    this.user.set(res.user);
  }
}
