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
      createdAtTimestamp: new Date(2026, 1, 1, 15).getTime(),
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

  it('uses the danger tag treatment for a dropped lead', () => {
    fixture.componentRef.setInput('lead', {
      ...fixture.componentInstance.lead,
      tags: [{ label: 'Drop Lead', tone: 'danger' }]
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.tdx-tag--danger').textContent).toContain(
      'Drop Lead'
    );
  });
});
