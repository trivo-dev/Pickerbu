import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import type { UserType, User } from '../../core/models/user.model';

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly snack = inject(MatSnackBar);

  private static passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
    const n = group.get('newPassword')?.value;
    const n2 = group.get('newPassword2')?.value;
    return n && n2 && n !== n2 ? { mismatch: true } : null;
  };

  protected readonly profileBusy = signal(false);
  protected readonly passwordBusy = signal(false);
  private static readonly phonePattern = /^(|[0-9+\-\s()]+)$/;
  protected readonly levelOptions = ['Beginner', 'Intermediate', 'Advanced', 'Pro'] as const;

  protected profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(32), Validators.pattern(AccountComponent.phonePattern)]],
    avatarUrl: ['', [Validators.maxLength(255)]],
    address: ['', [Validators.maxLength(255)]],
    level: ['', [Validators.maxLength(50)]],
  });

  protected passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]],
      newPassword2: ['', [Validators.required]],
    },
    { validators: [AccountComponent.passwordMatchValidator] },
  );

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) {
      this.patchFromUser(u);
    }
  }

  protected avatarSrc(): string | null {
    const url = this.auth.user()?.avatarUrl?.trim();
    return url || null;
  }

  protected userInitials(): string {
    const u = this.auth.user();
    if (!u) {
      return '?';
    }
    const fn = u.firstName?.trim();
    const ln = u.lastName?.trim();
    if (fn && ln) {
      return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
    }
    const raw = (u.displayName?.trim() || u.username || u.email?.split('@')[0] || '?').trim();
    const segs = raw.split(/\s+/).filter(Boolean);
    if (segs.length >= 2) {
      const a = segs[0]?.[0] ?? '?';
      const b = segs[segs.length - 1]?.[0] ?? '?';
      return (a + b).toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  }

  protected userTypeLabel(t: UserType): string {
    switch (t) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'OWNER':
        return 'Chủ địa điểm';
      default:
        return 'Người chơi';
    }
  }

  private patchFromUser(u: User): void {
    this.profileForm.patchValue({
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      phone: u.phone ?? '',
      avatarUrl: u.avatarUrl ?? '',
      address: u.address ?? '',
      level: u.level ?? '',
    });
  }

  protected saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }
    this.profileBusy.set(true);
    const v = this.profileForm.getRawValue();
    this.account
      .updateProfile({
        firstName: v.firstName?.trim() || null,
        lastName: v.lastName?.trim() || null,
        phone: v.phone?.trim() || null,
        avatarUrl: v.avatarUrl?.trim() || null,
        address: v.address?.trim() || null,
        level: v.level?.trim() || null,
      })
      .subscribe({
        next: () => {
          this.profileBusy.set(false);
          this.snack.open('Đã cập nhật hồ sơ', 'Đóng', { duration: 3000 });
        },
        error: (e: HttpErrorResponse) => {
          this.profileBusy.set(false);
          this.snack.open(this.readError(e), 'Đóng', { duration: 5000 });
        },
      });
  }

  protected changePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.errors?.['mismatch']) {
      this.snack.open('Mật khẩu mới nhập lại chưa khớp', 'Đóng', { duration: 4000 });
      return;
    }
    if (this.passwordForm.invalid) {
      return;
    }
    this.passwordBusy.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.account.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordBusy.set(false);
        this.passwordForm.reset();
        this.snack.open('Đã đổi mật khẩu', 'Đóng', { duration: 3000 });
      },
      error: (e: HttpErrorResponse) => {
        this.passwordBusy.set(false);
        this.snack.open(this.readError(e), 'Đóng', { duration: 5000 });
      },
    });
  }

  private readError(e: HttpErrorResponse): string {
    if (e.error && typeof e.error === 'object' && 'message' in e.error) {
      return String((e.error as { message: string }).message);
    }
    return e.statusText || 'Có lỗi xảy ra';
  }
}
