import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

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
