import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

// Define an interface for your expected JWT payload to get type safety
interface MyTokenPayload {
  user_id: number; // Or string, depending on what your backend sends
  client_id?: number; // Add client_id to the payload
  authorities?: string[];
  sub?: string;
  iat?: number;
  exp?: number;
  // Add other custom claims you expect
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.apiBaseUrl;
  private jwtHelper: JwtHelperService = new JwtHelperService();

  // Define keys for localStorage items to avoid magic strings
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_ID_KEY = 'user_id';
  private readonly CLIENT_ID_KEY = 'client_id';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  // Helper method to safely access localStorage
  private getLocalStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  hasRole(roleName: string): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decodedToken = this.jwtHelper.decodeToken<MyTokenPayload>(token); // Specify payload type
      if (decodedToken && decodedToken.authorities) {
        return decodedToken.authorities.includes(roleName);
      }
      return false;
    } catch (error) {
      console.error('Error decoding token for role check:', error);
      return false;
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
          // Only proceed if we're in a browser environment
          const storage = this.getLocalStorage();
          if (!storage) {
            console.warn('localStorage not available (server-side rendering)');
            return;
          }

          // Determine the correct key for the token from the response
          const token = response.token || response.access_token || response.jwt || response.id_token;

          if (token && typeof token === 'string') {
            storage.setItem(this.TOKEN_KEY, token);
            console.log('JWT saved to localStorage');

            // Decode the token to get user_id
            try {
              const decodedPayload = this.jwtHelper.decodeToken<MyTokenPayload>(token); // Specify payload type

              if (decodedPayload && decodedPayload.user_id !== undefined) {
                storage.setItem(this.USER_ID_KEY, decodedPayload.user_id.toString());
                console.log('User ID saved to localStorage:', decodedPayload.user_id);
              } else if (decodedPayload) {
                console.warn('user_id not found in JWT payload. Payload:', decodedPayload);
              } else {
                // This case should ideally be caught by jwtHelper.decodeToken throwing an error
                console.warn('Could not decode JWT payload or payload is empty.');
              }

              // Store client_id if available in the token
              if (decodedPayload && decodedPayload.client_id !== undefined) {
                storage.setItem(this.CLIENT_ID_KEY, decodedPayload.client_id.toString());
                console.log('Client ID saved to localStorage:', decodedPayload.client_id);
              } else if (decodedPayload) {
                console.warn('client_id not found in JWT payload. Payload:', decodedPayload);
              }
            } catch (error) {
              console.error('Error decoding JWT to get user_id:', error);
              // Optionally remove the token if it's invalid and cannot be decoded
              // storage.removeItem(this.TOKEN_KEY);
            }
          } else {
            console.warn('No token found or token is not a string in the login response:', response);
          }
        })
      );
  }

  logout(): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.USER_ID_KEY); // Remove user_id on logout
      storage.removeItem(this.CLIENT_ID_KEY); // Remove client_id on logout
      console.log('Logged out, token, user_id and client_id removed from localStorage');
    }
  }

  getToken(): string | null {
    const storage = this.getLocalStorage();
    return storage ? storage.getItem(this.TOKEN_KEY) : null;
  }

  getUserId(): number | null { // Return type can be number if you parse it
    const storage = this.getLocalStorage();
    if (!storage) return null;

    const userIdStr = storage.getItem(this.USER_ID_KEY);
    if (userIdStr) {
      const userIdNum = parseInt(userIdStr, 10);
      return isNaN(userIdNum) ? null : userIdNum;
    }
    return null;
  }

  getClientId(): number | null {
    const storage = this.getLocalStorage();
    if (!storage) return null;

    const clientIdStr = storage.getItem(this.CLIENT_ID_KEY);
    if (clientIdStr) {
      const clientIdNum = parseInt(clientIdStr, 10);
      return isNaN(clientIdNum) ? null : clientIdNum;
    }
    return null;
  }

  // You can also get the user ID directly from the current token if needed elsewhere
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (token) {
        try {
            const decodedPayload = this.jwtHelper.decodeToken<MyTokenPayload>(token);
            if (decodedPayload && decodedPayload.user_id !== undefined) {
                return typeof decodedPayload.user_id === 'string'
                    ? parseInt(decodedPayload.user_id, 10)
                    : decodedPayload.user_id;
            }
        } catch (e) {
            console.error("Error decoding token to get user_id from active token:", e);
        }
    }
    return null;
  }


  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // You can also check if the token is expired using jwtHelper
    // return !this.jwtHelper.isTokenExpired(token);
    return true; // Simple check: if token exists, user is considered logged in
                  // For a more robust check, use isTokenExpired
  }

  // More robust isLoggedIn check
  isUserAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
        return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
        // If token is malformed and cannot be checked for expiration
        console.error("Error checking token expiration:", e);
        return false;
    }
  }
}
