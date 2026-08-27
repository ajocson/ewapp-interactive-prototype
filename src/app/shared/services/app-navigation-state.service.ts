import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type AppNavigationDestination = 'lcam-board' | 'lead-flow' | 'applications';

@Injectable({ providedIn: 'root' })
export class AppNavigationStateService {
  readonly isSidebarOpen = signal(false);
  readonly activeDestination = signal<AppNavigationDestination>('lcam-board');

  private readonly lcamBoardRequests = new Subject<void>();
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
}
