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
import type { User, UserType } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { AdminUsersService, type PageResponse } from '../../core/services/admin-users.service';
import { ConfirmData, ConfirmDialogComponent } from './confirm-dialog.component';
import { UserFormDialogComponent } from './user-form-dialog.component';

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly api = inject(AdminUsersService);
  protected readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly busy = signal(false);
  protected readonly data = signal<User[]>([]);
  protected total = 0;
  protected page = 0;
  protected size = 20;
  protected readonly displayedColumns: string[] = [
    'email',
    'username',
    'displayName',
    'phone',
    'userType',
    'active',
    'createdAt',
    'actions',
  ];

  protected filterForm = new FormGroup({
    q: new FormControl(''),
    userType: new FormControl('ALL' as 'ALL' | UserType),
    active: new FormControl('ALL' as 'ALL' | 'true' | 'false'),
  });

  ngOnInit(): void {
    this.load();
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (a, b) => JSON.stringify(a) === JSON.stringify(b),
        ),
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
    const userType =
      f.userType && f.userType !== 'ALL' ? (f.userType as UserType) : undefined;
    let active: 'true' | 'false' | undefined;
    if (f.active === 'true') {
      active = 'true';
    } else if (f.active === 'false') {
      active = 'false';
    } else {
      active = undefined;
    }
    this.api
      .list({
        q: f.q || undefined,
        userType: userType ?? '',
        active,
        page: this.page,
        size: this.size,
      })
      .subscribe({
        next: (p: PageResponse<User>) => {
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
      .open(UserFormDialogComponent, {
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

  protected openEdit(u: User): void {
    this.dialog
      .open(UserFormDialogComponent, {
        data: { mode: 'edit', user: u },
        width: '520px',
        maxWidth: '95vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.load();
          if (u.id === this.auth.user()?.id) {
            this.auth.refreshMe().subscribe();
          }
        }
      });
  }

  protected userTypeVi(t: UserType): string {
    switch (t) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'OWNER':
        return 'Chủ địa điểm';
      case 'PLAYER':
        return 'Người chơi';
      default:
        return t;
    }
  }

  protected activeLabel(active: boolean): string {
    return active ? 'Có' : 'Không';
  }

  protected confirmDelete(u: User): void {
    if (u.id === this.auth.user()?.id) {
      this.snack.open('Bạn không thể vô hiệu hóa chính mình tại đây.', 'Đóng', {
        duration: 5000,
      });
      return;
    }
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Vô hiệu hóa tài khoản',
          message: `Bạn chắc chắn muốn vô hiệu hóa ${u.email}?`,
          confirm: 'Vô hiệu hóa',
        } satisfies ConfirmData,
        width: '400px',
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.api.delete(u.id).subscribe({
            next: () => {
              this.snack.open('Đã vô hiệu hóa', 'Đóng', { duration: 3000 });
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
