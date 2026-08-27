import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';

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

export interface LeadFollowUpRecordedEvent {
  lead: LeadCardData;
  notes: string;
}

export interface LeadFollowUpAppointmentScheduledEvent {
  lead: LeadCardData;
  appointment: LeadAppointment;
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
export class LeadActivityDrawerComponent implements OnChanges {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input({ required: true }) lead!: LeadCardData;
  @Output() closed = new EventEmitter<void>();
  @Output() draftSiRequested = new EventEmitter<void>();
  @Output() contacted = new EventEmitter<LeadContactedEvent>();
  @Output() appointmentScheduled = new EventEmitter<LeadAppointmentScheduledEvent>();
  @Output() appointmentRescheduled = new EventEmitter<LeadAppointmentScheduledEvent>();
  @Output() appointmentCancelled = new EventEmitter<LeadAppointmentCancelledEvent>();
  @Output() appointmentCompleted = new EventEmitter<LeadAppointmentCompletedEvent>();
  @Output() followUpRecorded = new EventEmitter<LeadFollowUpRecordedEvent>();
  @Output() followUpAppointmentScheduled = new EventEmitter<LeadFollowUpAppointmentScheduledEvent>();
  @Output() followUpAppointmentCancelled = new EventEmitter<LeadFollowUpAppointmentCancelledEvent>();
  @Output() followUpAppointmentCompleted = new EventEmitter<LeadFollowUpAppointmentCompletedEvent>();
  @Output() updateRecorded = new EventEmitter<LeadUpdateRecordedEvent>();
  @Output() proposalRequested = new EventEmitter<void>();
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
  parkNotes = '';
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
    { label: 'No money', value: 'No money' },
    { label: 'No time', value: 'No time' },
    { label: 'Already has insurance', value: 'Already has insurance' },
    { label: 'Uncontactable', value: 'Uncontactable' },
    { label: 'Not interested', value: 'Not interested' }
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

  get statusTag(): string {
    return this.lead.tags[0]?.label ?? 'New Lead';
  }

  get statusVariant(): TdxTagVariant {
    return this.statusTag === 'New Lead' ? TdxTagVariant.Primary : TdxTagVariant.Success;
  }

  get isContacted(): boolean {
    return this.statusTag === 'Contacted';
  }

  get isAppointmentSet(): boolean {
    return APPOINTMENT_STATUS_TAGS.has(this.statusTag);
  }

  get isMeeting(): boolean {
    return this.statusTag === 'Meeting';
  }

  get isFollowUp(): boolean {
    return this.statusTag === 'Follow-up';
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

    return this.isContacted ? 'Generate Full Proposal' : 'Generate Draft SI';
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
    this.followUpRecording = false;
    this.schedulerMode = 'appointment';
    this.actionMode = null;
    this.expandedActivityNoteIds.clear();
    this.stateConfirmation = null;
    this.activityNotes = '';
    this.followUpNotes = '';
    this.appointmentNotes = this.lead.appointment?.notes ?? '';
    this.parkNotes = '';
    this.dropReason = '';
    this.selectedDate = this.lead.appointment?.date ?? '';
    this.selectedStartMinutes = this.lead.appointment?.startMinutes ?? null;
    this.selectedEndMinutes = this.lead.appointment?.endMinutes ?? null;
  }

  requestPrimaryAction(): void {
    if (!this.isContacted && !this.isAppointmentSet && !this.isMeeting) {
      this.draftSiRequested.emit();
    }
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

  scheduleAppointment(): void {
    if (!this.selectedDate || this.selectedStartMinutes === null || this.selectedEndMinutes === null) return;

    const event: LeadAppointmentScheduledEvent = {
      lead: this.lead,
      appointment: {
        date: this.selectedDate,
        dateLabel: this.formatDate(this.selectedDate),
        startMinutes: this.selectedStartMinutes,
        endMinutes: this.selectedEndMinutes,
        timeLabel: this.formatTimeRange(this.selectedStartMinutes, this.selectedEndMinutes),
        ...(this.appointmentNotes.trim() ? { notes: this.appointmentNotes.trim() } : {})
      }
    };

    if (this.schedulerMode === 'follow-up') {
      this.followUpAppointmentScheduled.emit(event);
      return;
    }

    if (this.rescheduling) {
      this.appointmentRescheduled.emit(event);
      return;
    }

    this.appointmentScheduled.emit(event);
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
    if (this.isFollowUp) this.proposalRequested.emit();
  }

  openLeadAction(mode: 'park' | 'drop'): void {
    if (this.isLeadPaused) return;
    this.scheduling = false;
    this.rescheduling = false;
    this.cancellingAppointment = false;
    this.followUpRecording = false;
    this.actionMode = mode;
    this.parkNotes = '';
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

    this.leadStateChanged.emit({
      lead: this.lead,
      state: confirmation === 'park' ? 'Parked' : 'Dropped',
      details: confirmation === 'park' ? this.parkNotes.trim() : this.dropReason
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
    return [...this.lead.activities]
      .filter((activity) => activity.category === category)
      .sort((first, second) => first.occurredAtTimestamp - second.occurredAtTimestamp);
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

  private toIsoDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
