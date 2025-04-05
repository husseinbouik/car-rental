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
    roles?: string[]; // optional roles
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      roles: userData.roles || ['ROLE_CLIENT'] // default to ROLE_CLIENT if not provided
    };

    return this.http.post(`${this.apiUrl}/auth/register`, payload, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Registration failed';

          if (error.error) {
            if (typeof error.error === 'string') {
              try {
                const parsedError = JSON.parse(error.error);
                errorMessage = parsedError.message || errorMessage;
              } catch (e) {
                errorMessage = error.error;
              }
            } else if (typeof error.error === 'object') {
              errorMessage = error.error.message || errorMessage;
            }
          }

          switch (error.status) {
            case 400:
              errorMessage = 'Invalid data, please check your input';
              break;
            case 409:
              errorMessage = 'User already exists';
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
