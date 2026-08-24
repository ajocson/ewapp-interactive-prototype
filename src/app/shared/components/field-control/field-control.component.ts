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
  @Input() selectedValues: readonly string[] = [];
  @Input() options: readonly TdxFieldControlOption[] = [];
  @Input() leadingIcon = '';
  @Input() trailingIcon = '';
  @Input() width = 112;
  @Input() menuWidth = 250;
  @Input() fluid = false;
  @Input() compact = false;
  @Input() multiple = false;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() selectedValuesChange = new EventEmitter<readonly string[]>();
  @Output() activated = new EventEmitter<void>();
  isOpen = false;

  updateValue(value: string): void {
    this.valueChange.emit(value);
    this.isOpen = false;
  }

  toggleValue(value: string): void {
    if (value === 'All') {
      this.selectedValuesChange.emit(['All']);
      return;
    }

    const current = this.selectedValues.filter((selected) => selected !== 'All');
    const next = current.includes(value)
      ? current.filter((selected) => selected !== value)
      : [...current, value];
    this.selectedValuesChange.emit(next.length ? next : ['All']);
  }

  isSelected(value: string): boolean {
    return this.multiple ? this.selectedValues.includes(value) : this.value === value;
  }

  get displayValue(): string {
    if (!this.multiple) return this.value || this.label;
    const selected = this.selectedValues.filter((value) => value !== 'All');
    if (!selected.length) return 'All';
    return selected.length === 1 ? selected[0] : `${selected.length} selected`;
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
