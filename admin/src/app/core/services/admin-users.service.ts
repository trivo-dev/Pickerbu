import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { User, UserType } from '../models/user.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminUserCreateBody {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  level?: string | null;
  userType: UserType;
}

export interface AdminUserUpdateBody {
  email?: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  level?: string | null;
  userType?: UserType;
  active?: boolean;
  newPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/admin/users`;

  list(params: {
    q?: string;
    userType?: UserType | '';
    active?: 'true' | 'false';
    page: number;
    size: number;
    sort?: string;
  }): Observable<PageResponse<User>> {
    let p = new HttpParams()
      .set('page', String(params.page))
      .set('size', String(params.size));
    if (params.q) {
      p = p.set('q', params.q);
    }
    if (params.userType) {
      p = p.set('userType', params.userType);
    }
    if (params.active) {
      p = p.set('active', params.active);
    }
    if (params.sort) {
      p = p.set('sort', params.sort);
    }
    return this.http.get<PageResponse<User>>(this.base, { params: p });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(body: AdminUserCreateBody): Observable<User> {
    return this.http.post<User>(this.base, body);
  }

  update(id: number, body: AdminUserUpdateBody): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
