import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';

import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { TdxFieldControlOption } from '../shared/components/field-control/field-control.component';

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
    this.showRecommendations = value === 'recommendations';
    this.showProposalDetails = false;
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
  showQuestionnaire = false;
  isGeneratingProposals = false;
  showRecommendations = false;
  showProposalDetails = false;
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

  get selectedMaximumCoveragePeriod(): string {
    return this.comparisonRows.find(row => row.label === 'Maximum Coverage Period')?.values[this.selectedProposalIndex] ?? 'To age 100';
  }

  get selectedPaymentPeriod(): string {
    return this.comparisonRows.find(row => row.label === 'Payment Period')?.values[this.selectedProposalIndex] ?? '10 years';
  }

  get selectedRiderCount(): string {
    return this.selectedProposalIndex === 1 ? '3 Riders' : this.comparisonRows.find(row => row.label === 'Riders')?.values[this.selectedProposalIndex] ?? '0 Rider';
  }

  get selectedFundCount(): string {
    return this.comparisonRows.find(row => row.label === 'Funds')?.values[this.selectedProposalIndex] ?? '2 Funds';
  }

  get insuredSummary(): string {
    if (!this.gender || !this.birthdate) return 'Not provided';
    const [year, month, day] = this.birthdate.split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return `${this.gender}, ${age} years old`;
  }

  birthdate = '';
  gender = '';
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
    { name: 'Future Assure Max (Peso)', icon: 'assets/proposal-product-future-assure-max.png' },
    { name: 'Future Assure Max (US Dollar)', icon: 'assets/proposal-product-future-assure-max.png' },
    { name: 'Future Assure Regular Pay', icon: 'assets/proposal-product-future-assure.png' },
    { name: 'Life Essentials', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Sure Start', icon: 'assets/proposal-product-life-essentials.png' },
    { name: 'Troo Big 3 Umbrella', icon: 'assets/proposal-product-life-essentials.png' }
  ];

  private generationTimer?: ReturnType<typeof setTimeout>;
  private readonly proposalGenerationDelay = 2400;

  constructor(readonly navigation: AppNavigationStateService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (this.showRecommendations) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.scrollRecommendationToCenter(1, 'auto')));
    }
  }

  ngOnDestroy(): void {
    this.clearGenerationTimer();
  }

  get progressPercent(): number {
    return (this.questionStep / 7) * 100;
  }

  get isQuestionOneComplete(): boolean {
    return Boolean(this.selectedCoverage && this.birthdate.trim() && this.gender);
  }

  selectCoverage(coverage: 'myself' | 'someone-else'): void {
    this.selectedCoverage = coverage;
    setTimeout(() => {
      const detailsElement = this.proposalDetails?.nativeElement;
      if (detailsElement?.scrollIntoView) {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
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
    this.showQuestionnaire = true;
    this.showRecommendations = false;
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.proposal-generator__content')?.scrollTo?.({ top: 0, behavior: 'smooth' });
    });
  }

  cancelQuestionnaire(): void {
    this.clearGenerationTimer();
    this.showQuestionnaire = false;
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
    this.selectedProposalIndex = index;
    this.showQuestionnaire = true;
    this.showRecommendations = false;
    this.showProposalDetails = true;
    this.resetProposalContentScroll();
  }

  returnToRecommendations(): void {
    this.showProposalDetails = false;
    this.showRecommendations = true;
    this.showQuestionnaire = true;
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
      document.querySelector<HTMLElement>('.proposal-questionnaire__main')?.scrollTo({ top: 0, behavior: 'smooth' });
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
