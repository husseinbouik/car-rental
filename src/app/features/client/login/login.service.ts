import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
// src/app/services/login.service.ts
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}
// Add these methods to your existing LoginService
hasRole(roleName: string): boolean {
  const token = this.getDecodedToken();
  if (!token || !token.authorities) return false;
  return token.authorities.includes(roleName);
}

private getDecodedToken(): any {
  const token = this.getToken();
  return token ? new JwtHelperService().decodeToken(token) : null;
}
  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const loginPayload = {
      username: username,
      password: password,
    };

    return this.http.post(`${this.apiUrl}/auth/login`, loginPayload, { headers }).pipe(
      tap((response: any) => {
        // Adjust the property name based on your backend's response
        const token = response.token || response.access_token || response.jwt;

        if (token) {
          localStorage.setItem('access_token', token);
          console.log('JWT saved to localStorage');
        } else {
          console.warn('No token found in the login response');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    console.log('Logged out and token removed');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
