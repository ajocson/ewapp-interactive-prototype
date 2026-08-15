import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabGroupComponent } from './tab-group.component';
import { TabGroupModule } from './tab-group.module';

describe('TabGroupComponent', () => {
  let fixture: ComponentFixture<TabGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabGroupModule] }).compileComponents();
    fixture = TestBed.createComponent(TabGroupComponent);
    fixture.componentInstance.tabs = [{ id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity Timeline' }];
    fixture.componentInstance.activeId = 'overview';
    fixture.detectChanges();
  });

  it('renders the selected tab with accessible state', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('emits a selectable tab id', () => {
    let selectedId = '';
    fixture.componentInstance.activeIdChange.subscribe(id => selectedId = id);
    fixture.nativeElement.querySelectorAll('[role="tab"]')[1].click();
    expect(selectedId).toBe('activity');
  });
});
