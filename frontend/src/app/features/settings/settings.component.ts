import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in max-w-4xl">
      <div class="mb-6">
        <h1 class="page-title">Paramètres</h1>
        <p class="text-slate-500 text-sm">Configuration de la plateforme</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 mb-6 border-b border-slate-200">
        <button
          (click)="activeTab = 'general'"
          [class.border-lawyer-primary]="activeTab === 'general'"
          [class.text-lawyer-primary]="activeTab === 'general'"
          class="px-4 py-2 border-b-2 border-transparent font-medium text-slate-600 hover:text-lawyer-primary transition-colors"
        >
          Général
        </button>
        <button
          (click)="activeTab = 'types'"
          [class.border-lawyer-primary]="activeTab === 'types'"
          [class.text-lawyer-primary]="activeTab === 'types'"
          class="px-4 py-2 border-b-2 border-transparent font-medium text-slate-600 hover:text-lawyer-primary transition-colors"
        >
          Types d'affaires
        </button>
        <button
          (click)="activeTab = 'users'"
          [class.border-lawyer-primary]="activeTab === 'users'"
          [class.text-lawyer-primary]="activeTab === 'users'"
          class="px-4 py-2 border-b-2 border-transparent font-medium text-slate-600 hover:text-lawyer-primary transition-colors"
        >
          Utilisateurs
        </button>
        <button
          (click)="activeTab = 'ia'"
          [class.border-lawyer-primary]="activeTab === 'ia'"
          [class.text-lawyer-primary]="activeTab === 'ia'"
          class="px-4 py-2 border-b-2 border-transparent font-medium text-slate-600 hover:text-lawyer-primary transition-colors"
        >
          IA & Prédictions
        </button>
      </div>

      @if (activeTab === 'general') {
        <div class="card space-y-6">
          <h3 class="section-title">Informations du Cabinet</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Nom du cabinet</label>
              <input type="text" [value]="'Boussayene Knani Law Firm'" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input type="email" [value]="'contact@bk-lawfirm.tn'" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
              <input type="tel" [value]="'+216 71 123 456'" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
              <input type="text" [value]="'Tunis, Tunisia'" class="input-field">
            </div>
          </div>
          <div class="flex justify-end">
            <button class="btn-primary">Enregistrer</button>
          </div>
        </div>
      }

      @if (activeTab === 'types') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="section-title mb-0">Types d'Affaires</h3>
            <button class="btn-secondary text-sm py-2">Ajouter un type</button>
          </div>
          <div class="space-y-2">
            @for (type of typesAffaires; track type.code) {
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="material-icons text-slate-400">label</span>
                  <span class="font-medium">{{ type.label }}</span>
                  <span class="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{{ type.code }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="badge badge-info">{{ type.dossiers }} dossiers</span>
                  <button class="p-2 hover:bg-slate-200 rounded">
                    <span class="material-icons text-sm">edit</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (activeTab === 'users') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="section-title mb-0">Utilisateurs</h3>
            <button class="btn-primary text-sm py-2">Ajouter un utilisateur</button>
          </div>
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="table-header">Nom</th>
                <th class="table-header">Email</th>
                <th class="table-header">Rôle</th>
                <th class="table-header">Statut</th>
                <th class="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.id) {
                <tr class="table-row-hover">
                  <td class="table-cell font-medium">{{ user.nom }}</td>
                  <td class="table-cell text-slate-600">{{ user.email }}</td>
                  <td class="table-cell"><span class="badge" [ngClass]="getRoleBadgeClass(user.role)">{{ user.role }}</span></td>
                  <td class="table-cell"><span class="badge" [ngClass]="user.active ? 'badge-success' : 'badge-danger'">{{ user.active ? 'Actif' : 'Inactif' }}</span></td>
                  <td class="table-cell text-right">
                    <button class="p-2 hover:bg-slate-100 rounded"><span class="material-icons text-sm">edit</span></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab === 'ia') {
        <div class="card space-y-6">
          <h3 class="section-title">Configuration IA Prédictive</h3>
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p class="font-medium">Classification automatique</p>
              <p class="text-sm text-slate-500">L'IA suggère le type d'affaire selon la description</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lawyer-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p class="font-medium">Confiance minimale</p>
              <p class="text-sm text-slate-500">Seuil de confiance pour accepter les suggestions IA</p>
            </div>
            <select class="select-field w-32">
              <option>50%</option>
              <option selected>70%</option>
              <option>80%</option>
              <option>90%</option>
            </select>
          </div>
          <div class="flex justify-end">
            <button class="btn-primary">Enregistrer</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class SettingsComponent {
  activeTab = 'general';

  typesAffaires = [
    { code: 'CIVIL', label: 'Civil', dossiers: 45 },
    { code: 'PENAL', label: 'Pénal', dossiers: 23 },
    { code: 'COM', label: 'Commercial', dossiers: 31 },
    { code: 'TRAV', label: 'Travail', dossiers: 18 },
    { code: 'FAM', label: 'Famille', dossiers: 27 },
  ];

  users = [
    { id: 1, nom: 'Me. Boussayene', email: 'boussayene@bk-law.tn', role: 'Admin', active: true },
    { id: 2, nom: 'Me. Knani', email: 'knani@bk-law.tn', role: 'Avocat Senior', active: true },
    { id: 3, nom: 'Me. ALA AISSA', email: 'aissa@bk-law.tn', role: 'Avocat Senior', active: true },
    { id: 4, nom: 'Marie Dupont', email: 'marie@bk-law.tn', role: 'Assistant', active: true },
  ];

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'Admin': 'badge-danger',
      'Avocat Senior': 'badge-warning',
      'Avocat Junior': 'badge-info',
      'Assistant': 'badge-success'
    };
    return classes[role] || 'badge-info';
  }
}