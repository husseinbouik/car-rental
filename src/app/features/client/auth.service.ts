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
  }
  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  // Verify email with token
  // auth.service.ts
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


  // Dummy method: Replace with your actual authentication check
  isLoggedIn(): boolean {
    // Example: Check if a token exists in localStorage
    // return !!localStorage.getItem('access_token');
    // For now, let's just return false to *simulate* being logged out for testing
    // You MUST replace this with your actual auth check logic
    return false; // Set to true to simulate being logged in
  }

    getCurrentUserId(): number | null {
        // Adjust this logic based on how you store the user info (e.g., in localStorage, a user property, etc.)
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const userObj = JSON.parse(userJson);
          if (userObj && userObj.id) {
            return userObj.id;
          }
        }
        return null;
      }
    }
