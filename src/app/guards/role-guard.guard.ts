// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { LoginService } from '../features/client/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkUserRole(next);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkUserRole(next);
  }

  private checkUserRole(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string> || [];

    if (!this.loginService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!requiredRoles.some(role => this.loginService.hasRole(role))) {
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}
