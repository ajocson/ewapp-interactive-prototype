import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../app.module';
import { ApplicationsComponent } from './applications.component';

describe('ApplicationsComponent page filters', () => {
  let fixture: ComponentFixture<ApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationsComponent);
    fixture.detectChanges();
  });

  it('offers every status across the three application boards', () => {
    const component = fixture.componentInstance;

    expect(component.leadStatusOptions).toEqual([
      'All',
      'Application Submitted',
      'Underwriting Ongoing',
      'Needs More Info',
      'Conditionally Accepted',
      'Policy Released',
      'Approved',
      'Unapproved',
      'Withdrawn',
      'Postponed'
    ]);
  });

  it('applies lead status, referrer, and sort selections together', () => {
    const component = fixture.componentInstance;
    const selectedReferrer = component.boards[0].leads[0].referrer;

    component.pendingLeadStatuses = ['Application Submitted'];
    component.selectReferrer(selectedReferrer);
    component.pendingSort = 'name-desc';
    component.applyFilters();

    const visibleLeads = component.filteredBoards.flatMap((board) => board.leads);
    expect(visibleLeads.length).toBeGreaterThan(0);
    expect(visibleLeads.every((lead) => lead.tags.some((tag) => tag.label === 'Application Submitted'))).toBe(true);
    expect(visibleLeads.every((lead) => lead.referrer === selectedReferrer)).toBe(true);
    expect(component.filterHasAppliedValues).toBe(true);
  });

  it('reports an empty referrer result set while the page filter is open', () => {
    const component = fixture.componentInstance;

    component.toggleFilterMenu();
    component.updateReferrerSearch('not-a-referrer');

    expect(component.hasNoReferrerResults).toBe(true);
  });

  it('only applies source selections after Apply is requested', () => {
    const component = fixture.componentInstance;

    component.pendingSources = ['ESRA (NTB)'];
    expect(component.filteredBoards.flatMap((board) => board.leads).length).toBe(18);

    component.applySources();
    expect(component.filteredBoards.flatMap((board) => board.leads).length).toBe(0);

    component.resetPendingSources();
    expect(component.pendingSources).toEqual(['All']);
  });
});
