import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SideNavigationItem } from './side-navigation.model';
import { AppNavigationStateService } from '../../shared/services/app-navigation-state.service';

@Component({
  selector: 'lam-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SideNavigationComponent {
  constructor(readonly navigation: AppNavigationStateService) {}

  readonly primaryItems: readonly SideNavigationItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard' },
    { label: 'LCAM Board', icon: 'view_week' },
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

  isActive(item: SideNavigationItem): boolean {
    return (item.label === 'LCAM Board' && this.navigation.activeDestination() === 'lcam-board')
      || (item.label === 'Applications' && this.navigation.activeDestination() === 'applications');
  }

  selectItem(item: SideNavigationItem): void {
    if (item.label === 'LCAM Board') this.navigation.goToLcamBoard();
    if (item.label === 'Applications') this.navigation.goToApplications();
  }
}
