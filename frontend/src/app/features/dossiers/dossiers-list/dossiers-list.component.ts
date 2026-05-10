import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dossiers-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Gestion des Dossiers</h1>
          <p class="text-slate-500 text-sm">Gérez et suivez tous vos dossiers juridiques</p>
        </div>
        <a routerLink="/dossiers/create" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-lg">add</span>
          Nouveau Dossier
        </a>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="Numéro, titre, client..."
              class="input-field"
              (input)="onSearch($event)"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Type d'affaire</label>
            <select class="select-field" (change)="onFilterChange('type', $event)">
              <option value="">Tous les types</option>
              <option value="civil">Civil</option>
              <option value="penal">Pénal</option>
              <option value="commercial">Commercial</option>
              <option value="travail">Travail</option>
              <option value="famille">Famille</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <select class="select-field" (change)="onFilterChange('statut', $event)">
              <option value="">Tous les statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="en_cours">En cours</option>
              <option value="cloture">Clôturé</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Trier par</label>
            <select class="select-field" (change)="onSortChange($event)">
              <option value="date_desc">Plus récent</option>
              <option value="date_asc">Plus ancien</option>
              <option value="priorite">Priorité</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card animate-slide-up">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Total Dossiers</p>
              <p class="text-3xl font-bold mt-1">{{ totalDossiers() }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">folder</span>
          </div>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">En Cours</p>
              <p class="text-3xl font-bold mt-1">{{ enCours() }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">hourglass_empty</span>
          </div>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Nouveaux (Ce mois)</p>
              <p class="text-3xl font-bold mt-1">{{ nouveaux() }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">new_releases</span>
          </div>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Audience قريب</p>
              <p class="text-3xl font-bold mt-1">{{ audiences() }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">event</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden p-0">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="table-header">N° Dossier</th>
              <th class="table-header">Titre</th>
              <th class="table-header">Client</th>
              <th class="table-header">Type</th>
              <th class="table-header">Statut</th>
              <th class="table-header">Avocat</th>
              <th class="table-header">Date</th>
              <th class="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (dossier of dossiers(); track dossier.id) {
              <tr class="table-row-hover">
                <td class="table-cell font-medium text-lawyer-primary">{{ dossier.numero }}</td>
                <td class="table-cell">
                  <a [routerLink]="['/dossiers', dossier.id]" class="text-lawyer-dark hover:text-lawyer-primary font-medium">
                    {{ dossier.titre }}
                  </a>
                </td>
                <td class="table-cell">{{ dossier.client }}</td>
                <td class="table-cell">
                  <span class="badge" [ngClass]="getTypeBadgeClass(dossier.type)">
                    {{ dossier.type }}
                  </span>
                </td>
                <td class="table-cell">
                  <span class="badge" [ngClass]="getStatutBadgeClass(dossier.statut)">
                    {{ getStatutLabel(dossier.statut) }}
                  </span>
                </td>
                <td class="table-cell">{{ dossier.avocat }}</td>
                <td class="table-cell text-slate-500">{{ dossier.dateCreation | date:'dd/MM/yyyy' }}</td>
                <td class="table-cell text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="p-2 text-slate-400 hover:text-lawyer-primary hover:bg-slate-100 rounded transition-all">
                      <span class="material-icons text-sm">visibility</span>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-lawyer-accent hover:bg-slate-100 rounded transition-all">
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-lawyer-danger hover:bg-slate-100 rounded transition-all">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="p-8 text-center text-slate-500">
                  <span class="material-icons text-4xl text-slate-300 block mb-2">folder_off</span>
                  Aucun dossier trouvé
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4">
        <p class="text-sm text-slate-500">
          Affichage de {{ paginationStart() }} à {{ paginationEnd() }} sur {{ totalDossiers() }} dossiers
        </p>
        <div class="flex gap-2">
          <button class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" [disabled]="currentPage() === 1">
            Précédent
          </button>
          <button class="px-3 py-1 bg-lawyer-primary text-white rounded hover:bg-lawyer-secondary">
            {{ currentPage() }}
          </button>
          <button class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">
            Suivant
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .material-icons { font-size: 18px; }
  `]
})
export class DossiersListComponent {
  totalDossiers = signal(156);
  enCours = signal(42);
  nouveaux = signal(12);
  audiences = signal(5);
  currentPage = signal(1);
  paginationStart = signal(1);
  paginationEnd = signal(10);

  dossiers = signal([
    { id: 1, numero: 'DOS-2024-001', titre: 'Affaire Smith c. Compagnie XYZ', client: 'John Smith', type: 'civil', statut: 'en_cours', avocat: 'Me. Boussayene', dateCreation: new Date('2024-01-15') },
    { id: 2, numero: 'DOS-2024-002', titre: 'Contentieux commercial - Entreprise ABC', client: 'SAS ABC', type: 'commercial', statut: 'nouveau', avocat: 'Me. Knani', dateCreation: new Date('2024-01-18') },
    { id: 3, numero: 'DOS-2024-003', titre: 'Affaire pénale - Vol avec violence', client: 'Mohammed Ali', type: 'penal', statut: 'en_cours', avocat: 'Me. Aissa', dateCreation: new Date('2024-01-10') },
    { id: 4, numero: 'DOS-2024-004', titre: 'Divorce contentieux', client: 'Fatima Benali', type: 'famille', statut: 'cloture', avocat: 'Me. Boussayene', dateCreation: new Date('2024-01-05') },
    { id: 5, numero: 'DOS-2024-005', titre: 'Litige salarial', client: 'Ahmed Trabelsi', type: 'travail', statut: 'en_cours', avocat: 'Me. Knani', dateCreation: new Date('2024-01-20') },
  ]);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log('Search:', value);
  }

  onFilterChange(type: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log('Filter:', type, value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log('Sort:', value);
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      civil: 'badge-info',
      penal: 'badge-danger',
      commercial: 'badge-warning',
      travail: 'badge-success',
      famille: 'badge-info'
    };
    return classes[type] || 'badge-info';
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      nouveau: 'badge-info',
      en_cours: 'badge-warning',
      cloture: 'badge-success',
      archive: 'bg-slate-100 text-slate-600'
    };
    return classes[statut] || 'badge-info';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      nouveau: 'Nouveau',
      en_cours: 'En cours',
      cloture: 'Clôturé',
      archive: 'Archivé'
    };
    return labels[statut] || statut;
  }
}