import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TagTone } from '../../lead-board.model';

@Component({
  selector: 'lam-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrl: './status-tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StatusTagComponent {
  @Input({ required: true }) label = '';
  @Input() tone: TagTone = 'neutral';
}
