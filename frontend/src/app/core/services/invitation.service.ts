import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface Invitation {
  _id: string;
  sender: { _id: string; nom: string; prenom: string; email: string; role: string };
  receiver: { _id: string; nom: string; prenom: string; email: string; role: string };
  statut: 'en_attente' | 'acceptee' | 'refusee';
  createdAt: string;
  respondedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/api/invitations`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getReceived(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.apiUrl}/received`, { headers: this.getHeaders() });
  }

  getSent(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.apiUrl}/sent`, { headers: this.getHeaders() });
  }

  send(receiverId: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/send`, { receiverId }, { headers: this.getHeaders() });
  }

  accept(id: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/${id}/accept`, {}, { headers: this.getHeaders() });
  }

  reject(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/reject`, {}, { headers: this.getHeaders() });
  }
}
