import type { Product } from '../../core/models/product.model';

export type CourtFormDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; product: Product };
