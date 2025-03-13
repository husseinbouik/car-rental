import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars ,faSun ,faMoon} from '@fortawesome/free-solid-svg-icons';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FontAwesomeModule,TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
faBars = faBars;
faSun = faSun;
faMoon = faMoon;
@Output() toggleSidebarEvent = new EventEmitter<void>();
isDarkMode = false; // Initial state: light mode

toggleDarkMode() {
  this.isDarkMode = !this.isDarkMode;
  document.body.classList.toggle('dark-mode', this.isDarkMode);
  localStorage.setItem('darkMode', this.isDarkMode ? 'enabled' : 'disabled'); // Store user preference
}

ngOnInit() {
  const darkMode = localStorage.getItem('darkMode'); // Retrieve user preference
  if (darkMode === 'enabled') {
    this.isDarkMode = true;
    document.body.classList.add('dark-mode');
  }
}
  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }
 constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');  // Default language
    this.translate.use('en');  // Use English initially
  }
   // Function to switch language
   switchLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    this.translate.use(lang);
  }
}
