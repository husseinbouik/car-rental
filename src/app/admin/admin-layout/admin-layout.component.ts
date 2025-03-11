import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
export class AdminLayoutComponent {}
