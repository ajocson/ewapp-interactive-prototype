import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LamComponentsModule } from '../lam-components.module';
import { GlobalHeaderComponent } from './global-header.component';

describe('GlobalHeaderComponent', () => {
  let fixture: ComponentFixture<GlobalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LamComponentsModule] }).compileComponents();
    fixture = TestBed.createComponent(GlobalHeaderComponent);
    fixture.detectChanges();
  });

  it('renders the shared LCAM actions and profile', () => {
    expect(fixture.nativeElement.querySelector('[aria-label="Global search"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Notifications"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Open EA profile"]')?.textContent).toBe('EA');
  });

  it('updates the shared state when navigation is toggled', () => {
    expect(fixture.componentInstance.navigation.isSidebarOpen()).toBe(false);
    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.navigation.isSidebarOpen()).toBe(true);
  });
});
