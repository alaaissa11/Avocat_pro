import { Component, signal, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in" [class.max-w-2xl]="!isModal" [class.mx-auto]="!isModal">
      @if (!isModal) {
        <div class="mb-6">
          <a routerLink="/clients" class="flex items-center gap-2 text-slate-500 hover:text-lawyer-primary mb-4 transition-colors">
            <span class="material-icons text-sm">arrow_back</span>
            Retour à la liste
          </a>
          <h1 class="page-title mb-2">Nouveau Client</h1>
          <p class="text-slate-500 text-sm">Ajoutez un nouveau client à votre portefeuille</p>
        </div>
      }
      @if (isModal) {
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-lawyer-dark">Nouveau Client</h3>
          <p class="text-sm text-slate-500">Remplissez les informations du nouveau client</p>
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="card">
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span class="material-icons text-sm">error</span>
            {{ error() }}
          </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Type de client *</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="particulier" [(ngModel)]="client.type" class="text-lawyer-primary">
                <span class="material-icons text-sm">person</span>
                Particulier
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="entreprise" [(ngModel)]="client.type" class="text-lawyer-primary">
                <span class="material-icons text-sm">business</span>
                Entreprise
              </label>
            </div>
          </div>

          @if (client.type === 'particulier') {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
              <input
                type="text"
                [(ngModel)]="client.nom"
                name="nom"
                placeholder="Nom de famille"
                class="input-field"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
              <input
                type="text"
                [(ngModel)]="client.prenom"
                name="prenom"
                placeholder="Prénom"
                class="input-field"
              >
            </div>
          } @else {
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">Raison sociale *</label>
              <input
                type="text"
                [(ngModel)]="client.raisonSociale"
                name="raisonSociale"
                placeholder="Nom de l'entreprise"
                class="input-field"
                required
              >
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Email *</label>
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">email</span>
            <input
              type="email"
              [(ngModel)]="client.email"
              name="email"
              placeholder="email@example.com"
              class="input-field pl-10"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Téléphone *</label>
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">phone</span>
            <input
              type="tel"
              [(ngModel)]="client.telephone"
              name="telephone"
              placeholder="+216 XX XXX XXX"
              class="input-field pl-10"
              required
            >
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
            <input
              type="text"
              [(ngModel)]="client.adresse"
              name="adresse"
              placeholder="Adresse complète"
              class="input-field"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Ville</label>
            <input
              type="text"
              [(ngModel)]="client.ville"
              name="ville"
              placeholder="Ville"
              class="input-field"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Code postal</label>
            <input
              type="text"
              [(ngModel)]="client.codePostal"
              name="codePostal"
              placeholder="Code postal"
              class="input-field"
            >
          </div>

          @if (client.type === 'particulier') {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">CIN</label>
              <input
                type="text"
                [(ngModel)]="client.cin"
                name="cin"
                placeholder="Numéro CIN"
                class="input-field"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Profession</label>
              <input
                type="text"
                [(ngModel)]="client.profession"
                name="profession"
                placeholder="Profession"
                class="input-field"
              >
            </div>
          } @else {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Matricule fiscal</label>
              <input
                type="text"
                [(ngModel)]="client.matriculeFiscal"
                name="matriculeFiscal"
                placeholder="Matricule fiscal"
                class="input-field"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Responsable</label>
              <input
                type="text"
                [(ngModel)]="client.prenom"
                name="responsable"
                placeholder="Nom du responsable"
                class="input-field"
              >
            </div>
          }

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">Observations</label>
            <textarea
              [(ngModel)]="client.observations"
              name="observations"
              rows="3"
              placeholder="Notes supplémentaires..."
              class="input-field resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <a routerLink="/clients" class="btn-secondary">Annuler</a>
          <button type="submit" class="btn-primary flex items-center gap-2" [disabled]="!isFormValid() || loading()">
            @if (loading()) {
              <span class="material-icons text-lg animate-spin">refresh</span>
              Création en cours...
            } @else {
              <span class="material-icons text-lg">person_add</span>
              Créer le client
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
export class ClientCreateComponent {
  private clientService = inject(ClientService);
  private router = inject(Router);

  @Output() clientCreated = new EventEmitter<Client>();
  @Input() isModal = false;

  loading = signal(false);
  error = signal<string | null>(null);

  client = {
    nom: '',
    prenom: '',
    raisonSociale: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'Tunisie',
    cin: '',
    matriculeFiscal: '',
    type: 'particulier' as 'particulier' | 'entreprise',
    profession: '',
    observations: ''
  };

  isFormValid(): boolean {
    const hasRequired = this.client.email && this.client.telephone;
    const hasTypeInfo = this.client.type === 'particulier' 
      ? this.client.nom 
      : this.client.raisonSociale;
    return !!(hasRequired && hasTypeInfo);
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.error.set(null);

    const clientData: Partial<Client> = {
      nom: this.client.type === 'particulier' ? this.client.nom : undefined,
      prenom: this.client.type === 'particulier' ? this.client.prenom : this.client.prenom,
      raisonSociale: this.client.type === 'entreprise' ? this.client.raisonSociale : undefined,
      email: this.client.email,
      telephone: this.client.telephone,
      adresse: this.client.adresse,
      ville: this.client.ville,
      codePostal: this.client.codePostal,
      pays: this.client.pays,
      cin: this.client.type === 'particulier' ? this.client.cin : undefined,
      matriculeFiscal: this.client.type === 'entreprise' ? this.client.matriculeFiscal : undefined,
      type: this.client.type,
      profession: this.client.type === 'particulier' ? this.client.profession : undefined,
      observations: this.client.observations
    };

    this.clientService.createClient(clientData).subscribe({
      next: (created) => {
        this.loading.set(false);
        this.clientCreated.emit(created);
        if (!this.isModal) {
          this.router.navigate(['/clients', created._id]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de la création du client');
      }
    });
  }
}