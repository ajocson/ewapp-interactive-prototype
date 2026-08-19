import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LeadCardData } from './lead-board.model';
import { AppNavigationStateService } from './shared/services/app-navigation-state.service';

@Component({
  selector: 'lam-root',
  template: `
    <div class="app-dashboard-host" [attr.inert]="selectedLead ? '' : null" [attr.aria-hidden]="selectedLead ? true : null">
      <lam-dashboard (leadOpened)="openLead($event)" />
    </div>
    <lam-lead-activity-drawer
      *ngIf="selectedLead && !draftSiOpen"
      [lead]="selectedLead"
      (closed)="closeLead()"
      (contacted)="markLeadAsContacted($event)"
      (draftSiRequested)="openDraftSi()"
    />
    <app-section-message
      *ngIf="activityRecorded"
      class="activity-toast"
      appearance="success"
      icon="check_circle"
      description="Your activity has been recorded."
    />
    <lam-draft-si-flow *ngIf="selectedLead && draftSiOpen" [lead]="selectedLead" (closed)="closeLead()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AppComponent {
  @ViewChild(DashboardComponent) private dashboard?: DashboardComponent;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigation = inject(AppNavigationStateService);
  selectedLead: LeadCardData | null = null;
  draftSiOpen = false;
  activityRecorded = false;

  constructor() {
    this.navigation.lcamBoardRequested
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeLead());
  }

  openLead(lead: LeadCardData): void {
    this.selectedLead = lead;
    this.draftSiOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  openDraftSi(): void {
    this.draftSiOpen = true;
    this.navigation.showLeadFlow();
    this.changeDetectorRef.markForCheck();
  }

  markLeadAsContacted(lead: LeadCardData): void {
    this.selectedLead = this.dashboard?.markLeadAsContacted(lead.id) ?? lead;
    this.activityRecorded = true;
    this.changeDetectorRef.markForCheck();
  }

  closeLead(): void {
    this.selectedLead = null;
    this.draftSiOpen = false;
    this.activityRecorded = false;
    this.navigation.activeDestination.set('lcam-board');
    this.changeDetectorRef.markForCheck();
  }
}
