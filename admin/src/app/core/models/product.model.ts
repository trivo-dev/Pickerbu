/** Khớp ProductImageResponse từ API. */
export interface ProductImageRef {
  id: number;
  url: string;
}

/** Khớp ProductPriceDto từ API (chi tiết GET /admin/products/{id}). */
export interface ProductPriceRef {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  weekend: boolean;
}

/** Khớp ProductUtilityDto (chi tiết GET). */
export interface ProductUtilityRef {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  rate: number;
  ownerUserId: number | null;
  ownerEmail: string | null;
  status: string;
  createdAt: string;
  images: ProductImageRef[];
  /** Chi tiết sản phẩm có thêm `prices` / `utilities` (backend). */
  prices?: ProductPriceRef[];
  utilities?: ProductUtilityRef[];
}
