import { Component, OnInit, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TacheService, Tache } from '../../../core/services/tache.service';
import { DocumentService, Document } from '../../../core/services/document.service';
import { UserService, User } from '../../../core/services/user.service';
import { DossierService } from '../../../core/services/dossier.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-taches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Tâches</h1>
          <p class="text-slate-500 text-sm">Gestion des tâches et collaboration</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-lg">add</span>
          Nouvelle tâche
        </button>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              [(ngModel)]="filters.search"
              (ngModelChange)="loadTaches()"
              class="input-field"
            >
          </div>
          <select [(ngModel)]="filters.statut" (ngModelChange)="loadTaches()" class="select-field">
            <option value="">Tous les statuts</option>
            <option value="a_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
          <select [(ngModel)]="filters.assigneeTo" (ngModelChange)="loadTaches()" class="select-field">
            <option value="">Tous les utilisateurs</option>
            <option value="my">Mes tâches</option>
                  @for (user of users(); track user._id) {
              <option [value]="user._id">{{ user.nom }} {{ user.prenom }}</option>
            }
          </select>
          <select [(ngModel)]="filters.priorite" (ngModelChange)="loadTaches()" class="select-field">
            <option value="">Toutes les priorités</option>
            <option value="5">Priorité 5 (Haute)</option>
            <option value="4">Priorité 4</option>
            <option value="3">Priorité 3 (Normale)</option>
            <option value="2">Priorité 2</option>
            <option value="1">Priorité 1 (Basse)</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <span class="material-icons text-slate-600">assignment</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-lawyer-dark">{{ totalTaches() }}</p>
              <p class="text-sm text-slate-500">Total tâches</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span class="material-icons text-blue-600">schedule</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-blue-600">{{ aFaireCount() }}</p>
              <p class="text-sm text-slate-500">À faire</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <span class="material-icons text-amber-600">autorenew</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-600">{{ enCoursCount() }}</p>
              <p class="text-sm text-slate-500">En cours</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span class="material-icons text-green-600">check_circle</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ termineesCount() }}</p>
              <p class="text-sm text-slate-500">Terminées</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="table-header">Titre</th>
                <th class="table-header">Assigné à</th>
                <th class="table-header">Dossier</th>
                <th class="table-header">Priorité</th>
                <th class="table-header">Échéance</th>
                <th class="table-header">Statut</th>
                <th class="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tache of taches(); track tache._id) {
                <tr class="table-row-hover">
                  <td class="table-cell">
                    <div>
                      <p class="font-medium text-lawyer-dark">{{ tache.titre }}</p>
                      @if (tache.description) {
                        <p class="text-xs text-slate-500 truncate max-w-xs">{{ tache.description }}</p>
                      }
                    </div>
                  </td>
                  <td class="table-cell">
                    @if (tache.assigneeA) {
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-lawyer-primary flex items-center justify-center">
                          <span class="text-white text-xs">{{ getInitials(tache.assigneeA.nom, tache.assigneeA.prenom) }}</span>
                        </div>
                        <span class="text-sm">{{ tache.assigneeA.nom }} {{ tache.assigneeA.prenom }}</span>
                      </div>
                    } @else {
                      <span class="text-slate-400 text-sm">Non assigné</span>
                    }
                  </td>
                  <td class="table-cell">
                    @if (tache.dossierId) {
                      <a [routerLink]="['/dossiers', tache.dossierId._id]" class="text-lawyer-primary hover:underline text-sm">
                        {{ tache.dossierId.numero }}
                      </a>
                    } @else {
                      <span class="text-slate-400 text-sm">-</span>
                    }
                  </td>
                  <td class="table-cell">
                    <span class="badge" [ngClass]="getPrioriteBadgeClass(tache.priorite)">
                      {{ tache.priorite }}
                    </span>
                  </td>
                  <td class="table-cell">
                    @if (tache.dateEcheance) {
                      <span class="text-sm" [class]="isOverdue(tache.dateEcheance, tache.statut) ? 'text-red-600 font-medium' : ''">
                        {{ formatDate(tache.dateEcheance) }}
                      </span>
                    } @else {
                      <span class="text-slate-400 text-sm">-</span>
                    }
                  </td>
                  <td class="table-cell">
                    <span class="badge" [ngClass]="getStatutBadgeClass(tache.statut)">
                      {{ getStatutLabel(tache.statut) }}
                    </span>
                  </td>
                   <td class="table-cell text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="openTaskDetail(tache)" class="p-2 hover:bg-lawyer-primary/10 rounded" title="Voir détails">
                        <span class="material-icons text-lawyer-primary text-sm">visibility</span>
                      </button>
                      @if (tache.statut !== 'terminee' && tache.statut !== 'annulee') {
                        <button (click)="markAsComplete(tache)" class="p-2 hover:bg-green-100 rounded" title="Marquer comme terminée">
                          <span class="material-icons text-green-600 text-sm">check</span>
                        </button>
                        <button (click)="startTask(tache)" class="p-2 hover:bg-blue-100 rounded" title="Démarrer">
                          <span class="material-icons text-blue-600 text-sm">play_arrow</span>
                        </button>
                      }
                      <button (click)="editTache(tache)" class="p-2 hover:bg-slate-100 rounded" title="Modifier">
                        <span class="material-icons text-slate-600 text-sm">edit</span>
                      </button>
                      <button (click)="deleteTache(tache)" class="p-2 hover:bg-red-100 rounded" title="Supprimer">
                        <span class="material-icons text-red-600 text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="table-cell text-center py-8 text-slate-500">
                    Aucune tâche trouvée
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Task Detail Modal -->
    @if (showTaskDetail()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
           style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px);"
           (click)="closeTaskDetail()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up"
             (click)="$event.stopPropagation()">
          <div class="bg-gradient-to-br from-lawyer-primary via-lawyer-primary to-lawyer-dark px-6 py-4 rounded-t-2xl text-white flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ taskDetail()?.titre }}</h3>
            <button (click)="closeTaskDetail()" class="text-white/80 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 80px);">
            <!-- Task Info -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-xs text-slate-500 mb-1">Statut</p>
                <span class="badge text-xs" [ngClass]="getStatutBadgeClass(taskDetail()?.statut || '')">
                  {{ getStatutLabel(taskDetail()?.statut || '') }}
                </span>
              </div>
              @if (taskDetail()?.assigneeA) {
                <div>
                  <p class="text-xs text-slate-500 mb-1">Assigné à</p>
                  <p class="text-sm font-medium">{{ taskDetail()?.assigneeA?.prenom }} {{ taskDetail()?.assigneeA?.nom }}</p>
                </div>
              }
              @if (taskDetail()?.dossierId) {
                <div>
                  <p class="text-xs text-slate-500 mb-1">Dossier</p>
                  <p class="text-sm font-medium">{{ taskDetail()?.dossierId?.numero }} - {{ taskDetail()?.dossierId?.titre }}</p>
                </div>
              }
              @if (taskDetail()?.dateEcheance) {
                <div>
                  <p class="text-xs text-slate-500 mb-1">Échéance</p>
                  <p class="text-sm font-medium">{{ taskDetail()?.dateEcheance ? formatDate(taskDetail()!.dateEcheance!) : '' }}</p>
                </div>
              }
              @if (taskDetail()?.description) {
                <div class="col-span-2">
                  <p class="text-xs text-slate-500 mb-1">Description</p>
                  <p class="text-sm">{{ taskDetail()?.description }}</p>
                </div>
              }
            </div>

            <!-- Feedback from collaborateur -->
            <div class="mb-6">
              <h4 class="text-sm font-semibold text-lawyer-dark flex items-center gap-2 mb-3">
                <span class="material-icons text-lawyer-primary text-base">feedback</span>
                Feedback du collaborateur
              </h4>
              @if (taskDetail()?.feedback) {
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p class="text-sm whitespace-pre-wrap">{{ taskDetail()?.feedback }}</p>
                </div>
              } @else {
                <p class="text-sm text-slate-400 italic">Aucun feedback pour le moment</p>
              }
            </div>

            <!-- Dossier Documents -->
            @if (taskDetail()?.dossierId) {
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-lawyer-dark flex items-center gap-2 mb-3">
                  <span class="material-icons text-lawyer-primary text-base">folder</span>
                  Documents du dossier
                </h4>
                @if (dossierDocuments().length > 0) {
                  <div class="space-y-2">
                    @for (doc of dossierDocuments(); track doc._id) {
                      <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-lawyer-primary/30 transition-colors">
                        <div class="flex items-center gap-3 min-w-0">
                          <span class="material-icons text-slate-400 text-lg">description</span>
                          <div class="min-w-0">
                            <p class="text-sm font-medium truncate">{{ doc.nom }}</p>
                            <p class="text-xs text-slate-500">{{ doc.taille ? (doc.taille / 1024).toFixed(1) + ' KB' : '' }}</p>
                          </div>
                        </div>
                        <button (click)="downloadDoc(doc._id, doc.nom)" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-lawyer-primary transition-colors" title="Télécharger">
                          <span class="material-icons text-lg">download</span>
                        </button>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-sm text-slate-400 italic">Aucun document dans ce dossier</p>
                }
              </div>
            }

            <!-- Task Documents -->
            <div class="mb-6">
              <h4 class="text-sm font-semibold text-lawyer-dark flex items-center gap-2 mb-3">
                <span class="material-icons text-lawyer-primary text-base">attach_file</span>
                Documents de la tâche
              </h4>
              @if (taskDocuments().length > 0) {
                <div class="space-y-2">
                  @for (doc of taskDocuments(); track doc._id) {
                    <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-lawyer-primary/30 transition-colors">
                      <div class="flex items-center gap-3 min-w-0">
                        <span class="material-icons text-slate-400 text-lg">description</span>
                        <div class="min-w-0">
                          <p class="text-sm font-medium truncate">{{ doc.nom }}</p>
                          <p class="text-xs text-slate-500">{{ doc.taille ? (doc.taille / 1024).toFixed(1) + ' KB' : '' }}</p>
                        </div>
                      </div>
                      <button (click)="downloadDoc(doc._id, doc.nom)" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-lawyer-primary transition-colors" title="Télécharger">
                        <span class="material-icons text-lg">download</span>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm text-slate-400 italic">Aucun document joint à cette tâche</p>
              }
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-2xl">
            <button (click)="closeTaskDetail()" class="btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    }

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
           style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px);"
           (click)="closeModal()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden animate-slide-up"
             (click)="$event.stopPropagation()">

          <!-- HEADER -->
          <div class="relative bg-gradient-to-br from-lawyer-primary via-lawyer-primary to-lawyer-dark px-8 py-6 text-white overflow-hidden">
            <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5"></div>
            <div class="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-white/5"></div>
            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span class="material-icons text-2xl">{{ editingTache() ? 'edit_note' : 'add_task' }}</span>
                </div>
                <div>
                  <p class="text-blue-100 text-xs uppercase tracking-widest font-medium">
                    {{ editingTache() ? 'Modification' : 'Création' }}
                  </p>
                  <h2 class="text-2xl font-bold font-serif">
                    {{ editingTache() ? 'Modifier la tâche' : 'Nouvelle tâche' }}
                  </h2>
                </div>
              </div>
              <button (click)="closeModal()"
                      class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                      title="Fermer">
                <span class="material-icons text-2xl">close</span>
              </button>
            </div>

            <!-- Progress indicator -->
            <div class="relative mt-5 flex items-center gap-2 text-xs">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                <span class="material-icons text-sm">{{ form.titre ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span>Informations</span>
              </div>
              <div class="flex-1 h-px bg-white/20"></div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full"
                   [ngClass]="'bg-white/15 backdrop-blur-sm'">
                <span class="material-icons text-sm">folder</span>
                <span>Assignation</span>
              </div>
              <div class="flex-1 h-px bg-white/20"></div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                <span class="material-icons text-sm">event</span>
                <span>Planification</span>
              </div>
            </div>
          </div>

          <!-- BODY -->
          <div class="p-8 overflow-y-auto max-h-[calc(92vh-260px)] space-y-7">

            <!-- Section: Informations principales -->
            <section>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                  <span class="material-icons text-lawyer-primary text-lg">title</span>
                </div>
                <h3 class="text-base font-semibold text-lawyer-dark">Informations principales</h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="form-label">
                    Titre de la tâche <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">edit</span>
                    <input
                      type="text"
                      [(ngModel)]="form.titre"
                      class="input-field pl-11"
                      placeholder="Ex : Préparer le dossier de plaidoirie">
                  </div>
                </div>

                <div>
                  <label class="form-label">Description détaillée</label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-3 text-slate-400 text-xl pointer-events-none">description</span>
                    <textarea
                      [(ngModel)]="form.description"
                      class="input-field pl-11 pt-2.5"
                      rows="3"
                      placeholder="Décrivez les actions à réaliser, les pièces attendues, les points de vigilance..."></textarea>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section: Assignation & Priorité -->
            <section>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                  <span class="material-icons text-lawyer-primary text-lg">person</span>
                </div>
                <h3 class="text-base font-semibold text-lawyer-dark">Assignation & Priorité</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Assigné à -->
                <div>
                  <label class="form-label">Assigné à</label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none z-10">person_outline</span>
                    <select [(ngModel)]="form.assigneeA" class="select-field pl-11">
                      <option value="">— Non assigné —</option>
                      @for (user of users(); track user._id) {
                        <option [value]="user._id">
                          {{ user.prenom }} {{ user.nom }} · {{ getRoleLabel(user.role) }}
                        </option>
                      }
                    </select>
                  </div>
                  @if (form.assigneeA) {
                    <div class="mt-2 flex items-center gap-2 text-xs text-slate-600">
                      <div class="w-6 h-6 rounded-full bg-lawyer-primary flex items-center justify-center">
                        <span class="text-white text-[10px] font-semibold">
                          {{ getSelectedUserInitials() }}
                        </span>
                      </div>
                      <span>Le collaborateur sera notifié</span>
                    </div>
                  }
                </div>

                <!-- Priorité (segmented buttons) -->
                <div>
                  <label class="form-label">Priorité</label>
                  <div class="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    @for (p of priorityLevels; track p.value) {
                      <button type="button"
                              (click)="form.priorite = p.value"
                              [ngClass]="form.priorite === p.value
                                ? 'ring-2 ring-lawyer-primary bg-white shadow-sm'
                                : 'text-slate-500 hover:bg-white/60'"
                              class="flex flex-col items-center justify-center py-2 rounded-lg transition-all"
                              [title]="p.label">
                        <span class="material-icons text-lg" [style.color]="p.color">flag</span>
                        <span class="text-[10px] font-semibold mt-0.5" [style.color]="form.priorite === p.value ? p.color : '#64748b'">
                          P{{ p.value }}
                        </span>
                      </button>
                    }
                  </div>
                  <p class="mt-2 text-xs text-slate-500">
                    {{ getCurrentPriorityLabel() }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Section: Dossier & Statut -->
            <section>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                  <span class="material-icons text-lawyer-primary text-lg">folder</span>
                </div>
                <h3 class="text-base font-semibold text-lawyer-dark">Dossier & Statut</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Custom searchable dossier dropdown -->
                <div>
                  <label class="form-label">Dossier lié</label>
                  <div class="relative" #dossierDropdownRef>
                    <button type="button"
                            (click)="toggleDossierDropdown()"
                            class="input-field pl-11 pr-10 text-left w-full flex items-center justify-between cursor-pointer">
                      <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">folder_open</span>
                      <span class="truncate" [class.text-slate-400]="!form.dossierId">
                        {{ getSelectedDossierLabel() }}
                      </span>
                      <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform"
                            [class.rotate-180]="dossierDropdownOpen()">
                        expand_more
                      </span>
                    </button>

                    @if (dossierDropdownOpen()) {
                      <div class="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                        <!-- Search -->
                        <div class="p-3 border-b border-slate-100 bg-slate-50">
                          <div class="relative">
                            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
                            <input type="text"
                                   [ngModel]="dossierSearchTerm()"
                                   (ngModelChange)="dossierSearchTerm.set($event)"
                                   (click)="$event.stopPropagation()"
                                   placeholder="Rechercher un dossier (numéro, titre...)"
                                   class="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lawyer-primary/30 focus:border-lawyer-primary">
                          </div>
                        </div>

                        <!-- Options list -->
                        <div class="max-h-64 overflow-y-auto">
                          <button type="button"
                                  (click)="selectDossier('')"
                                  class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-500 italic">
                            <span class="material-icons text-base">remove_circle_outline</span>
                            Aucun dossier
                          </button>
                          @for (dossier of filteredDossiers(); track dossier._id) {
                            <button type="button"
                                    (click)="selectDossier(dossier._id)"
                                    [ngClass]="form.dossierId === dossier._id
                                      ? 'bg-lawyer-primary/5 border-l-2 border-lawyer-primary'
                                      : ''"
                                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-l-2 border-transparent transition-colors flex items-start gap-3">
                              <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span class="material-icons text-lawyer-primary text-base">folder</span>
                              </div>
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                  <span class="font-semibold text-lawyer-dark">{{ dossier.numero }}</span>
                                  <span class="badge text-[10px]" [ngClass]="getDossierStatutBadge(dossier.statut)">
                                    {{ getDossierStatutLabel(dossier.statut) }}
                                  </span>
                                </div>
                                <p class="text-xs text-slate-500 truncate">{{ dossier.titre }}</p>
                              </div>
                              @if (form.dossierId === dossier._id) {
                                <span class="material-icons text-lawyer-primary text-lg flex-shrink-0">check_circle</span>
                              }
                            </button>
                          } @empty {
                            <div class="px-4 py-8 text-center text-sm text-slate-400">
                              <span class="material-icons text-3xl block mb-1 text-slate-300">search_off</span>
                              Aucun dossier trouvé
                            </div>
                          }
                        </div>

                        <!-- Footer count -->
                        <div class="px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
                          <span>{{ filteredDossiers().length }} dossier(s)</span>
                          <button type="button" (click)="dossierDropdownOpen.set(false)" class="text-lawyer-primary hover:underline">Fermer</button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Statut -->
                <div>
                  <label class="form-label">Statut</label>
                  <div class="grid grid-cols-2 gap-2">
                    @for (s of statutOptions; track s.value) {
                      <button type="button"
                              (click)="form.statut = s.value"
                              [class.ring-2]="form.statut === s.value"
                              [class.ring-offset-1]="form.statut === s.value"
                              [ngClass]="form.statut === s.value ? s.activeClass : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'">
                        <div class="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all">
                          <span class="material-icons text-lg" [ngClass]="form.statut === s.value ? s.iconColor : 'text-slate-400'">
                            {{ s.icon }}
                          </span>
                          <span class="text-sm font-medium">{{ s.label }}</span>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              </div>
            </section>

            <!-- Section: Planification -->
            <section>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                  <span class="material-icons text-lawyer-primary text-lg">event</span>
                </div>
                <h3 class="text-base font-semibold text-lawyer-dark">Planification</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Date d'échéance</label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">calendar_today</span>
                    <input type="date" [(ngModel)]="form.dateEcheance" class="input-field pl-11">
                  </div>
                  @if (form.dateEcheance) {
                    <p class="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                      <span class="material-icons text-sm">schedule</span>
                      {{ getRelativeDate(form.dateEcheance) }}
                    </p>
                  }
                </div>

                <div>
                  <label class="form-label">Charge estimée (heures)</label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">timer</span>
                    <input type="number" min="0" step="0.5" [(ngModel)]="form.chargeEstimee" class="input-field pl-11" placeholder="Ex : 4">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">h</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Summary card -->
            @if (form.titre || form.dossierId) {
              <div class="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-lawyer-primary text-lg">preview</span>
                  <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Aperçu</p>
                </div>
                <p class="font-semibold text-lawyer-dark">{{ form.titre || 'Titre de la tâche' }}</p>
                <div class="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                  @if (form.dossierId) {
                    <span class="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200">
                      <span class="material-icons text-sm text-lawyer-primary">folder</span>
                      {{ getSelectedDossierNumero() }}
                    </span>
                  }
                  @if (form.assigneeA) {
                    <span class="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200">
                      <span class="material-icons text-sm text-lawyer-primary">person</span>
                      {{ getSelectedUserName() }}
                    </span>
                  }
                  @if (form.dateEcheance) {
                    <span class="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200">
                      <span class="material-icons text-sm text-lawyer-primary">event</span>
                      {{ formatDate(form.dateEcheance) }}
                    </span>
                  }
                  <span class="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200">
                    <span class="material-icons text-sm" [style.color]="getCurrentPriorityColor()">flag</span>
                    {{ getCurrentPriorityLabel() }}
                  </span>
                </div>
              </div>
            }
          </div>

          <!-- FOOTER -->
          <div class="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <p class="text-xs text-slate-500 hidden md:block">
              <span class="material-icons text-sm align-middle">info</span>
              Les champs marqués <span class="text-red-500">*</span> sont obligatoires
            </p>
            <div class="flex items-center gap-3 ml-auto">
              <button (click)="closeModal()" class="btn-secondary">
                Annuler
              </button>
              <button (click)="saveTache()" class="btn-primary flex items-center gap-2">
                <span class="material-icons text-lg">{{ editingTache() ? 'save' : 'add_task' }}</span>
                {{ editingTache() ? 'Mettre à jour' : 'Créer la tâche' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .material-icons { font-size: 20px; }

    .form-label {
      @apply block text-sm font-semibold text-slate-700 mb-1.5;
    }

    textarea.input-field {
      border-width: 2px !important;
      border-radius: 12px !important;
      padding: 10px 16px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #334155 !important;
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      transition: all 0.2s ease !important;
      box-shadow: none !important;
      resize: vertical;
    }
    textarea.input-field:focus {
      outline: none !important;
      border-color: #4f46e5 !important;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
    }

    .input-field.pl-11, .select-field.pl-11 {
      padding-left: 44px !important;
    }

    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class TachesListComponent implements OnInit {
  @ViewChild('dossierDropdownRef') dossierDropdownRef?: ElementRef<HTMLElement>;

  taches = signal<Tache[]>([]);
  users = signal<User[]>([]);
  dossiers = signal<any[]>([]);
  showModal = signal(false);
  editingTache = signal<Tache | null>(null);

  // Custom dossier dropdown
  dossierDropdownOpen = signal(false);
  dossierSearchTerm = signal('');

  filteredDossiers = computed(() => {
    const term = this.dossierSearchTerm().toLowerCase().trim();
    const list = this.dossiers();
    if (!term) return list;
    return list.filter(d =>
      (d.numero || '').toLowerCase().includes(term) ||
      (d.titre || '').toLowerCase().includes(term)
    );
  });

  priorityLevels = [
    { value: 1, label: 'Basse',  color: '#10b981' },
    { value: 2, label: 'Faible', color: '#84cc16' },
    { value: 3, label: 'Normale', color: '#f59e0b' },
    { value: 4, label: 'Élevée', color: '#f97316' },
    { value: 5, label: 'Haute',  color: '#ef4444' },
  ];

  statutOptions = [
    { value: 'a_faire',  label: 'À faire',   icon: 'radio_button_unchecked', iconColor: 'text-amber-500',  activeClass: 'bg-amber-50 border-amber-300 text-amber-700 ring-amber-300' },
    { value: 'en_cours', label: 'En cours',  icon: 'autorenew',              iconColor: 'text-blue-500',   activeClass: 'bg-blue-50 border-blue-300 text-blue-700 ring-blue-300' },
    { value: 'terminee', label: 'Terminée',  icon: 'check_circle',           iconColor: 'text-green-500',  activeClass: 'bg-green-50 border-green-300 text-green-700 ring-green-300' },
    { value: 'annulee',  label: 'Annulée',   icon: 'cancel',                 iconColor: 'text-red-500',    activeClass: 'bg-red-50 border-red-300 text-red-700 ring-red-300' },
  ];

  filters = {
    search: '',
    statut: '',
    assigneeTo: '',
    priorite: ''
  };

  form = {
    titre: '',
    description: '',
    assigneeA: '',
    priorite: 3,
    dossierId: '',
    statut: 'a_faire',
    dateEcheance: '',
    chargeEstimee: 0
  };

  showTaskDetail = signal(false);
  taskDetail = signal<Tache | null>(null);
  dossierDocuments = signal<Document[]>([]);
  taskDocuments = signal<Document[]>([]);

  constructor(
    private tacheService: TacheService,
    private documentService: DocumentService,
    private userService: UserService,
    private dossierService: DossierService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTaches();
    this.loadUsers();
    this.loadDossiers();
  }

  // Close dossier dropdown on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.dossierDropdownOpen()) return;
    const el = this.dossierDropdownRef?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.dossierDropdownOpen.set(false);
    }
  }

  // Close on ESC
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.dossierDropdownOpen()) {
      this.dossierDropdownOpen.set(false);
    } else if (this.showModal()) {
      this.closeModal();
    }
  }

  // ---- Custom dossier dropdown ----
  toggleDossierDropdown() {
    this.dossierDropdownOpen.update(v => !v);
    if (this.dossierDropdownOpen()) {
      this.dossierSearchTerm.set('');
    }
  }

  selectDossier(id: string) {
    this.form.dossierId = id;
    this.dossierDropdownOpen.set(false);
  }

  getSelectedDossierLabel(): string {
    if (!this.form.dossierId) return '— Sélectionner un dossier —';
    const d = this.dossiers().find(x => x._id === this.form.dossierId);
    return d ? `${d.numero} — ${d.titre}` : '— Sélectionner un dossier —';
  }

  getSelectedDossierNumero(): string {
    if (!this.form.dossierId) return '';
    const d = this.dossiers().find(x => x._id === this.form.dossierId);
    return d ? d.numero : '';
  }

  getDossierStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_cours': 'En cours',
      'ouvert': 'Ouvert',
      'ferme': 'Fermé',
      'suspendu': 'Suspendu',
      'cloture': 'Clôturé',
    };
    return labels[statut] || statut;
  }

  getDossierStatutBadge(statut: string): string {
    const classes: Record<string, string> = {
      'en_cours': 'badge-info',
      'ouvert': 'badge-success',
      'ferme': 'badge-warning',
      'suspendu': 'badge-warning',
      'cloture': 'badge-danger',
    };
    return classes[statut] || 'badge-info';
  }

  // ---- User helpers ----
  getSelectedUserName(): string {
    if (!this.form.assigneeA) return '';
    const u = this.users().find(x => x._id === this.form.assigneeA);
    return u ? `${u.prenom} ${u.nom}` : '';
  }

  getSelectedUserInitials(): string {
    if (!this.form.assigneeA) return '';
    const u = this.users().find(x => x._id === this.form.assigneeA);
    return u ? this.getInitials(u.nom, u.prenom) : '';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'avocat': 'Avocat',
      'collaborateur': 'Collaborateur',
      'assistant': 'Assistant',
      'stagiaire': 'Stagiaire',
      'admin': 'Administrateur',
    };
    return labels[role] || role;
  }

  // ---- Priority helpers ----
  getCurrentPriorityLabel(): string {
    const p = this.priorityLevels.find(x => x.value === this.form.priorite);
    return p ? `Priorité ${p.label}` : '';
  }

  getCurrentPriorityColor(): string {
    const p = this.priorityLevels.find(x => x.value === this.form.priorite);
    return p ? p.color : '#64748b';
  }

  getRelativeDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    if (diff === -1) return 'Hier — en retard';
    if (diff > 0) return `Dans ${diff} jour(s)`;
    return `En retard de ${Math.abs(diff)} jour(s)`;
  }

  loadTaches() {
    const params: any = {};
    if (this.filters.statut) params.statut = this.filters.statut;
    if (this.filters.assigneeTo) params.assigneeTo = this.filters.assigneeTo;
    if (this.filters.priorite) params.priorite = this.filters.priorite;

    this.tacheService.getTaches(params).subscribe({
      next: (res) => this.taches.set(res.taches),
      error: (err) => console.error('Error loading taches:', err)
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadDossiers() {
    this.dossierService.getDossiers({ limit: 100 }).subscribe({
      next: (res) => this.dossiers.set(res.dossiers),
      error: (err) => console.error('Error loading dossiers:', err)
    });
  }

  totalTaches() { return this.taches().length; }
  aFaireCount() { return this.taches().filter(t => t.statut === 'a_faire').length; }
  enCoursCount() { return this.taches().filter(t => t.statut === 'en_cours').length; }
  termineesCount() { return this.taches().filter(t => t.statut === 'terminee').length; }

  getInitials(nom: string, prenom: string): string {
    return ((nom?.[0] || '') + (prenom?.[0] || '')).toUpperCase();
  }

  getPrioriteBadgeClass(priorite: number): string {
    if (priorite >= 5) return 'badge-danger';
    if (priorite >= 4) return 'badge-warning';
    if (priorite >= 3) return 'badge-info';
    return 'badge-success';
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      'a_faire': 'badge-warning',
      'en_cours': 'badge-info',
      'terminee': 'badge-success',
      'annulee': 'badge-danger'
    };
    return classes[statut] || 'badge-info';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'a_faire': 'À faire',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  isOverdue(dateEcheance: Date | string, statut: string): boolean {
    if (statut === 'terminee' || statut === 'annulee') return false;
    return new Date(dateEcheance) < new Date();
  }

  openTaskDetail(tache: Tache) {
    this.taskDetail.set(tache);
    this.showTaskDetail.set(true);
    this.loadDossierDocuments(tache);
    this.loadTaskDocuments(tache);
  }

  closeTaskDetail() {
    this.showTaskDetail.set(false);
    this.taskDetail.set(null);
    this.dossierDocuments.set([]);
    this.taskDocuments.set([]);
  }

  loadDossierDocuments(tache: Tache) {
    const dossierId = typeof tache.dossierId === 'object' ? tache.dossierId?._id : tache.dossierId;
    if (!dossierId) {
      this.dossierDocuments.set([]);
      return;
    }
    this.documentService.getDocuments({ dossierId, limit: 50 }).subscribe({
      next: (res) => this.dossierDocuments.set(res.documents),
      error: () => this.dossierDocuments.set([])
    });
  }

  loadTaskDocuments(tache: Tache) {
    this.documentService.getDocuments({ tacheId: tache._id, limit: 50 }).subscribe({
      next: (res) => this.taskDocuments.set(res.documents),
      error: () => this.taskDocuments.set([])
    });
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

  openCreateModal() {
    this.editingTache.set(null);
    this.form = {
      titre: '',
      description: '',
      assigneeA: '',
      priorite: 3,
      dossierId: '',
      statut: 'a_faire',
      dateEcheance: '',
      chargeEstimee: 0
    };
    this.dossierDropdownOpen.set(false);
    this.showModal.set(true);
  }

  editTache(tache: Tache) {
    this.editingTache.set(tache);
    this.form = {
      titre: tache.titre,
      description: tache.description || '',
      assigneeA: tache.assigneeA?._id || '',
      priorite: tache.priorite,
      dossierId: tache.dossierId?._id || '',
      statut: tache.statut,
      dateEcheance: tache.dateEcheance ? new Date(tache.dateEcheance).toISOString().split('T')[0] : '',
      chargeEstimee: tache.chargeEstimee || 0
    };
    this.dossierDropdownOpen.set(false);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.dossierDropdownOpen.set(false);
    this.editingTache.set(null);
  }

  saveTache() {
    if (!this.form.titre.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    const tacheData: Partial<Tache> = {
      titre: this.form.titre,
      description: this.form.description,
      priorite: this.form.priorite,
      statut: this.form.statut as any,
      chargeEstimee: this.form.chargeEstimee
    };

    if (this.form.assigneeA) tacheData.assigneeA = this.form.assigneeA as any;
    if (this.form.dossierId) tacheData.dossierId = this.form.dossierId as any;
    if (this.form.dateEcheance) tacheData.dateEcheance = new Date(this.form.dateEcheance);

    if (this.editingTache()) {
      this.tacheService.updateTache(this.editingTache()!._id, tacheData).subscribe({
        next: () => {
          this.loadTaches();
          this.closeModal();
        },
        error: (err) => console.error('Error updating tache:', err)
      });
    } else {
      this.tacheService.createTache(tacheData).subscribe({
        next: () => {
          this.loadTaches();
          this.closeModal();
        },
        error: (err) => console.error('Error creating tache:', err)
      });
    }
  }

  startTask(tache: Tache) {
    this.tacheService.updateTache(tache._id, { statut: 'en_cours' }).subscribe({
      next: () => this.loadTaches(),
      error: (err) => console.error('Error starting tache:', err)
    });
  }

  markAsComplete(tache: Tache) {
    this.tacheService.terminateTache(tache._id, tache.chargeConsommee).subscribe({
      next: () => this.loadTaches(),
      error: (err) => console.error('Error completing tache:', err)
    });
  }

  deleteTache(tache: Tache) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${tache.titre}" ?`)) {
      this.tacheService.deleteTache(tache._id).subscribe({
        next: () => this.loadTaches(),
        error: (err) => console.error('Error deleting tache:', err)
      });
    }
  }
}
