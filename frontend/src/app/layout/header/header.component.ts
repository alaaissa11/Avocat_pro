import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div class="flex items-center gap-4 flex-1 max-w-xl">
        <div class="relative w-full">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Rechercher un dossier, client..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-lawyer-primary focus:border-transparent
                   text-sm transition-all duration-200"
          >
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button class="relative p-2 text-slate-600 hover:text-lawyer-primary hover:bg-slate-100 rounded-lg transition-all">
          <span class="material-icons text-lg">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-lawyer-danger rounded-full"></span>
        </button>

        <button class="p-2 text-slate-600 hover:text-lawyer-primary hover:bg-slate-100 rounded-lg transition-all">
          <span class="material-icons text-lg">help_outline</span>
        </button>

        <div class="relative">
          <button (click)="toggleMenu()" class="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-lg transition-all">
            <div class="text-right">
              <p class="text-sm font-medium text-lawyer-dark">{{ userName() }}</p>
              <p class="text-xs text-slate-500">{{ userRole() }}</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-lawyer-primary to-lawyer-secondary flex items-center justify-center cursor-pointer hover:shadow-professional transition-all">
              <span class="text-white text-sm font-medium">{{ userInitials() }}</span>
            </div>
          </button>

          @if (showMenu()) {
            <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              <a routerLink="/settings" class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                <span class="material-icons text-lg">settings</span>
                Paramètres
              </a>
              <hr class="my-2 border-slate-200">
              <button (click)="logout()" class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <span class="material-icons text-lg">logout</span>
                Déconnexion
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .material-icons {
      font-size: 20px;
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  showMenu = signal(false);

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }

  userName = computed(() => {
    const user = this.currentUser();
    return user ? `Me. ${user.prenom} ${user.nom}` : 'Me. ALA AISSA';
  });

  userRole = computed(() => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrateur',
      'avocat': 'Avocat',
      'assistant': 'Assistant',
      'secretaire': 'Secrétaire'
    };
    const user = this.currentUser();
    return user ? roleMap[user.role] || user.role : 'Avocat Senior';
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    if (user) {
      return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
    }
    return 'AA';
  });
}