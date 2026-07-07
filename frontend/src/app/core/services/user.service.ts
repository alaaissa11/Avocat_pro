import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  permissions?: string[];
  telephone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  ownerId?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

export interface Collaborateur {
  _id: string;
  userId: { _id: string; nom: string; prenom: string; email: string; role: string };
  matricule?: string;
  specialite?: string[];
  tauxHoraire?: number;
  performance?: any;
  estActif?: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'avocat' | 'collaborateur' | 'assistant' | 'secretaire';
  telephone?: string;
  specialite?: string[];
  tauxHoraire?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createUser(data: CreateUserPayload): Observable<{ message: string; user: User; collaborateur?: Collaborateur }> {
    return this.http.post<{ message: string; user: User; collaborateur?: Collaborateur }>(
      this.apiUrl,
      data,
      { headers: this.getHeaders() }
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  toggleUserActive(id: string, isActive: boolean): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, { isActive }, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getCollaborateurs(): Observable<Collaborateur[]> {
    return this.http.get<Collaborateur[]>(`${this.apiUrl}/collaborateurs/list`, { headers: this.getHeaders() });
  }
}