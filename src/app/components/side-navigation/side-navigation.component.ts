import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

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
  @Output() newLeadRequested = new EventEmitter<void>();
  @Output() draftSiRequested = new EventEmitter<void>();
  @Output() generateProposalRequested = new EventEmitter<void>();
  constructor(
    readonly navigation: AppNavigationStateService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  prototypeMenuOpen = false;
  scenarioSearchTerm = '';

  readonly prototypeScenarioGroups: readonly SideNavigationScenarioGroup[] = [
    {
      label: 'API / Data handling',
      scenarios: [
        { label: 'LCAM Board loading API error', path: '/lcam/board-loading-api-error' },
        { label: 'LCAM Page search API error', path: '/lcam/page-search-api-error' },
      ]
    },
    {
      label: 'Access / Request handling',
      scenarios: [
        { label: 'LCAM Side drawer loading API error', path: '/lcam/side-drawer-loading-api-error' },
        { label: 'Convert to Application API error', path: '/lcam/convert-application-api-error' }
      ]
    }
  ];

  get filteredPrototypeScenarioGroups(): readonly SideNavigationScenarioGroup[] {
    const searchTerm = this.scenarioSearchTerm.trim().toLowerCase();

    if (!searchTerm) return this.prototypeScenarioGroups;

    return this.prototypeScenarioGroups
      .map(group => ({
        ...group,
        scenarios: group.scenarios.filter(scenario =>
          group.label.toLowerCase().includes(searchTerm)
          || scenario.label.toLowerCase().includes(searchTerm)
        )
      }))
      .filter(group => group.scenarios.length > 0);
  }

  readonly primaryItems: readonly SideNavigationItem[] = [
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

  togglePrototypeMenu(): void {
    this.prototypeMenuOpen = !this.prototypeMenuOpen;
  }

  closePrototypeMenu(): void {
    this.prototypeMenuOpen = false;
    this.scenarioSearchTerm = '';
  }

  @HostListener('document:click', ['$event.target'])
  closePrototypeMenuWhenClickingOutside(target: EventTarget | null): void {
    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.closePrototypeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closePrototypeMenuOnEscape(): void {
    this.closePrototypeMenu();
  }
}

interface SideNavigationScenarioGroup {
  label: string;
  scenarios: readonly SideNavigationScenario[];
}

interface SideNavigationScenario {
  label: string;
  path?: string;
  comingSoon?: boolean;
}
