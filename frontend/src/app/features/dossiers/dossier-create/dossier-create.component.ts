import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DossierService } from '../../../core/services/dossier.service';
import { ClientService, Client } from '../../../core/services/client.service';
import { TypeAffaire } from '../../../core/models/dossier.model';
import { ClientCreateComponent } from '../../clients/client-create/client-create.component';
import { EventEmitter, Output } from '@angular/core';

interface ClientSearchResult {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-dossier-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClientCreateComponent],
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
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span class="material-icons text-sm">error</span>
            {{ error() }}
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
              @if (searchResults().length > 0 && searchClient.length > 0) {
                <div class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-card max-h-60 overflow-y-auto">
                  @for (client of searchResults(); track client._id) {
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
              @if (searchClient.length > 0 && searchResults().length === 0) {
                <div class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-card">
                  <div class="p-4 text-center">
                    <p class="text-sm text-slate-500 mb-3">Aucun client trouvé</p>
                    <button
                      type="button"
                      (click)="createNewClient()"
                      class="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <span class="material-icons text-sm">person_add</span>
                      Créer un nouveau client
                    </button>
                  </div>
                </div>
              }
            </div>
            @if (selectedClient()) {
              <div class="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span class="material-icons text-green-600 text-sm">check_circle</span>
                <span class="text-sm text-green-700">{{ selectedClient()?.nom }} {{ selectedClient()?.prenom || '' }}</span>
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

          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Description détaillée</label>
            <textarea
              [(ngModel)]="dossier.description"
              name="description"
              rows="4"
              placeholder="Décrivez l'affaire en détail..."
              class="input-field resize-none"
            ></textarea>
          </div>

          <!-- Type d'Affaire -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Type d'affaire *</label>
            <select
              [(ngModel)]="dossier.typeAffaire"
              name="typeAffaire"
              class="select-field modern-select"
              required
              style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 10px 40px 10px 16px; font-size: 14px; font-weight: 500; color: #334155; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 12px center/20px; appearance: none; -webkit-appearance: none; -moz-appearance: none; transition: all 0.2s;"
            >
              <option value="">Sélectionnez un type...</option>
              @for (type of typeAffaires; track type.code) {
                <option [value]="type.code">{{ type.label }}</option>
              }
            </select>
          </div>

          <!-- Sous-type -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sous-type</label>
            <select 
              [(ngModel)]="dossier.sousType" 
              name="sousType" 
              class="select-field modern-select"
              style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 10px 40px 10px 16px; font-size: 14px; font-weight: 500; color: #334155; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 12px center/20px; appearance: none; -webkit-appearance: none; -moz-appearance: none; transition: all 0.2s;"
            >
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
            <label class="block text-sm font-medium text-slate-700 mb-2">Date et heure d'audience</label>
            <div class="flex gap-2 items-center">
              <input
                type="date"
                [(ngModel)]="dossier.dateAudience"
                name="dateAudience"
                class="input-field flex-1"
              >
              <button
                type="button"
                (click)="openTimePicker('debut')"
                class="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                [ngClass]="dossier.heureDebut ? 'bg-lawyer-primary/10 border-lawyer-primary' : 'bg-white'"
              >
                <span class="material-icons text-lawyer-primary text-sm">schedule</span>
                <span class="text-sm text-slate-700">{{ dossier.heureDebut || 'Début' }}</span>
              </button>
              <span class="text-slate-400">-</span>
              <button
                type="button"
                (click)="openTimePicker('fin')"
                class="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                [ngClass]="dossier.heureFin ? 'bg-lawyer-primary/10 border-lawyer-primary' : 'bg-white'"
              >
                <span class="material-icons text-lawyer-primary text-sm">schedule</span>
                <span class="text-sm text-slate-700">{{ dossier.heureFin || 'Fin' }}</span>
              </button>
            </div>
          </div>

          <!-- Time Picker Modal -->
          @if (showTimePicker()) {
            <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" (click)="closeTimePicker()">
              <div class="bg-white rounded-xl shadow-xl w-72 animate-scale-in" (click)="$event.stopPropagation()">
                <div class="bg-lawyer-primary text-white px-4 py-3 rounded-t-xl">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-sm">{{ timePickerType() === 'debut' ? 'Heure de début' : 'Heure de fin' }}</span>
                    <button (click)="closeTimePicker()" class="text-white/80 hover:text-white">
                      <span class="material-icons text-lg">close</span>
                    </button>
                  </div>
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="text-center">
                      <label class="block text-[10px] text-slate-500 mb-1 uppercase">Heure</label>
                      <div class="flex flex-col gap-0.5 max-h-32 overflow-y-auto">
                        @for (h of hours; track h) {
                          <button
                            type="button"
                            (click)="selectedHourValue = h"
                            class="w-12 py-1 text-xs rounded transition-colors"
                            [ngClass]="selectedHourValue === h ? 'bg-lawyer-primary text-white' : 'hover:bg-slate-100 text-slate-700'"
                          >
                            {{ h }}
                          </button>
                        }
                      </div>
                    </div>
                    <span class="text-xl font-bold text-slate-300">:</span>
                    <div class="text-center">
                      <label class="block text-[10px] text-slate-500 mb-1 uppercase">Minute</label>
                      <div class="flex flex-col gap-0.5">
                        @for (m of minutes; track m) {
                          <button
                            type="button"
                            (click)="selectedMinuteValue = m"
                            class="w-12 py-1 text-xs rounded transition-colors"
                            [ngClass]="selectedMinuteValue === m ? 'bg-lawyer-primary text-white' : 'hover:bg-slate-100 text-slate-700'"
                          >
                            {{ m }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" (click)="closeTimePicker()" class="flex-1 px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                      Annuler
                    </button>
                    <button type="button" (click)="confirmTime()" class="flex-1 px-3 py-1.5 text-xs bg-lawyer-primary text-white rounded-lg hover:bg-lawyer-dark">
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Juridiction -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Juridiction</label>
            <input
              type="text"
              [(ngModel)]="dossier.juridiction"
              name="juridiction"
              placeholder="Tribunal de instance..."
              class="input-field"
            >
          </div>

          <!-- Adversaire -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Partie adverse</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                [(ngModel)]="dossier.adversary.nom"
                name="adversaryNom"
                placeholder="Nom de l'adversaire"
                class="input-field"
              >
              <input
                type="text"
                [(ngModel)]="dossier.adversary.avocat"
                name="adversaryAvocat"
                placeholder="Avocat adverse"
                class="input-field"
              >
              <input
                type="email"
                [(ngModel)]="dossier.adversary.email"
                name="adversaryEmail"
                placeholder="Email adverse"
                class="input-field"
              >
            </div>
          </div>
        </div>

        @if (showCreateClientModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-lawyer-dark">Nouveau Client</h3>
                <button type="button" (click)="closeCreateClientModal()" class="text-slate-400 hover:text-slate-600">
                  <span class="material-icons">close</span>
                </button>
              </div>
              <div class="p-6">
                <app-client-create [isModal]="true" (clientCreated)="onClientCreated($event)"></app-client-create>
              </div>
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <a routerLink="/dossiers" class="btn-secondary">Annuler</a>
          <button type="submit" class="btn-primary flex items-center gap-2" [disabled]="!isFormValid() || loading()">
            @if (loading()) {
              <span class="material-icons text-lg animate-spin">refresh</span>
              Création en cours...
            } @else {
              <span class="material-icons text-lg">save</span>
              Créer le dossier
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .material-icons { font-size: 18px; }
  `]
})
export class DossierCreateComponent implements OnInit {
  private dossierService = inject(DossierService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchClient = '';
  selectedClient = signal<Client | null>(null);
  searchResults = signal<Client[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  showCreateClientModal = signal(false);
  @Output() clientCreated = new EventEmitter<Client>();

  showTimePicker = signal(false);
  timePickerType = signal<'debut' | 'fin'>('debut');
  selectedHourValue = '09';
  selectedMinuteValue = '00';

  hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  minutes = ['00', '15', '30', '45'];

  dossier = {
    titre: '',
    description: '',
    typeAffaire: '' as TypeAffaire | '',
    sousType: '',
    priorite: 3,
    dateAudience: '',
    heureDebut: '',
    heureFin: '',
    juridiction: '',
    adversary: {
      nom: '',
      avocat: '',
      email: ''
    }
  };

  typeAffaires: {code: TypeAffaire; label: string}[] = [
    { code: 'civil', label: 'Civil' },
    { code: 'penal', label: 'Pénal' },
    { code: 'commercial', label: 'Commercial' },
    { code: 'travail', label: 'Travail' },
    { code: 'famille', label: 'Famille' },
    { code: 'administratif', label: 'Administratif' },
    { code: 'immobilier', label: 'Immobilier' },
    { code: 'bancaire', label: 'Bancaire' },
    { code: 'autre', label: 'Autre' }
  ];

  priorities = [
    { value: 1, label: 'Haute', icon: 'arrow_upward', iconClass: 'text-red-500', bgClass: 'bg-red-50 hover:border-red-200' },
    { value: 2, label: 'Moyenne-Haute', icon: 'arrow_upward', iconClass: 'text-orange-500', bgClass: 'bg-orange-50 hover:border-orange-200' },
    { value: 3, label: 'Moyenne', icon: 'remove', iconClass: 'text-amber-500', bgClass: 'bg-amber-50 hover:border-amber-200' },
    { value: 4, label: 'Moyenne-Basse', icon: 'arrow_downward', iconClass: 'text-lime-500', bgClass: 'bg-lime-50 hover:border-lime-200' },
    { value: 5, label: 'Basse', icon: 'arrow_downward', iconClass: 'text-green-500', bgClass: 'bg-green-50 hover:border-green-200' }
  ];

  ngOnInit() {
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) {
      this.clientService.getClientById(clientId).subscribe({
        next: (client) => {
          this.selectedClient.set(client);
        },
        error: (err) => console.error('Error loading client:', err)
      });
    }
  }

  onClientSearch() {
    if (this.searchClient.length > 2) {
      this.clientService.getClients({ search: this.searchClient, limit: 10 }).subscribe({
        next: (response) => this.searchResults.set(response.clients),
        error: (err) => console.error('Error searching clients:', err)
      });
    } else {
      this.searchResults.set([]);
    }
  }

  selectClient(client: Client) {
    this.selectedClient.set(client);
    this.searchClient = '';
    this.searchResults.set([]);
  }

  clearClient() {
    this.selectedClient.set(null);
    this.searchClient = '';
  }

  createNewClient() {
    this.showCreateClientModal.set(true);
  }

  closeCreateClientModal() {
    this.showCreateClientModal.set(false);
  }

  onClientCreated(client: Client) {
    this.selectClient(client);
    this.showCreateClientModal.set(false);
  }

  isFormValid(): boolean {
    const validTypes = ['civil', 'penal', 'commercial', 'travail', 'famille', 'administratif', 'immobilier', 'bancaire', 'autre'];
    return !!(
      this.selectedClient() &&
      this.dossier.titre &&
      this.dossier.typeAffaire &&
      validTypes.includes(this.dossier.typeAffaire)
    );
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.error.set(null);

    const dossierData: any = {
      titre: this.dossier.titre,
      description: this.dossier.description,
      typeAffaire: this.dossier.typeAffaire,
      sousType: this.dossier.sousType,
      priorite: this.dossier.priorite,
      juridiction: this.dossier.juridiction,
      adversary: this.dossier.adversary,
      clientId: this.selectedClient()?._id,
      dateAudience: this.dossier.dateAudience ? this.formatDateWithTime(this.dossier.dateAudience, this.dossier.heureDebut, this.dossier.heureFin) : undefined
    };

    this.dossierService.createDossier(dossierData).subscribe({
      next: (created) => {
        this.loading.set(false);
        this.router.navigate(['/dossiers', created._id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de la création du dossier');
      }
    });
  }

  formatDateWithTime(date: string, heureDebut: string, heureFin: string): string {
    const dateObj = new Date(date);
    let dateTime: Date;
    
    if (heureDebut) {
      const [hours, minutes] = heureDebut.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    dateTime = new Date(dateObj);
    return dateTime.toISOString();
  }

  openTimePicker(type: 'debut' | 'fin') {
    this.timePickerType.set(type);
    if (type === 'debut' && this.dossier.heureDebut) {
      const [h, m] = this.dossier.heureDebut.split(':');
      this.selectedHourValue = h;
      this.selectedMinuteValue = m;
    } else if (type === 'fin' && this.dossier.heureFin) {
      const [h, m] = this.dossier.heureFin.split(':');
      this.selectedHourValue = h;
      this.selectedMinuteValue = m;
    } else {
      this.selectedHourValue = '09';
      this.selectedMinuteValue = '00';
    }
    this.showTimePicker.set(true);
  }

  closeTimePicker() {
    this.showTimePicker.set(false);
  }

  confirmTime() {
    const time = `${this.selectedHourValue}:${this.selectedMinuteValue}`;
    if (this.timePickerType() === 'debut') {
      this.dossier.heureDebut = time;
      if (!this.dossier.heureFin) {
        const hour = parseInt(this.selectedHourValue) + 1;
        this.dossier.heureFin = `${hour.toString().padStart(2, '0')}:${this.selectedMinuteValue}`;
      }
    } else {
      this.dossier.heureFin = time;
    }
    this.closeTimePicker();
  }
}