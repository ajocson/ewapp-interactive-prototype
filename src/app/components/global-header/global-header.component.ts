import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppNavigationStateService } from '../../shared/services/app-navigation-state.service';
import { TdxButtonSize, TdxButtonVariant } from '../../shared/components/button/button.model';

@Component({
  selector: 'lam-global-header',
  templateUrl: './global-header.component.html',
  styleUrl: './global-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GlobalHeaderComponent {
  readonly buttonSize = TdxButtonSize;
  readonly buttonVariant = TdxButtonVariant;

  constructor(readonly navigation: AppNavigationStateService) {}
}
