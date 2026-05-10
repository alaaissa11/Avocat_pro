import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-professional z-50">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-lawyer-primary to-lawyer-secondary rounded-lg flex items-center justify-center">
            <span class="text-white font-serif font-bold text-lg">A</span>
          </div>
          <div>
            <h1 class="font-serif font-bold text-lawyer-primary text-lg">AVOCAT</h1>
            <span class="text-lawyer-accent text-xs font-medium tracking-wider">PRO</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-link">
          <span class="material-icons text-lg">dashboard</span>
          <span>Dashboard</span>
        </a>

        <a routerLink="/dossiers" routerLinkActive="active" class="sidebar-link">
          <span class="material-icons text-lg">folder</span>
          <span>Dossiers</span>
        </a>

        <a routerLink="/clients" routerLinkActive="active" class="sidebar-link">
          <span class="material-icons text-lg">people</span>
          <span>Clients</span>
        </a>

        <a routerLink="/calendar" routerLinkActive="active" class="sidebar-link">
          <span class="material-icons text-lg">calendar_today</span>
          <span>Calendrier</span>
        </a>

        <a routerLink="/documents" routerLinkActive="active" class="sidebar-link">
          <span class="material-icons text-lg">description</span>
          <span>Documents</span>
        </a>

        <div class="pt-4 mt-4 border-t border-slate-100">
          <a routerLink="/settings" routerLinkActive="active" class="sidebar-link">
            <span class="material-icons text-lg">settings</span>
            <span>Paramètres</span>
          </a>
        </div>
      </nav>

      <!-- Cabinet Info -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
        <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div class="w-10 h-10 rounded-full bg-lawyer-primary flex items-center justify-center">
            <span class="text-white text-sm font-medium">BK</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-lawyer-dark truncate">Boussayene Knani</p>
            <p class="text-xs text-slate-500">Law Firm</p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .material-icons {
      font-size: 20px;
    }
  `]
})
export class SidebarComponent {}