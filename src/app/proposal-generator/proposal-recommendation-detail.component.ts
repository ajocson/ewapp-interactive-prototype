import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';

interface ProposalDetail {
  readonly name: string;
  readonly subtitle: string;
  readonly benefitAmount: string;
  readonly annualPremium: string;
  readonly description: string;
}

type ProposalDetailTab = 'benefits' | 'protection' | 'funds' | 'about';

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
export class ProposalRecommendationDetailComponent {
  readonly buttonSize = TdxButtonSize;
  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  @Input({ required: true }) proposal!: ProposalDetail;
  @Input() maximumCoveragePeriod = 'To age 100';
  @Input() paymentPeriod = '10 years';
  @Input() riderCount = '3 Riders';
  @Input() fundCount = '2 Funds';
  @Input() insuredInfo = 'Male, 32 years old';
  @Input() selectedProtections: readonly string[] = [];
  @Input() investmentPreference = 'A Mix of Both';
  @Output() backRequested = new EventEmitter<void>();

  @ViewChild('tabOverflowButton') tabOverflowButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('proposalTabs') proposalTabs?: ElementRef<HTMLElement>;

  activeTab: ProposalDetailTab = 'benefits';
  overflowMenuOpen = false;

  readonly tabs: readonly { id: ProposalDetailTab; label: string }[] = [
    { id: 'benefits', label: 'Benefits and Premiums' },
    { id: 'protection', label: 'Added Protection' },
    { id: 'funds', label: 'Fund Allocation' },
    { id: 'about', label: 'About the Product' }
  ];

  get benefitRows(): readonly { label: string; value: string }[] {
    return [
      { label: 'Benefit Amount', value: this.proposal.benefitAmount },
      { label: 'Annual Premium', value: this.proposal.annualPremium },
      { label: 'Maximum Coverage Period', value: this.maximumCoveragePeriod },
      { label: 'Payment Period', value: this.paymentPeriod },
      { label: 'Policy Currency', value: 'Philippine Peso (₱)' }
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

  @HostListener('document:click')
  closeOverflowMenu(): void {
    this.overflowMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeOverflowMenuOnEscape(): void {
    if (!this.overflowMenuOpen) return;
    this.overflowMenuOpen = false;
    this.tabOverflowButton?.nativeElement.focus();
  }
}
