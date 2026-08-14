import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { LeadBoardData, LeadCardData } from '../../lead-board.model';
import {
  BoardLeadTypeFilter,
  BoardSortOption,
  BoardStatusFilter,
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
  @Output() leadSelected = new EventEmitter<LeadCardData>();

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  readonly statusOptions: readonly Exclude<BoardStatusFilter, null>[] = ['Parked', 'Drop Lead'];
  readonly leadTypeOptions: readonly Exclude<BoardLeadTypeFilter, null>[] = ['Active', 'Inactive'];
  readonly sortOptions: readonly { value: Exclude<BoardSortOption, null>; label: string }[] = [
    { value: 'recent', label: 'Recently Created' },
    { value: 'oldest', label: 'Oldest Created' },
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' }
  ];

  isSearchOpen = false;
  isFilterOpen = false;
  searchTerm = '';
  appliedFilters: LeadBoardFilters = { ...EMPTY_LEAD_BOARD_FILTERS };
  draftFilters: LeadBoardFilters = { ...EMPTY_LEAD_BOARD_FILTERS };

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get visibleLeads(): readonly LeadCardData[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    const searchTerms = query.split(/\s+/).filter(Boolean);
    let leads = this.board.leads.filter((lead) => {
      const normalizedName = lead.name.toLocaleLowerCase();
      const matchesSearch = searchTerms.every((term) => normalizedName.includes(term));
      const matchesStatus =
        !this.appliedFilters.status || lead.tags.some((tag) => tag.label === this.appliedFilters.status);
      const matchesLeadType =
        !this.appliedFilters.leadType || lead.leadType === this.appliedFilters.leadType;

      return matchesSearch && matchesStatus && matchesLeadType;
    });

    switch (this.appliedFilters.sort) {
      case 'recent':
        leads = [...leads].sort((first, second) => second.createdAtTimestamp - first.createdAtTimestamp);
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
    }

    return leads;
  }

  get hasAppliedFilters(): boolean {
    return this.hasFilters(this.appliedFilters);
  }

  get hasDraftFilters(): boolean {
    return this.hasFilters(this.draftFilters);
  }

  get canApplyFilters(): boolean {
    return !this.filtersMatch(this.draftFilters, this.appliedFilters);
  }

  openSearch(): void {
    this.isSearchOpen = true;
    this.isFilterOpen = false;
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  closeSearch(): void {
    this.searchTerm = '';
    this.isSearchOpen = false;
  }

  updateSearch(value: string): void {
    this.searchTerm = value;
  }

  toggleFilterMenu(): void {
    this.isFilterOpen = !this.isFilterOpen;
    if (this.isFilterOpen) {
      this.draftFilters = { ...this.appliedFilters };
    }
  }

  toggleStatus(status: Exclude<BoardStatusFilter, null>): void {
    this.draftFilters = {
      ...this.draftFilters,
      status: this.draftFilters.status === status ? null : status,
    };
  }

  toggleLeadType(leadType: Exclude<BoardLeadTypeFilter, null>): void {
    this.draftFilters = {
      ...this.draftFilters,
      leadType: this.draftFilters.leadType === leadType ? null : leadType,
    };
  }

  toggleSort(sort: Exclude<BoardSortOption, null>): void {
    this.draftFilters = {
      ...this.draftFilters,
      sort: this.draftFilters.sort === sort ? null : sort,
    };
  }

  clearDraftFilters(): void {
    this.draftFilters = { ...EMPTY_LEAD_BOARD_FILTERS };
  }

  applyFilters(): void {
    if (!this.canApplyFilters) {
      return;
    }

    this.appliedFilters = { ...this.draftFilters };
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
    return Boolean(filters.status || filters.leadType || filters.sort);
  }

  private filtersMatch(first: LeadBoardFilters, second: LeadBoardFilters): boolean {
    return first.status === second.status && first.leadType === second.leadType && first.sort === second.sort;
  }
}
