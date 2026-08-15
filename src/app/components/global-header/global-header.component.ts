import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppNavigationStateService } from '../../shared/services/app-navigation-state.service';

@Component({
  selector: 'lam-global-header',
  templateUrl: './global-header.component.html',
  styleUrl: './global-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GlobalHeaderComponent {
  constructor(readonly navigation: AppNavigationStateService) {}
}
