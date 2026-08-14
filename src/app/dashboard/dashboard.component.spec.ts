import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../app.module';
import { DashboardComponent } from './dashboard.component';

class MockDesktopMediaQuery {
  matches = true;
  private listener?: (event: MediaQueryListEvent) => void;

  addEventListener(type: string, listener: (event: MediaQueryListEvent) => void): void {
    if (type === 'change') {
      this.listener = listener;
    }
  }

  removeEventListener(): void {
    this.listener = undefined;
  }

  setMatches(matches: boolean): void {
    this.matches = matches;
    this.listener?.({ matches } as MediaQueryListEvent);
  }
}

describe('DashboardComponent sidebar', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let desktopMediaQuery: MockDesktopMediaQuery;

  beforeEach(async () => {
    desktopMediaQuery = new MockDesktopMediaQuery();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => desktopMediaQuery
    });

    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('opens automatically on desktop and can be toggled from the global header', () => {
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeTruthy();

    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeFalsy();

    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeTruthy();
  });

  it('hides at tablet size and opens as a dismissible overlay when requested', () => {
    desktopMediaQuery.setMatches(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeFalsy();

    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeTruthy();

    (fixture.nativeElement.querySelector('.sidebar-backdrop') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('lam-side-navigation')).toBeFalsy();
  });
});
