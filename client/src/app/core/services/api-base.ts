import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

/** Base URL gọi Spring API (có cả khi chạy SSR trên Node). */
export function resolveApiBase(platformId: object): string {
  const e = environment.apiUrl;
  if (isPlatformBrowser(platformId)) {
    return e;
  }
  if (e) {
    return e;
  }
  if (typeof process !== 'undefined' && process.env && process.env['API_URL']) {
    return process.env['API_URL'];
  }
  return 'http://localhost:8080';
}
