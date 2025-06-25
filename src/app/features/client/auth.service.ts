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
    const storage = this.getLocalStorage();
    if (!storage) return null;
    return storage.getItem('access_token') || storage.getItem('authToken');
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
