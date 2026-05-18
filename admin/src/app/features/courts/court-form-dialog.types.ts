import type { Product } from '../../core/models/product.model';

export type CourtFormDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; product: Product };

/** Kết quả đóng dialog: `true` = đã lưu (edit); object = đã tạo mới + id để mở upload ảnh. */
export type CourtFormDialogResult =
  | true
  | { saved: true; newProductId: number };
