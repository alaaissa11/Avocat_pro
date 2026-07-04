import { Component, signal, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DossierService } from '../../../core/services/dossier.service';
import { DocumentService, Document } from '../../../core/services/document.service';
import { Dossier, DossierStats } from '../../../core/models/dossier.model';

@Component({
  selector: 'app-dossiers-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (selectedDossier()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeModal()">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="bg-gradient-to-r from-lawyer-primary to-lawyer-dark text-white p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm">Dossier</p>
                <h2 class="text-2xl font-bold">{{ selectedDossier()?.numero }}</h2>
              </div>
              <button (click)="closeModal()" class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
                <span class="material-icons text-2xl">close</span>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <!-- Client Info -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons text-lawyer-primary">person</span>
                <h3 class="text-lg font-semibold text-lawyer-dark">Client</h3>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Nom complet</p>
                    <p class="font-semibold text-lawyer-dark">{{ getClientFullInfo(selectedDossier()?.clientId) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informations principales -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons text-lawyer-primary">info</span>
                <h3 class="text-lg font-semibold text-lawyer-dark">Informations principales</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Titre</p>
                  <p class="font-semibold text-lawyer-dark">{{ selectedDossier()?.titre }}</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Type d'affaire</p>
                  <span class="badge mt-1" [ngClass]="getTypeBadgeClass(selectedDossier()?.typeAffaire || '')">
                    {{ getTypeLabel(selectedDossier()?.typeAffaire || '') }}
                  </span>
                </div>
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Statut</p>
                  <span class="badge mt-1" [ngClass]="getStatutBadgeClass(selectedDossier()?.statut || '')">
                    {{ getStatutLabel(selectedDossier()?.statut || '') }}
                  </span>
                </div>
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Priorité</p>
                  <div class="flex items-center gap-2 mt-1">
                    @switch (selectedDossier()?.priorite) {
                      @case (1) { <span class="material-icons text-red-500">keyboard_double_arrow_up</span> }
                      @case (2) { <span class="material-icons text-orange-500">keyboard_arrow_up</span> }
                      @case (3) { <span class="material-icons text-amber-500">remove</span> }
                      @case (4) { <span class="material-icons text-lime-500">keyboard_arrow_down</span> }
                      @case (5) { <span class="material-icons text-green-500">keyboard_double_arrow_down</span> }
                    }
                    <span class="font-medium">{{ getPrioriteLabel(selectedDossier()?.priorite || 3) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            @if (selectedDossier()?.description) {
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-icons text-lawyer-primary">description</span>
                  <h3 class="text-lg font-semibold text-lawyer-dark">Description</h3>
                </div>
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p class="text-slate-700 whitespace-pre-line">{{ selectedDossier()?.description }}</p>
                </div>
              </div>
            }

            <!-- Dates et Juridiction -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons text-lawyer-primary">calendar_today</span>
                <h3 class="text-lg font-semibold text-lawyer-dark">Dates et Juridiction</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wide">Date création</p>
                  <p class="font-semibold text-lawyer-dark">{{ selectedDossier()?.dateCreation | date:'dd/MM/yyyy' }}</p>
                </div>
                @if (selectedDossier()?.dateAudience) {
                  <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Date audience</p>
                    <p class="font-semibold text-lawyer-dark">{{ selectedDossier()?.dateAudience | date:'dd/MM/yyyy' }}</p>
                  </div>
                }
                @if (selectedDossier()?.juridiction) {
                  <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Juridiction</p>
                    <p class="font-semibold text-lawyer-dark">{{ selectedDossier()?.juridiction }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Partie adverse -->
            @if (selectedDossier()?.adversary) {
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-icons text-lawyer-primary">person_off</span>
                  <h3 class="text-lg font-semibold text-lawyer-dark">Partie adverse</h3>
                </div>
                <div class="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    @if (selectedDossier()?.adversary?.nom) {
                      <div>
                        <p class="text-xs text-red-400 uppercase tracking-wide">Nom</p>
                        <p class="font-semibold text-red-800">{{ selectedDossier()?.adversary?.nom }}</p>
                      </div>
                    }
                    @if (selectedDossier()?.adversary?.avocat) {
                      <div>
                        <p class="text-xs text-red-400 uppercase tracking-wide">Avocat</p>
                        <p class="font-semibold text-red-800">{{ selectedDossier()?.adversary?.avocat }}</p>
                      </div>
                    }
                    @if (selectedDossier()?.adversary?.email) {
                      <div>
                        <p class="text-xs text-red-400 uppercase tracking-wide">Email</p>
                        <p class="font-semibold text-red-800">{{ selectedDossier()?.adversary?.email }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Avocat responsable -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-icons text-lawyer-primary">gavel</span>
                <h3 class="text-lg font-semibold text-lawyer-dark">Avocat responsable</h3>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p class="font-semibold text-lawyer-dark">{{ getAssigneFullInfo(selectedDossier()?.assigneA) }}</p>
              </div>
            </div>

            <!-- Suggestions IA -->
            @if (selectedDossier()?.iaPrediction && hasIAPrediction()) {
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-icons text-purple-600">psychology</span>
                  <h3 class="text-lg font-semibold text-lawyer-dark">Suggestions IA Prédictives</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <!-- Durée suggérée -->
                  @if (selectedDossier()?.iaPrediction?.dureeSuggeree) {
                    <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="material-icons text-blue-500 text-lg">schedule</span>
                        <span class="text-sm font-medium text-blue-700">Durée estimée</span>
                      </div>
                      <p class="text-xl font-bold text-blue-800">{{ selectedDossier()?.iaPrediction?.dureeSuggeree }} jours</p>
                      <p class="text-xs text-blue-600">Confiance: {{ selectedDossier()?.iaPrediction?.dureeConfiance }}%</p>
                    </div>
                  }

                  <!-- Probabilité de succès -->
                  @if (selectedDossier()?.iaPrediction?.probabiliteSuccess) {
                    <div class="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="material-icons text-green-500 text-lg">trending_up</span>
                        <span class="text-sm font-medium text-green-700">Probabilité de succès</span>
                      </div>
                      <p class="text-xl font-bold text-green-800">{{ selectedDossier()?.iaPrediction?.probabiliteSuccess }}%</p>
                    </div>
                  }

                  <!-- Catégorie suggérée -->
                  @if (selectedDossier()?.iaPrediction?.categorieSuggeree) {
                    <div class="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="material-icons text-purple-500 text-lg">category</span>
                        <span class="text-sm font-medium text-purple-700">Catégorie suggérée</span>
                      </div>
                      <p class="text-xl font-bold text-purple-800">{{ selectedDossier()?.iaPrediction?.categorieSuggeree }}</p>
                      <p class="text-xs text-purple-600">Confiance: {{ selectedDossier()?.iaPrediction?.confiance }}%</p>
                    </div>
                  }
                </div>

                <!-- Avocat recommandé -->
                @if (selectedDossier()?.iaPrediction?.avocatRecommandeNom) {
                  <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200 mb-4">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="material-icons text-indigo-500 text-lg">person</span>
                      <span class="text-sm font-medium text-indigo-700">Avocat recommandé</span>
                    </div>
                    <p class="font-semibold text-indigo-800">{{ selectedDossier()?.iaPrediction?.avocatRecommandeNom }}</p>
                  </div>
                }

                <!-- Documents suggérés -->
                @if (selectedDossier()?.iaPrediction?.documentsSuggernes?.length) {
                  <div class="p-4 bg-orange-50 rounded-xl border border-orange-200 mb-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="material-icons text-orange-500 text-lg">description</span>
                      <span class="text-sm font-medium text-orange-700">Documents suggérés</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (doc of selectedDossier()?.iaPrediction?.documentsSuggernes; track doc) {
                        <span class="px-2 py-1 text-xs rounded-full bg-white border border-orange-200 text-orange-700">
                          {{ doc }}
                        </span>
                      }
                    </div>
                  </div>
                }

                <!-- Planning suggéré -->
                @if (selectedDossier()?.iaPrediction?.planningSuggere) {
                  <div class="p-4 bg-teal-50 rounded-xl border border-teal-200">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="material-icons text-teal-500 text-lg">timeline</span>
                      <span class="text-sm font-medium text-teal-700">Planning suggéré</span>
                    </div>
                    <div class="space-y-2">
                      @for (step of selectedDossier()?.iaPrediction?.planningSuggere?.etapes?.slice(0, 5); track step.etape) {
                        <div class="flex items-center gap-2 text-xs">
                          <span class="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-medium">{{ step.ordre }}</span>
                          <span class="flex-1 text-slate-700">{{ step.etape }}</span>
                          <span class="text-slate-500">{{ step.delai }} jours</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Historique -->
            @if (selectedDossier()?.historique && selectedDossier()!.historique.length > 0) {
              <div>
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-icons text-lawyer-primary">history</span>
                  <h3 class="text-lg font-semibold text-lawyer-dark">Historique</h3>
                </div>
                <div class="space-y-3">
                  @for (item of selectedDossier()!.historique.slice(-5); track $index) {
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="font-medium text-lawyer-dark">{{ getActionLabel(item.action) }}</p>
                          @if (item.details) {
                            <p class="text-sm text-slate-500">{{ item.details }}</p>
                          }
                        </div>
                        <p class="text-xs text-slate-400">{{ item.date | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button (click)="closeModal()" class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
              Fermer
            </button>
            <a [routerLink]="['/dossiers', selectedDossier()?._id]" class="px-4 py-2 bg-lawyer-primary text-white rounded-lg hover:bg-lawyer-dark transition-all flex items-center gap-2">
              <span class="material-icons text-sm">edit</span>
              Modifier
            </a>
          </div>
        </div>
      </div>
    }
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
            <select class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 8px 36px 8px 12px; font-size: 13px; font-weight: 500; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 10px center/18px; appearance: none; -webkit-appearance: none;" (change)="onFilterChange('type', $event)">
              <option value="">Tous les types</option>
              <option value="civil">Civil</option>
              <option value="penal">Pénal</option>
              <option value="commercial">Commercial</option>
              <option value="travail">Travail</option>
              <option value="famille">Famille</option>
              <option value="administratif">Administratif</option>
              <option value="immobilier">Immobilier</option>
              <option value="bancaire">Bancaire</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <select class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 8px 36px 8px 12px; font-size: 13px; font-weight: 500; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 10px center/18px; appearance: none; -webkit-appearance: none;" (change)="onFilterChange('statut', $event)">
              <option value="">Tous les statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="en_cours">En cours</option>
              <option value="en_attente">En attente</option>
              <option value="cloture">Clôturé</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Trier par</label>
            <select class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 8px 36px 8px 12px; font-size: 13px; font-weight: 500; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 10px center/18px; appearance: none; -webkit-appearance: none;" (change)="onSortChange($event)">
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
              <p class="text-3xl font-bold mt-1">{{ stats()?.total || 0 }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">folder</span>
          </div>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">En Cours</p>
              <p class="text-3xl font-bold mt-1">{{ stats()?.enCours || 0 }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">hourglass_empty</span>
          </div>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Nouveaux</p>
              <p class="text-3xl font-bold mt-1">{{ stats()?.nouveau || 0 }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">new_releases</span>
          </div>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Clôturés</p>
              <p class="text-3xl font-bold mt-1">{{ stats()?.cloture || 0 }}</p>
            </div>
            <span class="material-icons text-blue-200 text-4xl">check_circle</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden p-0">
        @if (loading()) {
          <div class="p-8 text-center">
            <span class="material-icons text-4xl text-slate-300 animate-spin block mb-2">refresh</span>
            Chargement...
          </div>
        } @else {
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
              @for (dossier of dossiers(); track dossier._id) {
                <tr class="table-row-hover">
                  <td class="table-cell font-medium text-lawyer-primary">{{ dossier.numero }}</td>
                  <td class="table-cell">
                    <a [routerLink]="['/dossiers', dossier._id]" class="text-lawyer-dark hover:text-lawyer-primary font-medium">
                      {{ dossier.titre }}
                    </a>
                  </td>
                  <td class="table-cell">{{ getClientName(dossier.clientId) }}</td>
                  <td class="table-cell">
                    <span class="badge" [ngClass]="getTypeBadgeClass(dossier.typeAffaire)">
                      {{ getTypeLabel(dossier.typeAffaire) }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span class="badge" [ngClass]="getStatutBadgeClass(dossier.statut)">
                      {{ getStatutLabel(dossier.statut) }}
                    </span>
                  </td>
                  <td class="table-cell">{{ getAssigneName(dossier.assigneA) }}</td>
                  <td class="table-cell text-slate-500">{{ dossier.dateCreation | date:'dd/MM/yyyy' }}</td>
                  <td class="table-cell text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="viewDossier(dossier)" class="p-2 text-slate-400 hover:text-lawyer-primary hover:bg-slate-100 rounded transition-all" title="Voir">
                        <span class="material-icons text-sm">visibility</span>
                      </button>
                      <button class="p-2 text-slate-400 hover:text-lawyer-accent hover:bg-slate-100 rounded transition-all" title="Modifier">
                        <span class="material-icons text-sm">edit</span>
                      </button>
                      <button class="p-2 text-slate-400 hover:text-lawyer-danger hover:bg-slate-100 rounded transition-all" title="Supprimer">
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
        }
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4">
        <p class="text-sm text-slate-500">
          Affichage de {{ paginationStart() }} à {{ paginationEnd() }} sur {{ total() }} dossiers
        </p>
        <div class="flex gap-2">
          <button 
            class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" 
            [disabled]="currentPage() === 1"
            (click)="goToPage(currentPage() - 1)">
            Précédent
          </button>
          @for (page of getPageNumbers(); track page) {
            <button 
              class="px-3 py-1 rounded hover:bg-slate-50"
              [ngClass]="page === currentPage() ? 'bg-lawyer-primary text-white' : 'border border-slate-200'"
              (click)="goToPage(page)">
              {{ page }}
            </button>
          }
          <button 
            class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
            [disabled]="currentPage() >= totalPages()"
            (click)="goToPage(currentPage() + 1)">
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
export class DossiersListComponent implements OnInit {
  private dossierService = inject(DossierService);
  private documentService = inject(DocumentService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  dossiers = signal<Dossier[]>([]);
  stats = signal<DossierStats | null>(null);
  loading = signal(true);
  selectedDossier = signal<Dossier | null>(null);
  dossierDocuments = signal<Document[]>([]);
  
  // Plain array for documents (more reliable)
  documentsList: Document[] = [];
  
  currentPage = signal(1);
  paginationStart = signal(1);
  paginationEnd = signal(10);
  limit = 10;
  total = signal(0);
  totalPages = signal(1);
  
  filters = signal<{search?: string; typeAffaire?: string; statut?: string}>({});

  ngOnInit() {
    this.loadDossiers();
    this.loadStats();
  }

  loadDossiers() {
    this.loading.set(true);
    const params = {
      page: this.currentPage(),
      limit: this.limit,
      ...this.filters()
    };
    
    this.dossierService.getDossiers(params).subscribe({
      next: (response) => {
        this.dossiers.set(response.dossiers);
        this.total.set(response.pagination.total);
        this.totalPages.set(response.pagination.pages);
        this.updatePagination();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dossiers:', err);
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.dossierService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  updatePagination() {
    const page = this.currentPage();
    const limit = this.limit;
    this.paginationStart.set((page - 1) * limit + 1);
    this.paginationEnd.set(Math.min(page * limit, this.total()));
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.currentPage();
    const total = this.totalPages();
    
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDossiers();
    }
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filters.update(f => ({ ...f, search: value }));
    this.currentPage.set(1);
    this.loadDossiers();
  }

  onFilterChange(type: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filters.update(f => ({ 
      ...f, 
      [type === 'type' ? 'typeAffaire' : 'statut']: value || undefined 
    }));
    this.currentPage.set(1);
    this.loadDossiers();
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
      famille: 'badge-info',
      administratif: 'badge-secondary',
      immobilier: 'badge-info',
      bancaire: 'badge-warning',
      autre: 'bg-slate-100 text-slate-600'
    };
    return classes[type] || 'badge-info';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      civil: 'Civil',
      penal: 'Pénal',
      commercial: 'Commercial',
      travail: 'Travail',
      famille: 'Famille',
      administratif: 'Administratif',
      immobilier: 'Immobilier',
      bancaire: 'Bancaire',
      autre: 'Autre'
    };
    return labels[type] || type;
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      nouveau: 'badge-info',
      en_cours: 'badge-warning',
      en_attente: 'bg-orange-100 text-orange-700',
      cloture: 'badge-success',
      archive: 'bg-slate-100 text-slate-600'
    };
    return classes[statut] || 'badge-info';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      nouveau: 'Nouveau',
      en_cours: 'En cours',
      en_attente: 'En attente',
      cloture: 'Clôturé',
      archive: 'Archivé'
    };
    return labels[statut] || statut;
  }

  getClientName(clientId: string | { _id: string; nom: string; prenom?: string } | undefined): string {
    if (!clientId) return '-';
    if (typeof clientId === 'string') return clientId;
    return `${clientId.nom} ${clientId.prenom || ''}`.trim();
  }

  getAssigneName(assigneA: string | { _id: string; nom: string; prenom?: string } | undefined | null): string {
    if (!assigneA) return '-';
    if (typeof assigneA === 'string') return assigneA;
    return `${assigneA.nom} ${assigneA.prenom || ''}`.trim();
  }

  getAssigneFullInfo(assigneA: string | { _id: string; nom: string; prenom?: string } | undefined | null): string {
    if (!assigneA) return 'Non assigné';
    if (typeof assigneA === 'string') return assigneA;
    return `${assigneA.nom} ${assigneA.prenom || ''}`.trim();
  }

  getClientFullInfo(clientId: string | { _id: string; nom: string; prenom?: string } | undefined): string {
    if (!clientId) return '-';
    if (typeof clientId === 'string') return clientId;
    return `${clientId.nom} ${clientId.prenom || ''}`.trim();
  }

  getPrioriteLabel(priorite: number): string {
    const labels: Record<number, string> = {
      1: 'Haute',
      2: 'Moyenne-Haute',
      3: 'Moyenne',
      4: 'Moyenne-Basse',
      5: 'Basse'
    };
    return labels[priorite] || 'Moyenne';
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'dossier_cree': 'Dossier créé',
      'dossier_modifie': 'Dossier modifié',
      'commentaire': 'Commentaire ajouté',
      'statut_change': 'Statut changé',
      'assigne_change': 'Avocat assigné'
    };
    return labels[action] || action;
  }

  hasIAPrediction(): boolean {
    const pred = this.selectedDossier()?.iaPrediction;
    return !!(pred?.categorieSuggeree || pred?.dureeSuggeree || pred?.probabiliteSuccess || pred?.documentsSuggernes?.length || pred?.planningSuggere);
  }

  viewDossier(dossier: Dossier) {
    console.log('Opening dossier:', dossier._id, dossier.numero);
    this.dossierService.getDossierById(dossier._id).subscribe({
      next: (fullDossier) => {
        this.selectedDossier.set(fullDossier);
        this.loadDossierDocuments(dossier._id);
      },
      error: (err) => {
        console.error('Error loading dossier details:', err);
        this.selectedDossier.set(dossier);
        this.loadDossierDocuments(dossier._id);
      }
    });
  }

  loadDossierDocuments(dossierId: string) {
    this.documentService.getDocuments({ dossierId, limit: 100 }).subscribe({
      next: (response) => {
        this.documentsList = [...response.documents];
        this.dossierDocuments.set(response.documents);
      },
      error: (err) => console.error('Error loading documents:', err)
    });
  }

  closeModal() {
    this.selectedDossier.set(null);
    this.dossierDocuments.set([]);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDocumentTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      contrat: 'description',
      plainte: 'gavel',
      facture: 'receipt',
      pouvoir: 'verified',
      jugement: 'balance',
      correspondance: 'mail',
      decision: 'policy',
      requete: 'article',
      piece_jointe: 'attachment',
      autre: 'insert_drive_file'
    };
    return icons[type] || 'insert_drive_file';
  }

  getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      contrat: 'Contrat',
      plainte: 'Plainte',
      facture: 'Facture',
      pouvoir: 'Pouvoir',
      jugement: 'Jugement',
      correspondance: 'Correspondance',
      decision: 'Décision',
      requete: 'Requête',
      piece_jointe: 'Pièce jointe',
      autre: 'Autre'
    };
    return labels[type] || type;
  }

  downloadDocument(doc: Document) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.nom;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading document:', err)
    });
  }

  viewDocument(doc: Document) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Error viewing document:', err)
    });
  }

  refreshDocuments() {
    const dossier = this.selectedDossier();
    if (dossier) {
      this.loadDossierDocuments(dossier._id);
    }
  }

  getDebugInfo(): string {
    const docs = this.dossierDocuments();
    return `docs.length: ${docs.length}, selectedDossier: ${this.selectedDossier()?._id || 'none'}`;
  }
}