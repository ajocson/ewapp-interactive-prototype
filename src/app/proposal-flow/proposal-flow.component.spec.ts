import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AppModule } from '../app.module';
import { ProposalFlowComponent } from './proposal-flow.component';

describe('ProposalFlowComponent', () => {
  let fixture: ComponentFixture<ProposalFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(ProposalFlowComponent);
    fixture.componentRef.setInput('lead', {
      id: 'lead-1', leadId: '22742', name: 'John Mark Doe', createdAt: 'Created Feb/03/2026 · 9:15 AM',
      createdAtTimestamp: 0, leadType: 'Inactive', aging: '1d', source: 'Referral',
      referrer: 'Olivia Martinez', productInterested: 'Dream Builder',
      tags: [{ label: 'New Lead', tone: 'primary' }]
    });
    fixture.detectChanges();
  });

  it('starts with the Figma sample data prefilled', () => {
    expect(fixture.componentInstance.stage).toBe('individual-form');
    expect(fixture.componentInstance.firstName).toBe('John Mark');
    expect(fixture.componentInstance.mobileNumber).toBe('171234567');
    expect(fixture.componentInstance.emailAddress).toBe('test@email.com');
  });

  it('moves through the CSA stages to the risk result', () => {
    const component = fixture.componentInstance;

    component.goTo('individual-summary');
    component.goTo('csa-information');
    component.goTo('life-needs');
    component.goTo('calculation');
    component.goTo('assessment');
    component.goTo('risk-profile');
    fixture.detectChanges();

    expect(component.stage).toBe('risk-profile');
    expect(fixture.nativeElement.textContent).toContain('Conservative');
    expect(fixture.nativeElement.textContent).toContain('Create Proposal');
  });

  it('uses the Figma product-selection flow before showing a proposal', () => {
    const component = fixture.componentInstance;
    component.lead = { ...component.lead, tags: [{ label: 'Contacted', tone: 'success' }] };

    component.goTo('risk-profile');
    component.openProductPicker();
    expect(component.productPickerOpen).toBe(true);
    expect(component.proposalCreated).toBe(false);

    component.selectProduct('Dream Builder');
    component.createProposal();
    fixture.detectChanges();

    expect(component.productPickerOpen).toBe(false);
    expect(component.proposalDraftOpen).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Lead Information');
    expect(fixture.nativeElement.textContent).toContain('Insured Information');
    expect((fixture.nativeElement.querySelector('.proposal-draft__save') as HTMLButtonElement).disabled).toBe(false);
    (fixture.nativeElement.querySelectorAll('.proposal-draft__tabs button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Premium Calculation');
    expect(fixture.nativeElement.textContent).toContain('Minimum basic sum insured: ₱250,000');
    component.requestSaveProposal();
    component.confirmSaveProposal();
    fixture.detectChanges();
    expect(component.proposalCreated).toBe(true);
    expect(component.proposalToastMessage).toBe('Proposal saved successfully.');
  });

  it('requires a lead to be contacted before opening the product picker', () => {
    const component = fixture.componentInstance;
    let contactRequired = false;
    component.contactRequired.subscribe(() => contactRequired = true);

    component.openProductPicker();

    expect(contactRequired).toBe(true);
    expect(component.productPickerOpen).toBe(false);
  });

  it('allows a contacted lead to create a proposal after its status moves to an appointment', () => {
    const component = fixture.componentInstance;
    component.lead = {
      ...component.lead,
      tags: [{ label: 'Appointment Scheduled', tone: 'success' }],
      activities: [{
        id: 'contacted',
        category: 'sales',
        label: 'Contacted',
        dateLabel: 'Aug 29, 2026',
        timeLabel: '2:00 PM',
        occurredAtTimestamp: 0
      }]
    };

    component.openProductPicker();

    expect(component.productPickerOpen).toBe(true);
  });

  it('automatically hides the proposal-save toast after four seconds', () => {
    vi.useFakeTimers();
    const component = fixture.componentInstance;

    component.confirmSaveProposal();
    expect(component.proposalToastMessage).toBe('Proposal saved successfully.');

    vi.advanceTimersByTime(4000);
    expect(component.proposalToastMessage).toBe('');
    vi.useRealTimers();
  });

  it('keeps a generated sales illustration available after returning from the viewer', () => {
    const component = fixture.componentInstance;
    component.proposalCreated = true;

    component.generateSalesIllustration();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(component.salesIllustrationGenerated).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Back to Proposal');
    expect(fixture.nativeElement.querySelector('.sales-illustration-viewer__document img')).not.toBeNull();

    component.backToProposal();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(component.salesIllustrationGenerated).toBe(false);
    expect(component.hasGeneratedSalesIllustration).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Sales Illustration_Dream Builder_810000106051');
    expect(fixture.nativeElement.textContent).toContain('Convert to Application');
    expect(fixture.nativeElement.querySelector('.generated-proposal__generate')).toBeNull();
  });

  it('opens the Figma application form after converting a generated proposal', () => {
    const component = fixture.componentInstance;
    component.proposalCreated = true;
    component.hasGeneratedSalesIllustration = true;
    component.lead = {
      ...component.lead,
      tags: [{ label: 'Appointment Scheduled', tone: 'success' }],
      activities: [{
        id: 'presentation-completed',
        category: 'sales',
        label: 'Presentation Completed',
        dateLabel: 'Aug 29, 2026',
        timeLabel: '2:30 PM',
        occurredAtTimestamp: 0
      }]
    };

    component.convertToApplication();
    fixture.detectChanges();

    expect(component.applicationOpen).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Application No. 810000106051');
    expect(fixture.nativeElement.textContent).toContain('Insured Information');
    expect(fixture.nativeElement.textContent).toContain('Government IDs');
    expect(fixture.nativeElement.textContent).toContain('Complete Application (For Demo Pusposes only)');
  });

  it('requires presentation completion before converting, regardless of the current lead stage', () => {
    const component = fixture.componentInstance;
    let appointmentRequired = false;
    component.lead = { ...component.lead, tags: [{ label: 'Meeting', tone: 'success' }] };
    component.appointmentRequired.subscribe(() => appointmentRequired = true);

    component.convertToApplication();

    expect(appointmentRequired).toBe(true);
    expect(component.applicationOpen).toBe(false);
  });

  it('shows the Figma For Upload state after completing the demo application', () => {
    const component = fixture.componentInstance;
    component.applicationOpen = true;

    component.completeApplicationDemo();
    fixture.detectChanges();

    expect(component.applicationComplete).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('For Upload');
    expect(fixture.nativeElement.textContent).toContain('Uploaded Documents');
    expect(fixture.nativeElement.textContent).toContain('Sales Illustration');
    expect(fixture.nativeElement.textContent).toContain('Validated Payment Slip');
    expect(fixture.nativeElement.textContent).toContain('Submit to Underwriting');
    expect(fixture.nativeElement.textContent).toContain('8/9');
  });

  it('submits the completed application to underwriting after confirmation', () => {
    const component = fixture.componentInstance;
    component.applicationOpen = true;
    component.applicationComplete = true;

    component.submitToUnderwriting();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Submitted to Underwriting');

    component.finishUnderwritingSubmission();
    fixture.detectChanges();

    expect(component.applicationUnderwritingSubmitted).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Pending On Underwriting Handling');
    expect(fixture.nativeElement.textContent).toContain('9/9');
    expect(fixture.nativeElement.textContent).not.toContain('Submit to Underwriting');
  });

  it('confirms before adding a profile', () => {
    const component = fixture.componentInstance;

    component.requestAddProfile();
    expect(component.confirmation).toBe('add-profile');

    component.proceedConfirmation();
    expect(component.confirmation).toBeNull();
    expect(component.stage).toBe('csa-information');
  });

  it('confirms before saving the suitability assessment', () => {
    const component = fixture.componentInstance;

    component.requestRiskProfile();
    expect(component.confirmation).toBe('save-csa');

    component.proceedConfirmation();
    expect(component.stage).toBe('risk-profile');
  });

  it('requests the shared activity drawer from the proposal header', () => {
    let activityRequested = false;
    fixture.componentInstance.activityRequested.subscribe(() => activityRequested = true);

    (fixture.nativeElement.querySelector('[aria-controls="lead-activity-drawer"]') as HTMLButtonElement).click();

    expect(activityRequested).toBe(true);
  });

  it('uses the shared navigation state from the proposal header', () => {
    fixture.componentInstance.navigation.setSidebarOpen(true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.navigation.isSidebarOpen()).toBe(false);
  });
});
