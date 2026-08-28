import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';

import { LeadCardData } from '../lead-board.model';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { StepperStep } from '../shared/components/stepper/stepper.model';
import { TdxTabItem } from '../shared/components/tab-group/tab-group.model';
import { TdxTagEmphasis, TdxTagVariant } from '../shared/components/tag/tag.model';
import { ProposalStage } from './proposal-flow.model';
import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';

@Component({
  selector: 'lam-proposal-flow',
  templateUrl: './proposal-flow.component.html',
  styleUrl: './proposal-flow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProposalFlowComponent implements OnDestroy {
  @Input({ required: true }) lead!: LeadCardData;
  @Output() closed = new EventEmitter<void>();

  stage: ProposalStage = 'individual-form';
  drawerOpen = false;
  productPickerOpen = false;
  proposalDraftOpen = false;
  proposalCreated = false;
  selectedProduct = '';
  productCategory = 'all';
  proposalTab: 'info' | 'benefits' = 'info';
  proposalDate = '';
  sameAsLeadInformation = true;
  salesIllustrationGenerated = false;
  proposalSaveConfirmation = false;
  proposalToastMessage = '';
  confirmation: 'add-profile' | 'save-csa' | null = null;
  selectedDrawerAction = '';
  drawerTab = 'overview';
  private proposalToastTimeout?: number;

  readonly TdxButtonVariant = TdxButtonVariant;
  readonly TdxButtonEmphasis = TdxButtonEmphasis;
  readonly TdxButtonSize = TdxButtonSize;
  readonly TdxTagVariant = TdxTagVariant;
  readonly TdxTagEmphasis = TdxTagEmphasis;
  readonly activitySteps: StepperStep[] = [
    { label: 'Contacted', state: 'completed' },
    { label: 'Appointment', state: 'current' },
    { label: 'Meeting', state: 'upcoming' }
  ];
  readonly drawerTabs: TdxTabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity-timeline', label: 'Activity Timeline' }
  ];

  firstName = 'John Mark';
  title = 'Mr.';
  noMiddleName = true;
  lastName = 'Doe';
  gender = 'Male';
  birthDate = '01/10/1990';
  suffix = 'No suffix';
  mobileNumber = '171234567';
  emailAddress = 'test@email.com';
  sourceOfLead = 'Referral (Center of Influence)';
  civilStatus = 'Married';
  designatedBusiness = 'No';
  noExistingInsurance = true;

  readonly needs = ['Health and Wellness', "Children's Education", 'Income Protection', 'Medium to Long-Term Savings', 'Retirement', 'Estate Planning'];

  constructor(readonly navigation: AppNavigationStateService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    if (this.proposalToastTimeout !== undefined) window.clearTimeout(this.proposalToastTimeout);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.confirmation) this.confirmation = null;
    else if (this.drawerOpen) this.drawerOpen = false;
    else this.closed.emit();
  }

  goTo(stage: ProposalStage): void {
    this.stage = stage;
  }

  openProductPicker(): void {
    this.productPickerOpen = true;
    this.selectedProduct = '';
    this.productCategory = 'all';
  }

  selectProduct(product: string): void {
    this.selectedProduct = product;
  }

  createProposal(): void {
    if (!this.selectedProduct) return;
    this.productPickerOpen = false;
    this.proposalDraftOpen = true;
    this.proposalCreated = false;
  }

  generateSalesIllustration(): void {
    this.salesIllustrationGenerated = true;
  }

  backToProposal(): void {
    this.salesIllustrationGenerated = false;
  }

  requestSaveProposal(): void {
    this.proposalSaveConfirmation = true;
  }

  confirmSaveProposal(): void {
    this.proposalSaveConfirmation = false;
    this.proposalDraftOpen = false;
    this.proposalCreated = true;
    this.salesIllustrationGenerated = false;
    this.proposalToastMessage = 'Proposal saved successfully.';
    if (this.proposalToastTimeout !== undefined) window.clearTimeout(this.proposalToastTimeout);
    this.proposalToastTimeout = window.setTimeout(() => {
      this.proposalToastMessage = '';
      this.proposalToastTimeout = undefined;
      this.changeDetectorRef.markForCheck();
    }, 4000);
  }

  openDrawer(): void {
    this.drawerOpen = true;
  }

  requestAddProfile(): void {
    this.confirmation = 'add-profile';
  }

  requestRiskProfile(): void {
    this.confirmation = 'save-csa';
  }

  proceedConfirmation(): void {
    const confirmation = this.confirmation;
    this.confirmation = null;
    this.stage = confirmation === 'add-profile' ? 'csa-information' : 'risk-profile';
  }

  chooseDrawerAction(action: string): void {
    this.selectedDrawerAction = action;
  }
}
