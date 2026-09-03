import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import { TdxButtonSize, TdxButtonVariant } from '../button/button.model';

export interface TdxFieldControlOption {
  label: string;
  value: string;
  description?: readonly string[];
}

const FIELD_CONTROL_OPEN_EVENT = 'tdx-field-control-open';

@Component({
  selector: 'tdx-field-control, app-field-control',
  templateUrl: './field-control.component.html',
  styleUrl: './field-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class FieldControlComponent implements AfterViewInit, OnDestroy {
  @ViewChild('controlRoot') private controlRoot?: ElementRef<HTMLElement>;
  @ViewChild('optionsMenu') private optionsMenu?: ElementRef<HTMLElement>;
  @Input() label = '';
  @Input() ariaLabel = '';
  @Input() name = 'field-control';
  @Input() value = '';
  @Input() inputValue = '';
  @Input() inputType: 'number' | '' = '';
  @Input() inputPrefix = '';
  @Input() inputSuffix = '';
  @Input() inputPlaceholder = '';
  @Input() formatThousands = false;
  @Input() min?: number;
  @Input() step?: number;
  @Input() invalid = false;
  @Input() selectedValues: readonly string[] = [];
  @Input() options: readonly TdxFieldControlOption[] = [];
  @Input() leadingIcon = '';
  @Input() trailingIcon = '';
  @Input() width = 112;
  @Input() menuWidth = 250;
  @Input() menuFitContent = false;
  @Input() fluid = false;
  @Input() compact = false;
  @Input() multiple = false;
  @Input() allValue = 'All';
  @Input() allLabel = 'All';
  @Input() showMenuActions = false;
  @Input() resetDisabled = false;
  @Input() applyDisabled = false;
  @Input() disabled = false;
  @Input() showOptionDividers = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() inputValueChange = new EventEmitter<string>();
  @Output() selectedValuesChange = new EventEmitter<readonly string[]>();
  @Output() activated = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<boolean>();
  @Output() resetRequested = new EventEmitter<void>();
  @Output() applyRequested = new EventEmitter<void>();
  isOpen = false;
  inputFocused = false;
  menuPosition: { left: number; top: number; width: number; maxHeight: number } | null = null;
  private removeDocumentClickCaptureListener?: () => void;

  readonly buttonVariant = TdxButtonVariant;
  readonly buttonSize = TdxButtonSize;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const document = this.controlRoot?.nativeElement.ownerDocument;
    if (!document) return;

    document.addEventListener('click', this.handleDocumentClickCapture, true);
    this.removeDocumentClickCaptureListener = () => {
      document.removeEventListener('click', this.handleDocumentClickCapture, true);
    };
  }

  ngOnDestroy(): void {
    this.removeDocumentClickCaptureListener?.();
  }

  updateValue(value: string): void {
    this.valueChange.emit(value);
    this.closeMenu();
  }

  onInputValueChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    if (this.inputType === 'number') {
      value = value.replace(/[^0-9.]/g, '');
      const decimalIndex = value.indexOf('.');
      if (decimalIndex >= 0) {
        value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex + 1).replaceAll('.', '');
      }
      input.value = value;
    }
    this.inputValueChange.emit(this.formatThousands ? this.formatThousandsValue(value) : value);
  }

  onInputFocus(event: Event): void {
    this.inputFocused = true;
    if (this.formatThousands) {
      (event.target as HTMLInputElement).value = this.formatThousandsValue(this.inputValue);
    }
  }

  onInputBlur(event: Event): void {
    this.inputFocused = false;
    if (this.formatThousands && this.inputValue && this.inputSuffix) {
      (event.target as HTMLInputElement).value = `${this.formatThousandsValue(this.inputValue)}${this.inputSuffix}`;
    }
  }

  formatThousandsValue(value: string): string {
    const normalized = value.replaceAll(',', '');
    if (!normalized) return '';
    const [whole] = normalized.split('.');
    const formattedWhole = whole.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedWhole;
  }

  toggleValue(value: string): void {
    if (value === this.allValue) {
      this.selectedValuesChange.emit([this.allValue]);
      return;
    }

    const current = this.selectedValues.filter((selected) => selected !== this.allValue);
    const next = current.includes(value)
      ? current.filter((selected) => selected !== value)
      : [...current, value];
    this.selectedValuesChange.emit(next.length ? next : [this.allValue]);
  }

  isSelected(value: string): boolean {
    return this.multiple ? this.selectedValues.includes(value) : this.value === value;
  }

  get displayValue(): string {
    if (!this.multiple) return this.value || this.label;
    const selected = this.selectedValues.filter((value) => value !== this.allValue);
    if (!selected.length) return this.allLabel;
    return selected.length === 1 ? selected[0] : `${selected.length} selected`;
  }

  toggleOptions(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      this.openChange.emit(this.isOpen);
      if (this.isOpen) {
        this.announceOpen();
        setTimeout(() => this.positionOptionsMenu());
      } else {
        this.menuPosition = null;
      }
    }
  }

  activate(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.announceOpen();
      this.activated.emit();
    }
  }

  requestReset(event: MouseEvent): void {
    event.stopPropagation();
    this.resetRequested.emit();
  }

  requestApply(event: MouseEvent): void {
    event.stopPropagation();
    this.applyRequested.emit();
    this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  closeOptions(): void {
    this.closeMenu();
  }

  @HostListener('document:pointerdown', ['$event'])
  @HostListener('document:mousedown', ['$event'])
  closeOnPointerDownOutside(event: Event): void {
    this.closeOnOutsideInteraction(event);
  }

  @HostListener(`document:${FIELD_CONTROL_OPEN_EVENT}`, ['$event'])
  closeWhenAnotherFieldControlOpens(event: Event): void {
    if (event.target !== this.controlRoot?.nativeElement) this.closeMenu();
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  repositionOptions(): void {
    if (this.isOpen) this.positionOptionsMenu();
  }

  private closeMenu(): void {
    if (this.isOpen) this.openChange.emit(false);
    this.isOpen = false;
    this.menuPosition = null;
  }

  private announceOpen(): void {
    this.controlRoot?.nativeElement.dispatchEvent(
      new Event(FIELD_CONTROL_OPEN_EVENT, { bubbles: true })
    );
  }

  private readonly handleDocumentClickCapture = (event: Event): void => {
    this.closeOnOutsideInteraction(event);
  };

  private closeOnOutsideInteraction(event: Event): void {
    const control = this.controlRoot?.nativeElement;
    if (this.isOpen && control && event.target instanceof Node && !control.contains(event.target)) {
      this.closeMenu();
    }
  }

  private positionOptionsMenu(): void {
    const control = this.controlRoot?.nativeElement;
    const menu = this.optionsMenu?.nativeElement;
    const viewport = control?.ownerDocument.defaultView;
    if (!control || !menu || !viewport) return;

    const gutter = 8;
    const gap = 8;
    const controlRect = control.getBoundingClientRect();
    const optionContentWidth = Math.max(
      menu.scrollWidth,
      ...Array.from(menu.children).map((child) => child.scrollWidth)
    );
    const preferredWidth = this.menuFitContent
      ? Math.ceil(optionContentWidth)
      : this.fluid
        ? controlRect.width
        : this.menuWidth;
    const width = Math.min(
      preferredWidth,
      Math.max(0, viewport.innerWidth - gutter * 2)
    );
    const naturalHeight = Math.min(menu.scrollHeight || menu.offsetHeight, 624);
    const belowTop = controlRect.bottom + gap;
    const availableBelow = viewport.innerHeight - belowTop - gutter;
    const availableAbove = controlRect.top - gap - gutter;
    const openBelow = availableBelow >= naturalHeight || availableBelow >= availableAbove;
    const maxHeight = Math.max(0, Math.min(624, openBelow ? availableBelow : availableAbove));
    let left = controlRect.right - width;

    if (left < gutter) left = controlRect.left;
    left = Math.min(Math.max(left, gutter), Math.max(gutter, viewport.innerWidth - width - gutter));

    const top = openBelow
      ? belowTop
      : Math.max(gutter, controlRect.top - gap - Math.min(naturalHeight, maxHeight));

    this.menuPosition = { left, top, width, maxHeight };
    this.changeDetectorRef.markForCheck();
  }
}
