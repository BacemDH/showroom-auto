import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

@Component({
  imports: [FontAwesomeModule],
  selector: 'app-head-bar',
  styleUrl: './head-bar.css',
  templateUrl: './head-bar.html',
})
export class HeadBar {
  faMoon = faMoon;
  faSun = faSun;

  @Input() theme: 'light' | 'dark' = 'light';
  @Output() toggleTheme = new EventEmitter<void>();
}
