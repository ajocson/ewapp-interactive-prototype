import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TdxButtonEmphasis, TdxButtonIcon, TdxButtonSize, TdxButtonVariant } from './button.model';

@Component({
  selector: 'tdx-button, app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ButtonComponent {
  @Input() label = 'Button';
  @Input() variant: TdxButtonVariant = TdxButtonVariant.Primary;
  @Input() emphasis: TdxButtonEmphasis = TdxButtonEmphasis.Default;
  @Input() size: TdxButtonSize = TdxButtonSize.Medium;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() leftIcon: TdxButtonIcon = null;
  @Input() rightIcon: TdxButtonIcon = null;
  @Input() filledIcons = false;
  @Input() ariaLabel?: string;
  @Input() ariaExpanded?: boolean;
  @Input() ariaControls?: string;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get isLoading(): boolean { return this.loading && !this.disabled; }
  get isInteractionDisabled(): boolean { return this.disabled || this.isLoading; }

  get resolvedEmphasis(): TdxButtonEmphasis {
    return this.variant === TdxButtonVariant.Subtle ? TdxButtonEmphasis.Default : this.emphasis;
  }

  get buttonClasses(): Record<string, boolean> {
    return {
      [`tdx-button--${this.variant}`]: true,
      [`tdx-button--${this.resolvedEmphasis}`]: true,
      [`tdx-button--${this.size}`]: true,
      'tdx-button--loading': this.isLoading,
      'tdx-button--filled-icons': this.filledIcons,
      'tdx-button--icon-only': !this.label && Boolean(this.leftIcon || this.rightIcon)
    };
  }

  handleClick(event: MouseEvent): void {
    if (this.isInteractionDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit(event);
  }
}
