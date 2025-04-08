import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule } from '@angular/router';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, MatSidenavModule,RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;
  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  isLoginPage(): boolean {
    return this.router.url.includes('/login') || this.router.url.includes('/reset-password-request')|| this.router.url.includes('/signup')|| this.router.url.includes('/reset-password')|| this.router.url.includes('/verify-email');
  }
}
