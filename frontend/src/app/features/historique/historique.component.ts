import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriqueService, HistoriqueDossier } from '../../core/services/historique.service';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Historique des dossiers</h1>
          <p class="text-slate-500 text-sm">Consultez les dossiers clôturés avec leurs tâches, documents et feedbacks</p>
        </div>
      </div>

      @if (loading()) {
        <div class="card p-8 text-center">
          <span class="material-icons text-4xl text-slate-300 animate-spin block mb-2">refresh</span>
          <p class="text-slate-500">Chargement...</p>
        </div>
      } @else if (items().length === 0) {
        <div class="card p-12 text-center">
          <span class="material-icons text-6xl text-slate-300 block mb-4">history</span>
          <h3 class="text-lg font-semibold text-slate-600 mb-2">Aucun historique</h3>
          <p class="text-slate-500 text-sm">Les dossiers clôturés apparaîtront ici avec leurs tâches et documents.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (item of items(); track item._id) {
            <div class="card overflow-hidden">
              <div class="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 text-white flex items-center justify-between cursor-pointer hover:from-slate-600 hover:to-slate-700 transition-all"
                   (click)="toggleItem(item._id)">
                <div class="flex items-center gap-4 min-w-0">
                  <span class="material-icons transition-transform flex-shrink-0"
                        [class.rotate-90]="isExpanded(item._id)">chevron_right</span>
                  <div class="min-w-0">
                    <p class="text-slate-300 text-xs">Dossier clôturé</p>
                    <h3 class="text-lg font-bold truncate">{{ item.dossier.numero }} — {{ item.dossier.titre }}</h3>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span class="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded">{{ item.taches.length }} tâche(s)</span>
                  <span class="text-xs text-slate-300">{{ item.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              @if (isExpanded(item._id)) {
                <div class="p-6 animate-fade-in">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p class="text-xs text-slate-500">Type</p>
                      <p class="font-medium text-sm">{{ getTypeLabel(item.dossier.typeAffaire) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">Priorité</p>
                      <p class="font-medium text-sm">{{ item.dossier.priorite }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">Date création</p>
                      <p class="font-medium text-sm">{{ item.dossier.dateCreation | date:'dd/MM/yyyy' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">Date clôture</p>
                      <p class="font-medium text-sm">{{ item.dossier.dateCloture | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>

                  @if (item.dossier.description) {
                    <div class="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p class="text-sm text-slate-600">{{ item.dossier.description }}</p>
                    </div>
                  }

                  @if (item.taches.length > 0) {
                    <div class="space-y-2">
                      @for (tache of item.taches; track tache._id) {
                        <div class="p-4 rounded-xl border border-slate-200">
                          <div class="flex items-start justify-between gap-2">
                            <div>
                              <p class="font-semibold text-lawyer-dark">{{ tache.titre }}</p>
                              @if (tache.description) {
                                <p class="text-xs text-slate-500 mt-0.5">{{ tache.description }}</p>
                              }
                            </div>
                            <span class="badge text-[10px]" [ngClass]="getStatutBadgeClass(tache.statut)">
                              {{ getStatutLabel(tache.statut) }}
                            </span>
                          </div>

                          <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                            @if (tache.assigneeA) {
                              <span class="flex items-center gap-1">
                                <span class="material-icons text-sm">person</span>
                                {{ tache.assigneeA.prenom }} {{ tache.assigneeA.nom }}
                              </span>
                            }
                            @if (tache.dateEcheance) {
                              <span class="flex items-center gap-1">
                                <span class="material-icons text-sm">event</span>
                                {{ tache.dateEcheance | date:'dd/MM/yyyy' }}
                              </span>
                            }
                            @if (tache.priorite) {
                              <span class="flex items-center gap-1">
                                <span class="material-icons text-sm" [style.color]="getPriorityColor(tache.priorite)">flag</span>
                                P{{ tache.priorite }}
                              </span>
                            }
                          </div>

                          @if (tache.feedback) {
                            <div class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p class="text-xs font-semibold text-blue-700 mb-1">Feedback</p>
                              <p class="text-sm text-blue-900 whitespace-pre-wrap">{{ tache.feedback }}</p>
                            </div>
                          }

                          @if (tache.documents && tache.documents.length > 0) {
                            <div class="mt-3">
                              <p class="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                <span class="material-icons text-sm">attach_file</span>
                                Documents ({{ tache.documents.length }})
                              </p>
                              <div class="space-y-1">
                                @for (doc of tache.documents; track $index) {
                                  <div class="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                    <span class="text-sm text-slate-700 truncate flex items-center gap-2 min-w-0">
                                      <span class="material-icons text-slate-400 text-base">picture_as_pdf</span>
                                      <span class="truncate">{{ doc.nom }}</span>
                                    </span>
                                    @if (doc._id) {
                                      <button (click)="downloadDoc(doc._id, doc.nom)" class="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-lawyer-primary transition-colors flex-shrink-0" title="Télécharger">
                                        <span class="material-icons text-sm">download</span>
                                      </button>
                                    }
                                  </div>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between mt-4">
            <p class="text-sm text-slate-500">Page {{ currentPage() }} sur {{ totalPages() }}</p>
            <div class="flex gap-2">
              <button class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                      [disabled]="currentPage() === 1"
                      (click)="goToPage(currentPage() - 1)">Précédent</button>
              <button class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                      [disabled]="currentPage() >= totalPages()"
                      (click)="goToPage(currentPage() + 1)">Suivant</button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
  `]
})
export class HistoriqueComponent implements OnInit {
  items = signal<HistoriqueDossier[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  limit = 10;
  expandedItems = signal<Set<string>>(new Set());

  isExpanded(id: any): boolean {
    return this.expandedItems().has(typeof id === 'object' ? id.toString() : id);
  }

  toggleItem(id: any) {
    const key = typeof id === 'object' ? id.toString() : id;
    const set = new Set(this.expandedItems());
    if (set.has(key)) set.delete(key); else set.add(key);
    this.expandedItems.set(set);
  }

  constructor(
    private historiqueService: HistoriqueService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    this.loadHistorique();
  }

  loadHistorique() {
    this.loading.set(true);
    this.historiqueService.getHistorique({ page: this.currentPage(), limit: this.limit }).subscribe({
      next: (res) => {
        this.items.set(res.historique);
        this.totalPages.set(res.pagination.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadHistorique();
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      civil: 'Civil', penal: 'Pénal', commercial: 'Commercial', travail: 'Travail',
      famille: 'Famille', administratif: 'Administratif', immobilier: 'Immobilier',
      bancaire: 'Bancaire', autre: 'Autre'
    };
    return labels[type] || type;
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      'a_faire': 'badge-warning', 'en_cours': 'badge-info',
      'terminee': 'badge-success', 'annulee': 'badge-danger'
    };
    return classes[statut] || 'badge-info';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'a_faire': 'À faire', 'en_cours': 'En cours',
      'terminee': 'Terminée', 'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getPriorityColor(priorite: number): string {
    if (priorite >= 5) return '#ef4444';
    if (priorite >= 4) return '#f97316';
    if (priorite >= 3) return '#f59e0b';
    return '#10b981';
  }

  downloadDoc(id: string, filename: string) {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading document:', err)
    });
  }
}
