import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../../app.module';
import { LeadCardData } from '../../lead-board.model';
import { LeadActivityDrawerComponent } from './lead-activity-drawer.component';

describe('LeadActivityDrawerComponent', () => {
  let fixture: ComponentFixture<LeadActivityDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(LeadActivityDrawerComponent);
    fixture.componentRef.setInput('lead', createLead());
    fixture.detectChanges();
  });

  it('preserves the recorded oldest-to-newest journey for every activity group', () => {
    expect(fixture.componentInstance.salesActivities.map((activity) => activity.label)).toEqual([
      'Contacted',
      'Appointment Scheduled',
      'Appointment Canceled'
    ]);
    expect(fixture.componentInstance.systemActivities.map((activity) => activity.label)).toEqual([
      'New Lead',
      'Draft SI Generated'
    ]);
  });
});

function createLead(): LeadCardData {
  return {
    id: 'lead-1',
    name: 'Sarah Ann Thompson',
    gender: 'Female',
    createdAt: 'Feb/05/2026 ∙ 2:00 PM',
    createdAtTimestamp: 1,
    leadType: 'Active',
    aging: '1d',
    source: 'LMS (ETB)',
    referrer: 'Maxwell Anderson',
    productInterested: 'Dream Builder',
    tags: [{ label: 'Appointment Set', tone: 'success' }],
    activities: [
      activity('contacted', 'sales', 'Contacted', 20),
      activity('created', 'system', 'New Lead', 10),
      activity('scheduled', 'sales', 'Appointment Scheduled', 5),
      activity('draft', 'system', 'Draft SI Generated', 40),
      activity('cancelled', 'sales', 'Appointment Canceled', 50)
    ]
  };
}

function activity(
  id: string,
  category: 'sales' | 'system',
  label: string,
  occurredAtTimestamp: number
) {
  return {
    id,
    category,
    label,
    dateLabel: 'August 24, 2026',
    timeLabel: '8:02 PM',
    occurredAtTimestamp
  };
}
