import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { ClientNavbarComponent } from '../client-navbar/client-navbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  imports: [CommonModule, MatSidenavModule,RouterModule, ClientNavbarComponent],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent {
 isSidebarCollapsed = false;
  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  isLoginPage(): boolean {
    return this.router.url.includes('/login') || this.router.url.includes('/reset-password-request')|| this.router.url.includes('/signup')|| this.router.url.includes('/reset-password')|| this.router.url.includes('/verify-email');
  }
}
