import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  User,
} from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  updateProfile(body: UpdateProfilePayload): Observable<User> {
    return this.http
      .put<User>(`${environment.apiUrl}/api/v1/users/me`, body)
      .pipe(tap((u) => this.auth.user.set(u)));
  }

  changePassword(body: ChangePasswordPayload): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/v1/users/me/password`, body);
  }
}
