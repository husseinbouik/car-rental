// src/app/access-denied/access-denied.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: false,
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}
