import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFieldComponent } from './search-field.component';
import { SearchFieldModule } from './search-field.module';

describe('SearchFieldComponent', () => {
  let fixture: ComponentFixture<SearchFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SearchFieldModule] }).compileComponents();
    fixture = TestBed.createComponent(SearchFieldComponent);
    fixture.componentInstance.ariaLabel = 'Search by lead name';
    fixture.detectChanges();
  });

  it('emits user input and exposes an accessible label', () => {
    const values: string[] = [];
    fixture.componentInstance.valueChange.subscribe(value => values.push(value));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Sarah';
    input.dispatchEvent(new Event('input'));
    expect(values).toEqual(['Sarah']);
    expect(input.getAttribute('aria-label')).toBe('Search by lead name');
  });

  it('clears a populated value', () => {
    const values: string[] = [];
    fixture.componentRef.setInput('value', 'Sarah');
    fixture.componentInstance.valueChange.subscribe(value => values.push(value));
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('.tdx-search-field__clear') as HTMLButtonElement;
    expect(clearButton.textContent).toContain('cancel');
    clearButton.click();
    expect(values).toEqual(['']);
  });
});
