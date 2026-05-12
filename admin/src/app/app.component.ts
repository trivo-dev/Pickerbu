import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter, map, merge, of } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly breakpoint = inject(BreakpointObserver);

  protected readonly auth = inject(AuthService);
  protected readonly sidenavOpen = signal(false);
  protected readonly isMobile: ReturnType<typeof toSignal<boolean>> = toSignal(
    this.breakpoint
      .observe('(max-width: 959.98px)')
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly currentTitle = toSignal(
    merge(
      of(this.titleForPath(this.router.url)),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.titleForPath(this.router.url)),
      ),
    ),
    { requireSync: true },
  );

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.isMobile()) {
          this.sidenavOpen.set(false);
        }
      });
  }

  protected onSidenavChanged(open: boolean): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(open);
    }
  }

  protected openSidenav(): void {
    this.sidenavOpen.set(true);
  }

  protected closeSidenavAfterNav(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }

  private titleForPath(path: string): string {
    const p = path.split('?')[0];
    if (p === '' || p === '/') {
      return 'Tổng quan';
    }
    if (p.startsWith('/account')) {
      return 'Tài khoản';
    }
    if (p.startsWith('/users')) {
      return 'Người dùng';
    }
    if (p.startsWith('/products')) {
      return 'Sản phẩm / địa điểm';
    }
    return 'Quản trị';
  }
}
