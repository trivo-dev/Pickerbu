import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';
import type { PageResponse, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class PublicProductsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly basePath = `${resolveApiBase(this.platformId)}/api/v1/public/products`;

  list(params: { q?: string; page: number; size: number; sort?: string }): Observable<PageResponse<Product>> {
    let p = new HttpParams().set('page', String(params.page)).set('size', String(params.size));
    if (params.q) {
      p = p.set('q', params.q);
    }
    if (params.sort) {
      p = p.set('sort', params.sort);
    }
    return this.http.get<PageResponse<Product>>(this.basePath, { params: p });
  }
}
