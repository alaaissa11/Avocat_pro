import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { AuthService } from './core/services/auth.service';
import { LayoutService } from './core/services/layout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-lawyer-dark">
      @if (showLayout()) {
        <app-sidebar />
        <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
             [class.ml-64]="!sidebarCollapsed()"
             [class.ml-16]="sidebarCollapsed()">
          <app-header />
          <main class="flex-1 overflow-y-auto p-6 bg-lawyer-light">
            <router-outlet />
          </main>
        </div>
      } @else {
        <div class="w-full min-h-screen flex justify-center items-center bg-lawyer-light">
          <router-outlet />
        </div>
      }
    </div>
  `
})
export class AppComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);

  sidebarCollapsed = this.layoutService.sidebarCollapsed;

  showLayout(): boolean {
    return this.router.url !== '/login' && this.authService.isAuthenticated();
  }
}