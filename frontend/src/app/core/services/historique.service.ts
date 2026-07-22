import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface HistoriqueDocument {
  _id?: string;
  nom: string;
  mimeType?: string;
  chemin?: string;
  taille?: number;
}

export interface HistoriqueTache {
  _id: string;
  titre: string;
  description?: string;
  assigneeA?: { _id: string; nom: string; prenom: string };
  statut: string;
  priorite: number;
  feedback?: string;
  dateEcheance?: Date;
  documents: HistoriqueDocument[];
}

export interface HistoriqueDossier {
  _id: { $oid: string } | string;
  dossier: {
    _id: string;
    numero: string;
    titre: string;
    clientId?: { _id: string; nom: string; prenom?: string };
    typeAffaire: string;
    priorite: number;
    description?: string;
    assigneA?: { _id: string; nom: string; prenom?: string };
    dateCreation: Date;
    dateCloture: Date;
  };
  taches: HistoriqueTache[];
  cloturePar?: { _id: string; nom: string; prenom: string };
  createdBy?: { _id: string; nom: string; prenom: string };
  createdAt: Date;
}

export interface HistoriqueResponse {
  historique: HistoriqueDossier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {
  private apiUrl = `${environment.apiUrl}/api/historique`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getHistorique(params?: { page?: number; limit?: number }): Observable<HistoriqueResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<HistoriqueResponse>(this.apiUrl, { headers: this.getHeaders(), params: httpParams });
  }
}
