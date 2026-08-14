import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SideNavigationItem } from './side-navigation.model';

@Component({
  selector: 'lam-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SideNavigationComponent {
  readonly primaryItems: readonly SideNavigationItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard' },
    { label: 'LCAM Board', icon: 'view_week', active: true },
    { label: 'Applications', icon: 'contract_edit' },
    { label: 'Customers', icon: 'group' }
  ];

  readonly secondaryItems: readonly SideNavigationItem[] = [
    { label: 'Resources', icon: 'file_open' },
    { label: 'Learning', icon: 'school' },
    { label: 'Updates', icon: 'campaign' },
    { label: 'Sally', icon: '', asset: 'assets/sally.svg' }
  ];

  trackItem(index: number, item: SideNavigationItem): string {
    return item.label;
  }
}
