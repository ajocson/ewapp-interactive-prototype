import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, HostListener, ViewChild, inject } from '@angular/core';
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
import { TdxTagEmphasis, TdxTagVariant } from './shared/components/tag/tag.model';

@Component({
  selector: 'lam-root',
  template: `
    <router-outlet />
    <div *ngIf="loggedIn && !passwordResetLinkOpen && !showApplications && !showProposalGenerator" class="app-dashboard-host" [attr.inert]="selectedLead ? '' : null" [attr.aria-hidden]="selectedLead ? true : null">
      <lam-dashboard [userType]="userType" [apiErrorMode]="apiErrorMode" [searchErrorMode]="searchErrorMode" [suppressBoardLoading]="drawerLoadingErrorMode" (leadOpened)="openLead($event)" (newLeadRequested)="openNewLead()" (draftSiRequested)="openDraftSiQuickQuote()" (generateProposalRequested)="openProposalGenerator()" (retryRequested)="retryApiError()" (loggedOut)="logOut()" />
    </div>
    <lam-applications *ngIf="loggedIn && !passwordResetLinkOpen && showApplications" [userType]="userType" (leadSelected)="openApplicationLead($event)" (loggedOut)="logOut()" />
    <lam-proposal-generator *ngIf="loggedIn && !passwordResetLinkOpen && showProposalGenerator" [userType]="userType" [initialView]="proposalGeneratorInitialView" (newLeadRequested)="openNewLead()" (draftSiRequested)="openDraftSiQuickQuote()" (loggedOut)="logOut()" />
    <lam-lead-activity-drawer
      *ngIf="selectedLead && ((!draftSiOpen && !proposalOpen) || contactDrawerOpen)"
      [lead]="selectedLead"
      [userType]="userType"
      [fromApplicationsPage]="applicationLeadContext"
      [showCsaContactRequirement]="csaContactRequirementOpen"
      [loadingErrorMode]="drawerLoadingErrorMode"
      (closed)="contactDrawerOpen ? closeContactDrawer() : closeLead()"
      (contacted)="markLeadAsContacted($event)"
      (draftSiUpdateRequired)="openDraftSiContactUpdate()"
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
      (retryRequested)="retryDrawerLoading()"
    />
    <main *ngIf="!loggedIn || passwordResetLinkOpen" class="login-screen">
      <div class="login-screen__bg login-screen__bg--left" aria-hidden="true"></div>
      <div class="login-screen__bg login-screen__bg--right" aria-hidden="true"></div>
      <div class="login-brand"><img src="assets/eastwest-ageas-logo-updated.svg" alt="EastWest Ageas Life Insurance"><span aria-hidden="true"></span><app-tag label="EWApp" [variant]="tagVariant.Primary" [emphasis]="tagEmphasis.Subtle" /></div>
      <section *ngIf="!passwordResetLinkOpen && !forgotPasswordOpen" class="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Sign in to your account</h1>
        <label>Agent Code<input [(ngModel)]="agentCode" placeholder="Input your Agent Code"></label>
        <div class="login-card__password-group">
          <div class="login-card__password-label"><label>Password</label><a href="#" (click)="openForgotPassword($event)">Forgot Password</a></div>
          <div class="login-card__password"><input [type]="passwordVisible ? 'text' : 'password'" [(ngModel)]="password" autocomplete="new-password" placeholder="Input your password"><button type="button" [attr.aria-label]="passwordVisible ? 'Hide password' : 'Show password'" (click)="passwordVisible = !passwordVisible"><span class="material-symbols-rounded" aria-hidden="true">{{ passwordVisible ? 'visibility_off' : 'visibility' }}</span></button></div>
        </div>
        <app-button class="login-card__continue" label="Continue" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" (clicked)="logIn()" />
      </section>
      <section *ngIf="!passwordResetLinkOpen && forgotPasswordOpen" class="login-card forgot-password-card" aria-labelledby="forgot-password-title">
        <ng-container *ngIf="!forgotPasswordComplete; else forgotPasswordConfirmation">
          <header class="forgot-password-card__header">
            <span class="forgot-password-card__step">STEP {{ forgotPasswordStep }} OF 2</span>
            <h1 id="forgot-password-title">{{ forgotPasswordStep === 2 ? 'Verify Your Email Address' : 'Forgot Password' }}</h1>
            <p *ngIf="forgotPasswordStep === 1">Enter the Agent Code provided to you. We’ll verify it before you continue.</p>
            <p *ngIf="forgotPasswordStep === 2">Enter the email address associated with your Agent Code.</p>
          </header>

          <div *ngIf="forgotPasswordStep === 1" class="forgot-password-card__field">
            <label for="reset-agent-code">Agent Code</label>
            <input id="reset-agent-code" [(ngModel)]="resetAgentCode" autocomplete="off" placeholder="Input your Agent Code" (keydown.enter)="continueForgotPassword()">
          </div>

          <div *ngIf="forgotPasswordStep === 2" class="forgot-password-card__field">
            <label for="reset-email">Email Address</label>
            <input id="reset-email" [(ngModel)]="resetEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com" [attr.aria-invalid]="resetEmailError ? 'true' : null" [attr.aria-describedby]="resetEmailError ? 'reset-email-error' : 'reset-email-help'" (keydown.enter)="confirmForgotPassword()">
            <p *ngIf="resetEmailError" id="reset-email-error" class="forgot-password-card__error" role="alert">{{ resetEmailError }}</p>
            <p *ngIf="!resetEmailError" id="reset-email-help" class="forgot-password-card__hint">Use the email address linked to your Agent Code.</p>
          </div>

          <div class="forgot-password-card__actions">
            <app-button *ngIf="forgotPasswordStep === 1" label="Continue" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" [disabled]="!resetAgentCode.trim()" (clicked)="continueForgotPassword()" />
            <ng-container *ngIf="forgotPasswordStep === 2">
              <app-button label="Confirm" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" [disabled]="!resetEmail.trim()" (clicked)="confirmForgotPassword()" />
              <app-button label="Back" [variant]="buttonVariant.Subtle" [size]="buttonSize.Large" (clicked)="backToAgentCode()" />
            </ng-container>
          </div>
          <button *ngIf="forgotPasswordStep === 1" type="button" class="forgot-password-card__back-to-login" (click)="closeForgotPassword()">Back to Login</button>
        </ng-container>

        <ng-template #forgotPasswordConfirmation>
          <div class="forgot-password-card__confirmation" aria-live="polite">
            <img class="forgot-password-card__confirmation-illustration" src="assets/forgot-password-illustration.gif" alt="" aria-hidden="true">
            <h1 id="forgot-password-title">Temporary Password Sent</h1>
            <p>If the information matches an account, password reset instructions will be sent to the email address on file. Please check your inbox.</p>
          </div>
          <app-button class="forgot-password-card__sign-in" label="Back to Login" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" (clicked)="closeForgotPassword()" />
        </ng-template>
      </section>
      <section *ngIf="passwordResetLinkOpen" class="login-card forgot-password-card password-reset-link-card" aria-labelledby="password-reset-link-title">
        <header class="forgot-password-card__header">
          <h1 id="password-reset-link-title">Secure Your Account</h1>
          <p>Choose a new password for your EWApp account.</p>
        </header>
        <div class="forgot-password-card__field">
          <label for="new-password">New Password</label>
          <div class="login-card__password">
            <input id="new-password" [type]="newPasswordVisible ? 'text' : 'password'" [(ngModel)]="newPassword" autocomplete="new-password" placeholder="Enter a new password" [attr.aria-invalid]="passwordResetError ? 'true' : null" [attr.aria-describedby]="passwordResetError ? 'password-reset-error password-policy-help' : 'password-policy-help'" (ngModelChange)="validatePasswordReset()" (keydown.enter)="submitPasswordReset()">
            <button type="button" [attr.aria-label]="newPasswordVisible ? 'Hide new password' : 'Show new password'" (click)="newPasswordVisible = !newPasswordVisible"><span class="material-symbols-rounded" aria-hidden="true">{{ newPasswordVisible ? 'visibility_off' : 'visibility' }}</span></button>
          </div>
        </div>
        <div class="forgot-password-card__field">
          <label for="confirm-new-password">Re-type Password</label>
          <div class="login-card__password">
            <input id="confirm-new-password" [type]="confirmPasswordVisible ? 'text' : 'password'" [(ngModel)]="confirmNewPassword" autocomplete="new-password" placeholder="Re-type your new password" [attr.aria-invalid]="passwordResetError ? 'true' : null" [attr.aria-describedby]="passwordResetError ? 'password-reset-error password-policy-help' : 'password-policy-help'" (ngModelChange)="validatePasswordReset()" (keydown.enter)="submitPasswordReset()">
            <button type="button" [attr.aria-label]="confirmPasswordVisible ? 'Hide confirmation password' : 'Show confirmation password'" (click)="confirmPasswordVisible = !confirmPasswordVisible"><span class="material-symbols-rounded" aria-hidden="true">{{ confirmPasswordVisible ? 'visibility_off' : 'visibility' }}</span></button>
          </div>
          <p *ngIf="passwordResetError" id="password-reset-error" class="forgot-password-card__error" role="alert">{{ passwordResetError }}</p>
          <p id="password-policy-help" class="forgot-password-card__hint">Your password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and one of these special characters: @ . ! -.</p>
        </div>
        <div class="forgot-password-card__actions">
          <app-button label="Update Password" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" [disabled]="!newPassword || !confirmNewPassword" (clicked)="submitPasswordReset()" />
        </div>
      </section>
      <div *ngIf="passwordResetLoading" class="password-reset-status-backdrop" role="dialog" aria-modal="true" aria-labelledby="password-reset-loading-title" aria-describedby="password-reset-loading-copy">
        <section class="password-reset-status-card password-reset-status-card--loading">
          <img class="password-reset-status-card__spinner" src="assets/password-update-spinner.svg" alt="" aria-hidden="true">
          <div class="password-reset-status-card__content">
            <h2 id="password-reset-loading-title">Updating Password...</h2>
            <p id="password-reset-loading-copy">Please wait. Do not close the browser or switch to a different tab for now.</p>
          </div>
        </section>
      </div>
      <div *ngIf="passwordResetComplete" class="password-reset-status-backdrop" role="dialog" aria-modal="true" aria-labelledby="password-reset-success-title" aria-describedby="password-reset-success-copy">
        <section class="password-reset-status-card password-reset-status-card--success">
          <img class="password-reset-status-card__success-illustration" src="assets/password-updated-success.gif" alt="" aria-hidden="true">
          <div class="password-reset-status-card__content">
            <h2 id="password-reset-success-title">Password Updated!</h2>
            <p id="password-reset-success-copy">Your password has been updated. Sign in using your new password to access EWApp.</p>
          </div>
          <app-button label="Back to Login" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" (clicked)="finishPasswordResetLink()" />
        </section>
      </div>
      <div *ngIf="passwordResetOldPassword" class="password-reset-status-backdrop" role="dialog" aria-modal="true" aria-labelledby="password-reset-old-title" aria-describedby="password-reset-old-copy">
        <section class="password-reset-status-card password-reset-status-card--old-password">
          <span class="password-reset-status-card__old-icon material-symbols-rounded" aria-hidden="true">lock_reset</span>
          <div class="password-reset-status-card__content">
            <h2 id="password-reset-old-title">Password Already Used</h2>
            <p id="password-reset-old-copy">You can’t reuse your temporary password. Choose a different password to continue.</p>
          </div>
          <app-button label="Got it" [variant]="buttonVariant.Secondary" [size]="buttonSize.Large" (clicked)="dismissOldPasswordNotice()" />
        </section>
      </div>
      <footer class="login-footer-group">
        <div class="login-support"><p>Having trouble logging in? Please contact</p><div><span>✉ AgencySupport@ewageas.com.ph</span><span>✉ BancaSupport@ewageas.com.ph</span></div></div>
        <div class="login-footer"><span>Copyright © 2026. East West Ageas Life Insurance Corporation.</span><span>Legal&nbsp; · &nbsp;Privacy&nbsp; · &nbsp;Security</span></div>
      </footer>
    </main>
    <app-section-message
      *ngIf="activityRecorded"
      class="activity-toast"
      appearance="success"
      icon="check_circle"
      [description]="activityToastMessage"
    />
    <section *ngIf="draftSiQuickQuoteOpen" class="draft-si-quick-quote" role="dialog" aria-modal="true" aria-labelledby="draft-si-quick-quote-title">
      <button type="button" class="draft-si-quick-quote__backdrop" aria-label="Close Draft Sales Illustration" (click)="closeDraftSiQuickQuote()"></button>
      <div class="draft-si-quick-quote__panel">
        <button type="button" class="draft-si-quick-quote__close material-symbols-rounded" aria-label="Close Draft Sales Illustration" (click)="closeDraftSiQuickQuote()">close</button>
        <div class="draft-si-quick-quote__amount-card">
          <div class="draft-si-quick-quote__amount-content">
            <strong>Amount to Pay</strong>
            <p><b>₱63,652.50</b><span>/ ANNUALLY</span></p>
            <em>The amount is payable in 10 years.</em>
            <small>This quote serves as an estimate, including rider premiums, but is subject to potential changes based on underwriting assessment and applicable taxes.</small>
          </div>
          <img src="assets/icons/draft-si-note.svg" alt="" aria-hidden="true">
        </div>
        <div class="draft-si-quick-quote__content">
          <h2 id="draft-si-quick-quote-title">Generate Draft Sales Illustration</h2>
          <p>Generate a draft sales illustration quickly. This will serve as an estimate, based on standard industry rating, and is subject to changes based on submitted information. These results are not part of the contract.</p>
          <app-button label="Generate Draft SI" [variant]="buttonVariant.Primary" [size]="buttonSize.Medium" (clicked)="openDraftSiProductPicker()" />
      </div>
      </div>
    </section>
    <div *ngIf="draftSiContactUpdateOpen" class="draft-si-contact-update-overlay" role="presentation">
      <section class="draft-si-contact-update-modal" role="dialog" aria-modal="true" aria-labelledby="draft-si-contact-update-title" aria-describedby="draft-si-contact-update-description">
        <button type="button" class="draft-si-contact-update-modal__close" aria-label="Close update individual information" (click)="closeDraftSiContactUpdate()"><img src="assets/icons/update-info-close.png" alt=""></button>
        <div class="draft-si-contact-update-modal__icons" aria-hidden="true">
          <span><img src="assets/icons/update-info-person.png" alt=""></span>
          <span><img src="assets/icons/update-info-document.png" alt=""></span>
          <span><img src="assets/icons/update-info-alert.png" alt=""></span>
        </div>
        <h2 id="draft-si-contact-update-title">Update Individual Information</h2>
        <p id="draft-si-contact-update-description">We have detected incomplete details. Incomplete info may impact underwriting success. Ensure that all the provided information is accurate and correct.</p>
        <button type="button" class="draft-si-contact-update-modal__continue" (click)="continueDraftSiContactUpdate()">Continue to Update</button>
      </section>
    </div>
    <div class="confirmation-overlay product-picker-overlay" *ngIf="draftSiProductPickerOpen" (click)="closeDraftSiProductPicker()" role="presentation">
      <section class="product-picker" role="dialog" aria-modal="true" aria-labelledby="draft-si-product-picker-title" (click)="$event.stopPropagation()">
        <header><h2 id="draft-si-product-picker-title">Choose Product</h2><p>Select the insurance plan that best suits your needs. Limit your selection to one plan only.</p></header>
        <nav aria-label="Product category"><button type="button" [class.is-active]="draftSiProductCategory === 'all'" (click)="draftSiProductCategory = 'all'">All Products</button><button type="button" [class.is-active]="draftSiProductCategory === 'traditional'" (click)="draftSiProductCategory = 'traditional'">Traditional</button><button type="button" [class.is-active]="draftSiProductCategory === 'variable'" (click)="draftSiProductCategory = 'variable'">Variable Unit Link</button></nav>
        <div class="product-picker__grid"><button *ngFor="let product of draftSiProducts" type="button" [class.is-selected]="draftSiSelectedProduct === product" (click)="draftSiSelectedProduct = product"><span class="product-picker__icon"><img src="assets/product-icon.svg" alt=""></span><span>{{ product }}</span><span *ngIf="draftSiSelectedProduct === product" class="material-symbols-rounded" aria-hidden="true">check_circle</span></button></div>
        <footer><button type="button" class="proposal-button proposal-button--neutral-outline" (click)="closeDraftSiProductPicker()">Cancel</button><button type="button" class="proposal-button proposal-button--primary" [disabled]="!draftSiSelectedProduct" (click)="continueDraftSiProductPicker()">Continue</button></footer>
      </section>
    </div>
    <lam-draft-si-flow *ngIf="selectedLead && draftSiOpen" [lead]="selectedLead" [startStep]="draftSiFlowStartStep" [standaloneDraft]="draftSiFromSidebar" (closed)="closeDraftSi()" (draftSiGenerated)="recordDraftSiGenerated()" (proposalRequested)="openDraftProposalInfo()" (activityRequested)="openContactDrawer()" (contactRequired)="openContactDrawer()" (appointmentRequired)="openContactDrawer()" />
    <lam-proposal-flow *ngIf="selectedLead && proposalOpen" [lead]="selectedLead" [routeTab]="activeRecordTab" [editMode]="leadInfoEditMode" [submittedApplicationContext]="applicationLeadContext" [convertApplicationApiErrorMode]="convertApplicationApiErrorMode" (routeTabChange)="navigateToRecordTab($event)" (leadInfoSaved)="recordLeadInfoUpdated()" (csaCreated)="recordCsaCreated()" (siGenerated)="recordSiGenerated()" (proposalSaved)="recordProposalCreated()" (applicationConverted)="recordApplicationConverted()" (contactRequired)="openContactDrawer()" (csaContactRequired)="openContactDrawerForCsa()" (appointmentRequired)="openContactDrawer()" (activityRequested)="openContactDrawer()" (underwritingSubmitted)="viewSubmittedApplication($event)" (closed)="closeLead()" />
    <section *ngIf="newLeadOpen" class="new-lead-modal" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
      <div class="new-lead-modal__backdrop" aria-hidden="true"></div>
      <div class="new-lead-modal__panel">
        <header><h2 id="new-lead-title">Create New Lead</h2><button type="button" class="new-lead-modal__close" aria-label="Close New Lead" (click)="newLeadOpen = false">×</button></header>
        <ng-container *ngIf="newLeadStep === 1; else sourceStep">
        <p class="new-lead-modal__intro">Step 1: Please fill up customer information</p>
        <p class="new-lead-modal__required"><span class="material-symbols-rounded" aria-hidden="true">info</span>All fields are required unless stated “Optional”</p>
        <div class="new-lead-form">
          <label class="new-lead-form__static-select"><span>Title</span><select [value]="newLeadTitle" disabled><option>Mr.</option><option>Ms.</option><option>Mrs.</option></select></label>
          <label class="new-lead-form__static-select"><span>Gender</span><select [value]="newLeadGender" disabled><option>Male</option><option>Female</option></select></label>
          <label class="new-lead-form__full"><span>First Name</span><input [(ngModel)]="newLeadFirstName" /></label>
          <label class="new-lead-form__full"><span>Middle Name</span><input [(ngModel)]="newLeadMiddleName" disabled /><span class="new-lead-form__checkbox"><input type="checkbox" [checked]="true" aria-disabled="true" tabindex="-1" (click)="$event.preventDefault()" /> I do not have middle name <span class="material-symbols-rounded" aria-hidden="true">help</span></span></label>
          <label class="new-lead-form__full"><span>Last name</span><input [(ngModel)]="newLeadLastName" /></label>
          <label class="new-lead-form__suffix"><span>Suffix (Optional)</span><select [value]="newLeadSuffix" disabled><option>None</option><option>Jr.</option><option>Sr.</option></select></label>
          <label><span>Birth Date</span><input type="date" [value]="newLeadBirthDate" readonly /></label>
          <div class="new-lead-form__section"><h3>Contact Information</h3><a href="#" (click)="$event.preventDefault()">Why do we need this?</a></div>
          <label class="new-lead-form__full"><span>Mobile Number</span><input [value]="newLeadMobileNumber" readonly /><small>It can be used for essential communication related to their insurance coverage only.</small></label>
          <label class="new-lead-form__full"><span>Email Address</span><input type="email" [value]="newLeadEmailAddress" readonly /><small>It can be used to set up the customer portal account later, receive important updates to their policy, exclusive features, and many more.</small></label>
        </div>
        <footer><app-button class="new-lead-modal__continue" label="Continue" rightIcon="chevron_right" [variant]="buttonVariant.Primary" [size]="buttonSize.Medium" [disabled]="!newLeadFirstName.trim() || !newLeadLastName.trim()" (clicked)="newLeadStep = 2" /></footer>
        </ng-container>
        <ng-template #sourceStep>
          <p class="new-lead-modal__intro">Step 2: Please input source of lead</p>
          <p class="new-lead-modal__required"><span class="material-symbols-rounded" aria-hidden="true">info</span>All fields are required unless stated “Optional”</p>
          <ng-container *ngIf="userType === 'Agency'; else bancaSourceFields">
            <label class="new-lead-source new-lead-source--readonly"><span>Source of Lead</span><input class="new-lead-source__input" [value]="newLeadSource" disabled /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Product Interested</span><tdx-field-control name="new-lead-product" ariaLabel="Product Interested" [label]="newLeadProduct" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source"><span>Store Name</span><tdx-field-control name="new-lead-store" ariaLabel="Store Name" [label]="agencyStoreName" [value]="agencyStoreName" [options]="agencyStoreOptions" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Store ID</span><input class="new-lead-source__input" [value]="agencyStoreId" disabled /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Unit Name</span><input class="new-lead-source__input" [value]="agencyUnitName" disabled /></label>
          </ng-container>
          <ng-template #bancaSourceFields>
          <label class="new-lead-source"><span>Source of Lead</span><tdx-field-control name="new-lead-source" ariaLabel="Source of Lead" label="Select your source of lead" [value]="newLeadSource" [options]="newLeadSourceOptions" trailingIcon="keyboard_arrow_down" [fluid]="true" (valueChange)="newLeadSource = $event" /></label>
          <ng-container *ngIf="newLeadSource === 'Self-Generated Lead'">
            <label class="new-lead-source new-lead-source--readonly"><span>Product Interested</span><tdx-field-control name="new-lead-product" ariaLabel="Product Interested" [label]="newLeadProduct" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Manual Source</span><tdx-field-control name="new-lead-manual-source" ariaLabel="Manual Source" [label]="newLeadManualSource" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source"><span>Store Name</span><tdx-field-control name="new-lead-store" ariaLabel="Store Name" [label]="newLeadStoreName" [value]="newLeadStoreName" [options]="newLeadStoreOptions" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Store ID</span><input class="new-lead-source__input" [value]="newLeadStoreId" disabled /></label>
          </ng-container>
          <ng-container *ngIf="newLeadSource !== 'Self-Generated Lead'">
            <label class="new-lead-source new-lead-source--readonly"><span>Product Interested</span><tdx-field-control name="new-lead-product" ariaLabel="Product Interested" [label]="newLeadProduct" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source"><span>Referral Date</span><input class="new-lead-source__input" type="date" [value]="newLeadReferralDate" readonly /></label>
            <label class="new-lead-source"><span>Referrer ID</span><input class="new-lead-source__input" [value]="newLeadReferrerId" readonly /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Referrer Name</span><input class="new-lead-source__input" [value]="newLeadReferrerName" disabled /></label>
            <label class="new-lead-source"><span>Store Name</span><tdx-field-control name="new-lead-store" ariaLabel="Store Name" [label]="newLeadStoreName" [value]="newLeadStoreName" [options]="newLeadStoreOptions" trailingIcon="keyboard_arrow_down" [fluid]="true" /></label>
            <label class="new-lead-source new-lead-source--readonly"><span>Store ID</span><input class="new-lead-source__input" [value]="newLeadStoreId" disabled /></label>
          </ng-container>
          </ng-template>
          <footer class="new-lead-modal__step-actions"><app-button label="Back" leftIcon="chevron_left" [variant]="buttonVariant.Primary" [emphasis]="buttonEmphasis.Outline" [size]="buttonSize.Medium" (clicked)="newLeadStep = 1" /><app-button label="Create Lead" rightIcon="chevron_right" [variant]="buttonVariant.Primary" [size]="buttonSize.Medium" [disabled]="!newLeadSource" (clicked)="openNewLeadConfirmation()" /></footer>
        </ng-template>
      </div>
    </section>
    <div *ngIf="newLeadConfirmation" class="confirmation-overlay" role="presentation">
      <section class="confirmation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="save-lead-title" aria-describedby="save-lead-description">
        <h2 id="save-lead-title">Save Lead Information</h2>
        <p id="save-lead-description">Kindly ensure that all the provided information is accurate and correct before saving Lead Information.</p>
        <footer>
          <app-button label="Cancel" [variant]="buttonVariant.Primary" [emphasis]="buttonEmphasis.Outline" [size]="buttonSize.Small" (clicked)="newLeadConfirmation = false" />
          <app-button label="Proceed" [variant]="buttonVariant.Primary" [size]="buttonSize.Small" (clicked)="confirmCreateNewLead()" />
        </footer>
      </section>
    </div>
    <div *ngIf="duplicateLeadConfirmation" class="confirmation-overlay duplicate-lead-overlay" role="presentation">
      <section class="confirmation-dialog duplicate-lead-dialog" role="alertdialog" aria-modal="true" aria-labelledby="existing-lead-title" aria-describedby="existing-lead-description">
        <button type="button" class="duplicate-lead-dialog__close" aria-label="Close duplicate lead warning" (click)="duplicateLeadConfirmation = false">
          <span class="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
        <img class="duplicate-lead-dialog__warning" src="assets/icons/duplicate-lead-warning.svg" alt="" aria-hidden="true" />
        <h2 id="existing-lead-title">This customer already exists</h2>
        <p id="existing-lead-description">A lead with the same customer details already exists in your account.<br />You can still create a new lead.</p>
        <footer class="duplicate-lead-dialog__actions">
          <app-button label="View Existing Lead" [variant]="buttonVariant.Primary" [emphasis]="buttonEmphasis.Outline" [size]="buttonSize.Medium" (clicked)="viewExistingLead()" />
          <app-button label="Create New Lead" [variant]="buttonVariant.Primary" [size]="buttonSize.Medium" (clicked)="confirmDuplicateLead()" />
        </footer>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent implements AfterViewInit {
  apiErrorMode = false;
  searchErrorMode = false;
  drawerLoadingErrorMode = false;
  convertApplicationApiErrorMode = false;
  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly buttonSize = TdxButtonSize;
  readonly tagVariant = TdxTagVariant;
  readonly tagEmphasis = TdxTagEmphasis;
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
  forgotPasswordOpen = false;
  passwordResetLinkOpen = false;
  passwordResetLoading = false;
  passwordResetComplete = false;
  passwordResetOldPassword = false;
  newPassword = '';
  confirmNewPassword = '';
  passwordResetError = '';
  passwordResetSubmitted = false;
  readonly demoTemporaryPassword = 'opW4Y.Z4';
  private demoTemporaryPasswordIssued = false;
  private demoUpdatedPassword = '';
  private readonly demoPreviousPassword = 'opW4Y.Z4';
  private passwordResetTimer?: ReturnType<typeof setTimeout>;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  forgotPasswordStep: 1 | 2 = 1;
  forgotPasswordComplete = false;
  resetAgentCode = '';
  resetEmail = '';
  resetEmailError = '';
  userType: 'Agency' | 'Banca' = this.readUserType();
  passwordVisible = false;
  newLeadStep: 1 | 2 = 1;
  newLeadConfirmation = false;
  duplicateLeadConfirmation = false;
  newLeadTitle = 'Mr.';
  newLeadGender = 'Male';
  newLeadFirstName = '';
  newLeadMiddleName = '';
  newLeadNoMiddleName = false;
  newLeadLastName = '';
  newLeadSuffix = 'None';
  newLeadBirthDate = '1989-01-05';
  newLeadMobileNumber = '+63 9226789012';
  newLeadEmailAddress = 'client@email.com';
  newLeadSource = 'Self-Generated Lead';
  newLeadProduct = 'Dream Builder';
  newLeadManualSource = 'Family and Friends';
  newLeadReferralDate = new Date().toISOString().slice(0, 10);
  newLeadReferrerId = '54321';
  newLeadReferrerName = 'Juan Dela Cruz';
  newLeadStoreName = '595 THE FORT-BGC CORPORATE CENTER';
  newLeadStoreId = 'RBG0380';
  readonly agencyStoreName = '198 G. ARANETA AVENUE';
  readonly agencyStoreId = '384768653';
  readonly agencyUnitName = 'PURPLE BLAZE_JDELACRUZ';
  readonly newLeadSourceOptions: readonly TdxFieldControlOption[] = [
    'Alternative Distribution', 'CBG (Consumer Banking Group)', 'CLC (Consumer Lending Cluster)',
    'PBG (Partnership Banking Group)', 'Self-Generated Lead'
  ].map((label) => ({ label, value: label }));
  readonly newLeadProductOptions: readonly TdxFieldControlOption[] = [
    { label: 'Dream Builder', value: 'Dream Builder' }
  ];
  readonly newLeadManualSourceOptions: readonly TdxFieldControlOption[] = [
    'Family and Friends', 'Referral', 'Digital'
  ].map((label) => ({ label, value: label }));
  readonly newLeadStoreOptions: readonly TdxFieldControlOption[] = [
    { label: '595 THE FORT-BGC CORPORATE CENTER', value: '595 THE FORT-BGC CORPORATE CENTER' }
  ];
  readonly agencyStoreOptions: readonly TdxFieldControlOption[] = [
    { label: '198 G. ARANETA AVENUE', value: '198 G. ARANETA AVENUE' }
  ];
  draftSiOpen = false;
  draftSiQuickQuoteOpen = false;
  draftSiContactUpdateOpen = false;
  draftSiProductPickerOpen = false;
  draftSiFlowStartStep: 1 | 2 = 1;
  draftSiFromSidebar = false;
  draftSiSelectedProduct = '';
  draftSiProductCategory: 'all' | 'traditional' | 'variable' = 'all';
  readonly draftSiProducts = ['Dream Builder', 'Future Assure', 'Future Assure Max (Peso)', 'Future Assure Max (US Dollar)', 'Future Assure Regular Pay', 'Life Essentials', 'Sure Start'];
  proposalOpen = false;
  contactDrawerOpen = false;
  csaContactRequirementOpen = false;
  activeRecordTab: LeadRecordTab = 'info';
  leadInfoEditMode = false;
  applicationLeadContext = false;
  proposalGeneratorInitialView: 'landing' | 'recommendations' = 'landing';
  activityRecorded = false;
  activityToastMessage = 'Your activity has been recorded.';
  private pendingHighlightLeadId: string | null = null;
  private standaloneDraftLeadCreated = false;
  private preserveSidebarOnProposalEntry = false;
  private activityToastTimer?: ReturnType<typeof setTimeout>;
  private activityToastDismissTimer?: ReturnType<typeof setTimeout>;

  get showApplications(): boolean {
    return this.navigation.activeDestination() === 'applications';
  }

  get showProposalGenerator(): boolean {
    return this.navigation.activeDestination() === 'proposal-generator';
  }

  constructor() {
    this.navigation.lcamBoardRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeLead());
    this.navigation.applicationsRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openApplicationsPage());
    this.navigation.proposalGeneratorRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openProposalGenerator());
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationEnd) this.openRoute(event.urlAfterRedirects);
      });
    this.destroyRef.onDestroy(() => {
      if (this.activityToastTimer) clearTimeout(this.activityToastTimer);
      if (this.activityToastDismissTimer) clearTimeout(this.activityToastDismissTimer);
      if (this.passwordResetTimer) clearTimeout(this.passwordResetTimer);
    });
  }

  ngAfterViewInit(): void {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const isApiErrorScenario = this.router.url.startsWith('/lcam/') && this.router.url.endsWith('-api-error');
    const isProposalGeneratorRoute = this.router.url === '/proposals' || this.router.url === '/proposals/recommended' || this.router.url === '/lcam/proposal/recommended';
    const isPasswordResetLinkRoute = this.router.url.startsWith('/reset-password');
    if (navigationEntry?.type === 'reload' && !isApiErrorScenario && !isProposalGeneratorRoute && !isPasswordResetLinkRoute) {
      void this.router.navigate(['/lcam']);
      return;
    }
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

  retryApiError(): void {
    if (this.router.url === '/lcam/board-loading-api-error' || this.router.url === '/lcam/page-search-api-error') return;
    void this.router.navigate(['/lcam']);
  }

  retryDrawerLoading(): void {
    void this.router.navigate(this.selectedLead ? ['/lcam', this.selectedLead.leadId] : ['/lcam']);
  }

  openApplicationLead(lead: LeadCardData): void {
    this.openLead(lead);
    this.applicationLeadContext = true;
  }

  openNewLead(): void {
    this.newLeadStep = 1;
    this.newLeadSource = 'Self-Generated Lead';
    this.newLeadOpen = true;
  }

  openDraftSiQuickQuote(): void {
    this.draftSiFromSidebar = true;
    this.standaloneDraftLeadCreated = false;
    this.draftSiProductPickerOpen = false;
    this.draftSiQuickQuoteOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  closeDraftSiQuickQuote(): void {
    this.draftSiQuickQuoteOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  openDraftSiContactUpdate(): void {
    this.draftSiContactUpdateOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  closeDraftSiContactUpdate(): void {
    this.draftSiContactUpdateOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  continueDraftSiContactUpdate(): void {
    this.draftSiContactUpdateOpen = false;
    this.editLeadInfo();
  }

  openDraftSiProductPicker(): void {
    this.draftSiQuickQuoteOpen = false;
    this.draftSiProductPickerOpen = true;
    this.draftSiSelectedProduct = '';
    this.draftSiFlowStartStep = 1;
    this.draftSiProductCategory = 'all';
    this.changeDetectorRef.markForCheck();
  }

  closeDraftSiProductPicker(): void {
    this.draftSiProductPickerOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  continueDraftSiProductPicker(): void {
    if (!this.draftSiSelectedProduct) return;
    if (!this.selectedLead) {
      this.selectedLead = this.dashboard?.boards.flatMap((board) => board.leads)[0] ?? null;
    }
    if (!this.selectedLead) return;
    this.draftSiProductPickerOpen = false;
    this.draftSiFlowStartStep = 2;
    this.draftSiOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  @HostListener('document:keydown.escape')
  closeDraftSiQuickQuoteOnEscape(): void {
    if (this.draftSiQuickQuoteOpen) this.closeDraftSiQuickQuote();
  }

  logOut(): void {
    this.loggedIn = false;
    this.writeLoginState(false);
    this.selectedLead = null;
    this.newLeadOpen = false;
  }

  openForgotPassword(event: Event): void {
    event.preventDefault();
    this.forgotPasswordOpen = true;
    this.forgotPasswordStep = 1;
    this.forgotPasswordComplete = false;
    this.resetAgentCode = '';
    this.resetEmail = '';
    this.resetEmailError = '';
  }

  continueForgotPassword(): void {
    if (!this.resetAgentCode.trim()) return;

    this.resetAgentCode = this.resetAgentCode.trim();
    this.resetEmail = '';
    this.resetEmailError = '';
    this.forgotPasswordStep = 2;
  }

  backToAgentCode(): void {
    this.forgotPasswordStep = 1;
    this.resetAgentCode = '';
    this.resetEmail = '';
    this.resetEmailError = '';
  }

  validatePasswordReset(): void {
    if (!this.passwordResetSubmitted) return;
    if (!this.isPasswordFormatValid(this.newPassword)) {
      this.passwordResetError = 'Your password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and one of these special characters: @ . ! -.';
      return;
    }
    if (this.confirmNewPassword && this.newPassword !== this.confirmNewPassword) {
      this.passwordResetError = 'The passwords don’t match. Check both fields and try again.';
      return;
    }
    this.passwordResetError = '';
  }

  submitPasswordReset(): void {
    this.passwordResetSubmitted = true;
    this.validatePasswordReset();
    if (!this.newPassword || !this.confirmNewPassword) {
      this.passwordResetError = 'Enter and confirm your new password.';
      return;
    }
    if (this.passwordResetError || this.newPassword !== this.confirmNewPassword) {
      if (!this.passwordResetError) this.passwordResetError = 'The passwords don’t match. Check both fields and try again.';
      return;
    }
    if (this.newPassword === this.demoPreviousPassword) {
      this.passwordResetOldPassword = true;
      return;
    }
    this.passwordResetLoading = true;
    this.passwordResetTimer = setTimeout(() => this.completePasswordResetUpdate(), 1200);
  }

  completePasswordResetUpdate(): void {
    if (this.passwordResetTimer) clearTimeout(this.passwordResetTimer);
    this.passwordResetTimer = undefined;
    this.passwordResetLoading = false;
    this.passwordResetComplete = true;
    this.changeDetectorRef.markForCheck();
  }

  dismissOldPasswordNotice(): void {
    this.passwordResetOldPassword = false;
    this.passwordResetSubmitted = false;
    this.passwordResetError = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  finishPasswordResetLink(): void {
    this.demoUpdatedPassword = this.newPassword;
    this.passwordResetLinkOpen = false;
    this.passwordResetLoading = false;
    this.passwordResetComplete = false;
    this.passwordResetOldPassword = false;
    this.passwordResetSubmitted = false;
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.passwordResetError = '';
    if (this.passwordResetTimer) clearTimeout(this.passwordResetTimer);
    this.passwordResetTimer = undefined;
    this.loggedIn = false;
    this.agentCode = '';
    this.password = '';
    this.passwordVisible = false;
    this.writeLoginState(false);
    void this.router.navigate(['/lcam']);
  }

  private isPasswordFormatValid(value: string): boolean {
    return value.length >= 8
      && /^[A-Za-z0-9@.!-]+$/.test(value)
      && /[A-Z]/.test(value)
      && /[a-z]/.test(value)
      && /\d/.test(value)
      && /[@.!-]/.test(value);
  }

  validateResetEmail(): void {
    const email = this.resetEmail.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email) {
      this.resetEmailError = '';
      return;
    }
    if (!isValid) {
      this.resetEmailError = 'Please enter a valid email address (e.g., ewageas@domain.com).';
      return;
    }
    this.resetEmailError = '';
  }

  get isResetEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.resetEmail.trim());
  }

  confirmForgotPassword(): void {
    if (!this.isResetEmailValid) {
      this.validateResetEmail();
      return;
    }
    this.resetEmailError = '';
    this.demoTemporaryPasswordIssued = true;
    this.forgotPasswordComplete = true;
  }

  closeForgotPassword(): void {
    this.forgotPasswordOpen = false;
    this.forgotPasswordStep = 1;
    this.forgotPasswordComplete = false;
    this.resetAgentCode = '';
    this.resetEmail = '';
    this.resetEmailError = '';
    this.agentCode = '';
    this.password = '';
    this.passwordVisible = false;
  }

  logIn(): void {
    if (this.demoTemporaryPasswordIssued && this.agentCode.trim().toUpperCase() === 'BANCA123' && this.password === this.demoTemporaryPassword) {
      void this.router.navigate(['/reset-password'], { queryParams: { token: 'demo' } });
      return;
    }
    const demoPassword = this.demoTemporaryPasswordIssued && this.agentCode.trim().toUpperCase() === 'BANCA123' ? this.demoUpdatedPassword : this.agentCode;
    const credentialsMatch = this.password === demoPassword && (this.agentCode === 'Banca' || this.agentCode === 'Agency' || (this.demoTemporaryPasswordIssued && this.agentCode.trim().toUpperCase() === 'BANCA123'));
    if (!credentialsMatch) return;
    this.loggedIn = true;
    this.userType = this.agentCode.trim().toUpperCase() === 'BANCA123' ? 'Banca' : this.agentCode as 'Agency' | 'Banca';
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
    const newLead = this.dashboard?.addNewLead({
      name: [this.newLeadFirstName, this.newLeadMiddleName, this.newLeadLastName].filter(Boolean).join(' '),
      gender: this.newLeadGender as 'Male' | 'Female',
      source: this.newLeadSource || 'Self-Generated Leads'
    });
    if (newLead) {
      this.dashboard?.highlightLeadCard(newLead.id);
      this.dashboard?.startHighlightTimer();
      this.showActivityToast('Lead successfully created');
    }
    this.changeDetectorRef.markForCheck();
  }

  openNewLeadConfirmation(): void {
    this.newLeadConfirmation = true;
    this.changeDetectorRef.markForCheck();
  }

  confirmCreateNewLead(): void {
    const name = [this.newLeadFirstName, this.newLeadMiddleName, this.newLeadLastName].filter(Boolean).join(' ');
    if (this.dashboard?.hasLeadWithName(name)) {
      this.newLeadConfirmation = false;
      this.duplicateLeadConfirmation = true;
      this.changeDetectorRef.markForCheck();
      return;
    }
    this.newLeadConfirmation = false;
    this.createNewLead();
  }

  confirmDuplicateLead(): void {
    this.duplicateLeadConfirmation = false;
    this.createNewLead();
  }

  viewExistingLead(): void {
    const name = [this.newLeadFirstName, this.newLeadMiddleName, this.newLeadLastName].filter(Boolean).join(' ');
    const existingLead = this.dashboard?.findLeadByName(name);
    this.duplicateLeadConfirmation = false;
    this.newLeadOpen = false;
    if (existingLead) {
      this.openLead(existingLead);
      this.openDraftProposalInfo();
    }
    this.changeDetectorRef.markForCheck();
  }

  openDraftSi(): void {
    this.contactDrawerOpen = false;
    this.draftSiFromSidebar = false;
    this.draftSiOpen = true;
    this.navigation.showLeadFlow();
    this.changeDetectorRef.markForCheck();
  }

  closeDraftSi(): void {
    this.draftSiOpen = false;
    if (this.draftSiFromSidebar) {
      this.selectedLead = null;
      this.draftSiFromSidebar = false;
      this.standaloneDraftLeadCreated = false;
      if (this.pendingHighlightLeadId) {
        this.dashboard?.startHighlightTimer();
        this.pendingHighlightLeadId = null;
      }
    }
    this.changeDetectorRef.markForCheck();
  }

  recordDraftSiGenerated(): void {
    if (!this.selectedLead) return;
    if (this.draftSiFromSidebar && !this.standaloneDraftLeadCreated) {
      const newLead = this.dashboard?.addNewLead({
        name: 'Andrei Villanueva',
        gender: 'Male',
        source: 'Self-Generated Leads',
        referrer: 'Draft SI',
        createdFromDraftSi: true
      });
      if (newLead) {
        this.selectedLead = this.dashboard?.recordDraftSiGenerated(newLead.leadId) ?? newLead;
        this.standaloneDraftLeadCreated = true;
        this.pendingHighlightLeadId = newLead.id;
        this.dashboard?.highlightLeadCard(newLead.id);
      }
      this.changeDetectorRef.markForCheck();
      return;
    }
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
    this.navigateToRecordTab('proposals');
    this.changeDetectorRef.markForCheck();
  }

  recordLeadInfoUpdated(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordLeadInfoUpdated(this.selectedLead.leadId) ?? this.selectedLead;
    this.changeDetectorRef.markForCheck();
  }

  recordApplicationConverted(): void {
    if (!this.selectedLead) return;
    this.selectedLead = this.dashboard?.recordSystemActivity(this.selectedLead.leadId, 'Converted to Application') ?? this.selectedLead;
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
    this.leadInfoEditMode = true;
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
    this.csaContactRequirementOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  openContactDrawerForCsa(): void {
    this.contactDrawerOpen = true;
    this.csaContactRequirementOpen = true;
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

  openProposalGenerator(): void {
    this.preserveSidebarOnProposalEntry = true;
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.contactDrawerOpen = false;
    this.leadInfoEditMode = false;
    this.proposalGeneratorInitialView = 'landing';
    this.navigation.activeDestination.set('proposal-generator');
    if (this.router.url !== '/proposals') void this.router.navigate(['/proposals']);
    else this.preserveSidebarOnProposalEntry = false;
    this.changeDetectorRef.markForCheck();
  }

  closeContactDrawer(): void {
    this.contactDrawerOpen = false;
    this.csaContactRequirementOpen = false;
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
    const updatedLead = this.dashboard?.scheduleFollowUpAppointment(event.lead.id, event.appointment, event.rescheduled);
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
    this.dashboard?.highlightLeadCard(updatedLead.id);
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
    const stayInDrawerLoadingScenario = this.router.url === '/lcam/side-drawer-loading-api-error';
    if (this.pendingHighlightLeadId) {
      this.dashboard?.startHighlightTimer();
      this.pendingHighlightLeadId = null;
    }
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.proposalOpen = false;
    this.contactDrawerOpen = false;
    this.activeRecordTab = 'info';
    this.leadInfoEditMode = false;
    this.navigation.activeDestination.set(returnToApplications ? 'applications' : 'lcam-board');
    if (!stayInDrawerLoadingScenario && this.router.url !== '/lcam') void this.router.navigate(['/lcam']);
    this.changeDetectorRef.markForCheck();
  }

  private openRoute(url: string): void {
    const path = url.split(/[?#]/, 1)[0];
    if (path === '/reset-password') {
      if (this.passwordResetTimer) clearTimeout(this.passwordResetTimer);
      this.passwordResetTimer = undefined;
      this.passwordResetLinkOpen = true;
      this.passwordResetLoading = false;
      this.passwordResetComplete = false;
      this.passwordResetOldPassword = false;
      this.passwordResetSubmitted = false;
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.passwordResetError = '';
      this.loggedIn = false;
      this.writeLoginState(false);
      this.forgotPasswordOpen = false;
      this.selectedLead = null;
      this.navigation.activeDestination.set('lcam-board');
      this.changeDetectorRef.markForCheck();
      return;
    }
    this.passwordResetLinkOpen = false;
    if (path === '/proposals' || path === '/proposals/recommended' || path === '/lcam/proposal/recommended') {
      const preserveSidebar = path === '/proposals' && this.preserveSidebarOnProposalEntry;
      this.preserveSidebarOnProposalEntry = false;
      if (!preserveSidebar) this.navigation.setSidebarOpen(false);
      this.selectedLead = null;
      this.draftSiOpen = false;
      this.proposalOpen = false;
      this.contactDrawerOpen = false;
      this.proposalGeneratorInitialView = path === '/proposals' ? 'landing' : 'recommendations';
      this.navigation.activeDestination.set('proposal-generator');
      this.changeDetectorRef.markForCheck();
      return;
    }
    if (path === '/lcam/board-loading-api-error') {
      this.apiErrorMode = true;
      this.searchErrorMode = false;
      this.convertApplicationApiErrorMode = false;
      this.selectedLead = null;
      this.draftSiOpen = false;
      this.proposalOpen = false;
      this.contactDrawerOpen = false;
      this.navigation.activeDestination.set('lcam-board');
      this.changeDetectorRef.markForCheck();
      return;
    }
    if (path === '/lcam/page-search-api-error') {
      this.apiErrorMode = false;
      this.searchErrorMode = true;
      this.convertApplicationApiErrorMode = false;
      this.selectedLead = null;
      this.draftSiOpen = false;
      this.proposalOpen = false;
      this.contactDrawerOpen = false;
      this.navigation.activeDestination.set('lcam-board');
      this.changeDetectorRef.markForCheck();
      return;
    }
    if (path === '/lcam/convert-application-api-error') {
      this.apiErrorMode = false;
      this.searchErrorMode = false;
      this.drawerLoadingErrorMode = false;
      this.convertApplicationApiErrorMode = true;
      this.selectedLead = this.dashboard?.findLeadByLeadId('16719') ?? null;
      this.draftSiOpen = false;
      this.proposalOpen = Boolean(this.selectedLead);
      this.contactDrawerOpen = false;
      this.activeRecordTab = 'proposals';
      this.leadInfoEditMode = false;
      if (this.selectedLead) this.journeyState.unlock(this.selectedLead.leadId, 'proposals');
      this.navigation.showLeadFlow();
      this.changeDetectorRef.markForCheck();
      return;
    }
    if (path === '/lcam/side-drawer-loading-api-error') {
      this.apiErrorMode = false;
      this.searchErrorMode = false;
      this.convertApplicationApiErrorMode = false;
      this.drawerLoadingErrorMode = true;
      this.selectedLead = this.dashboard?.boards.flatMap(board => board.leads)[0] ?? null;
      this.draftSiOpen = false;
      this.proposalOpen = false;
      this.contactDrawerOpen = false;
      this.navigation.activeDestination.set('lcam-board');
      this.changeDetectorRef.markForCheck();
      return;
    }
    this.apiErrorMode = false;
    this.searchErrorMode = false;
    this.drawerLoadingErrorMode = false;
    this.convertApplicationApiErrorMode = false;
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
