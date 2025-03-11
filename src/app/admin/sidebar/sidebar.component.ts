import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine, faCar, faCalendarAlt, faUsers, faCreditCard, faUserCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule ,
    FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  faChartLine = faChartLine;
  faCar = faCar;
  faCalendarAlt = faCalendarAlt;
  faUsers = faUsers;
  faCreditCard = faCreditCard;
  faUserCog = faUserCog;
  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
