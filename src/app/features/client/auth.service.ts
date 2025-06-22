// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // Request password reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password-request`, { email });
  }

  logout(): void {
    // Clear authentication tokens or user data here
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('client_id');
    // Redirect to login or home page
    window.location.href = '/login';
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  // Verify email with token
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-email`, {
      params: { token }
    }).pipe(
      catchError(error => {
        let errorMsg = 'Échec de la vérification';
        if (error.error?.message) {
          errorMsg = error.error.message;
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        const currentTime = Date.now() / 1000;
        if (payload.exp < currentTime) {
          this.logout(); // Token expired, logout user
          return false;
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token') || localStorage.getItem('authToken');
  }

  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  }

  getCurrentClientId(): number | null {
    const clientId = localStorage.getItem('client_id');
    return clientId ? parseInt(clientId, 10) : null;
  }

  // Method to validate token with backend
  validateToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/auth/validate`, { headers }).pipe(
      catchError(error => {
        console.error('Token validation failed:', error);
        this.logout();
        return throwError(() => new Error('Token validation failed'));
      })
    );
  }
}
