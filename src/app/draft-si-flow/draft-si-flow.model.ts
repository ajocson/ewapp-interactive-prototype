export type DraftSiStep = 1 | 2 | 3 | 4 | 'results';

export type ProductCategory = 'All Products' | 'Traditional' | 'Variable Unit Link';

export interface InsuranceProduct {
  readonly id: string;
  readonly name: string;
  readonly category: Exclude<ProductCategory, 'All Products'>;
}

