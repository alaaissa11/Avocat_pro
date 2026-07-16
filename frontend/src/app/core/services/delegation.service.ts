import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Delegation {
  _id: string;
  entiteType: 'dossier' | 'tache';
  entiteId: string;
  deleguePar: { _id: string; nom: string; prenom: string; email: string };
  delegueA: { _id: string; nom: string; prenom: string; email: string };
  dateDebut: string;
  dateFin?: string;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'terminee';
  motif?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DelegationService {
  private apiUrl = 'http://localhost:3000/api/delegations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  createDelegation(data: { entiteType: string; entiteId: string; delegueA: string; motif?: string; dateDebut?: string; dateFin?: string }): Observable<Delegation> {
    return this.http.post<Delegation>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  acceptDelegation(id: string): Observable<Delegation> {
    return this.http.put<Delegation>(`${this.apiUrl}/${id}/accept`, {}, { headers: this.getHeaders() });
  }

  refuseDelegation(id: string): Observable<Delegation> {
    return this.http.put<Delegation>(`${this.apiUrl}/${id}/refuser`, {}, { headers: this.getHeaders() });
  }

  terminerDelegation(id: string): Observable<Delegation> {
    return this.http.put<Delegation>(`${this.apiUrl}/${id}/terminer`, {}, { headers: this.getHeaders() });
  }

  getReceived(): Observable<Delegation[]> {
    return this.http.get<Delegation[]>(`${this.apiUrl}/recues`, { headers: this.getHeaders() });
  }

  getSent(): Observable<Delegation[]> {
    return this.http.get<Delegation[]>(`${this.apiUrl}/envoyees`, { headers: this.getHeaders() });
  }

  getEntityDelegation(entiteType: string, entiteId: string): Observable<Delegation | null> {
    return this.http.get<Delegation | null>(`${this.apiUrl}/entite/${entiteType}/${entiteId}`, { headers: this.getHeaders() });
  }
}
