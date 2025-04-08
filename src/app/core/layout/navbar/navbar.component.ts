import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  faBars = faBars;
  faSun = faSun;
  faMoon = faMoon;
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  isDarkMode = false; // Initial state: light mode
  constructor(private translate: TranslateService, @Inject(PLATFORM_ID) private platformId: object, private router: Router) {
    this.translate.setDefaultLang('en');  // Default language
    this.translate.use('en');  // Use English initially
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const darkMode = localStorage.getItem('darkMode'); // Retrieve user preference
      if (darkMode === 'enabled') {
        this.isDarkMode = true;
        document.body.classList.add('dark-mode');
      }
    }
  }
  simpleLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', this.isDarkMode ? 'enabled' : 'disabled'); // Store user preference
    }
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  switchLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    this.translate.use(lang);
  }
}
