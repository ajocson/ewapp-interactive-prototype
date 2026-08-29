import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnDestroy, Output } from '@angular/core';

import { LeadBoardData, LeadCardData, LeadTag } from '../lead-board.model';
import { TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { TdxFieldControlOption } from '../shared/components/field-control/field-control.component';
import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';

const DESKTOP_SIDEBAR_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'lam-applications',
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ApplicationsComponent implements OnDestroy {
  @Input() userType: 'Agency' | 'Banca' = 'Banca';
  @Output() leadSelected = new EventEmitter<LeadCardData>();
  @Output() loggedOut = new EventEmitter<void>();
  searchTerm = '';
  pendingSources: readonly string[] = ['All'];
  appliedSources: readonly string[] = ['All'];
  isDesktopViewport = false;
  filterMenuOpen = false;
  pendingLeadStatuses: readonly string[] = ['All'];
  pendingReferrer = 'All';
  referrerSearchTerm = '';
  referrerSuggestionsOpen = false;
  pendingSort = 'recent';
  appliedLeadStatuses: readonly string[] = ['All'];
  appliedReferrer = 'All';
  appliedSort = 'recent';

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonSize = TdxButtonSize;
  readonly sourceOptions = ['ESRA (NTB)', 'LMS (ETB)', 'EasyWay', 'Facebook ESTA', 'Horizon Platform', 'Priority Banking (PB)', 'CBG', 'CLC', 'Self-Generated Leads', 'Existing Leads Campaign', 'EWA Social Media', 'Leads from store', 'Non-EWA Online Publications Posts', 'Online Advertisements', 'Physical Advertisements', 'EWA Marketing Events'];
  readonly sourceControlOptions: readonly TdxFieldControlOption[] = [
    { label: 'All Sources', value: 'All' },
    ...this.sourceOptions.map(source => ({ label: source, value: source }))
  ];
  readonly leadStatusOptions = [
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
  ];
  readonly leadStatusControlOptions: readonly TdxFieldControlOption[] = this.leadStatusOptions.map((status) => ({ label: status, value: status }));
  readonly referrerOptions = ['Maxwell Anderson', 'Olivia Martinez', 'James Anderson', 'Sophia Williams', 'Ethan Johnson', 'Isabella Brown', 'Liam Thompson', 'Emma Davis', 'Noah Garcia', 'Ava Robinson', 'Lucas Mitchell'];
  readonly sortOptions = [
    { label: 'Recently Created', value: 'recent' },
    { label: 'Oldest Created', value: 'oldest' },
    { label: 'Name A–Z', value: 'name-asc' },
    { label: 'Name Z–A', value: 'name-desc' }
  ];
  readonly boards: readonly LeadBoardData[] = this.createBoards();

  get highlightedLeadId(): string | null {
    const leadId = this.navigation.latestSubmittedApplicationLeadId();
    return leadId ? `application-${this.navigation.applicationSubmissions().find((lead) => lead.leadId === leadId)?.id ?? ''}` : null;
  }

  private readonly desktopMediaQuery: MediaQueryList | null;

  constructor(
    @Inject(DOCUMENT) document: Document,
    private readonly changeDetectorRef: ChangeDetectorRef,
    readonly navigation: AppNavigationStateService
  ) {
    this.desktopMediaQuery = document.defaultView?.matchMedia?.(DESKTOP_SIDEBAR_QUERY) ?? null;
    this.isDesktopViewport = this.desktopMediaQuery?.matches ?? false;
    this.navigation.setSidebarOpen(this.isDesktopViewport);
    this.addSubmittedApplications();
    this.desktopMediaQuery?.addEventListener('change', this.handleDesktopBreakpointChange);
  }

  ngOnDestroy(): void {
    this.desktopMediaQuery?.removeEventListener('change', this.handleDesktopBreakpointChange);
  }

  get filteredBoards(): readonly LeadBoardData[] {
    const terms = this.searchTerm.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const selectedSources = this.appliedSources.filter(source => source !== 'All');
    return this.boards.map((board) => ({
      ...board,
      leads: board.leads.filter((lead) =>
        terms.every(term => `${lead.leadId} ${lead.name}`.toLocaleLowerCase().includes(term))
        && (!selectedSources.length || selectedSources.includes(lead.source))
        && (this.appliedLeadStatuses.includes('All') || lead.tags.some((tag) => this.appliedLeadStatuses.includes(tag.label)))
        && (this.appliedReferrer === 'All' || lead.referrer === this.appliedReferrer)
      ).sort((first, second) => this.compareLeads(first, second))
    }));
  }

  closeSidebarFromOverlay(): void {
    if (!this.isDesktopViewport) this.navigation.setSidebarOpen(false);
  }

  @HostListener('document:keydown.escape')
  closeSidebarWithEscape(): void {
    this.filterMenuOpen = false;
    this.referrerSuggestionsOpen = false;
    if (!this.isDesktopViewport && this.navigation.isSidebarOpen()) this.navigation.setSidebarOpen(false);
  }

  @HostListener('document:click')
  closeFilterMenu(): void {
    this.filterMenuOpen = false;
    this.referrerSuggestionsOpen = false;
  }

  get filterDirty(): boolean {
    return !this.valuesMatch(this.pendingLeadStatuses, this.appliedLeadStatuses)
      || this.pendingReferrer !== this.appliedReferrer
      || this.pendingSort !== this.appliedSort;
  }

  get sourceSelectionDirty(): boolean {
    return !this.valuesMatch(this.pendingSources, this.appliedSources);
  }

  get sourceSelectionHasValues(): boolean {
    return !this.pendingSources.includes('All');
  }

  get filterHasValues(): boolean {
    return !this.pendingLeadStatuses.includes('All') || this.pendingReferrer !== 'All' || this.pendingSort !== 'recent';
  }

  get filterHasAppliedValues(): boolean {
    return !this.appliedLeadStatuses.includes('All') || this.appliedReferrer !== 'All' || this.appliedSort !== 'recent';
  }

  get filteredReferrerOptions(): readonly string[] {
    const query = this.referrerSearchTerm.trim().toLocaleLowerCase();
    return query ? this.referrerOptions.filter((referrer) => referrer.toLocaleLowerCase().includes(query)) : [];
  }

  get hasNoReferrerResults(): boolean {
    return this.referrerSuggestionsOpen && Boolean(this.referrerSearchTerm.trim()) && this.filteredReferrerOptions.length === 0;
  }

  toggleFilterMenu(): void {
    if (!this.filterMenuOpen) {
      this.pendingLeadStatuses = [...this.appliedLeadStatuses];
      this.pendingReferrer = this.appliedReferrer;
      this.referrerSearchTerm = this.appliedReferrer === 'All' ? '' : this.appliedReferrer;
      this.referrerSuggestionsOpen = false;
      this.pendingSort = this.appliedSort;
    }
    this.filterMenuOpen = !this.filterMenuOpen;
  }

  resetPendingFilters(): void {
    this.pendingLeadStatuses = ['All'];
    this.pendingReferrer = 'All';
    this.referrerSearchTerm = '';
    this.referrerSuggestionsOpen = false;
    this.pendingSort = 'recent';
  }

  applyFilters(): void {
    this.appliedLeadStatuses = [...this.pendingLeadStatuses];
    this.appliedReferrer = this.pendingReferrer;
    this.appliedSort = this.pendingSort;
    this.filterMenuOpen = false;
    this.referrerSuggestionsOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  handleSourceMenuOpen(isOpen: boolean): void {
    if (isOpen || this.sourceSelectionDirty) this.pendingSources = [...this.appliedSources];
  }

  resetPendingSources(): void {
    this.pendingSources = ['All'];
  }

  applySources(): void {
    this.appliedSources = [...this.pendingSources];
    this.changeDetectorRef.markForCheck();
  }

  updateReferrerSearch(value: string): void {
    this.referrerSearchTerm = value;
    this.pendingReferrer = 'All';
    this.referrerSuggestionsOpen = Boolean(value.trim());
  }

  openReferrerSuggestions(): void {
    this.referrerSuggestionsOpen = Boolean(this.referrerSearchTerm.trim());
  }

  selectReferrer(referrer: string): void {
    this.pendingReferrer = referrer;
    this.referrerSearchTerm = referrer;
    this.referrerSuggestionsOpen = false;
  }

  trackBoard(_index: number, board: LeadBoardData): string { return board.id; }

  statusOptionsFor(board: LeadBoardData): readonly TdxFieldControlOption[] {
    const statusesByBoard: Record<string, readonly string[]> = {
      'applications-in-progress': ['Application Submitted', 'Underwriting Ongoing'],
      'applications-action-required': ['Needs More Info', 'Conditionally Accepted'],
      'applications-completed': ['Policy Released', 'Approved', 'Unapproved', 'Withdrawn', 'Postponed']
    };
    return [
      { label: 'All', value: 'All' },
      ...(statusesByBoard[board.id] ?? []).map(label => ({ label, value: label }))
    ];
  }

  private readonly handleDesktopBreakpointChange = (event: MediaQueryListEvent): void => {
    this.isDesktopViewport = event.matches;
    this.navigation.setSidebarOpen(event.matches);
  };

  private compareLeads(first: LeadCardData, second: LeadCardData): number {
    if (this.appliedSort === 'oldest') return first.createdAtTimestamp - second.createdAtTimestamp;
    if (this.appliedSort === 'name-asc') return first.name.localeCompare(second.name);
    if (this.appliedSort === 'name-desc') return second.name.localeCompare(first.name);
    return second.createdAtTimestamp - first.createdAtTimestamp;
  }

  private valuesMatch(first: readonly string[], second: readonly string[]): boolean {
    return first.length === second.length && first.every((value, index) => value === second[index]);
  }

  private createBoards(): readonly LeadBoardData[] {
    const submitted: LeadTag = { label: 'Application Submitted', tone: 'success' };
    return [
      { id: 'applications-in-progress', title: 'In Progress', leads: [
        this.createLead('application-1', '22742', 'Sophia Loren', 'Female', submitted),
        this.createLead('application-2', '22743', 'Ariana Grande', 'Female', submitted),
        this.createLead('application-3', '22744', 'Julia Roberts', 'Female', { label: 'Underwriting Ongoing', tone: 'info' }),
        this.createLead('application-4', '22745', 'Daniel Radcliffe', 'Male', { label: 'Underwriting Ongoing', tone: 'info' })
      ] },
      { id: 'applications-action-required', title: 'Action Required', leads: [
        this.createLead('application-5', '22746', 'Albert Einstein', 'Male', { label: 'Needs More Info', tone: 'neutral' }),
        this.createLead('application-6', '22747', 'Maya Angelou', 'Female', { label: 'Needs More Info', tone: 'neutral' }),
        this.createLead('application-7', '22748', 'Amelia Earhart', 'Female', { label: 'Conditionally Accepted', tone: 'primary' }),
        this.createLead('application-8', '22749', 'Marie Curie', 'Female', { label: 'Conditionally Accepted', tone: 'primary' })
      ] },
      { id: 'applications-completed', title: 'Completed', leads: [
        this.createLead('application-9', '22750', 'Grace Kelly', 'Female', { label: 'Policy Released', tone: 'success' }),
        this.createLead('application-10', '22751', 'Audrey Hepburn', 'Female', { label: 'Policy Released', tone: 'success' }),
        this.createLead('application-11', '22752', 'Clara Belle', 'Female', { label: 'Approved', tone: 'success' }),
        this.createLead('application-12', '22753', 'Emma Watson', 'Female', { label: 'Approved', tone: 'success' }),
        this.createLead('application-13', '22754', 'Oliver Twist', 'Male', { label: 'Unapproved', tone: 'danger' }),
        this.createLead('application-14', '22755', 'Charles Dickens', 'Male', { label: 'Unapproved', tone: 'danger' }),
        this.createLead('application-15', '22756', 'Benjamin Franklin', 'Male', { label: 'Withdrawn', tone: 'danger' }),
        this.createLead('application-16', '22757', 'Nikola Tesla', 'Male', { label: 'Withdrawn', tone: 'danger' }),
        this.createLead('application-17', '22758', 'Leonardo DiCaprio', 'Male', { label: 'Postponed', tone: 'neutral' }),
        this.createLead('application-18', '22759', 'Robert Downey', 'Male', { label: 'Postponed', tone: 'neutral' })
      ] }
    ];
  }

  private addSubmittedApplications(): void {
    const inProgressBoard = this.boards.find((board) => board.id === 'applications-in-progress');
    if (!inProgressBoard) return;

    const submittedLeads = this.navigation.applicationSubmissions().map((lead) => ({
      ...lead,
      id: `application-${lead.id}`,
      leadType: 'Booked' as const,
      appointment: undefined,
      tags: [{ label: 'Application Submitted', tone: 'success' as const }]
    }));
    inProgressBoard.leads = [...submittedLeads, ...inProgressBoard.leads.filter((lead) => !submittedLeads.some((submitted) => submitted.leadId === lead.leadId))];
  }

  private createLead(id: string, leadId: string, name: string, gender: LeadCardData['gender'], tag: LeadTag): LeadCardData {
    return {
      id, leadId, name, gender, createdAt: 'Feb/01/2026 ∙ 3:00 PM', createdAtTimestamp: new Date('2026-02-01T15:00:00').getTime(),
      leadType: 'Booked', aging: '1d', tatAging: '3d', source: 'Leads from store', referrer: this.referrerOptions[Number(leadId) % this.referrerOptions.length],
      productInterested: 'Dream Builder', tags: [tag], activities: []
    };
  }
}
