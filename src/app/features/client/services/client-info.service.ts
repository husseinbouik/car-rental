import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';
import { isPlatformBrowser } from '@angular/common';

export interface ClientInfo {
  id?: number;
  userId?: number;
  cname?: string;
  tel?: string;
  email?: string;
  adresse?: string;
  nationalite?: string;
  adresseEtranger?: string;
  cin?: string;
  cinDelivreLe?: string;
  passeport?: string;
  delivreLePasseport?: string;
  permis?: string;
  permisDelivreLe?: string;
  permisDelivreAu?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientInfoService {
  private apiUrl = environment.apiBaseUrl;
  private clientInfoSubject = new BehaviorSubject<ClientInfo | null>(null);
  public clientInfo$ = this.clientInfoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    if (!token) {
      return {
        headers: new HttpHeaders({})
      };
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  loadClientInfo(): Observable<ClientInfo | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    // Check if user is logged in first
    if (!this.authService.isLoggedIn()) {
      console.warn('User not logged in, cannot load client info');
      return of(null);
    }

    const clientId = this.authService.getCurrentClientId();
    const userId = this.authService.getCurrentUserId();

    if (!clientId && !userId) {
      console.warn('No client ID or user ID found');
      return of(null);
    }

    // Try to get client by client_id first, then by user_id as fallback
    const endpoint = clientId
      ? `${this.apiUrl}/api/clients/${clientId}`
      : `${this.apiUrl}/api/clients/user/${userId}`;

    return this.http.get<ClientInfo>(endpoint, this.getAuthHeaders()).pipe(
      tap(clientInfo => {
        if (clientInfo) {
          this.clientInfoSubject.next(clientInfo);
        }
      }),
      catchError(error => {
        console.error('Error loading client info:', error);
        // Don't update the subject on error, keep existing data
        return of(null);
      })
    );
  }

  getClientInfo(): ClientInfo | null {
    return this.clientInfoSubject.value;
  }

  refreshClientInfo(): void {
    this.loadClientInfo().subscribe();
  }

  clearClientInfo(): void {
    this.clientInfoSubject.next(null);
  }

  getDisplayName(): string {
    const clientInfo = this.getClientInfo();
    if (clientInfo?.cname) {
      return clientInfo.cname;
    }
    return 'Client User'; // Fallback
  }
}
