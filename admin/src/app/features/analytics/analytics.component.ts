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

import type {
  DailyCountPoint,
  DashboardStats,
} from '../../core/models/dashboard-stats.model';

import { AdminDashboardService } from '../../core/services/admin-dashboard.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnDestroy, AfterViewChecked {
  private readonly dashboardApi = inject(AdminDashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly err = signal<string | null>(null);
  protected readonly stats = signal<DashboardStats | null>(null);

  private charts: Chart[] = [];
  private chartsRendered = false;

  @ViewChild('trendCanvas')
  private trendCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('ordersCanvas')
  private ordersCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('userTypesCanvas')
  private userTypesCanvas?: ElementRef<HTMLCanvasElement>;

  constructor() {
    this.dashboardApi
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
          this.chartsRendered = false;
        },
        error: () => {
          this.loading.set(false);
          this.err.set('Không tải được phân tích.');
        },
      });
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

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  protected fmtNumber(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n);
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private renderCharts(stats: DashboardStats): void {
    this.destroyCharts();

    const bodyFont =
      typeof document !== 'undefined'
        ? getComputedStyle(document.body).fontFamily
        : '';

    if (bodyFont) {
      Chart.defaults.font.family = bodyFont;
    }

    const commonLegend = {
      position: 'bottom' as const,
      labels: {
        boxWidth: 10,
        usePointStyle: true,
        color: '#111827',
        font: {
          size: 13,
          weight: 500,
        },
      },
    };

    this.renderTrendChart(stats, commonLegend);
    this.renderOrdersChart(stats, commonLegend);
    this.renderUserTypesChart(stats);
  }

  private renderTrendChart(
    stats: DashboardStats,
    commonLegend: {
      position: 'bottom';
      labels: {
        boxWidth: number;
        usePointStyle: boolean;
        color: string;
        font: {
          size: number;
          weight: number;
        };
      };
    }
  ): void {
    const lineCanvas = this.trendCanvas?.nativeElement ?? null;

    if (!lineCanvas) {
      return;
    }

    const labels = stats.productsCreatedDaily.map((d: DailyCountPoint) =>
      formatChartDayLabel(d.date)
    );

    const line = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Địa điểm mới',
            data: stats.productsCreatedDaily.map((d: DailyCountPoint) => d.count),
            borderColor: '#0059b5',
            backgroundColor: 'rgba(0, 89, 181, 0.12)',
            fill: true,
            tension: 0.28,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 3,
          },
          {
            label: 'Đăng ký user',
            data: stats.usersRegisteredDaily.map((d: DailyCountPoint) => d.count),
            borderColor: '#006e28',
            backgroundColor: 'rgba(0, 110, 40, 0.08)',
            fill: true,
            tension: 0.28,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 2,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: commonLegend,
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#374151',
              font: {
                size: 12,
                weight: 500,
              },
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.25)',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#374151',
              font: {
                size: 12,
                weight: 500,
              },
            },
          },
        },
      },
    });

    this.charts.push(line);
  }

  private renderOrdersChart(
    stats: DashboardStats,
    commonLegend: {
      position: 'bottom';
      labels: {
        boxWidth: number;
        usePointStyle: boolean;
        color: string;
        font: {
          size: number;
          weight: number;
        };
      };
    }
  ): void {
    const ordersCanvas = this.ordersCanvas?.nativeElement ?? null;

    if (!ordersCanvas) {
      return;
    }

    const monthly = stats.ordersByMonth ?? [];

    const bar = new Chart(ordersCanvas, {
      type: 'bar',
      data: {
        labels: monthly.map((d: DailyCountPoint) =>
          formatChartMonthLabel(d.date)
        ),
        datasets: [
          {
            label: 'Đơn đặt chỗ',
            data: monthly.map((d: DailyCountPoint) => d.count),
            backgroundColor: 'rgba(0, 89, 181, 0.45)',
            borderColor: '#0059b5',
            borderWidth: 1,
            borderRadius: 8,
            maxBarThickness: 52,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 2,
        plugins: {
          legend: commonLegend,
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#374151',
              font: {
                size: 12,
                weight: 500,
              },
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.25)',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#374151',
              font: {
                size: 12,
                weight: 500,
              },
            },
          },
        },
      },
    });

    this.charts.push(bar);
  }

  private renderUserTypesChart(stats: DashboardStats): void {
    const utCanvas = this.userTypesCanvas?.nativeElement ?? null;

    if (!utCanvas || !stats.usersByUserType?.length) {
      return;
    }

    const barH = new Chart(utCanvas, {
      type: 'bar',
      data: {
        labels: stats.usersByUserType.map((x) => x.label),
        datasets: [
          {
            label: 'Người dùng',
            data: stats.usersByUserType.map((x) => x.count),
            backgroundColor: 'rgba(0, 110, 40, 0.35)',
            borderColor: '#006e28',
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 2,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#374151',
              font: {
                size: 12,
                weight: 500,
              },
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.25)',
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#334155',
              font: {
                size: 12,
                weight: 500,
              },
            },
          },
        },
      },
    });

    this.charts.push(barH);
  }

  /** Kết hợp chuỗi daily / monthly. */
  protected monthlyBookings(monthly: DailyCountPoint[]): number {
    const m = monthly ?? [];
    return m.reduce((a, x) => a + x.count, 0);
  }

  protected sumDailyCount(rows: DailyCountPoint[]): number {
    return rows.reduce((sum, x) => sum + x.count, 0);
  }

  /** So sánh nửa đầu / nửa sau chuỗi đăng ký. */
  protected trendPct(daily: DailyCountPoint[]): string | null {
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
}

function formatChartDayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatChartMonthLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toLocaleDateString('vi-VN', {
    month: 'short',
    year: 'numeric',
  });
}