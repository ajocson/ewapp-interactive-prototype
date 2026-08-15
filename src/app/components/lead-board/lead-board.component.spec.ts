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
        name: 'John Mark Doe',
        createdAt: 'Created Feb/02/2026 · 3:00 PM',
        createdAtTimestamp: new Date(2026, 1, 2, 15).getTime(),
        leadType: 'Active',
        aging: '1d',
        source: 'Referral',
        tags: [{ label: 'SI Generated', tone: 'success' }]
      },
      {
        id: '2',
        name: 'David Robert Brown',
        createdAt: 'Created Feb/01/2026 · 3:00 PM',
        createdAtTimestamp: new Date(2026, 1, 1, 15).getTime(),
        leadType: 'Inactive',
        aging: '1d',
        source: 'Event',
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

  it('leaves the board blank when a search has no matches', () => {
    (fixture.nativeElement.querySelector('button[aria-label="Search Follow-Up"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Unknown person';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('lam-lead-card')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.lead-board__empty-state')).toBeNull();
  });

  it('lets users deselect the active option in every filter group', () => {
    const component = fixture.componentInstance;

    component.toggleStatus('Drop Lead');
    component.toggleStatus('Drop Lead');
    component.toggleLeadType('Inactive');
    component.toggleLeadType('Inactive');
    component.toggleSort('name-asc');
    component.toggleSort('name-asc');

    expect(component.draftFilters).toEqual({
      status: null,
      leadType: null,
      sort: null,
    });
  });

  it('sorts leads by their actual creation timestamps', () => {
    const component = fixture.componentInstance;

    component.appliedFilters = { status: null, leadType: null, sort: 'oldest' };
    expect(component.visibleLeads.map((lead) => lead.name)).toEqual([
      'David Robert Brown',
      'John Mark Doe'
    ]);

    component.appliedFilters = { status: null, leadType: null, sort: 'recent' };
    expect(component.visibleLeads.map((lead) => lead.name)).toEqual([
      'John Mark Doe',
      'David Robert Brown'
    ]);
  });

  it('applies board filters and marks the filter control as active', () => {
    (fixture.nativeElement.querySelector('.lead-board__filter-control button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const parkedOption = Array.from(
      fixture.nativeElement.querySelectorAll('.lead-board__radio') as NodeListOf<HTMLLabelElement>
    ).find((option) => option.textContent?.trim() === 'Parked');
    (parkedOption?.querySelector('input') as HTMLInputElement).click();
    fixture.detectChanges();

    const applyButton = Array.from(
      fixture.nativeElement.querySelectorAll('.lead-board__button') as NodeListOf<HTMLButtonElement>
    ).find((button) => button.textContent?.trim() === 'Apply');
    applyButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('lam-lead-card')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.lead-board__filter-control--active')).toBeTruthy();
  });
});
