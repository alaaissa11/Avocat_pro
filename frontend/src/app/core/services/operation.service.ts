import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Operation {
  _id: string;
  type: string;
  entiteType: string;
  entiteId: string;
  userId: { _id: string; nom: string; prenom: string; role?: string } | null;
  userEmail?: string;
  details?: string;
  date: string;
}

export interface OperationsResponse {
  operations: Operation[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

@Injectable({ providedIn: 'root' })
export class OperationService {
  private apiUrl = 'http://localhost:3000/api/operations';

  constructor(private http: HttpClient) {}

  getOperations(params?: {
    page?: number;
    limit?: number;
    type?: string;
    entiteType?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<OperationsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.entiteType) httpParams = httpParams.set('entiteType', params.entiteType);
      if (params.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
      if (params.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    }
    return this.http.get<OperationsResponse>(this.apiUrl, { params: httpParams });
  }
}
