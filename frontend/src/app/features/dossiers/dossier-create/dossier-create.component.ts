import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dossier-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <!-- Header -->
      <div class="mb-6">
        <a routerLink="/dossiers" class="flex items-center gap-2 text-slate-500 hover:text-lawyer-primary mb-4 transition-colors">
          <span class="material-icons text-sm">arrow_back</span>
          Retour à la liste
        </a>
        <h1 class="page-title mb-2">Nouveau Dossier</h1>
        <p class="text-slate-500 text-sm">Créez un nouveau dossier juridique avec assistance IA</p>
      </div>

      <!-- Form Card -->
      <form (ngSubmit)="onSubmit()" class="card">
        <!-- AI Suggestion Banner -->
        @if (aiSuggestion()) {
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6 animate-slide-up">
            <div class="flex items-start gap-3">
              <span class="material-icons text-amber-600 mt-0.5">auto_awesome</span>
              <div class="flex-1">
                <p class="text-sm font-medium text-amber-800">Suggestion IA basée sur votre description</p>
                <p class="text-sm text-amber-700 mt-1">
                  Type suggéré: <strong>{{ aiSuggestion()!.type }}</strong>
                  <span class="mx-2">•</span>
                  Confiance: <strong>{{ aiSuggestion()!.confidence }}%</strong>
                </p>
                <button
                  type="button"
                  (click)="applyAiSuggestion()"
                  class="mt-2 text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <span class="material-icons text-sm">check</span>
                  Appliquer cette suggestion
                </button>
              </div>
              <button
                type="button"
                (click)="clearAiSuggestion()"
                class="text-amber-400 hover:text-amber-600"
              >
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
          </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Client Selection with Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Client *</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person_search</span>
              <input
                type="text"
                [(ngModel)]="searchClient"
                name="clientSearch"
                (input)="onClientSearch()"
                placeholder="Rechercher un client..."
                class="input-field pl-10"
              >
              @if (searchResults().length > 0) {
                <div class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-card max-h-48 overflow-y-auto">
                  @for (client of searchResults(); track client.id) {
                    <button
                      type="button"
                      (click)="selectClient(client)"
                      class="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <span class="material-icons text-slate-400">person</span>
                      <div>
                        <p class="font-medium text-slate-800">{{ client.nom }} {{ client.prenom }}</p>
                        <p class="text-xs text-slate-500">{{ client.email }}</p>
                      </div>
                    </button>
                  }
                </div>
              }
            </div>
            @if (selectedClient()) {
              <div class="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span class="material-icons text-green-600 text-sm">check_circle</span>
                <span class="text-sm text-green-700">{{ selectedClient()!.nom }} {{ selectedClient()!.prenom }}</span>
                <button type="button" (click)="clearClient()" class="ml-auto text-green-600 hover:text-green-700">
                  <span class="material-icons text-sm">close</span>
                </button>
              </div>
            }
          </div>

          <!-- Titre Dossier -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Titre du dossier *</label>
            <input
              type="text"
              [(ngModel)]="dossier.titre"
              name="titre"
              placeholder="Description concise de l'affaire..."
              class="input-field"
              required
            >
          </div>

          <!-- Description (Trigger AI) -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Description détaillée</label>
            <textarea
              [(ngModel)]="dossier.description"
              name="description"
              (blur)="onDescriptionBlur()"
              rows="4"
              placeholder="Décrivez l'affaire en détail pour permettre à l'IA de suggérer la catégorie..."
              class="input-field resize-none"
            ></textarea>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span class="material-icons text-xs">auto_awesome</span>
              L'IA analysera votre description pour suggérer le type d'affaire
            </p>
          </div>

          <!-- Type d'Affaire (AI Predictive) -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Type d'affaire *</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">category</span>
              <input
                type="text"
                [(ngModel)]="dossier.typeAffaire"
                name="typeAffaire"
                (input)="onTypeSearch()"
                placeholder="Tapez pour rechercher..."
                class="input-field pl-10"
              >
              @if (showTypeSuggestions()) {
                <div class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-card max-h-48 overflow-y-auto">
                  @for (type of typeSuggestions(); track type.code) {
                    <button
                      type="button"
                      (click)="selectType(type)"
                      class="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <span class="material-icons text-lawyer-accent text-sm">label</span>
                      <div class="flex-1">
                        <p class="font-medium text-slate-800">{{ type.label }}</p>
                        <p class="text-xs text-slate-500">{{ type.code }}</p>
                      </div>
                      @if (type.ia) {
                        <span class="badge badge-info text-xs">
                          <span class="material-icons text-xs mr-1">auto_awesome</span>
                          IA
                        </span>
                      }
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Sous-type -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sous-type</label>
            <select [(ngModel)]="dossier.sousType" name="sousType" class="select-field">
              <option value="">Sélectionnez...</option>
              <option value="contentieux">Contentieux</option>
              <option value="consultation">Consultation</option>
              <option value="negociation">Négociation</option>
              <option value="arbitrage">Arbitrage</option>
            </select>
          </div>

          <!-- Priorité -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Priorité</label>
            <div class="flex gap-3">
              @for (priority of priorities; track priority.value) {
                <button
                  type="button"
                  (click)="dossier.priorite = priority.value"
                  [class.border-lawyer-accent]="dossier.priorite === priority.value"
                  [class.border-transparent]="dossier.priorite !== priority.value"
                  class="flex-1 py-3 border-2 rounded-lg transition-all text-center"
                  [ngClass]="priority.bgClass"
                >
                  <span class="material-icons text-lg" [ngClass]="priority.iconClass">{{ priority.icon }}</span>
                  <p class="text-xs mt-1" [class.text-white]="dossier.priorite === priority.value">{{ priority.label }}</p>
                </button>
              }
            </div>
          </div>

          <!-- Date Audience -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Date d'audience</label>
            <input
              type="date"
              [(ngModel)]="dossier.dateAudience"
              name="dateAudience"
              class="input-field"
            >
          </div>

          <!-- Notes -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Notes internes</label>
            <textarea
              [(ngModel)]="dossier.notes"
              name="notes"
              rows="3"
              placeholder="Notes privées pour l'équipe..."
              class="input-field resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <a routerLink="/dossiers" class="btn-secondary">Annuler</a>
          <button type="submit" class="btn-primary flex items-center gap-2" [disabled]="!isFormValid()">
            <span class="material-icons text-lg">save</span>
            Créer le dossier
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .material-icons { font-size: 18px; }
  `]
})
export class DossierCreateComponent {
  searchClient = '';
  selectedClient = signal<{id: number; nom: string; prenom: string; email: string} | null>(null);
  searchResults = signal<{id: number; nom: string; prenom: string; email: string}[]>([]);
  aiSuggestion = signal<{type: string; confidence: number} | null>(null);

  showTypeSuggestions = signal(false);
  typeSuggestions = signal<{code: string; label: string; ia?: boolean}[]>([]);

  dossier = {
    titre: '',
    description: '',
    typeAffaire: '',
    sousType: '',
    priorite: 3,
    dateAudience: '',
    notes: ''
  };

  priorities = [
    { value: 1, label: 'Haute', icon: 'arrow_upward', iconClass: 'text-red-500', bgClass: 'bg-red-50 hover:border-red-200' },
    { value: 3, label: 'Moyenne', icon: 'remove', iconClass: 'text-amber-500', bgClass: 'bg-amber-50 hover:border-amber-200' },
    { value: 5, label: 'Basse', icon: 'arrow_downward', iconClass: 'text-green-500', bgClass: 'bg-green-50 hover:border-green-200' }
  ];

  constructor(private router: Router) {}

  onClientSearch() {
    // Simuler recherche client
    if (this.searchClient.length > 2) {
      this.searchResults.set([
        { id: 1, nom: 'Smith', prenom: 'John', email: 'john.smith@email.com' },
        { id: 2, nom: 'Benali', prenom: 'Fatima', email: 'fatima.benali@email.com' }
      ]);
    } else {
      this.searchResults.set([]);
    }
  }

  selectClient(client: {id: number; nom: string; prenom: string; email: string}) {
    this.selectedClient.set(client);
    this.searchClient = '';
    this.searchResults.set([]);
  }

  clearClient() {
    this.selectedClient.set(null);
    this.searchClient = '';
  }

  onDescriptionBlur() {
    // Simulation IA - appeler backend réel ici
    if (this.dossier.description.length > 20) {
      setTimeout(() => {
        this.aiSuggestion.set({
          type: 'Civil - Responsabilité Médicale',
          confidence: 87
        });
      }, 500);
    }
  }

  applyAiSuggestion() {
    if (this.aiSuggestion()) {
      this.dossier.typeAffaire = this.aiSuggestion()!.type;
      this.clearAiSuggestion();
    }
  }

  clearAiSuggestion() {
    this.aiSuggestion.set(null);
  }

  onTypeSearch() {
    const query = this.dossier.typeAffaire.toLowerCase();
    const types = [
      { code: 'CIVIL', label: 'Civil', ia: false },
      { code: 'CIV-RESP', label: 'Civil - Responsabilité Médicale', ia: true },
      { code: 'CIV-IMMO', label: 'Civil - Immobilier', ia: true },
      { code: 'PENAL', label: 'Pénal', ia: false },
      { code: 'PEN-VOL', label: 'Pénal - Vol', ia: true },
      { code: 'COM', label: 'Commercial', ia: false },
      { code: 'TRAV', label: 'Travail', ia: false },
      { code: 'FAM', label: 'Famille', ia: false }
    ];

    this.typeSuggestions.set(
      types.filter(t => t.label.toLowerCase().includes(query))
    );
    this.showTypeSuggestions.set(true);
  }

  selectType(type: {code: string; label: string}) {
    this.dossier.typeAffaire = type.label;
    this.showTypeSuggestions.set(false);
  }

  isFormValid(): boolean {
    return !!(
      this.selectedClient() &&
      this.dossier.titre &&
      this.dossier.typeAffaire
    );
  }

  onSubmit() {
    console.log('Création dossier:', {
      ...this.dossier,
      clientId: this.selectedClient()?.id
    });
    this.router.navigate(['/dossiers']);
  }
}