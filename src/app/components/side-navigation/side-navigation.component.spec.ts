import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LamComponentsModule } from '../lam-components.module';
import { SideNavigationComponent } from './side-navigation.component';

describe('SideNavigationComponent', () => {
  let fixture: ComponentFixture<SideNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LamComponentsModule] }).compileComponents();
    fixture = TestBed.createComponent(SideNavigationComponent);
    fixture.detectChanges();
  });

  it('identifies the LCAM Board as the current destination', () => {
    const activeItem = fixture.nativeElement.querySelector(
      '[aria-current="page"]'
    ) as HTMLButtonElement;

    expect(activeItem.textContent).toContain('LCAM Board');
  });

  it('renders all Figma navigation destinations and actions', () => {
    expect(fixture.nativeElement.textContent).toContain('Dashboard');
    expect(fixture.nativeElement.textContent).toContain('Applications');
    expect(fixture.nativeElement.textContent).toContain('Sally');
    expect(fixture.nativeElement.textContent).toContain('New Lead');
    expect(fixture.nativeElement.textContent).toContain('Draft SI');
  });
});
