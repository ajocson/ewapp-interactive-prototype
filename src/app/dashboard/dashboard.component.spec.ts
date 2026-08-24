import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../app.module';
import { DashboardComponent } from './dashboard.component';

class MockDesktopMediaQuery {
  matches = true;
  private listener?: (event: MediaQueryListEvent) => void;

  addEventListener(type: string, listener: (event: MediaQueryListEvent) => void): void {
    if (type === 'change') {
      this.listener = listener;
    }
  }

  removeEventListener(): void {
    this.listener = undefined;
  }

  setMatches(matches: boolean): void {
    this.matches = matches;
    this.listener?.({ matches } as MediaQueryListEvent);
  }
}

describe('DashboardComponent sidebar', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let desktopMediaQuery: MockDesktopMediaQuery;

  beforeEach(async () => {
    desktopMediaQuery = new MockDesktopMediaQuery();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => desktopMediaQuery
    });

    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('opens automatically on desktop and can be toggled from the global header', () => {
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeTruthy();

    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeFalsy();

    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeTruthy();
  });

  it('uses the requested header action behavior', () => {
    const navigationButton = fixture.nativeElement.querySelector(
      '[aria-controls="primary-navigation"]'
    ) as HTMLButtonElement;
    const globalSearchButton = fixture.nativeElement.querySelector('[aria-label="Search"]') as HTMLButtonElement;

    expect(navigationButton.hasAttribute('data-tooltip')).toBe(false);
    expect(navigationButton.classList.contains('icon-button--no-interaction-background')).toBe(true);
    expect(globalSearchButton.textContent).toContain('Search');
    expect(globalSearchButton.classList.contains('tdx-button--subtle')).toBe(true);
  });

  it('hides at tablet size and opens as a dismissible overlay when requested', () => {
    desktopMediaQuery.setMatches(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeFalsy();

    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeTruthy();

    (fixture.nativeElement.querySelector('.sidebar-backdrop') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeFalsy();
  });

  it('moves a completed lead to Contacted with an active contacted state', () => {
    const component = fixture.componentInstance;

    const contactedLead = component.markLeadAsContacted('lead-1');
    fixture.detectChanges();

    expect(contactedLead?.leadType).toBe('Active');
    expect(contactedLead?.tags).toEqual([{ label: 'Contacted', tone: 'success' }]);
    expect(component.boards.find((board) => board.id === 'lead')?.leads.some((lead) => lead.id === 'lead-1')).toBe(false);
    expect(component.boards.find((board) => board.id === 'contacted')?.leads[0]).toEqual(contactedLead);
    expect(component.filteredBoards.find((board) => board.id === 'contacted')?.leads[0]).toEqual(contactedLead);
    expect(contactedLead?.lastActivityTimestamp).toBeGreaterThan(contactedLead?.createdAtTimestamp ?? 0);
    expect(component.highlightedLeadId).toBe('lead-1');
  });

  it('moves a scheduled contact through Appointments and Meetings while recording its activity', () => {
    const component = fixture.componentInstance;
    const appointment = {
      date: '2026-08-24',
      dateLabel: 'August 24, 2026',
      startMinutes: 15 * 60,
      endMinutes: 15 * 60 + 30,
      timeLabel: '3:00-3:30 PM',
      notes: 'Confirmed with the client.'
    };

    const scheduled = component.scheduleLeadAppointment('contacted-1', appointment);
    expect(scheduled?.tags.map((tag) => tag.label)).toEqual(['Appointment Set', 'Aug 24, 2026 · 3:00-3:30 PM']);
    expect(component.boards.find((board) => board.id === 'contacted')?.leads.some((lead) => lead.id === 'contacted-1')).toBe(false);
    expect(component.filteredBoards.find((board) => board.id === 'appointments')?.leads[0]).toEqual(scheduled);
    expect(scheduled?.activities.at(-1)).toMatchObject({ category: 'sales', label: 'Appointment Scheduled', notes: appointment.notes });

    const meeting = component.completeLeadAppointment('contacted-1', 'Client attended.');
    expect(meeting?.tags).toEqual([{ label: 'Meeting', tone: 'success' }]);
    expect(component.boards.find((board) => board.id === 'appointments')?.leads.some((lead) => lead.id === 'contacted-1')).toBe(false);
    expect(component.filteredBoards.find((board) => board.id === 'meetings')?.leads[0]).toEqual(meeting);
    expect(meeting?.activities.at(-1)).toMatchObject({ category: 'sales', label: 'Appointment Completed', notes: 'Client attended.' });
  });

  it('moves a meeting to Follow-Up and records the supplied notes', () => {
    const component = fixture.componentInstance;

    const followUp = component.recordLeadFollowUp('meeting-1', 'Call again next Tuesday.');

    expect(followUp?.tags).toEqual([{ label: 'Follow-up', tone: 'success' }]);
    expect(component.boards.find((board) => board.id === 'meetings')?.leads.some((lead) => lead.id === 'meeting-1')).toBe(false);
    expect(component.filteredBoards.find((board) => board.id === 'follow-up')?.leads[0]).toEqual(followUp);
    expect(followUp?.activities.at(-1)).toMatchObject({ category: 'sales', label: 'Follow Up Created', notes: 'Call again next Tuesday.' });
  });

  it('provides one parked and one dropped lead on every board with the board status tag', () => {
    const expectedStatusByBoard: Record<string, string> = {
      lead: 'New Lead',
      contacted: 'Contacted',
      appointments: 'Appointment Set',
      meetings: 'Meeting',
      'follow-up': 'Follow-up'
    };

    for (const board of fixture.componentInstance.boards) {
      const parked = board.leads.filter((lead) => lead.leadType === 'Parked');
      const dropped = board.leads.filter((lead) => lead.leadType === 'Dropped');
      expect(parked).toHaveLength(1);
      expect(dropped).toHaveLength(1);
      expect(parked[0].tags[0].label).toBe(expectedStatusByBoard[board.id]);
      expect(dropped[0].tags[0].label).toBe(expectedStatusByBoard[board.id]);
    }
  });

  it('parks and drops leads in place on any board while preserving their board status', () => {
    const component = fixture.componentInstance;
    const scenarios = [
      { boardId: 'lead', leadId: 'lead-1', state: 'Parked' as const, details: 'Waiting for client availability.' },
      { boardId: 'contacted', leadId: 'contacted-1', state: 'Dropped' as const, details: 'Client is no longer interested' },
      { boardId: 'appointments', leadId: 'appointment-1', state: 'Parked' as const, details: 'Requested a pause.' },
      { boardId: 'meetings', leadId: 'meeting-1', state: 'Dropped' as const, details: 'Unable to contact the client' },
      { boardId: 'follow-up', leadId: 'follow-up-1', state: 'Parked' as const, details: 'Follow up next month.' }
    ];

    for (const scenario of scenarios) {
      const board = component.boards.find((candidate) => candidate.id === scenario.boardId)!;
      const originalTag = board.leads.find((lead) => lead.id === scenario.leadId)!.tags;
      const updated = component.changeLeadState(scenario.leadId, scenario.state, scenario.details);

      expect(updated?.leadType).toBe(scenario.state);
      expect(updated?.tags).toEqual(originalTag);
      expect(updated?.activities.at(-1)).toMatchObject({
        category: 'sales',
        label: scenario.state === 'Parked' ? 'Lead Parked' : 'Lead Dropped',
        notes: scenario.details
      });
      expect(board.leads[0]).toEqual(updated);
      expect(component.highlightedLeadId).toBe(scenario.leadId);
    }
  });

  it('reactivates a paused lead in its current board and records the activity', () => {
    const component = fixture.componentInstance;
    const board = component.boards.find((candidate) => candidate.id === 'follow-up')!;
    const pausedLead = board.leads.find((lead) => lead.leadType === 'Parked')!;
    const originalTag = pausedLead.tags;

    const reactivated = component.changeLeadState(pausedLead.id, 'Reactivated');

    expect(reactivated?.leadType).toBe('Reactivated');
    expect(reactivated?.tags).toEqual(originalTag);
    expect(reactivated?.activities.at(-1)).toMatchObject({ category: 'sales', label: 'Lead Reactivated' });
    expect(board.leads[0]).toEqual(reactivated);
    expect(component.highlightedLeadId).toBe(pausedLead.id);
  });

  it('applies multiple lead-state filters from the page filter', () => {
    const component = fixture.componentInstance;
    component.pendingLeadStates = ['Parked', 'Dropped'];
    component.applyFilters();

    expect(component.filteredBoards.every((board) => board.leads.every((lead) => ['Parked', 'Dropped'].includes(lead.leadType)))).toBe(true);
    fixture.detectChanges();
    expect(component.filterHasAppliedValues).toBe(true);
    expect(fixture.nativeElement.querySelector('.filters__filter--active')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Active filters applied');
  });

  it('offers Reactivated but not Booked in the lead-state filter', () => {
    expect(fixture.componentInstance.leadStateOptions).toContain('Reactivated');
    expect(fixture.componentInstance.leadStateOptions).not.toContain('Booked');
  });
});
