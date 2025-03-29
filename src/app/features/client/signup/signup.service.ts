import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  register(userData: {
    username: string;
    password: string;
    email: string;
    fullName?: string;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      username: userData.username,
      password: userData.password,
      email: userData.email
    };

    return this.http.post(`${this.apiUrl}/auth/register`, payload, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Registration failed';

          // Handle server-side errors
          if (error.error) {
            // Try to parse as JSON first
            if (typeof error.error === 'string') {
              try {
                const parsedError = JSON.parse(error.error);
                errorMessage = parsedError.message || errorMessage;
              } catch (e) {
                // If not JSON, use the raw error text
                errorMessage = error.error;
              }
            } else if (typeof error.error === 'object') {
              errorMessage = error.error.message || errorMessage;
            }
          }

          // Handle HTTP status codes
          switch (error.status) {
            case 400:
              errorMessage = errorMessage || 'Invalid request data';
              break;
            case 409:
              errorMessage = errorMessage || 'User already exists';
              break;
            case 500:
              errorMessage = 'Server error, please try again later';
              break;
          }

          return throwError(() => ({
            status: error.status,
            message: errorMessage,
            details: error.error?.details || null
          }));
        })
      );
  }
}
