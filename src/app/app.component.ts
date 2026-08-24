import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardComponent } from './dashboard/dashboard.component';
import {
  LeadAppointmentCancelledEvent,
  LeadAppointmentCompletedEvent,
  LeadAppointmentScheduledEvent,
  LeadContactedEvent,
  LeadFollowUpRecordedEvent,
  LeadStateChangedEvent
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
      *ngIf="selectedLead && !draftSiOpen"
      [lead]="selectedLead"
      (closed)="closeLead()"
      (contacted)="markLeadAsContacted($event)"
      (appointmentScheduled)="scheduleLeadAppointment($event)"
      (appointmentRescheduled)="rescheduleLeadAppointment($event)"
      (appointmentCancelled)="cancelLeadAppointment($event)"
      (appointmentCompleted)="completeLeadAppointment($event)"
      (followUpRecorded)="recordLeadFollowUp($event)"
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
  activityRecorded = false;
  activityToastMessage = 'Your activity has been recorded.';
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
    this.changeDetectorRef.markForCheck();
  }

  openDraftSi(): void {
    this.draftSiOpen = true;
    this.navigation.showLeadFlow();
    this.changeDetectorRef.markForCheck();
  }

  markLeadAsContacted(event: LeadContactedEvent): void {
    const contactedLead = this.dashboard?.markLeadAsContacted(event.lead.id, event.notes);
    if (!contactedLead) return;

    this.finishBoardActivity('Your activity has been recorded.');
  }

  scheduleLeadAppointment(event: LeadAppointmentScheduledEvent): void {
    const scheduledLead = this.dashboard?.scheduleLeadAppointment(event.lead.id, event.appointment);
    if (!scheduledLead) return;

    this.finishBoardActivity('Appointment has been scheduled.');
  }

  rescheduleLeadAppointment(event: LeadAppointmentScheduledEvent): void {
    const rescheduledLead = this.dashboard?.rescheduleLeadAppointment(event.lead.id, event.appointment);
    if (!rescheduledLead) return;

    this.finishBoardActivity('Appointment has been rescheduled.');
  }

  cancelLeadAppointment(event: LeadAppointmentCancelledEvent): void {
    const cancelledLead = this.dashboard?.cancelLeadAppointment(event.lead.id, event.notes);
    if (!cancelledLead) return;

    this.finishBoardActivity('Your appointment has been canceled.');
  }

  completeLeadAppointment(event: LeadAppointmentCompletedEvent): void {
    const meetingLead = this.dashboard?.completeLeadAppointment(event.lead.id, event.notes);
    if (!meetingLead) return;

    this.finishBoardActivity('Your activity has been recorded.');
  }

  recordLeadFollowUp(event: LeadFollowUpRecordedEvent): void {
    const followUpLead = this.dashboard?.recordLeadFollowUp(event.lead.id, event.notes);
    if (!followUpLead) return;

    this.finishBoardActivity('Lead marked for follow-up.');
  }

  changeLeadState(event: LeadStateChangedEvent): void {
    const updatedLead = this.dashboard?.changeLeadState(event.lead.id, event.state, event.details);
    if (!updatedLead) return;

    const message = event.state === 'Parked'
      ? 'Lead has been parked.'
      : event.state === 'Dropped'
        ? 'Lead has been dropped.'
        : 'Lead reactivated successfully.';
    this.finishBoardActivity(message);
  }

  private finishBoardActivity(message: string): void {
    this.clearActivityToast();

    this.selectedLead = null;
    this.draftSiOpen = false;
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
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.clearActivityToast();
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
