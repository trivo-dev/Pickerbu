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

  scheduleGrid(productId: number, fromIso: string, toIsoExclusive: string): Observable<AdminScheduleSlot[]> {
    return this.http.get<AdminScheduleSlot[]>(`${this.base}/${productId}/schedule`, {
      params: { from: fromIso, to: toIsoExclusive },
    });
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

  uploadProductImage(
    productId: number,
    file: File,
  ): Observable<{ id: number; url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ id: number; url: string }>(
      `${this.base}/${productId}/images`,
      fd,
    );
  }

  deleteProductImage(productId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${productId}/images/${imageId}`,
    );
  }

  // --- Giá & tiện ích ---

  listPrices(productId: number): Observable<ProductPriceDto[]> {
    return this.http.get<ProductPriceDto[]>(`${this.base}/${productId}/prices`);
  }

  createPrice(productId: number, body: ProductPriceUpsertBody): Observable<ProductPriceDto> {
    return this.http.post<ProductPriceDto>(`${this.base}/${productId}/prices`, body);
  }

  updatePrice(productId: number, priceId: number, body: ProductPriceUpsertBody): Observable<ProductPriceDto> {
    return this.http.put<ProductPriceDto>(`${this.base}/${productId}/prices/${priceId}`, body);
  }

  deletePrice(productId: number, priceId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${productId}/prices/${priceId}`);
  }

  replaceUtilities(productId: number, utilityIds: number[]): Observable<ProductUtilityDto[]> {
    return this.http.put<ProductUtilityDto[]>(`${this.base}/${productId}/utilities`, {
      utilityIds,
    });
  }

  listUtilityCatalog(): Observable<ProductUtilityDto[]> {
    return this.http.get<ProductUtilityDto[]>(
      `${environment.apiUrl}/api/v1/admin/product-utilities`,
    );
  }

  createUtilityCatalog(name: string): Observable<ProductUtilityDto> {
    return this.http.post<ProductUtilityDto>(
      `${environment.apiUrl}/api/v1/admin/product-utilities`,
      { name },
    );
  }
}

/** Khớp ProductPriceUpsertRequest / ProductPriceDto backend. */
export interface ProductPriceUpsertBody {
  startTime: string;
  endTime: string;
  price: number;
  weekend: boolean;
}

export interface ProductPriceDto {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  weekend: boolean;
}

export interface ProductUtilityDto {
  id: number;
  name: string;
}

export interface AdminScheduleSlot {
  startTime: string;
  endTime: string;
  status: string;
}
