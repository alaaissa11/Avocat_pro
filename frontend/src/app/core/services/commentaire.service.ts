import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface Commentaire {
  _id: string;
  entiteType: 'dossier' | 'tache';
  entiteId: string;
  auteur: { _id: string; nom: string; prenom: string; email: string };
  contenu: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommentaireService {
  private apiUrl = `${environment.apiUrl}/api/commentaires`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getComments(entiteType: string, entiteId: string): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/${entiteType}/${entiteId}`, { headers: this.getHeaders() });
  }

  createComment(data: { entiteType: string; entiteId: string; contenu: string }): Observable<Commentaire> {
    return this.http.post<Commentaire>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateComment(id: string, contenu: string): Observable<Commentaire> {
    return this.http.put<Commentaire>(`${this.apiUrl}/${id}`, { contenu }, { headers: this.getHeaders() });
  }

  deleteComment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
