import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { LeadCardData } from '../../lead-board.model';

export type AppNavigationDestination = 'lcam-board' | 'lead-flow' | 'applications';

@Injectable({ providedIn: 'root' })
export class AppNavigationStateService {
  readonly isSidebarOpen = signal(false);
  readonly activeDestination = signal<AppNavigationDestination>('lcam-board');

  private readonly lcamBoardRequests = new Subject<void>();
  private readonly submittedApplications: LeadCardData[] = [];
  readonly lcamBoardRequested = this.lcamBoardRequests.asObservable();

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
  }

  submitApplication(lead: LeadCardData): void {
    const index = this.submittedApplications.findIndex((candidate) => candidate.leadId === lead.leadId);
    if (index >= 0) this.submittedApplications[index] = lead;
    else this.submittedApplications.unshift(lead);
  }

  applicationSubmissions(): readonly LeadCardData[] {
    return this.submittedApplications;
  }
}
