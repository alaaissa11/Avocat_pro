import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationService, Operation } from '../../core/services/operation.service';

const TYPE_LABELS: Record<string, string> = {
  dossier_cree: 'Dossier créé',
  dossier_modifie: 'Dossier modifié',
  dossier_cloture: 'Dossier clôturé',
  dossier_archive: 'Dossier archivé',
  client_cree: 'Client créé',
  client_modifie: 'Client modifié',
  document_uploade: 'Document uploadé',
  document_modifie: 'Document modifié',
  document_supprime: 'Document supprimé',
  tache_cree: 'Tâche créée',
  tache_modifiee: 'Tâche modifiée',
  tache_terminee: 'Tâche terminée',
  facture_cree: 'Facture créée',
  facture_modifiee: 'Facture modifiée',
  facture_payee: 'Facture payée',
  utilisateur_connecte: 'Connexion',
  utilisateur_cree: 'Utilisateur créé',
  utilisateur_modifie: 'Utilisateur modifié',
  calendrier_cree: 'Événement créé',
  calendrier_modifie: 'Événement modifié',
  calendrier_supprime: 'Événement supprimé',
  ia_prediction: 'Prédiction IA',
  export_donnees: 'Export de données',
  autre: 'Autre'
};

const TYPE_ICONS: Record<string, string> = {
  dossier_cree: 'folder',
  dossier_modifie: 'edit_note',
  dossier_cloture: 'lock',
  dossier_archive: 'archive',
  client_cree: 'person_add',
  client_modifie: 'edit',
  document_uploade: 'upload_file',
  document_modifie: 'description',
  document_supprime: 'delete',
  tache_cree: 'checklist',
  tache_modifiee: 'assignment',
  tache_terminee: 'task_alt',
  facture_cree: 'receipt',
  facture_modifiee: 'receipt_long',
  facture_payee: 'payments',
  utilisateur_connecte: 'login',
  utilisateur_cree: 'person_add',
  utilisateur_modifie: 'manage_accounts',
  calendrier_cree: 'event',
  calendrier_modifie: 'edit_calendar',
  calendrier_supprime: 'event_busy',
  ia_prediction: 'psychology',
  export_donnees: 'file_download',
  autre: 'more_horiz'
};

const TYPE_COLORS: Record<string, string> = {
  dossier_cree: 'bg-emerald-100 text-emerald-700',
  dossier_modifie: 'bg-blue-100 text-blue-700',
  dossier_cloture: 'bg-purple-100 text-purple-700',
  dossier_archive: 'bg-slate-100 text-slate-700',
  client_cree: 'bg-emerald-100 text-emerald-700',
  client_modifie: 'bg-blue-100 text-blue-700',
  document_uploade: 'bg-emerald-100 text-emerald-700',
  document_modifie: 'bg-blue-100 text-blue-700',
  document_supprime: 'bg-red-100 text-red-700',
  tache_cree: 'bg-emerald-100 text-emerald-700',
  tache_modifiee: 'bg-blue-100 text-blue-700',
  tache_terminee: 'bg-emerald-100 text-emerald-700',
  facture_cree: 'bg-amber-100 text-amber-700',
  facture_modifiee: 'bg-blue-100 text-blue-700',
  facture_payee: 'bg-emerald-100 text-emerald-700',
  utilisateur_connecte: 'bg-sky-100 text-sky-700',
  utilisateur_cree: 'bg-emerald-100 text-emerald-700',
  utilisateur_modifie: 'bg-blue-100 text-blue-700',
  calendrier_cree: 'bg-emerald-100 text-emerald-700',
  calendrier_modifie: 'bg-blue-100 text-blue-700',
  calendrier_supprime: 'bg-red-100 text-red-700',
  ia_prediction: 'bg-violet-100 text-violet-700',
  export_donnees: 'bg-cyan-100 text-cyan-700',
  autre: 'bg-slate-100 text-slate-700'
};

const ENTITE_OPTIONS = [
  { value: '', label: 'Toutes' },
  { value: 'dossier', label: 'Dossier' },
  { value: 'client', label: 'Client' },
  { value: 'document', label: 'Document' },
  { value: 'tache', label: 'Tâche' },
  { value: 'facture', label: 'Facture' },
  { value: 'user', label: 'Utilisateur' },
  { value: 'calendrier', label: 'Calendrier' }
];

const TYPE_GROUPS: { label: string; icon: string; types: string[] }[] = [
  { label: 'Tous', icon: 'all_inclusive', types: [] },
  { label: 'Dossiers', icon: 'folder', types: ['dossier_cree', 'dossier_modifie', 'dossier_cloture', 'dossier_archive'] },
  { label: 'Clients', icon: 'people', types: ['client_cree', 'client_modifie'] },
  { label: 'Documents', icon: 'description', types: ['document_uploade', 'document_modifie', 'document_supprime'] },
  { label: 'Tâches', icon: 'assignment', types: ['tache_cree', 'tache_modifiee', 'tache_terminee'] },
  { label: 'Factures', icon: 'receipt', types: ['facture_cree', 'facture_modifiee', 'facture_payee'] },
  { label: 'Utilisateurs', icon: 'person', types: ['utilisateur_cree', 'utilisateur_modifie', 'utilisateur_connecte'] },
  { label: 'Calendrier', icon: 'calendar_today', types: ['calendrier_cree', 'calendrier_modifie', 'calendrier_supprime'] }
];

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title mb-1">Journal d'activité</h1>
          <p class="text-sm text-slate-500">Traçabilité des opérations effectuées sur la plateforme</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-400">
          <span class="material-icons text-lg">history</span>
          <span>{{ totalOperations() }} opérations</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-card p-4 mb-4">
        <div class="flex flex-wrap items-end gap-3">
          <!-- Catégorie -->
          <div class="flex-1 min-w-[140px]">
            <label class="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
            <select [(ngModel)]="filterCategory" (change)="applyFilters()" class="select-field w-full">
              @for (g of typeGroups; track g.label) {
                <option [value]="g.label">{{ g.label }}</option>
              }
            </select>
          </div>
          <!-- Entité -->
          <div class="flex-1 min-w-[130px]">
            <label class="block text-xs font-medium text-slate-500 mb-1">Type d'entité</label>
            <select [(ngModel)]="filterEntite" (change)="applyFilters()" class="select-field w-full">
              @for (e of entiteOptions; track e.value) {
                <option [value]="e.value">{{ e.label }}</option>
              }
            </select>
          </div>
          <!-- Date début -->
          <div class="flex-1 min-w-[130px]">
            <label class="block text-xs font-medium text-slate-500 mb-1">Date début</label>
            <input type="date" [(ngModel)]="filterDateDebut" (change)="applyFilters()" class="input-field w-full">
          </div>
          <!-- Date fin -->
          <div class="flex-1 min-w-[130px]">
            <label class="block text-xs font-medium text-slate-500 mb-1">Date fin</label>
            <input type="date" [(ngModel)]="filterDateFin" (change)="applyFilters()" class="input-field w-full">
          </div>
          <!-- Reset -->
          <button (click)="resetFilters()" class="btn-secondary text-sm px-3 py-2 flex items-center gap-1">
            <span class="material-icons text-sm">clear</span>
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center text-slate-400">Chargement...</div>
        } @else if (operations().length === 0) {
          <div class="p-8 text-center text-slate-400">
            <span class="material-icons text-3xl mb-2">inbox</span>
            <p>Aucune opération trouvée</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/50">
                  <th class="table-header text-left">Date & Heure</th>
                  <th class="table-header text-left">Utilisateur</th>
                  <th class="table-header text-left">Action</th>
                  <th class="table-header text-left">Entité</th>
                  <th class="table-header text-left">Détails</th>
                </tr>
              </thead>
              <tbody>
                @for (op of operations(); track op._id) {
                  <tr class="table-row-hover border-b border-slate-50">
                    <td class="table-cell">
                      <div class="text-sm text-slate-700">{{ op.date | date:'dd/MM/yyyy' }}</div>
                      <div class="text-xs text-slate-400">{{ op.date | date:'HH:mm' }}</div>
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-lawyer-primary/10 flex items-center justify-center text-lawyer-primary text-[10px] font-bold">
                          {{ getUserInitials(op.userId) }}
                        </div>
                        <div>
                          <span class="text-sm text-slate-700">
                            {{ op.userId ? (op.userId.prenom + ' ' + op.userId.nom) : 'Système' }}
                          </span>
                          @if (op.userId && op.userId.role) {
                            <span class="text-xs text-slate-400 block">{{ getRoleLabel(op.userId.role) }}</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="table-cell">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium {{ getTypeColor(op.type) }}">
                        <span class="material-icons text-xs">{{ getTypeIcon(op.type) }}</span>
                        {{ getTypeLabel(op.type) }}
                      </span>
                    </td>
                    <td class="table-cell">
                      <span class="inline-flex items-center gap-1 text-sm text-slate-600">
                        <span class="material-icons text-sm">{{ getEntiteIcon(op.entiteType) }}</span>
                        {{ getEntiteLabel(op.entiteType) }}
                      </span>
                    </td>
                    <td class="table-cell">
                      <p class="text-sm text-slate-600 max-w-xs truncate">{{ op.details || '—' }}</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between p-4 border-t border-slate-100">
            <span class="text-sm text-slate-500">
              Page {{ currentPage() }} / {{ totalPages() }}
            </span>
            <div class="flex gap-1">
              <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1"
                      class="btn-secondary px-3 py-1.5 text-sm" [class.opacity-40]="currentPage() <= 1">
                <span class="material-icons text-sm">chevron_left</span>
              </button>
              @for (p of pageNumbers(); track p) {
                <button (click)="goToPage(p)"
                        class="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
                        [class.bg-lawyer-primary]="p === currentPage()"
                        [class.text-white]="p === currentPage()"
                        [class.text-slate-600]="p !== currentPage()"
                        [class.hover:bg-slate-100]="p !== currentPage()">
                  {{ p }}
                </button>
              }
              <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()"
                      class="btn-secondary px-3 py-1.5 text-sm" [class.opacity-40]="currentPage() >= totalPages()">
                <span class="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
    .material-icons.text-xs { font-size: 14px; }
    .material-icons.text-sm { font-size: 16px; }
    .material-icons.text-lg { font-size: 20px; }
    .material-icons.text-3xl { font-size: 36px; }
  `]
})
export class OperationsComponent implements OnInit {
  private operationService = inject(OperationService);

  operations = signal<Operation[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalOperations = signal(0);

  filterCategory = signal('Tous');
  filterEntite = signal('');
  filterDateDebut = signal('');
  filterDateFin = signal('');

  typeGroups = TYPE_GROUPS;
  entiteOptions = ENTITE_OPTIONS;

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit() {
    this.loadOperations();
  }

  loadOperations() {
    this.loading.set(true);
    const selectedGroup = this.typeGroups.find(g => g.label === this.filterCategory());
    const typeFilter = selectedGroup && selectedGroup.types.length > 0 ? selectedGroup.types.join(',') : undefined;
    this.operationService.getOperations({
      page: this.currentPage(),
      limit: 15,
      entiteType: this.filterEntite() || undefined,
      type: typeFilter,
      dateDebut: this.filterDateDebut() || undefined,
      dateFin: this.filterDateFin() || undefined
    }).subscribe({
      next: (res) => {
        this.operations.set(res.operations);
        this.totalPages.set(res.pagination.pages);
        this.totalOperations.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadOperations();
  }

  resetFilters() {
    this.filterCategory.set('Tous');
    this.filterEntite.set('');
    this.filterDateDebut.set('');
    this.filterDateFin.set('');
    this.currentPage.set(1);
    this.loadOperations();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadOperations();
  }

  getTypeLabel(type: string): string {
    return TYPE_LABELS[type] || type;
  }

  getTypeIcon(type: string): string {
    return TYPE_ICONS[type] || 'circle';
  }

  getTypeColor(type: string): string {
    return TYPE_COLORS[type] || 'bg-slate-100 text-slate-700';
  }

  getEntiteLabel(type: string): string {
    const labels: Record<string, string> = { dossier: 'Dossier', client: 'Client', document: 'Document', tache: 'Tâche', facture: 'Facture', user: 'Utilisateur', calendrier: 'Calendrier', autre: 'Autre' };
    return labels[type] || type;
  }

  getEntiteIcon(type: string): string {
    const icons: Record<string, string> = { dossier: 'folder', client: 'people', document: 'description', tache: 'checklist', facture: 'receipt', user: 'person', calendrier: 'calendar_today', autre: 'more_horiz' };
    return icons[type] || 'circle';
  }

  getUserInitials(u: { nom?: string; prenom?: string } | null): string {
    if (!u) return 'S';
    return ((u.nom?.[0] || '') + (u.prenom?.[0] || '')).toUpperCase() || '?';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = { admin: 'Admin', avocat: 'Avocat', collaborateur: 'Collaborateur', assistant: 'Assistant', secretaire: 'Secrétaire' };
    return labels[role] || role;
  }
}
