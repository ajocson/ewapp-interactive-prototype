import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LeadCardData } from '../lead-board.model';

@Component({
  selector: 'lam-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrl: './lead-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadDetailComponent {
  @Input({ required: true }) lead!: LeadCardData;
  @Output() backRequested = new EventEmitter<void>();

  activeTab = 'Overview';
  readonly tabs = ['Overview', 'Activities', 'Notes'];

  selectTab(tab: string): void {
    this.activeTab = tab;
  }
}
