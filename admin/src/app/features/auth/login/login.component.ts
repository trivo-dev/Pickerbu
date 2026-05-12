import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(MatSnackBar);

  protected readonly busy = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('session') === 'expired') {
      this.snack.open('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Đóng', {
        duration: 5000,
      });
    }
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.busy.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigate(['/']);
        this.snack.open('Đăng nhập thành công', 'Đóng', { duration: 3000 });
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.snack.open(this.readError(e) || 'Đăng nhập thất bại', 'Đóng', {
          duration: 5000,
        });
      },
    });
  }

  private readError(e: HttpErrorResponse): string {
    if (e.error && typeof e.error === 'object' && 'message' in e.error) {
      return String((e.error as { message: string }).message);
    }
    return e.statusText;
  }
}
