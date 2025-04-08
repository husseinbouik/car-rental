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
}
