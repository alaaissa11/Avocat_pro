import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Gestion des Clients</h1>
          <p class="text-slate-500 text-sm">Gérez votre portefeuille clients</p>
        </div>
        <button class="btn-primary flex items-center gap-2">
          <span class="material-icons text-lg">person_add</span>
          Nouveau Client
        </button>
      </div>

      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <input type="text" placeholder="Rechercher un client..." class="input-field">
          </div>
          <select class="select-field">
            <option value="">Tous les types</option>
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (client of clients(); track client.id) {
          <div class="card hover:shadow-hover cursor-pointer">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-lawyer-primary to-lawyer-secondary flex items-center justify-center text-white font-medium">
                {{ client.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-lawyer-dark truncate">{{ client.nom }}</h3>
                <p class="text-sm text-slate-500">{{ client.email }}</p>
                <p class="text-sm text-slate-400 mt-1">{{ client.telephone }}</p>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="badge" [ngClass]="client.type === 'entreprise' ? 'badge-info' : 'badge-success'">
                {{ client.type }}
              </span>
              <span class="text-xs text-slate-400">{{ client.dossiers }} dossiers</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class ClientsListComponent {
  clients = signal([
    { id: 1, nom: 'John Smith', email: 'john@email.com', telephone: '+216 55 123 456', type: 'particulier', dossiers: 3, initials: 'JS' },
    { id: 2, nom: 'SAS ABC', email: 'contact@abc.com', telephone: '+216 70 123 456', type: 'entreprise', dossiers: 5, initials: 'AB' },
    { id: 3, nom: 'Fatima Benali', email: 'fatima@email.com', telephone: '+216 55 789 012', type: 'particulier', dossiers: 2, initials: 'FB' },
    { id: 4, nom: 'Ahmed Trabelsi', email: 'ahmed@email.com', telephone: '+216 50 456 789', type: 'particulier', dossiers: 1, initials: 'AT' },
  ]);
}