import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { LeadCardData } from '../../lead-board.model';

export type AppNavigationDestination = 'lcam-board' | 'lead-flow' | 'applications';

@Injectable({ providedIn: 'root' })
export class AppNavigationStateService {
  readonly isSidebarOpen = signal(false);
  readonly activeDestination = signal<AppNavigationDestination>('lcam-board');

  private readonly lcamBoardRequests = new Subject<void>();
  private readonly applicationsRequests = new Subject<void>();
  private readonly submittedApplications: LeadCardData[] = [];
  readonly highlightedApplicationLeadId = signal<string | null>(null);
  private submittedApplicationHighlightTimer?: ReturnType<typeof setTimeout>;
  readonly lcamBoardRequested = this.lcamBoardRequests.asObservable();
  readonly applicationsRequested = this.applicationsRequests.asObservable();

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  setSidebarOpen(open: boolean): void {
    this.isSidebarOpen.set(open);
  }

  showLeadFlow(): void {
    this.activeDestination.set('lead-flow');
  }

  goToLcamBoard(): void {
    this.activeDestination.set('lcam-board');
    this.lcamBoardRequests.next();
  }

  goToApplications(): void {
    this.activeDestination.set('applications');
    this.applicationsRequests.next();
  }

  submitApplication(lead: LeadCardData): void {
    const index = this.submittedApplications.findIndex((candidate) => candidate.leadId === lead.leadId);
    if (index >= 0) this.submittedApplications[index] = lead;
    else this.submittedApplications.unshift(lead);
    if (this.submittedApplicationHighlightTimer) clearTimeout(this.submittedApplicationHighlightTimer);
    this.highlightedApplicationLeadId.set(lead.leadId);
    this.submittedApplicationHighlightTimer = setTimeout(() => {
      this.highlightedApplicationLeadId.set(null);
      this.submittedApplicationHighlightTimer = undefined;
    }, 3000);
  }

  applicationSubmissions(): readonly LeadCardData[] {
    return this.submittedApplications;
  }

  latestSubmittedApplicationLeadId(): string | null {
    return this.highlightedApplicationLeadId();
  }
}
