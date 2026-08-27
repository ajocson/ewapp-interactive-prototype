import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardComponent } from './dashboard/dashboard.component';
import {
  LeadAppointmentCancelledEvent,
  LeadAppointmentCompletedEvent,
  LeadAppointmentScheduledEvent,
  LeadContactedEvent,
  LeadFollowUpRecordedEvent,
  LeadFollowUpAppointmentCancelledEvent,
  LeadFollowUpAppointmentCompletedEvent,
  LeadFollowUpAppointmentScheduledEvent,
  LeadStateChangedEvent,
  LeadUpdateRecordedEvent
} from './components/lead-activity-drawer/lead-activity-drawer.component';
import { LeadCardData } from './lead-board.model';
import { AppNavigationStateService } from './shared/services/app-navigation-state.service';

@Component({
  selector: 'lam-root',
  template: `
    <div class="app-dashboard-host" [attr.inert]="selectedLead ? '' : null" [attr.aria-hidden]="selectedLead ? true : null">
      <lam-dashboard (leadOpened)="openLead($event)" />
    </div>
    <lam-lead-activity-drawer
      *ngIf="selectedLead && !draftSiOpen && !proposalOpen"
      [lead]="selectedLead"
      (closed)="closeLead()"
      (contacted)="markLeadAsContacted($event)"
      (appointmentScheduled)="scheduleLeadAppointment($event)"
      (appointmentRescheduled)="rescheduleLeadAppointment($event)"
      (appointmentCancelled)="cancelLeadAppointment($event)"
      (appointmentCompleted)="completeLeadAppointment($event)"
      (followUpRecorded)="recordLeadFollowUp($event)"
      (followUpAppointmentScheduled)="scheduleFollowUpAppointment($event)"
      (followUpAppointmentCancelled)="cancelFollowUpAppointment($event)"
      (followUpAppointmentCompleted)="completeFollowUpAppointment($event)"
      (updateRecorded)="recordLeadUpdate($event)"
      (proposalRequested)="openProposal()"
      (leadStateChanged)="changeLeadState($event)"
      (draftSiRequested)="openDraftSi()"
    />
    <app-section-message
      *ngIf="activityRecorded"
      class="activity-toast"
      appearance="success"
      icon="check_circle"
      [description]="activityToastMessage"
    />
    <lam-draft-si-flow *ngIf="selectedLead && draftSiOpen" [lead]="selectedLead" (closed)="closeLead()" />
    <lam-proposal-flow *ngIf="selectedLead && proposalOpen" [lead]="selectedLead" (closed)="closeLead()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent {
  @ViewChild(DashboardComponent) private dashboard?: DashboardComponent;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigation = inject(AppNavigationStateService);
  selectedLead: LeadCardData | null = null;
  draftSiOpen = false;
  proposalOpen = false;
  activityRecorded = false;
  activityToastMessage = 'Your activity has been recorded.';
  private pendingHighlightLeadId: string | null = null;
  private activityToastTimer?: ReturnType<typeof setTimeout>;
  private activityToastDismissTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.navigation.lcamBoardRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeLead());
    this.destroyRef.onDestroy(() => {
      if (this.activityToastTimer) clearTimeout(this.activityToastTimer);
      if (this.activityToastDismissTimer) clearTimeout(this.activityToastDismissTimer);
    });
  }

  openLead(lead: LeadCardData): void {
    this.clearActivityToast();
    this.selectedLead = lead;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  openDraftSi(): void {
    this.draftSiOpen = true;
    this.navigation.showLeadFlow();
    this.changeDetectorRef.markForCheck();
  }

  openProposal(): void {
    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.navigation.showLeadFlow();
    this.changeDetectorRef.markForCheck();
  }

  markLeadAsContacted(event: LeadContactedEvent): void {
    const contactedLead = this.dashboard?.markLeadAsContacted(event.lead.id, event.notes);
    if (!contactedLead) return;

    this.finishBoardActivity(contactedLead, 'Your activity has been recorded.');
  }

  scheduleLeadAppointment(event: LeadAppointmentScheduledEvent): void {
    const scheduledLead = this.dashboard?.scheduleLeadAppointment(event.lead.id, event.appointment);
    if (!scheduledLead) return;

    this.finishBoardActivity(scheduledLead, 'Appointment has been scheduled.');
  }

  rescheduleLeadAppointment(event: LeadAppointmentScheduledEvent): void {
    const rescheduledLead = this.dashboard?.rescheduleLeadAppointment(event.lead.id, event.appointment);
    if (!rescheduledLead) return;

    this.finishBoardActivity(rescheduledLead, 'Appointment has been rescheduled.');
  }

  cancelLeadAppointment(event: LeadAppointmentCancelledEvent): void {
    const cancelledLead = this.dashboard?.cancelLeadAppointment(event.lead.id, event.notes);
    if (!cancelledLead) return;

    this.finishBoardActivity(cancelledLead, 'Your appointment has been canceled.');
  }

  completeLeadAppointment(event: LeadAppointmentCompletedEvent): void {
    const meetingLead = this.dashboard?.completeLeadAppointment(event.lead.id, event.notes);
    if (!meetingLead) return;

    this.finishBoardActivity(meetingLead, 'Your activity has been recorded.');
  }

  recordLeadFollowUp(event: LeadFollowUpRecordedEvent): void {
    const followUpLead = this.dashboard?.recordLeadFollowUp(event.lead.id, event.notes);
    if (!followUpLead) return;

    this.finishBoardActivity(followUpLead, 'Lead marked for follow-up.');
  }

  scheduleFollowUpAppointment(event: LeadFollowUpAppointmentScheduledEvent): void {
    const updatedLead = this.dashboard?.scheduleFollowUpAppointment(event.lead.id, event.appointment);
    if (!updatedLead) return;

    this.finishBoardActivity(updatedLead, 'Follow-up appointment has been scheduled.');
  }

  cancelFollowUpAppointment(event: LeadFollowUpAppointmentCancelledEvent): void {
    const updatedLead = this.dashboard?.cancelFollowUpAppointment(event.lead.id, event.notes);
    if (!updatedLead) return;

    this.finishBoardActivity(updatedLead, 'Follow-up appointment has been canceled.');
  }

  completeFollowUpAppointment(event: LeadFollowUpAppointmentCompletedEvent): void {
    const updatedLead = this.dashboard?.completeFollowUpAppointment(event.lead.id, event.notes);
    if (!updatedLead) return;

    this.finishBoardActivity(updatedLead, 'Your activity has been recorded.');
  }

  recordLeadUpdate(event: LeadUpdateRecordedEvent): void {
    const updatedLead = this.dashboard?.recordLeadUpdate(event.lead.id, event.notes);
    if (!updatedLead) return;

    this.finishBoardActivity(updatedLead, 'Follow-up update has been recorded.');
  }

  changeLeadState(event: LeadStateChangedEvent): void {
    const updatedLead = this.dashboard?.changeLeadState(event.lead.id, event.state, event.details);
    if (!updatedLead) return;

    const message = event.state === 'Parked'
      ? 'Lead has been parked.'
      : event.state === 'Dropped'
        ? 'Lead has been dropped.'
        : 'Lead reactivated successfully.';
    this.finishBoardActivity(updatedLead, message);
  }

  private finishBoardActivity(updatedLead: LeadCardData, message: string): void {
    this.clearActivityToast();

    this.selectedLead = updatedLead;
    this.pendingHighlightLeadId = updatedLead.id;
    this.activityToastMessage = message;
    this.navigation.activeDestination.set('lcam-board');
    this.activityToastTimer = setTimeout(() => {
      this.activityRecorded = true;
      this.activityToastTimer = undefined;
      this.changeDetectorRef.markForCheck();
      this.activityToastDismissTimer = setTimeout(() => {
        this.activityRecorded = false;
        this.activityToastDismissTimer = undefined;
        this.changeDetectorRef.markForCheck();
      }, 4000);
    }, 800);
    this.changeDetectorRef.markForCheck();
  }

  closeLead(): void {
    if (this.pendingHighlightLeadId) {
      this.dashboard?.highlightLeadCard(this.pendingHighlightLeadId);
      this.pendingHighlightLeadId = null;
    }
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.navigation.activeDestination.set('lcam-board');
    this.changeDetectorRef.markForCheck();
  }

  private clearActivityToast(): void {
    if (this.activityToastTimer) clearTimeout(this.activityToastTimer);
    if (this.activityToastDismissTimer) clearTimeout(this.activityToastDismissTimer);
    this.activityToastTimer = undefined;
    this.activityToastDismissTimer = undefined;
    this.activityRecorded = false;
  }
}
