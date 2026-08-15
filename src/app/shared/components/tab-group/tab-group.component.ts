import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TdxTabAlignment, TdxTabItem } from './tab-group.model';

@Component({
  selector: 'tdx-tab-group, app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TabGroupComponent {
  @Input() tabs: TdxTabItem[] = [];
  @Input() activeId = '';
  @Input() alignment: TdxTabAlignment = 'left';
  @Input() ariaLabel = 'Sections';
  @Output() activeIdChange = new EventEmitter<string>();

  get hostClasses(): Record<string, boolean> {
    return { [`tdx-tab-group--${this.alignment}`]: true };
  }

  select(tab: TdxTabItem): void {
    if (!tab.disabled && tab.id !== this.activeId) this.activeIdChange.emit(tab.id);
  }

  trackById(_: number, tab: TdxTabItem): string {
    return tab.id;
  }
}
