import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-serif font-semibold text-lawyer-dark mb-2">Bonjour, Me. ALA AISSA</h1>
        <p class="text-slate-500">Voici l'état de votre cabinet aujourd'hui</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card animate-slide-up">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Dossiers actifs</p>
              <p class="text-3xl font-bold mt-1">48</p>
              <p class="text-blue-200 text-xs mt-1">+3 cette semaine</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">folder_shared</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Clients</p>
              <p class="text-3xl font-bold mt-1">127</p>
              <p class="text-blue-200 text-xs mt-1">+5 ce mois</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">people</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Audiences</p>
              <p class="text-3xl font-bold mt-1">12</p>
              <p class="text-blue-200 text-xs mt-1">Cette semaine</p>
            </div>
            <span class="material-icons text-blue-200 text-5xl">gavel</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Tâches en cours</p>
              <p class="text-3xl font-bold mt-1">23</p>
              <p class="text-blue-200 text-xs mt-1">5 urgentes</p>
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
          <div class="space-y-3">
            @for (dossier of recentDossiers(); track dossier.id) {
              <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" [ngClass]="getTypeBgClass(dossier.type)">
                  <span class="material-icons" [ngClass]="getTypeIconClass(dossier.type)">{{ getTypeIcon(dossier.type) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-lawyer-dark truncate">{{ dossier.titre }}</p>
                  <p class="text-sm text-slate-500">{{ dossier.client }} • {{ dossier.date }}</p>
                </div>
                <span class="badge" [ngClass]="getStatutBadgeClass(dossier.statut)">{{ dossier.statut }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Actions Rapides -->
        <div class="card animate-slide-up" style="animation-delay: 0.5s">
          <h3 class="section-title">Actions Rapides</h3>
          <div class="space-y-3">
            <a routerLink="/dossiers/create" class="flex items-center gap-3 p-3 bg-lawyer-primary/5 rounded-lg hover:bg-lawyer-primary/10 transition-colors">
              <span class="material-icons text-lawyer-primary">add_circle</span>
              <span class="font-medium text-lawyer-dark">Nouveau Dossier</span>
            </a>
            <a routerLink="/clients" class="flex items-center gap-3 p-3 bg-lawyer-accent/10 rounded-lg hover:bg-lawyer-accent/20 transition-colors">
              <span class="material-icons text-lawyer-accent">person_add</span>
              <span class="font-medium text-lawyer-dark">Nouveau Client</span>
            </a>
            <a routerLink="/calendar" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span class="material-icons text-green-600">event</span>
              <span class="font-medium text-lawyer-dark">Voir Calendrier</span>
            </a>
            <a routerLink="/documents" class="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <span class="material-icons text-amber-600">upload_file</span>
              <span class="font-medium text-lawyer-dark">Uploader Document</span>
            </a>
          </div>

          <!-- Audience du Jour -->
          <div class="mt-6 pt-6 border-t border-slate-100">
            <h4 class="font-medium text-lawyer-dark mb-3 flex items-center gap-2">
              <span class="material-icons text-lawyer-accent text-sm">today</span>
              Audiences aujourd'hui
            </h4>
            <div class="space-y-2">
              @for (audience of todayAudiences(); track audience.time) {
                <div class="flex items-center gap-3 p-2 bg-slate-50 rounded">
                  <span class="text-sm font-medium text-slate-600 w-16">{{ audience.time }}</span>
                  <span class="text-sm text-lawyer-dark flex-1">{{ audience.matter }}</span>
                  <span class="badge badge-warning text-xs">{{ audience.tribunal }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
  `]
})
export class DashboardComponent {
  recentDossiers = signal([
    { id: 1, titre: 'Affaire Smith c. Compagnie', client: 'John Smith', type: 'civil', statut: 'En cours', date: 'Il y a 2h' },
    { id: 2, titre: 'Contentieux commercial', client: 'SAS ABC', type: 'commercial', statut: 'Nouveau', date: 'Il y a 4h' },
    { id: 3, titre: 'Divorce contentieux', client: 'Fatima Benali', type: 'famille', statut: 'En cours', date: 'Hier' },
    { id: 4, titre: 'Litige salarial', client: 'Ahmed Trabelsi', type: 'travail', statut: 'Audience', date: 'Avant-hier' },
  ]);

  todayAudiences = signal([
    { time: '09:00', matter: 'DOS-2024-001 - Tribunal de Tunis', tribunal: 'Tunis' },
    { time: '11:00', matter: 'DOS-2024-015 - Arbitration', tribunal: 'CPC' },
  ]);

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      civil: 'balance',
      commercial: 'business',
      penal: 'gavel',
      famille: 'home',
      travail: 'work'
    };
    return icons[type] || 'folder';
  }

  getTypeBgClass(type: string): string {
    const classes: Record<string, string> = {
      civil: 'bg-blue-100',
      commercial: 'bg-amber-100',
      penal: 'bg-red-100',
      famille: 'bg-pink-100',
      travail: 'bg-green-100'
    };
    return classes[type] || 'bg-slate-100';
  }

  getTypeIconClass(type: string): string {
    const classes: Record<string, string> = {
      civil: 'text-blue-600',
      commercial: 'text-amber-600',
      penal: 'text-red-600',
      famille: 'text-pink-600',
      travail: 'text-green-600'
    };
    return classes[type] || 'text-slate-600';
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      'Nouveau': 'badge-info',
      'En cours': 'badge-warning',
      'Audience': 'badge-danger',
      'Clôturé': 'badge-success'
    };
    return classes[statut] || 'badge-info';
  }
}