import { Component, Input, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Import TranslateModule and Service
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Import FontAwesome
// Import necessary icons
import { faCarSide, faBook, faUser, faSignOutAlt, faChevronLeft, faCar, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../features/client/auth.service'; // Import Auth Service (Adjust path)
import { ClientInfoService, ClientInfo } from '../../../features/client/services/client-info.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router'; // Import Router
import { Subscription } from 'rxjs';

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
export class ClientSidebarComponent implements OnInit, OnDestroy {
  // Input to control collapsed state from the layout component
  @Input() isCollapsed = false;

  // Font Awesome Icons
  faCarSide = faCarSide;
  faBook = faBook;
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;
  faChevronLeft = faChevronLeft;
  faCar = faCar;
  faCalendarAlt = faCalendarAlt;

  // Client Info
  clientInfo: ClientInfo | null = null;
  private clientInfoSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService, // Inject Auth Service
    private router: Router, // Inject Router
    private translate: TranslateService, // Inject TranslateService for tooltips etc.
    private clientInfoService: ClientInfoService, // Inject ClientInfoService
    @Inject(PLATFORM_ID) private platformId: object // Inject PLATFORM_ID for browser check
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      this.loadClientInfo();
    }
  }

  ngOnDestroy() {
    if (this.clientInfoSubscription) {
      this.clientInfoSubscription.unsubscribe();
    }
  }

  loadClientInfo() {
    this.clientInfoSubscription = this.clientInfoService.clientInfo$.subscribe(
      clientInfo => {
        this.clientInfo = clientInfo;
      }
    );

    // Load client info from API
    this.clientInfoService.loadClientInfo().subscribe();
  }

  logout(): void {
    // This method is now called directly from the sidebar template button
    console.log("Logout clicked in sidebar"); // Debug
    this.authService.logout(); // Use your Auth Service logout method
    this.clientInfoService.clearClientInfo(); // Clear client info on logout
    if (isPlatformBrowser(this.platformId)) {
       this.router.navigate(['/login']); // Navigate after logout
    }
  }

  // Method to check if a route is active
  isActive(route: string): boolean {
    // Remove leading slash for relative path comparison
    const currentUrl = this.router.url.replace(/^\//, '');
    const routePath = route.replace(/^\//, '');
    return currentUrl === routePath || currentUrl.startsWith(routePath + '/');
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

  // Get display name for the user
  getUserDisplayName(): string {
    return this.clientInfoService.getDisplayName();
  }
}
