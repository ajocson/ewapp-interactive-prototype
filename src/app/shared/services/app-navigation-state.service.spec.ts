import { TestBed } from '@angular/core/testing';

import { AppNavigationStateService } from './app-navigation-state.service';

describe('AppNavigationStateService', () => {
  let service: AppNavigationStateService;

  beforeEach(() => service = TestBed.inject(AppNavigationStateService));

  it('keeps sidebar visibility shared across pages', () => {
    service.setSidebarOpen(true);
    service.toggleSidebar();
    expect(service.isSidebarOpen()).toBe(false);
  });

  it('returns to the LCAM board and emits a navigation request', () => {
    const requested = vi.fn();
    service.lcamBoardRequested.subscribe(requested);
    service.showLeadFlow();
    service.goToLcamBoard();
    expect(service.activeDestination()).toBe('lcam-board');
    expect(requested).toHaveBeenCalledOnce();
  });
});
