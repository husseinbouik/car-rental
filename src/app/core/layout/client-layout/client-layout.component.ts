import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// MatSidenavModule is not strictly needed for a Tailwind flexbox layout
// import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router, RouterOutlet } from '@angular/router'; // Import RouterOutlet
import { ClientNavbarComponent } from '../client-navbar/client-navbar.component'; // Adjust path
import { ClientSidebarComponent } from '../client-sidebar/client-sidebar.component'; // Adjust path

@Component({
  selector: 'app-client-layout',
  standalone: true, // Assuming standalone, adjust if part of a module
  imports: [
    CommonModule,
    ClientNavbarComponent,
    ClientSidebarComponent,
    RouterModule, // Required for router-outlet and routerLink in children
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css' // CSS file for layout adjustments
})
export class ClientLayoutComponent {
  isSidebarCollapsed = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Method to check if the current route should *not* have the layout
  isLayoutExcludedRoute(): boolean {
    // Add all routes here that should be full-page without the header/sidebar layout
    // Use startsWith or exact path matching depending on your routing setup
    const excludedRoutes = [
      '/',
      '/login',
      '/signup',
      '/reset-password-request',
      '/reset-password',
      '/verify-email',
      '/admin/',
    ];

    if (this.router.url.startsWith('/vehicles')) {
      return false;
    }
     if (this.router.url.startsWith('/my-reservations')) {
      return false;
    }
    // Check if the current URL starts with any of the excluded routes
    return excludedRoutes.some(route => this.router.url.startsWith(route));
  }
}
