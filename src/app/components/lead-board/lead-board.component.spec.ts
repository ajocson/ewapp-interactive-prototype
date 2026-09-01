import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadBoardData } from '../../lead-board.model';
import { LamComponentsModule } from '../lam-components.module';
import { LeadBoardComponent } from './lead-board.component';

describe('LeadBoardComponent', () => {
  let fixture: ComponentFixture<LeadBoardComponent>;

  const board: LeadBoardData = {
    id: 'follow-up',
    title: 'Follow-Up',
    leads: [
      {
        id: '1',
        leadId: '22742',
        name: 'John Mark Doe',
        gender: 'Male',
        createdAt: 'Created Feb/02/2026 · 3:00 PM',
        createdAtTimestamp: new Date(2026, 1, 2, 15).getTime(),
        leadType: 'Active',
        aging: '1d',
        tatAging: '3d',
        source: 'Referral',
        referrer: 'Olivia Martinez',
        productInterested: 'Dream Builder',
        activities: [],
        tags: [{ label: 'SI Generated', tone: 'success' }]
      },
      {
        id: '2',
        leadId: '22743',
        name: 'David Robert Brown',
        gender: 'Male',
        createdAt: 'Created Feb/01/2026 · 3:00 PM',
        createdAtTimestamp: new Date(2026, 1, 1, 15).getTime(),
        leadType: 'Parked',
        aging: '1d',
        tatAging: '3d',
        source: 'Event',
        referrer: 'James Anderson',
        productInterested: 'Dream Builder',
        activities: [],
        tags: [
          { label: 'SI Generated', tone: 'success' },
          { label: 'Parked', tone: 'neutral' }
        ]
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LamComponentsModule] }).compileComponents();
    fixture = TestBed.createComponent(LeadBoardComponent);
    fixture.componentRef.setInput('board', board);
    fixture.detectChanges();
  });

  it('filters the board immediately while searching by lead name', () => {
    const searchButton = fixture.nativeElement.querySelector(
      'button[aria-label="Search Follow-Up"]'
    ) as HTMLButtonElement;
    searchButton.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'John Doe';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('lam-lead-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('John Mark Doe');
  });

  it('shows TAT aging only outside the Lead board', () => {
    expect(fixture.nativeElement.querySelectorAll('.lead-card__aging')).toHaveLength(4);

    fixture.componentRef.setInput('board', { ...board, id: 'lead', title: 'Lead' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.lead-card__aging')).toHaveLength(2);
  });

  it('shows the no-match state when a search has no matches', () => {
    (fixture.nativeElement.querySelector('button[aria-label="Search Follow-Up"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Unknown person';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('lam-lead-card')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.lead-board__empty-state')?.textContent).toContain('No matches were found');
  });

  it('uses the TDX checkbox dropdown for lead-state filters', () => {
    const component = fixture.componentInstance;

    component.updateLeadStates(['Parked', 'Dropped']);
    component.toggleSort('name-asc');

    expect(component.draftFilters).toEqual({
      leadStates: ['Parked', 'Dropped'],
      sort: 'name-asc',
    });
  });

  it('can filter board cards by a supplied status-tag option', () => {
    fixture.componentRef.setInput('filterLabel', 'Filter by Lead Status');
    fixture.componentRef.setInput('filterByTag', true);
    fixture.componentRef.setInput('filterOptions', [
      { label: 'All', value: 'All' },
      { label: 'SI Generated', value: 'SI Generated' }
    ]);
    fixture.detectChanges();

    fixture.componentInstance.updateLeadStates(['SI Generated']);
    fixture.componentInstance.applyFilters();

    expect(fixture.componentInstance.visibleLeads).toHaveLength(2);
    expect(fixture.componentInstance.filterLabel).toBe('Filter by Lead Status');
  });

  it('fills the filter menu content width with the lead-state field', () => {
    (fixture.nativeElement.querySelector('.lead-board__filter-control button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector(
      '.lead-board__state-filter .tdx-field-control'
    ) as HTMLElement;

    expect(field.classList).toContain('tdx-field-control--fluid');
  });

  it('defaults to Recently Created without marking the filter as active', () => {
    const component = fixture.componentInstance;

    expect(component.appliedFilters.sort).toBe('recent');
    expect(component.draftFilters.sort).toBe('recent');
    expect(component.hasAppliedFilters).toBe(false);
    expect(component.visibleLeads.map((lead) => lead.name)).toEqual([
      'John Mark Doe',
      'David Robert Brown'
    ]);

    (fixture.nativeElement.querySelector('.lead-board__filter-control button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const recentlyCreated = Array.from(
      fixture.nativeElement.querySelectorAll('.lead-board__radio') as NodeListOf<HTMLLabelElement>
    ).find((option) => option.textContent?.trim() === 'Recently Created');
    expect((recentlyCreated?.querySelector('input') as HTMLInputElement).checked).toBe(true);
  });

  it('sorts leads by their actual creation timestamps', () => {
    const component = fixture.componentInstance;

    component.appliedFilters = { leadStates: [], sort: 'oldest' };
    expect(component.visibleLeads.map((lead) => lead.name)).toEqual([
      'David Robert Brown',
      'John Mark Doe'
    ]);

    component.appliedFilters = { leadStates: [], sort: 'recent' };
    expect(component.visibleLeads.map((lead) => lead.name)).toEqual([
      'John Mark Doe',
      'David Robert Brown'
    ]);
  });

  it('offers appointment-specific sorting only on the Appointments board', () => {
    const component = fixture.componentInstance;
    expect(component.availableSortOptions.map((option) => option.value)).not.toContain('appointment-upcoming');

    const appointmentBoard: LeadBoardData = {
      ...board,
      id: 'appointments',
      title: 'Appointments',
      leads: [
        {
          ...board.leads[0],
          id: 'earlier',
          appointment: {
            date: '2026-08-24',
            dateLabel: 'August 24, 2026',
            startMinutes: 9 * 60,
            endMinutes: 9 * 60 + 30,
            timeLabel: '9:00-9:30 AM'
          }
        },
        {
          ...board.leads[1],
          id: 'later',
          appointment: {
            date: '2026-08-25',
            dateLabel: 'August 25, 2026',
            startMinutes: 15 * 60,
            endMinutes: 15 * 60 + 30,
            timeLabel: '3:00-3:30 PM'
          }
        },
        {
          ...board.leads[0],
          id: 'unscheduled',
          name: 'Unscheduled Lead',
          appointment: undefined
        }
      ]
    };
    fixture.componentRef.setInput('board', appointmentBoard);

    expect(component.availableSortOptions.map((option) => option.label)).toEqual([
      'Recently Created',
      'Oldest Created',
      'Name A–Z',
      'Name Z–A',
      'Appointment – Upcoming First',
      'Appointment – Latest First'
    ]);

    component.appliedFilters = { leadStates: [], sort: 'appointment-upcoming' };
    expect(component.visibleLeads.map((lead) => lead.id)).toEqual(['earlier', 'later', 'unscheduled']);

    component.appliedFilters = { leadStates: [], sort: 'appointment-latest' };
    expect(component.visibleLeads.map((lead) => lead.id)).toEqual(['later', 'earlier', 'unscheduled']);
  });

  it('applies board filters and marks the filter control as active', () => {
    (fixture.nativeElement.querySelector('.lead-board__filter-control button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const stateTrigger = fixture.nativeElement.querySelector(
      'button[aria-label="Filter by Lead State"]'
    ) as HTMLButtonElement;
    stateTrigger.click();
    fixture.detectChanges();

    const parkedOption = Array.from(
      fixture.nativeElement.querySelectorAll('.tdx-field-control__checkbox-option') as NodeListOf<HTMLLabelElement>
    ).find((option) => option.textContent?.trim() === 'Parked');
    (parkedOption?.querySelector('input') as HTMLInputElement).click();
    fixture.detectChanges();

    const applyButton = Array.from(
      fixture.nativeElement.querySelectorAll('.lead-board__filter-actions .tdx-button') as NodeListOf<HTMLButtonElement>
    ).find((button) => button.textContent?.trim() === 'Apply');
    applyButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('lam-lead-card')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.lead-board__filter-control--active')).toBeTruthy();
  });
});
