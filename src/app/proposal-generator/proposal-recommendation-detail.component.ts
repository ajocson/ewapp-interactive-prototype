import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';

interface ProposalDetail {
  readonly name: string;
  readonly subtitle: string;
  readonly benefitAmount: string;
  readonly annualPremium: string;
  readonly description: string;
}

type ProposalDetailTab = 'proposal-info' | 'benefits' | 'protection' | 'funds' | 'about';

interface ProposedInsuredInfo {
  readonly title: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly suffix: string;
  readonly birthdate: string;
  readonly occupation: string;
}

interface ProposedOwnerInfo {
  readonly title: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly suffix: string;
  readonly birthdate: string;
}

interface AddedProtectionRow {
  readonly name: string;
  readonly description: string;
  readonly benefitAmount: string;
  readonly coveragePeriod: string;
  readonly additionalAnnualPremium: string;
}

interface FundAllocationRow {
  readonly name: string;
  readonly allocation: string;
  readonly riskLevel: string;
  readonly description: string;
}

interface AboutProductSection {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'lam-proposal-recommendation-detail',
  templateUrl: './proposal-recommendation-detail.component.html',
  styleUrl: './proposal-recommendation-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProposalRecommendationDetailComponent implements OnChanges, OnDestroy {
  readonly buttonSize = TdxButtonSize;
  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  @Input({ required: true }) proposal!: ProposalDetail;
  @Input() proposalNumber = '802978';
  @Input() maximumCoveragePeriod = 'To age 100';
  @Input() paymentPeriod = '10 years';
  @Input() riderCount = '3 Riders';
  @Input() fundCount = '2 Funds';
  @Input() proposedInsured: ProposedInsuredInfo = { title: '', firstName: '', middleName: '', lastName: '', suffix: '', birthdate: '', occupation: '' };
  @Input() proposedOwner: ProposedOwnerInfo = { title: '', firstName: '', middleName: '', lastName: '', suffix: '', birthdate: '' };
  @Input() selectedProtections: readonly string[] = [];
  @Input() investmentPreference = 'A Mix of Both';
  @Input() openCompleteInfoModal = false;
  private savedProposalValue = false;
  @Input()
  set savedProposal(value: boolean) {
    this.savedProposalValue = value;
    if (!value && this.activeTab === 'proposal-info') this.activeTab = 'benefits';
  }
  get savedProposal(): boolean { return this.savedProposalValue; }
  @Output() backRequested = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();
  @Output() individualInfoRequested = new EventEmitter<void>();
  @Output() applicationRequested = new EventEmitter<void>();

  @ViewChild('proceedTrigger') proceedTrigger?: ElementRef<HTMLElement>;
  @ViewChild('generateSalesIllustrationTrigger') generateSalesIllustrationTrigger?: ElementRef<HTMLElement>;
  @ViewChild('previewConvertTrigger') previewConvertTrigger?: ElementRef<HTMLElement>;
  @ViewChild('proceedModalClose') proceedModalClose?: ElementRef<HTMLButtonElement>;
  @ViewChild('proceedModalContinue') proceedModalContinue?: ElementRef<HTMLElement>;

  proceedModalOpen = false;
  isSalesIllustrationPreviewOpen = false;
  isGeneratingSalesIllustration = false;
  hasGeneratedSalesIllustration = false;
  private salesIllustrationTimer?: ReturnType<typeof setTimeout>;

  readonly salesIllustrationPages = [
    'assets/sales-illustration/page-01.jpg',
    'assets/sales-illustration/page-02.png',
    'assets/sales-illustration/page-03.png',
    'assets/sales-illustration/page-04.png',
    'assets/sales-illustration/page-05.png',
    'assets/sales-illustration/page-06.png',
    'assets/sales-illustration/page-07.png',
    'assets/sales-illustration/page-08.png',
    'assets/sales-illustration/page-09.png',
    'assets/sales-illustration/page-10.png'
  ];

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['openCompleteInfoModal']?.currentValue) this.openProceedModal();
  }

  ngOnDestroy(): void {
    if (this.salesIllustrationTimer) clearTimeout(this.salesIllustrationTimer);
  }

  get maximumCoveragePeriodValue(): string {
    return this.maximumCoveragePeriod.replace(/^to\s+/i, '').replace(/^age\b/i, 'Age');
  }

  get validUntilDate(): string {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 15);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(validUntil);
  }

  @ViewChild('tabOverflowButton') tabOverflowButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('proposalTabs') proposalTabs?: ElementRef<HTMLElement>;

  activeTab: ProposalDetailTab = 'proposal-info';
  overflowMenuOpen = false;
  readonly expandedAboutSections = new Set<number>();

  private readonly allTabs: readonly { id: ProposalDetailTab; label: string }[] = [
    { id: 'proposal-info', label: 'Info' },
    { id: 'benefits', label: 'Benefits and Premiums' },
    { id: 'protection', label: 'Riders' },
    { id: 'funds', label: 'Fund Allocation' },
    { id: 'about', label: 'About the Product' }
  ];

  get tabs(): readonly { id: ProposalDetailTab; label: string }[] {
    return this.savedProposal ? this.allTabs : this.allTabs.filter(tab => tab.id !== 'proposal-info');
  }

  get benefitRows(): readonly { label: string; value: string }[] {
    return [
      { label: 'Benefit Amount', value: this.proposal.benefitAmount },
      { label: 'Annual Premium', value: this.proposal.annualPremium },
      { label: 'Maximum Coverage Period', value: this.maximumCoveragePeriod },
      { label: 'Payment Period', value: this.paymentPeriod },
      { label: 'Policy Currency', value: 'Philippine Peso (₱)' }
    ];
  }

  get proposedInsuredRows(): readonly { label: string; value: string }[] {
    const insured = this.proposedInsured;
    const fullName = [insured.title, insured.firstName, insured.middleName, insured.lastName, insured.suffix].filter(Boolean).join(' ') || '—';
    return [
      { label: 'Name', value: fullName },
      { label: 'Date of Birth', value: insured.birthdate ? new Date(`${insured.birthdate}T00:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' }
    ];
  }

  get proposedOwnerRows(): readonly { label: string; value: string }[] {
    const owner = this.proposedOwner;
    const fullName = [owner.title, owner.firstName, owner.middleName, owner.lastName, owner.suffix].filter(Boolean).join(' ') || '—';
    const dateOfBirth = owner.birthdate ? new Date(`${owner.birthdate}T00:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
    return [
      { label: 'Name', value: fullName },
      { label: 'Date of Birth', value: dateOfBirth }
    ];
  }

  readonly addedProtectionRows: readonly AddedProtectionRow[] = [
    {
      name: "Waiver of Premium on Insured's Disability (WP)",
      description: 'Covers future premiums in case of total and permanent disability.',
      benefitAmount: '₱4,200,000 (Annual Premium)',
      coveragePeriod: 'Up to age 65',
      additionalAnnualPremium: 'Included'
    },
    {
      name: 'Accidental Death Rider (ADR)',
      description: 'Provides additional coverage in case of accidental death.',
      benefitAmount: '₱250,000',
      coveragePeriod: 'Up to age 100',
      additionalAnnualPremium: '₱2,000'
    },
    {
      name: 'Critical Illness Rider (CIR)',
      description: 'Provides a lump sum benefit upon diagnosis of a covered critical illness.',
      benefitAmount: '₱250,000',
      coveragePeriod: 'Up to age 100',
      additionalAnnualPremium: '₱3,500'
    }
  ];

  readonly fundAllocationRows: readonly FundAllocationRow[] = [
    {
      name: 'Balanced Fund',
      allocation: '70%',
      riskLevel: 'Moderate',
      description: 'A mix of stocks and bonds for balanced growth and stability.'
    },
    {
      name: 'Asian Equity Fund',
      allocation: '30%',
      riskLevel: 'High',
      description: 'Invests in top companies in Asia for higher long-term growth potential.'
    }
  ];

  readonly aboutProductSections: readonly AboutProductSection[] = [
    {
      title: 'Why Future Assure?',
      description: 'A peso-denominated VUL that combines life protection with investment growth potential.'
    },
    {
      title: 'Who can apply?',
      description: 'Eligible age, basic requirements, and other criteria.'
    },
    {
      title: 'Policy Coverage',
      description: "What's covered and how it protects you."
    },
    {
      title: 'For your Beneficiaries',
      description: 'How your loved ones are protected.'
    },
    {
      title: 'Payment Options',
      description: 'Available payment modes and frequency.'
    },
    {
      title: 'Important Notes',
      description: 'Things to know before you apply.'
    }
  ];

  selectTab(tab: ProposalDetailTab): void {
    this.activeTab = tab;
    this.overflowMenuOpen = false;
  }

  toggleAboutSection(index: number): void {
    if (this.expandedAboutSections.has(index)) {
      this.expandedAboutSections.delete(index);
    } else {
      this.expandedAboutSections.add(index);
    }
  }

  get overflowTabs(): readonly { id: ProposalDetailTab; label: string }[] {
    return this.tabs.slice(2);
  }

  toggleOverflowMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.overflowMenuOpen = !this.overflowMenuOpen;
  }

  selectOverflowTab(tab: ProposalDetailTab): void {
    this.activeTab = tab;
    this.overflowMenuOpen = false;
    const tabs = this.proposalTabs?.nativeElement;
    if (tabs) tabs.scrollLeft = tabs.scrollWidth;
    this.tabOverflowButton?.nativeElement.focus();
  }

  openProceedModal(): void {
    this.proceedModalOpen = true;
    requestAnimationFrame(() => this.proceedModalClose?.nativeElement.focus());
  }

  closeProceedModal(): void {
    this.proceedModalOpen = false;
    requestAnimationFrame(() => {
      const trigger = this.isSalesIllustrationPreviewOpen ? this.previewConvertTrigger : this.proceedTrigger;
      trigger?.nativeElement.querySelector('button')?.focus();
    });
  }

  generateSalesIllustration(): void {
    if (this.isGeneratingSalesIllustration) return;
    this.isSalesIllustrationPreviewOpen = true;
    this.isGeneratingSalesIllustration = true;
    this.salesIllustrationTimer = setTimeout(() => {
      this.isGeneratingSalesIllustration = false;
      this.hasGeneratedSalesIllustration = true;
      this.changeDetector.markForCheck();
    }, 3000);
  }

  returnToProposalSummary(): void {
    this.isSalesIllustrationPreviewOpen = false;
    requestAnimationFrame(() => this.generateSalesIllustrationTrigger?.nativeElement.querySelector('button')?.focus());
  }

  downloadSalesIllustration(): void {
    window.print();
  }

  continueToIndividualInfo(): void {
    this.proceedModalOpen = false;
    this.individualInfoRequested.emit();
  }

  closeProceedModalFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeProceedModal();
  }

  trapProceedModalFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const closeButton = this.proceedModalClose?.nativeElement;
    const continueButton = this.proceedModalContinue?.nativeElement.querySelector('button');
    if (!closeButton || !continueButton) return;

    if (event.shiftKey && document.activeElement === closeButton) {
      event.preventDefault();
      continueButton.focus();
    } else if (!event.shiftKey && document.activeElement === continueButton) {
      event.preventDefault();
      closeButton.focus();
    }
  }

  @HostListener('document:click')
  closeOverflowMenu(): void {
    this.overflowMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeOverflowMenuOnEscape(): void {
    if (this.proceedModalOpen) {
      this.closeProceedModal();
      return;
    }
    if (!this.overflowMenuOpen) return;
    this.overflowMenuOpen = false;
    this.tabOverflowButton?.nativeElement.focus();
  }
}
