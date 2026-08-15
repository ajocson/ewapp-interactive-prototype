import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { LeadCardData } from '../lead-board.model';
import { DraftSiStep, InsuranceProduct, ProductCategory } from './draft-si-flow.model';

@Component({
  selector: 'lam-draft-si-flow',
  templateUrl: './draft-si-flow.component.html',
  styleUrl: './draft-si-flow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DraftSiFlowComponent {
  @Input({ required: true }) lead!: LeadCardData;
  @Output() closed = new EventEmitter<void>();

  step: DraftSiStep = 1;
  activeCategory: ProductCategory = 'All Products';
  selectedProduct: InsuranceProduct | null = null;
  gender = 'Male';
  dateOfBirth = 'January 01, 1990';
  paymentPeriod = '5 Pay';
  paymentFrequency = 'Annual';
  benefitAmount = '500,000';
  proposalOpen = false;

  readonly categories: readonly ProductCategory[] = ['All Products', 'Traditional', 'Variable Unit Link'];
  readonly products: readonly InsuranceProduct[] = [
    { id: 'dream-builder', name: 'Dream Builder', category: 'Traditional' },
    { id: 'future-assure', name: 'Future Assure', category: 'Traditional' },
    { id: 'future-assure-max-peso', name: 'Future Assure Max (Peso)', category: 'Traditional' },
    { id: 'future-assure-max-dollar', name: 'Future Assure Max (US Dollar)', category: 'Traditional' },
    { id: 'future-assure-regular-pay', name: 'Future Assure Regular Pay', category: 'Traditional' },
    { id: 'life-essentials', name: 'Life Essentials', category: 'Traditional' },
    { id: 'sure-start', name: 'Sure Start', category: 'Variable Unit Link' }
  ];

  get visibleProducts(): readonly InsuranceProduct[] {
    return this.activeCategory === 'All Products'
      ? this.products
      : this.products.filter((product) => product.category === this.activeCategory);
  }

  get productName(): string {
    return this.selectedProduct?.name ?? 'Dream Builder';
  }

  get annualPremium(): string {
    return this.paymentPeriod && this.paymentFrequency && this.benefitAmount ? '117,750.00' : '';
  }

  @HostListener('document:keydown.escape')
  closeWithEscape(): void {
    if (this.step !== 'results') {
      this.closed.emit();
    }
  }

  selectCategory(category: ProductCategory): void {
    this.activeCategory = category;
  }

  selectProduct(product: InsuranceProduct): void {
    this.selectedProduct = product;
  }

  goToStep(step: DraftSiStep): void {
    this.step = step;
  }

  startNewDraft(): void {
    this.step = 1;
    this.activeCategory = 'All Products';
    this.selectedProduct = null;
    this.gender = 'Male';
    this.dateOfBirth = 'January 01, 1990';
    this.paymentPeriod = '5 Pay';
    this.paymentFrequency = 'Annual';
    this.benefitAmount = '500,000';
  }

  downloadResults(): void {
    const anchor = document.createElement('a');
    anchor.href = 'assets/si-page-1.png';
    anchor.download = 'draft-sales-illustration-results.png';
    anchor.click();
  }

  openProposal(): void {
    this.proposalOpen = true;
  }

  trackProduct(index: number, product: InsuranceProduct): string {
    return product.id;
  }
}
