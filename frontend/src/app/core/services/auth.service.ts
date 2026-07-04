import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  permissions?: string[];
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('avocat_pro_token');
    const user = localStorage.getItem('avocat_pro_user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('avocat_pro_token', response.token);
        localStorage.setItem('avocat_pro_user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(data: { email: string; password: string; nom: string; prenom: string; role?: string; telephone?: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        localStorage.setItem('avocat_pro_token', response.token);
        localStorage.setItem('avocat_pro_user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('avocat_pro_token');
    localStorage.removeItem('avocat_pro_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('avocat_pro_token');
  }

  /**
   * Vérifie si l'utilisateur courant a le rôle demandé.
   * @example hasRole('admin') | hasRole(['admin','avocat'])
   */
  hasRole(roleOrRoles: string | string[]): boolean {
    const current = this.currentUser()?.role;
    if (!current) return false;
    return Array.isArray(roleOrRoles) ? roleOrRoles.includes(current) : current === roleOrRoles;
  }

  /**
   * Rôles ayant accès aux modules "métier" (Dossiers, Clients, Documents, Calendrier).
   * Admin et Avocat ont l'accès complet. Collaborateur/Assistant/Secrétaire sont limités.
   */
  canAccessBusinessModules(): boolean {
    return this.hasRole(['admin', 'avocat']);
  }

  /**
   * Rôles ayant accès à la gestion de l'équipe (créer / inviter des membres).
   */
  canManageTeam(): boolean {
    return this.hasRole(['admin', 'avocat']);
  }

  /**
   * Rôles ayant accès à la gestion globale des paramètres du cabinet.
   */
  canManageSettings(): boolean {
    return this.hasRole('admin');
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}