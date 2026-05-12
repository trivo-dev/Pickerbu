import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Product } from '../../core/models/product.model';
import { PublicProductsService } from '../../core/services/public-products.service';

@Component({
  selector: 'app-courts-home',
  imports: [DatePipe],
  templateUrl: './courts-home.component.html',
  styleUrl: './courts-home.component.scss',
})
export class CourtsHomeComponent implements OnInit {
  private readonly api = inject(PublicProductsService);

  protected readonly items = signal<Product[]>([]);
  protected readonly err = signal('');
  protected readonly busy = signal(false);
  protected page = 0;
  protected readonly pageSize = 20;
  protected totalPages = 1;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.busy.set(true);
    this.err.set('');
    this.api.list({ page: this.page, size: this.pageSize }).subscribe({
      next: (p) => {
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
