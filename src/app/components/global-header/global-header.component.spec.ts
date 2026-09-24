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
    const searchButton = fixture.nativeElement.querySelector('[aria-label="Search"]') as HTMLButtonElement;
    expect(searchButton).not.toBeNull();
    expect(searchButton.textContent).toContain('Search');
    expect(searchButton.classList.contains('tdx-button--subtle')).toBe(true);
    expect(searchButton.classList.contains('tdx-button--small')).toBe(true);
    expect(searchButton.classList.contains('tdx-button--filled-icons')).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Notifications"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Open EA profile"]')?.textContent).toBe('BA');
  });

  it('uses the design-system small subtle icon-only Search button for the mobile header', () => {
    const iconButton = fixture.nativeElement.querySelector('.global-header__search-icon button') as HTMLButtonElement;
    expect(iconButton).not.toBeNull();
    expect(iconButton.getAttribute('aria-label')).toBe('Search');
    expect(iconButton.querySelector('.material-symbols-rounded')?.textContent).toBe('search');
    expect(iconButton.classList.contains('tdx-button--icon-only')).toBe(true);
    expect(iconButton.getAttribute('data-variant')).toBe('subtle');
    expect(iconButton.getAttribute('data-emphasis')).toBe('default');
    expect(iconButton.getAttribute('data-size')).toBe('small');
  });

  it('updates the shared state when navigation is toggled', () => {
    expect(fixture.componentInstance.navigation.isSidebarOpen()).toBe(false);
    (fixture.nativeElement.querySelector('[aria-controls="primary-navigation"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.navigation.isSidebarOpen()).toBe(true);
  });
});
