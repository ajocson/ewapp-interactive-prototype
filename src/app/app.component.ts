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
  LeadUpdateRecordedEvent,
  LeadUnableToSetAppointmentEvent
} from './components/lead-activity-drawer/lead-activity-drawer.component';
import { LeadCardData } from './lead-board.model';
import { AppNavigationStateService } from './shared/services/app-navigation-state.service';
import { LeadRecordTab } from './proposal-flow/proposal-flow.component';
import { LeadJourneyStateService } from './shared/services/lead-journey-state.service';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from './shared/components/button/button.model';
import { TdxFieldControlOption } from './shared/components/field-control/field-control.component';

@Component({
  selector: 'lam-root',
  template: `
    <router-outlet />
    <div *ngIf="loggedIn && !showApplications" class="app-dashboard-host" [attr.inert]="selectedLead ? '' : null" [attr.aria-hidden]="selectedLead ? true : null">
      <lam-dashboard [userType]="userType" (leadOpened)="openLead($event)" (newLeadRequested)="openNewLead()" (loggedOut)="logOut()" />
    </div>
    <lam-applications *ngIf="loggedIn && showApplications" [userType]="userType" (leadSelected)="openApplicationLead($event)" (loggedOut)="logOut()" />
    <lam-lead-activity-drawer
      *ngIf="selectedLead && ((!draftSiOpen && !proposalOpen) || contactDrawerOpen)"
      [lead]="selectedLead"
      [userType]="userType"
      [fromApplicationsPage]="applicationLeadContext"
      (closed)="contactDrawerOpen ? closeContactDrawer() : closeLead()"
      (contacted)="markLeadAsContacted($event)"
      (appointmentScheduled)="scheduleLeadAppointment($event)"
      (appointmentRescheduled)="rescheduleLeadAppointment($event)"
      (appointmentCancelled)="cancelLeadAppointment($event)"
      (appointmentCompleted)="completeLeadAppointment($event)"
      (unableToSetAppointment)="recordUnableToSetAppointment($event)"
      (followUpRecorded)="recordLeadFollowUp($event)"
      (followUpAppointmentScheduled)="scheduleFollowUpAppointment($event)"
      (followUpAppointmentCancelled)="cancelFollowUpAppointment($event)"
      (followUpAppointmentCompleted)="completeFollowUpAppointment($event)"
      (updateRecorded)="recordLeadUpdate($event)"
      (proposalRequested)="openProposal()"
      (fullProposalRequested)="openLeadJourney()"
      (applicationRequested)="viewApplication()"
      (applicationProposalRequested)="openApplicationProposal()"
      (leadStateChanged)="changeLeadState($event)"
      (draftSiRequested)="openDraftSi()"
      (editLeadRequested)="editLeadInfo()"
    />
    <main *ngIf="!loggedIn" class="login-screen">
      <img class="login-screen__bg login-screen__bg--left" src="https://www.figma.com/api/mcp/asset/fbd3a5a3-ade6-4a22-a213-1698ce7f245d.svg" alt="" aria-hidden="true">
      <img class="login-screen__bg login-screen__bg--right" src="https://www.figma.com/api/mcp/asset/e7ce5cbc-ab90-43cf-8de0-dbbdd365f565.svg" alt="" aria-hidden="true">
      <div class="login-brand"><img src="https://www.figma.com/api/mcp/asset/a4bb8717-19f1-4fdc-8a44-81b39b332253.svg" alt="EastWest Ageas Life Insurance"><span></span><strong>EWApp</strong></div>
      <section class="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Sign in to your account</h1>
        <label>Agent Code<input [(ngModel)]="agentCode" placeholder="Input your Agent Code"></label>
        <div class="login-card__password-label"><label>Password</label><a href="#" (click)="$event.preventDefault()">Forgot Password</a></div>
        <div class="login-card__password"><input [type]="passwordVisible ? 'text' : 'password'" [(ngModel)]="password" placeholder="Input your password"><button type="button" [attr.aria-label]="passwordVisible ? 'Hide password' : 'Show password'" (click)="passwordVisible = !passwordVisible"><span class="material-symbols-rounded" aria-hidden="true">{{ passwordVisible ? 'visibility_off' : 'visibility' }}</span></button></div>
        <app-button class="login-card__continue" label="Continue" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" (clicked)="logIn()" />
      </section>
      <div class="login-support"><p>Having trouble logging in? Please contact</p><div><span>✉ AgencySupport@ewageas.com.ph</span><span>✉ BancaSupport@ewageas.com.ph</span></div></div>
      <div class="login-footer"><span>Copyright © 2026. East West Ageas Life Insurance Corporation.</span><span>Legal&nbsp; · &nbsp;Privacy&nbsp; · &nbsp;Security</span></div>
    </main>
    <app-section-message
      *ngIf="activityRecorded"
      class="activity-toast"
      appearance="success"
      icon="check_circle"
      [description]="activityToastMessage"
    />
    <lam-draft-si-flow *ngIf="selectedLead && draftSiOpen" [lead]="selectedLead" (closed)="closeDraftSi()" (draftSiGenerated)="recordDraftSiGenerated()" (proposalRequested)="openDraftProposalInfo()" (activityRequested)="openContactDrawer()" (contactRequired)="openContactDrawer()" (appointmentRequired)="openContactDrawer()" />
    <lam-proposal-flow *ngIf="selectedLead && proposalOpen" [lead]="selectedLead" [routeTab]="activeRecordTab" [editMode]="leadInfoEditMode" [submittedApplicationContext]="applicationLeadContext" (routeTabChange)="navigateToRecordTab($event)" (csaCreated)="recordCsaCreated()" (siGenerated)="recordSiGenerated()" (proposalSaved)="recordProposalCreated()" (applicationConverted)="recordApplicationConverted()" (contactRequired)="openContactDrawer()" (appointmentRequired)="openContactDrawer()" (activityRequested)="openContactDrawer()" (underwritingSubmitted)="viewSubmittedApplication($event)" (closed)="closeLead()" />
    <section *ngIf="newLeadOpen" class="new-lead-modal" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
      <div class="new-lead-modal__backdrop" aria-hidden="true"></div>
      <div class="new-lead-modal__panel">
        <header><h2 id="new-lead-title">Create New Lead</h2><button type="button" class="new-lead-modal__close" aria-label="Close New Lead" (click)="newLeadOpen = false">×</button></header>
        <ng-container *ngIf="newLeadStep === 1; else sourceStep">
        <p class="new-lead-modal__intro">Step 1: Please fill up customer information</p>
        <p class="new-lead-modal__required"><span class="material-symbols-rounded" aria-hidden="true">info</span>All fields are required unless stated “Optional”</p>
        <div class="new-lead-form">
          <label><span>Title</span><select disabled><option>Mr.</option><option>Ms.</option></select></label>
          <label><span>Gender</span><select disabled><option>Male</option><option>Female</option></select></label>
          <label class="new-lead-form__full"><span>First Name</span><input value="John" readonly /></label>
          <label class="new-lead-form__full"><span>Middle Name</span><input value="Mark" readonly /><span class="new-lead-form__checkbox"><input type="checkbox" disabled /> I do not have middle name <span class="material-symbols-rounded" aria-hidden="true">help</span></span></label>
          <label class="new-lead-form__full"><span>Last name</span><input value="Doe" readonly /></label>
          <label><span>Suffix (Optional)</span><select disabled><option>None</option></select></label>
          <label><span>Birth Date</span><input type="date" value="1989-01-05" readonly /></label>
          <div class="new-lead-form__section"><h3>Contact Information</h3><a href="#" (click)="$event.preventDefault()">Why do we need this?</a></div>
          <label class="new-lead-form__full"><span>Mobile Number</span><input value="+63 9226789012" readonly /><small>It can be used for essential communication related to their insurance coverage only.</small></label>
          <label class="new-lead-form__full"><span>Email Address</span><input type="email" value="client@email.com" readonly /><small>It can be used to set up the customer portal account later, receive important updates to their policy, exclusive features, and many more.</small></label>
        </div>
        <footer><app-button class="new-lead-modal__continue" label="Continue" rightIcon="chevron_right" [variant]="buttonVariant.Primary" [size]="buttonSize.Medium" (clicked)="newLeadStep = 2" /></footer>
        </ng-container>
        <ng-template #sourceStep>
          <p class="new-lead-modal__intro">Step 2: Please input source of lead</p>
          <p class="new-lead-modal__required"><span class="material-symbols-rounded" aria-hidden="true">info</span>All fields are required unless stated “Optional”</p>
          <label class="new-lead-source"><span>Source of Lead</span><tdx-field-control name="new-lead-source" ariaLabel="Source of Lead" label="Select your source of lead" [value]="newLeadSource" [options]="newLeadSourceOptions" trailingIcon="keyboard_arrow_down" [fluid]="true" (valueChange)="newLeadSource = $event" /></label>
          <footer class="new-lead-modal__step-actions"><app-button label="Back" leftIcon="chevron_left" [variant]="buttonVariant.Primary" [emphasis]="buttonEmphasis.Outline" [size]="buttonSize.Medium" (clicked)="newLeadStep = 1" /><app-button label="Create Lead" rightIcon="chevron_right" [variant]="buttonVariant.Primary" [size]="buttonSize.Medium" (clicked)="createNewLead()" /></footer>
        </ng-template>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent implements AfterViewInit {
  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly buttonSize = TdxButtonSize;
  @ViewChild(DashboardComponent) private dashboard?: DashboardComponent;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigation = inject(AppNavigationStateService);
  private readonly router = inject(Router);
  private readonly journeyState = inject(LeadJourneyStateService);
  selectedLead: LeadCardData | null = null;
  newLeadOpen = false;
  loggedIn = this.readLoginState();
  agentCode = '';
  password = '';
  userType: 'Agency' | 'Banca' = this.readUserType();
  passwordVisible = false;
  newLeadStep: 1 | 2 = 1;
  newLeadSource = '';
  readonly newLeadSourceOptions: readonly TdxFieldControlOption[] = [
    'Alternative Distribution', 'CBG (Consumer Banking Group)', 'CLC (Consumer Lending Cluster)',
    'PBG (Partnership Banking Group)', 'Self-Generated Lead'
  ].map((label) => ({ label, value: label }));
  draftSiOpen = false;
  proposalOpen = false;
  contactDrawerOpen = false;
  activeRecordTab: LeadRecordTab = 'info';
  leadInfoEditMode = false;
  applicationLeadContext = false;
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
    this.navigation.applicationsRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openApplicationsPage());
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
    this.applicationLeadContext = false;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  openApplicationLead(lead: LeadCardData): void {
    this.openLead(lead);
    this.applicationLeadContext = true;
  }

  openNewLead(): void {
    this.newLeadStep = 1;
    this.newLeadSource = '';
    this.newLeadOpen = true;
  }

  logOut(): void {
    this.loggedIn = false;
    this.writeLoginState(false);
    this.selectedLead = null;
    this.newLeadOpen = false;
  }

  logIn(): void {
    const credentialsMatch = this.agentCode === this.password && (this.agentCode === 'Banca' || this.agentCode === 'Agency');
    if (!credentialsMatch) return;
    this.loggedIn = true;
    this.userType = this.agentCode as 'Agency' | 'Banca';
    sessionStorage.setItem('ewapp-user-type', this.userType);
    this.writeLoginState(true);
    this.changeDetectorRef.markForCheck();
  }

  private readLoginState(): boolean {
    return sessionStorage.getItem('ewapp-logged-in') !== 'false';
  }

  private writeLoginState(loggedIn: boolean): void {
    sessionStorage.setItem('ewapp-logged-in', String(loggedIn));
  }

  private readUserType(): 'Agency' | 'Banca' {
    return sessionStorage.getItem('ewapp-user-type') === 'Agency' ? 'Agency' : 'Banca';
  }

  createNewLead(): void {
    this.newLeadOpen = false;
    this.newLeadStep = 1;
    this.dashboard?.highlightLeadCard('lead-1');
    this.changeDetectorRef.markForCheck();
  }

  openDraftSi(): void {
    this.contactDrawerOpen = false;
    this.draftSiOpen = true;
    this.navigation.showLeadFlow();
    this.changeDetectorRef.markForCheck();
  }

  closeDraftSi(): void {
    this.draftSiOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  recordDraftSiGenerated(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordDraftSiGenerated(this.selectedLead.leadId) ?? this.selectedLead;
    this.changeDetectorRef.markForCheck();
  }

  recordCsaCreated(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordSystemActivity(this.selectedLead.leadId, 'CSA Created') ?? this.selectedLead;
    this.changeDetectorRef.markForCheck();
  }

  recordSiGenerated(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordSystemActivity(this.selectedLead.leadId, 'SI Generated') ?? this.selectedLead;
    this.changeDetectorRef.markForCheck();
  }

  recordProposalCreated(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordSystemActivity(this.selectedLead.leadId, 'Proposal Created') ?? this.selectedLead;
    this.changeDetectorRef.markForCheck();
  }

  recordApplicationConverted(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordSystemActivity(this.selectedLead.leadId, 'Application Created') ?? this.selectedLead;
    this.showActivityToast('Proposal Converted to Application');
    this.changeDetectorRef.markForCheck();
  }

  openProposal(): void {
    if (!this.selectedLead) return;
    const hasCreatedProposal = this.selectedLead.activities?.some((activity) => activity.label === 'Proposal Created') ?? false;
    if (!hasCreatedProposal) {
      this.draftSiOpen = false;
      this.proposalOpen = true;
      this.contactDrawerOpen = false;
      this.activeRecordTab = 'profile';
      this.leadInfoEditMode = false;
      this.navigation.showLeadFlow();
      void this.router.navigate(['/lcam', this.selectedLead.leadId, 'profile']);
      this.changeDetectorRef.markForCheck();
      return;
    }
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

  openDraftProposalInfo(): void {
    if (!this.selectedLead) return;

    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'info';
    this.leadInfoEditMode = false;
    this.navigation.showLeadFlow();
    void this.router.navigate(['/lcam', this.selectedLead.leadId]);
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

    const hasGeneratedSalesIllustration = this.selectedLead.activities?.some((activity) => activity.label === 'SI Generated') ?? false;
    const hasCreatedProposal = this.selectedLead.activities?.some((activity) => activity.label === 'Proposal Created') ?? false;
    if (hasCreatedProposal || (hasGeneratedSalesIllustration && (this.selectedLead.tags[0]?.label === 'Meeting' || this.selectedLead.tags[0]?.label === 'Follow-up'))) {
      this.journeyState.unlock(this.selectedLead.leadId, 'proposals');
      this.draftSiOpen = false;
      this.proposalOpen = true;
      this.contactDrawerOpen = false;
      this.activeRecordTab = 'proposals';
      this.leadInfoEditMode = false;
      this.navigation.showLeadFlow();
      void this.router.navigate(['/lcam', this.selectedLead.leadId, 'proposals']);
      this.changeDetectorRef.markForCheck();
      return;
    }

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

  viewApplication(): void {
    if (!this.selectedLead) return;
    this.journeyState.unlock(this.selectedLead.leadId, 'applications');
    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'applications';
    this.leadInfoEditMode = false;
    this.navigation.showLeadFlow();
    void this.router.navigate(['/lcam', this.selectedLead.leadId, 'applications']);
    this.changeDetectorRef.markForCheck();
  }

  openApplicationProposal(): void {
    if (!this.selectedLead) return;
    this.journeyState.unlock(this.selectedLead.leadId, 'proposals');
    this.journeyState.unlock(this.selectedLead.leadId, 'applications');
    this.draftSiOpen = false;
    this.proposalOpen = true;
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'proposals';
    this.leadInfoEditMode = false;
    this.navigation.showLeadFlow();
    void this.router.navigate(['/lcam', this.selectedLead.leadId, 'proposals']);
    this.changeDetectorRef.markForCheck();
  }

  openContactDrawer(): void {
    this.contactDrawerOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  viewSubmittedApplication(lead: LeadCardData): void {
    const submittedLead = this.dashboard?.recordSystemActivity(lead.leadId, 'Application Submitted') ?? lead;
    this.selectedLead = submittedLead;
    this.navigation.submitApplication(submittedLead);
    this.openApplicationsPage();
    this.navigation.goToApplications();
  }

  private openApplicationsPage(): void {
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.contactDrawerOpen = false;
    this.leadInfoEditMode = false;
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

  recordUnableToSetAppointment(event: LeadUnableToSetAppointmentEvent): void {
    const updatedLead = this.dashboard?.recordUnableToSetAppointment(event.lead.id, event.notes);
    if (!updatedLead) return;
    this.finishBoardActivity(updatedLead, 'Your activity has been recorded.');
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
    const returnToApplications = this.showApplications;
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
    this.navigation.activeDestination.set(returnToApplications ? 'applications' : 'lcam-board');
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

    const lead = this.dashboard.findLeadByLeadId(leadId)
      ?? (this.applicationLeadContext && this.selectedLead?.leadId === leadId ? this.selectedLead : null);
    if (!lead) {
      void this.router.navigate(['/lcam']);
      return;
    }

    const requestedTab = (routeTab ?? (this.journeyState.highestUnlockedTab(lead.leadId) === 'applications' ? 'applications' : 'info')) as LeadRecordTab;
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

  private showActivityToast(message: string): void {
    this.clearActivityToast();
    this.activityToastMessage = message;
    this.activityRecorded = true;
    this.activityToastDismissTimer = setTimeout(() => {
      this.activityRecorded = false;
      this.activityToastDismissTimer = undefined;
      this.changeDetectorRef.markForCheck();
    }, 4000);
  }
}
