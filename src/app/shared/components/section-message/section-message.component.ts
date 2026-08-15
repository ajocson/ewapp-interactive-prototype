import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SectionMessageAppearance } from './section-message.model';

@Component({
  selector: 'tdx-section-message, app-section-message',
  templateUrl: './section-message.component.html',
  styleUrl: './section-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SectionMessageComponent {
  @Input() appearance: SectionMessageAppearance = 'info';
  @Input() icon = 'info';
  @Input() title = '';
  @Input() description = '';
  @Input() dismissible = false;
  @Output() dismissed = new EventEmitter<void>();

  get hostClass(): string { return `section-message--${this.appearance}`; }
}
