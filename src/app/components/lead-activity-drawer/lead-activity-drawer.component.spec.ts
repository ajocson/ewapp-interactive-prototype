import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../../app.module';
import { LeadCardData } from '../../lead-board.model';
import {
  LeadActivityDrawerComponent,
  LeadFollowUpAppointmentCancelledEvent,
  LeadFollowUpAppointmentCompletedEvent,
  LeadFollowUpAppointmentScheduledEvent,
  LeadUpdateRecordedEvent
} from './lead-activity-drawer.component';

describe('LeadActivityDrawerComponent', () => {
  let fixture: ComponentFixture<LeadActivityDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(LeadActivityDrawerComponent);
    fixture.componentRef.setInput('lead', createLead());
    fixture.detectChanges();
  });

  it('lists every activity chronologically within its group and displays saved notes', () => {
    fixture.componentInstance.activeTab = 'timeline';
    fixture.detectChanges();

    expect(fixture.componentInstance.salesActivities.map((activity) => activity.label)).toEqual([
      'New Lead Created',
      'Appointment Scheduled',
      'Contacted',
      'Appointment Canceled'
    ]);
    expect(fixture.componentInstance.systemActivities.map((activity) => activity.label)).toEqual([
      'Draft SI Generated'
    ]);
    expect(fixture.nativeElement.textContent).toContain('Client asked for another appointment.');
    expect(fixture.nativeElement.textContent).toContain('August 25, 2026');
    expect(fixture.nativeElement.textContent).toContain('2:00-2:30 PM');
    expect(fixture.nativeElement.textContent).toContain('Recorded on August 24, 2026 at 8:02 PM');

    const note = fixture.nativeElement.querySelector('.activity-group__notes') as HTMLButtonElement;
    expect(note.textContent).toContain('Client asked for another appointment.');
    expect(note.getAttribute('aria-expanded')).toBe('false');
    note.click();
    fixture.detectChanges();
    expect(note.classList).toContain('is-expanded');
    expect(note.getAttribute('aria-expanded')).toBe('true');
  });

  it('offers only the supported drop reasons', () => {
    expect(fixture.componentInstance.dropReasonOptions.map((option) => option.value)).toEqual([
      'Affordability / Financial Constraints',
      'With Ample Coverage',
      'No Need or Interest',
      'Product or Decision Concerns',
      'Unable to Proceed'
    ]);
    expect(fixture.componentInstance.dropReasonOptions.some((option) => option.value === 'Others')).toBe(false);
  });

  it('shows the same required error state for both appointment metrics', () => {
    fixture.componentInstance.openScheduler();
    fixture.componentInstance.scheduleAppointment();

    expect(fixture.componentInstance.afypDeclarationError).toBe(true);
    expect(fixture.componentInstance.potentialCaseCountError).toBe(true);
  });

  it('hides Banca financial segmentation for manually created leads', () => {
    fixture.componentRef.setInput('userType', 'Banca');
    fixture.componentRef.setInput('lead', { ...createLead(), id: 'manual-test-lead' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('EWB Client Financial Segmentation');
  });

  it('allows reactivation for parked leads but not dropped leads', () => {
    fixture.componentRef.setInput('lead', { ...createLead(), leadType: 'Parked' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drawer-state-summary')?.textContent).toContain('Reactivate Lead');

    fixture.componentRef.setInput('lead', { ...createLead(), leadType: 'Dropped' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drawer-state-summary')?.textContent).not.toContain('Reactivate Lead');

    fixture.componentInstance.reactivateLead();
    expect(fixture.componentInstance.stateConfirmation).toBeNull();
  });

  it('uses the requested stage-specific proposal and presentation labels', () => {
    for (const status of ['Appointment Scheduled', 'Meeting', 'Follow-up']) {
      fixture.componentRef.setInput('lead', {
        ...createLead(),
        tags: [{ label: status, tone: 'success' }]
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.primaryActionLabel).toBe('Generate/View Full Proposal');
    }

    fixture.componentRef.setInput('lead', createLead());
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Presentation Completed');
  });

  it('shows Follow-up only when the lead is in the Follow-up board', () => {
    expect(fixture.componentInstance.activitySteps.map((step) => step.label)).toEqual([
      'Contacted', 'Appointment', 'Meeting'
    ]);

    fixture.componentRef.setInput('lead', {
      ...createLead(),
      tags: [{ label: 'Follow-up', tone: 'success' }]
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.activitySteps.map((step) => step.label)).toEqual([
      'Contacted', 'Appointment', 'Meeting', 'Follow-up'
    ]);
  });

  it('shows the Follow-up stage and its scheduled appointment state', () => {
    fixture.componentRef.setInput('lead', {
      ...createLead(),
      tags: [{ label: 'Follow-up', tone: 'success' }]
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.activitySteps.map((step) => step.label)).toEqual([
      'Contacted', 'Appointment', 'Meeting', 'Follow-up'
    ]);
    expect(fixture.componentInstance.currentStepIndex).toBe(3);
    expect((fixture.nativeElement.querySelector('.drawer-contact') as HTMLElement).classList).toContain('drawer-contact--follow-up');
    expect(fixture.nativeElement.textContent).toContain('Record your follow-up appointment result.');
    expect(fixture.nativeElement.textContent).toContain('Follow-up Appointment Scheduled');
    expect(fixture.nativeElement.textContent).toContain('Notes (Optional)');
    expect(fixture.nativeElement.textContent).toContain('Presentation Completed');
    expect(fixture.nativeElement.querySelector('.drawer-meeting-actions .section-message--info')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Mark as Contacted');
  });

  it('opens the follow-up scheduler, records updates, and requests the proposal flow', () => {
    const scheduled: LeadFollowUpAppointmentScheduledEvent[] = [];
    const cancelled: LeadFollowUpAppointmentCancelledEvent[] = [];
    const completed: LeadFollowUpAppointmentCompletedEvent[] = [];
    const updates: LeadUpdateRecordedEvent[] = [];
    let proposalRequested = false;
    fixture.componentRef.setInput('lead', {
      ...createLead(),
      tags: [{ label: 'Follow-up', tone: 'success' }]
    });
    fixture.componentInstance.followUpAppointmentScheduled.subscribe((event) => scheduled.push(event));
    fixture.componentInstance.followUpAppointmentCancelled.subscribe((event) => cancelled.push(event));
    fixture.componentInstance.followUpAppointmentCompleted.subscribe((event) => completed.push(event));
    fixture.componentInstance.updateRecorded.subscribe((event) => updates.push(event));
    fixture.componentInstance.proposalRequested.subscribe(() => proposalRequested = true);
    fixture.detectChanges();

    fixture.componentInstance.openFollowUpScheduler();
    expect(fixture.componentInstance.schedulerTitle).toBe('Schedule Follow-up Appointment');
    fixture.componentInstance.afypDeclaration = 500000;
    fixture.componentInstance.potentialCaseCount = 1;
    fixture.componentInstance.scheduleAppointment();
    expect(scheduled).toHaveLength(1);

    fixture.componentRef.setInput('lead', {
      ...createLead(),
      tags: [{ label: 'Follow-up', tone: 'success' }],
      appointment: createLead().appointment
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Follow-up Appointment Scheduled');
    fixture.componentInstance.openCancelAppointment();
    fixture.componentInstance.confirmCancelAppointment();
    expect(cancelled).toHaveLength(1);

    fixture.componentInstance.completeFollowUpAppointment();
    expect(completed).toEqual([{ lead: fixture.componentInstance.lead, notes: '' }]);

    fixture.componentInstance.openUpdateForm();
    fixture.componentInstance.followUpNotes = 'Client asked for another comparison.';
    fixture.componentInstance.saveFollowUp();
    expect(updates).toEqual([{ lead: fixture.componentInstance.lead, notes: 'Client asked for another comparison.' }]);

    fixture.componentInstance.proceedToApplication();
    expect(proposalRequested).toBe(true);
  });
});

function createLead(): LeadCardData {
  return {
    id: 'lead-1',
    leadId: '22742',
    name: 'Sarah Ann Thompson',
    gender: 'Female',
    createdAt: 'Feb/05/2026 ∙ 2:00 PM',
    createdAtTimestamp: 1,
    leadType: 'Active',
    aging: '1d',
    source: 'LMS (ETB)',
    referrer: 'Maxwell Anderson',
    productInterested: 'Dream Builder',
    tags: [{ label: 'Appointment Scheduled', tone: 'success' }],
    appointment: {
      date: '2026-02-02',
      dateLabel: 'February 02, 2026',
      startMinutes: 14 * 60,
      endMinutes: 14 * 60 + 30,
      timeLabel: '2:00-2:30 PM'
    },
    activities: [
      activity('contacted', 'sales', 'Contacted', 20),
      activity('created', 'sales', 'New Lead Created', 1),
      activity('scheduled', 'sales', 'Appointment Scheduled', 5, undefined, 'August 25, 2026', '2:00-2:30 PM'),
      activity('draft', 'system', 'Draft SI Generated', 40),
      activity('cancelled', 'sales', 'Appointment Canceled', 50, 'Client asked for another appointment.')
    ]
  };
}

function activity(
  id: string,
  category: 'sales' | 'system',
  label: string,
  occurredAtTimestamp: number,
  notes?: string,
  scheduledDateLabel?: string,
  scheduledTimeLabel?: string
) {
  return {
    id,
    category,
    label,
    dateLabel: 'August 24, 2026',
    timeLabel: '8:02 PM',
    occurredAtTimestamp,
    recordedDateLabel: 'August 24, 2026',
    recordedTimeLabel: '8:02 PM',
    ...(scheduledDateLabel && scheduledTimeLabel ? { scheduledDateLabel, scheduledTimeLabel } : {}),
    ...(notes ? { notes } : {})
  };
}
