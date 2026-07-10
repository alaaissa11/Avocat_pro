import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-professional z-50 flex flex-col">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-lawyer-primary to-lawyer-secondary rounded-lg flex items-center justify-center">
            <span class="text-white font-serif font-bold text-lg">A</span>
          </div>
          <div>
            <h1 class="font-serif font-bold text-lawyer-primary text-lg">AVOCAT</h1>
            <span class="text-lawyer-accent text-xs font-medium tracking-wider">PRO</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-6">
        @if (isLimitedUser()) {
          <!-- VUE RÉDUITE : Collaborateur / Assistant / Secrétaire -->
          <div>
            <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mon espace</p>
            <div class="space-y-1">
              <a routerLink="/mon-espace" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">workspace_premium</span>
                <span>Mon espace</span>
              </a>
              <a routerLink="/taches" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">assignment</span>
                <span>Mes tâches</span>
              </a>
              <a routerLink="/messagerie" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">mail</span>
                <span>Messagerie</span>
              </a>
            </div>
          </div>
        } @else {
          <!-- VUE COMPLÈTE : Admin / Avocat -->
          <!-- PERSONNEL -->
          <div>
            <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Personnel</p>
            <div class="space-y-1">
              <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">dashboard</span>
                <span>Dashboard</span>
              </a>
              <a routerLink="/mon-espace" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">workspace_premium</span>
                <span>Mon espace</span>
              </a>
              <a routerLink="/taches" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">assignment</span>
                <span>Tâches</span>
              </a>
              <a routerLink="/calendar" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">calendar_today</span>
                <span>Calendrier</span>
              </a>
              <a routerLink="/messagerie" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">mail</span>
                <span>Messagerie</span>
              </a>
            </div>
          </div>

          <!-- DOSSIERS -->
          <div>
            <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Affaires</p>
            <div class="space-y-1">
              <a routerLink="/dossiers" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">folder</span>
                <span>Dossiers</span>
              </a>
              <a routerLink="/clients" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">people</span>
                <span>Clients</span>
              </a>
              <a routerLink="/documents" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">description</span>
                <span>Documents</span>
              </a>
              <a routerLink="/historique" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">history</span>
                <span>Historique</span>
              </a>
            </div>
          </div>

          <!-- ADMINISTRATION -->
          @if (canManageTeam()) {
            <div>
              <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Administration</p>
              <div class="space-y-1">
                <a routerLink="/collaborateurs" routerLinkActive="active" class="sidebar-link">
                  <span class="material-icons text-lg">groups</span>
                  <span>Équipe</span>
                </a>
                <a routerLink="/operations" routerLinkActive="active" class="sidebar-link">
                  <span class="material-icons text-lg">history</span>
                  <span>Journal d'activité</span>
                </a>
              </div>
            </div>
          }

          <!-- CONFIG -->
          <div>
            <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Configuration</p>
            <div class="space-y-1">
              <a routerLink="/settings" routerLinkActive="active" class="sidebar-link">
                <span class="material-icons text-lg">settings</span>
                <span>Paramètres</span>
              </a>
            </div>
          </div>
        }
      </nav>

      <!-- Cabinet Info -->
      <div class="p-4 border-t border-slate-100 flex-shrink-0">
        <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div class="w-10 h-10 rounded-full bg-lawyer-primary flex items-center justify-center text-white text-sm font-medium">
            {{ getUserInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-lawyer-dark truncate">
              {{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}
            </p>
            <p class="text-xs text-slate-500 truncate">{{ getRoleLabel() }}</p>
          </div>
          <button (click)="authService.logout()" class="text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
            <span class="material-icons text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);

  /**
   * Vrai pour les rôles qui n'ont accès qu'à leur espace personnel et leurs tâches.
   * (collaborateur, assistant, secretaire)
   */
  isLimitedUser(): boolean {
    return this.authService.hasRole(['collaborateur', 'assistant', 'secretaire']);
  }

  canManageTeam(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin' || role === 'avocat';
  }

  getUserInitials(): string {
    const u = this.authService.currentUser();
    if (!u) return '?';
    return ((u.nom?.[0] || '') + (u.prenom?.[0] || '')).toUpperCase();
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      avocat: 'Avocat',
      collaborateur: 'Collaborateur',
      assistant: 'Assistant',
      secretaire: 'Secrétaire',
    };
    const role = this.authService.currentUser()?.role || '';
    return labels[role] || role;
  }
}
