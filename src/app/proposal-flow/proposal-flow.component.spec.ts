import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../app.module';
import { ProposalFlowComponent } from './proposal-flow.component';

describe('ProposalFlowComponent', () => {
  let fixture: ComponentFixture<ProposalFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(ProposalFlowComponent);
    fixture.componentRef.setInput('lead', {
      id: 'lead-1', name: 'John Mark Doe', createdAt: 'Created Feb/03/2026 · 9:15 AM',
      createdAtTimestamp: 0, leadType: 'Inactive', aging: '1d', source: 'Referral',
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
