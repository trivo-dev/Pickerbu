import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { Product } from '../../core/models/product.model';
import { AdminProductsService } from '../../core/services/admin-products.service';
import type { PageResponse } from '../../core/services/admin-users.service';
import { ConfirmData, ConfirmDialogComponent } from '../users/confirm-dialog.component';
import { CourtFormDialogComponent } from './court-form-dialog.component';

@Component({
  selector: 'app-court-list',
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './court-list.component.html',
  styleUrl: './court-list.component.scss',
})
export class CourtListComponent implements OnInit {
  private readonly api = inject(AdminProductsService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly busy = signal(false);
  protected readonly data = signal<Product[]>([]);
  protected total = 0;
  protected page = 0;
  protected size = 20;
  protected readonly displayedColumns: string[] = [
    'title',
    'location',
    'rate',
    'status',
    'owner',
    'createdAt',
    'actions',
  ];

  protected filterForm = new FormGroup({
    q: new FormControl(''),
    status: new FormControl<'ALL' | 'active' | 'inactive'>('ALL', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.load();
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page = 0;
        this.load();
      });
  }

  private load(): void {
    this.busy.set(true);
    const f = this.filterForm.getRawValue();
    const status = f.status !== 'ALL' ? f.status : undefined;
    this.api
      .list({
        q: f.q || undefined,
        status,
        page: this.page,
        size: this.size,
      })
      .subscribe({
        next: (p: PageResponse<Product>) => {
          this.data.set(p.content);
          this.total = p.totalElements;
          this.busy.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.busy.set(false);
          this.snack.open(this.readErr(e), 'Đóng', { duration: 5000 });
        },
      });
  }

  private readErr(e: HttpErrorResponse): string {
    if (e.error && typeof e.error === 'object' && 'message' in e.error) {
      return String((e.error as { message: string }).message);
    }
    return e.statusText;
  }

  protected onPage(e: PageEvent): void {
    this.page = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  protected openCreate(): void {
    this.dialog
      .open(CourtFormDialogComponent, {
        data: { mode: 'create' },
        width: '520px',
        maxWidth: '95vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.load();
        }
      });
  }

  protected openEdit(p: Product): void {
    this.dialog
      .open(CourtFormDialogComponent, {
        data: { mode: 'edit', product: p },
        width: '520px',
        maxWidth: '95vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.load();
        }
      });
  }

  protected confirmDelete(p: Product): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Xóa sản phẩm',
          message: `Xóa “${p.title}”? Thao tác không hoàn tác.`,
          confirm: 'Xóa',
        } satisfies ConfirmData,
        width: '400px',
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.api.delete(p.id).subscribe({
            next: () => {
              this.snack.open('Đã xóa', 'Đóng', { duration: 3000 });
              this.load();
            },
            error: (e: HttpErrorResponse) => {
              this.snack.open(this.readErr(e), 'Đóng', { duration: 5000 });
            },
          });
        }
      });
  }
}
