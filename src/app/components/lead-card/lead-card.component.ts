import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LeadCardData } from '../../lead-board.model';

@Component({
  selector: 'lam-lead-card',
  templateUrl: './lead-card.component.html',
  styleUrl: './lead-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LeadCardComponent {
  @Input({ required: true }) lead!: LeadCardData;
  @Output() selected = new EventEmitter<LeadCardData>();

  trackTag(index: number): number {
    return index;
  }
}
