import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';
import { ButtonModule } from './button.module';
import { TdxButtonEmphasis, TdxButtonSize } from './button.model';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonModule] }).compileComponents();
    fixture = TestBed.createComponent(ButtonComponent);
  });

  it('renders the TDX size and emphasis contract', () => {
    fixture.componentRef.setInput('label', 'Record Activity');
    fixture.componentRef.setInput('size', TdxButtonSize.Small);
    fixture.componentRef.setInput('emphasis', TdxButtonEmphasis.Outline);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Record Activity');
    expect(button.dataset['size']).toBe('small');
    expect(button.dataset['emphasis']).toBe('outline');
  });

  it('prevents interaction while disabled', () => {
    const clicked = vi.fn();
    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.clicked.subscribe(clicked);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    expect(clicked).not.toHaveBeenCalled();
  });
});
