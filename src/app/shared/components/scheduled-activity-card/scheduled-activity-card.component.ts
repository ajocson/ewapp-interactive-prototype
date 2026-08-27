import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'tdx-scheduled-activity-card, app-scheduled-activity-card',
  templateUrl: './scheduled-activity-card.component.html',
  styleUrl: './scheduled-activity-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ScheduledActivityCardComponent {
  @Input() title = 'Appointment Scheduled';
  @Input({ required: true }) date = '';
  @Input({ required: true }) time = '';
  @Output() reschedule = new EventEmitter<void>();
  @Output() cancelAppointment = new EventEmitter<void>();

}
