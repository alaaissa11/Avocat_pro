import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-16 bg-navy-900 border-b border-navy-700 flex items-center justify-between px-6 shadow-deep">
      <div class="flex items-center gap-4 flex-1 max-w-xl">
        <div class="relative w-full">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Rechercher un dossier, client..."
            class="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-lawyer-accent focus:border-lawyer-accent
                   text-sm text-white placeholder-navy-400 transition-all duration-200"
          >
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="relative p-2.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-xl transition-all border border-transparent hover:border-navy-600">
          <span class="material-icons text-lg">notifications</span>
          <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-lawyer-danger rounded-full border-2 border-navy-900"></span>
        </button>

        <button class="p-2.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-xl transition-all border border-transparent hover:border-navy-600">
          <span class="material-icons text-lg">help_outline</span>
        </button>

        <div class="relative">
          <button (click)="toggleMenu()" class="flex items-center gap-3 pl-4 border-l border-navy-600 hover:bg-navy-800 rounded-xl transition-all">
            <div class="text-right">
              <p class="text-sm font-semibold text-white">{{ userName() }}</p>
              <p class="text-xs text-lawyer-accent font-medium">{{ userRole() }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-lawyer-primary via-lawyer-secondary to-lawyer-tertiary flex items-center justify-center cursor-pointer border border-navy-500 shadow-professional">
              <span class="text-lawyer-accent text-sm font-bold">{{ userInitials() }}</span>
            </div>
          </button>

          @if (showMenu()) {
            <div class="absolute right-0 top-full mt-2 w-56 bg-navy-800 rounded-xl shadow-deep border border-navy-600 py-2 z-50">
              <a routerLink="/settings" class="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-200 hover:bg-navy-700 hover:text-white transition-colors">
                <span class="material-icons text-lg">settings</span>
                Paramètres
              </a>
              <hr class="my-2 border-navy-700">
              <button (click)="logout()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 w-full transition-colors">
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