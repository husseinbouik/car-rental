import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, Input } from '@angular/core';
import {
  faChartLine,
  faCar,
  faCalendarAlt,
  faUsers,
  faCreditCard,
  faUserCog,
  faBars,
  faTimes,
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [FontAwesomeModule,RouterLink, RouterModule,TranslateModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  faChartLine = faChartLine;
  faCar = faCar;
  faCalendarAlt = faCalendarAlt;
  faUsers = faUsers;
  faCreditCard = faCreditCard;
  faUserCog = faUserCog;
  faBars = faBars;
  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;



  sidebarItems = [
    { label: 'SIDEBAR.DASHBOARD', icon: this.faChartLine, link: '/admin/dashboard' },
    { label: 'SIDEBAR.VEHICLES', icon: this.faCar, link: '/admin/vehicles' },
    { label: 'SIDEBAR.RESERVATIONS', icon: this.faCalendarAlt, link: '/admin/reservations' },
    { label: 'SIDEBAR.CLIENTS', icon: this.faUsers, link: '/admin/clients' },
    { label: 'SIDEBAR.PAYMENTS', icon: this.faCreditCard, link: '/admin/payments' },
    { label: 'SIDEBAR.USER_MANAGEMENT', icon: this.faUserCog, link: '/admin/user-management' },
  ];

  isSidebarOpen = true;


  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
}
}
