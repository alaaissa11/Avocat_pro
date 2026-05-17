import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CalendrierEvent {
  _id: string;
  titre: string;
  description?: string;
  type: 'audience' | 'rendez_vous' | 'echeance' | 'conge' | 'formation' | 'autre';
  dossierId?: { _id: string; numero: string; titre: string };
  clientId?: { _id: string; nom: string; prenom?: string };
  userId?: { _id: string; nom: string; prenom?: string };
  assignes?: Array<{ _id: string; nom: string; prenom?: string }>;
  dateDebut: Date;
  dateFin: Date;
  estJourEntier: boolean;
  lieu?: string;
  lienVisio?: string;
  priorite: number;
  couleur?: string;
  statut: 'planifie' | 'confirme' | 'annule' | 'termine';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CalendrierService {
  private apiUrl = 'http://localhost:3000/api/calendrier';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getEvents(params?: { start?: string; end?: string; type?: string }): Observable<CalendrierEvent[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.start) httpParams = httpParams.set('start', params.start);
      if (params.end) httpParams = httpParams.set('end', params.end);
      if (params.type) httpParams = httpParams.set('type', params.type);
    }
    return this.http.get<CalendrierEvent[]>(this.apiUrl, { headers: this.getHeaders(), params: httpParams });
  }

  getAudiences(): Observable<CalendrierEvent[]> {
    return this.http.get<CalendrierEvent[]>(`${this.apiUrl}/audiences`, { headers: this.getHeaders() });
  }

  createEvent(event: Partial<CalendrierEvent>): Observable<CalendrierEvent> {
    return this.http.post<CalendrierEvent>(this.apiUrl, event, { headers: this.getHeaders() });
  }

  updateEvent(id: string, event: Partial<CalendrierEvent>): Observable<CalendrierEvent> {
    return this.http.put<CalendrierEvent>(`${this.apiUrl}/${id}`, event, { headers: this.getHeaders() });
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}