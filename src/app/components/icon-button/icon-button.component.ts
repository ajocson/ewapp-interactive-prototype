import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lam-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class IconButtonComponent {
  @Input({ required: true }) icon = '';
  @Input({ required: true }) label = '';
  @Input() tooltip = '';
  @Input() tooltipPosition: 'top' | 'bottom' = 'top';
  @Input() tooltipAlign: 'center' | 'end' = 'center';
  @Input() emphasis: 'default' | 'transparent' = 'transparent';
  @Input() disabled = false;
  @Input() filled = true;
  @Input() size: 'small' | 'medium' | 'icon' = 'small';
  @Input() ariaControls = '';
  @Input() expanded: boolean | null = null;
  @Output() activated = new EventEmitter<void>();

  get tooltipText(): string {
    return this.tooltip || this.label;
  }
}
