import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ApplicationsComponent } from './applications/applications.component';
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
import { LeadRecordTab } from './proposal-flow/proposal-flow.component';
import { LeadJourneyStateService } from './shared/services/lead-journey-state.service';

@Component({
  selector: 'lam-root',
  template: `
    <router-outlet />
    <div *ngIf="!showApplications" class="app-dashboard-host" [attr.inert]="selectedLead ? '' : null" [attr.aria-hidden]="selectedLead ? true : null">
      <lam-dashboard (leadOpened)="openLead($event)" />
    </div>
    <lam-applications *ngIf="showApplications" />
    <lam-lead-activity-drawer
      *ngIf="selectedLead && !draftSiOpen && (!proposalOpen || contactDrawerOpen)"
      [lead]="selectedLead"
      (closed)="contactDrawerOpen ? closeContactDrawer() : closeLead()"
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
      (fullProposalRequested)="openLeadJourney()"
      (leadStateChanged)="changeLeadState($event)"
      (draftSiRequested)="openDraftSi()"
      (editLeadRequested)="editLeadInfo()"
    />
    <app-section-message
      *ngIf="activityRecorded"
      class="activity-toast"
      appearance="success"
      icon="check_circle"
      [description]="activityToastMessage"
    />
    <lam-draft-si-flow *ngIf="selectedLead && draftSiOpen" [lead]="selectedLead" (closed)="closeLead()" />
    <lam-proposal-flow *ngIf="selectedLead && proposalOpen" [lead]="selectedLead" [routeTab]="activeRecordTab" [editMode]="leadInfoEditMode" (routeTabChange)="navigateToRecordTab($event)" (contactRequired)="openContactDrawer()" (appointmentRequired)="openContactDrawer()" (activityRequested)="openContactDrawer()" (underwritingSubmitted)="viewSubmittedApplication($event)" (closed)="closeLead()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent implements AfterViewInit {
  @ViewChild(DashboardComponent) private dashboard?: DashboardComponent;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigation = inject(AppNavigationStateService);
  private readonly router = inject(Router);
  private readonly journeyState = inject(LeadJourneyStateService);
  selectedLead: LeadCardData | null = null;
  draftSiOpen = false;
  proposalOpen = false;
  contactDrawerOpen = false;
  activeRecordTab: LeadRecordTab = 'info';
  leadInfoEditMode = false;
  activityRecorded = false;
  activityToastMessage = 'Your activity has been recorded.';
  private pendingHighlightLeadId: string | null = null;
  private activityToastTimer?: ReturnType<typeof setTimeout>;
  private activityToastDismissTimer?: ReturnType<typeof setTimeout>;

  get showApplications(): boolean {
    return this.navigation.activeDestination() === 'applications';
  }

  constructor() {
    this.navigation.lcamBoardRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeLead());
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationEnd) this.openRoute(event.urlAfterRedirects);
      });
    this.destroyRef.onDestroy(() => {
      if (this.activityToastTimer) clearTimeout(this.activityToastTimer);
      if (this.activityToastDismissTimer) clearTimeout(this.activityToastDismissTimer);
    });
  }

  ngAfterViewInit(): void {
    this.openRoute(this.router.url);
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
    if (!this.selectedLead) return;
    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'proposals';
    this.leadInfoEditMode = false;
    this.journeyState.unlock(this.selectedLead.leadId, 'proposals');
    this.navigation.showLeadFlow();
    void this.router.navigate(['/lcam', this.selectedLead.leadId, 'proposals']);
    this.changeDetectorRef.markForCheck();
  }

  editLeadInfo(): void {
    if (!this.selectedLead) return;
    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'info';
    this.leadInfoEditMode = true;
    this.navigation.showLeadFlow();
    void this.router.navigate(['/lcam', this.selectedLead.leadId]);
    this.changeDetectorRef.markForCheck();
  }

  openLeadJourney(): void {
    if (!this.selectedLead) return;

    const tab = this.journeyState.highestUnlockedTab(this.selectedLead.leadId);
    if (tab === 'info') {
      this.editLeadInfo();
      return;
    }

    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = tab;
    this.leadInfoEditMode = false;
    this.navigation.showLeadFlow();
    void this.router.navigate(['/lcam', this.selectedLead.leadId, tab]);
    this.changeDetectorRef.markForCheck();
  }

  openContactDrawer(): void {
    this.contactDrawerOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  viewSubmittedApplication(lead: LeadCardData): void {
    this.navigation.submitApplication(lead);
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.contactDrawerOpen = false;
    this.leadInfoEditMode = false;
    this.navigation.goToApplications();
    this.changeDetectorRef.markForCheck();
  }

  closeContactDrawer(): void {
    this.contactDrawerOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  navigateToRecordTab(tab: LeadRecordTab): void {
    if (!this.selectedLead) return;

    this.activeRecordTab = tab;
    this.leadInfoEditMode = false;
    const commands = tab === 'info'
      ? ['/lcam', this.selectedLead.leadId]
      : ['/lcam', this.selectedLead.leadId, tab];
    void this.router.navigate(commands);
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
    if (this.proposalOpen) {
      this.navigation.showLeadFlow();
    } else {
      this.navigation.activeDestination.set('lcam-board');
    }
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
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'info';
    this.leadInfoEditMode = false;
    this.navigation.activeDestination.set('lcam-board');
    if (this.router.url !== '/lcam') void this.router.navigate(['/lcam']);
    this.changeDetectorRef.markForCheck();
  }

  private openRoute(url: string): void {
    const path = url.split(/[?#]/, 1)[0];
    const match = /^\/lcam(?:\/([^/]+)(?:\/(profile|proposals|applications))?)?\/?$/.exec(path);
    if (!match) return;

    const [, leadId, routeTab] = match;
    if (!leadId) {
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.contactDrawerOpen = false;
      this.activeRecordTab = 'info';
      this.navigation.activeDestination.set('lcam-board');
      this.changeDetectorRef.markForCheck();
      return;
    }

    if (!this.dashboard) return;

    const lead = this.dashboard.findLeadByLeadId(leadId);
    if (!lead) {
      void this.router.navigate(['/lcam']);
      return;
    }

    const requestedTab = (routeTab ?? 'info') as LeadRecordTab;
    const activeTab = this.journeyState.canAccess(lead.leadId, requestedTab)
      ? requestedTab
      : this.journeyState.highestUnlockedTab(lead.leadId);
    if (activeTab !== requestedTab) {
      const commands = activeTab === 'info' ? ['/lcam', lead.leadId] : ['/lcam', lead.leadId, activeTab];
      void this.router.navigate(commands);
      return;
    }

    const isEditingCurrentLead = this.leadInfoEditMode && this.selectedLead?.leadId === lead.leadId && activeTab === 'info';
    this.selectedLead = lead;
    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = activeTab;
    this.leadInfoEditMode = isEditingCurrentLead;
    this.navigation.showLeadFlow();
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
