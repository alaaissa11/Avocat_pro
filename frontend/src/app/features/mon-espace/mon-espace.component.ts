import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TacheService, Tache } from '../../core/services/tache.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService, User } from '../../core/services/user.service';

@Component({
  selector: 'app-mon-espace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- HEADER PERSONNALISÉ -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lawyer-primary via-lawyer-primary to-lawyer-dark text-white p-8 mb-6 shadow-card">
        <div class="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5"></div>
        <div class="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5"></div>
        <div class="absolute top-4 right-8 opacity-20">
          <span class="material-icons text-9xl">workspace_premium</span>
        </div>
        <div class="relative flex items-center gap-5">
          <div class="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
            {{ getInitials() }}
          </div>
          <div>
            <p class="text-blue-100 text-sm">Bonjour,</p>
            <h1 class="text-3xl font-bold font-serif">{{ currentUser()?.prenom }} {{ currentUser()?.nom }}</h1>
            <p class="text-blue-100 text-sm mt-1 flex items-center gap-2">
              <span class="material-icons text-base">badge</span>
              {{ getRoleLabel(currentUser()?.role || '') }}
            </p>
            @if (currentUser()?.ownerId) {
              <p class="text-blue-200 text-xs mt-1 flex items-center gap-1">
                <span class="material-icons text-xs">supervisor_account</span>
                Supervisé par: {{ currentUser()?.ownerId?.prenom }} {{ currentUser()?.ownerId?.nom }}
              </p>
            }
          </div>
        </div>
      </div>

      <!-- STATS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card hover:shadow-hover transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">À faire</p>
              <p class="text-3xl font-bold text-amber-600 mt-1">{{ countByStatut('a_faire') }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <span class="material-icons text-amber-600">radio_button_unchecked</span>
            </div>
          </div>
        </div>
        <div class="card hover:shadow-hover transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">En cours</p>
              <p class="text-3xl font-bold text-blue-600 mt-1">{{ countByStatut('en_cours') }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span class="material-icons text-blue-600">autorenew</span>
            </div>
          </div>
        </div>
        <div class="card hover:shadow-hover transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">Terminées (mois)</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ termineesMois() }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span class="material-icons text-green-600">check_circle</span>
            </div>
          </div>
        </div>
        <div class="card hover:shadow-hover transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">En retard</p>
              <p class="text-3xl font-bold text-red-600 mt-1">{{ enRetardCount() }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <span class="material-icons text-red-600">warning</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTRES RAPIDES -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span class="material-icons text-base">filter_alt</span>
            Filtrer :
          </span>
          <button (click)="setFilter('')"
                  [class.bg-lawyer-primary]="currentFilter() === ''"
                  [class.text-white]="currentFilter() === ''"
                  [class.bg-slate-100]="currentFilter() !== ''"
                  [class.text-slate-700]="currentFilter() !== ''"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            Toutes
          </button>
          <button (click)="setFilter('a_faire')"
                  [class.bg-amber-500]="currentFilter() === 'a_faire'"
                  [class.text-white]="currentFilter() === 'a_faire'"
                  [class.bg-slate-100]="currentFilter() !== 'a_faire'"
                  [class.text-slate-700]="currentFilter() !== 'a_faire'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            À faire
          </button>
          <button (click)="setFilter('en_cours')"
                  [class.bg-blue-500]="currentFilter() === 'en_cours'"
                  [class.text-white]="currentFilter() === 'en_cours'"
                  [class.bg-slate-100]="currentFilter() !== 'en_cours'"
                  [class.text-slate-700]="currentFilter() !== 'en_cours'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            En cours
          </button>
          <button (click)="setFilter('terminee')"
                  [class.bg-green-500]="currentFilter() === 'terminee'"
                  [class.text-white]="currentFilter() === 'terminee'"
                  [class.bg-slate-100]="currentFilter() !== 'terminee'"
                  [class.text-slate-700]="currentFilter() !== 'terminee'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            Terminées
          </button>
          <div class="ml-auto flex items-center gap-2">
            <span class="text-xs text-slate-500">Trier par :</span>
            <select [(ngModel)]="sortBy" class="select-field !py-1.5 !text-sm">
              <option value="echeance">Échéance</option>
              <option value="priorite">Priorité</option>
              <option value="recent">Récentes</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- MES TÂCHES -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-lawyer-dark flex items-center gap-2">
                <span class="material-icons text-lawyer-primary">assignment</span>
                Mes tâches
              </h2>
              <span class="text-xs text-slate-500">{{ sortedTaches().length }} tâche(s)</span>
            </div>

            <div class="space-y-3">
              @for (tache of sortedTaches().slice(0, 15); track tache._id) {
                <div class="group p-4 rounded-xl border border-slate-200 hover:border-lawyer-primary/50 hover:shadow-md transition-all bg-white">
                  <div class="flex items-start gap-3">
                    <button (click)="toggleStatus(tache)"
                            [disabled]="tache.statut === 'terminee' || tache.statut === 'annulee'"
                            [class.opacity-30]="tache.statut === 'terminee' || tache.statut === 'annulee'"
                            class="mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                            [ngClass]="tache.statut === 'terminee' ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-lawyer-primary'">
                      @if (tache.statut === 'terminee') {
                        <span class="material-icons text-white text-xs">check</span>
                      }
                    </button>
                    @if (canManageTasks()) {
                      <button (click)="openAssignModal(tache)"
                              class="mt-1 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-lawyer-primary transition-colors"
                              title="Assigner">
                        <span class="material-icons text-sm">person_add</span>
                      </button>
                    }

                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-2">
                        <p class="font-semibold text-lawyer-dark"
                           [class.line-through]="tache.statut === 'terminee'"
                           [class.text-slate-400]="tache.statut === 'terminee'">
                          {{ tache.titre }}
                        </p>
                        <span class="material-icons text-base flex-shrink-0"
                              [style.color]="getPriorityColor(tache.priorite)">flag</span>
                      </div>

                      @if (tache.description) {
                        <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">{{ tache.description }}</p>
                      }

                      <div class="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        @if (tache.dossierId) {
                          <span class="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                            <span class="material-icons text-sm">folder</span>
                            {{ tache.dossierId.numero }}
                          </span>
                        }
                        @if (tache.dateEcheance) {
                          <span class="flex items-center gap-1 px-2 py-0.5 rounded"
                                [class.text-red-600]="isOverdue(tache.dateEcheance, tache.statut)"
                                [class.bg-red-50]="isOverdue(tache.dateEcheance, tache.statut)"
                                [class.text-slate-600]="!isOverdue(tache.dateEcheance, tache.statut)"
                                [class.bg-slate-100]="!isOverdue(tache.dateEcheance, tache.statut)">
                            <span class="material-icons text-sm">{{ isOverdue(tache.dateEcheance, tache.statut) ? 'warning' : 'event' }}</span>
                            {{ formatDate(tache.dateEcheance) }}
                          </span>
                        }
                        <span class="badge text-[10px]" [ngClass]="getStatutBadgeClass(tache.statut)">
                          {{ getStatutLabel(tache.statut) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12 text-slate-500">
                  <span class="material-icons text-6xl block mb-2 text-slate-300">task_alt</span>
                  <p class="text-sm">
                    @if (currentFilter() === '') {
                      Aucune tâche ne vous est assignée pour le moment
                    } @else {
                      Aucune tâche avec ce statut
                    }
                  </p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- PLANNING SEMAINE -->
        <div class="lg:col-span-1">
          <div class="card">
            <h2 class="text-lg font-semibold text-lawyer-dark flex items-center gap-2 mb-4">
              <span class="material-icons text-lawyer-primary">calendar_view_week</span>
              Planning 7 jours
            </h2>

            <div class="space-y-2">
              @for (day of upcomingDays; track day.date) {
                <div class="p-3 rounded-lg border border-slate-200 hover:border-lawyer-primary/30 transition-colors"
                     [ngClass]="day.isToday ? 'bg-lawyer-primary/5 border-lawyer-primary' : ''">
                  <div class="flex items-center justify-between mb-1">
                    <div>
                      <p class="text-sm font-semibold text-lawyer-dark">{{ day.label }}</p>
                      <p class="text-xs text-slate-500">{{ day.dateLabel }}</p>
                    </div>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                          [class.bg-lawyer-primary]="day.isToday"
                          [class.text-white]="day.isToday"
                          [class.bg-slate-100]="!day.isToday"
                          [class.text-slate-600]="!day.isToday">
                      {{ day.count }}
                    </span>
                  </div>
                  @if (day.tasks.length > 0) {
                    <div class="space-y-1 mt-2">
                      @for (t of day.tasks.slice(0, 2); track t._id) {
                        <p class="text-xs text-slate-600 truncate flex items-center gap-1">
                          <span class="material-icons text-xs" [style.color]="getPriorityColor(t.priorite)">flag</span>
                          {{ t.titre }}
                        </p>
                      }
                      @if (day.tasks.length > 2) {
                        <p class="text-xs text-slate-400">+{{ day.tasks.length - 2 }} autre(s)</p>
                      }
                    </div>
                  } @else {
                    <p class="text-xs text-slate-400 mt-2">Aucune tâche</p>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Assign Task Modal -->
      @if (showAssignModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
             style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px);"
             (click)="closeAssignModal()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up"
               (click)="$event.stopPropagation()">
            <div class="bg-gradient-to-br from-lawyer-primary via-lawyer-primary to-lawyer-dark px-6 py-4 rounded-t-2xl text-white">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Assigner la tâche</h3>
                <button (click)="closeAssignModal()" class="text-white/80 hover:text-white">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="p-6">
              @if (selectedTache()) {
                <div class="mb-4">
                  <p class="text-sm text-slate-500 mb-1">Tâche</p>
                  <p class="font-semibold text-lawyer-dark">{{ selectedTache()?.titre }}</p>
                </div>
              }
              @if (assignError()) {
                <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4 flex items-start gap-2">
                  <span class="material-icons text-lg">error</span>
                  <span>{{ assignError() }}</span>
                </div>
              }
              <div>
                <label class="form-label">Assigner à</label>
                <select [(ngModel)]="selectedAssignee" class="select-field">
                  <option value="">Sélectionnez un membre...</option>
                  @for (user of availableUsers(); track user._id) {
                    <option [value]="user._id">{{ user.prenom }} {{ user.nom }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button (click)="closeAssignModal()" class="btn-secondary">Annuler</button>
              <button (click)="assignTache()"
                      [disabled]="assigning() || !selectedAssignee()"
                      class="btn-primary flex items-center gap-2">
                @if (assigning()) {
                  <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                }
                Assigner
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .material-icons { font-size: 20px; }
    .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #334155; margin-bottom: 0.375rem; }
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class MonEspaceComponent implements OnInit {
  taches = signal<Tache[]>([]);
  currentFilter = signal<'' | 'a_faire' | 'en_cours' | 'terminee' | 'annulee'>('');
  sortBy: 'echeance' | 'priorite' | 'recent' = 'echeance';
  showAssignModal = signal(false);
  selectedTache = signal<Tache | null>(null);
  availableUsers = signal<User[]>([]);
  selectedAssignee = signal<string>('');
  assignError = signal<string>('');
  assigning = signal(false);

  filteredTaches = computed(() => {
    const filter = this.currentFilter();
    let list = [...this.taches()];
    if (filter) list = list.filter(t => t.statut === filter);
    return list;
  });

  sortedTaches = computed(() => {
    const list = [...this.filteredTaches()];
    if (this.sortBy === 'echeance') {
      list.sort((a, b) => {
        if (!a.dateEcheance) return 1;
        if (!b.dateEcheance) return -1;
        return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
      });
    } else if (this.sortBy === 'priorite') {
      list.sort((a, b) => b.priorite - a.priorite);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  });

  upcomingDays: { date: string; label: string; dateLabel: string; isToday: boolean; count: number; tasks: Tache[] }[] = [];

  constructor(
    private tacheService: TacheService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadTaches();
    const currentUser = this.authService.currentUser();
    if (currentUser?.role === 'admin' || currentUser?.role === 'avocat') {
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.availableUsers.set(users.filter(u =>
            u.role === 'collaborateur' || u.role === 'assistant' || u.role === 'secretaire'
          ));
        },
        error: (err) => console.error('Error loading users:', err)
      });
    }
  }

  currentUser() { return this.authService.currentUser(); }

  loadTaches() {
    this.tacheService.getMyTaches().subscribe({
      next: (taches) => {
        this.taches.set(taches);
        this.buildUpcomingDays();
      },
      error: (err) => console.error('Error loading my taches:', err)
    });
  }

  buildUpcomingDays() {
    const days: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];

      const dayTasks = this.taches().filter(t => {
        if (!t.dateEcheance) return false;
        const tDate = new Date(t.dateEcheance);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === d.getTime();
      });

      const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      days.push({
        date: isoDate,
        label: i === 0 ? "Aujourd'hui" : (i === 1 ? 'Demain' : dayLabels[d.getDay()]),
        dateLabel: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        isToday: i === 0,
        count: dayTasks.length,
        tasks: dayTasks
      });
    }
    this.upcomingDays = days;
  }

  setFilter(f: '' | 'a_faire' | 'en_cours' | 'terminee' | 'annulee') {
    this.currentFilter.set(f);
  }

  toggleStatus(tache: Tache) {
    if (tache.statut === 'terminee' || tache.statut === 'annulee') return;
    const newStatut = tache.statut === 'a_faire' ? 'en_cours' : 'terminee';
    if (newStatut === 'terminee') {
      this.tacheService.terminateTache(tache._id, tache.chargeConsommee).subscribe({
        next: () => this.loadTaches(),
        error: (err) => console.error('Error completing tache:', err)
      });
    } else {
      this.tacheService.updateTache(tache._id, { statut: newStatut }).subscribe({
        next: () => this.loadTaches(),
        error: (err) => console.error('Error updating tache:', err)
      });
    }
  }

  countByStatut(s: string): number {
    return this.taches().filter(t => t.statut === s).length;
  }

  termineesMois(): number {
    const now = new Date();
    return this.taches().filter(t => {
      if (t.statut !== 'terminee' || !t.dateFin) return false;
      const d = new Date(t.dateFin);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }

  enRetardCount(): number {
    const now = new Date();
    return this.taches().filter(t => {
      if (t.statut === 'terminee' || t.statut === 'annulee') return false;
      if (!t.dateEcheance) return false;
      return new Date(t.dateEcheance) < now;
    }).length;
  }

  getInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return ((u.nom?.[0] || '') + (u.prenom?.[0] || '')).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      avocat: 'Avocat',
      collaborateur: 'Collaborateur',
      assistant: 'Assistant',
      secretaire: 'Secrétaire',
    };
    return labels[role] || role;
  }

  getPriorityColor(priorite: number): string {
    if (priorite >= 5) return '#ef4444';
    if (priorite >= 4) return '#f97316';
    if (priorite >= 3) return '#f59e0b';
    return '#10b981';
  }

  getStatutBadgeClass(statut: string): string {
    const classes: Record<string, string> = {
      'a_faire': 'badge-warning',
      'en_cours': 'badge-info',
      'terminee': 'badge-success',
      'annulee': 'badge-danger'
    };
    return classes[statut] || 'badge-info';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'a_faire': 'À faire',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  isOverdue(dateEcheance: Date | string, statut: string): boolean {
    if (statut === 'terminee' || statut === 'annulee') return false;
    return new Date(dateEcheance) < new Date();
  }

  canManageTasks(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin' || role === 'avocat';
  }

  openAssignModal(tache: Tache) {
    this.selectedTache.set(tache);
    const assigneeId = typeof tache.assigneeA === 'object' ? tache.assigneeA?._id : tache.assigneeA;
    this.selectedAssignee.set(assigneeId || '');
    this.assignError.set('');
    this.showAssignModal.set(true);
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
    this.selectedTache.set(null);
    this.assignError.set('');
  }

  assignTache() {
    const tache = this.selectedTache();
    if (!tache || !this.selectedAssignee()) return;

    this.assigning.set(true);
    this.assignError.set('');

    const assigneeData: any = { assigneeA: this.selectedAssignee() };
    this.tacheService.updateTache(tache._id, assigneeData).subscribe({
      next: () => {
        this.assigning.set(false);
        this.closeAssignModal();
        this.loadTaches();
      },
      error: (err) => {
        this.assigning.set(false);
        this.assignError.set(err.error?.message || 'Erreur lors de l\'assignation');
      }
    });
  }
}
