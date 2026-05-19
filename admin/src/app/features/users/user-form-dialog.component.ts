import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { UserType } from '../../core/models/user.model';
import { AdminUsersService } from '../../core/services/admin-users.service';
import { UserFormDialogData } from './user-form-dialog.types';

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss',
})
export class UserFormDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA) as UserFormDialogData;
  private readonly ref = inject(MatDialogRef<UserFormDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminUsersService);

  protected readonly busy = signal(false);
  protected readonly err = signal('');

  protected form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    firstName: [''],
    lastName: [''],
    phone: [''],
    address: [''],
    level: [''],
    userType: this.fb.control<UserType>('PLAYER', { nonNullable: true }),
    active: this.fb.control(true, { nonNullable: true }),
    newPassword: [''],
  });

  constructor() {
    if (this.data.mode === 'create') {
      this.form.get('password')?.addValidators([Validators.required, Validators.minLength(8)]);
    } else if (this.data.user) {
      const u = this.data.user;
      this.form.patchValue({
        username: u.username,
        email: u.email,
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        phone: u.phone ?? '',
        address: u.address ?? '',
        level: u.level ?? '',
        userType: u.userType,
        active: u.active,
      });
      this.form.get('email')?.disable();
      this.form.get('username')?.disable();
    }
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
    if (this.data.mode === 'create') {
      const v = this.form.getRawValue();
      this.api
        .create({
          username: v.username!,
          email: v.email!,
          password: v.password!,
          firstName: v.firstName?.trim() || null,
          lastName: v.lastName?.trim() || null,
          phone: v.phone?.trim() || null,
          address: v.address?.trim() || null,
          level: v.level?.trim() || null,
          userType: v.userType!,
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
    } else {
      const u = this.data.user;
      if (!u) {
        this.busy.set(false);
        return;
      }
      const v = this.form.getRawValue();
      this.api
        .update(u.id, {
          firstName: v.firstName?.trim() || null,
          lastName: v.lastName?.trim() || null,
          phone: v.phone?.trim() || null,
          address: v.address?.trim() || null,
          level: v.level?.trim() || null,
          userType: v.userType ?? undefined,
          active: v.active,
          newPassword: v.newPassword?.trim() || undefined,
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
