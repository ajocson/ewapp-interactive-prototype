import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  Output
} from '@angular/core';

import { LeadBoardData, LeadCardData, LeadTag } from '../lead-board.model';
import { TdxButtonSize, TdxButtonVariant } from '../shared/components/button/button.model';
import { AppNavigationStateService } from '../shared/services/app-navigation-state.service';
import { TdxFieldControlOption } from '../shared/components/field-control/field-control.component';

const DESKTOP_SIDEBAR_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'lam-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DashboardComponent implements OnDestroy {
  @Output() leadOpened = new EventEmitter<LeadCardData>();
  searchTerm = '';
  selectedSource = 'All Sources';
  selectedLead: LeadCardData | null = null;
  isDesktopViewport = false;
  filterMenuOpen = false;
  pendingLeadStatus = 'All';
  pendingLeadState = 'All';
  pendingSort = 'recent';
  appliedLeadStatus = 'All';
  appliedLeadState = 'All';
  appliedSort = 'recent';

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonSize = TdxButtonSize;
  readonly sourceOptions = ['All Sources', 'ESRA (NTB)', 'LMS (ETB)', 'EasyWay', 'Facebook ESTA', 'Horizon Platform', 'Priority Banking (PB)', 'CBG', 'CLC', 'Self-Generated Leads', 'Existing Leads Campaign', 'EWA Social Media', 'Leads from store', 'Non-EWA Online Publications Posts', 'Online Advertisements', 'Physical Advertisements', 'EWA Marketing Events'];
  readonly sourceControlOptions: readonly TdxFieldControlOption[] = this.sourceOptions.map((source) => ({
    label: source,
    value: source
  }));
  readonly boards: readonly LeadBoardData[] = this.createBoards();
  readonly leadStatusOptions = ['All', 'New Lead', 'Contacted', 'Appointment Set', 'Meeting', 'Follow-up', 'Parked', 'Drop Lead'];
  readonly leadStateOptions = ['All', 'Active', 'Inactive'];
  readonly leadStatusControlOptions: readonly TdxFieldControlOption[] = this.leadStatusOptions.map((status) => ({ label: status, value: status }));
  readonly leadStateControlOptions: readonly TdxFieldControlOption[] = this.leadStateOptions.map((state) => ({ label: state, value: state }));
  readonly sortOptions = [
    { label: 'Recently Created', value: 'recent' },
    { label: 'Oldest Created', value: 'oldest' },
    { label: 'Name A–Z', value: 'name-asc' },
    { label: 'Name Z–A', value: 'name-desc' }
  ];

  private readonly desktopMediaQuery: MediaQueryList | null;

  constructor(
    @Inject(DOCUMENT) document: Document,
    private readonly changeDetectorRef: ChangeDetectorRef,
    readonly navigation: AppNavigationStateService
  ) {
    this.desktopMediaQuery = document.defaultView?.matchMedia?.(DESKTOP_SIDEBAR_QUERY) ?? null;
    this.isDesktopViewport = this.desktopMediaQuery?.matches ?? false;
    this.navigation.setSidebarOpen(this.isDesktopViewport);
    this.desktopMediaQuery?.addEventListener('change', this.handleDesktopBreakpointChange);
  }

  ngOnDestroy(): void {
    this.desktopMediaQuery?.removeEventListener('change', this.handleDesktopBreakpointChange);
  }

  closeSidebarFromOverlay(): void {
    if (!this.isDesktopViewport) {
      this.navigation.setSidebarOpen(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeSidebarWithEscape(): void {
    this.filterMenuOpen = false;

    if (!this.isDesktopViewport && this.navigation.isSidebarOpen()) {
      this.navigation.setSidebarOpen(false);
    }
  }

  @HostListener('document:click')
  closeFilterMenu(): void {
    this.filterMenuOpen = false;
  }

  get filterDirty(): boolean {
    return this.pendingLeadStatus !== this.appliedLeadStatus || this.pendingLeadState !== this.appliedLeadState || this.pendingSort !== this.appliedSort;
  }

  get filterHasValues(): boolean {
    return this.pendingLeadStatus !== 'All' || this.pendingLeadState !== 'All' || this.pendingSort !== 'recent';
  }

  toggleFilterMenu(): void {
    if (!this.filterMenuOpen) {
      this.pendingLeadStatus = this.appliedLeadStatus;
      this.pendingLeadState = this.appliedLeadState;
      this.pendingSort = this.appliedSort;
    }

    this.filterMenuOpen = !this.filterMenuOpen;
  }

  resetPendingFilters(): void {
    this.pendingLeadStatus = 'All';
    this.pendingLeadState = 'All';
    this.pendingSort = 'recent';
  }

  applyFilters(): void {
    this.appliedLeadStatus = this.pendingLeadStatus;
    this.appliedLeadState = this.pendingLeadState;
    this.appliedSort = this.pendingSort;
    this.filterMenuOpen = false;
  }

  get filteredBoards(): readonly LeadBoardData[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();

    return this.boards.map((board) => ({
      ...board,
      leads: board.leads.filter((lead) => {
        const matchesName = !query || lead.name.toLocaleLowerCase().includes(query);
        const matchesSource = this.selectedSource === 'All Sources' || lead.source === this.selectedSource;
        const matchesStatus = this.appliedLeadStatus === 'All' || lead.tags.some((tag) => tag.label === this.appliedLeadStatus);
        const matchesState = this.appliedLeadState === 'All' || lead.leadType === this.appliedLeadState;
        return matchesName && matchesSource && matchesStatus && matchesState;
      }).sort((a, b) => {
        if (this.appliedSort === 'oldest') return a.createdAtTimestamp - b.createdAtTimestamp;
        if (this.appliedSort === 'name-asc') return a.name.localeCompare(b.name);
        if (this.appliedSort === 'name-desc') return b.name.localeCompare(a.name);
        return b.createdAtTimestamp - a.createdAtTimestamp;
      })
    }));
  }

  trackBoard(index: number, board: LeadBoardData): string {
    return board.id;
  }

  selectLead(lead: LeadCardData): void {
    this.selectedLead = lead;
    this.leadOpened.emit(lead);
  }

  markLeadAsContacted(leadId: string): LeadCardData | null {
    const leadBoard = this.boards.find((board) => board.id === 'lead');
    const contactedBoard = this.boards.find((board) => board.id === 'contacted');
    const lead = leadBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!leadBoard || !contactedBoard || !lead) return null;

    const contactedLead: LeadCardData = {
      ...lead,
      leadType: 'Active',
      tags: [{ label: 'Contacted', tone: 'success' }]
    };

    leadBoard.leads = leadBoard.leads.filter((candidate) => candidate.id !== leadId);
    contactedBoard.leads = [contactedLead, ...contactedBoard.leads];
    this.selectedLead = contactedLead;
    this.changeDetectorRef.markForCheck();
    return contactedLead;
  }

  private createBoards(): readonly LeadBoardData[] {
    const newLead: LeadTag = { label: 'New Lead', tone: 'primary' };
    const contacted: LeadTag = { label: 'Contacted', tone: 'success' };
    const appointmentSet: LeadTag = { label: 'Appointment Set', tone: 'success' };
    const meeting: LeadTag = { label: 'Meeting', tone: 'success' };
    const followUp: LeadTag = { label: 'Follow-up', tone: 'success' };
    const appointment: LeadTag = { label: 'Feb 2, 2026 · 2:00-3:00 PM', tone: 'info' };
    const parked: LeadTag = { label: 'Parked', tone: 'neutral' };
    const dropLead: LeadTag = { label: 'Drop Lead', tone: 'danger' };
    const createdOn = (day: number, hour: number, minute = 0): Date =>
      new Date(2026, 1, day, hour, minute);
    const lead = (
      id: string,
      name: string,
      active: boolean,
      source: string,
      tags: readonly LeadTag[],
      createdAt: Date
    ): LeadCardData => ({
      id,
      name,
      createdAt: this.formatCreatedAt(createdAt),
      createdAtTimestamp: createdAt.getTime(),
      leadType: active ? 'Active' : 'Inactive',
      aging: '1d',
      source,
      tags
    });

    return [
      {
        id: 'lead',
        title: 'Lead',
        leads: [
          lead('lead-1', 'John Mark Doe', false, 'Leads from store', [newLead], createdOn(3, 9, 15)),
          lead('lead-2', 'Alice Johnson Smith', false, 'Facebook ESTA', [newLead], createdOn(2, 13, 30)),
          lead('lead-3', 'Michael Lee Thompson', false, 'EasyWay', [newLead], createdOn(1, 10, 45))
        ]
      },
      {
        id: 'contacted',
        title: 'Contacted',
        leads: [lead('contacted-1', 'Alex Morgan', true, 'ESRA (NTB)', [contacted], createdOn(4, 11, 20))]
      },
      {
        id: 'appointments',
        title: 'Appointments',
        leads: [
          lead(
            'appointment-1',
            'Sarah Ann Thompson',
            true,
            'LMS (ETB)',
            [appointmentSet, appointment],
            createdOn(5, 14)
          )
        ]
      },
      {
        id: 'meetings',
        title: 'Meetings',
        leads: [
          lead(
            'meeting-1',
            'Emily Rose Carter',
            true,
            'Priority Banking (PB)',
            [meeting],
            createdOn(6, 9, 30)
          )
        ]
      },
      {
        id: 'follow-up',
        title: 'Follow-Up',
        leads: [
          lead('follow-up-1', 'Alex Morgan Smith', true, 'Leads from store', [followUp], createdOn(8, 16)),
          lead('follow-up-2', 'Emily Jane Cooper', true, 'EWA Social Media', [followUp], createdOn(7, 10, 30)),
          lead('follow-up-3', 'Michael Lee Johnson', true, 'CBG', [followUp], createdOn(6, 14, 15)),
          lead('follow-up-4', 'John Mark Doe', true, 'CLC', [followUp], createdOn(5, 9)),
          lead('follow-up-7', 'Robert James Wilson', true, 'Self-Generated Leads', [followUp], createdOn(4, 15, 45)),
          lead('follow-up-8', 'Laura Elizabeth Taylor', true, 'Online Advertisements', [followUp], createdOn(3, 13, 30)),
          lead('follow-up-9', 'Christopher Paul Martinez', true, 'EWA Marketing Events', [followUp], createdOn(2, 16, 20)),
          lead('follow-up-6', 'Jessica Marie Davis', false, 'Physical Advertisements', [followUp, parked], createdOn(1, 11, 45)),
          lead('follow-up-5', 'David Robert Brown', false, 'Existing Leads Campaign', [followUp, dropLead], createdOn(1, 9, 15))
        ]
      }
    ];
  }

  private formatCreatedAt(value: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = value.getDate().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    const period = value.getHours() >= 12 ? 'PM' : 'AM';
    const hour = value.getHours() % 12 || 12;

    return `${months[value.getMonth()]}/${day}/${value.getFullYear()} ∙ ${hour}:${minutes} ${period}`;
  }

  private readonly handleDesktopBreakpointChange = (event: MediaQueryListEvent): void => {
    this.isDesktopViewport = event.matches;
    this.navigation.setSidebarOpen(event.matches);
    this.changeDetectorRef.markForCheck();
  };
}
