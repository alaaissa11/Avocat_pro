import { Component, computed, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';
import { InvitationService } from '../../core/services/invitation.service';
import { LayoutService } from '../../core/services/layout.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-16 bg-lawyer-dark border-b border-lawyer-primary/30 flex items-center justify-between px-6 shadow-card">
      <div class="flex items-center gap-4 flex-1 max-w-xl">
        <button (click)="layoutService.toggleSidebar()"
                class="p-2 text-slate-400 hover:text-white hover:bg-lawyer-primary/40 rounded-xl transition-all border border-transparent hover:border-slate-600/30"
                title="Afficher/Masquer le menu">
          <span class="material-icons text-lg">menu</span>
        </button>
        <div class="relative w-full">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Rechercher un dossier, client..."
            class="w-full pl-10 pr-4 py-2.5 bg-lawyer-primary/40 border border-slate-600/30 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-lawyer-accent focus:border-lawyer-accent
                   text-sm text-white placeholder-slate-400 transition-all duration-200"
          >
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <button (click)="toggleNotifications()" class="relative p-2.5 text-slate-400 hover:text-white hover:bg-lawyer-primary/40 rounded-xl transition-all border border-transparent hover:border-slate-600/30">
            <span class="material-icons text-lg">notifications</span>
            @if (unreadCount() > 0) {
              <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-lawyer-danger text-white text-[10px] font-bold rounded-full px-1 border-2 border-lawyer-dark">{{ unreadCount() > 99 ? '99+' : unreadCount() }}</span>
            }
          </button>

          @if (showNotifications()) {
            <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card border border-slate-200 z-50 max-h-96 flex flex-col">
              <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 class="text-sm font-semibold text-slate-800">Notifications</h3>
                @if (unreadCount() > 0) {
                  <button (click)="markAllAsLu()" class="text-xs text-lawyer-accent hover:underline">Tout marquer comme lu</button>
                }
              </div>
              <div class="overflow-y-auto flex-1">
                @if (notifications().length === 0) {
                  <div class="px-4 py-8 text-center text-slate-400 text-sm">Aucune notification</div>
                }
                @for (notif of notifications(); track notif._id) {
                   <div class="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 cursor-pointer"
                        [ngClass]="{'bg-lawyer-accent/5': !notif.lu}"
                        (click)="markOneAsLu(notif)">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           [class.bg-blue-100]="notif.type === 'message'"
                           [class.bg-amber-100]="notif.type === 'operation'"
                           [class.bg-purple-100]="notif.type === 'system'">
                        <span class="material-icons text-sm"
                              [class.text-blue-600]="notif.type === 'message'"
                              [class.text-amber-600]="notif.type === 'operation'"
                              [class.text-purple-600]="notif.type === 'system'">
                          @if (notif.type === 'message') { chat }
                          @else if (notif.type === 'operation') { history }
                          @else { circle_notifications }
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-slate-800 truncate">{{ notif.title }}</p>
                        <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                        <p class="text-[10px] text-slate-400 mt-1">{{ notif.createdAt | date:'dd/MM HH:mm' }}</p>
                        @if (notif.referenceType === 'invitation') {
                          @if (resolvedInvitations()[notif._id]) {
                            <div class="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
                              <span class="material-icons text-sm">check_circle</span>
                              Invitation {{ resolvedInvitations()[notif._id] === 'acceptee' ? 'acceptée' : 'refusée' }}
                            </div>
                          } @else {
                            <div class="flex gap-2 mt-2" (click)="$event.stopPropagation()">
                              <button (click)="acceptInvitation(notif)" class="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium hover:bg-emerald-200 transition-colors">Accepter</button>
                              <button (click)="rejectInvitation(notif)" class="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium hover:bg-red-200 transition-colors">Refuser</button>
                            </div>
                          }
                        }
                      </div>
                      @if (!notif.lu) {
                        <span class="w-2 h-2 rounded-full bg-lawyer-danger flex-shrink-0 mt-1.5"></span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <button class="p-2.5 text-slate-400 hover:text-white hover:bg-lawyer-primary/40 rounded-xl transition-all border border-transparent hover:border-slate-600/30">
          <span class="material-icons text-lg">help_outline</span>
        </button>

        <div class="relative">
          <button (click)="toggleMenu()" class="flex items-center gap-3 pl-4 border-l border-slate-600/30 hover:bg-lawyer-primary/40 rounded-xl transition-all">
            <div class="text-right">
              <p class="text-sm font-semibold text-white">{{ userName() }}</p>
              <p class="text-xs text-lawyer-accent font-medium">{{ userRole() }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-lawyer-primary via-lawyer-secondary to-lawyer-dark flex items-center justify-center cursor-pointer border border-lawyer-accent/30 shadow-professional">
              <span class="text-lawyer-accent text-sm font-bold">{{ userInitials() }}</span>
            </div>
          </button>

          @if (showMenu()) {
            <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-card border border-slate-200 py-2 z-50">
              <a routerLink="/settings" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <span class="material-icons text-lg text-slate-500">settings</span>
                Paramètres
              </a>
              <hr class="my-2 border-slate-100">
              <button (click)="logout()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                <span class="material-icons text-lg text-red-500">logout</span>
                Déconnexion
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private invitationService = inject(InvitationService);
  protected layoutService = inject(LayoutService);
  currentUser = this.authService.currentUser;
  showMenu = signal(false);
  showNotifications = signal(false);
  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal(0);
  resolvedInvitations = signal<Record<string, 'acceptee' | 'refusee'>>({});
  private pollSub?: Subscription;

  ngOnInit() {
    this.loadNotifications();
    this.pollSub = interval(15000).subscribe(() => this.loadNotifications());
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  toggleMenu() { this.showMenu.update(v => !v); }
  toggleNotifications() { this.showNotifications.update(v => !v); if (!this.showNotifications()) this.loadNotifications(); }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: res => { this.notifications.set(res.notifications); this.unreadCount.set(res.unread); },
      error: () => {}
    });
  }

  markOneAsLu(notif: NotificationItem) {
    if (notif.lu) return;
    this.notificationService.markAsLu(notif._id).subscribe({
      next: res => {
        this.notifications.update(list => list.map(n => n._id === notif._id ? { ...n, lu: true } : n));
        this.unreadCount.set(res.unread);
      }
    });
  }

  markAllAsLu() {
    this.notificationService.markAllAsLu().subscribe({
      next: res => {
        this.notifications.update(list => list.map(n => ({ ...n, lu: true })));
        this.unreadCount.set(res.unread);
      }
    });
  }

  acceptInvitation(notif: NotificationItem) {
    if (!notif.referenceId) return;
    this.resolvedInvitations.update(m => ({ ...m, [notif._id]: 'acceptee' }));
    this.invitationService.accept(notif.referenceId).subscribe({
      next: () => {
        this.notificationService.markAsLu(notif._id).subscribe({
          next: res => this.unreadCount.set(res.unread)
        });
      },
      error: () => {
        this.notificationService.markAsLu(notif._id).subscribe({
          next: res => this.unreadCount.set(res.unread)
        });
      }
    });
  }

  rejectInvitation(notif: NotificationItem) {
    if (!notif.referenceId) return;
    this.resolvedInvitations.update(m => ({ ...m, [notif._id]: 'refusee' }));
    this.invitationService.reject(notif.referenceId).subscribe({
      next: () => {
        this.notificationService.markAsLu(notif._id).subscribe({
          next: res => this.unreadCount.set(res.unread)
        });
      },
      error: () => {
        this.notificationService.markAsLu(notif._id).subscribe({
          next: res => this.unreadCount.set(res.unread)
        });
      }
    });
  }

  logout() { this.authService.logout(); }

  userName = computed(() => {
    const user = this.currentUser();
    return user ? `Me. ${user.prenom} ${user.nom}` : 'Me. ALA AISSA';
  });

  userRole = computed(() => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrateur', 'avocat': 'Avocat', 'assistant': 'Assistant', 'secretaire': 'Secrétaire'
    };
    const user = this.currentUser();
    return user ? roleMap[user.role] || user.role : 'Avocat Senior';
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    if (user) return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
    return 'AA';
  });
}
