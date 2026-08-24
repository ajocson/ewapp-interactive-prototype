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

import {
  LeadActivityCategory,
  LeadActivityRecord,
  LeadAppointment,
  LeadBoardData,
  LeadCardData,
  LeadGender,
  LeadState,
  LeadTag
} from '../lead-board.model';
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
  pendingLeadStatuses: readonly string[] = ['All'];
  pendingLeadStates: readonly string[] = ['All'];
  pendingReferrer = 'All';
  pendingSort = 'recent';
  appliedLeadStatuses: readonly string[] = ['All'];
  appliedLeadStates: readonly string[] = ['All'];
  appliedReferrer = 'All';
  appliedSort = 'recent';
  highlightedLeadId: string | null = null;

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonSize = TdxButtonSize;
  readonly sourceOptions = ['All Sources', 'ESRA (NTB)', 'LMS (ETB)', 'EasyWay', 'Facebook ESTA', 'Horizon Platform', 'Priority Banking (PB)', 'CBG', 'CLC', 'Self-Generated Leads', 'Existing Leads Campaign', 'EWA Social Media', 'Leads from store', 'Non-EWA Online Publications Posts', 'Online Advertisements', 'Physical Advertisements', 'EWA Marketing Events'];
  readonly sourceControlOptions: readonly TdxFieldControlOption[] = this.sourceOptions.map((source) => ({
    label: source,
    value: source
  }));
  readonly leadStatusOptions = ['All', 'Application Start', 'Application Submitted', 'Appointment Set', 'Approved', 'Conditionally Accepted', 'Contacted', 'Follow Up', 'Meeting', 'Needs More Info', 'New Lead', 'Policy Released', 'Postponed', 'UW Ongoing', 'Unapproved', 'Withdrawn'];
  readonly leadStateOptions = ['All', 'Active', 'Dropped', 'Inactive', 'Parked', 'Re-endorsed', 'Reactivated'];
  readonly referrerOptions = ['All', 'Maxwell Anderson', 'Olivia Martinez', 'James Anderson', 'Sophia Williams', 'Ethan Johnson', 'Isabella Brown', 'Liam Thompson', 'Emma Davis', 'Noah Garcia', 'Ava Robinson', 'Lucas Mitchell'];
  readonly leadStatusControlOptions: readonly TdxFieldControlOption[] = this.leadStatusOptions.map((status) => ({ label: status, value: status }));
  readonly leadStateControlOptions: readonly TdxFieldControlOption[] = this.leadStateOptions.map((state) => ({ label: state, value: state }));
  readonly referrerControlOptions: readonly TdxFieldControlOption[] = this.referrerOptions.map((referrer) => ({ label: referrer, value: referrer }));
  readonly boards: readonly LeadBoardData[] = this.createBoards();
  readonly sortOptions = [
    { label: 'Recently Created', value: 'recent' },
    { label: 'Oldest Created', value: 'oldest' },
    { label: 'Name A–Z', value: 'name-asc' },
    { label: 'Name Z–A', value: 'name-desc' }
  ];

  private readonly desktopMediaQuery: MediaQueryList | null;
  private highlightTimer?: ReturnType<typeof setTimeout>;

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
    if (this.highlightTimer) clearTimeout(this.highlightTimer);
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
    return !this.valuesMatch(this.pendingLeadStatuses, this.appliedLeadStatuses)
      || !this.valuesMatch(this.pendingLeadStates, this.appliedLeadStates)
      || this.pendingReferrer !== this.appliedReferrer
      || this.pendingSort !== this.appliedSort;
  }

  get filterHasValues(): boolean {
    return !this.pendingLeadStatuses.includes('All')
      || !this.pendingLeadStates.includes('All')
      || this.pendingReferrer !== 'All'
      || this.pendingSort !== 'recent';
  }

  get filterHasAppliedValues(): boolean {
    return !this.appliedLeadStatuses.includes('All')
      || !this.appliedLeadStates.includes('All')
      || this.appliedReferrer !== 'All'
      || this.appliedSort !== 'recent';
  }

  toggleFilterMenu(): void {
    if (!this.filterMenuOpen) {
      this.pendingLeadStatuses = [...this.appliedLeadStatuses];
      this.pendingLeadStates = [...this.appliedLeadStates];
      this.pendingReferrer = this.appliedReferrer;
      this.pendingSort = this.appliedSort;
    }

    this.filterMenuOpen = !this.filterMenuOpen;
  }

  resetPendingFilters(): void {
    this.pendingLeadStatuses = ['All'];
    this.pendingLeadStates = ['All'];
    this.pendingReferrer = 'All';
    this.pendingSort = 'recent';
  }

  applyFilters(): void {
    this.appliedLeadStatuses = [...this.pendingLeadStatuses];
    this.appliedLeadStates = [...this.pendingLeadStates];
    this.appliedReferrer = this.pendingReferrer;
    this.appliedSort = this.pendingSort;
    this.filterMenuOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  get filteredBoards(): readonly LeadBoardData[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();

    return this.boards.map((board) => ({
      ...board,
      leads: board.leads.filter((lead) => {
        const matchesName = !query || lead.name.toLocaleLowerCase().includes(query);
        const matchesSource = this.selectedSource === 'All Sources' || lead.source === this.selectedSource;
        const selectedStatuses = this.appliedLeadStatuses.map((status) => this.normalizeStatus(status));
        const matchesStatus = this.appliedLeadStatuses.includes('All')
          || lead.tags.some((tag) => selectedStatuses.includes(this.normalizeStatus(tag.label)));
        const matchesState = this.appliedLeadStates.includes('All') || this.appliedLeadStates.includes(lead.leadType);
        const matchesReferrer = this.appliedReferrer === 'All' || lead.referrer === this.appliedReferrer;
        return matchesName && matchesSource && matchesStatus && matchesState && matchesReferrer;
      }).sort((a, b) => {
        if (this.appliedSort === 'oldest') return a.createdAtTimestamp - b.createdAtTimestamp;
        if (this.appliedSort === 'name-asc') return a.name.localeCompare(b.name);
        if (this.appliedSort === 'name-desc') return b.name.localeCompare(a.name);
        return this.activityTimestamp(b) - this.activityTimestamp(a);
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

  markLeadAsContacted(leadId: string, notes = ''): LeadCardData | null {
    const leadBoard = this.boards.find((board) => board.id === 'lead');
    const contactedBoard = this.boards.find((board) => board.id === 'contacted');
    const lead = leadBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!leadBoard || !contactedBoard || !lead) return null;

    const contactedLead: LeadCardData = {
      ...lead,
      leadType: 'Active',
      lastActivityTimestamp: Date.now(),
      tags: [{ label: 'Contacted', tone: 'success' }],
      activities: [...lead.activities, this.createActivity('sales', 'Contacted', new Date(), notes)]
    };

    leadBoard.leads = leadBoard.leads.filter((candidate) => candidate.id !== leadId);
    contactedBoard.leads = [contactedLead, ...contactedBoard.leads];
    this.selectedLead = contactedLead;
    this.highlightLead(contactedLead.id);
    this.changeDetectorRef.markForCheck();
    return contactedLead;
  }

  scheduleLeadAppointment(leadId: string, appointment: LeadAppointment): LeadCardData | null {
    const contactedBoard = this.boards.find((board) => board.id === 'contacted');
    const appointmentsBoard = this.boards.find((board) => board.id === 'appointments');
    const lead = contactedBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!contactedBoard || !appointmentsBoard || !lead) return null;

    const scheduledLead: LeadCardData = {
      ...lead,
      leadType: 'Active',
      lastActivityTimestamp: Date.now(),
      appointment,
      tags: [
        { label: 'Appointment Set', tone: 'success' },
        { label: `${this.shortAppointmentDate(appointment.date)} · ${appointment.timeLabel}`, tone: 'info' }
      ],
      activities: [...lead.activities, this.createActivity('sales', 'Appointment Scheduled', new Date(), appointment.notes)]
    };

    contactedBoard.leads = contactedBoard.leads.filter((candidate) => candidate.id !== leadId);
    appointmentsBoard.leads = [scheduledLead, ...appointmentsBoard.leads];
    this.selectedLead = scheduledLead;
    this.highlightLead(scheduledLead.id);
    this.changeDetectorRef.markForCheck();
    return scheduledLead;
  }

  rescheduleLeadAppointment(leadId: string, appointment: LeadAppointment): LeadCardData | null {
    const appointmentsBoard = this.boards.find((board) => board.id === 'appointments');
    const lead = appointmentsBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!appointmentsBoard || !lead) return null;

    const activityDate = new Date();
    const rescheduledLead: LeadCardData = {
      ...lead,
      leadType: 'Active',
      lastActivityTimestamp: activityDate.getTime(),
      appointment,
      tags: [
        { label: 'Appointment Set', tone: 'success' },
        { label: `${this.shortAppointmentDate(appointment.date)} · ${appointment.timeLabel}`, tone: 'info' }
      ],
      activities: [...lead.activities, this.createActivity('sales', 'Appointment Rescheduled', activityDate, appointment.notes)]
    };

    appointmentsBoard.leads = [rescheduledLead, ...appointmentsBoard.leads.filter((candidate) => candidate.id !== leadId)];
    this.selectedLead = rescheduledLead;
    this.highlightLead(rescheduledLead.id);
    this.changeDetectorRef.markForCheck();
    return rescheduledLead;
  }

  cancelLeadAppointment(leadId: string, notes = ''): LeadCardData | null {
    const appointmentsBoard = this.boards.find((board) => board.id === 'appointments');
    const lead = appointmentsBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!appointmentsBoard || !lead) return null;

    const activityDate = new Date();
    const { appointment: _cancelledAppointment, ...leadWithoutAppointment } = lead;
    const cancelledLead: LeadCardData = {
      ...leadWithoutAppointment,
      leadType: 'Active',
      lastActivityTimestamp: activityDate.getTime(),
      tags: [{ label: 'Appointment Set', tone: 'success' }],
      activities: [...lead.activities, this.createActivity('sales', 'Appointment Canceled', activityDate, notes)]
    };

    appointmentsBoard.leads = [cancelledLead, ...appointmentsBoard.leads.filter((candidate) => candidate.id !== leadId)];
    this.selectedLead = cancelledLead;
    this.highlightLead(cancelledLead.id);
    this.changeDetectorRef.markForCheck();
    return cancelledLead;
  }

  completeLeadAppointment(leadId: string, notes = ''): LeadCardData | null {
    const appointmentsBoard = this.boards.find((board) => board.id === 'appointments');
    const meetingsBoard = this.boards.find((board) => board.id === 'meetings');
    const lead = appointmentsBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!appointmentsBoard || !meetingsBoard || !lead) return null;

    const meetingLead: LeadCardData = {
      ...lead,
      leadType: 'Active',
      lastActivityTimestamp: Date.now(),
      tags: [{ label: 'Meeting', tone: 'success' }],
      activities: [...lead.activities, this.createActivity('sales', 'Appointment Completed', new Date(), notes)]
    };

    appointmentsBoard.leads = appointmentsBoard.leads.filter((candidate) => candidate.id !== leadId);
    meetingsBoard.leads = [meetingLead, ...meetingsBoard.leads];
    this.selectedLead = meetingLead;
    this.highlightLead(meetingLead.id);
    this.changeDetectorRef.markForCheck();
    return meetingLead;
  }

  recordLeadFollowUp(leadId: string, notes = ''): LeadCardData | null {
    const meetingsBoard = this.boards.find((board) => board.id === 'meetings');
    const followUpBoard = this.boards.find((board) => board.id === 'follow-up');
    const lead = meetingsBoard?.leads.find((candidate) => candidate.id === leadId);

    if (!meetingsBoard || !followUpBoard || !lead) return null;

    const followUpLead: LeadCardData = {
      ...lead,
      leadType: 'Active',
      lastActivityTimestamp: Date.now(),
      tags: [{ label: 'Follow-up', tone: 'success' }],
      activities: [...lead.activities, this.createActivity('sales', 'Follow Up Created', new Date(), notes)]
    };

    meetingsBoard.leads = meetingsBoard.leads.filter((candidate) => candidate.id !== leadId);
    followUpBoard.leads = [followUpLead, ...followUpBoard.leads];
    this.selectedLead = followUpLead;
    this.highlightLead(followUpLead.id);
    this.changeDetectorRef.markForCheck();
    return followUpLead;
  }

  changeLeadState(leadId: string, state: Extract<LeadState, 'Reactivated' | 'Parked' | 'Dropped'>, details = ''): LeadCardData | null {
    const board = this.boards.find((candidate) => candidate.leads.some((lead) => lead.id === leadId));
    const lead = board?.leads.find((candidate) => candidate.id === leadId);

    if (!board || !lead) return null;

    const activityDate = new Date();
    const updatedLead: LeadCardData = {
      ...lead,
      leadType: state,
      lastActivityTimestamp: activityDate.getTime(),
      activities: [
        ...lead.activities,
        this.createActivity(
          'sales',
          state === 'Parked' ? 'Lead Parked' : state === 'Dropped' ? 'Lead Dropped' : 'Lead Reactivated',
          activityDate,
          details
        )
      ]
    };

    board.leads = [updatedLead, ...board.leads.filter((candidate) => candidate.id !== leadId)];
    this.selectedLead = updatedLead;
    this.highlightLead(updatedLead.id);
    this.changeDetectorRef.markForCheck();
    return updatedLead;
  }

  private highlightLead(leadId: string): void {
    if (this.highlightTimer) clearTimeout(this.highlightTimer);
    this.highlightedLeadId = leadId;
    this.highlightTimer = setTimeout(() => {
      this.highlightedLeadId = null;
      this.highlightTimer = undefined;
      this.changeDetectorRef.markForCheck();
    }, 3000);
  }

  private createBoards(): readonly LeadBoardData[] {
    const newLead: LeadTag = { label: 'New Lead', tone: 'primary' };
    const contacted: LeadTag = { label: 'Contacted', tone: 'success' };
    const appointmentSet: LeadTag = { label: 'Appointment Set', tone: 'success' };
    const meeting: LeadTag = { label: 'Meeting', tone: 'success' };
    const followUp: LeadTag = { label: 'Follow-up', tone: 'success' };
    const appointment: LeadTag = { label: 'Feb 2, 2026 · 2:00-3:00 PM', tone: 'info' };
    const sampleAppointment: LeadAppointment = {
      date: '2026-02-02',
      dateLabel: 'February 02, 2026',
      startMinutes: 14 * 60,
      endMinutes: 15 * 60,
      timeLabel: '2:00-3:00 PM'
    };
    const referrers = this.referrerOptions.slice(1);
    const createdOn = (day: number, hour: number, minute = 0): Date =>
      new Date(2026, 1, day, hour, minute);
    const lead = (
      id: string,
      name: string,
      gender: LeadGender,
      state: LeadState | boolean,
      source: string,
      tags: readonly LeadTag[],
      createdAt: Date,
      productInterested = 'Dream Builder',
      referrer = referrers[id.split('').reduce((total, character) => total + character.charCodeAt(0), 0) % referrers.length],
      appointmentDetails?: LeadAppointment
    ): LeadCardData => ({
      id,
      name,
      gender,
      createdAt: this.formatCreatedAt(createdAt),
      createdAtTimestamp: createdAt.getTime(),
      lastActivityTimestamp: createdAt.getTime(),
      leadType: typeof state === 'boolean' ? (state ? 'Active' : 'Inactive') : state,
      aging: '1d',
      source,
      referrer,
      productInterested,
      tags,
      appointment: appointmentDetails,
      activities: this.initialActivities(tags[0]?.label ?? 'New Lead', createdAt, appointmentDetails)
    });

    return [
      {
        id: 'lead',
        title: 'Lead',
        leads: [
          lead('lead-1', 'John Mark Doe', 'Male', false, 'Leads from store', [newLead], createdOn(3, 9, 15), 'Dream Builder', 'Maxwell Anderson'),
          lead('lead-2', 'Alice Johnson Smith', 'Female', false, 'Facebook ESTA', [newLead], createdOn(2, 13, 30)),
          lead('lead-3', 'Michael Lee Thompson', 'Male', false, 'EasyWay', [newLead], createdOn(1, 10, 45)),
          lead('lead-parked', 'Patricia Anne Reyes', 'Female', 'Parked', 'Referral', [newLead], new Date(2026, 0, 31, 15)),
          lead('lead-dropped', 'Daniel Joseph Cruz', 'Male', 'Dropped', 'Digital', [newLead], new Date(2026, 0, 30, 10, 30))
        ]
      },
      {
        id: 'contacted',
        title: 'Contacted',
        leads: [
          lead('contacted-1', 'Alex Morgan', 'Male', true, 'ESRA (NTB)', [contacted], createdOn(4, 11, 20)),
          lead('contacted-parked', 'Sophia Elaine Gomez', 'Female', 'Parked', 'Referral', [contacted], new Date(2026, 0, 31, 13, 15)),
          lead('contacted-dropped', 'Benjamin Luis Santos', 'Male', 'Dropped', 'Digital', [contacted], new Date(2026, 0, 30, 9, 45))
        ]
      },
      {
        id: 'appointments',
        title: 'Appointments',
        leads: [
          lead(
            'appointment-1',
            'Sarah Ann Thompson',
            'Female',
            true,
            'LMS (ETB)',
            [appointmentSet, appointment],
            createdOn(5, 14),
            'Dream Builder',
            'Maxwell Anderson',
            sampleAppointment
          ),
          lead('appointment-parked', 'Olivia Mae Navarro', 'Female', 'Parked', 'Branch', [appointmentSet], new Date(2026, 0, 31, 14, 30)),
          lead('appointment-dropped', 'Ethan Gabriel Ramos', 'Male', 'Dropped', 'Event', [appointmentSet], new Date(2026, 0, 30, 11))
        ]
      },
      {
        id: 'meetings',
        title: 'Meetings',
        leads: [
          lead(
            'meeting-1',
            'Emily Rose Carter',
            'Female',
            true,
            'Priority Banking (PB)',
            [meeting],
            createdOn(6, 9, 30),
            'Dream Builder',
            'Maxwell Anderson',
            sampleAppointment
          ),
          lead('meeting-parked', 'Isabella Rose Mendoza', 'Female', 'Parked', 'Referral', [meeting], new Date(2026, 0, 31, 16, 15)),
          lead('meeting-dropped', 'Liam Anthony Garcia', 'Male', 'Dropped', 'Digital', [meeting], new Date(2026, 0, 30, 15, 30))
        ]
      },
      {
        id: 'follow-up',
        title: 'Follow-Up',
        leads: [
          lead('follow-up-1', 'Alex Morgan Smith', 'Male', true, 'Leads from store', [followUp], createdOn(8, 16)),
          lead('follow-up-2', 'Emily Jane Cooper', 'Female', true, 'EWA Social Media', [followUp], createdOn(7, 10, 30)),
          lead('follow-up-3', 'Michael Lee Johnson', 'Male', true, 'CBG', [followUp], createdOn(6, 14, 15)),
          lead('follow-up-4', 'John Mark Doe', 'Male', true, 'CLC', [followUp], createdOn(5, 9)),
          lead('follow-up-7', 'Robert James Wilson', 'Male', true, 'Self-Generated Leads', [followUp], createdOn(4, 15, 45)),
          lead('follow-up-8', 'Laura Elizabeth Taylor', 'Female', true, 'Online Advertisements', [followUp], createdOn(3, 13, 30)),
          lead('follow-up-9', 'Christopher Paul Martinez', 'Male', true, 'EWA Marketing Events', [followUp], createdOn(2, 16, 20)),
          lead('follow-up-6', 'Jessica Marie Davis', 'Female', 'Parked', 'Physical Advertisements', [followUp], createdOn(1, 11, 45)),
          lead('follow-up-5', 'David Robert Brown', 'Male', 'Dropped', 'Existing Leads Campaign', [followUp], createdOn(1, 9, 15))
        ]
      }
    ];
  }

  private normalizeStatus(status: string): string {
    return status.toLocaleLowerCase().replaceAll('-', ' ').replaceAll(/\s+/g, ' ').trim();
  }

  private initialActivities(status: string, createdAt: Date, appointment?: LeadAppointment): readonly LeadActivityRecord[] {
    const activities: LeadActivityRecord[] = [this.createActivity('system', 'New Lead', createdAt)];

    if (status === 'Contacted' || status === 'Appointment Set' || status === 'Meeting') {
      activities.push(this.createActivity('sales', 'Contacted', createdAt));
    }
    if ((status === 'Appointment Set' || status === 'Meeting') && appointment) {
      activities.push(this.createActivity('sales', 'Appointment Scheduled', this.dateFromAppointment(appointment)));
    }
    if (status === 'Meeting') {
      activities.push(this.createActivity('sales', 'Appointment Completed', createdAt));
    }

    return activities;
  }

  private createActivity(category: LeadActivityCategory, label: string, value: Date, notes = ''): LeadActivityRecord {
    return {
      id: `${label.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-${value.getTime()}`,
      category,
      label,
      dateLabel: value.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      timeLabel: value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      occurredAtTimestamp: value.getTime(),
      ...(notes.trim() ? { notes: notes.trim() } : {})
    };
  }

  private dateFromAppointment(appointment: LeadAppointment): Date {
    const [year, month, day] = appointment.date.split('-').map(Number);
    return new Date(year, month - 1, day, Math.floor(appointment.startMinutes / 60), appointment.startMinutes % 60);
  }

  private shortAppointmentDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private activityTimestamp(lead: LeadCardData): number {
    return lead.lastActivityTimestamp ?? lead.createdAtTimestamp;
  }

  private formatCreatedAt(value: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = value.getDate().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    const period = value.getHours() >= 12 ? 'PM' : 'AM';
    const hour = value.getHours() % 12 || 12;

    return `${months[value.getMonth()]}/${day}/${value.getFullYear()} ∙ ${hour}:${minutes} ${period}`;
  }

  private valuesMatch(first: readonly string[], second: readonly string[]): boolean {
    return first.length === second.length && first.every((value) => second.includes(value));
  }

  private readonly handleDesktopBreakpointChange = (event: MediaQueryListEvent): void => {
    this.isDesktopViewport = event.matches;
    this.navigation.setSidebarOpen(event.matches);
    this.changeDetectorRef.markForCheck();
  };
}
