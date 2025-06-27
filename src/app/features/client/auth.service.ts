// auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  // Helper method to safely access localStorage
  private getLocalStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  // Request password reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password-request`, { email });
  }

  logout(): void {
    // Clear authentication tokens or user data here
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem('access_token');
      storage.removeItem('authToken');
      storage.removeItem('user_id');
      storage.removeItem('client_id');
    }

    // Redirect to login or home page
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/login';
    }
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
    console.log('=== AUTH SERVICE - isLoggedIn CHECK ===');

    const token = this.getToken();
    console.log('Token from getToken():', token ? 'Token present' : 'No token');

    if (!token) {
      console.log('No token found, user not logged in');
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      console.log('Decoded payload:', payload);

      if (payload && payload.exp) {
        const currentTime = Date.now() / 1000;
        console.log('Token expiration check:', { exp: payload.exp, currentTime, isExpired: payload.exp < currentTime });

        if (payload.exp < currentTime) {
          console.log('Token is expired, logging out user');
          this.logout(); // Token expired, logout user
          return false;
        }
      } else {
        console.log('No expiration found in token, considering valid');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      console.log('Token decode error, logging out user');
      this.logout();
      return false;
    }

    console.log('User is logged in');
    console.log('=====================================');
    return true;
  }

  getToken(): string | null {
    const storage = this.getLocalStorage();
    if (!storage) return null;

    // Check for both possible token keys
    const token = storage.getItem('access_token') || storage.getItem('authToken');

    if (token) {
      console.log('Token found:', token.substring(0, 20) + '...');
    } else {
      console.warn('No token found in localStorage');
    }

    return token;
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
    const storage = this.getLocalStorage();
    if (!storage) return null;
    const userId = storage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  }

  getCurrentClientId(): number | null {
    const storage = this.getLocalStorage();
    if (!storage) return null;
    const clientId = storage.getItem('client_id');
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
