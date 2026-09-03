import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';

import { LeadActivityRecord, LeadAppointment, LeadCardData, leadDisplayName } from '../../lead-board.model';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../../shared/components/button/button.model';
import { TdxTabItem } from '../../shared/components/tab-group/tab-group.model';
import { TdxTagEmphasis, TdxTagVariant } from '../../shared/components/tag/tag.model';
import { StepperStep } from '../../shared/components/stepper/stepper.model';
import { TdxFieldControlOption } from '../../shared/components/field-control/field-control.component';

const APPOINTMENT_STATUS_TAGS = new Set([
  'Appointment Set',
  'Appointment Scheduled',
  'Appointment Rescheduled',
  'Appointment Canceled'
]);

const APPLICATION_STATUS_TAGS = new Set([
  'Application Submitted',
  'Underwriting Ongoing',
  'Needs More Info',
  'Conditionally Accepted',
  'Policy Released',
  'Approved',
  'Unapproved',
  'Withdrawn',
  'Postponed'
]);

export interface LeadContactedEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadAppointmentScheduledEvent {
  lead: LeadCardData;
  appointment: LeadAppointment;
}

export interface LeadAppointmentCancelledEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadAppointmentCompletedEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadUnableToSetAppointmentEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadFollowUpRecordedEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadFollowUpAppointmentScheduledEvent {
  lead: LeadCardData;
  appointment: LeadAppointment;
  rescheduled?: boolean;
}

export interface LeadFollowUpAppointmentCancelledEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadFollowUpAppointmentCompletedEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadUpdateRecordedEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadStateChangedEvent {
  lead: LeadCardData;
  state: 'Reactivated' | 'Parked' | 'Dropped';
  details: string;
}

interface TimeOption {
  label: string;
  value: number;
}

@Component({
  selector: 'lam-lead-activity-drawer',
  templateUrl: './lead-activity-drawer.component.html',
  styleUrl: './lead-activity-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadActivityDrawerComponent implements OnChanges, OnDestroy {
  @Input() userType: 'Agency' | 'Banca' = 'Banca';
  @Input() fromApplicationsPage = false;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly document = inject(DOCUMENT);
  private agingTooltipElement: HTMLDivElement | null = null;

  @Input({ required: true }) lead!: LeadCardData;
  @Output() closed = new EventEmitter<void>();
  @Output() draftSiRequested = new EventEmitter<void>();
  @Output() editLeadRequested = new EventEmitter<void>();
  @Output() contacted = new EventEmitter<LeadContactedEvent>();
  @Output() appointmentScheduled = new EventEmitter<LeadAppointmentScheduledEvent>();
  @Output() appointmentRescheduled = new EventEmitter<LeadAppointmentScheduledEvent>();
  @Output() appointmentCancelled = new EventEmitter<LeadAppointmentCancelledEvent>();
  @Output() appointmentCompleted = new EventEmitter<LeadAppointmentCompletedEvent>();
  @Output() unableToSetAppointment = new EventEmitter<LeadUnableToSetAppointmentEvent>();
  @Output() followUpRecorded = new EventEmitter<LeadFollowUpRecordedEvent>();
  @Output() followUpAppointmentScheduled = new EventEmitter<LeadFollowUpAppointmentScheduledEvent>();
  @Output() followUpAppointmentCancelled = new EventEmitter<LeadFollowUpAppointmentCancelledEvent>();
  @Output() followUpAppointmentCompleted = new EventEmitter<LeadFollowUpAppointmentCompletedEvent>();
  @Output() updateRecorded = new EventEmitter<LeadUpdateRecordedEvent>();
  @Output() proposalRequested = new EventEmitter<void>();
  @Output() fullProposalRequested = new EventEmitter<void>();
  @Output() applicationRequested = new EventEmitter<void>();
  @Output() applicationProposalRequested = new EventEmitter<void>();
  @Output() leadStateChanged = new EventEmitter<LeadStateChangedEvent>();

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly buttonSize = TdxButtonSize;
  readonly tagVariant = TdxTagVariant;
  readonly tagEmphasis = TdxTagEmphasis;
  readonly tabs: TdxTabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Activity Timeline' }
  ];
  activeTab = 'overview';
  scheduling = false;
  rescheduling = false;
  cancellingAppointment = false;
  followUpRecording = false;
  schedulerMode: 'appointment' | 'follow-up' = 'appointment';
  actionMode: 'park' | 'drop' | null = null;
  stateConfirmation: 'park' | 'drop' | 'reactivate' | null = null;
  activityNotes = '';
  followUpNotes = '';
  appointmentNotes = '';
  afypDeclaration: number | null = null;
  potentialCaseCount: number | null = null;
  afypDeclarationError = false;
  potentialCaseCountError = false;
  unableToSetAppointmentOpen = false;
  parkNotes = '';
  dropNotes = '';
  dropReason = '';
  selectedDate = '';
  selectedStartMinutes: number | null = null;
  selectedEndMinutes: number | null = null;
  private readonly expandedActivityNoteIds = new Set<string>();
  private readonly baseActivitySteps: StepperStep[] = [
    { label: 'Contacted', number: 1 },
    { label: 'Appointment', number: 2 },
    { label: 'Meeting', number: 3 }
  ];
  readonly dropReasonOptions: readonly TdxFieldControlOption[] = [
    { label: 'Affordability / Financial Constraints', value: 'Affordability / Financial Constraints', description: ['No/Lack of Funds', 'Premium Cost Too High'] },
    { label: 'With Ample Coverage', value: 'With Ample Coverage', description: ['Existing Policy with Company', 'Existing Policy with Other Provider'] },
    { label: 'No Need or Interest', value: 'No Need or Interest', description: ['Not Interested in Insurance', 'Not a Priority Currently'] },
    { label: 'Product or Decision Concerns', value: 'Product or Decision Concerns', description: ['Product Does Not Meet Needs', 'Needs More Time to Decide'] },
    { label: 'Unable to Proceed', value: 'Unable to Proceed', description: ['Uncontactable / No Response', 'Personal Circumstances (Busy, Abroad, Emergency, Health)'] }
  ];

  get schedulerTitle(): string {
    if (this.schedulerMode === 'follow-up') {
      return this.rescheduling ? 'Reschedule Follow-up Appointment' : 'Schedule Follow-up Appointment';
    }
    return this.rescheduling ? 'Reschedule Appointment' : 'Schedule Appointment';
  }

  get activitySteps(): StepperStep[] {
    return this.isFollowUp
      ? [...this.baseActivitySteps, { label: 'Follow-up', number: 4 }]
      : this.baseActivitySteps;
  }

  get schedulerNotesPlaceholder(): string {
    if (this.schedulerMode === 'follow-up') return 'Add notes about the follow-up appointment';
    return this.rescheduling ? 'Add notes or important details' : 'Add notes about the appointment';
  }

  get isDropActionDisabled(): boolean {
    return !this.dropReason;
  }

  get displayName(): string {
    return leadDisplayName(this.lead);
  }

  get rawStatusTag(): string {
    return this.lead.tags[0]?.label ?? 'New Lead';
  }

  get statusTag(): string {
    const tag = this.rawStatusTag;
    if (tag !== 'Follow-up') return tag;
    const latestCancellation = this.lead.activities
      .filter((activity) => activity.label === 'Follow Up Canceled')
      .at(-1)?.occurredAtTimestamp ?? -Infinity;
    const latestUpdate = this.lead.activities
      .filter((activity) => activity.label === 'Follow-up')
      .at(-1)?.occurredAtTimestamp ?? -Infinity;
    const scheduledActivities = this.lead.activities.filter((activity) => activity.label === 'Follow Up Scheduled');
    const latestScheduled = scheduledActivities.at(-1)?.occurredAtTimestamp ?? -Infinity;
    const previousScheduled = scheduledActivities.at(-2)?.occurredAtTimestamp ?? -Infinity;
    if (latestCancellation > latestUpdate && latestCancellation > latestScheduled) return 'Follow-up Mtg. Cancelled';
    const appointmentWasCanceledBeforeNewBooking = latestCancellation > previousScheduled && latestCancellation < latestScheduled;
    if (this.lead.appointment && scheduledActivities.length > 1 && !appointmentWasCanceledBeforeNewBooking) {
      return 'Follow-up Mtg. Rescheduled';
    }
    if (this.lead.appointment) return 'Follow-up Mtg. Scheduled';
    return this.lead.activities.some((activity) => activity.label === 'Follow-up Presentation Completed')
      ? 'Follow-up Mtg. Completed'
      : tag;
  }

  get isApplicationLead(): boolean {
    return APPLICATION_STATUS_TAGS.has(this.rawStatusTag)
      || (this.lead.activities?.some((activity) => activity.label === 'Application Created') ?? false);
  }

  get canOpenApplicationActions(): boolean {
    return !new Set(['Withdrawn', 'Postponed', 'Unapproved']).has(this.rawStatusTag);
  }

  get statusVariant(): TdxTagVariant {
    if (this.statusTag === 'Follow-up Mtg. Rescheduled') return TdxTagVariant.Primary;
    if (this.statusTag === 'Follow-up Mtg. Cancelled') return TdxTagVariant.Danger;
    const tone = this.lead.tags[0]?.tone;
    return tone ? tone as TdxTagVariant : (this.rawStatusTag === 'New Lead' ? TdxTagVariant.Primary : TdxTagVariant.Success);
  }

  get isContacted(): boolean {
    return this.rawStatusTag === 'Contacted';
  }

  get isAppointmentSet(): boolean {
    return APPOINTMENT_STATUS_TAGS.has(this.rawStatusTag);
  }

  get isMeeting(): boolean {
    return this.rawStatusTag === 'Meeting';
  }

  get isFollowUp(): boolean {
    return this.rawStatusTag === 'Follow-up';
  }

  get isManuallyCreatedLead(): boolean {
    return this.lead.id.startsWith('manual-');
  }

  get hasFollowUpAppointment(): boolean {
    return this.isFollowUp && Boolean(this.lead.appointment);
  }

  get cancelAppointmentTitle(): string {
    return this.hasFollowUpAppointment ? 'Cancel Follow-up Appointment' : 'Cancel Appointment';
  }

  get cancelAppointmentNotesPlaceholder(): string {
    return this.hasFollowUpAppointment
      ? 'Add notes about the follow-up appointment'
      : 'Add notes about your conversation';
  }

  get primaryActionLabel(): string {
    if (this.isAppointmentSet || this.isMeeting || this.isFollowUp) {
      return 'Generate/View Full Proposal';
    }

    return this.isContacted ? 'Generate/View Full Proposal' : 'Generate Draft SI';
  }

  get isLeadPaused(): boolean {
    return this.lead.leadType === 'Parked' || this.lead.leadType === 'Dropped';
  }

  get pausedStateTitle(): string {
    return this.lead.leadType === 'Dropped' ? 'Lead Dropped' : 'Lead Parked';
  }

  get pausedStateDescription(): string {
    return this.lead.leadType === 'Dropped'
      ? 'This lead has been marked as dropped and will remain in its current stage for reference.'
      : 'This lead has been parked and will remain in its current stage until it is reactivated.';
  }

  get pausedStateIcon(): string {
    return this.lead.leadType === 'Dropped'
      ? 'assets/icons/lead-dropped.svg'
      : 'assets/icons/lead-parked.svg';
  }

  get stateConfirmationTitle(): string {
    if (this.stateConfirmation === 'park') return 'Park Lead?';
    if (this.stateConfirmation === 'drop') return 'Drop Lead?';
    return 'Reactivate Lead?';
  }

  get stateConfirmationDescription(): string {
    if (this.stateConfirmation === 'park') {
      return 'This lead will be parked and remain in its current stage. You can reactivate it anytime to continue.';
    }
    if (this.stateConfirmation === 'drop') {
      return 'This lead will be marked as dropped and remain in its current stage for reference.';
    }
    return 'This lead will become active again, allowing you to continue the sales journey from where you left off.';
  }

  get stateConfirmationActionLabel(): string {
    if (this.stateConfirmation === 'park') return 'Park Lead';
    if (this.stateConfirmation === 'drop') return 'Drop Lead';
    return 'Reactivate Lead';
  }

  get currentStepIndex(): number {
    if (this.isFollowUp) return 3;
    if (this.isMeeting) return 2;
    if (this.isAppointmentSet || this.isContacted) return 1;
    return 0;
  }

  get minimumDate(): string {
    return this.toIsoDate(new Date());
  }

  get startTimeOptions(): readonly TimeOption[] {
    const start = this.selectedDate === this.minimumDate ? this.roundUpToHalfHour(new Date()) : 0;
    return this.buildTimeOptions(start, 23 * 60 + 30);
  }

  get endTimeOptions(): readonly TimeOption[] {
    if (this.selectedStartMinutes === null) return [];
    return this.buildTimeOptions(this.selectedStartMinutes + 30, 24 * 60);
  }

  get salesActivities(): readonly LeadActivityRecord[] {
    return this.activitiesFor('sales');
  }

  get systemActivities(): readonly LeadActivityRecord[] {
    return this.activitiesFor('system');
  }

  get hasActivities(): boolean {
    return this.salesActivities.length > 0 || this.systemActivities.length > 0;
  }

  isActivityNoteExpanded(activityId: string): boolean {
    return this.expandedActivityNoteIds.has(activityId);
  }

  toggleActivityNote(activityId: string): void {
    if (this.expandedActivityNoteIds.has(activityId)) {
      this.expandedActivityNoteIds.delete(activityId);
    } else {
      this.expandedActivityNoteIds.add(activityId);
    }
    this.changeDetectorRef.markForCheck();
  }

  ngOnChanges(): void {
    this.scheduling = false;
    this.rescheduling = false;
    this.cancellingAppointment = false;
    this.unableToSetAppointmentOpen = false;
    this.followUpRecording = false;
    this.schedulerMode = 'appointment';
    this.actionMode = null;
    this.expandedActivityNoteIds.clear();
    this.stateConfirmation = null;
    this.activityNotes = '';
    this.followUpNotes = '';
    this.appointmentNotes = this.lead.appointment?.notes ?? '';
    this.afypDeclaration = this.lead.appointment?.afypDeclaration ?? null;
    this.potentialCaseCount = this.lead.appointment?.potentialCaseCount ?? null;
    this.parkNotes = '';
    this.dropNotes = '';
    this.dropReason = '';
    this.selectedDate = this.lead.appointment?.date ?? '';
    this.selectedStartMinutes = this.lead.appointment?.startMinutes ?? null;
    this.selectedEndMinutes = this.lead.appointment?.endMinutes ?? null;
  }

  showAgingTooltip(event: MouseEvent, message: string): void {
    this.hideAgingTooltip();

    const target = event.currentTarget as HTMLElement;
    const tooltip = this.document.createElement('div');
    tooltip.className = 'lead-card-global-tooltip';
    tooltip.textContent = message;
    this.document.body.appendChild(tooltip);

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = this.document.defaultView?.innerWidth ?? tooltipRect.width;
    const left = Math.max(8, Math.min(targetRect.right - tooltipRect.width, viewportWidth - tooltipRect.width - 8));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${targetRect.bottom + 4}px`;
    this.agingTooltipElement = tooltip;
  }

  hideAgingTooltip(): void {
    this.agingTooltipElement?.remove();
    this.agingTooltipElement = null;
  }

  ngOnDestroy(): void {
    this.hideAgingTooltip();
  }

  requestPrimaryAction(): void {
    if (this.rawStatusTag === 'New Lead') {
      this.draftSiRequested.emit();
      return;
    }
    this.fullProposalRequested.emit();
  }

  viewApplication(): void {
    this.applicationRequested.emit();
  }

  requestApplicationProposal(): void {
    this.applicationProposalRequested.emit();
  }

  markAsContacted(): void {
    if (!this.isContacted && !this.isAppointmentSet && !this.isMeeting) {
      this.contacted.emit({ lead: this.lead, notes: this.activityNotes });
    }
  }

  openScheduler(): void {
    this.openAppointmentScheduler(false, 'appointment');
  }

  openRescheduler(): void {
    this.openAppointmentScheduler(true, 'appointment');
  }

  openFollowUpScheduler(): void {
    if (!this.isFollowUp) return;
    this.openAppointmentScheduler(false, 'follow-up');
  }

  openFollowUpRescheduler(): void {
    if (!this.hasFollowUpAppointment) return;
    this.openAppointmentScheduler(true, 'follow-up');
  }

  private openAppointmentScheduler(rescheduling: boolean, schedulerMode: 'appointment' | 'follow-up'): void {
    const now = new Date();
    this.scheduling = true;
    this.rescheduling = rescheduling;
    this.schedulerMode = schedulerMode;
    this.cancellingAppointment = false;
    this.selectedDate = this.lead.appointment?.date ?? this.toIsoDate(now);
    this.selectedStartMinutes = this.lead.appointment?.startMinutes ?? this.firstAvailableStart(now);
    this.selectedEndMinutes = this.lead.appointment?.endMinutes ?? this.nextEndTime(this.selectedStartMinutes);
    this.appointmentNotes = this.lead.appointment?.notes ?? '';
    this.afypDeclarationError = false;
    this.potentialCaseCountError = false;
  }

  cancelScheduler(): void {
    this.scheduling = false;
    this.rescheduling = false;
    this.schedulerMode = 'appointment';
  }

  dateChanged(): void {
    const options = this.startTimeOptions;
    if (!options.some((option) => option.value === this.selectedStartMinutes)) {
      this.selectedStartMinutes = options[0]?.value ?? null;
    }
    this.startTimeChanged();
  }

  startTimeChanged(): void {
    const options = this.endTimeOptions;
    if (!options.some((option) => option.value === this.selectedEndMinutes)) {
      this.selectedEndMinutes = options[0]?.value ?? null;
    }
  }

  updateAfypDeclaration(value: string): void {
    const normalized = value.replaceAll(',', '');
    this.afypDeclaration = normalized === '' ? null : Number(normalized);
    this.afypDeclarationError = false;
  }

  updatePotentialCaseCount(value: string): void {
    this.potentialCaseCount = value === '' ? null : Number(value);
    this.potentialCaseCountError = false;
  }

  scheduleAppointment(): void {
    if (!this.selectedDate || this.selectedStartMinutes === null || this.selectedEndMinutes === null) return;
    if (this.schedulerMode === 'appointment') {
      this.afypDeclarationError = !this.afypDeclaration || this.afypDeclaration <= 0;
      this.potentialCaseCountError = !this.potentialCaseCount || this.potentialCaseCount <= 0;
      if (this.afypDeclarationError || this.potentialCaseCountError) return;
    }

    const event: LeadAppointmentScheduledEvent = {
      lead: this.lead,
      appointment: {
        date: this.selectedDate,
        dateLabel: this.formatDate(this.selectedDate),
        startMinutes: this.selectedStartMinutes,
        endMinutes: this.selectedEndMinutes,
        timeLabel: this.formatTimeRange(this.selectedStartMinutes, this.selectedEndMinutes),
        ...(this.appointmentNotes.trim() ? { notes: this.appointmentNotes.trim() } : {}),
        ...(this.schedulerMode === 'appointment' ? {
          afypDeclaration: this.afypDeclaration ?? undefined,
          potentialCaseCount: this.potentialCaseCount ?? undefined
        } : {})
      }
    };

    if (this.schedulerMode === 'follow-up') {
      this.followUpAppointmentScheduled.emit({ ...event, rescheduled: this.rescheduling });
      return;
    }

    if (this.rescheduling) {
      this.appointmentRescheduled.emit(event);
      return;
    }

    this.appointmentScheduled.emit(event);
  }

  openUnableToSetAppointment(): void {
    this.scheduling = false;
    this.rescheduling = false;
    this.cancellingAppointment = false;
    this.unableToSetAppointmentOpen = true;
    this.appointmentNotes = '';
  }

  cancelUnableToSetAppointment(): void {
    this.unableToSetAppointmentOpen = false;
    this.appointmentNotes = '';
  }

  saveUnableToSetAppointment(): void {
    this.unableToSetAppointment.emit({ lead: this.lead, notes: this.appointmentNotes.trim() });
  }

  openCancelAppointment(): void {
    this.scheduling = false;
    this.rescheduling = false;
    this.cancellingAppointment = true;
    this.appointmentNotes = '';
  }

  closeCancelAppointment(): void {
    this.cancellingAppointment = false;
    this.appointmentNotes = this.lead.appointment?.notes ?? '';
  }

  confirmCancelAppointment(): void {
    if (this.hasFollowUpAppointment) {
      this.followUpAppointmentCancelled.emit({ lead: this.lead, notes: this.appointmentNotes.trim() });
      return;
    }
    if (!this.isAppointmentSet || !this.lead.appointment) return;
    this.appointmentCancelled.emit({ lead: this.lead, notes: this.appointmentNotes.trim() });
  }

  completeAppointment(): void {
    if (!this.isAppointmentSet) return;
    this.appointmentCompleted.emit({ lead: this.lead, notes: this.activityNotes });
  }

  openFollowUpForm(): void {
    if (!this.isMeeting) return;
    this.followUpRecording = true;
    this.followUpNotes = '';
  }

  openUpdateForm(): void {
    if (!this.isFollowUp) return;
    this.followUpRecording = true;
    this.followUpNotes = '';
  }

  cancelFollowUpForm(): void {
    this.followUpRecording = false;
    this.followUpNotes = '';
  }

  saveFollowUp(): void {
    if (this.isFollowUp) {
      this.updateRecorded.emit({ lead: this.lead, notes: this.followUpNotes });
      return;
    }
    if (this.isMeeting) this.followUpRecorded.emit({ lead: this.lead, notes: this.followUpNotes });
  }

  completeFollowUpAppointment(): void {
    if (!this.hasFollowUpAppointment) return;
    this.followUpAppointmentCompleted.emit({ lead: this.lead, notes: this.followUpNotes.trim() });
  }

  proceedToApplication(): void {
    if (this.isMeeting || this.isFollowUp) this.proposalRequested.emit();
  }

  openLeadAction(mode: 'park' | 'drop'): void {
    if (this.isLeadPaused) return;
    this.scheduling = false;
    this.rescheduling = false;
    this.cancellingAppointment = false;
    this.followUpRecording = false;
    this.actionMode = mode;
    this.parkNotes = '';
    this.dropNotes = '';
    this.dropReason = '';
  }

  cancelLeadAction(): void {
    this.actionMode = null;
    this.stateConfirmation = null;
    this.parkNotes = '';
    this.dropReason = '';
  }

  dropReasonChanged(value: string): void {
    this.dropReason = value;
    this.changeDetectorRef.markForCheck();
  }

  confirmLeadAction(): void {
    if (!this.actionMode) return;
    if (this.actionMode === 'drop' && this.isDropActionDisabled) return;

    this.stateConfirmation = this.actionMode;
    this.changeDetectorRef.markForCheck();
  }

  cancelStateConfirmation(): void {
    this.stateConfirmation = null;
    this.changeDetectorRef.markForCheck();
  }

  confirmStateChange(): void {
    const confirmation = this.stateConfirmation;
    if (!confirmation) return;

    if (confirmation === 'reactivate') {
      this.leadStateChanged.emit({ lead: this.lead, state: 'Reactivated', details: '' });
      this.stateConfirmation = null;
      this.changeDetectorRef.markForCheck();
      return;
    }

    if (!this.actionMode || confirmation !== this.actionMode) return;

    const selectedDropReason = confirmation === 'drop'
      ? this.dropReasonOptions.find((option) => option.value === this.dropReason)
      : undefined;
    const dropReasonDetails = selectedDropReason?.description?.length
      ? [this.dropReason, ...selectedDropReason.description.map((description) => `-${description}`)].join('\n')
      : this.dropReason;
    const dropDetails = this.dropNotes.trim()
      ? `${dropReasonDetails}\n\n${this.dropNotes.trim()}`
      : dropReasonDetails;

    this.leadStateChanged.emit({
      lead: this.lead,
      state: confirmation === 'park' ? 'Parked' : 'Dropped',
      details: confirmation === 'park' ? this.parkNotes.trim() : dropDetails
    });
    this.stateConfirmation = null;
    this.changeDetectorRef.markForCheck();
  }

  reactivateLead(): void {
    if (this.lead.leadType !== 'Parked') return;
    this.stateConfirmation = 'reactivate';
    this.changeDetectorRef.markForCheck();
  }

  trackActivity(index: number, activity: LeadActivityRecord): string {
    return activity.id;
  }

  private activitiesFor(category: LeadActivityRecord['category']): readonly LeadActivityRecord[] {
    const activities = this.isApplicationLead && !this.lead.activities.length
      ? this.genericApplicationActivities()
      : this.lead.activities;

    return [...activities]
      .filter((activity) => activity.category === category)
      .sort((first, second) => first.occurredAtTimestamp - second.occurredAtTimestamp);
  }

  private genericApplicationActivities(): readonly LeadActivityRecord[] {
    const dateLabel = 'February 01, 2026';
    const timeLabel = '9:00 AM';
    const baseTimestamp = this.lead.createdAtTimestamp;
    const graceKellyDates = [
      '2026-02-01T08:30:00', '2026-02-01T09:10:00', '2026-02-01T10:00:00',
      '2026-02-02T14:00:00', '2026-02-03T14:00:00', '2026-02-04T14:00:00',
      '2026-02-05T11:30:00', '2026-02-09T15:30:00', '2026-02-10T10:15:00',
      '2026-02-12T16:00:00', '2026-02-13T09:20:00', '2026-02-16T14:30:00',
      '2026-02-20T15:45:00', '2026-02-21T11:00:00', '2026-03-05T09:30:00',
      '2026-03-12T16:15:00', '2026-03-13T09:00:00', '2026-03-13T09:10:00',
      '2026-03-13T09:15:00', '2026-03-13T10:30:00', '2026-03-14T14:00:00',
      '2026-03-14T14:10:00', '2026-03-15T11:00:00', '2026-03-15T11:10:00',
      '2026-03-15T11:15:00'
    ];
    const isGraceKelly = this.lead.name === 'Grace Kelly';
    const record = (id: string, category: LeadActivityRecord['category'], label: string, offset: number, extra: Partial<LeadActivityRecord> = {}): LeadActivityRecord => ({
      id: `generic-${this.lead.id}-${id}`,
      category,
      label,
      dateLabel: isGraceKelly ? this.formatActivityDate(new Date(graceKellyDates[offset])) : dateLabel,
      timeLabel: isGraceKelly ? this.formatActivityTime(new Date(graceKellyDates[offset])) : timeLabel,
      occurredAtTimestamp: isGraceKelly ? new Date(graceKellyDates[offset]).getTime() : baseTimestamp + offset,
      recordedDateLabel: isGraceKelly ? this.formatActivityDate(new Date(graceKellyDates[offset])) : dateLabel,
      recordedTimeLabel: isGraceKelly ? this.formatActivityTime(new Date(graceKellyDates[offset])) : timeLabel,
      ...extra
    });

    const appointmentDates = isGraceKelly
      ? { initial: ['February 03, 2026', '2:00 - 3:00 PM'], rescheduled: ['February 04, 2026', '2:00 - 3:00 PM'], canceled: ['February 05, 2026', '2:00 - 3:00 PM'], presentation: ['February 09, 2026', '3:30 PM'], followUp: ['February 12, 2026', '4:00 - 5:00 PM'], followUpRescheduled: ['February 16, 2026', '2:30 - 3:30 PM'], followUpPresentation: ['February 20, 2026', '3:45 PM'] }
      : { initial: ['February 02, 2026', '2:00 - 3:00 PM'], rescheduled: ['February 02, 2026', '2:00 - 3:00 PM'], canceled: ['February 02, 2026', '2:00 - 3:00 PM'], presentation: ['February 02, 2026', '3:30 PM'], followUp: ['February 02, 2026', '3:30 PM'], followUpRescheduled: ['February 02, 2026', '3:30 PM'], followUpPresentation: ['February 02, 2026', '3:30 PM'] };
    const scheduled = (value: readonly string[]): Partial<LeadActivityRecord> => ({ scheduledDateLabel: value[0], scheduledTimeLabel: value[1] });

    return [
      record('new-lead', 'sales', 'New Lead Created', 0),
      record('info-updated', 'sales', 'Leads Info Updated', 1),
      record('contacted', 'sales', 'Contacted', 1, { notes: 'Successfully connected with the client. Discussed their insurance needs.' }),
      record('no-appointment', 'sales', 'Contacted- No Appointment', 2, scheduled(appointmentDates.initial)),
      record('appointment', 'sales', 'Appointment Scheduled', 3, scheduled(appointmentDates.initial)),
      record('appointment-rescheduled', 'sales', 'Appointment Rescheduled', 4, { ...scheduled(appointmentDates.rescheduled), notes: 'Client requested to reschedule due to a scheduling conflict. Appointment was rescheduled.' }),
      record('appointment-canceled', 'sales', 'Appointment Canceled', 5, { ...scheduled(isGraceKelly ? appointmentDates.rescheduled : appointmentDates.canceled), notes: 'Client requested to cancel due to a scheduling conflict. Will reschedule.' }),
      record('presentation', 'sales', 'Presentation Completed', 6, { ...scheduled(appointmentDates.presentation), notes: 'Presented the proposal and discussed the recommended coverage.' }),
      record('follow-up', 'sales', 'Follow Up', 7, scheduled(appointmentDates.presentation)),
      record('follow-up-scheduled', 'sales', 'Follow Up Scheduled', 8, scheduled(appointmentDates.followUp)),
      record('follow-up-canceled', 'sales', 'Follow Up Canceled', 9, scheduled(appointmentDates.followUp)),
      record('follow-up-rescheduled', 'sales', 'Follow Up Scheduled', 10, scheduled(appointmentDates.followUpRescheduled)),
      record('follow-up-presentation', 'sales', 'Follow-up Presentation Completed', 11, scheduled(appointmentDates.followUpPresentation)),
      record('parked', 'sales', 'Parked Lead', 12, { ...scheduled(appointmentDates.followUpPresentation), notes: 'Client is not ready to proceed at this time and requested to be contacted later.' }),
      record('reactivated', 'sales', 'Reactivated Lead', 13, scheduled(appointmentDates.followUpPresentation)),
      ...(isGraceKelly ? [] : [record('dropped', 'sales', 'Dropped Lead', 14, { ...scheduled(appointmentDates.followUpPresentation), notes: 'Client is no longer interested in proceeding with the application.' })]),
      ...(isGraceKelly ? [] : [record('application-start', 'system', 'Application Start', 15)]),
      ...(isGraceKelly ? [] : [record('application-status', 'system', this.rawStatusTag, 16)]),
      record('draft-si', 'system', 'Draft SI Generated', 17),
      record('csa', 'system', 'CSA Created', 18),
      record('proposal', 'system', 'Proposal Created', 19),
      record('si', 'system', 'SI Generated', 20),
      record('converted', 'system', 'Converted to Application', 21),
      record('submitted', 'system', 'Application Submitted', 22),
      ...(isGraceKelly ? [
        record('underwriting', 'system', 'Underwriting Ongoing', 23),
        record('application-status', 'system', this.rawStatusTag, 24)
      ] : [])
    ];
  }

  private buildTimeOptions(startMinutes: number, endMinutes: number): readonly TimeOption[] {
    const options: TimeOption[] = [];
    for (let value = startMinutes; value <= endMinutes; value += 30) {
      options.push({ label: this.formatMinutes(value), value });
    }
    return options;
  }

  private firstAvailableStart(now: Date): number {
    return Math.min(this.roundUpToHalfHour(now), 23 * 60 + 30);
  }

  private nextEndTime(startMinutes: number): number {
    return Math.min(startMinutes + 30, 24 * 60);
  }

  private roundUpToHalfHour(value: Date): number {
    const minutes = value.getHours() * 60 + value.getMinutes();
    return Math.ceil(minutes / 30) * 30;
  }

  private formatMinutes(value: number): string {
    const normalized = value === 24 * 60 ? 0 : value;
    const hour24 = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour = hour24 % 12 || 12;
    return `${hour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  private formatTimeRange(startMinutes: number, endMinutes: number): string {
    const start = this.formatMinutes(startMinutes);
    const end = this.formatMinutes(endMinutes);
    const startPeriod = start.endsWith('AM') ? 'AM' : 'PM';
    const endPeriod = end.endsWith('AM') ? 'AM' : 'PM';
    return startPeriod === endPeriod ? `${start.slice(0, -3)}-${end}` : `${start}-${end}`;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
  }

  private formatActivityDate(value: Date): string {
    return value.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  }

  private formatActivityTime(value: Date): string {
    return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  private toIsoDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
