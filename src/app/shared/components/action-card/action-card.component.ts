import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ActionCardTone } from './action-card.model';

@Component({
  selector: 'lam-action-card',
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ActionCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() icon = 'person';
  @Input() tone: ActionCardTone = 'brand';
  @Output() activated = new EventEmitter<void>();
}

