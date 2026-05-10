import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <a routerLink="/clients" class="flex items-center gap-2 text-slate-500 hover:text-lawyer-primary mb-4">
        <span class="material-icons text-sm">arrow_back</span>
        Retour aux clients
      </a>
      <h1 class="page-title">Fiche Client</h1>
      <p class="text-slate-500">Détail du client</p>
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class ClientDetailComponent {}