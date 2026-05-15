import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Gestion des Clients</h1>
          <p class="text-slate-500 text-sm">Gérez votre portefeuille clients</p>
        </div>
        <a routerLink="/clients/create" class="btn-primary flex items-center gap-2 inline-flex">
          <span class="material-icons text-lg">person_add</span>
          Nouveau Client
        </a>
      </div>

      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              class="input-field"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            >
          </div>
          <select class="select-field" [(ngModel)]="filterType" (change)="loadClients()">
            <option value="">Tous les types</option>
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="text-center py-12">
          <span class="material-icons text-4xl text-slate-300 animate-spin">refresh</span>
          <p class="text-slate-500 mt-2">Chargement des clients...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (client of clients(); track client._id) {
            <div class="card hover:shadow-hover cursor-pointer transition-shadow">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-lawyer-primary to-lawyer-secondary flex items-center justify-center text-white font-medium">
                  {{ getInitials(client) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-lawyer-dark truncate">
                    {{ client.raisonSociale || (client.nom + ' ' + (client.prenom || '')) }}
                  </h3>
                  <p class="text-sm text-slate-500">{{ client.email }}</p>
                  <p class="text-sm text-slate-400 mt-1">{{ client.telephone }}</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="badge" [ngClass]="client.type === 'entreprise' ? 'badge-info' : 'badge-success'">
                  {{ client.type === 'entreprise' ? 'Entreprise' : 'Particulier' }}
                </span>
                <div class="flex gap-2">
                  <a [routerLink]="['/dossiers/create']" [queryParams]="{clientId: client._id}" 
                     class="text-lawyer-primary text-sm hover:underline flex items-center gap-1">
                    <span class="material-icons text-sm">add</span>
                    Nouveau dossier
                  </a>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-12">
              <span class="material-icons text-4xl text-slate-300 block mb-2">person_off</span>
              <p class="text-slate-500">Aucun client trouvé</p>
            </div>
          }
        </div>
      }

      @if (clients().length > 0) {
        <div class="flex items-center justify-between mt-6">
          <p class="text-sm text-slate-500">
            {{ clients().length }} client(s) trouvé(s)
          </p>
        </div>
      }
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class ClientsListComponent implements OnInit {
  private clientService = inject(ClientService);

  clients = signal<Client[]>([]);
  loading = signal(true);
  
  searchQuery = '';
  filterType = '';
  private searchTimeout: any;

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    this.clientService.getClients({
      search: this.searchQuery || undefined,
      type: this.filterType || undefined,
      limit: 100
    }).subscribe({
      next: (response) => {
        this.clients.set(response.clients);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadClients();
    }, 300);
  }

  getInitials(client: Client): string {
    if (client.raisonSociale) {
      return client.raisonSociale.substring(0, 2).toUpperCase();
    }
    const nom = client.nom ? client.nom.charAt(0).toUpperCase() : '';
    const prenom = client.prenom ? client.prenom.charAt(0).toUpperCase() : '';
    return nom + prenom || client.nom?.charAt(0).toUpperCase() || 'C';
  }
}