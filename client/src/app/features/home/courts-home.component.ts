import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { Product } from '../../core/models/product.model';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../core/constants/product-media';
import { resolveMediaUrl } from '../../core/services/api-base';
import { PublicProductsService } from '../../core/services/public-products.service';

@Component({
  selector: 'app-courts-home',
  imports: [DecimalPipe, RouterLink, ReactiveFormsModule],
  templateUrl: './courts-home.component.html',
  styleUrl: './courts-home.component.scss',
})
export class CourtsHomeComponent implements OnInit {
  private readonly api = inject(PublicProductsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** `product.id` có URL ảnh nhưng tải thất bại → dùng placeholder thay URL đó. */
  protected readonly coverLoadFailedIds = signal(new Set<number>());

  protected readonly items = signal<Product[]>([]);
  protected readonly err = signal('');
  protected readonly busy = signal(false);
  protected page = 0;
  protected readonly pageSize = 20;
  protected totalPages = 1;

  protected readonly filterForm = new FormGroup({
    q: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.filterForm.controls.q.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });
    this.load();
  }

  /** URL ảnh từ API lỗi tải → chuyển sang placeholder (binding, không sửa DOM tay). */
  protected coverUrl(c: Product): string {
    const primary = resolveMediaUrl(this.platformId, c.images?.[0]?.url);
    if (primary != null && primary.length > 0 && !this.coverLoadFailedIds().has(c.id)) {
      return primary;
    }
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  protected onCoverImgError(productId: number): void {
    if (this.coverLoadFailedIds().has(productId)) {
      return;
    }
    this.coverLoadFailedIds.update((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }

  protected minPrice(p: Product): number | null {
    const rows = p.prices;
    if (!rows?.length) {
      return null;
    }
    return Math.min(...rows.map((r) => r.price));
  }

  protected rateLabel(r: number): string {
    if (r == null || Number.isNaN(r)) {
      return '—';
    }
    return Number(r).toFixed(1);
  }

  private load(): void {
    this.busy.set(true);
    this.err.set('');
    const q = this.filterForm.getRawValue().q.trim();
    this.api.list({ q: q || undefined, page: this.page, size: this.pageSize }).subscribe({
      next: (p) => {
        this.coverLoadFailedIds.set(new Set());
        this.items.set(p.content);
        this.totalPages = Math.max(1, p.totalPages);
        this.busy.set(false);
      },
      error: () => {
        this.err.set('Không tải được danh sách.');
        this.busy.set(false);
      },
    });
  }

  protected refreshSearch(): void {
    this.page = 0;
    this.load();
  }

  protected goPrev(): void {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  protected goNext(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.load();
    }
  }
}
