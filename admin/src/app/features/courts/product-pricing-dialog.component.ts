import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import type { ProductPriceDto, ProductPriceUpsertBody, ProductUtilityDto } from '../../core/services/admin-products.service';
import { AdminProductsService } from '../../core/services/admin-products.service';
import type { ProductPricingDialogData } from './product-pricing-dialog.types';

export interface ProductPricingDialogResult {
  savedUtilities?: boolean;
}

@Component({
  selector: 'app-product-pricing-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-pricing-dialog.component.html',
  styleUrl: './product-pricing-dialog.component.scss',
})
export class ProductPricingDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA) as ProductPricingDialogData;
  private readonly ref = inject(MatDialogRef<ProductPricingDialogComponent, ProductPricingDialogResult | undefined>);
  private readonly api = inject(AdminProductsService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  protected readonly busy = signal(true);
  protected readonly err = signal('');
  protected readonly prices = signal<ProductPriceDto[]>([]);
  protected readonly catalog = signal<ProductUtilityDto[]>([]);
  protected readonly selectedUtilityIds = signal<number[]>([]);

  protected displayPriceColumns = ['slot', 'price', 'kind', 'actions'] as const;

  protected readonly addForm = this.fb.nonNullable.group({
    startTime: ['08:00', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    endTime: ['22:00', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    price: [150_000, [Validators.required, Validators.min(0)]],
    weekend: this.fb.control<boolean>(false, { nonNullable: true }),
  });

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.busy.set(true);
    const p = this.data.product;
    forkJoin({
      prices: this.api.listPrices(p.id),
      catalog: this.api.listUtilityCatalog(),
      detail: this.api.getById(p.id),
    }).subscribe({
      next: ({ prices, catalog, detail }) => {
        this.prices.set(prices);
        this.catalog.set(catalog);
        this.selectedUtilityIds.set((detail.utilities ?? []).map((u) => u.id));
        this.busy.set(false);
        this.err.set('');
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.err.set(readApiMessage(e) ?? 'Không tải được dữ liệu giá/tiện ích.');
      },
    });
  }

  protected utilityChecked(id: number): boolean {
    return this.selectedUtilityIds().includes(id);
  }

  protected toggleUtility(id: number): void {
    this.selectedUtilityIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  protected saveUtilities(): void {
    const pid = this.data.product.id;
    this.busy.set(true);
    this.api.replaceUtilities(pid, this.selectedUtilityIds()).subscribe({
      next: () => {
        this.busy.set(false);
        this.snack.open('Đã cập nhật tiện ích.', 'Đóng', { duration: 2500 });
        this.ref.close({ savedUtilities: true });
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.snack.open(readApiMessage(e) ?? 'Lưu tiện ích thất bại', 'Đóng', {
          duration: 4000,
        });
      },
    });
  }

  protected addPrice(): void {
    if (!this.addForm.valid) {
      return;
    }
    const v = this.addForm.getRawValue();
    const body: ProductPriceUpsertBody = {
      startTime: v.startTime,
      endTime: v.endTime,
      price: Number(v.price),
      weekend: v.weekend,
    };
    this.busy.set(true);
    this.api.createPrice(this.data.product.id, body).subscribe({
      next: (row) => {
        this.prices.update((list) =>
          [...list, row].sort((a, b) => a.startTime.localeCompare(b.startTime)),
        );
        this.snack.open('Đã thêm khung giá.', 'Đóng', { duration: 2000 });
        this.busy.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.snack.open(readApiMessage(e) ?? 'Thêm giá thất bại', 'Đóng', { duration: 4000 });
      },
    });
  }

  protected deletePrice(row: ProductPriceDto): void {
    this.busy.set(true);
    this.api.deletePrice(this.data.product.id, row.id).subscribe({
      next: () => {
        this.prices.update((list) => list.filter((x) => x.id !== row.id));
        this.snack.open('Đã xóa khung giá.', 'Đóng', { duration: 2000 });
        this.busy.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.snack.open(readApiMessage(e) ?? 'Xóa thất bại', 'Đóng', { duration: 4000 });
      },
    });
  }

  protected close(): void {
    this.ref.close();
  }
}

function readApiMessage(e: HttpErrorResponse): string | undefined {
  const body = e.error as { message?: string } | undefined;
  return typeof body?.message === 'string' ? body.message : undefined;
}
