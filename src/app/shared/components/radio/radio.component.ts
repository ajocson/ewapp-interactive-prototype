import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TdxRadioValue } from './radio.model';

@Component({
  selector: 'tdx-radio, app-radio',
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class RadioComponent {
  @Input() label = 'Label';
  @Input() name = 'radio';
  @Input() value: TdxRadioValue = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Output() changed = new EventEmitter<TdxRadioValue>();

  select(): void {
    if (!this.disabled) this.changed.emit(this.value);
  }
}
