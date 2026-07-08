import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Tache {
  _id: string;
  titre: string;
  description?: string;
  dossierId?: { _id: string; numero: string; titre: string };
  clientId?: { _id: string; nom: string; prenom?: string };
  assigneeA?: { _id: string; nom: string; prenom: string };
  creePar?: { _id: string; nom: string; prenom: string };
  priorite: number;
  statut: 'a_faire' | 'en_cours' | 'terminee' | 'annulee';
  dateEcheance?: Date;
  dateDebut?: Date;
  dateFin?: Date;
  chargeEstimee?: number;
  chargeConsommee?: number;
  estRecurrente?: boolean;
  periodicite?: {
    frequence: 'journalier' | 'hebdomadaire' | 'mensuel' | 'annuel';
    jourSemaine?: number;
    jourMois?: number;
    finPeriodicite?: Date;
  };
  feedback?: string;
  commentaire?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = 'http://localhost:3000/api/taches';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getTaches(params?: {
    page?: number;
    limit?: number;
    statut?: string;
    assigneeTo?: string;
    dossierId?: string;
    priorite?: number;
  }): Observable<{ taches: Tache[]; pagination: any }> {
    const queryParams: any = {};
    if (params?.statut) queryParams.statut = params.statut;
    if (params?.assigneeTo) queryParams.assigneeTo = params.assigneeTo;
    if (params?.dossierId) queryParams.dossierId = params.dossierId;
    if (params?.priorite) queryParams.priorite = params.priorite;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    return this.http.get<{ taches: Tache[]; pagination: any }>(this.apiUrl, {
      headers: this.getHeaders(),
      params: queryParams
    });
  }

  getMyTaches(statut?: string): Observable<Tache[]> {
    const params: any = {};
    if (statut) params.statut = statut;
    return this.http.get<Tache[]>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
      params
    });
  }

  getTacheById(id: string): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTache(tache: Partial<Tache>): Observable<Tache> {
    return this.http.post<Tache>(this.apiUrl, tache, { headers: this.getHeaders() });
  }

  updateTache(id: string, tache: Partial<Tache>): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}`, tache, { headers: this.getHeaders() });
  }

  deleteTache(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  terminateTache(id: string, chargeConsommee?: number): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/${id}/terminer`, { chargeConsommee }, { headers: this.getHeaders() });
  }

  updateTacheStatus(id: string, data: { statut?: string; feedback?: string }): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}/status`, data, { headers: this.getHeaders() });
  }
}