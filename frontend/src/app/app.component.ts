import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      @if (showLayout()) {
        <app-sidebar />
        <div class="flex-1 flex flex-col overflow-hidden ml-64">
          <app-header />
          <main class="flex-1 overflow-y-auto p-6 bg-slate-50">
            <router-outlet />
          </main>
        </div>
      } @else {
        <router-outlet />
      }
    </div>
  `
})
export class AppComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  showLayout(): boolean {
    return this.router.url !== '/login' && this.authService.isAuthenticated();
  }
}