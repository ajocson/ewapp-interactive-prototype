import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../app.module';
import { LeadDetailComponent } from './lead-detail.component';

describe('LeadDetailComponent', () => {
  let fixture: ComponentFixture<LeadDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(LeadDetailComponent);
    fixture.componentRef.setInput('lead', {
      id: 'lead-1',
      leadId: '22742',
      name: 'John Mark Doe',
      createdAt: 'Created Feb/03/2026 · 9:15 AM',
      createdAtTimestamp: new Date(2026, 1, 3, 9, 15).getTime(),
      leadType: 'Inactive',
      aging: '1d',
      source: 'Referral',
      referrer: 'Olivia Martinez',
      productInterested: 'Dream Builder',
      tags: [{ label: 'New Lead', tone: 'primary' }]
    });
    fixture.detectChanges();
  });

  it('renders the selected lead and returns to the board when requested', () => {
    const backRequested = vi.fn();
    fixture.componentInstance.backRequested.subscribe(backRequested);

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('John Mark Doe');
    (fixture.nativeElement.querySelector('.back-link') as HTMLButtonElement).click();

    expect(backRequested).toHaveBeenCalledOnce();
  });

  it('shows an empty state when a non-overview tab is selected', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.lead-tabs__tab') as NodeListOf<HTMLButtonElement>;
    tabs[2].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.detail-card--empty').textContent).toContain('No notes yet');
  });
});
