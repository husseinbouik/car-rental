import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'; // Corrected path
import { JwtHelperService } from '@auth0/angular-jwt'; // Import the JWT helper

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.apiBaseUrl;
  private jwtHelper: JwtHelperService = new JwtHelperService(); // Instantiate JwtHelperService

  constructor(private http: HttpClient) {}

  // Added method to determine the user's role
  hasRole(roleName: string): boolean {
    const token = this.getToken();
    if (!token) {
      return false; // Or handle the case where no token exists differently
    }

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // Adjust the property name based on how roles are stored in your JWT
      if (decodedToken && decodedToken.authorities) {
        return decodedToken.authorities.includes(roleName); // Assuming roles is an array of strings
      }
      return false;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false; // Handle token decoding errors gracefully
    }
  }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const loginPayload = {
      username: username,
      password: password,
    };

    return this.http
      .post(`${this.apiUrl}/auth/login`, loginPayload, { headers })
      .pipe(
        tap((response: any) => {
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
