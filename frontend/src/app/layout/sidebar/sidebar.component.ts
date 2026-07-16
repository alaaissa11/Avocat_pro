import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-professional z-50 flex flex-col transition-all duration-300 ease-in-out"
           [class.w-64]="!collapsed()"
           [class.w-16]="collapsed()">
      <!-- Logo -->
      <div class="h-16 flex items-center border-b border-slate-100 flex-shrink-0 transition-all duration-300"
           [class.justify-center]="collapsed()"
           [class.px-6]="!collapsed()">
        @if (!collapsed()) {
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-lawyer-primary to-lawyer-secondary rounded-lg flex items-center justify-center">
              <span class="text-white font-serif font-bold text-lg">A</span>
            </div>
            <div>
              <h1 class="font-serif font-bold text-lawyer-primary text-lg">AVOCAT</h1>
              <span class="text-lawyer-accent text-xs font-medium tracking-wider">PRO</span>
            </div>
          </div>
        } @else {
          <div class="w-10 h-10 bg-gradient-to-br from-lawyer-primary to-lawyer-secondary rounded-lg flex items-center justify-center">
            <span class="text-white font-serif font-bold text-lg">A</span>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-6"
           [class.p-2]="collapsed()">
        @if (isLimitedUser()) {
          <div>
            @if (!collapsed()) {
              <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mon espace</p>
            }
            <div class="space-y-1">
              <a routerLink="/mon-espace" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Mon espace' : null">
                <span class="material-icons text-lg">workspace_premium</span>
                @if (!collapsed()) { <span>Mon espace</span> }
              </a>
              <a routerLink="/taches" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Mes tâches' : null">
                <span class="material-icons text-lg">assignment</span>
                @if (!collapsed()) { <span>Mes tâches</span> }
              </a>
              <a routerLink="/messagerie" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Messagerie' : null">
                <span class="material-icons text-lg">mail</span>
                @if (!collapsed()) { <span>Messagerie</span> }
              </a>
            </div>
          </div>
        } @else {
          <div>
            @if (!collapsed()) {
              <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Personnel</p>
            }
            <div class="space-y-1">
              <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Dashboard' : null">
                <span class="material-icons text-lg">dashboard</span>
                @if (!collapsed()) { <span>Dashboard</span> }
              </a>
              <a routerLink="/mon-espace" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Mon espace' : null">
                <span class="material-icons text-lg">workspace_premium</span>
                @if (!collapsed()) { <span>Mon espace</span> }
              </a>
              <a routerLink="/taches" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Tâches' : null">
                <span class="material-icons text-lg">assignment</span>
                @if (!collapsed()) { <span>Tâches</span> }
              </a>
              <a routerLink="/calendar" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Calendrier' : null">
                <span class="material-icons text-lg">calendar_today</span>
                @if (!collapsed()) { <span>Calendrier</span> }
              </a>
              <a routerLink="/messagerie" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Messagerie' : null">
                <span class="material-icons text-lg">mail</span>
                @if (!collapsed()) { <span>Messagerie</span> }
              </a>
            </div>
          </div>

          <div>
            @if (!collapsed()) {
              <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Affaires</p>
            }
            <div class="space-y-1">
              <a routerLink="/dossiers" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Dossiers' : null">
                <span class="material-icons text-lg">folder</span>
                @if (!collapsed()) { <span>Dossiers</span> }
              </a>
              <a routerLink="/clients" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Clients' : null">
                <span class="material-icons text-lg">people</span>
                @if (!collapsed()) { <span>Clients</span> }
              </a>
              <a routerLink="/documents" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Documents' : null">
                <span class="material-icons text-lg">description</span>
                @if (!collapsed()) { <span>Documents</span> }
              </a>
              <a routerLink="/historique" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Historique' : null">
                <span class="material-icons text-lg">history</span>
                @if (!collapsed()) { <span>Historique</span> }
              </a>
            </div>
          </div>

          @if (canManageTeam()) {
            <div>
              @if (!collapsed()) {
                <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Administration</p>
              }
              <div class="space-y-1">
                <a routerLink="/collaborateurs" routerLinkActive="active" class="sidebar-link"
                   [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Équipe' : null">
                  <span class="material-icons text-lg">groups</span>
                  @if (!collapsed()) { <span>Équipe</span> }
                </a>
                <a routerLink="/operations" routerLinkActive="active" class="sidebar-link"
                   [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? getTitle('journal') : null">
                  <span class="material-icons text-lg">history</span>
                  @if (!collapsed()) { <span>Journal d'activité</span> }
                </a>
              </div>
            </div>
          }

          <div>
            @if (!collapsed()) {
              <p class="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Configuration</p>
            }
            <div class="space-y-1">
              <a routerLink="/settings" routerLinkActive="active" class="sidebar-link"
                 [class.justify-center]="collapsed()" [class.px-2]="collapsed()" [title]="collapsed() ? 'Paramètres' : null">
                <span class="material-icons text-lg">settings</span>
                @if (!collapsed()) { <span>Paramètres</span> }
              </a>
            </div>
          </div>
        }
      </nav>

      <!-- Bottom: collapse button + user info -->
      @if (!collapsed()) {
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
      } @else {
        <div class="p-2 border-t border-slate-100 flex-shrink-0 flex flex-col items-center gap-2">
          <button (click)="layoutService.toggleSidebar()"
                  class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  title="Agrandir le menu">
            <span class="material-icons text-lg">chevron_right</span>
          </button>
          <button (click)="authService.logout()" class="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
            <span class="material-icons text-lg">logout</span>
          </button>
        </div>
      }
    </aside>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  layoutService = inject(LayoutService);

  collapsed = this.layoutService.sidebarCollapsed;

  getTitle(key: string): string {
    const map: Record<string, string> = {
      'mon-espace': 'Mon espace',
      'mes-taches': 'Mes tâches',
      'messagerie': 'Messagerie',
      'home': 'Accueil',
      'dashboard': 'Dashboard',
      'taches': 'Tâches',
      'calendrier': 'Calendrier',
      'dossiers': 'Dossiers',
      'clients': 'Clients',
      'documents': 'Documents',
      'historique': 'Historique',
      'equipe': 'Équipe',
      'journal': 'Journal d\'activité',
      'parametres': 'Paramètres',
    };
    return map[key] || key;
  }

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
