import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../features/client/auth.service'; // Adjust path as necessary

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  faBars = faBars;
  faSun = faSun;
  faMoon = faMoon;
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  isDarkMode = false; // Initial state: light mode
  currentLang: string = 'en'; // Add currentLang property

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private authService: AuthService // Inject Auth Service
  ) {
    this.translate.setDefaultLang('en');  // Default language
    this.translate.use('en');  // Use English initially
    this.currentLang = 'en'; // Initialize currentLang
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const darkMode = localStorage.getItem('darkMode'); // Retrieve user preference
      if (darkMode === 'enabled') {
        this.isDarkMode = true;
        document.body.classList.add('dark-mode');
      }

      // Initialize language
      const savedLang = localStorage.getItem('language');
      if (savedLang && this.translate.getLangs().includes(savedLang)) {
        this.currentLang = savedLang;
        this.translate.use(savedLang);
      }
    }
  }

  simpleLogout(): void {
   this.authService.logout(); // Call the logout method from AuthService
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
    this.currentLang = lang;
    this.translate.use(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
    }
  }
}
