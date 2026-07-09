import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagerieService, Message, Conversation } from '../../core/services/messagerie.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService, User } from '../../core/services/user.service';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col animate-fade-in">
      <h1 class="page-title mb-4">Messagerie</h1>

      <div class="flex-1 flex gap-0 bg-white rounded-xl shadow-card overflow-hidden min-h-0">
        <!-- Conversations List -->
        <aside class="w-72 border-r border-slate-200 flex flex-col flex-shrink-0">
          <div class="p-3 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-600">Conversations</h2>
            <button (click)="openNewConversation()" class="text-lawyer-primary hover:text-lawyer-secondary text-xs font-medium flex items-center gap-1">
              <span class="material-icons text-sm">add_circle</span>
              Nouveau
            </button>
          </div>
          <div class="flex-1 overflow-y-auto">
            @if (loadingConversations()) {
              <div class="p-4 text-sm text-slate-400 text-center">Chargement...</div>
            } @else if (conversations().length === 0) {
              <div class="p-4 text-sm text-slate-400 text-center">Aucune conversation</div>
            } @else {
              @for (conv of conversations(); track conv.user._id) {
                <button
                  (click)="selectConversation(conv)"
                  class="w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  [class.bg-lawyer-light]="selectedUserId() === conv.user._id"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                         [style.background]="conv.user.role === 'avocat' ? 'linear-gradient(135deg, #1a365d, #2c5282)' : 'linear-gradient(135deg, #c6a052, #d4af37)'">
                      {{ getUserInitials(conv.user) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-800 truncate">
                          {{ conv.user.prenom }} {{ conv.user.nom }}
                        </span>
                        @if (conv.unread > 0) {
                          <span class="bg-lawyer-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                            {{ conv.unread }}
                          </span>
                        }
                      </div>
                      <p class="text-xs text-slate-400 truncate mt-0.5">
                        {{ conv.lastMessage.content }}
                      </p>
                    </div>
                  </div>
                </button>
              }
            }
          </div>
        </aside>

        <!-- Chat Area -->
        <main class="flex-1 flex flex-col min-w-0">
          @if (!selectedUserId()) {
            <div class="flex-1 flex items-center justify-center text-slate-400">
              <div class="text-center">
                <span class="material-icons text-5xl">chat</span>
                <p class="mt-2 text-sm">Sélectionnez une conversation</p>
              </div>
            </div>
          } @else {
            <!-- Chat Header -->
            <div class="p-3 border-b border-slate-200 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                   [style.background]="selectedUser()?.role === 'avocat' ? 'linear-gradient(135deg, #1a365d, #2c5282)' : 'linear-gradient(135deg, #c6a052, #d4af37)'">
                {{ getUserInitials(selectedUser()) }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">{{ selectedUser()?.prenom }} {{ selectedUser()?.nom }}</p>
                <p class="text-xs text-slate-400">{{ getRoleLabel(selectedUser()?.role) }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-3" style="max-height: calc(100vh - 280px);">
              @if (loadingMessages()) {
                <div class="text-center text-sm text-slate-400">Chargement...</div>
              } @else {
                @for (msg of messages(); track msg._id) {
                  <div class="flex" [class.justify-end]="msg.sender._id === currentUserId()">
                    <div class="max-w-[70%] rounded-lg px-3 py-2 text-sm"
                         [class.bg-lawyer-primary]="msg.sender._id === currentUserId()"
                         [class.text-white]="msg.sender._id === currentUserId()"
                         [class.bg-slate-100]="msg.sender._id !== currentUserId()"
                         [class.text-slate-800]="msg.sender._id !== currentUserId()">
                      @if (msg.sender._id === currentUserId()) {
                        <div class="text-[10px] opacity-80 mb-0.5 text-right">{{ msg.createdAt | date:'dd/MM HH:mm' }}</div>
                      } @else {
                        <div class="text-[10px] text-slate-500 mb-0.5">{{ msg.createdAt | date:'dd/MM HH:mm' }}</div>
                      }
                      <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center text-sm text-slate-400">Aucun message. Envoyez le premier message !</div>
                }
              }
            </div>

            <!-- Input -->
            <div class="p-3 border-t border-slate-200">
              <form (ngSubmit)="envoyerMessage()" class="flex gap-2">
                <input
                  [(ngModel)]="newMessage"
                  name="newMessage"
                  type="text"
                  placeholder="Écrivez votre message..."
                  class="input-field flex-1"
                  required
                >
                <button type="submit" class="btn-primary px-4 flex items-center gap-1.5" [disabled]="!newMessage || !newMessage.trim()">
                  <span class="material-icons text-sm">send</span>
                  <span>Envoyer</span>
                </button>
              </form>
            </div>
          }
        </main>
      </div>
    </div>

    <!-- New Conversation Modal -->
    @if (showNewMessageModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="closeNewConversation()">
        <div class="bg-white rounded-xl shadow-xl w-96 max-h-[70vh] flex flex-col" (click)="$event.stopPropagation()">
          <div class="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-800">Nouveau message</h3>
            <button (click)="closeNewConversation()" class="text-slate-400 hover:text-slate-600">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-3">
            <input
              [(ngModel)]="userSearch"
              name="userSearch"
              type="text"
              placeholder="Rechercher..."
              class="input-field w-full text-sm"
            >
          </div>
          <div class="flex-1 overflow-y-auto p-2">
            @if (loadingUsers()) {
              <div class="p-4 text-sm text-slate-400 text-center">Chargement...</div>
            } @else {
              @for (u of filteredUsers(); track u._id) {
                <button
                  (click)="startConversation(u)"
                  class="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
                >
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                       [style.background]="u.role === 'avocat' ? 'linear-gradient(135deg, #1a365d, #2c5282)' : 'linear-gradient(135deg, #c6a052, #d4af37)'">
                    {{ getUserInitials(u) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800">{{ u.prenom }} {{ u.nom }}</p>
                    <p class="text-xs text-slate-400">{{ getRoleLabel(u.role) }}</p>
                  </div>
                </button>
              } @empty {
                <div class="p-4 text-sm text-slate-400 text-center">Aucun utilisateur trouvé</div>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .material-icons { font-size: 20px; }
    :host { display: block; height: 100%; }
  `]
})
export class MessagerieComponent implements OnInit, OnDestroy {
  private messagerieService = inject(MessagerieService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  selectedUserId = signal<string | null>(null);
  selectedUser = signal<any>(null);
  currentUserId = signal<string>('');
  newMessage = '';
  loadingConversations = signal(true);
  loadingMessages = signal(false);

  showNewMessageModal = signal(false);
  availableUsers = signal<User[]>([]);
  userSearch = '';
  loadingUsers = signal(false);

  filteredUsers = computed(() => {
    const search = this.userSearch.toLowerCase().trim();
    const currentRole = this.authService.currentUser()?.role;
    return this.availableUsers().filter(u => {
      if (u._id === this.authService.currentUser()?.id) return false;
      if (search && !u.prenom.toLowerCase().includes(search) && !u.nom.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  private pollTimer: any;

  ngOnInit() {
    this.currentUserId.set(this.authService.currentUser()?.id || '');
    this.loadConversations();
    this.pollTimer = setInterval(() => {
      if (this.selectedUserId()) {
        this.loadMessages(this.selectedUserId()!, true);
      }
    }, 30000);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  loadConversations() {
    this.loadingConversations.set(true);
    this.messagerieService.getConversations().subscribe({
      next: (convs) => {
        this.conversations.set(convs);
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false)
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedUserId.set(conv.user._id);
    this.selectedUser.set(conv.user);
    this.loadMessages(conv.user._id);
    this.messagerieService.markAsLu(conv.user._id).subscribe();
  }

  loadMessages(userId: string, silent = false) {
    if (!silent) this.loadingMessages.set(true);
    this.messagerieService.getMessages(userId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.loadingMessages.set(false);
        setTimeout(() => this.scrollToBottom(), 50);
        this.markConversationRead(userId);
      },
      error: () => this.loadingMessages.set(false)
    });
  }

  envoyerMessage() {
    if (!this.newMessage?.trim() || !this.selectedUserId()) return;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.messagerieService.envoyerMessage(this.selectedUserId()!, content).subscribe({
      next: (msg) => {
        this.messages.update(msgs => [...msgs, msg]);
        setTimeout(() => this.scrollToBottom(), 50);
        this.loadConversations();
      }
    });
  }

  private scrollToBottom() {
    const container = document.querySelector('.overflow-y-auto.p-4');
    if (container) container.scrollTop = container.scrollHeight;
  }

  private markConversationRead(userId: string) {
    this.conversations.update(convs =>
      convs.map(c => c.user._id === userId ? { ...c, unread: 0 } : c)
    );
  }

  openNewConversation() {
    this.showNewMessageModal.set(true);
    this.userSearch = '';
    this.loadingUsers.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers.set(users);
        this.loadingUsers.set(false);
      },
      error: () => this.loadingUsers.set(false)
    });
  }

  closeNewConversation() {
    this.showNewMessageModal.set(false);
    this.userSearch = '';
  }

  startConversation(user: User) {
    this.selectedUserId.set(user._id);
    this.selectedUser.set(user);
    this.messages.set([]);
    this.closeNewConversation();
    this.loadMessages(user._id);
  }

  getUserInitials(user: any): string {
    if (!user) return '?';
    return ((user.nom?.[0] || '') + (user.prenom?.[0] || '')).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      avocat: 'Avocat',
      collaborateur: 'Collaborateur',
      assistant: 'Assistant',
      secretaire: 'Secrétaire',
    };
    return labels[role] || role || '';
  }
}
