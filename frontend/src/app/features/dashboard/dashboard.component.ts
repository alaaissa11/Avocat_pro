import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DossierService } from '../../core/services/dossier.service';
import { CalendrierService, CalendrierEvent } from '../../core/services/calendrier.service';
import { TacheService } from '../../core/services/tache.service';
import { ClientService } from '../../core/services/client.service';
import { Dossier } from '../../core/models/dossier.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-serif font-semibold text-lawyer-dark mb-2">
          Bonjour, {{ userName() }}
        </h1>
        <p class="text-slate-500">Voici l'état de votre cabinet aujourd'hui</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card animate-slide-up">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Dossiers actifs</p>
              <p class="text-3xl font-bold mt-1">{{ stats().enCours + stats().nouveau }}</p>
              <p class="text-blue-200 text-xs mt-1">{{ stats().nouveau }} nouveaux</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">folder_shared</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Clients</p>
              <p class="text-3xl font-bold mt-1">{{ totalClients() }}</p>
              <p class="text-blue-200 text-xs mt-1">{{ stats().cloture }} dossiers clôturés</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">people</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Audiences</p>
              <p class="text-3xl font-bold mt-1">{{ todayAudiences().length }}</p>
              <p class="text-blue-200 text-xs mt-1">Aujourd'hui</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">gavel</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Tâches en cours</p>
              <p class="text-3xl font-bold mt-1">{{ activeTasks() }}</p>
              <p class="text-blue-200 text-xs mt-1">{{ urgentTasks() }} urgentes</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">assignment</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Dossiers Récents -->
        <div class="lg:col-span-2 card animate-slide-up" style="animation-delay: 0.4s">
          <div class="card-header flex items-center justify-between">
            <h3 class="section-title mb-0">Dossiers Récents</h3>
            <a routerLink="/dossiers" class="text-sm text-lawyer-primary hover:text-lawyer-secondary font-medium flex items-center gap-1">
              Voir tout
              <span class="material-icons text-sm">arrow_forward</span>
            </a>
          </div>
          @if (recentDossiers().length === 0) {
            <div class="text-center py-8 text-slate-400">
              <span class="material-icons text-4xl mb-2">folder_off</span>
              <p class="text-sm">Aucun dossier récent</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (dossier of recentDossiers(); track dossier._id) {
                <a [routerLink]="['/dossiers', dossier._id]" class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors no-underline">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" [ngClass]="getTypeBgClass(dossier.typeAffaire)">
                    <span class="material-icons" [ngClass]="getTypeIconClass(dossier.typeAffaire)">{{ getTypeIcon(dossier.typeAffaire) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-lawyer-dark truncate">{{ dossier.titre }}</p>
                    <p class="text-sm text-slate-500">
                      {{ getClientName(dossier.clientId) }}
                      @if (dossier.numero) {
                        • {{ dossier.numero }}
                      }
                    </p>
                  </div>
                  <span class="badge" [ngClass]="getStatutBadgeClass(dossier.statut)">{{ formatStatut(dossier.statut) }}</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Actions Rapides + Audiences -->
        <div class="card animate-slide-up" style="animation-delay: 0.5s">
          <h3 class="section-title">Actions Rapides</h3>
          <div class="space-y-3">
            <a routerLink="/dossiers/create" class="flex items-center gap-3 p-3 bg-lawyer-primary/5 rounded-lg hover:bg-lawyer-primary/10 transition-colors no-underline">
              <span class="material-icons text-lawyer-primary">add_circle</span>
              <span class="font-medium text-lawyer-dark">Nouveau Dossier</span>
            </a>
            <a routerLink="/clients" class="flex items-center gap-3 p-3 bg-lawyer-accent/10 rounded-lg hover:bg-lawyer-accent/20 transition-colors no-underline">
              <span class="material-icons text-lawyer-accent">person_add</span>
              <span class="font-medium text-lawyer-dark">Nouveau Client</span>
            </a>
            <a routerLink="/calendar" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors no-underline">
              <span class="material-icons text-green-600">event</span>
              <span class="font-medium text-lawyer-dark">Voir Calendrier</span>
            </a>
            <a routerLink="/documents" class="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors no-underline">
              <span class="material-icons text-amber-600">upload_file</span>
              <span class="font-medium text-lawyer-dark">Uploader Document</span>
            </a>
          </div>

          <!-- Planning du Jour -->
          <div class="mt-6 pt-6 border-t border-slate-100">
            <h4 class="font-medium text-lawyer-dark mb-3 flex items-center gap-2">
              <span class="material-icons text-lawyer-accent text-sm">today</span>
              Planning du jour
            </h4>
            @if (todayAudiences().length === 0) {
              <div class="text-center py-4 text-slate-400">
                <span class="material-icons text-2xl mb-1">event_busy</span>
                <p class="text-xs">Aucun rendez-vous prévu</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (evt of todayAudiences(); track evt._id) {
                  <div class="flex items-center gap-3 p-2 bg-slate-50 rounded">
                    <span class="text-sm font-medium text-slate-600 w-14">{{ formatTime(evt.dateDebut) }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-lawyer-dark truncate">
                        @if (evt.dossierId) {
                          {{ evt.dossierId.numero || evt.titre }}
                        } @else {
                          {{ evt.titre }}
                        }
                      </p>
                      @if (evt.lieu) {
                        <p class="text-xs text-slate-400 truncate">{{ evt.lieu }}</p>
                      }
                    </div>
                    <span class="badge text-xs" [ngClass]="getEventBadgeClass(evt.type)">{{ formatEventType(evt.type) }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dossierService = inject(DossierService);
  private calendrierService = inject(CalendrierService);
  private tacheService = inject(TacheService);
  private clientService = inject(ClientService);

  userName = signal('');
  stats = signal<{ total: number; nouveau: number; enCours: number; cloture: number }>({ total: 0, nouveau: 0, enCours: 0, cloture: 0 });
  totalClients = signal(0);
  recentDossiers = signal<Dossier[]>([]);
  todayAudiences = signal<CalendrierEvent[]>([]);
  activeTasks = signal(0);
  urgentTasks = signal(0);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(user.prenom ? `${user.prenom} ${user.nom}` : user.nom);
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    forkJoin({
      stats: this.dossierService.getStats(),
      recentDossiers: this.dossierService.getDossiers({ limit: 4 }),
      clients: this.clientService.getClients({ limit: 1 }),
      todayEvents: this.calendrierService.getEvents({ start: startOfDay, end: endOfDay }),
      taches: this.tacheService.getMyTaches(),
    }).subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.recentDossiers.set(data.recentDossiers.dossiers);
        this.totalClients.set(data.clients.pagination.total);
        this.todayAudiences.set(
          data.todayEvents.filter(e => e.type === 'audience' || e.type === 'rendez_vous' || e.type === 'echeance')
        );
        this.activeTasks.set(data.taches.filter(t => t.statut === 'en_cours' || t.statut === 'a_faire').length);
        this.urgentTasks.set(data.taches.filter(t => (t.statut === 'en_cours' || t.statut === 'a_faire') && t.priorite <= 2).length);
      },
      error: () => {}
    });
  }

  getClientName(clientId: any): string {
    if (!clientId) return '';
    if (typeof clientId === 'string') return clientId;
    return clientId.prenom ? `${clientId.prenom} ${clientId.nom}` : clientId.nom || '';
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatStatut(statut: string): string {
    const map: Record<string, string> = {
      nouveau: 'Nouveau',
      en_cours: 'En cours',
      en_attente: 'En attente',
      cloture: 'Clôturé',
      archive: 'Archivé',
    };
    return map[statut] || statut;
  }

  formatEventType(type: string): string {
    const map: Record<string, string> = {
      audience: 'Audience',
      rendez_vous: 'Rendez-vous',
      echeance: 'Échéance',
      autre: 'Autre',
    };
    return map[type] || type;
  }

  getEventBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      audience: 'badge-danger',
      rendez_vous: 'badge-info',
      echeance: 'badge-warning',
    };
    return classes[type] || 'badge-info';
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      civil: 'balance',
      penal: 'gavel',
      commercial: 'business',
      famille: 'home',
      travail: 'work',
      administratif: 'account_balance',
      immobilier: 'home_work',
      bancaire: 'account_balance_wallet',
      autre: 'folder',
    };
    return icons[type] || 'folder';
  }

  getTypeBgClass(type: string): string {
    const classes: Record<string, string> = {
      civil: 'bg-blue-100',
      penal: 'bg-red-100',
      commercial: 'bg-amber-100',
      famille: 'bg-pink-100',
      travail: 'bg-green-100',
      administratif: 'bg-indigo-100',
      immobilier: 'bg-orange-100',
      bancaire: 'bg-emerald-100',
    };
    return classes[type] || 'bg-slate-100';
  }

  getTypeIconClass(type: string): string {
    const classes: Record<string, string> = {
      civil: 'text-blue-600',
      penal: 'text-red-600',
      commercial: 'text-amber-600',
      famille: 'text-pink-600',
      travail: 'text-green-600',
      administratif: 'text-indigo-600',
      immobilier: 'text-orange-600',
      bancaire: 'text-emerald-600',
    };
    return classes[type] || 'text-slate-600';
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      nouveau: 'badge-info',
      en_cours: 'badge-warning',
      en_attente: 'badge-secondary',
      cloture: 'badge-success',
      archive: 'badge-secondary',
    };
    return classes[statut] || 'badge-info';
  }
}
