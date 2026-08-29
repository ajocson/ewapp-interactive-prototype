import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Route activation anchor; the LCAM UI continues to be coordinated by AppComponent. */
@Component({
  selector: 'lam-route-anchor',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LcamRouteComponent {}
