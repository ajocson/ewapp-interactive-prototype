import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { LeadCardData } from '../lead-board.model';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { StepperStep } from '../shared/components/stepper/stepper.model';
import { TdxTagEmphasis, TdxTagVariant } from '../shared/components/tag/tag.model';
import { ProposalStage } from './proposal-flow.model';
import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';
import { LeadJourneyStateService } from '../shared/services/lead-journey-state.service';

export type LeadRecordTab = 'info' | 'profile' | 'proposals' | 'applications';

@Component({
  selector: 'lam-proposal-flow',
  templateUrl: './proposal-flow.component.html',
  styleUrl: './proposal-flow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProposalFlowComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) lead!: LeadCardData;
  @Input() routeTab: LeadRecordTab = 'info';
  private leadInfoEditMode = false;
  @Input() set editMode(value: boolean) {
    this.leadInfoEditMode = value;
    if (value) this.stage = 'individual-form';
  }
  get editMode(): boolean {
    return this.leadInfoEditMode;
  }
  @Output() closed = new EventEmitter<void>();
  @Output() routeTabChange = new EventEmitter<LeadRecordTab>();
  @Output() contactRequired = new EventEmitter<void>();
  @Output() appointmentRequired = new EventEmitter<void>();
  @Output() activityRequested = new EventEmitter<void>();
  @Output() csaCreated = new EventEmitter<void>();
  @Output() siGenerated = new EventEmitter<void>();
  @Output() proposalSaved = new EventEmitter<void>();
  @Output() applicationConverted = new EventEmitter<void>();
  @Output() underwritingSubmitted = new EventEmitter<LeadCardData>();

  stage: ProposalStage = 'individual-form';
  productPickerOpen = false;
  proposalDraftOpen = false;
  proposalCreated = false;
  selectedProduct = '';
  productCategory = 'all';
  proposalTab: 'info' | 'benefits' = 'info';
  proposalDate = '';
  sameAsLeadInformation = true;
  salesIllustrationGenerated = false;
  hasGeneratedSalesIllustration = false;
  applicationOpen = false;
  applicationDetailOpen = true;
  applicationComplete = false;
  applicationUnderwritingConfirmationOpen = false;
  applicationUnderwritingSubmitted = false;
  proposalSaveConfirmation = false;
  proposalToastMessage = '';
  confirmation: 'add-profile' | 'save-csa' | null = null;
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
  readonly applicationDocuments = [
    { title: 'Sales Illustration', fileName: '810000106051_John Mark Doe_Sales Illustration_SI.pdf' },
    { title: 'Client Suitability Assessment', fileName: '810000106051_John Mark Doe_Client Suitability Assessment (CSA)_CSA.pdf' },
    { title: 'Application Form', fileName: '810000106051_John Mark Doe_Application Form_AF.pdf' },
    { title: 'Agent Declaration', fileName: '810000106051_John Mark Doe_Agent Declaration_AD.pdf' },
    { title: 'Payment Details Form', fileName: '810000106051_John Mark Doe_Payment Details Form_PD.pdf' },
    { title: 'Additional Declaration Form', fileName: '810000106051_John Mark Doe_Additional Declaration Form_ADF.pdf' },
    { title: 'Validated Payment Slip', fileName: '810000106051_John Mark Doe_Validated Payment Slip_PD.pdf' }
  ];

  constructor(readonly navigation: AppNavigationStateService, private readonly changeDetectorRef: ChangeDetectorRef, private readonly journeyState: LeadJourneyStateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lead']) this.restoreLeadJourney();
    if (changes['routeTab']) this.showRecordTab(this.routeTab);
  }

  ngOnDestroy(): void {
    if (this.proposalToastTimeout !== undefined) window.clearTimeout(this.proposalToastTimeout);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.confirmation) this.confirmation = null;
    else this.closed.emit();
  }

  goTo(stage: ProposalStage): void {
    this.stage = stage;
  }

  selectRecordTab(tab: LeadRecordTab): void {
    if (!this.isTabEnabled(tab)) return;
    this.showRecordTab(tab);
    this.routeTabChange.emit(tab);
  }

  private showRecordTab(tab: LeadRecordTab): void {
    if (!this.isTabEnabled(tab)) tab = this.journeyState.highestUnlockedTab(this.lead.leadId);
    this.routeTab = tab;
    this.salesIllustrationGenerated = false;

    if (tab === 'info') {
      this.applicationOpen = false;
      this.proposalDraftOpen = false;
      this.proposalCreated = false;
      this.stage = this.editMode ? 'individual-form' : 'individual-summary';
    } else if (tab === 'profile') {
      this.applicationOpen = false;
      this.proposalDraftOpen = false;
      this.proposalCreated = false;
      this.stage = this.journeyState.hasCalculatedRiskProfile(this.lead.leadId) ? 'risk-profile' : 'csa-information';
    } else if (tab === 'proposals') {
      this.applicationOpen = false;
      this.proposalDraftOpen = false;
      this.proposalCreated = true;
      this.selectedProduct = this.selectedProduct || 'Dream Builder';
      this.hasGeneratedSalesIllustration = this.hasGeneratedSalesIllustration || this.hasCompletedPresentation();
      this.stage = 'risk-profile';
    } else {
      this.applicationOpen = true;
      this.applicationDetailOpen = false;
      this.applicationComplete = false;
      this.applicationUnderwritingConfirmationOpen = false;
      this.applicationUnderwritingSubmitted = false;
    }

    this.changeDetectorRef.markForCheck();
  }

  isTabEnabled(tab: LeadRecordTab): boolean {
    return this.journeyState.canAccess(this.lead.leadId, tab);
  }

  saveLeadInfo(): void {
    this.journeyState.saveInfo(this.lead.leadId, { firstName: this.firstName, title: this.title, noMiddleName: this.noMiddleName, lastName: this.lastName, gender: this.gender, birthDate: this.birthDate, suffix: this.suffix, mobileNumber: this.mobileNumber, emailAddress: this.emailAddress, sourceOfLead: this.sourceOfLead });
    this.editMode = false;
    this.stage = 'individual-summary';
    this.changeDetectorRef.markForCheck();
  }

  private restoreLeadJourney(): void {
    const info = this.journeyState.info(this.lead.leadId);
    if (!info) return;
    this.firstName = String(info['firstName'] ?? this.firstName); this.title = String(info['title'] ?? this.title); this.noMiddleName = Boolean(info['noMiddleName']); this.lastName = String(info['lastName'] ?? this.lastName); this.gender = String(info['gender'] ?? this.gender); this.birthDate = String(info['birthDate'] ?? this.birthDate); this.suffix = String(info['suffix'] ?? this.suffix); this.mobileNumber = String(info['mobileNumber'] ?? this.mobileNumber); this.emailAddress = String(info['emailAddress'] ?? this.emailAddress); this.sourceOfLead = String(info['sourceOfLead'] ?? this.sourceOfLead);
  }

  openProductPicker(): void {
    if (!this.hasBeenContacted()) {
      this.contactRequired.emit();
      return;
    }
    this.productPickerOpen = true;
    this.selectedProduct = '';
    this.productCategory = 'all';
  }

  createProposalFromRiskProfile(): void {
    if (!this.hasBeenContacted()) {
      this.contactRequired.emit();
      return;
    }
    this.selectedProduct = 'Dream Builder';
    this.createProposal();
  }

  selectProduct(product: string): void {
    this.selectedProduct = product;
  }

  createProposal(): void {
    if (!this.selectedProduct) return;
    this.journeyState.unlock(this.lead.leadId, 'proposals');
    this.productPickerOpen = false;
    this.proposalDraftOpen = true;
    this.proposalCreated = false;
    this.salesIllustrationGenerated = false;
    this.hasGeneratedSalesIllustration = false;
  }

  generateSalesIllustration(): void {
    this.hasGeneratedSalesIllustration = true;
    this.salesIllustrationGenerated = true;
    this.siGenerated.emit();
  }

  backToProposal(): void {
    this.salesIllustrationGenerated = false;
    this.changeDetectorRef.markForCheck();
  }

  convertToApplication(): void {
    if (!this.hasCompletedPresentation()) {
      this.appointmentRequired.emit();
      return;
    }
    this.journeyState.unlock(this.lead.leadId, 'applications');
    this.applicationOpen = true;
    this.applicationDetailOpen = true;
    this.applicationComplete = false;
    this.applicationUnderwritingConfirmationOpen = false;
    this.applicationUnderwritingSubmitted = false;
    this.applicationConverted.emit();
    this.routeTabChange.emit('applications');
    this.changeDetectorRef.markForCheck();
  }

  openApplicationDetail(): void {
    if (!this.isTabEnabled('applications')) return;
    this.applicationOpen = true;
    this.applicationDetailOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  backToApplicationCard(): void {
    this.applicationDetailOpen = false;
    this.routeTab = 'applications';
    this.routeTabChange.emit('applications');
    this.changeDetectorRef.markForCheck();
  }

  private hasCompletedPresentation(): boolean {
    return this.lead.activities?.some((activity) => activity.label === 'Presentation Completed') ?? false;
  }

  private hasBeenContacted(): boolean {
    return this.lead.tags.some((tag) => tag.label === 'Contacted')
      || (this.lead.activities?.some((activity) => activity.label === 'Contacted') ?? false);
  }

  completeApplicationDemo(): void {
    this.applicationComplete = true;
    this.changeDetectorRef.markForCheck();
  }

  submitToUnderwriting(): void {
    this.applicationUnderwritingConfirmationOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  finishUnderwritingSubmission(): void {
    this.applicationUnderwritingConfirmationOpen = false;
    this.applicationUnderwritingSubmitted = true;
    this.underwritingSubmitted.emit(this.lead);
    this.changeDetectorRef.markForCheck();
  }

  requestSaveProposal(): void {
    this.proposalSaveConfirmation = true;
  }

  confirmSaveProposal(): void {
    const wasProposalCreated = this.proposalCreated;
    this.proposalSaveConfirmation = false;
    this.proposalDraftOpen = false;
    this.proposalCreated = true;
    if (!wasProposalCreated) this.proposalSaved.emit();
    this.salesIllustrationGenerated = false;
    this.hasGeneratedSalesIllustration = false;
    this.proposalToastMessage = 'Proposal saved successfully.';
    if (this.proposalToastTimeout !== undefined) window.clearTimeout(this.proposalToastTimeout);
    this.proposalToastTimeout = window.setTimeout(() => {
      this.proposalToastMessage = '';
      this.proposalToastTimeout = undefined;
      this.changeDetectorRef.markForCheck();
    }, 4000);
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
    if (confirmation === 'add-profile') {
      this.journeyState.unlock(this.lead.leadId, 'profile');
      this.stage = 'csa-information';
      this.routeTabChange.emit('profile');
    } else {
      this.journeyState.saveProfile(this.lead.leadId, { civilStatus: this.civilStatus, designatedBusiness: this.designatedBusiness, noExistingInsurance: this.noExistingInsurance });
      this.journeyState.markRiskProfileCalculated(this.lead.leadId);
      this.csaCreated.emit();
      this.stage = 'risk-profile';
    }
  }

}
