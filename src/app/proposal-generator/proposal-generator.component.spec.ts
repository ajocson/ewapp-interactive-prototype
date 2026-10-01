import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

import { LamComponentsModule } from '../components/lam-components.module';
import { ButtonModule } from '../shared/components/button/button.module';
import { FieldControlModule } from '../shared/components/field-control/field-control.module';
import { RadioModule } from '../shared/components/radio/radio.module';
import { TabGroupModule } from '../shared/components/tab-group/tab-group.module';
import { ProposalGeneratorComponent } from './proposal-generator.component';
import { MeshGradientComponent } from './mesh-gradient.component';
import { ProposalRecommendationDetailModule } from './proposal-recommendation-detail.module';

describe('ProposalGeneratorComponent', () => {
  let fixture: ComponentFixture<ProposalGeneratorComponent>;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await TestBed.configureTestingModule({
      imports: [ButtonModule, FieldControlModule, LamComponentsModule, MeshGradientComponent, ProposalRecommendationDetailModule, RadioModule, RouterTestingModule.withRoutes([]), TabGroupModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalGeneratorComponent);
    fixture.detectChanges();
  });

  afterEach(() => vi.restoreAllMocks());

  it('opens the first questionnaire state from the hero CTA', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;

    cta.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-questionnaire')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('QUESTION 1 OF 7');
    expect(fixture.nativeElement.textContent).toContain('Who will be covered by the plan?');
  });

  it('supports opening directly in the recommendations view', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    expect(fixture.componentInstance.showQuestionnaire).toBe(true);
    expect(fixture.componentInstance.showRecommendations).toBe(true);
    expect(fixture.nativeElement.querySelector('#proposal-recommendations-title')?.textContent).toContain('Here’s What We Recommend for You');
  });

  it('shows entered insured and benefit values in the product proposal summary', () => {
    const component = fixture.componentInstance;
    component.birthdate = '1990-09-30';
    component.gender = 'Female';
    component.selectedProductNames = ['Future Assure'];
    component.productBenefitValues = {
      'Future Assure': { paymentPeriod: '10 years', annualPremium: '80000', benefitAmount: '4200000' }
    };

    expect(component.productInfoInsuredAge).toBe(String(new Date().getFullYear() - 1990 - (new Date().getMonth() < 8 || (new Date().getMonth() === 8 && new Date().getDate() < 30) ? 1 : 0)));
    expect(component.getProductSummaryRows('Future Assure')).toEqual([
      { label: 'Payment Period', value: '10 years' },
      { label: 'Annual Premium', value: '₱80,000' },
      { label: 'Benefit Amount', value: '₱4,200,000' },
      { label: 'Riders', value: '—' },
      { label: 'Funds', value: '—' }
    ]);
  });

  it('offers the three create-proposal payment periods and prefills sample amounts for 10 years', () => {
    const component = fixture.componentInstance;
    expect(component.productBenefitPaymentPeriodOptions.map(option => option.value)).toEqual(['3 years', '5 years', '10 years']);

    component.setProductBenefitPaymentPeriod('Future Assure (Dollar)', '10 years');
    expect(component.getProductBenefitValue('Future Assure (Dollar)', 'benefitAmount')).toBe('4200000');
    expect(component.getProductBenefitValue('Future Assure (Dollar)', 'singlePremium')).toBe('80000');

    component.setProductBenefitValue('Future Assure (Dollar)', 'singlePremium', '90000');
    component.setProductBenefitPaymentPeriod('Future Assure (Dollar)', '5 years');
    expect(component.getProductBenefitValue('Future Assure (Dollar)', 'singlePremium')).toBe('90000');

    component.setProductBenefitPaymentPeriod('Endowment', '10 years');
    expect(component.getProductBenefitValue('Endowment', 'benefitAmount')).toBe('4200000');
    expect(component.getProductBenefitValue('Endowment', 'annualPremium')).toBe('80000');
  });

  it('capitalizes the first character in Create Proposal name fields', () => {
    expect(fixture.componentInstance.capitalizeName('miguel')).toBe('Miguel');
    expect(fixture.componentInstance.capitalizeName('  hernandez')).toBe('  Hernandez');
    expect(fixture.componentInstance.capitalizeName('')).toBe('');
  });

  it('uses the requested benefit fields for every available product', () => {
    const component = fixture.componentInstance;
    const fields = (product: string) => component.getProductBenefitFields(product).map(field => field.label);

    expect(fields('Future Assure')).toEqual(['Payment Period', 'Annual Premium', 'Benefit Amount']);
    expect(fields('Dream Builder')).toEqual(['Payment Period', 'Payment Frequency', 'Basic Sum Insured', 'Annual Premium', 'Discount Type']);
    expect(fields('Endowment')).toEqual(['Payment Period', 'Payment Frequency', 'Policy Term', 'Annual Premium', 'Benefit Amount', 'Discount Type']);
    expect(fields('Future Assure (Peso)')).toEqual(['Payment Period', 'Single Premium', 'Benefit Amount']);
    expect(fields('Future Assure (Dollar)')).toEqual(['Payment Period', 'Single Premium', 'Benefit Amount', 'Discount Type']);
    expect(fields('Future Assure (Regular Pay)')).toEqual(['Payment Period', 'Annual Premium', 'Benefit Amount']);
    expect(fields('Life Essential')).toEqual(['Payment Period', 'Payment Frequency', 'Basic Sum Insured', 'Discount Type']);
    expect(fields('Sure Start')).toEqual(['Payment Period', 'Payment Frequency', 'Basic Sum Insured', 'Annual Premium', 'Discount Type']);
    expect(fields('Troo Big Umbrella')).toEqual(['Payment Period', 'Payment Frequency', 'Annual Premium', 'Discount Type']);
    expect(fields('Troo Graduate')).toEqual(['Payment Period', 'Payment Frequency', 'Policy Term', 'Benefit Amount', 'Discount Type', 'Payout Option']);
    expect(fields('Troo Legacy')).toEqual(['Payment Period', 'Payment Frequency', 'Benefit Amount', 'Discount Type']);
    expect(fields('Troo Prime Umbrella')).toEqual(['Payment Period', 'Payment Frequency', 'Annual Premium', 'Discount Type']);
    expect(fields('Troo Safety Umbrella')).toEqual(['Payment Period', 'Payment Frequency', 'Annual Premium', 'Discount Type']);
    expect(component.visibleProducts.map(product => product.name)).not.toEqual(expect.arrayContaining([
      'Troo Graduate', 'Troo Legacy', 'Troo Prime Umbrella', 'Troo Safety Umbrella'
    ]));
  });

  it('updates the benefit form when a payment period is selected', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.showQuestionnaire = true;
    component.showProductInfo = true;
    component.productInfoStep = 'benefits';
    component.selectedProductNames = ['Dream Builder'];
    component.expandedCreateProposalBenefitProduct = 'Dream Builder';
    fixture.componentRef.changeDetectorRef.detectChanges();
    fixture.detectChanges();

    const periodSelect = fixture.nativeElement.querySelector('.proposal-product-info__payment-select') as HTMLSelectElement;
    expect(Array.from(periodSelect.options).map(option => option.value)).toEqual(['', '3 years', '5 years', '10 years']);
    periodSelect.value = '10 years';
    periodSelect.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(component.getProductBenefitValue('Dream Builder', 'paymentPeriod')).toBe('10 years');
    expect(periodSelect.value).toBe('10 years');
    expect(periodSelect.selectedOptions[0]?.value).toBe('10 years');
    expect(component.getProductBenefitValue('Dream Builder', 'annualPremium')).toBe('80000');
  });

  it('adds an independent rider-selection step for each selected proposal before Funds', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.selectedProductNames = ['Future Assure', 'Dream Builder'];
    component.openSelectedProductProposal();
    component.productInfoStep = 'benefits';
    fixture.componentRef.changeDetectorRef.detectChanges();
    fixture.detectChanges();

    const nextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    expect(nextButton.disabled).toBe(false);

    nextButton.click();
    fixture.detectChanges();
    expect(component.showProductInfo).toBe(true);
    expect(component.productInfoStep).toBe('riders');
    expect(fixture.nativeElement.textContent).toContain('Choose the additional protection to include with each proposal.');
    expect(fixture.nativeElement.querySelectorAll('.proposal-product-info__rider-product')).toHaveLength(2);

    const futureAssureCard = fixture.nativeElement.querySelector('.proposal-product-info__rider-product') as HTMLElement;
    const productAccordion = futureAssureCard.querySelector('.proposal-product-info__rider-product-toggle') as HTMLButtonElement;
    expect(productAccordion.getAttribute('aria-expanded')).toBe('true');
    expect(futureAssureCard.querySelector('.proposal-product-info__rider-groups')).not.toBeNull();
    productAccordion.click();
    fixture.detectChanges();
    const endowmentAccordion = (fixture.nativeElement.querySelectorAll('.proposal-product-info__rider-product-toggle') as NodeListOf<HTMLButtonElement>)[1];
    expect(productAccordion.getAttribute('aria-expanded')).toBe('false');
    expect(endowmentAccordion.getAttribute('aria-expanded')).toBe('true');
    productAccordion.click();
    fixture.detectChanges();
    expect(productAccordion.getAttribute('aria-expanded')).toBe('true');
    (futureAssureCard.querySelector('button[aria-label^="Add "]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.getCreateProposalRiders('Future Assure', true)).toHaveLength(3);
    expect(component.getCreateProposalRiders('Dream Builder', true)).toHaveLength(2);
    expect(component.proposalEditIncludedRiders).toHaveLength(2);

    const ridersNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    ridersNextButton.click();
    fixture.detectChanges();
    expect(component.showProductInfo).toBe(true);
    expect(component.productInfoStep).toBe('funds');
    expect(fixture.nativeElement.textContent).toContain('Premium Allocation');
    expect(fixture.nativeElement.querySelectorAll('.proposal-product-info__fund-product')).toHaveLength(2);
    expect(component.getCreateProposalFunds('Future Assure')[0].allocation).toBe(70);
    expect(component.getCreateProposalFunds('Dream Builder')[0].allocation).toBe(70);
    component.getCreateProposalFunds('Future Assure')[0].allocation = 60;
    expect(component.getCreateProposalFunds('Dream Builder')[0].allocation).toBe(70);
    expect(component.isCreateProposalFundAllocationComplete).toBe(false);
    expect(Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .some(button => button.textContent?.includes('Review Proposals'))).toBe(true);

    component.backToProductRiders();
    fixture.detectChanges();
    expect(component.showProductInfo).toBe(true);
    expect(component.productInfoStep).toBe('riders');
  });

  it('shows benefit details in independently collapsible product accordions', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.showQuestionnaire = true;
    component.showProductInfo = true;
    component.selectedProductNames = ['Dream Builder', 'Endowment'];
    component.productInfoStep = 'benefits';
    component.expandedCreateProposalBenefitProduct = 'Dream Builder';
    fixture.detectChanges();

    const accordions = fixture.nativeElement.querySelectorAll('.proposal-product-info__benefit-product-toggle') as NodeListOf<HTMLButtonElement>;
    expect(accordions).toHaveLength(2);
    expect(accordions[0].getAttribute('aria-expanded')).toBe('true');
    expect(accordions[1].getAttribute('aria-expanded')).toBe('false');

    accordions[0].click();
    fixture.detectChanges();
    expect(accordions[0].getAttribute('aria-expanded')).toBe('false');
    expect(accordions[1].getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[aria-label="Payment Period for Endowment"]')).not.toBeNull();
  });

  it('updates every Endowment control, summary value, and completion state from user input', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.showQuestionnaire = true;
    component.showProductInfo = true;
    component.productInfoStep = 'benefits';
    component.selectedProductNames = ['Endowment'];
    component.expandedProposalProduct = 'Endowment';
    component.expandedCreateProposalBenefitProduct = 'Endowment';
    fixture.componentRef.changeDetectorRef.detectChanges();
    fixture.detectChanges();

    const selectValue = (label: string, value: string): void => {
      const select = fixture.nativeElement.querySelector(`[aria-label="${label} for Endowment"]`) as HTMLSelectElement;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
    };
    selectValue('Payment Period', '10 years');
    selectValue('Payment Frequency', 'Monthly');
    selectValue('Policy Term', '15 years');
    selectValue('Discount Type', 'No Discount');

    const premiumInput = fixture.nativeElement.querySelector('[aria-label="Annual Premium for Endowment"]') as HTMLInputElement;
    premiumInput.value = '95000';
    premiumInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(component.areProductBenefitsComplete).toBe(true);
    expect(component.getProductSummaryRows('Endowment')).toEqual([
      { label: 'Payment Period', value: '10 years' },
      { label: 'Payment Frequency', value: 'Monthly' },
      { label: 'Policy Term', value: '15 years' },
      { label: 'Annual Premium', value: '₱95,000' },
      { label: 'Benefit Amount', value: '₱4,200,000' },
      { label: 'Discount Type', value: 'No Discount' },
      { label: 'Riders', value: '—' },
      { label: 'Funds', value: '—' }
    ]);
    const nextButton = fixture.nativeElement.querySelector('.proposal-product-info__actions app-button:last-child button') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(false);
  });

  it('returns to the recommended proposals when opened from recommendations', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('initialView', 'recommendations');
    component.showProposalDetails = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-detail__back-to-proposals')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-detail__meta')?.textContent).toBe('PROPOSAL NO. 802978');

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Back')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showRecommendations).toBe(true);
    expect(fixture.nativeElement.querySelector('#proposal-recommendations-title')?.textContent).toContain('Here’s What We Recommend for You');
  });

  it('keeps individual information out of proposal details if both view flags are active', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('initialView', 'recommendations');
    component.showProposalDetails = true;
    component.showProposalIndividualInfo = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('lam-proposal-recommendation-detail .proposal-detail')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__record-header')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs')).toBeNull();
    expect(fixture.nativeElement.querySelector('form.proposal-individual-info')).toBeNull();
  });

  it('keeps saved proposal cards free of the removed copy and duplicate actions', () => {
    const component = fixture.componentInstance;
    component.showQuestionnaire = true;
    component.navigateFromProposalApplication('proposals');
    fixture.detectChanges();

    const moreActionsButton = fixture.nativeElement.querySelector('.proposal-builder-saved-card__more') as HTMLButtonElement;
    expect(moreActionsButton).not.toBeNull();
    expect(moreActionsButton.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-card__menu')).toBeNull();
  });

  it('hides the sales illustration action from saved proposal cards', () => {
    const component = fixture.componentInstance;
    component.showQuestionnaire = true;
    component.navigateFromProposalApplication('proposals');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-card__action')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-card__open')).not.toBeNull();
  });

  it('returns to the recommended proposal details when cancelling the edit flow', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('View Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Edit Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor')).not.toBeNull();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Cancel')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-detail')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#proposal-detail-title')?.textContent).toBe('Dream Builder');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__record-header')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs')).toBeNull();
    expect(fixture.nativeElement.querySelector('form.proposal-individual-info')).toBeNull();
  });

  it('opens the proposal editor from recommended proposal details', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('initialView', 'recommendations');
    component.showProposalDetails = true;
    fixture.detectChanges();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Edit Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showProposalDetails).toBe(false);
    expect(component.showProposalBenefitEditor).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor')).not.toBeNull();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement).click();
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement).click();
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Save Changes')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showProposalDetails).toBe(true);
    expect(component.showProposalBenefitEditor).toBe(false);
  });

  it('returns to All Proposals from a saved proposal detail', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('initialView', 'recommendations');
    component.showProposalDetails = true;
    component.proposalDetailReturnTarget = 'saved-list';
    fixture.detectChanges();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Back') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showProposalDetails).toBe(false);
    expect(component.showProposalBuilderSavedList).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-list h2')?.textContent).toBe('All Proposals');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__record-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs button.is-active')?.textContent).toContain('Proposals');
  });

  it('starts the saved-list create flow on product selection and advances through Funds to proposal review', () => {
    const component = fixture.componentInstance;
    component.noMiddleName = true;
    component.startAnotherProposal();
    fixture.detectChanges();
    expect(component.showProductInfo).toBe(true);
    expect(component.startedFromSavedProposalList).toBe(true);
    expect(component.productInfoStep).toBe('products');
    expect(component.selectedProductNames).toEqual([]);
    expect(fixture.nativeElement.querySelector('.proposal-product-info__product-grid')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-product-info__summary')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-product-info__heading p:last-child')?.textContent).toBe('Select one or more products to create proposals.');
    (fixture.nativeElement.querySelector('input[aria-label="Select Future Assure"]') as HTMLInputElement).click();
    component.toggleProductSelection('Dream Builder', true);
    fixture.detectChanges();
    component.continueFromSavedProposalProducts();
    fixture.detectChanges();
    expect(component.productInfoStep).toBe('info');
    expect(component.selectedProductNames).toEqual(['Future Assure', 'Dream Builder']);
    expect(Array.from(fixture.nativeElement.querySelectorAll('.proposal-product-info__actions app-button button') as NodeListOf<HTMLButtonElement>)[0].textContent).toContain('Back');
    component.backToSavedProposalProducts();
    fixture.detectChanges();
    expect(component.productInfoStep).toBe('products');
    expect(component.selectedProductNames).toEqual(['Future Assure', 'Dream Builder']);
    component.continueFromSavedProposalProducts();
    fixture.detectChanges();
    expect(component.noMiddleName).toBe(false);
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__record-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs button.is-active')?.textContent).toContain('Proposals');

    component.birthdate = '1990-01-01';
    component.gender = 'Male';
    component.continueFromProductInfo();
    component.continueFromProductBenefits();
    component.continueFromProductRiders();
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(component.productInfoStep).toBe('funds');
    expect(component.startedFromSavedProposalList).toBe(true);
    expect(component.productInfoContinueLabel).toBe('Review Proposals');
    component.setProductBenefitField('Future Assure', 'paymentPeriod', '10 years');
    component.setProductBenefitValue('Future Assure', 'annualPremium', '80000');
    component.getCreateProposalFunds('Future Assure')[0].allocation = 60;
    fixture.detectChanges();
    const reviewButton = fixture.nativeElement.querySelector('.proposal-product-info__actions app-button:last-child button') as HTMLButtonElement;
    expect(reviewButton.disabled).toBe(false);
    reviewButton.click();
    fixture.detectChanges();
    expect(component.showCreateProposalReview).toBe(true);
    expect((fixture.nativeElement.querySelector('.proposal-create-review__actions app-button:last-child button') as HTMLButtonElement).disabled).toBe(true);
    expect(component.getCreateProposalReviewRows().length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.proposal-questionnaire')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-create-review__table-scroll')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-create-review h1')?.textContent).toContain('Review Proposals');
    expect(fixture.nativeElement.querySelectorAll('.proposal-create-review__table thead th').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.proposal-create-review__table')?.textContent).toContain('Annual Premium');
    expect(fixture.nativeElement.querySelector('.proposal-create-review__table')?.textContent).toContain('₱80,000');

    (fixture.nativeElement.querySelectorAll('.proposal-create-review__actions app-button button')[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showCreateProposalReview).toBe(false);
    component.getCreateProposalFunds('Future Assure')[0].allocation = 70;
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-product-info__actions app-button:last-child button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showCreateProposalReview).toBe(true);
    expect((fixture.nativeElement.querySelector('.proposal-create-review__actions app-button:last-child button') as HTMLButtonElement).disabled).toBe(false);

    (fixture.nativeElement.querySelector('.proposal-create-review__table tfoot td:nth-of-type(2) app-button button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selectedProductNames).toEqual(['Future Assure']);
    expect(fixture.nativeElement.querySelectorAll('.proposal-create-review__table thead th').length).toBe(2);

    (fixture.nativeElement.querySelector('.proposal-create-review__actions app-button:last-child button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showProposalDetails).toBe(false);
    expect(component.showCreateProposalReview).toBe(false);
    expect(component.showProductInfo).toBe(false);
    expect(component.showProposalBuilderSavedList).toBe(true);
    expect(component.createdSavedProposals.map(proposal => proposal.name)).toEqual(['Future Assure']);
    expect(fixture.nativeElement.querySelectorAll('.proposal-builder-saved-card').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-list h2')?.textContent).toBe('All Proposals');
    expect(fixture.nativeElement.querySelector('app-section-message')?.textContent).toContain('Proposal saved successfully.');
  });

  it('shows Review Proposals on the product-selection flow on first landing and after returning from details', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.showQuestionnaire = true;
    component.showProductInfo = true;
    component.startedFromProductSelection = true;
    component.startedFromSavedProposalList = false;
    component.productInfoStep = 'funds';
    component.selectedProductNames = ['Future Assure', 'Dream Builder'];
    fixture.detectChanges();

    expect(component.productInfoContinueLabel).toBe('Review Proposals');
    const reviewButton = () => Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Review Proposals')) as HTMLButtonElement;
    expect(reviewButton()).toBeTruthy();

    component.continueFromProductFunds();
    fixture.detectChanges();
    expect(component.showProposalDetails).toBe(true);
    expect(component.startedFromSavedProposalList).toBe(false);

    component.returnFromProposalDetail();
    fixture.detectChanges();
    expect(component.productInfoStep).toBe('funds');
    expect(component.startedFromSavedProposalList).toBe(false);
    expect(component.productInfoContinueLabel).toBe('Review Proposals');
    reviewButton().click();
    fixture.detectChanges();
    expect(component.showCreateProposalReview).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-create-review')).not.toBeNull();
  });

  it('keeps the single-product selection flow on its existing proposal detail path', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.selectedProductNames = ['Future Assure'];
    component.openSelectedProductProposal();
    component.productInfoStep = 'funds';
    fixture.detectChanges();

    expect(component.productInfoContinueLabel).toBe('Create Proposal');
    (fixture.nativeElement.querySelector('.proposal-product-info__actions app-button:last-child button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showProposalDetails).toBe(true);
    expect(component.showCreateProposalReview).toBe(false);
    expect(component.isMultiProductProposalCompletionFlow).toBe(false);
  });

  it('completes and saves multiple selected proposals through the existing info and CSA flow', () => {
    fixture.componentRef.setInput('initialView', 'landing');
    const component = fixture.componentInstance;
    component.selectedProductNames = ['Future Assure', 'Dream Builder'];
    component.openSelectedProductProposal();
    component.productInfoStep = 'funds';
    component.setProductBenefitValue('Future Assure', 'paymentPeriod', '10 years');
    component.setProductBenefitValue('Future Assure', 'annualPremium', '80000');
    component.setProductBenefitValue('Future Assure', 'benefitAmount', '4200000');
    component.setProductBenefitValue('Dream Builder', 'paymentPeriod', '5 years');
    component.setProductBenefitValue('Dream Builder', 'annualPremium', '116450');
    component.setProductBenefitValue('Dream Builder', 'basicSumInsured', '250000');
    fixture.detectChanges();

    expect(component.productInfoContinueLabel).toBe('Review Proposals');
    (fixture.nativeElement.querySelector('.proposal-product-info__actions app-button:last-child button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showCreateProposalReview).toBe(true);
    expect(component.createProposalReviewContinueLabel).toBe('Create Proposals');
    (fixture.nativeElement.querySelector('.proposal-create-review__actions app-button:last-child button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.isMultiProductProposalCompletionFlow).toBe(true);
    expect(component.showProposalDetails).toBe(true);
    expect(component.showCreateProposalReview).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')?.textContent).toContain('Complete Individual Information');
    (Array.from(fixture.nativeElement.querySelectorAll('[role="dialog"] button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Continue to Complete Details')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showProposalIndividualInfo).toBe(true);
    expect(fixture.nativeElement.querySelector('form.proposal-individual-info')).not.toBeNull();
    expect(component.getProductBenefitValue('Future Assure', 'annualPremium')).toBe('80000');
    expect(component.getProductBenefitValue('Dream Builder', 'annualPremium')).toBe('116450');
    expect(component.getCreateProposalFunds('Future Assure')[0].allocation).toBe(70);
    expect(component.getCreateProposalFunds('Dream Builder')[0].allocation).toBe(70);

    component.requestSaveProposalIndividualInfo();
    component.confirmSaveProposalIndividualInfo();
    fixture.detectChanges();
    component.openProposalCsa();
    component.setProposalCsaStep('assessment');
    component.requestProposalCsaRiskProfile();
    component.requestProposalCreationFromCsa();
    fixture.detectChanges();
    expect(component.showProposalCsaCompletionModal).toBe(true);
    component.completeProposalFromCsa();
    fixture.detectChanges();

    expect(component.showProposalBuilderInfo).toBe(true);
    const proposalSummary = fixture.nativeElement.querySelector('.proposal-builder-info__summary') as HTMLElement;
    expect(proposalSummary.textContent).toContain('Future Assure');
    expect(proposalSummary.textContent).toContain('Dream Builder');
    expect(proposalSummary.textContent).toContain('₱80,000');
    expect(proposalSummary.textContent).toContain('₱116,450');
    expect(proposalSummary.textContent).toContain('Premium Allocation');
    expect(Array.from(proposalSummary.querySelectorAll('app-button button') as NodeListOf<HTMLButtonElement>)
      .some(button => button.textContent?.includes('Save Proposals'))).toBe(true);

    component.setProposalBuilderSameAsLead(true);
    component.requestProposalBuilderSave();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#proposal-builder-save-modal-title')?.textContent).toContain('Save Proposals');
    component.confirmProposalBuilderSave();
    fixture.detectChanges();
    expect(component.isMultiProductProposalCompletionFlow).toBe(false);
    expect(component.showProposalBuilderSavedList).toBe(true);
    expect(component.createdSavedProposals.map(proposal => proposal.name)).toEqual(['Future Assure', 'Dream Builder']);
    expect(component.proposalBuilderSaveToastMessage).toBe('Proposals saved successfully.');
  });

  it('renders the animated gradient inside the recommendations banner', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    const gradient = fixture.nativeElement.querySelector('app-mesh-gradient') as HTMLElement;

    expect(gradient).not.toBeNull();
    expect(gradient.parentElement?.classList.contains('proposal-recommendations__more-options')).toBe(true);
    expect(gradient.classList.contains('mesh-gradient--banner')).toBe(true);
    expect(gradient.getAttribute('aria-hidden')).toBe('true');
  });

  it('opens the selected proposal detail and returns to recommendations', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    const proposalContent = fixture.nativeElement.querySelector('.proposal-generator__content') as HTMLElement;
    proposalContent.scrollTop = 480;
    const viewProposal = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('View Proposal')) as HTMLButtonElement;
    viewProposal.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.showProposalDetails).toBe(true);
    expect(proposalContent.scrollTop).toBe(0);
    expect(fixture.nativeElement.querySelector('#proposal-detail-title')?.textContent).toContain('Dream Builder');
    expect(fixture.nativeElement.querySelector('.proposal-detail__summary')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-detail__details-heading h2')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-detail__tabs')?.getAttribute('aria-label')).toBe('Proposal details');
    expect(getComputedStyle(fixture.nativeElement.querySelector('.proposal-detail__tabs')).justifyContent).toBe('safe center');
    expect(fixture.nativeElement.textContent).toContain('Benefits');
    expect(fixture.nativeElement.querySelector('#proposal-tab-proposal-info')).toBeNull();
    expect((fixture.nativeElement.querySelector('#proposal-tab-benefits') as HTMLButtonElement).getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('₱250,000');

    (fixture.nativeElement.querySelector('#proposal-tab-protection') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#proposal-panel-protection h2')?.textContent).toBe('Added Protection for Life’s What-Ifs');
    expect(fixture.nativeElement.querySelector('#proposal-panel-protection header p')).toBeNull();

    proposalContent.scrollTop = 480;
    (fixture.nativeElement.querySelector('.proposal-detail__actions app-button:first-child button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.showProposalDetails).toBe(false);
    expect(proposalContent.scrollTop).toBe(0);
    expect(fixture.nativeElement.querySelector('#proposal-recommendations-title')).not.toBeNull();
  });

  it('opens proposal-only individual information from the proceed modal', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();
    component.gender = 'Female';
    component.birthdate = '1990-01-01';
    component.selectedCoverage = 'someone-else';
    component.proposalIndividualInfo.title = 'Mr.';
    component.proposalIndividualInfo.firstName = 'Miguel';
    component.proposalIndividualInfo.lastName = 'Hernandez';
    (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('View Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();

    const recommendationFooterText = fixture.nativeElement.querySelector('.proposal-detail__actions')?.textContent ?? '';
    expect(recommendationFooterText).toContain('Back');
    expect(recommendationFooterText).toContain('Edit Proposal');
    expect(recommendationFooterText).toContain('Proceed With This Proposal');
    expect(recommendationFooterText).not.toContain('Generate Sales Illustration');
    expect(recommendationFooterText).not.toContain('Convert to Application');

    (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Proceed With This Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')?.textContent).toContain('Complete Individual Information');

    (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Continue to Complete Details')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showProposalIndividualInfo).toBe(true);
    expect(component.showProposalDetails).toBe(false);
    expect(fixture.nativeElement.querySelector('.proposal-individual-info')?.textContent).toContain('Referrer Information');
    expect(fixture.nativeElement.querySelector('#proposal-owner-info-title')).toBeNull();
    expect(fixture.nativeElement.querySelector('#proposal-insured-info-title')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__identity-groups [name="proposalFirstName"]')).not.toBeNull();
    expect((fixture.nativeElement.querySelector('.proposal-individual-info__identity-groups [name="proposalBirthdate"]') as HTMLInputElement).disabled).toBe(true);
    expect(fixture.componentInstance.proposalIndividualInfoDisplayName).toBe('Mr. Miguel Hernandez');
    expect(component.proposalIndividualInfo.gender).toBe('Female');
    expect(component.proposalIndividualInfo.birthdate).toBe('1990-01-01');
  });

  it('shows the proposal Info summary after saving changes', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('initialView', 'recommendations');
    component.selectedCoverage = 'someone-else';
    component.proposalIndividualInfo.title = 'Mr.';
    component.proposalIndividualInfo.firstName = 'Miguel';
    component.proposalIndividualInfo.middleName = 'Angel';
    component.proposalIndividualInfo.lastName = 'Hernandez';
    component.proposalIndividualInfo.birthdate = '1990-01-01';
    component.proposalIndividualInfo.gender = 'Female';
    component.proposalIndividualInfo.email = 'miguel@example.com';
    component.proposalIndividualInfo.productInterested = 'Future Assure';
    component.proposalIndividualInfo.sourceOfLead = 'Branch referral';
    component.proposalIndividualInfo.referrerName = 'Ana Santos';
    component.showProposalIndividualInfo = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info')).not.toBeNull();
    const infoActionButtons = Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__actions app-button button') as NodeListOf<HTMLButtonElement>);
    expect(infoActionButtons).toHaveLength(2);
    expect(infoActionButtons.every(button => button.classList.contains('tdx-button--medium'))).toBe(true);

    infoActionButtons[0].click();
    fixture.detectChanges();

    expect(component.showProposalInfoSaveConfirmation).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')?.textContent).toContain('Save Lead Information');
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')?.textContent).toContain('correct before saving Lead Information.');

    (Array.from(fixture.nativeElement.querySelectorAll('[role="alertdialog"] app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Proceed')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showProposalInfoSaveConfirmation).toBe(false);
    expect(component.showProposalIndividualInfoSummary).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-individual-info--summary')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Basic Information');
    expect(fixture.nativeElement.textContent).toContain('Contact Information');
    expect(fixture.nativeElement.textContent).toContain('Product Interested');
    expect(fixture.nativeElement.textContent).toContain('Miguel Angel Hernandez');
    expect(fixture.nativeElement.textContent).toContain('miguel@example.com');
    expect(fixture.nativeElement.textContent).toContain('Ana Santos');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__summary-fields--lead-source')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Continue and Add Profile (CSA)');
    expect(fixture.nativeElement.textContent).toContain('Generate Draft Sales Illustration');
    const draftIllustrationButton = Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__summary-action-row app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Generate Draft Sales Illustration')) as HTMLButtonElement;
    expect(draftIllustrationButton.classList.contains('tdx-button--primary')).toBe(true);
    expect(draftIllustrationButton.classList.contains('tdx-button--outline')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Or view all generated Quick Quotes');
    expect(fixture.nativeElement.querySelector('[name="proposalFirstName"]')).toBeNull();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__summary-action-row app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Continue and Add Profile')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.showProposalCsa).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-card')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-card')?.textContent).toContain('Client Suitability Assessment');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-card')?.textContent).toContain('General Information');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-card')?.textContent).toContain('Existing Life Insurance');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__summary')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs [role="tab"][aria-selected="true"]')?.textContent).toContain('Profile');

    const lifeNeedsTab = Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-tabs button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Life Needs')) as HTMLButtonElement;
    expect(lifeNeedsTab.disabled).toBe(false);
    lifeNeedsTab.click();
    fixture.detectChanges();
    expect(component.proposalCsaStep).toBe('life-needs');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-life-needs')?.textContent).toContain('Rank financial needs');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-life-needs')?.textContent).toContain('Health and Wellness');

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-tabs button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Information') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-form')).not.toBeNull();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-tabs button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Calculation of Needs')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.proposalCsaStep).toBe('calculation');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-calculation')?.textContent).toContain('Financial Capacity');

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-tabs button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('General Assessment')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.proposalCsaStep).toBe('assessment');
    const horizonOption = Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-answer') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('At least 10 years')) as HTMLButtonElement;
    horizonOption.click();
    fixture.detectChanges();
    expect(horizonOption.getAttribute('aria-pressed')).toBe('true');

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-assessment-actions app-button button') as NodeListOf<HTMLButtonElement>)[0]).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')).toBeNull();
    expect(component.proposalCsaStep).toBe('risk-profile');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-risk-result')).not.toBeNull();

    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-individual-info__csa-risk-profile footer app-button button') as NodeListOf<HTMLButtonElement>)[0]).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#proposal-csa-completion-modal-title')?.textContent).toBe('You Have a Proposal in Progress');
    expect(fixture.nativeElement.querySelector('#proposal-csa-completion-modal-description')?.textContent).toBe('You’ve already completed some of the proposal details. Complete the remaining insured information to continue.');
    (Array.from(fixture.nativeElement.querySelectorAll('[role="alertdialog"] app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Complete Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showProposalBuilderInfo).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-builder-info__notice')).toBeNull();
    expect(fixture.nativeElement.querySelector('form.proposal-individual-info')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-individual-info--summary')).toBeNull();
    expect(fixture.nativeElement.querySelector('#proposal-builder-info-title')?.textContent).toBe('Info');
    expect(fixture.nativeElement.querySelector('.proposal-builder-info__heading > p')?.textContent).toBe('COMPLETE PROPOSAL');
    expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs [role="tab"][aria-selected="true"]')?.textContent).toContain('Proposals');
    expect((fixture.nativeElement.querySelector('.proposal-individual-info__tabs [role="tab"]:nth-child(2)') as HTMLButtonElement).disabled).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Insured Information');
    expect(fixture.nativeElement.textContent).toContain('PROPOSAL SUMMARY');
    expect(fixture.nativeElement.querySelector('.proposal-builder-info__notice')).toBeNull();
    expect((fixture.nativeElement.querySelector('.proposal-builder-info__insured input[type="date"]') as HTMLInputElement).disabled).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.proposal-builder-info__fields app-field-control').length).toBe(3);
    const proposalAccordion = fixture.nativeElement.querySelector('.proposal-builder-info__accordion:nth-of-type(1) > button') as HTMLButtonElement;
    const leadAccordion = fixture.nativeElement.querySelector('.proposal-builder-info__accordion:nth-of-type(2) > button') as HTMLButtonElement;
    const insuredAccordion = fixture.nativeElement.querySelector('.proposal-builder-info__accordion:nth-of-type(3) > button') as HTMLButtonElement;
    expect(proposalAccordion.getAttribute('aria-expanded')).toBe('false');
    expect(leadAccordion.getAttribute('aria-expanded')).toBe('false');
    expect(insuredAccordion.getAttribute('aria-expanded')).toBe('true');
    proposalAccordion.click();
    fixture.detectChanges();
    expect(proposalAccordion.getAttribute('aria-expanded')).toBe('true');
    expect(insuredAccordion.getAttribute('aria-expanded')).toBe('true');
    proposalAccordion.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-builder-info__accordion > button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.proposal-builder-info__summary app-button').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.proposal-builder-info__summary app-button:first-of-type')?.textContent).toContain('Edit Proposal');
    expect(fixture.nativeElement.querySelector('.proposal-builder-info__summary app-button:last-of-type')?.textContent).toContain('Save Proposal');
    const validUntilField = fixture.nativeElement.querySelector('.proposal-builder-info__read-only-grid label:nth-child(2) input') as HTMLInputElement;
    expect(validUntilField.disabled).toBe(true);
    expect((fixture.nativeElement.querySelector('.proposal-builder-info__summary app-button:last-of-type button') as HTMLButtonElement).disabled).toBe(true);

    component.proposalBuilderInsured = {
      title: 'Mr.', firstName: 'Miguel', middleName: '', lastName: 'Hernandez',
      suffix: '', birthdate: '1990-01-01', gender: 'Male', occupation: 'Accountant'
    };
    component.proposalBuilderDnfbp = 'No';
    expect(component.isProposalBuilderInsuredComplete).toBe(true);
    component.requestProposalBuilderSave();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')?.textContent).toContain('Save Proposal');
    (Array.from(fixture.nativeElement.querySelectorAll('[role="alertdialog"] app-button button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Proceed')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-list h2')?.textContent).toBe('All Proposals');
    expect(fixture.nativeElement.querySelector('.proposal-questionnaire')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-builder-saved-card')?.textContent).toContain('Proposal No.');
    expect(fixture.nativeElement.querySelector('app-section-message')?.textContent).toContain('Proposal saved successfully.');

    const savedProposalLink = fixture.nativeElement.querySelector('.proposal-builder-saved-card__open') as HTMLAnchorElement;
    savedProposalLink.click();
    fixture.detectChanges();
    expect(component.showProposalDetails).toBe(true);
    expect(fixture.nativeElement.querySelector('.proposal-detail')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-detail__meta')?.textContent).toBe('PROPOSAL NO. 802978');
    expect(fixture.nativeElement.querySelector('#proposal-highlights-title')?.textContent).toContain('Your Plan At A Glance');
    expect(fixture.nativeElement.querySelector('#proposal-panel-proposal-info h2')?.textContent).toBe('Who This Plan Is For');
    expect(fixture.nativeElement.querySelector('.proposal-detail__date-meta')?.textContent).not.toContain('Proposal Date:');
    const expectedValidUntil = new Date();
    expectedValidUntil.setDate(expectedValidUntil.getDate() + 15);
    expect(fixture.nativeElement.querySelector('.proposal-detail__date-meta')?.textContent).toContain(`Valid Until: ${expectedValidUntil.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);

    const savedFooterText = fixture.nativeElement.querySelector('.proposal-detail__actions')?.textContent ?? '';
    expect(savedFooterText).toContain('Back');
    expect(savedFooterText).toContain('Generate Sales Illustration');
    expect(savedFooterText).toContain('Convert to Application');
    expect((Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Generate Sales Illustration')) as HTMLButtonElement).classList.contains('tdx-button--secondary')).toBe(true);
    expect((Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Convert to Application')) as HTMLButtonElement).classList.contains('tdx-button--primary')).toBe(true);
    expect((Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Convert to Application')) as HTMLButtonElement).disabled).toBe(true);

    vi.useFakeTimers();
    try {
      (Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Generate Sales Illustration')) as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.proposal-si-loading')?.textContent).toContain('Generating your Sales Illustration #24470.');
      expect(fixture.nativeElement.querySelector('.proposal-si-loading')?.textContent).toContain('Please wait and do not close your browser.');
      expect(fixture.nativeElement.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');
      vi.advanceTimersByTime(3000);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.proposal-si-preview__document img').length).toBe(10);
      expect((Array.from(fixture.nativeElement.querySelectorAll('.proposal-si-preview__toolbar button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Convert to Application')) as HTMLButtonElement).disabled).toBe(false);
      (Array.from(fixture.nativeElement.querySelectorAll('.proposal-si-preview__toolbar button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Convert to Application')) as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.showProposalApplication).toBe(true);
      expect(fixture.nativeElement.querySelector('.proposal-generator__content')?.classList.contains('proposal-generator__content--application')).toBe(true);
      expect(fixture.nativeElement.querySelector('lam-proposal-recommendation-detail[hidden]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.proposal-application-preview .application-page-header')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.proposal-application-preview__tabs .is-active')?.textContent).toContain('Applications');
      expect(fixture.nativeElement.querySelector('.proposal-application-preview .application-workspace')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.proposal-application-preview .application-progress__completion')?.textContent).toContain('1/8');
      expect(fixture.nativeElement.querySelector('.proposal-application-preview .application-form-card h2')?.textContent).toContain('Insured Information');
      expect(fixture.nativeElement.querySelector('.proposal-application-preview .application-government-ids h3')?.textContent).toContain('Government ID');
      expect(fixture.nativeElement.querySelector('.proposal-questionnaire')).toBeNull();
      expect(getComputedStyle(fixture.nativeElement.querySelector('lam-proposal-recommendation-detail')).display).toBe('none');
      (fixture.nativeElement.querySelector('.proposal-application-preview__tabs [role="tab"]:nth-child(1)') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.proposal-individual-info--summary')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs .is-active')?.textContent).toContain('Info');
      component.navigateFromProposalApplication('profile');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.proposal-individual-info__csa-card h2')?.textContent).toContain('Client Suitability Assessment');
      expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs .is-active')?.textContent).toContain('Profile');
      component.navigateFromProposalApplication('proposals');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#proposal-builder-saved-list-title')?.textContent).toContain('All Proposals');
      expect(fixture.nativeElement.querySelector('.proposal-individual-info__tabs .is-active')?.textContent).toContain('Proposals');
      (fixture.nativeElement.querySelector('.proposal-builder-saved-card__open') as HTMLAnchorElement).click();
      fixture.detectChanges();
      expect(component.showProposalDetails).toBe(true);
      const backToProposalDetails = Array.from(fixture.nativeElement.querySelectorAll('.proposal-si-preview__toolbar button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Back to Proposal Details'));
      backToProposalDetails?.click();
      fixture.detectChanges();
      expect((Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('View Sales Illustration')) as HTMLButtonElement)).toBeDefined();
      expect((Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Convert to Application')) as HTMLButtonElement).disabled).toBe(false);
      const viewSalesIllustration = Array.from(fixture.nativeElement.querySelectorAll('.proposal-detail__actions button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('View Sales Illustration')) as HTMLButtonElement;
      expect(viewSalesIllustration).toBeDefined();
      viewSalesIllustration.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.proposal-si-loading')?.textContent).toContain('Loading your Sales Illustration #24470.');
      expect(fixture.nativeElement.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');
      vi.advanceTimersByTime(3000);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.proposal-si-preview__document img')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.proposal-si-loading')).toBeNull();
      (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Back to Proposal Details')) as HTMLButtonElement).click();
      fixture.detectChanges();
    } finally {
      vi.useRealTimers();
    }

    component.editProposalFromDetail();
    fixture.detectChanges();
    expect(component.showProposalDetails).toBe(false);
    expect(component.showProposalBenefitEditor).toBe(true);
    expect(component.showProposalBuilderInfo).toBe(false);
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor__progress')?.getAttribute('aria-valuenow')).toBe('33');
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor__back')).toBeNull();
    expect(fixture.nativeElement.querySelector('#proposal-benefit-editor-title')?.textContent).toBe('Benefits');
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor .proposal-builder-info__summary')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('form.proposal-individual-info')).toBeNull();
    const annualPremiumInput = fixture.nativeElement.querySelector('[aria-label="Annual Premium"]') as HTMLInputElement;
    annualPremiumInput.value = '90000';
    annualPremiumInput.dispatchEvent(new Event('input'));
    component.proposalEditPaymentPeriod = '15 years';
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.proposalEditStep).toBe('riders');
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor__progress')?.getAttribute('aria-valuenow')).toBe('66');
    expect(fixture.nativeElement.querySelector('#proposal-included-riders-title')?.textContent).toContain('INCLUDED RIDERS');
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-riders-editor__optional button') as NodeListOf<HTMLButtonElement>)[0]).click();
    fixture.detectChanges();
    expect(component.proposalEditIncludedRiders.length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.proposal-riders-editor__included button').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.proposal-riders-editor__included button')?.textContent).toContain('Remove Rider');
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-riders-editor__included button') as NodeListOf<HTMLButtonElement>)[0]).click();
    fixture.detectChanges();
    expect(component.proposalEditIncludedRiders.length).toBe(2);
    expect(component.proposalEditOptionalRiders.length).toBe(3);
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-riders-editor__optional button') as NodeListOf<HTMLButtonElement>)[0]).click();
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.proposalEditStep).toBe('funds');
    expect(fixture.nativeElement.querySelector('.proposal-benefit-editor__progress')?.getAttribute('aria-valuenow')).toBe('100');
    expect(fixture.nativeElement.querySelector('#proposal-funds-allocation-title')?.textContent).toContain('Premium Allocation');
    component.proposalEditFunds[0].allocation = 65;
    fixture.detectChanges();
    expect(component.proposalEditAllocationIsValid).toBe(false);
    component.proposalEditFunds[0].allocation = 70;
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('.proposal-benefit-editor__footer button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Save Changes')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showProposalBuilderInfo).toBe(true);
    expect(component.showProposalDetails).toBe(false);
    expect(fixture.nativeElement.querySelector('.proposal-builder-info')).not.toBeNull();
    expect(component.selectedAnnualPremium).toBe('₱90,000.00');
    expect(component.selectedPaymentPeriod).toBe('15 years');
  });

  it('opens the proposal save confirmation and closes it on cancel or proceed', () => {
    const component = fixture.componentInstance;
    expect(component.isProposalBuilderInsuredComplete).toBe(false);
    component.requestProposalBuilderSave();
    expect(component.showProposalBuilderSaveConfirmation).toBe(false);

    component.setProposalBuilderSameAsLead(true);
    expect(component.isProposalBuilderInsuredComplete).toBe(true);
    component.setProposalBuilderSameAsLead(false);
    expect(component.isProposalBuilderInsuredComplete).toBe(false);

    component.proposalBuilderInsured = {
      title: 'Mr.', firstName: 'Miguel', middleName: '', lastName: 'Hernandez',
      suffix: '', birthdate: '1990-01-01', gender: 'Male', occupation: 'Accountant'
    };
    component.proposalBuilderDnfbp = 'No';
    expect(component.isProposalBuilderInsuredComplete).toBe(true);
    component.requestProposalBuilderSave();
    expect(component.showProposalBuilderSaveConfirmation).toBe(true);
    component.cancelProposalBuilderSave();
    expect(component.showProposalBuilderSaveConfirmation).toBe(false);

    component.requestProposalBuilderSave();
    component.confirmProposalBuilderSave();
    expect(component.showProposalBuilderSaveConfirmation).toBe(false);
    expect(component.showProposalBuilderInfo).toBe(false);
    expect(component.showProposalBuilderSavedList).toBe(true);
    expect(component.proposalBuilderSaveToastMessage).toBe('Proposal saved successfully.');
  });

  it('prefills insured details from the questionnaire when the plan covers the user', async () => {
    const component = fixture.componentInstance;
    component.selectedCoverage = 'myself';
    component.proposalIndividualInfo = {
      ...component.proposalIndividualInfo,
      title: 'Ms.', firstName: 'Mia', middleName: 'Rose', lastName: 'Santos',
      birthdate: '1992-04-12', gender: 'Female'
    };
    component.openProposalBuilderInfo(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.proposalBuilderInsured).toMatchObject({
      title: 'Ms.', firstName: 'Mia', middleName: 'Rose', lastName: 'Santos',
      birthdate: '1992-04-12', gender: 'Female'
    });
  });

  it('opens hidden proposal detail tabs from the overflow menu', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('View Proposal')) as HTMLButtonElement).click();
    fixture.detectChanges();

    const overflowButton = fixture.nativeElement.querySelector('.proposal-detail__tab-overflow-trigger') as HTMLButtonElement;
    const tabList = fixture.nativeElement.querySelector('.proposal-detail__tabs') as HTMLElement;
    Object.defineProperty(tabList, 'scrollWidth', { configurable: true, value: 700 });
    overflowButton.click();
    fixture.detectChanges();
    expect(overflowButton.getAttribute('aria-expanded')).toBe('true');

    const fundsMenuItem = Array.from(fixture.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Fund Allocation')) as HTMLButtonElement;
    fundsMenuItem.click();
    fixture.detectChanges();

    expect(overflowButton.getAttribute('aria-expanded')).toBe('false');
    expect(tabList.scrollLeft).toBe(700);
    expect(overflowButton.classList.contains('has-active-tab')).toBe(false);
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds h2')?.textContent).toBe('Where Your Funds Go');
    expect(fixture.nativeElement.querySelectorAll('#proposal-panel-funds .proposal-detail__protection-table tbody tr')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds')?.textContent).toContain('Balanced Fund');
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds')?.textContent).toContain('Asian Equity Fund');
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds')?.textContent).toContain('Total Allocation');
    expect(fixture.nativeElement.querySelector('#proposal-panel-funds .material-symbols-rounded')).toBeNull();

    overflowButton.click();
    fixture.detectChanges();
    const aboutMenuItem = Array.from(fixture.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('About the Product')) as HTMLButtonElement;
    aboutMenuItem.click();
    fixture.detectChanges();

    const aboutPanel = fixture.nativeElement.querySelector('#proposal-panel-about') as HTMLElement;
    expect(aboutPanel.querySelector('h2')?.textContent).toBe('Get to Know the Product');
    expect(aboutPanel.querySelectorAll('.proposal-detail__about-list article')).toHaveLength(6);
    expect(aboutPanel.textContent).toContain('Why Future Assure?');
    expect(aboutPanel.textContent).toContain('Important Notes');
    expect(aboutPanel.querySelectorAll('.proposal-detail__about-trigger .material-symbols-rounded')).toHaveLength(6);
    const aboutTriggers = aboutPanel.querySelectorAll('.proposal-detail__about-trigger') as NodeListOf<HTMLButtonElement>;
    expect(aboutTriggers).toHaveLength(6);
    expect(aboutTriggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(aboutPanel.querySelector('#proposal-about-panel-0')).toBeNull();
    aboutTriggers[0].click();
    fixture.detectChanges();
    expect(aboutTriggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(aboutPanel.querySelector('#proposal-about-panel-0')?.textContent).toContain('A peso-denominated VUL');

    aboutTriggers[1].click();
    fixture.detectChanges();
    expect(aboutTriggers[1].getAttribute('aria-expanded')).toBe('true');
    expect(aboutPanel.querySelector('#proposal-about-panel-1')?.textContent).toContain('Eligible age');

    aboutTriggers[0].click();
    fixture.detectChanges();
    expect(aboutTriggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(aboutPanel.querySelector('#proposal-about-panel-0')).toBeNull();
  });

  it('shows carousel indicators and updates the selected recommendation', () => {
    fixture.componentRef.setInput('initialView', 'recommendations');
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.proposal-recommendations__carousel-dots button') as NodeListOf<HTMLButtonElement>;
    const cards = fixture.nativeElement.querySelectorAll('.proposal-recommendation-card') as NodeListOf<HTMLElement>;
    expect(dots).toHaveLength(3);
    expect(fixture.componentInstance.activeRecommendationIndex).toBe(1);
    expect(cards[1].classList.contains('is-centered')).toBe(true);

    dots[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeRecommendationIndex).toBe(0);
    expect(cards[0].classList.contains('is-centered')).toBe(true);
    expect(cards[1].classList.contains('is-centered')).toBe(false);
    expect(dots[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('provides mobile comparison cards with the best match first and all comparison rows', () => {
    const cards = fixture.componentInstance.mobileComparisonCards;

    expect(cards).toHaveLength(3);
    expect(cards[0].recommendation.name).toBe('Future Assure');
    expect(cards[0].bestFor).toBe('Balanced protection and growth');
    expect(cards[0].rows).toHaveLength(7);
    expect(cards[0].rows[0].label).toBe('Annual Premium');
    expect(cards[0].rows[1].label).toBe('Riders');
    expect(cards[0].rows[2].label).toBe('Maximum Coverage Period');
    expect(cards[1].recommendation.name).toBe('Dream Builder');
    expect(cards[2].recommendation.name).toBe('Future Assure Max (Peso)');
  });

  it('shows the details fields after choosing who will be covered', async () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-details-card')).toBeNull();

    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-details-card')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('A Few Details About You');
    expect(fixture.nativeElement.querySelector('[aria-label="Title"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="First Name"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Middle Name"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Last Name"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Birthdate"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Select Gender');
    expect(fixture.nativeElement.textContent).toContain('No Middle Name');

    const middleName = fixture.nativeElement.querySelector('[aria-label="Middle Name"]') as HTMLInputElement;
    middleName.value = 'Alex';
    middleName.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const noMiddleName = fixture.nativeElement.querySelector('input[name="noMiddleName"]') as HTMLInputElement;
    noMiddleName.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[aria-label="Middle Name"]') as HTMLInputElement).disabled).toBe(true);
    expect(fixture.componentInstance.proposalIndividualInfo.middleName).toBe('');
  });

  it('uses the same insured-person fields when someone else is selected', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    const coverageCards = fixture.nativeElement.querySelectorAll('.proposal-coverage-card') as NodeListOf<HTMLButtonElement>;
    coverageCards[0].click();
    fixture.detectChanges();
    fixture.componentInstance.birthdate = '1990-01-01';
    fixture.componentInstance.gender = 'Female';
    fixture.componentInstance.proposalIndividualInfo.firstName = 'Miguel';
    fixture.componentInstance.proposalIndividualInfo.lastName = 'Hernandez';
    coverageCards[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('A few details');
    expect(fixture.nativeElement.textContent).not.toContain('Enter your details and the details of the person to be covered.');
    expect(fixture.nativeElement.textContent).toContain('A Few Details About You');
    expect(fixture.nativeElement.textContent).toContain('Fill in the fields below to continue.');
    expect(fixture.nativeElement.textContent).toContain('A Few Details About the Person Covered');
    expect(fixture.nativeElement.textContent).toContain('Tell us a little more about the person covered to get started.');
    expect(fixture.nativeElement.querySelectorAll('.proposal-details-card--group')).toHaveLength(2);
    expect(fixture.componentInstance.proposalIndividualInfo.firstName).toBe('Miguel');
    expect(fixture.componentInstance.gender).toBe('');
    expect(fixture.componentInstance.birthdate).toBe('');
    expect(fixture.nativeElement.querySelector('[aria-label="First Name"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Last Name"]')).not.toBeNull();
  });

  it('keeps Next disabled until the details form is complete', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.detectChanges();

    let continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);

    const birthdateInput = fixture.nativeElement.querySelector('[aria-label="Birthdate"]') as HTMLInputElement;
    birthdateInput.value = '1990-01-01';
    birthdateInput.dispatchEvent(new Event('input'));
    fixture.componentInstance.gender = 'Male';
    fixture.componentInstance.proposalIndividualInfo.firstName = 'Miguel';
    fixture.componentInstance.proposalIndividualInfo.lastName = 'Hernandez';
    fixture.detectChanges();
    continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(false);
  });

  it('moves to Question 2 and toggles multiple plan goals', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.proposal-coverage-card') as HTMLButtonElement).click();
    fixture.componentInstance.birthdate = '1990-01-01';
    fixture.componentInstance.gender = 'Male';
    fixture.componentInstance.proposalIndividualInfo.firstName = 'Miguel';
    fixture.componentInstance.proposalIndividualInfo.lastName = 'Hernandez';
    fixture.detectChanges();

    const continueButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    continueButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 2 OF 7');
    expect(fixture.nativeElement.textContent).toContain('What would you like the plan to help with?');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.proposal-details-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-questionnaire__footer').textContent).toContain('Back');
    expect(fixture.nativeElement.textContent).toContain('Choose the goals and priorities you’d like the plan to support. You can select more than one.');
    expect(fixture.nativeElement.querySelector('.proposal-goal-selection-note')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card__illustration').length).toBe(3);
    const goalCards = fixture.nativeElement.querySelectorAll('.proposal-goal-card') as NodeListOf<HTMLButtonElement>;
    goalCards[0].click();
    goalCards[2].click();
    fixture.detectChanges();

    expect(goalCards[0].getAttribute('aria-pressed')).toBe('true');
    expect(goalCards[2].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.proposal-goal-card__selection').length).toBe(2);
    expect(fixture.componentInstance.selectedGoals).toEqual(['Protect My Loved Ones', 'Grow My Money']);

    continueButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 3 OF 7');
    expect(fixture.nativeElement.textContent).toContain('How much would you like to set aside each year?');
    expect(fixture.nativeElement.querySelector('#proposal-budget-range')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.proposal-budget-card__quick-select button').length).toBe(6);
    expect(fixture.nativeElement.querySelector('.proposal-budget-card .sr-only')).toBeNull();
    expect(fixture.nativeElement.querySelector('.proposal-budget-card__quick-select button').getAttribute('data-size')).toBe('small');
    const budgetInput = fixture.nativeElement.querySelector('[aria-label="Yearly budget amount"]') as HTMLInputElement;
    budgetInput.value = '250000';
    budgetInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.budgetAmount).toBe(250000);
    expect((fixture.nativeElement.querySelector('#proposal-budget-range') as HTMLInputElement).value).toBe('250000');

    const nextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 4 OF 7');
    expect(fixture.nativeElement.textContent).toContain('Tell us a bit about the person being covered.');
    const lifeStageCards = fixture.nativeElement.querySelectorAll('.proposal-life-stage-card') as NodeListOf<HTMLButtonElement>;
    expect(lifeStageCards.length).toBe(5);
    lifeStageCards[1].click();
    fixture.detectChanges();

    expect(lifeStageCards[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedLifeStage).toBe('Growing Family');

    const questionFourNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    questionFourNextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 5 OF 7');
    expect(fixture.nativeElement.textContent).toContain('What else would you like protection for?');
    const protectionCards = fixture.nativeElement.querySelectorAll('.proposal-protection-card') as NodeListOf<HTMLButtonElement>;
    expect(protectionCards.length).toBe(4);

    protectionCards[0].click();
    protectionCards[1].click();
    fixture.detectChanges();

    expect(protectionCards[0].getAttribute('aria-pressed')).toBe('true');
    expect(protectionCards[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedProtections).toEqual(['Critical Illness', 'Accidents']);

    const questionFiveNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    questionFiveNextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 6 OF 7');
    expect(fixture.nativeElement.textContent).toContain('How comfortable are you with investment risk?');
    const riskCards = fixture.nativeElement.querySelectorAll('.proposal-risk-card') as NodeListOf<HTMLButtonElement>;
    expect(riskCards.length).toBe(3);

    riskCards[1].click();
    fixture.detectChanges();

    expect(riskCards[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedRiskPreference).toBe('Balanced');

    const questionSixNextButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Next')) as HTMLButtonElement;
    questionSixNextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('QUESTION 7 OF 7');
    expect(fixture.nativeElement.textContent).toContain('Where would you prefer to invest?');
    const investmentCards = fixture.nativeElement.querySelectorAll('.proposal-investment-card') as NodeListOf<HTMLButtonElement>;
    expect(investmentCards.length).toBe(3);

    investmentCards[2].click();
    fixture.detectChanges();

    expect(investmentCards[2].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.selectedInvestmentPreference).toBe('A Mix of Both');
    expect(fixture.nativeElement.textContent).toContain('Generate Proposals');
  });

  it('shows recommendations after generating proposals', () => {
    vi.useFakeTimers();
    try {
      const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
      cta.click();
      fixture.detectChanges();
      fixture.componentInstance.questionStep = 7;
      fixture.componentInstance.selectedInvestmentPreference = 'A Mix of Both';
      fixture.componentRef.changeDetectorRef.markForCheck();
      fixture.componentRef.changeDetectorRef.detectChanges();

      fixture.componentInstance.continueQuestionnaire();
      expect(fixture.componentInstance.isGeneratingProposals).toBe(true);

      vi.advanceTimersByTime(2400);
      expect(fixture.componentInstance.isGeneratingProposals).toBe(false);
      expect(fixture.componentInstance.showRecommendations).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns to the completed questionnaire or product list from recommendations', () => {
    const cta = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Find Plans for Me')) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    fixture.componentInstance.showRecommendations = true;
    fixture.componentInstance.questionStep = 7;
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    fixture.componentInstance.returnToQuestionnaire();
    expect(fixture.componentInstance.showRecommendations).toBe(false);
    expect(fixture.componentInstance.isGeneratingProposals).toBe(false);
    expect(fixture.componentInstance.questionStep).toBe(7);

    fixture.componentInstance.showRecommendations = true;
    fixture.componentInstance.browseAllProducts();
    expect(fixture.componentInstance.showQuestionnaire).toBe(false);
    expect(fixture.componentInstance.showRecommendations).toBe(false);
  });

  it('preserves earlier answers when editing and moving through the questionnaire again', () => {
    const component = fixture.componentInstance;
    component.selectedCoverage = 'myself';
    component.birthdate = '1990-01-01';
    component.gender = 'Female';
    component.proposalIndividualInfo.firstName = 'Miguel';
    component.proposalIndividualInfo.lastName = 'Hernandez';
    component.selectedGoals = ['Build wealth'];
    component.selectedProtections = ['Critical Illness'];
    component.selectedLifeStage = 'Growing Family';
    component.selectedRiskPreference = 'Balanced';
    component.selectedInvestmentPreference = 'Global Opportunities';

    component.editAnswers();
    expect(component.questionStep).toBe(1);
    expect(component.selectedCoverage).toBe('myself');
    expect(component.selectedGoals).toEqual(['Build wealth']);
    expect(component.selectedProtections).toEqual(['Critical Illness']);
    expect(component.selectedLifeStage).toBe('Growing Family');
    expect(component.selectedRiskPreference).toBe('Balanced');
    expect(component.selectedInvestmentPreference).toBe('Global Opportunities');

    component.continueQuestionnaire();
    expect(component.questionStep).toBe(2);
    expect(component.selectedGoals).toEqual(['Build wealth']);
    component.questionStep = 4;
    component.continueQuestionnaire();
    expect(component.questionStep).toBe(5);
    expect(component.selectedProtections).toEqual(['Critical Illness']);
    component.questionStep = 6;
    component.continueQuestionnaire();
    expect(component.questionStep).toBe(7);
    expect(component.selectedInvestmentPreference).toBe('Global Opportunities');
  });

  it('restores saved insured birthdate and gender before validating question one', () => {
    const component = fixture.componentInstance;
    component.selectedCoverage = 'myself';
    component.proposalIndividualInfo = {
      ...component.proposalIndividualInfo,
      firstName: 'Miguel', lastName: 'Hernandez', birthdate: '1990-01-01', gender: 'Male'
    };
    component.birthdate = '';
    component.gender = '';

    expect(component.isQuestionOneComplete).toBe(true);
    component.editAnswers();
    expect(component.birthdate).toBe('1990-01-01');
    expect(component.gender).toBe('Male');
    expect(component.isQuestionOneComplete).toBe(true);
  });
});
