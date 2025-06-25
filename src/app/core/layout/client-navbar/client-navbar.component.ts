import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Import specific icons needed
import { faBars, faSun, faMoon, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router'; // Import Router
import { AuthService } from '../../../features/client/auth.service'; // Import Auth Service (Adjust path)
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-client-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule, FormsModule],
  templateUrl: './client-navbar.component.html',
  styleUrl: './client-navbar.component.css' // Your custom CSS for var(--primary-color) etc.
})
export class ClientNavbarComponent {
  // Font Awesome Icons
  faBars = faBars;
  faSun = faSun;
  faMoon = faMoon;
  faUserCircle = faUserCircle; // Icon for user dropdown/avatar

  // Output to signal sidebar toggle to the layout component
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  // Dark Mode State
  isDarkMode = false;

  // Language State
  currentLang: string; // Initialize in constructor or ngOnInit

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router, // Inject Router
    private authService: AuthService // Inject Auth Service
  ) {
      // Initialize currentLang with default before ngOnInit check
      this.currentLang = this.translate.getDefaultLang() || 'en';
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize Dark Mode
      const darkMode = localStorage.getItem('darkMode');
      this.isDarkMode = darkMode === 'enabled';
      // Apply dark mode class to body based on preference (CSS uses body.dark-mode)
      document.body.classList.toggle('dark-mode', this.isDarkMode);

      // Initialize Language
      const savedLang = localStorage.getItem('language');
      const availableLangs = this.translate.getLangs();

      if (savedLang && availableLangs.includes(savedLang)) {
         this.currentLang = savedLang;
      } else {
        const browserLang = this.translate.getBrowserLang();
         this.currentLang = browserLang && availableLangs.includes(browserLang) ? browserLang : this.translate.getDefaultLang() || 'en';
      }
       this.translate.use(this.currentLang);
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
       // Toggle 'dark-mode' class on the body element
      document.body.classList.toggle('dark-mode', this.isDarkMode);

      localStorage.setItem('darkMode', this.isDarkMode ? 'enabled' : 'disabled'); // Store user preference
    }
  }

  // Emits event to parent layout to toggle sidebar state
  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  // Handles language selection change
  switchLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
     if (isPlatformBrowser(this.platformId)) {
         this.translate.use(lang);
         localStorage.setItem('language', lang); // Store language preference
         this.currentLang = lang; // Update component state
     }
  }

  // --- Authentication methods (re-using from layout) ---
  isLoggedIn(): boolean {
      return this.authService.isLoggedIn(); // Use your Auth Service
  }

  logout(): void {
    // Implement logout logic here (e.g., clear token, navigate to login)
    this.authService.logout(); // Use your Auth Service
    this.router.navigate(['/login']); // Redirect after logout (adjust route)
  }

   // Optional: Get display name for the logged-in user
   getUserDisplayName(): string {
     // Replace with logic to get the logged-in user's name/email from authService
     // e.g., return this.authService.getCurrentUser()?.name || 'User';
      return 'Client User'; // Placeholder
   }

}
