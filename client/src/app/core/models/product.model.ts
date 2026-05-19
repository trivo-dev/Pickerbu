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
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
