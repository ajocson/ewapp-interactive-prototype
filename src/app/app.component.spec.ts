import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { LeadActivityDrawerComponent } from './components/lead-activity-drawer/lead-activity-drawer.component';
import { DashboardComponent } from './dashboard/dashboard.component';

describe('AppComponent LCAM activity feedback', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('closes the drawer, announces success after the design delay, and highlights the moved contacted lead', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'lead')?.leads[0];
    expect(lead).toBeTruthy();

    fixture.componentInstance.openLead(lead!);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-lead-activity-drawer')).toBeTruthy();

    fixture.componentInstance.markLeadAsContacted({ lead: lead!, notes: '' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('lam-lead-activity-drawer')).toBeNull();
    expect(fixture.nativeElement.querySelector('.activity-toast')).toBeNull();
    expect(dashboard.filteredBoards.find((board) => board.id === 'contacted')?.leads[0].id).toBe(lead!.id);
    expect(dashboard.highlightedLeadId).toBe(lead!.id);
    expect(fixture.nativeElement.querySelector('.lead-card--highlighted')?.textContent).toContain(lead!.name);
    vi.advanceTimersByTime(800);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Your activity has been recorded.');
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('uses the appointment-specific success message when a contact is scheduled', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'contacted')?.leads[0];
    expect(lead).toBeTruthy();

    fixture.componentInstance.scheduleLeadAppointment({
      lead: lead!,
      appointment: {
        date: '2026-08-24',
        dateLabel: 'August 24, 2026',
        startMinutes: 15 * 60,
        endMinutes: 15 * 60 + 30,
        timeLabel: '3:00-3:30 PM'
      }
    });
    vi.advanceTimersByTime(800);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Appointment has been scheduled.');
    expect(dashboard.filteredBoards.find((board) => board.id === 'appointments')?.leads[0].id).toBe(lead!.id);
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('reschedules an appointment in place and records the exact success feedback', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'appointments')!.leads.find((candidate) => candidate.appointment)!;
    const appointment = {
      date: '2026-08-25',
      dateLabel: 'August 25, 2026',
      startMinutes: 16 * 60,
      endMinutes: 16 * 60 + 30,
      timeLabel: '4:00-4:30 PM'
    };

    fixture.componentInstance.rescheduleLeadAppointment({ lead, appointment });
    vi.advanceTimersByTime(800);
    fixture.detectChanges();

    const updated = dashboard.boards.find((board) => board.id === 'appointments')!.leads[0];
    expect(updated.id).toBe(lead.id);
    expect(updated.appointment).toEqual(appointment);
    expect(updated.activities.at(-1)?.label).toBe('Appointment Rescheduled');
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Appointment has been rescheduled.');
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('cancels an appointment, removes its schedule, and leaves it available to schedule again', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'appointments')!.leads.find((candidate) => candidate.appointment)!;

    fixture.componentInstance.cancelLeadAppointment({ lead, notes: 'Client requested a new date.' });
    vi.advanceTimersByTime(800);
    fixture.detectChanges();

    const updated = dashboard.boards.find((board) => board.id === 'appointments')!.leads[0];
    expect(updated.id).toBe(lead.id);
    expect(updated.appointment).toBeUndefined();
    expect(updated.tags).toEqual([{ label: 'Appointment Set', tone: 'success' }]);
    expect(updated.activities.at(-1)?.label).toBe('Appointment Canceled');
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Your appointment has been canceled.');
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('closes the drawer and confirms when a meeting is marked for follow-up', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'meetings')?.leads[0];
    expect(lead).toBeTruthy();

    fixture.componentInstance.openLead(lead!);
    fixture.detectChanges();
    fixture.componentInstance.recordLeadFollowUp({ lead: lead!, notes: 'Call next week.' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('lam-lead-activity-drawer')).toBeNull();
    expect(dashboard.filteredBoards.find((board) => board.id === 'follow-up')?.leads[0].id).toBe(lead!.id);
    vi.advanceTimersByTime(800);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Lead marked for follow-up.');
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('closes the drawer and confirms when a lead is parked or dropped', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'lead')!.leads[0];

    fixture.componentInstance.openLead(lead);
    fixture.componentInstance.changeLeadState({ lead, state: 'Parked', details: 'Pause requested.' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('lam-lead-activity-drawer')).toBeNull();
    expect(dashboard.boards.find((board) => board.id === 'lead')!.leads[0].leadType).toBe('Parked');
    vi.advanceTimersByTime(800);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Lead has been parked.');

    vi.advanceTimersByTime(4000);
    const parkedLead = dashboard.boards.find((board) => board.id === 'lead')!.leads[0];
    fixture.componentInstance.openLead(parkedLead);
    fixture.componentInstance.changeLeadState({ lead: parkedLead, state: 'Dropped', details: 'Client is no longer interested' });
    vi.advanceTimersByTime(800);
    fixture.detectChanges();

    expect(dashboard.boards.find((board) => board.id === 'lead')!.leads[0].leadType).toBe('Dropped');
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Lead has been dropped.');
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('requires the Figma confirmation dialog before parking a lead', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'lead')!.leads.find((candidate) => candidate.leadType === 'Inactive')!;

    fixture.componentInstance.openLead(lead);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(LeadActivityDrawerComponent)).componentInstance as LeadActivityDrawerComponent;
    drawer.openLeadAction('park');
    drawer.confirmLeadAction();
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.lead-state-modal') as HTMLElement;
    expect(modal.textContent).toContain('Park Lead?');
    expect(modal.textContent).toContain('You can reactivate it anytime to continue.');
    expect(dashboard.boards.find((board) => board.id === 'lead')!.leads.find((candidate) => candidate.id === lead.id)?.leadType).toBe('Inactive');

    drawer.confirmStateChange();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lead-state-modal')).toBeNull();
    expect(dashboard.boards.find((board) => board.id === 'lead')!.leads[0].leadType).toBe('Parked');
    expect(dashboard.highlightedLeadId).toBe(lead.id);
    vi.advanceTimersByTime(4800);
    vi.useRealTimers();
  });

  it('requires an explanation when Others is selected as the drop reason', () => {
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'lead')!.leads.find((candidate) => candidate.leadType === 'Inactive')!;

    fixture.componentInstance.openLead(lead);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(LeadActivityDrawerComponent)).componentInstance as LeadActivityDrawerComponent;
    drawer.openLeadAction('drop');
    drawer.dropReasonChanged('Others');
    fixture.detectChanges();

    expect(drawer.isDropActionDisabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.drawer-drop-other textarea')?.getAttribute('placeholder')).toBe('Add reason for dropping');
    drawer.dropOtherReason = 'Customer is relocating.';
    expect(drawer.isDropActionDisabled).toBe(false);
  });

  it('requires confirmation before reactivation and uses the exact success toast', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const lead = dashboard.boards.find((board) => board.id === 'meetings')!.leads.find((candidate) => candidate.leadType === 'Dropped')!;

    fixture.componentInstance.openLead(lead);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(LeadActivityDrawerComponent)).componentInstance as LeadActivityDrawerComponent;
    drawer.reactivateLead();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.lead-state-modal')?.textContent).toContain('Reactivate Lead?');
    expect(dashboard.boards.find((board) => board.id === 'meetings')!.leads.find((candidate) => candidate.id === lead.id)?.leadType).toBe('Dropped');

    drawer.confirmStateChange();
    vi.advanceTimersByTime(800);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Lead reactivated successfully.');
    expect(dashboard.boards.find((board) => board.id === 'meetings')!.leads[0].leadType).toBe('Reactivated');
    expect(dashboard.highlightedLeadId).toBe(lead.id);
    vi.advanceTimersByTime(4000);
    vi.useRealTimers();
  });

  it('renders the Figma paused-state drawer and reactivates parked and dropped leads', () => {
    vi.useFakeTimers();
    const dashboard = fixture.debugElement.query(By.directive(DashboardComponent)).componentInstance as DashboardComponent;
    const pausedLeads = [
      dashboard.boards.find((board) => board.id === 'appointments')!.leads.find((lead) => lead.leadType === 'Parked')!,
      dashboard.boards.find((board) => board.id === 'meetings')!.leads.find((lead) => lead.leadType === 'Dropped')!
    ];

    for (const lead of pausedLeads) {
      fixture.componentInstance.openLead(lead);
      fixture.detectChanges();

      const summary = fixture.nativeElement.querySelector('.drawer-state-summary') as HTMLElement;
      expect(summary).toBeTruthy();
      expect(summary.textContent).toContain(lead.leadType === 'Parked' ? 'Lead Parked' : 'Lead Dropped');
      expect(summary.textContent).toContain('Reactivate Lead');
      expect((summary.querySelector('img') as HTMLImageElement).getAttribute('src')).toContain(
        lead.leadType === 'Parked' ? 'lead-parked.svg' : 'lead-dropped.svg'
      );
      expect(fixture.nativeElement.querySelector('.drawer-contact')).toBeNull();
      expect(fixture.nativeElement.querySelector('.drawer-lead-actions')).toBeNull();

      fixture.componentInstance.changeLeadState({ lead, state: 'Reactivated', details: '' });
      vi.advanceTimersByTime(800);
      fixture.detectChanges();

      expect(dashboard.boards.flatMap((board) => board.leads).find((candidate) => candidate.id === lead.id)?.leadType).toBe('Reactivated');
      expect(fixture.nativeElement.querySelector('.activity-toast')?.textContent).toContain('Lead reactivated successfully.');
      vi.advanceTimersByTime(4000);
    }

    vi.useRealTimers();
  });
});
