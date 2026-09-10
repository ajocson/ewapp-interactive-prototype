import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { TdxSearchFieldSize } from './search-field.model';

@Component({
  selector: 'tdx-search-field, app-search-field',
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SearchFieldComponent implements AfterViewInit {
  @Input() value = '';
  @Input() placeholder = 'Search';
  @Input() ariaLabel = 'Search';
  @Input() name = 'search';
  @Input() size: TdxSearchFieldSize = 'medium';
  @Input() compact = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearable = true;
  @Input() clearDisabled = false;
  private _focusState = false;
  @Input()
  set focusState(value: boolean) {
    this._focusState = value;
    if (value) this.focusInput();
  }
  get focusState(): boolean {
    return this._focusState;
  }
  @Output() valueChange = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();
  @Output() focused = new EventEmitter<void>();

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    if (this.focusState) this.focusInput();
  }

  updateValue(value: string): void {
    this.valueChange.emit(value);
  }

  clear(): void {
    this.valueChange.emit('');
    this.cleared.emit();
  }

  private focusInput(): void {
    queueMicrotask(() => this.searchInput?.nativeElement.focus());
  }
}
