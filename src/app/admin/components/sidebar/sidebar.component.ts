import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule to use routerLink

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ Make it a standalone component
  imports: [MatListModule, RouterModule], // ✅ Include RouterModule for routing to work
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'], // ✅ Fix the property name
})
export class SidebarComponent {}
