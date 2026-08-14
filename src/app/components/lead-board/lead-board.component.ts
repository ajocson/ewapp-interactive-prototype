import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LeadBoardData, LeadCardData } from '../../lead-board.model';

@Component({
  selector: 'lam-lead-board',
  templateUrl: './lead-board.component.html',
  styleUrl: './lead-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadBoardComponent {
  @Input({ required: true }) board!: LeadBoardData;
  @Output() leadSelected = new EventEmitter<LeadCardData>();
  @Output() searchRequested = new EventEmitter<string>();
  @Output() sortRequested = new EventEmitter<string>();

  trackLead(index: number, lead: LeadCardData): string {
    return lead.id;
  }
}
