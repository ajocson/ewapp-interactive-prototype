import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../app.module';
import { DraftSiFlowComponent } from './draft-si-flow.component';

describe('DraftSiFlowComponent', () => {
  let fixture: ComponentFixture<DraftSiFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(DraftSiFlowComponent);
    fixture.componentRef.setInput('lead', {
      id: 'lead-1', leadId: '22742', name: 'John Mark Doe', createdAt: 'Created Feb/03/2026 · 9:15 AM',
      createdAtTimestamp: 0, leadType: 'Inactive', aging: '1d', source: 'Referral',
      referrer: 'Olivia Martinez', productInterested: 'Dream Builder',
      tags: [{ label: 'New Lead', tone: 'primary' }]
    });
    fixture.detectChanges();
  });

  it('requires a product selection before continuing', () => {
    const continueButton = fixture.nativeElement.querySelector('.si-footer__actions .flow-button--primary') as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);

    (fixture.nativeElement.querySelector('.product-card') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(continueButton.disabled).toBe(false);
  });

  it('moves the flow state to the generated results', () => {
    fixture.componentInstance.selectedProduct = fixture.componentInstance.products[0];
    fixture.componentInstance.gender = 'Male';
    fixture.componentInstance.dateOfBirth = 'January 01, 1990';
    fixture.componentInstance.paymentPeriod = '5 Pay';
    fixture.componentInstance.paymentFrequency = 'Annual';
    fixture.componentInstance.benefitAmount = '500000';
    fixture.componentInstance.goToStep('results');

    expect(fixture.componentInstance.step).toBe('results');
    expect(fixture.componentInstance.productName).toBe('Dream Builder');
  });

  it('records completion separately from opening Draft SI', () => {
    let generated = false;
    fixture.componentInstance.draftSiGenerated.subscribe(() => generated = true);

    fixture.componentInstance.generateDraftSi();

    expect(fixture.componentInstance.step).toBe('results');
    expect(generated).toBe(true);
  });

  it('requests the Info proposal view from generated results', () => {
    let proposalRequested = false;
    fixture.componentInstance.proposalRequested.subscribe(() => proposalRequested = true);

    fixture.componentInstance.openProposal();

    expect(proposalRequested).toBe(true);
  });
});
