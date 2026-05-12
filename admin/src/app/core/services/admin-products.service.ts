import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Product } from '../models/product.model';
import type { PageResponse } from './admin-users.service';

export interface ProductCreateBody {
  title: string;
  description?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  rate?: number | null;
  status?: string | null;
  ownerUserId?: number | null;
}

export interface ProductUpdateBody {
  title?: string;
  description?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  rate?: number | null;
  status?: string | null;
  ownerUserId?: number | null;
  clearOwner?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/admin/products`;

  list(params: {
    q?: string;
    status?: string;
    page: number;
    size: number;
    sort?: string;
  }): Observable<PageResponse<Product>> {
    let p = new HttpParams()
      .set('page', String(params.page))
      .set('size', String(params.size));
    if (params.q) {
      p = p.set('q', params.q);
    }
    if (params.status) {
      p = p.set('status', params.status);
    }
    if (params.sort) {
      p = p.set('sort', params.sort);
    }
    return this.http.get<PageResponse<Product>>(this.base, { params: p });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(body: ProductCreateBody): Observable<Product> {
    return this.http.post<Product>(this.base, body);
  }

  update(id: number, body: ProductUpdateBody): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
