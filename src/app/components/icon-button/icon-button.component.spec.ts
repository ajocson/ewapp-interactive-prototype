import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconButtonComponent } from './icon-button.component';
import { LamComponentsModule } from '../lam-components.module';

describe('IconButtonComponent', () => {
  let fixture: ComponentFixture<IconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LamComponentsModule] }).compileComponents();
    fixture = TestBed.createComponent(IconButtonComponent);
    fixture.componentRef.setInput('icon', 'search');
    fixture.componentRef.setInput('label', 'Search');
    fixture.detectChanges();
  });

  it('uses a semantic button with an accessible name', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Search');
  });

  it('supports a bottom-aligned tooltip without changing the accessible name', () => {
    fixture.componentRef.setInput('tooltip', 'Find lead');
    fixture.componentRef.setInput('tooltipPosition', 'bottom');
    fixture.componentRef.setInput('tooltipAlign', 'end');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('data-tooltip')).toBe('Find lead');
    expect(button.getAttribute('aria-label')).toBe('Search');
    expect(button.classList.contains('icon-button--tooltip-bottom')).toBe(true);
    expect(button.classList.contains('icon-button--tooltip-end')).toBe(true);
  });

  it('can hide its visual tooltip without removing its accessible name', () => {
    fixture.componentRef.setInput('showTooltip', false);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.hasAttribute('data-tooltip')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Search');
    expect(button.classList.contains('icon-button--has-tooltip')).toBe(false);
  });

  it('supports Figma-aligned subtle and bare icon treatments', () => {
    fixture.componentRef.setInput('emphasis', 'default');
    fixture.componentRef.setInput('size', 'icon');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('icon-button--default')).toBe(true);
    expect(button.classList.contains('icon-button--icon')).toBe(true);
  });

  it('supports an interaction treatment without hover or pressed backgrounds', () => {
    fixture.componentRef.setInput('interactionBackground', 'none');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('icon-button--no-interaction-background')).toBe(true);
  });
});
