import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioComponent } from './radio.component';
import { RadioModule } from './radio.module';

describe('RadioComponent', () => {
  let fixture: ComponentFixture<RadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RadioModule] }).compileComponents();
    fixture = TestBed.createComponent(RadioComponent);
  });

  it('renders the TDX radio state and emits the selected value', () => {
    const values: string[] = [];
    fixture.componentRef.setInput('label', 'Recently Created');
    fixture.componentRef.setInput('name', 'sort');
    fixture.componentRef.setInput('value', 'recent');
    fixture.componentRef.setInput('checked', true);
    fixture.componentInstance.changed.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Recently Created');
    input.dispatchEvent(new Event('change'));
    expect(values).toEqual(['recent']);
  });
});
