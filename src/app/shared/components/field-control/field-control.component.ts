import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface TdxFieldControlOption {
  label: string;
  value: string;
}

@Component({
  selector: 'tdx-field-control, app-field-control',
  templateUrl: './field-control.component.html',
  styleUrl: './field-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class FieldControlComponent {
  @Input() label = '';
  @Input() ariaLabel = '';
  @Input() name = 'field-control';
  @Input() value = '';
  @Input() options: readonly TdxFieldControlOption[] = [];
  @Input() leadingIcon = '';
  @Input() trailingIcon = '';
  @Input() width = 112;
  @Input() menuWidth = 250;
  @Input() compact = false;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() activated = new EventEmitter<void>();
  isOpen = false;

  updateValue(value: string): void {
    this.valueChange.emit(value);
    this.isOpen = false;
  }

  toggleOptions(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  activate(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) this.activated.emit();
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  closeOptions(): void {
    this.isOpen = false;
  }
}
