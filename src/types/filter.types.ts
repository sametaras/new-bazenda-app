/**
 * Filter Types
 * Bazenda advanced filters
 */

export interface FilterOption {
  id: string;
  text: string;
  count: string;
}

export interface FilterResponse {
  results: FilterOption[];
}

export interface Gender {
  id: number;
  text: string;
}

export const GENDERS: Gender[] = [
  { id: 1, text: 'Kadın' },
  { id: 2, text: 'Erkek' },
  { id: 3, text: 'Erkek Çocuk / Bebek' },
  { id: 4, text: 'Kız Çocuk / Bebek' },
  { id: 5, text: 'Unisex' },
];

export interface SearchFilters {
  colors: string[]; // color IDs
  sizes: string[]; // size IDs
  brands: string[]; // brand IDs
  genders: number[]; // gender IDs
  priceMin?: string;
  priceMax?: string;
}

export interface ActiveFilters extends SearchFilters {
  colorLabels: string[];
  sizeLabels: string[];
  brandLabels: string[];
  genderLabels: string[];
}
