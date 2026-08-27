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
      leadId: '22742',
      name: 'John Mark Doe',
      gender: 'Male',
      createdAt: 'Created Feb/01/2026 · 3:00 PM',
      createdAtTimestamp: new Date(2026, 1, 1, 15).getTime(),
      leadType: 'Inactive',
      aging: '1d',
      source: 'Referral',
      referrer: 'Olivia Martinez',
      productInterested: 'Dream Builder',
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

  it('prefixes card names with the gender-appropriate title', () => {
    expect(fixture.nativeElement.querySelector('strong').textContent.trim()).toBe('Mr. John Mark Doe');

    fixture.componentRef.setInput('lead', {
      ...fixture.componentInstance.lead,
      name: 'Sarah Ann Thompson',
      gender: 'Female'
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('strong').textContent.trim()).toBe('Ms. Sarah Ann Thompson');
  });

  it('displays the lead ID above the lead name', () => {
    const identity = fixture.nativeElement.querySelector('.lead-card__identity') as HTMLElement;

    expect(identity.firstElementChild?.textContent?.trim()).toBe('22742');
    expect(identity.querySelector('strong')?.textContent?.trim()).toBe('Mr. John Mark Doe');
  });

  it('shows overall and TAT aging with hover tooltips when the board supports TAT aging', () => {
    fixture.componentRef.setInput('lead', {
      ...fixture.componentInstance.lead,
      tatAging: '3d'
    });
    fixture.componentRef.setInput('showTatAging', true);
    fixture.detectChanges();

    const agingItems = fixture.nativeElement.querySelectorAll('.lead-card__aging');
    expect(agingItems).toHaveLength(2);
    expect(agingItems[0].getAttribute('aria-label')).toContain('Total days since Lead Generation');
    expect(agingItems[1].getAttribute('aria-label')).toContain('90-day Active Lead cycle');
    expect(agingItems[1].textContent).toContain('3d');
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

  it('uses red metadata text for the dropped lead state', () => {
    fixture.componentRef.setInput('lead', {
      ...fixture.componentInstance.lead,
      leadType: 'Dropped'
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.lead-card__state--danger').textContent).toContain('Dropped');
  });

  it('hides appointment schedule tags while a lead is parked or dropped', () => {
    fixture.componentRef.setInput('lead', {
      ...fixture.componentInstance.lead,
      leadType: 'Parked',
      tags: [
        { label: 'Appointment Scheduled', tone: 'success' },
        { label: 'Aug 24, 2026 · 3:00-3:30 PM', tone: 'info' }
      ]
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.lead-card__tags').textContent).toContain('Appointment Scheduled');
    expect(fixture.nativeElement.querySelector('.lead-card__tags').textContent).not.toContain('Aug 24, 2026');
  });
});
