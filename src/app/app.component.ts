import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LeadCardData } from './lead-board.model';
import { AppNavigationStateService } from './shared/services/app-navigation-state.service';

@Component({
  selector: 'lam-root',
  template: `
    <div class="app-dashboard-host" [attr.inert]="selectedLead ? '' : null" [attr.aria-hidden]="selectedLead ? true : null">
      <lam-dashboard (leadOpened)="openLead($event)" />
    </div>
    <lam-draft-si-flow *ngIf="selectedLead" [lead]="selectedLead" (closed)="closeLead()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigation = inject(AppNavigationStateService);
  selectedLead: LeadCardData | null = null;

  constructor() {
    this.navigation.lcamBoardRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeLead());
  }

  openLead(lead: LeadCardData): void {
    this.selectedLead = lead;
    this.navigation.showLeadFlow();
  }

  closeLead(): void {
    this.selectedLead = null;
    this.navigation.activeDestination.set('lcam-board');
    this.changeDetectorRef.markForCheck();
  }
}
