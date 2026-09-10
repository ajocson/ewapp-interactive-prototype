import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LamComponentsModule } from '../lam-components.module';
import { SideNavigationComponent } from './side-navigation.component';

describe('SideNavigationComponent', () => {
  let fixture: ComponentFixture<SideNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LamComponentsModule, RouterTestingModule.withRoutes([])] }).compileComponents();
    fixture = TestBed.createComponent(SideNavigationComponent);
    fixture.detectChanges();
  });

  it('identifies the LCAM Board as the current destination', () => {
    const activeItem = fixture.nativeElement.querySelector(
      '[aria-current="page"]'
    ) as HTMLButtonElement;

    expect(activeItem.textContent).toContain('LCAM Board');
  });

  it('uses the default state away from the LCAM board and navigates back when clicked', () => {
    fixture.componentInstance.navigation.showLeadFlow();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')).toBeNull();

    const lcamButton = Array.from(fixture.nativeElement.querySelectorAll('.side-navigation__item') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('LCAM Board')) as HTMLButtonElement;
    lcamButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')).toBe(lcamButton);
  });

  it('renders the available navigation destinations and actions', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Dashboard');
    expect(fixture.nativeElement.textContent).toContain('Applications');
    expect(fixture.nativeElement.textContent).toContain('Sally');
    expect(fixture.nativeElement.textContent).toContain('New Lead');
    expect(fixture.nativeElement.textContent).toContain('Draft SI');
  });

  it('opens the prototype scenario navigator with the available API handling link', () => {
    const trigger = fixture.nativeElement.querySelector('.prototype-scenarios__trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.prototype-scenarios__menu').textContent).toContain('LCAM Board loading API error');
    const scenarioLinks = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const boardErrorLink = scenarioLinks.find(link => link.textContent?.includes('LCAM Board loading API error')) as HTMLAnchorElement;
    const pageSearchErrorLink = scenarioLinks.find(link => link.textContent?.includes('LCAM Page search API error')) as HTMLAnchorElement;
    expect(boardErrorLink.getAttribute('href')).toContain('/lcam/board-loading-api-error');
    expect(pageSearchErrorLink.getAttribute('href')).toContain('/lcam/page-search-api-error');
    expect(fixture.nativeElement.textContent).toContain('LCAM Page search API error');
    expect(fixture.nativeElement.querySelector('[aria-label="Search prototype scenarios"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.prototype-scenarios__scope')).toBeNull();
  });

  it('filters prototype scenarios from the menu search', () => {
    const trigger = fixture.nativeElement.querySelector('.prototype-scenarios__trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector('[aria-label="Search prototype scenarios"]') as HTMLInputElement;
    search.value = 'drawer';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Side drawer loading');
    expect(fixture.nativeElement.textContent).not.toContain('LCAM Board loading API error');
  });

  it('closes the prototype scenario navigator with Escape', () => {
    const trigger = fixture.nativeElement.querySelector('.prototype-scenarios__trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
