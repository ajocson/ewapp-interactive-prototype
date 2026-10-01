import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';

import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { TdxFieldControlOption } from '../shared/components/field-control/field-control.component';
import { TdxTabItem } from '../shared/components/tab-group/tab-group.model';

interface ProposalProduct {
  readonly name: string;
  readonly icon: string;
}

interface ProposalRecommendation {
  readonly name: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly benefitAmount: string;
  readonly annualPremium: string;
  readonly description: string;
  readonly isBestMatch?: boolean;
}

interface ProposalComparisonRow {
  readonly label: string;
  readonly values: readonly string[];
}

interface ProposalGoal {
  readonly title: string;
  readonly description: string;
  readonly illustration: string;
}

interface ProposalRiskPreference {
  readonly title: string;
  readonly description: string;
  readonly illustration: string;
}

interface ProposalInvestmentPreference {
  readonly title: string;
  readonly description: string;
  readonly illustration: string;
}

type ProposalQuestionStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type ProductInfoStep = 'products' | 'info' | 'benefits' | 'riders' | 'funds';
type ProposalRider = { name: string; benefit: string; paymentPeriod: string; included: boolean; addedByUser: boolean };
type ProductBenefitFieldKey = 'paymentPeriod' | 'paymentFrequency' | 'policyTerm' | 'annualPremium' | 'singlePremium' | 'benefitAmount' | 'basicSumInsured' | 'discountType' | 'payoutOption';

interface ProductBenefitField {
  readonly key: ProductBenefitFieldKey;
  readonly label: string;
  readonly type: 'select' | 'currency';
  readonly options?: readonly TdxFieldControlOption[];
}

interface SavedProposalListItem {
  readonly name: string;
  readonly proposalNumber: string;
  readonly proposalDate: string;
  readonly annualPremium: string;
  readonly benefitAmount: string;
}

@Component({
  selector: 'lam-proposal-generator',
  templateUrl: './proposal-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProposalGeneratorComponent implements AfterViewInit, OnDestroy {
  @Input() userType: 'Agency' | 'Banca' = 'Banca';
  @Input()
  set initialView(value: 'landing' | 'recommendations') {
    this.showQuestionnaire = value === 'recommendations';
    this.showProductInfo = false;
    this.showCreateProposalReview = false;
    this.isMultiProductProposalCompletionFlow = false;
    this.productInfoStep = 'info';
    this.startedFromProductSelection = false;
    this.startedFromSavedProposalList = false;
    this.showRecommendations = value === 'recommendations';
    this.showProposalDetails = false;
    this.showProposalApplication = false;
    this.hasConvertedApplication = false;
    this.showProposalIndividualInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = false;
    this.showProposalBenefitEditor = false;
    this.showProposalBuilderSavedList = false;
    this.showProposalInfoSaveConfirmation = false;
    this.isGeneratingProposals = false;
    this.activeRecommendationIndex = 1;
  }
  @Output() loggedOut = new EventEmitter<void>();
  @Output() newLeadRequested = new EventEmitter<void>();
  @Output() draftSiRequested = new EventEmitter<void>();
  @ViewChild('proposalContent') proposalContent?: ElementRef<HTMLElement>;
  @ViewChild('proposalDetails') proposalDetails?: ElementRef<HTMLElement>;
  @ViewChild('recommendationCards') recommendationCards?: ElementRef<HTMLElement>;

  readonly buttonSize = TdxButtonSize;
  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly genderOptions: readonly TdxFieldControlOption[] = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];
  readonly proposalCsaCivilStatusOptions: readonly TdxFieldControlOption[] = [
    { label: 'Single', value: 'Single' },
    { label: 'Married', value: 'Married' },
    { label: 'Widowed', value: 'Widowed' },
    { label: 'Separated', value: 'Separated' }
  ];
  readonly paymentPeriodOptions: readonly TdxFieldControlOption[] = [
    { label: 'Single Premium', value: 'Single Premium' },
    { label: '5 years', value: '5 years' },
    { label: '10 years', value: '10 years' },
    { label: '15 years', value: '15 years' },
    { label: '20 years', value: '20 years' }
  ];
  readonly productBenefitPaymentPeriodOptions: readonly TdxFieldControlOption[] = [
    { label: '3 years', value: '3 years' },
    { label: '5 years', value: '5 years' },
    { label: '10 years', value: '10 years' }
  ];
  readonly productBenefitPaymentFrequencyOptions: readonly TdxFieldControlOption[] = [
    { label: 'Annual', value: 'Annual' },
    { label: 'Semi-Annual', value: 'Semi-Annual' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Monthly', value: 'Monthly' }
  ];
  readonly productBenefitPolicyTermOptions: readonly TdxFieldControlOption[] = [
    { label: '5 years', value: '5 years' },
    { label: '10 years', value: '10 years' },
    { label: '15 years', value: '15 years' },
    { label: '20 years', value: '20 years' }
  ];
  readonly productBenefitDiscountTypeOptions: readonly TdxFieldControlOption[] = [
    { label: 'No Discount', value: 'No Discount' }
  ];
  readonly productBenefitPayoutOptions: readonly TdxFieldControlOption[] = [
    { label: 'Lump Sum', value: 'Lump Sum' },
    { label: 'Installments', value: 'Installments' }
  ];
  showQuestionnaire = false;
  showProductInfo = false;
  showCreateProposalReview = false;
  isMultiProductProposalCompletionFlow = false;
  createProposalReviewRows: ProposalComparisonRow[] = [];
  productInfoStep: ProductInfoStep = 'info';
  startedFromProductSelection = false;
  startedFromSavedProposalList = false;
  expandedProposalProduct = '';
  expandedCreateProposalBenefitProduct = '';
  expandedCreateProposalRiderProduct = '';
  isGeneratingProposals = false;
  showRecommendations = false;
  showProposalDetails = false;
  showProposalApplication = false;
  hasConvertedApplication = false;
  proposalDetailReturnTarget: 'recommendations' | 'saved-list' | 'create-review' | 'multi-product-completion' = 'recommendations';
  readonly proposalNumber = '802978';
  showProposalIndividualInfo = false;
  showProposalIndividualInfoSummary = false;
  showProposalCsa = false;
  showProposalBuilderInfo = false;
  showProposalBenefitEditor = false;
  proposalBenefitEditorReturnTarget: 'builder-info' | 'proposal-detail' = 'builder-info';
  proposalEditStep: 'benefits' | 'riders' | 'funds' = 'benefits';
  proposalEditRiders: ProposalRider[] = [
    { name: "Waiver of Premium on Insured's Disablement Rider", benefit: '₱250,000', paymentPeriod: '', included: true, addedByUser: false },
    { name: 'Accidental Death Rider', benefit: '₱250,000', paymentPeriod: '10 years', included: true, addedByUser: false },
    { name: 'Accidental Disablement Rider', benefit: '₱250,000', paymentPeriod: '', included: false, addedByUser: false },
    { name: 'Critical Illness Rider', benefit: '₱250,000', paymentPeriod: '', included: false, addedByUser: false },
    { name: 'Hospital Income Rider', benefit: '₱250,000', paymentPeriod: '', included: false, addedByUser: false }
  ];
  private readonly createProposalRiderOptions: ProposalRider[] = [
    { name: "Waiver of Premium on Insured's Disablement Rider", benefit: '₱250,000', paymentPeriod: '', included: true, addedByUser: false },
    { name: 'Accidental Death Rider', benefit: '₱250,000', paymentPeriod: '10 years', included: true, addedByUser: false },
    { name: 'Accidental Disablement Rider', benefit: '₱250,000', paymentPeriod: '', included: false, addedByUser: false },
    { name: 'Critical Illness Rider', benefit: '₱250,000', paymentPeriod: '', included: false, addedByUser: false },
    { name: 'Hospital Income Rider', benefit: '₱250,000', paymentPeriod: '', included: false, addedByUser: false }
  ];
  createProposalRidersByProduct: Record<string, ProposalRider[]> = {};
  proposalEditPaymentPeriod = '10 years';
  proposalEditAnnualPremium = '80,000.00';
  proposalEditBenefitAmount = '4,200,000.00';
  readonly proposalEditFunds = [
    { name: 'Balanced Fund', allocation: 70 },
    { name: 'Peso High Dividend Equity Fund', allocation: 30 },
    { name: 'Peso Active Equity Fund', allocation: 0 },
    { name: 'Asian Equity Fund', allocation: 0 },
    { name: 'Peso Global ESG Equity Fund', allocation: 0 },
    { name: 'Bond Fund', allocation: 0 }
  ];
  readonly createProposalFunds = [
    { name: 'Balanced Fund', allocation: 70 },
    { name: 'Peso High Dividend Equity Fund', allocation: 30 },
    { name: 'Peso Active Equity Fund', allocation: 0 },
    { name: 'Asian Equity Fund', allocation: 0 },
    { name: 'Peso Global ESG Equity Fund', allocation: 0 },
    { name: 'Bond Fund', allocation: 0 }
  ];
  createProposalFundsByProduct: Record<string, { name: string; allocation: number }[]> = {};
  createProposalTopUpByProduct: Record<string, string> = {};
  expandedCreateProposalFundsProduct = '';
  proposalEditTopUpAmount = '';
  editedProposalPaymentPeriod: string | null = null;
  editedProposalAnnualPremium: string | null = null;
  editedProposalBenefitAmount: string | null = null;
  editedProposalRiderCount: number | null = null;
  editedProposalFundCount: number | null = null;
  showProposalCreatedNotice = false;
  showProposalBuilderSavedList = false;
  createdSavedProposals: SavedProposalListItem[] = [];
  proposalBuilderSaveToastMessage = '';
  proposalBuilderExpandedSections = new Set<'proposal' | 'lead' | 'insured'>(['insured']);
  proposalBuilderSameAsLead = false;
  proposalBuilderInsured = { title: '', firstName: '', middleName: '', lastName: '', suffix: '', birthdate: '', gender: '', occupation: '' };
  proposalBuilderDnfbp = '';
  proposalCsaStep: 'information' | 'life-needs' | 'calculation' | 'assessment' | 'risk-profile' = 'information';
  showProposalInfoSaveConfirmation = false;
  showProposalCsaCompletionModal = false;
  showProposalBuilderSaveConfirmation = false;
  proposalCsaCivilStatus = 'Married';
  proposalCsaDesignatedBusiness = 'No';
  proposalCsaNoExistingInsurance = true;
  readonly proposalCsaNeeds = ['Health and Wellness', "Children's Education", 'Income Protection', 'Medium to Long-Term Savings', 'Retirement', 'Estate Planning'];
  proposalCsaInvestmentHorizon = 'under-1-year';
  proposalCsaInvestmentGoal = 'preserve-capital';
  readonly proposalCsaInvestmentHorizonOptions = [
    { value: 'under-1-year', label: 'A. Less than 1 year' },
    { value: '1-to-3-years', label: 'B. 1 to 3 years' },
    { value: '4-to-6-years', label: 'C. 4 to 6 years' },
    { value: '7-to-9-years', label: 'D. 7 to 9 years' },
    { value: '10-plus-years', label: 'E. At least 10 years' }
  ];
  readonly proposalCsaInvestmentGoalOptions = [
    { value: 'preserve-capital', label: 'A. Preserve capital, even if returns are low and may not keep pace with inflation' },
    { value: 'modest-growth', label: 'B. Accept modest changes in value for modest income and growth' }
  ];
  get proposalCsaTabs(): TdxTabItem[] {
    const disabled = this.proposalCsaStep === 'risk-profile';
    return [
      { id: 'information', label: 'Information', disabled },
      { id: 'life-needs', label: 'Life Needs & Priorities', disabled },
      { id: 'calculation', label: 'Calculation of Needs', disabled },
      { id: 'assessment', label: 'General Assessment', disabled }
    ];
  }
  get proposalCsaActiveTabId(): string {
    return this.proposalCsaStep === 'risk-profile' ? 'assessment' : this.proposalCsaStep;
  }
  proposalCsaMonthlyEarnings = '150000';
  proposalCsaAnnualPremiumCapacity = '117750';
  proposalCsaTotalAssets = '3000000';
  proposalIndividualInfo = {
    firstName: '', title: '', middleName: '', gender: '', lastName: '', birthdate: '',
    mobileNumber: '', email: '', sourceOfLead: '', productInterested: '',
    referrerDate: '', referrerName: '', referrerId: '', storeName: '', storeId: ''
  };
  noMiddleName = false;
  proposalIndividualInfoCreatedAt = new Date();
  get proposalIndividualInfoDisplayName(): string {
    const name = [this.proposalIndividualInfo.title, this.proposalIndividualInfo.firstName, this.proposalIndividualInfo.middleName, this.proposalIndividualInfo.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name || 'New Proposal';
  }
  readonly individualInfoTitles = ['Mr.', 'Ms.', 'Mrs.', 'Dr.'];
  readonly individualInfoTitleOptions: readonly TdxFieldControlOption[] = this.individualInfoTitles.map(title => ({ label: title, value: title }));
  readonly proposalBuilderSuffixOptions: readonly TdxFieldControlOption[] = ['Jr.', 'Sr.', 'III'].map(suffix => ({ label: suffix, value: suffix }));
  readonly individualInfoSources = ['Branch referral', 'Existing client', 'Online inquiry', 'Walk-in', 'Other'];
  readonly individualInfoStores = ['Makati Main Branch', 'BGC Branch', 'Cebu Business Center'];
  get individualInfoProducts(): readonly string[] {
    return this.products.map(product => product.name);
  }
  selectedProductNames: string[] = [];
  activeRecommendationIndex = 1;
  selectedProposalIndex = 1;
  questionStep: ProposalQuestionStep = 1;
  selectedCoverage: 'myself' | 'someone-else' | null = null;
  selectedGoals: string[] = [];
  selectedProtections: string[] = [];
  selectedLifeStage: string | null = null;
  selectedRiskPreference: string | null = null;
  selectedInvestmentPreference: string | null = null;
  budgetAmount = 100000;
  readonly budgetOptions = [50000, 100000, 200000, 300000, 400000, 500000];
  readonly loadingCards = [1, 2, 3];
  readonly recommendations: readonly ProposalRecommendation[] = [
    {
      name: 'Dream Builder',
      subtitle: 'Life Protection + Guaranteed Payouts',
      icon: 'assets/proposal-product-dream-builder.png',
      benefitAmount: '₱250,000',
      annualPremium: '₱116,450',
      description: 'Fits your protection goals with guaranteed payouts.'
    },
    {
      name: 'Future Assure',
      subtitle: 'Life Protection + Investments',
      icon: 'assets/proposal-product-future-assure.png',
      benefitAmount: '₱4,200,000',
      annualPremium: '₱80,000',
      description: 'Fits your protection and investment goals, budget, and risk preference.',
      isBestMatch: true
    },
    {
      name: 'Future Assure Max (Peso)',
      subtitle: 'Life Protection + Global Funds',
      icon: 'assets/proposal-product-future-assure-max.png',
      benefitAmount: '₱625,000',
      annualPremium: '₱500,000',
      description: 'Fits your protection goals with access to global investment opportunities.'
    }
  ];
  readonly comparisonRows: readonly ProposalComparisonRow[] = [
    { label: 'Best for', values: ['Protection and guaranteed financial support', 'Balanced protection and growth', 'Higher growth potential with global investments'] },
    { label: 'Annual Premium', values: ['₱116,450', '₱80,000', '₱500,000'] },
    { label: 'Maximum Coverage Period', values: ['To age 100', 'To age 100', 'To age 100'] },
    { label: 'Riders', values: ['2 Riders', '2 Riders', '0 Rider'] },
    { label: 'Payment Period', values: ['5 years', '10 years', 'Single Premium'] },
    { label: 'Investment Component', values: ['—', '✓', '✓ (Global Funds)'] },
    { label: 'Funds', values: ['2 Funds', '2 Funds', '3 Funds'] },
    { label: 'Risk Level', values: ['Low', 'Moderate', 'Moderate to High'] }
  ];

  get mobileComparisonCards(): readonly {
    recommendation: ProposalRecommendation;
    bestFor: string;
    rows: readonly { label: string; value: string }[];
  }[] {
    const mobileRowOrder = ['Annual Premium', 'Riders', 'Maximum Coverage Period', 'Payment Period', 'Investment Component', 'Funds', 'Risk Level'];

    return this.recommendations
      .map((recommendation, index) => ({
        recommendation,
        bestFor: this.comparisonRows[0].values[index] ?? '',
        rows: mobileRowOrder.flatMap(label => {
          const row = this.comparisonRows.find(comparisonRow => comparisonRow.label === label);
          return row ? [{ label: row.label, value: row.values[index] ?? '' }] : [];
        })
      }))
      .sort((first, second) => Number(Boolean(second.recommendation.isBestMatch)) - Number(Boolean(first.recommendation.isBestMatch)));
  }

  get selectedRecommendation(): ProposalRecommendation {
    return this.recommendations[this.selectedProposalIndex] ?? this.recommendations[1];
  }

  get proposalDetailRecommendation(): ProposalRecommendation {
    return {
      ...this.selectedRecommendation,
      benefitAmount: this.editedProposalBenefitAmount ?? this.selectedRecommendation.benefitAmount,
      annualPremium: this.editedProposalAnnualPremium ?? this.selectedRecommendation.annualPremium
    };
  }

  get selectedBenefitAmount(): string {
    return this.editedProposalBenefitAmount ?? this.selectedRecommendation.benefitAmount;
  }

  get selectedAnnualPremium(): string {
    return this.editedProposalAnnualPremium ?? this.selectedRecommendation.annualPremium;
  }

  formatProposalEditAmount(value: string): string {
    const amount = Number(this.currencyAmountForEditing(value));
    return `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)}`;
  }

  get selectedMaximumCoveragePeriod(): string {
    return this.comparisonRows.find(row => row.label === 'Maximum Coverage Period')?.values[this.selectedProposalIndex] ?? 'To age 100';
  }

  get selectedPaymentPeriod(): string {
    return this.editedProposalPaymentPeriod ?? this.comparisonRows.find(row => row.label === 'Payment Period')?.values[this.selectedProposalIndex] ?? '10 years';
  }

  get selectedRiderCount(): string {
    if (this.editedProposalRiderCount !== null) return `${this.editedProposalRiderCount} Riders`;
    return this.selectedProposalIndex === 1 ? '3 Riders' : this.comparisonRows.find(row => row.label === 'Riders')?.values[this.selectedProposalIndex] ?? '0 Rider';
  }

  get selectedFundCount(): string {
    if (this.editedProposalFundCount !== null) return `${this.editedProposalFundCount} Funds`;
    return this.comparisonRows.find(row => row.label === 'Funds')?.values[this.selectedProposalIndex] ?? '2 Funds';
  }

  get proposalEditTotalAllocation(): number {
    return this.proposalEditFunds.reduce((total, fund) => total + (Number(fund.allocation) || 0), 0);
  }

  get createProposalTotalAllocation(): number {
    const funds = this.getCreateProposalFunds(this.expandedCreateProposalFundsProduct);
    return funds.reduce((total, fund) => total + (Number(fund.allocation) || 0), 0);
  }

  get createProposalFundProductNames(): string[] {
    return this.selectedProductNames.filter(productName => this.supportsCreateProposalFunds(productName));
  }

  get isCreateProposalFundAllocationComplete(): boolean {
    return this.createProposalFundProductNames.every(productName => this.getCreateProposalTotalAllocation(productName) === 100);
  }

  get proposalEditSelectedFundCount(): number {
    return this.proposalEditFunds.filter(fund => Number(fund.allocation) > 0).length;
  }

  get proposalEditAllocationIsValid(): boolean {
    return this.proposalEditTotalAllocation === 100;
  }

  get insuredSummary(): string {
    if (!this.gender || !this.birthdate) return 'Not provided';
    const [year, month, day] = this.birthdate.split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return `${this.gender}, ${age} years old`;
  }

  get proposalDetailInsuredInfo() {
    const builder = this.proposalBuilderInsured;
    const questionnaire = this.proposalIndividualInfo;
    const useBuilder = Boolean(builder.firstName || builder.lastName || builder.occupation);
    return useBuilder ? builder : {
      title: questionnaire.title,
      firstName: questionnaire.firstName,
      middleName: questionnaire.middleName,
      lastName: questionnaire.lastName,
      suffix: '',
      birthdate: questionnaire.birthdate || this.birthdate,
      gender: questionnaire.gender || this.gender,
      occupation: ''
    };
  }

  get proposalDetailOwnerInfo() {
    const owner = this.proposalIndividualInfo;
    return { ...owner, suffix: '' };
  }

  get proposalBuilderInsuredAge(): string {
    const [year, month, day] = this.proposalBuilderInsured.birthdate.split('-').map(Number);
    if (!year || !month || !day) return '—';
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return String(age);
  }

  get isProposalBuilderInsuredComplete(): boolean {
    if (this.proposalBuilderSameAsLead) return true;
    const insured = this.proposalBuilderInsured;
    const identityComplete = Boolean(
      insured.title.trim() && insured.firstName.trim() && insured.lastName.trim() &&
      insured.birthdate && insured.gender
    );
    return identityComplete && Boolean(insured.occupation.trim()) && Boolean(this.proposalBuilderDnfbp);
  }

  toggleProposalBuilderSection(section: 'proposal' | 'lead' | 'insured'): void {
    const expandedSections = new Set(this.proposalBuilderExpandedSections);
    if (expandedSections.has(section)) expandedSections.delete(section);
    else expandedSections.add(section);
    this.proposalBuilderExpandedSections = expandedSections;
  }

  openProposalBenefitEditor(returnToProposalDetail = false): void {
    this.proposalBenefitEditorReturnTarget = returnToProposalDetail ? 'proposal-detail' : 'builder-info';
    this.proposalEditStep = 'benefits';
    this.proposalEditRiders = this.proposalEditRiders.map((rider, index) => ({ ...rider, included: index < 2 }));
    this.proposalEditPaymentPeriod = this.selectedPaymentPeriod;
    this.proposalEditAnnualPremium = this.currencyAmountForEditing(this.selectedAnnualPremium);
    this.proposalEditBenefitAmount = this.currencyAmountForEditing(this.selectedBenefitAmount);
    this.showProposalBuilderInfo = false;
    this.showProposalBenefitEditor = true;
    this.resetProposalContentScroll();
  }

  cancelProposalBenefitEdit(): void {
    this.proposalEditStep = 'benefits';
    this.showProposalBenefitEditor = false;
    this.showProposalBuilderInfo = this.proposalBenefitEditorReturnTarget === 'builder-info';
    this.showProposalDetails = this.proposalBenefitEditorReturnTarget === 'proposal-detail';
    if (this.proposalBenefitEditorReturnTarget === 'proposal-detail') {
      this.showProposalIndividualInfo = false;
      this.showProposalIndividualInfoSummary = false;
      this.showProposalCsa = false;
      this.showProposalBuilderSavedList = false;
    }
    this.resetProposalContentScroll();
  }

  continueProposalBenefitEdit(): void {
    if (this.proposalEditStep === 'benefits') {
      this.proposalEditStep = 'riders';
      this.resetProposalContentScroll();
      return;
    }
    if (this.proposalEditStep === 'riders') {
      this.proposalEditStep = 'funds';
      this.resetProposalContentScroll();
      return;
    }
    this.editedProposalPaymentPeriod = this.proposalEditPaymentPeriod;
    this.editedProposalAnnualPremium = this.formatProposalCurrency(this.proposalEditAnnualPremium);
    this.editedProposalBenefitAmount = this.formatProposalCurrency(this.proposalEditBenefitAmount);
    this.editedProposalRiderCount = this.proposalEditIncludedRiders.length;
    this.editedProposalFundCount = this.proposalEditSelectedFundCount;
    this.showProposalBenefitEditor = false;
    this.showProposalBuilderInfo = true;
    if (this.proposalDetailReturnTarget === 'recommendations') {
      this.showProposalBuilderInfo = false;
      this.showProposalDetails = true;
    }
    this.resetProposalContentScroll();
  }

  toggleProposalEditRider(rider: typeof this.proposalEditRiders[number]): void {
    if (!rider.included) rider.addedByUser = true;
    rider.included = !rider.included;
  }

  backToProposalEditBenefits(): void {
    this.proposalEditStep = 'benefits';
    this.resetProposalContentScroll();
  }

  backToProposalEditRiders(): void {
    this.proposalEditStep = 'riders';
    this.resetProposalContentScroll();
  }

  get proposalEditIncludedRiders(): typeof this.proposalEditRiders {
    return this.proposalEditRiders.filter(rider => rider.included);
  }

  get proposalEditOptionalRiders(): typeof this.proposalEditRiders {
    return this.proposalEditRiders.filter(rider => !rider.included);
  }

  private currencyAmountForEditing(value: string): string {
    return String(value ?? '').replace(/[^\d.]/g, '');
  }

  private formatProposalCurrency(value: string): string {
    const amount = Number(this.currencyAmountForEditing(value));
    return `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  }

  setProposalBuilderSameAsLead(isSame: boolean): void {
    this.proposalBuilderSameAsLead = isSame;
    if (isSame) {
      this.proposalBuilderInsured = {
        ...this.proposalBuilderInsured,
        title: this.proposalIndividualInfo.title,
        firstName: this.proposalIndividualInfo.firstName,
        middleName: this.proposalIndividualInfo.middleName,
        lastName: this.proposalIndividualInfo.lastName,
        birthdate: this.proposalIndividualInfo.birthdate || this.birthdate,
        gender: this.proposalIndividualInfo.gender || this.gender
      };
    }
  }

  birthdate = '';
  gender = '';
  productBenefitValues: Record<string, Partial<Record<ProductBenefitFieldKey, string>>> = {};
  readonly proposalGoals: readonly ProposalGoal[] = [
    {
      title: 'Protect My Loved Ones',
      description: 'Provide financial security for your loved ones.',
      illustration: 'assets/proposal-goal-protect-loved-ones.png'
    },
    {
      title: 'Prepare for Health Needs',
      description: 'Be financially prepared for unexpected illness or injury.',
      illustration: 'assets/proposal-goal-prepare-health-needs.png'
    },
    {
      title: 'Grow My Money',
      description: 'Be financially prepared for unexpected illness or injury.',
      illustration: 'assets/proposal-goal-grow-money.png'
    }
  ];
  readonly riskPreferences: readonly ProposalRiskPreference[] = [
    {
      title: 'More Stability',
      description: 'Prefer smaller changes in value, even if growth potential may be lower.',
      illustration: 'assets/proposal-risk-stability.png'
    },
    {
      title: 'Balanced',
      description: 'Accept moderate changes in value for a balance of stability and growth.',
      illustration: 'assets/proposal-risk-balanced.png'
    },
    {
      title: 'More Growth Potential',
      description: 'Accept larger changes in value for greater growth potential.',
      illustration: 'assets/proposal-risk-growth.png'
    }
  ];
  readonly protectionOptions: readonly ProposalGoal[] = [
    { title: 'Critical Illness', description: 'Financial support if you’re diagnosed with a serious illness.', illustration: 'assets/proposal-protection-critical-illness.png' },
    { title: 'Accidents', description: 'Financial support if you’re injured in an accident.', illustration: 'assets/proposal-protection-accidents.png' },
    { title: 'Disability', description: 'Financial support if illness or injury affects your ability to work.', illustration: 'assets/proposal-protection-disability.png' },
    { title: 'None for Now', description: 'I don’t need additional protection right now.', illustration: 'assets/proposal-protection-none-for-now.png' }
  ];
  readonly investmentPreferences: readonly ProposalInvestmentPreference[] = [
    { title: 'Local Opportunities', description: 'Focus on opportunities in the Philippine market.', illustration: 'assets/proposal-investment-local.png' },
    { title: 'Global Opportunities', description: 'Explore opportunities across international markets.', illustration: 'assets/proposal-investment-global.png' },
    { title: 'A Mix of Both', description: 'Combine local and global investment opportunities.', illustration: 'assets/proposal-investment-mixed.png' }
  ];
  readonly lifeStages: readonly ProposalGoal[] = [
    { title: 'Starting Out', description: 'Building career, savings, and financial independence.', illustration: 'assets/proposal-life-stage-starting-out.png' },
    { title: 'Growing Family', description: 'Starting or raising a young family', illustration: 'assets/proposal-life-stage-growing-family.png' },
    { title: 'Established Family', description: 'Managing longer-term family and financial commitments', illustration: 'assets/proposal-life-stage-established-family.png' },
    { title: 'Pre-Retirement', description: 'Preparing financially for retirement', illustration: 'assets/proposal-life-stage-pre-retirement.png' },
    { title: 'Retired', description: 'Already in retirement', illustration: 'assets/proposal-life-stage-retired.png' }
  ];
  readonly products: readonly ProposalProduct[] = [
    { name: 'Dream Builder', icon: 'assets/proposal-product-dream-builder.png' },
    { name: 'Endowment', icon: 'assets/proposal-product-dream-builder.png' },
    { name: 'Future Assure', icon: 'assets/proposal-product-future-assure.png' },
    { name: 'Future Assure (Peso)', icon: 'assets/proposal-product-future-assure-max.png' },
    { name: 'Future Assure (Dollar)', icon: 'assets/proposal-product-future-assure-max.png' },
    { name: 'Future Assure (Regular Pay)', icon: 'assets/proposal-product-future-assure.png' },
    { name: 'Life Essential', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Sure Start', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Big Umbrella', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Graduate', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Legacy', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Prime Umbrella', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Safety Umbrella', icon: 'assets/proposal-product-life-essentials.png' }
  ];
  readonly hiddenProductNames = new Set([
    'Troo Graduate',
    'Troo Legacy',
    'Troo Prime Umbrella',
    'Troo Safety Umbrella'
  ]);

  get visibleProducts(): readonly ProposalProduct[] {
    return this.products.filter(product => !this.hiddenProductNames.has(product.name));
  }

  get productInfoProgressPercent(): number {
    if (this.startedFromSavedProposalList) {
      return this.productInfoStep === 'products' ? 20 : this.productInfoStep === 'info' ? 40 : this.productInfoStep === 'benefits' ? 60 : this.productInfoStep === 'riders' ? 80 : 100;
    }
    return this.productInfoStep === 'info' ? 30 : this.productInfoStep === 'benefits' ? 55 : this.productInfoStep === 'riders' ? 75 : 100;
  }

  get productInfoContinueLabel(): string {
    if (this.productInfoStep !== 'funds') return 'Next';
    if (this.startedFromSavedProposalList || this.isMultiProductProposalCompletionFlow || (this.startedFromProductSelection && this.selectedProductNames.length > 1)) return 'Review Proposals';
    return this.selectedProductNames.length > 1 ? 'Create Proposals' : 'Create Proposal';
  }

  private generationTimer?: ReturnType<typeof setTimeout>;
  private proposalBuilderSaveToastTimer?: ReturnType<typeof setTimeout>;
  private readonly proposalGenerationDelay = 2400;

  constructor(readonly navigation: AppNavigationStateService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (this.showRecommendations) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.scrollRecommendationToCenter(1, 'auto')));
    }
  }

  ngOnDestroy(): void {
    this.clearGenerationTimer();
    if (this.proposalBuilderSaveToastTimer) clearTimeout(this.proposalBuilderSaveToastTimer);
  }

  get progressPercent(): number {
    return (this.questionStep / 7) * 100;
  }

  get isQuestionOneComplete(): boolean {
    const birthdate = this.birthdate.trim() || this.proposalIndividualInfo.birthdate.trim();
    const gender = this.gender.trim() || this.proposalIndividualInfo.gender.trim();
    return Boolean(
      this.selectedCoverage &&
      this.proposalIndividualInfo.firstName.trim() &&
      this.proposalIndividualInfo.lastName.trim() &&
      birthdate && gender
    );
  }

  selectCoverage(coverage: 'myself' | 'someone-else'): void {
    if (this.selectedCoverage && this.selectedCoverage !== coverage) {
      this.birthdate = '';
      this.gender = '';
      this.proposalIndividualInfo.birthdate = '';
      this.proposalIndividualInfo.gender = '';
    }
    this.selectedCoverage = coverage;
    setTimeout(() => {
      const detailsElement = this.proposalDetails?.nativeElement;
      const scrollContainer = detailsElement?.closest<HTMLElement>('.proposal-questionnaire__main');
      if (!detailsElement || !scrollContainer) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const detailsRect = detailsElement.getBoundingClientRect();
      const stickyProgressHeight = scrollContainer.querySelector<HTMLElement>('.proposal-questionnaire__progress')?.offsetHeight ?? 0;
      const visibleHeight = scrollContainer.clientHeight - stickyProgressHeight;
      const detailsTop = scrollContainer.scrollTop + detailsRect.top - containerRect.top - stickyProgressHeight;
      const centeredTop = detailsTop - (visibleHeight - detailsRect.height) / 2;
      const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const top = Math.max(0, Math.min(centeredTop, maxScrollTop));
      const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (scrollContainer.scrollTo) scrollContainer.scrollTo({ top, behavior });
      else scrollContainer.scrollTop = top;
    });
  }

  setNoMiddleName(noMiddleName: boolean): void {
    this.noMiddleName = noMiddleName;
    if (noMiddleName) this.proposalIndividualInfo.middleName = '';
  }

  capitalizeName(value: string): string {
    return value.replace(/^(\s*)(.)/u, (_match, whitespace: string, firstCharacter: string) =>
      `${whitespace}${firstCharacter.toLocaleUpperCase()}`
    );
  }

  get isQuestionTwoComplete(): boolean {
    return this.selectedGoals.length > 0;
  }

  get isQuestionThreeComplete(): boolean {
    return this.budgetAmount >= 50000 && this.budgetAmount <= 500000;
  }

  get isQuestionFourComplete(): boolean {
    return this.selectedLifeStage !== null;
  }

  get isQuestionFiveComplete(): boolean {
    return this.selectedProtections.length > 0;
  }

  get isQuestionSixComplete(): boolean {
    return this.selectedRiskPreference !== null;
  }

  get isQuestionSevenComplete(): boolean {
    return this.selectedInvestmentPreference !== null;
  }

  formatBudget(value: number): string {
    return `₱ ${value.toLocaleString('en-PH')}`;
  }

  setBudget(value: number): void {
    this.budgetAmount = value;
  }

  openBirthdatePicker(input: HTMLInputElement): void {
    input.focus();
    input.showPicker?.();
  }

  openProposalGenerator(): void {
    this.navigation.setSidebarOpen(false);
    this.showQuestionnaire = true;
    this.showProductInfo = false;
    this.productInfoStep = 'info';
    this.expandedCreateProposalRiderProduct = '';
    this.startedFromProductSelection = false;
    this.showRecommendations = false;
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.proposal-generator__content')?.scrollTo?.({ top: 0, behavior: 'smooth' });
    });
  }

  openSelectedProductProposal(): void {
    if (this.selectedProductNames.length === 0) return;
    this.navigation.setSidebarOpen(false);
    this.showQuestionnaire = true;
    this.showProductInfo = true;
    this.productInfoStep = 'info';
    this.expandedCreateProposalBenefitProduct = this.selectedProductNames[0] ?? '';
    this.productBenefitValues = {};
    this.createProposalRidersByProduct = Object.fromEntries(this.selectedProductNames.map(productName => [
      productName,
      this.createProposalRiderOptions.map(rider => ({ ...rider }))
    ]));
    this.resetCreateProposalFunds();
    this.startedFromProductSelection = true;
    this.startedFromSavedProposalList = false;
    this.isMultiProductProposalCompletionFlow = false;
    this.showCreateProposalReview = false;
    this.showRecommendations = false;
    this.showProposalDetails = false;
    this.isGeneratingProposals = false;
    this.questionStep = 1;
    this.expandedProposalProduct = '';
    requestAnimationFrame(() => this.proposalContent?.nativeElement.scrollTo?.({ top: 0, behavior: 'smooth' }));
  }

  returnToProductSelection(): void {
    this.showQuestionnaire = false;
    this.showProductInfo = false;
    this.productInfoStep = 'info';
    this.isGeneratingProposals = false;
    this.showRecommendations = false;
    this.showProposalDetails = false;
    this.isMultiProductProposalCompletionFlow = false;
    requestAnimationFrame(() => this.proposalContent?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  cancelSavedProposalCreate(): void {
    this.startedFromSavedProposalList = false;
    this.showCreateProposalReview = false;
    this.showProductInfo = false;
    this.showQuestionnaire = true;
    this.showProposalBuilderSavedList = true;
    this.resetProposalContentScroll();
  }

  continueFromSavedProposalProducts(): void {
    if (!this.startedFromSavedProposalList || this.productInfoStep !== 'products' || !this.selectedProductNames.length) return;
    this.showCreateProposalReview = false;
    this.productInfoStep = 'info';
    this.createProposalRidersByProduct = Object.fromEntries(this.selectedProductNames.map(productName => [
      productName,
      this.createProposalRiderOptions.map(rider => ({ ...rider }))
    ]));
    this.expandedCreateProposalBenefitProduct = this.selectedProductNames[0] ?? '';
    this.expandedCreateProposalRiderProduct = '';
    this.productBenefitValues = {};
    this.resetCreateProposalFunds();
    this.scrollQuestionnaireToTop();
  }

  backToSavedProposalProducts(): void {
    if (!this.startedFromSavedProposalList || this.productInfoStep !== 'info') return;
    this.productInfoStep = 'products';
    this.scrollQuestionnaireToTop();
  }

  continueFromProductInfo(): void {
    if (!this.birthdate || !this.gender) return;
    this.productInfoStep = 'benefits';
    this.expandedCreateProposalBenefitProduct = this.selectedProductNames[0] ?? '';
    this.expandedProposalProduct = '';
    this.scrollQuestionnaireToTop();
  }

  goBackToProductInfo(): void {
    this.productInfoStep = 'info';
    this.scrollQuestionnaireToTop();
  }

  continueFromProductBenefits(): void {
    this.expandedCreateProposalBenefitProduct = this.selectedProductNames[0] ?? '';
    this.expandedCreateProposalRiderProduct = this.selectedProductNames[0] ?? '';
    this.productInfoStep = 'riders';
    this.scrollQuestionnaireToTop();
  }

  continueFromProductRiders(): void {
    this.ensureCreateProposalFundsInitialized();
    this.expandedCreateProposalFundsProduct = this.createProposalFundProductNames[0] ?? '';
    this.productInfoStep = 'funds';
    this.scrollQuestionnaireToTop();
  }

  supportsCreateProposalFunds(productName: string): boolean {
    return productName === 'Dream Builder' || productName === 'Endowment' || productName.startsWith('Future Assure');
  }

  getCreateProposalFunds(productName: string): { name: string; allocation: number }[] {
    return this.createProposalFundsByProduct[productName] ?? [];
  }

  getCreateProposalTotalAllocation(productName: string): number {
    return this.getCreateProposalFunds(productName).reduce((total, fund) => total + (Number(fund.allocation) || 0), 0);
  }

  toggleCreateProposalFundsProduct(productName: string, productIndex: number): void {
    if (this.expandedCreateProposalFundsProduct === productName) {
      this.expandedCreateProposalFundsProduct = this.createProposalFundProductNames[productIndex + 1] ?? '';
      return;
    }
    this.expandedCreateProposalFundsProduct = productName;
  }

  toggleCreateProposalBenefitProduct(productName: string, productIndex: number): void {
    if (this.expandedCreateProposalBenefitProduct === productName) {
      this.expandedCreateProposalBenefitProduct = this.selectedProductNames[productIndex + 1] ?? '';
      return;
    }
    this.expandedCreateProposalBenefitProduct = productName;
  }

  private ensureCreateProposalFundsInitialized(): void {
    for (const productName of this.createProposalFundProductNames) {
      if (this.createProposalFundsByProduct[productName]) continue;
      this.createProposalFundsByProduct[productName] = this.createProposalFunds.map(fund => ({ ...fund }));
      this.createProposalTopUpByProduct[productName] = '';
    }
  }

  private resetCreateProposalFunds(): void {
    this.createProposalFundsByProduct = {};
    this.createProposalTopUpByProduct = {};
    this.ensureCreateProposalFundsInitialized();
  }

  continueFromProductFunds(): void {
    const recommendationIndex = this.recommendations.findIndex(item => item.name === this.selectedProductNames[0]);
    this.startedFromSavedProposalList = false;
    this.showProductInfo = false;
    this.openProposalDetailFrom(Math.max(0, recommendationIndex), 'create-review');
  }

  saveSavedProposalsFromFunds(): void {
    if ((!this.startedFromSavedProposalList && !this.startedFromProductSelection) || (!this.showCreateProposalReview && this.productInfoStep !== 'funds') || !this.isCreateProposalFundAllocationComplete) return;
    const firstNewProposalNumber = Number(this.proposalNumber) + this.createdSavedProposals.length + 1;
    const proposalDate = new Intl.DateTimeFormat('en-US').format(new Date());
    const newProposals = this.selectedProductNames.map((productName, index) => {
      const summaryRows = this.getProductSummaryRows(productName);
      return {
        name: productName,
        proposalNumber: String(firstNewProposalNumber + index),
        proposalDate,
        annualPremium: summaryRows.find(row => row.label === 'Annual Premium' || row.label === 'Single Premium')?.value ?? '—',
        benefitAmount: summaryRows.find(row => row.label === 'Benefit Amount' || row.label === 'Basic Sum Insured')?.value ?? '—'
      };
    });
    this.createdSavedProposals = [...newProposals, ...this.createdSavedProposals];
    this.showProductInfo = false;
    this.showQuestionnaire = true;
    this.startedFromSavedProposalList = false;
    this.startedFromProductSelection = false;
    this.showCreateProposalReview = false;
    this.showProposalBuilderSavedList = true;
    this.showProposalBuilderSaveToast(newProposals.length === 1 ? 'Proposal saved successfully.' : 'Proposals saved successfully.');
    this.resetProposalContentScroll();
  }

  openCreateProposalReview(): void {
    if ((!this.startedFromSavedProposalList && !this.startedFromProductSelection) || this.productInfoStep !== 'funds') return;
    this.createProposalReviewRows = this.getCreateProposalReviewRows();
    this.isMultiProductProposalCompletionFlow ||= this.startedFromProductSelection && this.selectedProductNames.length > 1;
    this.showCreateProposalReview = true;
    this.showProductInfo = false;
    this.showQuestionnaire = true;
    this.resetProposalContentScroll();
    this.changeDetectorRef.detectChanges();
  }

  backToCreateProposalFunds(): void {
    if (!this.showCreateProposalReview) return;
    this.showCreateProposalReview = false;
    this.showProductInfo = true;
    this.showQuestionnaire = true;
    this.productInfoStep = 'funds';
    this.scrollQuestionnaireToTop();
    this.changeDetectorRef.detectChanges();
  }

  removeCreateProposalReviewProduct(productName: string): void {
    this.selectedProductNames = this.selectedProductNames.filter(name => name !== productName);
    this.createProposalReviewRows = this.getCreateProposalReviewRows();
    this.changeDetectorRef.detectChanges();
  }

  getCreateProposalReviewRows(): ProposalComparisonRow[] {
    const rowsByProduct = this.selectedProductNames.map(productName => {
      const rows = this.getProductSummaryRows(productName).filter(row => row.value !== '—' && row.label !== 'Funds');
      const funds = this.getCreateProposalFunds(productName)
        .filter(fund => Number(fund.allocation) > 0)
        .map(fund => `${fund.name} ${fund.allocation}%`);
      if (funds.length) rows.push({ label: 'Premium Allocation', value: funds.join(', ') });
      const topUp = this.createProposalTopUpByProduct[productName]?.trim();
      if (topUp && Number(topUp.replace(/,/g, '')) > 0) {
        rows.push({
          label: 'Top up Amount',
          value: `${this.getProductBenefitCurrencyPrefix(productName)}${new Intl.NumberFormat(productName.includes('(Dollar)') ? 'en-US' : 'en-PH').format(Number(topUp.replace(/,/g, '')))}`
        });
      }
      return rows;
    });
    const labels = [...new Set(rowsByProduct.flatMap(rows => rows.map(row => row.label)))];
    return labels.map(label => ({
      label,
      values: rowsByProduct.map(rows => rows.find(row => row.label === label)?.value ?? '—')
    }));
  }

  getCreateProposalReviewProductRows(productName: string): { label: string; value: string }[] {
    const productIndex = this.selectedProductNames.indexOf(productName);
    return this.createProposalReviewRows.flatMap(row => {
      const value = row.values[productIndex];
      return value && value !== '—' ? [{ label: row.label, value }] : [];
    });
  }

  get createProposalReviewContinueLabel(): string {
    return this.startedFromProductSelection && this.selectedProductNames.length > 1 ? 'Create Proposals' : 'Continue';
  }

  continueFromCreateProposalReview(): void {
    if (!this.selectedProductNames.length || !this.isCreateProposalFundAllocationComplete) return;
    if (this.isMultiProductProposalCompletionFlow) {
      this.beginMultiProductProposalCompletion();
      return;
    }
    this.saveSavedProposalsFromFunds();
  }

  private beginMultiProductProposalCompletion(): void {
    this.isMultiProductProposalCompletionFlow = true;
    this.proposalIndividualInfoCreatedAt = new Date();
    this.showCreateProposalReview = false;
    this.showProductInfo = false;
    this.showProposalIndividualInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = false;
    this.showProposalBuilderSavedList = false;
    this.showProposalDetails = true;
    this.showProposalApplication = false;
    this.showQuestionnaire = true;
    this.proposalDetailReturnTarget = 'multi-product-completion';
    this.resetProposalContentScroll();
    this.changeDetectorRef.detectChanges();
  }

  backToProductRiders(): void {
    this.productInfoStep = 'riders';
    this.scrollQuestionnaireToTop();
  }

  backToProductBenefits(): void {
    this.productInfoStep = 'benefits';
    this.scrollQuestionnaireToTop();
  }

  toggleCreateProposalRider(productName: string, rider: ProposalRider): void {
    if (!rider.included) rider.addedByUser = true;
    rider.included = !rider.included;
  }

  getCreateProposalRiders(productName: string, included: boolean): ProposalRider[] {
    return (this.createProposalRidersByProduct[productName] ?? []).filter(rider => rider.included === included);
  }

  goToPreviousQuestion(): void {
    if (this.startedFromProductSelection && this.questionStep === 2) {
      this.showProductInfo = true;
      this.productInfoStep = 'riders';
      this.scrollQuestionnaireToTop();
      return;
    }
    this.questionStep = Math.max(1, this.questionStep - 1) as ProposalQuestionStep;
    this.scrollQuestionnaireToTop();
  }

  toggleProposalProductSummary(productName: string): void {
    this.expandedProposalProduct = this.expandedProposalProduct === productName ? '' : productName;
  }

  toggleCreateProposalRiderProduct(productName: string, productIndex: number): void {
    if (this.expandedCreateProposalRiderProduct === productName) {
      this.expandedCreateProposalRiderProduct = this.selectedProductNames[productIndex + 1] ?? '';
      return;
    }
    this.expandedCreateProposalRiderProduct = productName;
  }

  getProductBenefitFields(productName: string): readonly ProductBenefitField[] {
    const paymentPeriod: ProductBenefitField = {
      key: 'paymentPeriod', label: 'Payment Period', type: 'select', options: this.productBenefitPaymentPeriodOptions
    };
    const paymentFrequency: ProductBenefitField = {
      key: 'paymentFrequency', label: 'Payment Frequency', type: 'select', options: this.productBenefitPaymentFrequencyOptions
    };
    const policyTerm: ProductBenefitField = {
      key: 'policyTerm', label: 'Policy Term', type: 'select', options: this.productBenefitPolicyTermOptions
    };
    const annualPremium: ProductBenefitField = { key: 'annualPremium', label: 'Annual Premium', type: 'currency' };
    const singlePremium: ProductBenefitField = { key: 'singlePremium', label: 'Single Premium', type: 'currency' };
    const benefitAmount: ProductBenefitField = { key: 'benefitAmount', label: 'Benefit Amount', type: 'currency' };
    const basicSumInsured: ProductBenefitField = { key: 'basicSumInsured', label: 'Basic Sum Insured', type: 'currency' };
    const discountType: ProductBenefitField = {
      key: 'discountType', label: 'Discount Type', type: 'select', options: this.productBenefitDiscountTypeOptions
    };
    const payoutOption: ProductBenefitField = {
      key: 'payoutOption', label: 'Payout Option', type: 'select', options: this.productBenefitPayoutOptions
    };

    if (productName === 'Dream Builder') {
      return [paymentPeriod, paymentFrequency, basicSumInsured, annualPremium, discountType];
    }
    if (productName === 'Endowment') {
      return [paymentPeriod, paymentFrequency, policyTerm, annualPremium, benefitAmount, discountType];
    }
    if (productName === 'Future Assure (Peso)') return [paymentPeriod, singlePremium, benefitAmount];
    if (productName === 'Future Assure (Dollar)') return [paymentPeriod, singlePremium, benefitAmount, discountType];
    if (productName === 'Life Essential') return [paymentPeriod, paymentFrequency, basicSumInsured, discountType];
    if (productName === 'Sure Start') return [paymentPeriod, paymentFrequency, basicSumInsured, annualPremium, discountType];
    if (productName === 'Troo Big Umbrella' || productName === 'Troo Prime Umbrella' || productName === 'Troo Safety Umbrella') {
      return [paymentPeriod, paymentFrequency, annualPremium, discountType];
    }
    if (productName === 'Troo Graduate') return [paymentPeriod, paymentFrequency, policyTerm, benefitAmount, discountType, payoutOption];
    if (productName === 'Troo Legacy') return [paymentPeriod, paymentFrequency, benefitAmount, discountType];
    if (productName === 'Future Assure (Regular Pay)') return [paymentPeriod, annualPremium, benefitAmount];
    return [paymentPeriod, annualPremium, benefitAmount];
  }

  getProductBenefitValue(productName: string, field: ProductBenefitFieldKey): string {
    return this.productBenefitValues[productName]?.[field] ?? '';
  }

  getProductBenefitCurrencyPrefix(productName: string): string {
    return productName.includes('(Dollar)') ? '$' : '₱';
  }

  get productInfoInsuredAge(): string {
    if (!this.birthdate) return '—';
    const [year, month, day] = this.birthdate.split('-').map(Number);
    if (!year || !month || !day) return '—';
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return String(age);
  }

  getProductSummaryRows(productName: string): readonly { label: string; value: string }[] {
    const productFields = this.getProductBenefitFields(productName);
    const amount = (key: ProductBenefitFieldKey): string => {
      const fieldValue = this.getProductBenefitValue(productName, key).trim();
      if (!fieldValue) return '—';
      const numericValue = Number(fieldValue.replace(/,/g, ''));
      return Number.isFinite(numericValue)
        ? `${this.getProductBenefitCurrencyPrefix(productName)}${new Intl.NumberFormat(productName.includes('(Dollar)') ? 'en-US' : 'en-PH', { maximumFractionDigits: 2 }).format(numericValue)}`
        : fieldValue;
    };
    const fieldValue = (key: ProductBenefitFieldKey): string =>
      productFields.some(field => field.key === key) ? (this.getProductBenefitValue(productName, key).trim() || '—') : '—';

    return [
      ...productFields.map(field => ({
        label: field.label,
        value: field.type === 'currency'
          ? amount(field.key)
          : fieldValue(field.key)
      })),
      { label: 'Riders', value: this.createProposalRidersByProduct[productName]
        ? `${this.getCreateProposalRiders(productName, true).length} Riders`
        : this.selectedProtections.length ? `${this.selectedProtections.length} Riders` : '—' },
      { label: 'Funds', value: '—' }
    ];
  }

  setProductBenefitValue(productName: string, field: ProductBenefitFieldKey, value: string): void {
    this.productBenefitValues = {
      ...this.productBenefitValues,
      [productName]: { ...this.productBenefitValues[productName], [field]: value }
    };
  }

  setProductBenefitPaymentPeriod(productName: string, paymentPeriod: string): void {
    const currentValues = this.productBenefitValues[productName] ?? {};
    const sampleValues: Partial<Record<ProductBenefitFieldKey, string>> = {};
    const fields = this.getProductBenefitFields(productName);

    if (paymentPeriod === '10 years') {
      if (fields.some(field => field.key === 'annualPremium') && !currentValues.annualPremium) sampleValues.annualPremium = '80000';
      if (fields.some(field => field.key === 'singlePremium') && !currentValues.singlePremium) sampleValues.singlePremium = '80000';
      if (fields.some(field => field.key === 'benefitAmount') && !currentValues.benefitAmount) sampleValues.benefitAmount = '4200000';
      if (fields.some(field => field.key === 'basicSumInsured') && !currentValues.basicSumInsured) sampleValues.basicSumInsured = '4200000';
    }

    this.productBenefitValues = {
      ...this.productBenefitValues,
      [productName]: { ...currentValues, ...sampleValues, paymentPeriod }
    };
  }

  setProductBenefitField(productName: string, field: ProductBenefitFieldKey, value: string): void {
    if (field === 'paymentPeriod') {
      this.setProductBenefitPaymentPeriod(productName, value);
      return;
    }
    this.setProductBenefitValue(productName, field, value);
  }

  get areProductBenefitsComplete(): boolean {
    return this.selectedProductNames.length > 0 && this.selectedProductNames.every(productName =>
      this.getProductBenefitFields(productName).every(field => Boolean(this.getProductBenefitValue(productName, field.key).trim()))
    );
  }

  toggleProductSelection(productName: string, isSelected: boolean): void {
    this.selectedProductNames = isSelected
      ? [...this.selectedProductNames, productName]
      : this.selectedProductNames.filter(name => name !== productName);
  }

  cancelQuestionnaire(): void {
    this.clearGenerationTimer();
    this.showQuestionnaire = false;
    this.showProductInfo = false;
    this.productInfoStep = 'info';
    this.productBenefitValues = {};
    this.startedFromProductSelection = false;
    this.isGeneratingProposals = false;
    this.showRecommendations = false;
    this.showProposalDetails = false;
    this.questionStep = 1;
    this.selectedCoverage = null;
    this.selectedGoals = [];
    this.selectedProtections = [];
    this.selectedLifeStage = null;
    this.selectedRiskPreference = null;
    this.selectedInvestmentPreference = null;
    this.budgetAmount = 100000;
    this.birthdate = '';
    this.gender = '';
    this.noMiddleName = false;
    this.proposalIndividualInfo = {
      firstName: '', title: '', middleName: '', gender: '', lastName: '', birthdate: '',
      mobileNumber: '', email: '', sourceOfLead: '', productInterested: '',
      referrerDate: '', referrerName: '', referrerId: '', storeName: '', storeId: ''
    };
  }

  continueQuestionnaire(): void {
    if (this.questionStep === 1 && this.isQuestionOneComplete) {
      this.questionStep = 2;
      this.scrollQuestionnaireToTop();
    } else if (this.questionStep === 2 && this.isQuestionTwoComplete) {
      this.questionStep = 3;
      this.scrollQuestionnaireToTop();
    } else if (this.questionStep === 3 && this.isQuestionThreeComplete) {
      this.questionStep = 4;
      this.scrollQuestionnaireToTop();
    } else if (this.questionStep === 4 && this.isQuestionFourComplete) {
      this.questionStep = 5;
      this.scrollQuestionnaireToTop();
    } else if (this.questionStep === 5 && this.isQuestionFiveComplete) {
      this.questionStep = 6;
      this.scrollQuestionnaireToTop();
    } else if (this.questionStep === 6 && this.isQuestionSixComplete) {
      this.questionStep = 7;
      this.scrollQuestionnaireToTop();
    } else if (this.questionStep === 7 && this.isQuestionSevenComplete) {
      this.startProposalGeneration();
    }
  }

  returnToQuestionnaire(): void {
    this.showRecommendations = false;
    this.showProposalDetails = false;
    this.isGeneratingProposals = false;
    this.questionStep = 7;
    this.scrollQuestionnaireToTop();
  }

  editAnswers(): void {
    this.showQuestionnaire = true;
    this.showRecommendations = false;
    this.showProposalDetails = false;
    this.isGeneratingProposals = false;
    this.birthdate ||= this.proposalIndividualInfo.birthdate;
    this.gender ||= this.proposalIndividualInfo.gender;
    this.questionStep = 1;
    this.scrollQuestionnaireToTop();
  }

  browseAllProducts(): void {
    this.showQuestionnaire = false;
    this.showRecommendations = false;
    this.showProposalDetails = false;
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.proposal-generator__content')?.scrollTo?.({ top: 0, behavior: 'smooth' });
    });
  }

  showRecommendation(index: number): void {
    this.activeRecommendationIndex = index;
    this.scrollRecommendationToCenter(index, window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  }

  openProposalDetail(index: number): void {
    this.openProposalDetailFrom(index, 'recommendations');
  }

  openSavedProposalDetails(): void {
    this.openProposalDetailFrom(this.selectedProposalIndex, 'saved-list');
  }

  private openProposalDetailFrom(index: number, returnTarget: 'recommendations' | 'saved-list' | 'create-review' | 'multi-product-completion'): void {
    this.selectedProposalIndex = index;
    this.proposalDetailReturnTarget = returnTarget;
    this.showQuestionnaire = true;
    this.showRecommendations = false;
    this.showProposalDetails = true;
    this.showProposalApplication = false;
    this.showProposalIndividualInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = false;
    this.showProposalBuilderSavedList = false;
    this.showProposalInfoSaveConfirmation = false;
    this.showProposalBuilderSaveConfirmation = false;
    this.resetProposalContentScroll();
  }

  returnFromProposalDetail(): void {
    if (this.proposalDetailReturnTarget === 'multi-product-completion') {
      this.showProposalDetails = false;
      this.showQuestionnaire = true;
      this.showCreateProposalReview = true;
      this.resetProposalContentScroll();
      return;
    }
    if (this.proposalDetailReturnTarget === 'create-review') {
      this.showProposalDetails = false;
      this.showQuestionnaire = true;
      this.showProductInfo = true;
      this.productInfoStep = 'funds';
      this.resetProposalContentScroll();
      return;
    }
    if (this.proposalDetailReturnTarget === 'saved-list') {
      this.showProposalDetails = false;
      this.showProposalBuilderSavedList = true;
      this.showProposalBuilderInfo = false;
      this.showProposalIndividualInfo = false;
      this.showProposalIndividualInfoSummary = false;
      this.showProposalCsa = false;
      this.proposalDetailReturnTarget = 'recommendations';
      this.resetProposalContentScroll();
      return;
    }
    this.returnToRecommendations();
  }

  openProposalApplication(): void {
    this.showProposalDetails = false;
    this.showProposalApplication = true;
    this.hasConvertedApplication = true;
    this.showProposalIndividualInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.resetProposalContentScroll();
  }

  navigateFromProposalApplication(tab: 'info' | 'profile' | 'proposals'): void {
    const insured = this.proposalDetailInsuredInfo;
    this.proposalIndividualInfo = {
      ...this.proposalIndividualInfo,
      title: insured.title ?? '',
      firstName: insured.firstName ?? '',
      middleName: insured.middleName ?? '',
      lastName: insured.lastName ?? '',
      gender: insured.gender ?? '',
      birthdate: insured.birthdate ?? '',
      productInterested: this.selectedRecommendation.name
    };
    this.proposalIndividualInfoCreatedAt = new Date();
    this.showProposalApplication = false;
    this.showProposalDetails = false;
    this.showProposalIndividualInfo = true;
    this.showProposalIndividualInfoSummary = true;
    this.showProposalCsa = tab === 'profile';
    this.showProposalBuilderInfo = false;
    this.showProposalBuilderSavedList = tab === 'proposals';
    this.showProposalInfoSaveConfirmation = false;
    this.showProposalBuilderSaveConfirmation = false;
    if (tab === 'profile') this.proposalCsaStep = 'information';
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  editProposalFromDetail(): void {
    this.openProposalBuilderInfo();
    this.openProposalBenefitEditor(true);
  }

  returnToRecommendations(): void {
    this.showProposalDetails = false;
    this.showProposalIndividualInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalInfoSaveConfirmation = false;
    this.showRecommendations = true;
    this.showQuestionnaire = true;
    this.resetProposalContentScroll();
  }

  openProposalIndividualInfo(): void {
    this.proposalIndividualInfo.gender ||= this.gender;
    this.proposalIndividualInfo.birthdate ||= this.birthdate;
    this.proposalIndividualInfoCreatedAt = new Date();
    this.showProposalIndividualInfo = true;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = false;
    this.showProposalInfoSaveConfirmation = false;
    this.showProposalDetails = false;
    this.showProposalApplication = false;
    this.resetProposalContentScroll();
  }

  requestSaveProposalIndividualInfo(): void {
    this.showProposalInfoSaveConfirmation = true;
    this.changeDetectorRef.markForCheck();
  }

  cancelSaveProposalIndividualInfo(): void {
    this.showProposalInfoSaveConfirmation = false;
  }

  confirmSaveProposalIndividualInfo(): void {
    this.showProposalInfoSaveConfirmation = false;
    this.showProposalIndividualInfoSummary = true;
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  editProposalIndividualInfo(): void {
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  get proposalInsuredAge(): string {
    if (!this.proposalIndividualInfo.birthdate) return '—';
    const [year, month, day] = this.proposalIndividualInfo.birthdate.split('-').map(Number);
    if (!year || !month || !day) return '—';
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return String(age);
  }

  openProposalCsa(): void {
    this.showProposalIndividualInfoSummary = true;
    this.showProposalBuilderInfo = false;
    this.showProposalBuilderSavedList = false;
    if (!this.showProposalCsa) this.proposalCsaStep = 'information';
    this.showProposalCsa = true;
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  setProposalCsaStep(step: string): void {
    if (this.proposalCsaStep === 'risk-profile') return;
    if (!['information', 'life-needs', 'calculation', 'assessment'].includes(step)) return;
    this.proposalCsaStep = step as 'information' | 'life-needs' | 'calculation' | 'assessment';
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  requestProposalCsaRiskProfile(): void {
    this.proposalCsaStep = 'risk-profile';
    this.changeDetectorRef.markForCheck();
  }

  requestProposalCreationFromCsa(): void {
    this.showProposalCsaCompletionModal = true;
    this.changeDetectorRef.markForCheck();
  }

  cancelProposalCsaCompletion(): void {
    this.showProposalCsaCompletionModal = false;
    this.changeDetectorRef.markForCheck();
  }

  completeProposalFromCsa(): void {
    this.showProposalCsaCompletionModal = false;
    this.openProposalBuilderInfo(true);
  }

  requestProposalBuilderSave(): void {
    if (!this.isProposalBuilderInsuredComplete) return;
    this.showProposalBuilderSaveConfirmation = true;
    this.changeDetectorRef.markForCheck();
  }

  cancelProposalBuilderSave(): void {
    this.showProposalBuilderSaveConfirmation = false;
    this.changeDetectorRef.markForCheck();
  }

  confirmProposalBuilderSave(): void {
    this.showProposalBuilderSaveConfirmation = false;
    this.showProposalBuilderInfo = false;
    this.showProposalBuilderSavedList = true;
    if (this.isMultiProductProposalCompletionFlow) {
      const firstNewProposalNumber = Number(this.proposalNumber) + this.createdSavedProposals.length + 1;
      const proposalDate = new Intl.DateTimeFormat('en-US').format(new Date());
      const newProposals = this.selectedProductNames.map((productName, index) => {
        const summaryRows = this.getProductSummaryRows(productName);
        return {
          name: productName,
          proposalNumber: String(firstNewProposalNumber + index),
          proposalDate,
          annualPremium: summaryRows.find(row => row.label === 'Annual Premium' || row.label === 'Single Premium')?.value ?? '—',
          benefitAmount: summaryRows.find(row => row.label === 'Benefit Amount' || row.label === 'Basic Sum Insured')?.value ?? '—'
        };
      });
      this.createdSavedProposals = [...newProposals, ...this.createdSavedProposals];
      this.isMultiProductProposalCompletionFlow = false;
      this.startedFromProductSelection = false;
      this.startedFromSavedProposalList = false;
      this.showProposalBuilderSaveToast(newProposals.length === 1 ? 'Proposal saved successfully.' : 'Proposals saved successfully.');
    } else {
      this.showProposalBuilderSaveToast('Proposal saved successfully.');
    }
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  private showProposalBuilderSaveToast(message: string): void {
    this.proposalBuilderSaveToastMessage = message;
    if (this.proposalBuilderSaveToastTimer) clearTimeout(this.proposalBuilderSaveToastTimer);
    this.proposalBuilderSaveToastTimer = setTimeout(() => {
      this.proposalBuilderSaveToastMessage = '';
      this.proposalBuilderSaveToastTimer = undefined;
      this.changeDetectorRef.markForCheck();
    }, 4000);
    this.changeDetectorRef.markForCheck();
  }

  returnToProposalInfo(): void {
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = false;
    this.showProposalBuilderSavedList = false;
    this.showProposalIndividualInfoSummary = true;
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  returnToProposalDetail(): void {
    this.showProposalIndividualInfo = false;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalInfoSaveConfirmation = false;
    this.showProposalBuilderSaveConfirmation = false;
    this.showProposalBuilderSavedList = false;
    this.showProposalDetails = true;
    this.resetProposalContentScroll();
  }

  openProposalBuilderInfo(fromCsaCompletion = false): void {
    if (this.selectedCoverage === 'myself') {
      this.proposalBuilderInsured.title ||= this.proposalIndividualInfo.title;
      this.proposalBuilderInsured.firstName ||= this.proposalIndividualInfo.firstName;
      this.proposalBuilderInsured.middleName ||= this.proposalIndividualInfo.middleName;
      this.proposalBuilderInsured.lastName ||= this.proposalIndividualInfo.lastName;
    }
    if (!this.proposalBuilderInsured.birthdate) this.proposalBuilderInsured.birthdate = this.proposalIndividualInfo.birthdate || this.birthdate;
    if (!this.proposalBuilderInsured.gender) this.proposalBuilderInsured.gender = this.proposalIndividualInfo.gender || this.gender;
    this.showProposalIndividualInfo = true;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalBuilderInfo = true;
    this.showProposalBenefitEditor = false;
    this.showProposalCreatedNotice = fromCsaCompletion;
    this.showProposalBuilderSavedList = false;
    this.showProposalDetails = false;
    this.proposalBuilderExpandedSections = new Set(['insured']);
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  startAnotherProposal(): void {
    this.showProposalBuilderSavedList = false;
    this.showProposalBuilderInfo = false;
    this.showProposalIndividualInfo = true;
    this.showProposalIndividualInfoSummary = false;
    this.showProposalCsa = false;
    this.showProposalDetails = false;
    this.showProposalApplication = false;
    this.showProposalBenefitEditor = false;
    this.showProposalBuilderSaveConfirmation = false;
    this.showRecommendations = false;
    this.showCreateProposalReview = false;
    this.isMultiProductProposalCompletionFlow = false;
    this.showQuestionnaire = true;
    this.showProductInfo = true;
    this.productInfoStep = 'products';
    this.expandedProposalProduct = '';
    this.expandedCreateProposalBenefitProduct = this.selectedProductNames[0] ?? '';
    this.expandedCreateProposalRiderProduct = '';
    this.startedFromProductSelection = false;
    this.startedFromSavedProposalList = true;
    this.selectedProductNames = [];
    this.expandedCreateProposalBenefitProduct = '';
    this.selectedProposalIndex = 1;
    this.productBenefitValues = {};
    this.createProposalRidersByProduct = {};
    this.resetCreateProposalFunds();
    this.proposalIndividualInfo = { ...this.proposalIndividualInfo, firstName: '', middleName: '', lastName: '', birthdate: '', gender: '' };
    this.birthdate = '';
    this.gender = '';
    this.noMiddleName = false;
    this.isGeneratingProposals = false;
    this.questionStep = 1;
    this.proposalBuilderSaveToastMessage = '';
    this.changeDetectorRef.markForCheck();
    this.resetProposalContentScroll();
  }

  updateActiveRecommendation(event: Event): void {
    const container = event.currentTarget as HTMLElement;
    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.proposal-recommendation-card'));
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    this.activeRecommendationIndex = closestIndex;
  }

  toggleGoal(goalTitle: string): void {
    this.selectedGoals = this.selectedGoals.includes(goalTitle)
      ? this.selectedGoals.filter(selectedGoal => selectedGoal !== goalTitle)
      : [...this.selectedGoals, goalTitle];
  }

  toggleProtection(protectionTitle: string): void {
    if (protectionTitle === 'None for Now') {
      this.selectedProtections = this.selectedProtections.includes(protectionTitle) ? [] : [protectionTitle];
      return;
    }

    const selectedProtections = this.selectedProtections.filter(protection => protection !== 'None for Now');
    this.selectedProtections = selectedProtections.includes(protectionTitle)
      ? selectedProtections.filter(protection => protection !== protectionTitle)
      : [...selectedProtections, protectionTitle];
  }

  private scrollQuestionnaireToTop(): void {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.proposal-product-info__scroll, .proposal-questionnaire__main')?.scrollTo?.({ top: 0, behavior: 'smooth' });
    });
  }

  private resetProposalContentScroll(): void {
    if (this.proposalContent) this.proposalContent.nativeElement.scrollTop = 0;
  }

  private scrollRecommendationToCenter(index: number, behavior: ScrollBehavior): void {
    if (!window.matchMedia?.('(max-width: 639px)').matches) return;

    const container = this.recommendationCards?.nativeElement;
    const card = container?.querySelectorAll<HTMLElement>('.proposal-recommendation-card').item(index);
    if (!container || !card) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const left = container.scrollLeft + cardRect.left - containerRect.left - (container.clientWidth - card.clientWidth) / 2;
    container.scrollTo?.({ left, behavior });
  }

  private startProposalGeneration(): void {
    this.clearGenerationTimer();
    this.isGeneratingProposals = true;
    this.showRecommendations = false;
    this.generationTimer = setTimeout(() => {
      this.isGeneratingProposals = false;
      this.showRecommendations = true;
      this.generationTimer = undefined;
      this.changeDetectorRef.detectChanges();
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('.proposal-generator__content')?.scrollTo?.({ top: 0, behavior: 'smooth' });
        this.scrollRecommendationToCenter(1, 'auto');
      });
    }, this.proposalGenerationDelay);
  }

  private clearGenerationTimer(): void {
    if (this.generationTimer) {
      clearTimeout(this.generationTimer);
      this.generationTimer = undefined;
    }
  }
}
