import {
  AfterViewChecked,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { DailyCountPoint, DashboardStats } from '../../core/models/dashboard-stats.model';
import { AdminDashboardService } from '../../core/services/admin-dashboard.service';
import { AdminNotificationsService } from '../../core/services/admin-notifications.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnDestroy,AfterViewChecked {
  protected readonly auth = inject(AuthService);
  private readonly dashboardApi = inject(AdminDashboardService);
  private readonly notificationsApi = inject(AdminNotificationsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly statsLoading = signal(false);
  protected readonly statsError = signal<string | null>(null);
  protected readonly unreadNotifCount = signal(0);

  private charts: Chart[] = [];

  @ViewChild('trendCanvas')
 private trendCanvas?: ElementRef<HTMLCanvasElement>;

 @ViewChild('ordersCanvas')
private ordersCanvas?: ElementRef<HTMLCanvasElement>;

private chartsRendered = false;

  constructor() {
    if (this.auth.user()?.userType === 'ADMIN') {
      this.statsLoading.set(true);
      this.dashboardApi
        .getStats()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
  this.stats.set(data);
  this.statsLoading.set(false);
  this.chartsRendered = false;

          },
          error: () => {
            this.statsLoading.set(false);
            this.statsError.set('Không tải được số liệu thống kê.');
          },
        });

      this.notificationsApi
        .countUnread()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (n) => this.unreadNotifCount.set(n),
          error: () => {},
        });
    }
  }
  //note 
  ngOnDestroy(): void {
    this.destroyCharts();
  }
  ngAfterViewChecked(): void {
  const st = this.stats();

  if (!st || this.chartsRendered) {
    return;
  }

  if (!this.trendCanvas?.nativeElement || !this.ordersCanvas?.nativeElement) {
    return;
  }

  this.renderCharts(st);
  this.chartsRendered = true;
}
  protected fmtNumber(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n);
  }

  protected fmtAbbrev(n: number): string {
    if (n >= 1_000_000) {
      const v = (n / 1_000_000).toFixed(1).replace(/\.0$/, '');
      return `${v}M`;
    }
    if (n >= 1_000) {
      const v = (n / 1_000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '');
      return `${v}k`;
    }
    return String(n);
  }

  protected sumDaily(daily: DailyCountPoint[], last: number): number {
    const slice = daily.slice(Math.max(0, daily.length - last));
    return slice.reduce((a, x) => a + x.count, 0);
  }

  protected trendStr(daily: DailyCountPoint[]): string | null {
    if (daily.length < 8) {
      return null;
    }
    const half = Math.floor(daily.length / 2);
    const a = daily.slice(0, half).reduce((s, x) => s + x.count, 0);
    const b = daily.slice(half).reduce((s, x) => s + x.count, 0);
    if (a === 0 && b === 0) {
      return null;
    }
    const raw = a === 0 ? 100 : ((b - a) / a) * 100;
    const pct = Math.round(raw * 10) / 10;
    if (Math.abs(pct) < 0.05) {
      return null;
    }
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct}%`;
  }

  protected activeProductPct(st: DashboardStats): number {
    const t = st.summary.totalProducts;
    if (!t) {
      return 0;
    }
    return Math.min(100, (100 * st.summary.activeProducts) / t);
  }

  protected inactiveProductPct(st: DashboardStats): number {
    const t = st.summary.totalProducts;
    if (!t) {
      return 0;
    }
    return Math.min(100, (100 * st.summary.inactiveProducts) / t);
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private renderCharts(stats: DashboardStats): void {
    this.destroyCharts();

    const bodyFont =
      typeof document !== 'undefined' ? getComputedStyle(document.body).fontFamily : '';
    if (bodyFont) {
      Chart.defaults.font.family = bodyFont;
    }

    const lineCanvas = document.getElementById('dash-chart-trends') as HTMLCanvasElement | null;

    if (lineCanvas) {
      const labels = stats.productsCreatedDaily.map((d) => formatChartDayLabel(d.date));
      const prodData = stats.productsCreatedDaily.map((d) => d.count);
      const userData = stats.usersRegisteredDaily.map((d) => d.count);
      const line = new Chart(lineCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Địa điểm mới',
              data: prodData,
              borderColor: '#0059b5',
              backgroundColor: 'rgba(0, 89, 181, 0.1)',
              fill: true,
              tension: 0.28,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
            {
              label: 'Đăng ký user',
              data: userData,
              borderColor: '#006e28',
              backgroundColor: 'rgba(0, 110, 40, 0.06)',
              fill: true,
              tension: 0.28,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                usePointStyle: true,
              },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
            x: {
              grid: { display: false },
              ticks: { color: '#717785', font: { size: 11 } },
            },
          },
        },
      });
      this.charts.push(line);
    }

    const ordersCanvas = document.getElementById('dash-chart-orders') as HTMLCanvasElement | null;
    const monthly = stats.ordersByMonth ?? [];
    if (ordersCanvas) {
      const bar = new Chart(ordersCanvas, {
        type: 'bar',
        data: {
          labels: monthly.map((d: DailyCountPoint) => formatChartMonthLabel(d.date)),
          datasets: [
            {
              label: 'Đơn đặt chỗ',
              data: monthly.map((d: DailyCountPoint) => d.count),
              backgroundColor: 'rgba(0, 89, 181, 0.42)',
              borderColor: '#0059b5',
              borderWidth: 1,
              borderRadius: 8,
              maxBarThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, usePointStyle: true },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
            x: { grid: { display: false }, ticks: { color: '#717785', font: { size: 11 } } },
          },
        },
      });
      this.charts.push(bar);
    }
  }
}

function formatChartDayLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function formatChartMonthLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00Z');
  return d.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
}
