import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TdxSearchFieldSize } from './search-field.model';

@Component({
  selector: 'tdx-search-field, app-search-field',
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SearchFieldComponent {
  @Input() value = '';
  @Input() placeholder = 'Search';
  @Input() ariaLabel = 'Search';
  @Input() name = 'search';
  @Input() size: TdxSearchFieldSize = 'medium';
  @Input() compact = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();
  @Output() focused = new EventEmitter<void>();

  updateValue(value: string): void {
    this.valueChange.emit(value);
  }

  clear(): void {
    this.valueChange.emit('');
    this.cleared.emit();
  }
}
