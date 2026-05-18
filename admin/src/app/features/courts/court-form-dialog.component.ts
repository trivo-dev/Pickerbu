import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import type { ProductImageRef } from '../../core/models/product.model';
import { AdminProductsService } from '../../core/services/admin-products.service';
import { resolveAdminMediaUrl } from '../../core/utils/media-url';
import type { CourtFormDialogData, CourtFormDialogResult } from './court-form-dialog.types';

@Component({
  selector: 'app-court-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './court-form-dialog.component.html',
  styleUrl: './court-form-dialog.component.scss',
})
export class CourtFormDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA) as CourtFormDialogData;
  private readonly ref = inject(MatDialogRef<CourtFormDialogComponent, CourtFormDialogResult | undefined>);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminProductsService);

  protected readonly busy = signal(false);
  protected readonly imgBusy = signal(false);
  protected readonly err = signal('');
  protected readonly images = signal<ProductImageRef[]>([]);

  protected form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    location: [''],
    lat: [''],
    lng: [''],
    rate: [''],
    status: this.fb.control<'active' | 'inactive'>('active', { nonNullable: true }),
    ownerUserId: [''],
  });

  constructor() {
    if (this.data.mode === 'edit') {
      const p = this.data.product;
      this.images.set(p.images ?? []);
      this.form.patchValue({
        title: p.title,
        description: p.description ?? '',
        location: p.location ?? '',
        lat: p.lat != null ? String(p.lat) : '',
        lng: p.lng != null ? String(p.lng) : '',
        rate: String(p.rate ?? 0),
        status: p.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active',
        ownerUserId: p.ownerUserId != null ? String(p.ownerUserId) : '',
      });
    }
  }

  protected imagePreviewUrl(url: string): string {
    return resolveAdminMediaUrl(url);
  }

  protected pickGalleryFile(input: HTMLInputElement): void {
    input.click();
  }

  protected onGalleryFile(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.data.mode !== 'edit') {
      return;
    }
    this.err.set('');
    this.imgBusy.set(true);
    const p = this.data.product;
    this.api.uploadProductImage(p.id, file).subscribe({
      next: (img) => {
        this.imgBusy.set(false);
        this.images.update((xs) => [...xs, img]);
      },
      error: (e: HttpErrorResponse) => {
        this.imgBusy.set(false);
        this.err.set(this.readErr(e));
      },
    });
  }

  protected removeImage(img: ProductImageRef): void {
    if (this.data.mode !== 'edit') {
      return;
    }
    const p = this.data.product;
    this.err.set('');
    this.imgBusy.set(true);
    this.api.deleteProductImage(p.id, img.id).subscribe({
      next: () => {
        this.imgBusy.set(false);
        this.images.update((xs) => xs.filter((i) => i.id !== img.id));
      },
      error: (e: HttpErrorResponse) => {
        this.imgBusy.set(false);
        this.err.set(this.readErr(e));
      },
    });
  }

  protected cancel(): void {
    this.ref.close();
  }

  protected save(): void {
    this.err.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.busy.set(true);
    const v = this.form.getRawValue();
    const ownerRaw = v.ownerUserId?.trim() ?? '';
    let ownerId: number | null = null;
    if (ownerRaw !== '') {
      const n = Number(ownerRaw);
      if (Number.isNaN(n) || n < 1) {
        this.err.set('ID chủ (user) phải là số dương hoặc để trống.');
        this.busy.set(false);
        return;
      }
      ownerId = n;
    }

    const latNum = parseOptionalDecimal(v.lat);
    const lngNum = parseOptionalDecimal(v.lng);
    let rateNum: number | null = null;
    if (v.rate?.trim()) {
      const r = Number(v.rate);
      if (Number.isNaN(r)) {
        this.err.set('Điểm đánh giá trung bình (rate) không hợp lệ.');
        this.busy.set(false);
        return;
      }
      rateNum = r;
    }

    if (this.data.mode === 'create') {
      this.api
        .create({
          title: v.title!,
          description: v.description?.trim() || null,
          location: v.location?.trim() || null,
          lat: latNum,
          lng: lngNum,
          rate: rateNum ?? undefined,
          status: v.status,
          ownerUserId: ownerId,
        })
        .subscribe({
          next: (created) => {
            this.busy.set(false);
            this.ref.close({ saved: true, newProductId: created.id });
          },
          error: (e: HttpErrorResponse) => {
            this.busy.set(false);
            this.err.set(this.readErr(e));
          },
        });
    } else {
      const p = this.data.product;
      this.api
        .update(p.id, {
          title: v.title!,
          description: v.description?.trim() || null,
          location: v.location?.trim() || null,
          lat: latNum,
          lng: lngNum,
          rate: rateNum ?? undefined,
          status: v.status,
          ...(ownerId === null
            ? { clearOwner: true, ownerUserId: null }
            : { clearOwner: false, ownerUserId: ownerId }),
        })
        .subscribe({
          next: () => {
            this.busy.set(false);
            this.ref.close(true);
          },
          error: (e: HttpErrorResponse) => {
            this.busy.set(false);
            this.err.set(this.readErr(e));
          },
        });
    }
  }

  private readErr(e: HttpErrorResponse): string {
    if (e.error && typeof e.error === 'object' && 'message' in e.error) {
      return String((e.error as { message: string }).message);
    }
    return e.statusText;
  }
}

function parseOptionalDecimal(s: string): number | null {
  const t = s?.trim() ?? '';
  if (t === '') {
    return null;
  }
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}
