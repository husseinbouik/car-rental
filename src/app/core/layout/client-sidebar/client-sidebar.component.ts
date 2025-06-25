import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Import TranslateModule and Service
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Import FontAwesome
// Import necessary icons
import { faHome, faCarSide, faBook, faUser, faSignOutAlt, faChevronLeft, faCar, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../features/client/auth.service'; // Import Auth Service (Adjust path)
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-client-sidebar',
  standalone: true, // Assuming standalone
  imports: [
    CommonModule,
    RouterModule, // Allows use of routerLink
    TranslateModule, // Allows use of translate pipe
    FontAwesomeModule // Allows use of fa-icon
  ],
  templateUrl: './client-sidebar.component.html',
  styleUrl: './client-sidebar.component.css'
})
export class ClientSidebarComponent {
  // Input to control collapsed state from the layout component
  @Input() isCollapsed = false;

  // Font Awesome Icons
  faHome = faHome;
  faCarSide = faCarSide;
  faBook = faBook;
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;
  faChevronLeft = faChevronLeft;
  faCar = faCar;
  faCalendarAlt = faCalendarAlt;


  constructor(
    private authService: AuthService, // Inject Auth Service
    private router: Router, // Inject Router
    private translate: TranslateService, // Inject TranslateService for tooltips etc.
    @Inject(PLATFORM_ID) private platformId: object // Inject PLATFORM_ID for browser check
  ) {}

  logout(): void {
    // This method is now called directly from the sidebar template button
    console.log("Logout clicked in sidebar"); // Debug
    this.authService.logout(); // Use your Auth Service logout method
    if (isPlatformBrowser(this.platformId)) {
       this.router.navigate(['/login']); // Navigate after logout
    }
  }

  // Method to check if a route is active
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Method to toggle collapse (alias for toggleOwnCollapse for template compatibility)
  toggleCollapse(): void {
    this.toggleOwnCollapse();
  }

  // Optional: Method to be called when the Collapse button inside the sidebar is clicked
  // If toggle happens from Navbar, this isn't needed here, but if sidebar has its own toggle button...
  toggleOwnCollapse() {
    // If the collapse is only driven by the Input, this wouldn't be needed.
    // If the sidebar itself has a button to trigger collapse, it would emit an Output like Navbar
    console.log("Sidebar internal toggle clicked (if implemented)");
  }
}
