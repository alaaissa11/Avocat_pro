import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dossier, DossierResponse, DossierStats } from '../models/dossier.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  private apiUrl = 'http://localhost:3000/api/dossiers';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getDossiers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    typeAffaire?: string;
    statut?: string;
    priorite?: number;
    assigneeTo?: string;
  }): Observable<DossierResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<DossierResponse>(this.apiUrl, { headers: this.getHeaders(), params: httpParams });
  }

  getDossierById(id: string): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createDossier(dossier: Partial<Dossier> & { clientId?: string }): Observable<Dossier> {
    return this.http.post<Dossier>(this.apiUrl, dossier, { headers: this.getHeaders() });
  }

  createTemporaryDossier(data: { description: string; titre: string; clientId: string; typeAffaire: string }): Observable<Dossier> {
    return this.http.post<Dossier>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateDossier(id: string, dossier: Partial<Dossier>): Observable<Dossier> {
    return this.http.put<Dossier>(`${this.apiUrl}/${id}`, dossier, { headers: this.getHeaders() });
  }

  deleteDossier(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getStats(): Observable<DossierStats> {
    return this.http.get<DossierStats>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  addCommentaire(id: string, commentaire: string): Observable<Dossier> {
    return this.http.post<Dossier>(`${this.apiUrl}/${id}/commentaire`, { commentaire }, { headers: this.getHeaders() });
  }

  cloturerDossier(id: string): Observable<{ message: string; historiqueId: string }> {
    return this.http.post<{ message: string; historiqueId: string }>(`${this.apiUrl}/${id}/cloturer`, {}, { headers: this.getHeaders() });
  }
}