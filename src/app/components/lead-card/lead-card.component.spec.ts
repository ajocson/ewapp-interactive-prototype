import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LamComponentsModule } from '../lam-components.module';
import { LeadCardComponent } from './lead-card.component';

describe('LeadCardComponent', () => {
  let fixture: ComponentFixture<LeadCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LamComponentsModule] }).compileComponents();
    fixture = TestBed.createComponent(LeadCardComponent);
    fixture.componentRef.setInput('lead', {
      id: '1',
      name: 'John Mark Doe',
      createdAt: 'Created Feb/01/2026 · 3:00 PM',
      leadType: 'Inactive',
      aging: '1d',
      source: 'Referral',
      tags: [{ label: 'New Lead', tone: 'primary' }]
    });
    fixture.detectChanges();
  });

  it('emits the selected lead when activated', () => {
    const emitted = vi.fn();
    fixture.componentInstance.selected.subscribe(emitted);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(emitted).toHaveBeenCalledWith(fixture.componentInstance.lead);
  });
});
