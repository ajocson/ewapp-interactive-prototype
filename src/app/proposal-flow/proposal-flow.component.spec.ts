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

  it('automatically hides the proposal-save toast after four seconds', () => {
    vi.useFakeTimers();
    const component = fixture.componentInstance;

    component.confirmSaveProposal();
    expect(component.proposalToastMessage).toBe('Proposal saved successfully.');

    vi.advanceTimersByTime(4000);
    expect(component.proposalToastMessage).toBe('');
    vi.useRealTimers();
  });

  it('opens the generated sales-illustration viewer and returns to the saved proposal', () => {
    const component = fixture.componentInstance;

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

  it('opens and closes the activity drawer independently', () => {
    fixture.componentInstance.openDrawer();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.componentInstance.drawerOpen).toBe(true);
    expect(fixture.nativeElement.querySelector('app-stepper')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-tab-group')).not.toBeNull();
    expect(fixture.componentInstance.activitySteps.map(step => step.label)).toEqual(['Contacted', 'Appointment', 'Meeting']);
    expect(fixture.nativeElement.querySelectorAll('app-button').length).toBeGreaterThan(3);

    fixture.componentInstance.handleEscape();
    expect(fixture.componentInstance.drawerOpen).toBe(false);
  });

  it('uses the shared navigation state from the proposal header', () => {
    fixture.componentInstance.navigation.setSidebarOpen(true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.navigation.isSidebarOpen()).toBe(false);
  });
});
