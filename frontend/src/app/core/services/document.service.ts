import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Document {
  _id: string;
  nom: string;
  description?: string;
  type: string;
  mimeType: string;
  chemin: string;
  taille: number;
  dossierId?: { _id: string; numero: string; titre: string };
  clientId?: { _id: string; nom: string; prenom?: string };
  uploadedBy?: { _id: string; nom: string; prenom?: string };
  estPrive: boolean;
  tags?: string[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/api/documents';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getDocuments(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    type?: string;
    dossierId?: string;
    tacheId?: string;
    clientId?: string;
  }): Observable<{ documents: Document[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.dossierId) httpParams = httpParams.set('dossierId', params.dossierId);
      if (params.tacheId) httpParams = httpParams.set('tacheId', params.tacheId);
      if (params.clientId) httpParams = httpParams.set('clientId', params.clientId);
    }
    return this.http.get<{ documents: Document[]; pagination: any }>(this.apiUrl, { 
      headers: this.getHeaders(), 
      params: httpParams 
    });
  }

  uploadDocument(file: File, data: { dossierId?: string; tacheId?: string; clientId?: string; description?: string; type?: string }): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (data.dossierId) formData.append('dossierId', data.dossierId);
    if (data.tacheId) formData.append('tacheId', data.tacheId);
    if (data.clientId) formData.append('clientId', data.clientId);
    if (data.description) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);
    
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData, { 
      headers: this.getHeaders() 
    });
  }

  deleteDocument(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { 
      headers: this.getHeaders(), 
      responseType: 'blob' 
    });
  }
}