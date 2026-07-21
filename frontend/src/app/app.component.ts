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
    @if (showLayout()) {
      <div class="flex h-screen bg-lawyer-dark">
        @if (mobileOpen()) {
          <div class="fixed inset-0 bg-black/40 z-30 md:hidden" (click)="layoutService.closeMobileSidebar()"></div>
        }
        <app-sidebar />
        <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ml-0"
             [ngClass]="{'md:ml-64': !sidebarCollapsed(), 'md:ml-16': sidebarCollapsed()}">
          <app-header />
          <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-lawyer-light">
            <router-outlet />
          </main>
        </div>
      </div>
    } @else {
      <router-outlet />
    }
  `
})
export class AppComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);

  sidebarCollapsed = this.layoutService.sidebarCollapsed;
  mobileOpen = this.layoutService.mobileSidebarOpen;

  showLayout(): boolean {
    return this.router.url !== '/' && this.router.url !== '/login' && this.authService.isAuthenticated();
  }
}