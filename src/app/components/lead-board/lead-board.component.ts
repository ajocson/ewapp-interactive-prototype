import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { LeadBoardData, LeadCardData } from '../../lead-board.model';
import { TdxButtonEmphasis, TdxButtonSize, TdxButtonVariant } from '../../shared/components/button/button.model';
import { TdxFieldControlOption } from '../../shared/components/field-control/field-control.component';
import {
  BoardLeadStateFilter,
  BoardSortOption,
  EMPTY_LEAD_BOARD_FILTERS,
  LeadBoardFilters
} from './lead-board-filter.model';

@Component({
  selector: 'lam-lead-board',
  templateUrl: './lead-board.component.html',
  styleUrl: './lead-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadBoardComponent {
  @Input({ required: true }) board!: LeadBoardData;
  @Input() count?: number;
  @Input() filterLabel = 'Filter by Lead State';
  @Input() filterOptions?: readonly TdxFieldControlOption[];
  @Input() filterByTag = false;
  @Input() highlightedLeadId: string | null = null;
  @Output() leadSelected = new EventEmitter<LeadCardData>();

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonEmphasis = TdxButtonEmphasis;
  readonly buttonSize = TdxButtonSize;
  readonly leadStateOptions: readonly TdxFieldControlOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Dropped', value: 'Dropped' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Parked', value: 'Parked' },
    { label: 'Re-endorsed', value: 'Re-endorsed' },
    { label: 'Reactivated', value: 'Reactivated' }
  ];
  readonly sortOptions: readonly { value: Exclude<BoardSortOption, null>; label: string }[] = [
    { value: 'recent', label: 'Recently Created' },
    { value: 'oldest', label: 'Oldest Created' },
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' }
  ];
  readonly appointmentSortOptions: readonly { value: Exclude<BoardSortOption, null>; label: string }[] = [
    { value: 'appointment-upcoming', label: 'Appointment – Upcoming First' },
    { value: 'appointment-latest', label: 'Appointment – Latest First' }
  ];

  isSearchOpen = false;
  isInitialLoading = true;
  loadedLeadCount = 10;
  isLoadingMore = false;
  private loadMoreTimer?: ReturnType<typeof setTimeout>;
  isFilterOpen = false;
  searchTerm = '';
  pendingSearchTerm = '';
  appliedFilters: LeadBoardFilters = this.emptyFilters();
  draftFilters: LeadBoardFilters = this.emptyFilters();

  constructor(private readonly elementRef: ElementRef<HTMLElement>, private readonly changeDetectorRef: ChangeDetectorRef) {
    setTimeout(() => {
      this.isInitialLoading = false;
      this.changeDetectorRef.markForCheck();
    }, 2000);
  }

  get visibleLeads(): readonly LeadCardData[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    const searchTerms = query.split(/\s+/).filter(Boolean);
    let leads = this.board.leads.filter((lead) => {
      const normalizedName = lead.name.toLocaleLowerCase();
      const normalizedLeadId = lead.leadId.toLocaleLowerCase();
      const matchesSearch = searchTerms.every((term) => normalizedName.includes(term) || normalizedLeadId.includes(term));
      const matchesFilter = this.filterByTag
        ? !this.appliedFilters.leadStates.length || lead.tags.some(tag => this.appliedFilters.leadStates.some(value => value === tag.label))
        :
        !this.appliedFilters.leadStates.length ||
        this.appliedFilters.leadStates.includes(lead.leadType as BoardLeadStateFilter);

      return matchesSearch && matchesFilter;
    });

    switch (this.appliedFilters.sort) {
      case 'recent':
        leads = [...leads].sort((first, second) => this.activityTimestamp(second) - this.activityTimestamp(first));
        break;
      case 'oldest':
        leads = [...leads].sort((first, second) => first.createdAtTimestamp - second.createdAtTimestamp);
        break;
      case 'name-asc':
        leads = [...leads].sort((first, second) => first.name.localeCompare(second.name));
        break;
      case 'name-desc':
        leads = [...leads].sort((first, second) => second.name.localeCompare(first.name));
        break;
      case 'appointment-upcoming':
        leads = [...leads].sort((first, second) => this.compareAppointments(first, second, 1));
        break;
      case 'appointment-latest':
        leads = [...leads].sort((first, second) => this.compareAppointments(first, second, -1));
        break;
    }

    return this.board.id === 'follow-up' ? leads.slice(0, this.loadedLeadCount) : leads;
  }

  get hasMoreLeads(): boolean {
    return this.board.id === 'follow-up'
      && !this.searchTerm.trim()
      && this.loadedLeadCount < this.board.leads.length;
  }

  loadMore(): void {
    if (!this.hasMoreLeads || this.isLoadingMore) return;
    this.isLoadingMore = true;
    this.loadMoreTimer = setTimeout(() => {
      this.loadedLeadCount += 10;
      this.isLoadingMore = false;
      this.changeDetectorRef.markForCheck();
    }, 2000);
  }

  ngOnDestroy(): void { if (this.loadMoreTimer) clearTimeout(this.loadMoreTimer); }

  get displayCount(): number {
    return this.count ?? this.board.leads.length;
  }

  get activeFilterOptions(): readonly TdxFieldControlOption[] {
    return this.filterOptions ?? this.leadStateOptions;
  }

  get hasAppliedFilters(): boolean {
    return this.hasFilters(this.appliedFilters);
  }

  get availableSortOptions(): readonly { value: Exclude<BoardSortOption, null>; label: string }[] {
    return this.board.id === 'appointments'
      ? [...this.sortOptions, ...this.appointmentSortOptions]
      : this.sortOptions;
  }

  get hasDraftFilters(): boolean {
    return this.hasFilters(this.draftFilters);
  }

  get canApplyFilters(): boolean {
    return !this.filtersMatch(this.draftFilters, this.appliedFilters);
  }

  openSearch(): void {
    this.isSearchOpen = true;
    this.pendingSearchTerm = this.searchTerm;
    this.isFilterOpen = false;
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  closeSearch(): void {
    this.searchTerm = '';
    this.pendingSearchTerm = '';
    this.isSearchOpen = false;
  }

  updateSearch(value: string): void {
    this.pendingSearchTerm = value;
  }

  applySearch(): void {
    this.searchTerm = this.pendingSearchTerm;
  }

  toggleFilterMenu(): void {
    this.isFilterOpen = !this.isFilterOpen;
    if (this.isFilterOpen) {
      this.draftFilters = { ...this.appliedFilters };
    }
  }

  updateLeadStates(values: readonly string[]): void {
    const leadStates = values.filter((value): value is BoardLeadStateFilter => value !== 'All');
    this.draftFilters = {
      ...this.draftFilters,
      leadStates
    };
  }

  toggleSort(sort: Exclude<BoardSortOption, null>): void {
    this.draftFilters = {
      ...this.draftFilters,
      sort,
    };
  }

  clearDraftFilters(): void {
    this.draftFilters = this.emptyFilters();
  }

  applyFilters(): void {
    if (!this.canApplyFilters) {
      return;
    }

    this.appliedFilters = { ...this.draftFilters, leadStates: [...this.draftFilters.leadStates] };
    this.isFilterOpen = false;
  }

  @HostListener('document:click', ['$event.target'])
  closeFilterWhenClickingOutside(target: EventTarget | null): void {
    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.isFilterOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeOpenControls(): void {
    if (this.isFilterOpen) {
      this.isFilterOpen = false;
      this.draftFilters = { ...this.appliedFilters };
      return;
    }

    if (this.isSearchOpen) {
      this.closeSearch();
    }
  }

  trackLead(index: number, lead: LeadCardData): string {
    return lead.id;
  }

  private hasFilters(filters: LeadBoardFilters): boolean {
    return Boolean(
      filters.leadStates.length || (filters.sort !== null && filters.sort !== EMPTY_LEAD_BOARD_FILTERS.sort)
    );
  }

  private activityTimestamp(lead: LeadCardData): number {
    return lead.lastActivityTimestamp ?? lead.createdAtTimestamp;
  }

  private compareAppointments(first: LeadCardData, second: LeadCardData, direction: 1 | -1): number {
    const firstTimestamp = this.appointmentTimestamp(first);
    const secondTimestamp = this.appointmentTimestamp(second);
    if (firstTimestamp === null && secondTimestamp === null) return 0;
    if (firstTimestamp === null) return 1;
    if (secondTimestamp === null) return -1;
    return (firstTimestamp - secondTimestamp) * direction;
  }

  private appointmentTimestamp(lead: LeadCardData): number | null {
    if (!lead.appointment) return null;
    const date = new Date(`${lead.appointment.date}T00:00:00`).getTime();
    return Number.isNaN(date) ? null : date + lead.appointment.startMinutes * 60_000;
  }

  private filtersMatch(first: LeadBoardFilters, second: LeadBoardFilters): boolean {
    return first.leadStates.join('|') === second.leadStates.join('|') && first.sort === second.sort;
  }

  private emptyFilters(): LeadBoardFilters {
    return { ...EMPTY_LEAD_BOARD_FILTERS, leadStates: [] };
  }
}
