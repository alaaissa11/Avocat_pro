import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, CreateUserPayload, Collaborateur } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-collaborateurs-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Équipe</h1>
          <p class="text-slate-500 text-sm">Gestion des membres du cabinet (avocats, collaborateurs, assistants)</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-lg">person_add</span>
          Inviter un membre
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <span class="material-icons text-slate-600">groups</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-lawyer-dark">{{ totalCount() }}</p>
              <p class="text-sm text-slate-500">Membres</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
              <span class="material-icons text-lawyer-primary">gavel</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-lawyer-primary">{{ countByRole('avocat') }}</p>
              <p class="text-sm text-slate-500">Avocats</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span class="material-icons text-blue-600">badge</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-blue-600">{{ countCollaborateurs() }}</p>
              <p class="text-sm text-slate-500">Collaborateurs / Assistants</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span class="material-icons text-green-600">verified</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ activeCount() }}</p>
              <p class="text-sm text-slate-500">Comptes actifs</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">search</span>
              <input type="text"
                     [(ngModel)]="filters.search"
                     (ngModelChange)="applyFilters()"
                     placeholder="Rechercher par nom, email..."
                     class="input-field pl-11">
            </div>
          </div>
          <select [(ngModel)]="filters.role" (ngModelChange)="applyFilters()" class="select-field">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="avocat">Avocat</option>
            <option value="collaborateur">Collaborateur</option>
            <option value="assistant">Assistant</option>
            <option value="secretaire">Secrétaire</option>
          </select>
          <select [(ngModel)]="filters.statut" (ngModelChange)="applyFilters()" class="select-field">
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs uniquement</option>
            <option value="inactif">Inactifs uniquement</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="table-header">Membre</th>
                <th class="table-header">Email</th>
                <th class="table-header">Rôle</th>
                <th class="table-header">Téléphone</th>
                <th class="table-header">Statut</th>
                <th class="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user._id) {
                <tr class="table-row-hover">
                  <td class="table-cell">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                           [ngClass]="getAvatarColor(user.role)">
                        {{ getInitials(user.nom, user.prenom) }}
                      </div>
                      <div>
                        <p class="font-medium text-lawyer-dark">{{ user.prenom }} {{ user.nom }}</p>
                        <p class="text-xs text-slate-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="table-cell text-sm text-slate-600">{{ user.email }}</td>
                  <td class="table-cell">
                    <span class="badge" [ngClass]="getRoleBadgeClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="table-cell text-sm text-slate-600">
                    {{ user.telephone || '—' }}
                  </td>
                  <td class="table-cell">
                    <button (click)="toggleActive(user)"
                            [disabled]="user._id === currentUserId()"
                            [class.opacity-50]="user._id === currentUserId()"
                            [class.cursor-not-allowed]="user._id === currentUserId()"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            [class.bg-green-500]="user.isActive"
                            [class.bg-slate-300]="!user.isActive"
                            [title]="user._id === currentUserId() ? 'Vous ne pouvez pas vous désactiver' : (user.isActive ? 'Désactiver' : 'Activer')">
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                            [class.translate-x-6]="user.isActive"
                            [class.translate-x-1]="!user.isActive"></span>
                    </button>
                    <span class="ml-2 text-xs"
                          [class.text-green-600]="user.isActive"
                          [class.text-slate-400]="!user.isActive">
                      {{ user.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="table-cell text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="openEditModal(user)" class="p-2 hover:bg-slate-100 rounded" title="Modifier">
                        <span class="material-icons text-slate-600 text-sm">edit</span>
                      </button>
                      <button (click)="deleteUser(user)"
                              [disabled]="user._id === currentUserId()"
                              [class.opacity-30]="user._id === currentUserId()"
                              [class.cursor-not-allowed]="user._id === currentUserId()"
                              class="p-2 hover:bg-red-100 rounded"
                              title="Supprimer">
                        <span class="material-icons text-red-600 text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="table-cell text-center py-8 text-slate-500">
                    <span class="material-icons text-4xl block mb-2 text-slate-300">person_off</span>
                    Aucun membre trouvé
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
           style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px);"
           (click)="closeModal()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden animate-slide-up"
             (click)="$event.stopPropagation()">

          <!-- HEADER -->
          <div class="relative bg-gradient-to-br from-lawyer-primary via-lawyer-primary to-lawyer-dark px-8 py-6 text-white overflow-hidden">
            <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5"></div>
            <div class="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-white/5"></div>
            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl font-semibold">
                  @if (editingUser()) {
                    {{ getInitials(editingUser()!.nom, editingUser()!.prenom) }}
                  } @else {
                    <span class="material-icons text-2xl">person_add</span>
                  }
                </div>
                <div>
                  <p class="text-blue-100 text-xs uppercase tracking-widest font-medium">
                    {{ editingUser() ? 'Modification' : 'Nouveau membre' }}
                  </p>
                  <h2 class="text-2xl font-bold font-serif">
                    {{ editingUser() ? 'Modifier le membre' : 'Inviter un membre' }}
                  </h2>
                </div>
              </div>
              <button (click)="closeModal()"
                      class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                      title="Fermer">
                <span class="material-icons text-2xl">close</span>
              </button>
            </div>
          </div>

          <!-- BODY -->
          <div class="p-8 overflow-y-auto max-h-[calc(92vh-220px)] space-y-6">

            @if (formError()) {
              <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-start gap-2">
                <span class="material-icons text-lg">error</span>
                <span>{{ formError() }}</span>
              </div>
            }

            <!-- Identité -->
            <section>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                  <span class="material-icons text-lawyer-primary text-lg">person</span>
                </div>
                <h3 class="text-base font-semibold text-lawyer-dark">Identité</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Prénom <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="form.prenom" class="input-field" placeholder="Prénom">
                </div>
                <div>
                  <label class="form-label">Nom <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="form.nom" class="input-field" placeholder="Nom">
                </div>
                <div class="md:col-span-2">
                  <label class="form-label">Email <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">email</span>
                    <input type="email" [(ngModel)]="form.email" class="input-field pl-11" placeholder="prenom.nom@cabinet.tn">
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="form-label">Téléphone</label>
                  <div class="relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">phone</span>
                    <input type="tel" [(ngModel)]="form.telephone" class="input-field pl-11" placeholder="+216 XX XXX XXX">
                  </div>
                </div>
              </div>
            </section>

            <!-- Rôle & permissions -->
            <section>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                  <span class="material-icons text-lawyer-primary text-lg">admin_panel_settings</span>
                </div>
                <h3 class="text-base font-semibold text-lawyer-dark">Rôle & permissions</h3>
              </div>

              <div class="mb-4">
                <label class="form-label">Rôle <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  @for (r of allowedRoles; track r.value) {
                    <button type="button"
                            (click)="form.role = r.value"
                            [ngClass]="form.role === r.value
                              ? 'ring-2 ring-lawyer-primary bg-lawyer-primary/5 border-lawyer-primary bg-white'
                              : ''"
                            class="flex items-center gap-2 p-3 border-2 border-slate-200 rounded-lg hover:border-lawyer-primary/50 transition-all text-left">
                      <span class="material-icons text-xl" [ngClass]="form.role === r.value ? 'text-lawyer-primary' : 'text-slate-400'">
                        {{ r.icon }}
                      </span>
                      <span class="text-sm font-medium" [ngClass]="form.role === r.value ? 'text-lawyer-primary' : 'text-slate-700'">
                        {{ r.label }}
                      </span>
                    </button>
                  }
                </div>
              </div>

              <div>
                <p class="text-xs text-slate-500 mb-2">Permissions accordées :</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (perm of getPermissionsForRole(form.role); track perm) {
                    <span class="px-2.5 py-1 bg-lawyer-primary/10 text-lawyer-primary text-xs font-medium rounded-full border border-lawyer-primary/20">
                      {{ getPermissionLabel(perm) }}
                    </span>
                  }
                </div>
              </div>

              @if (form.role === 'avocat' || form.role === 'collaborateur' || form.role === 'assistant') {
                <div class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                  <span class="material-icons text-base">info</span>
                  <span>Une fiche collaborateur (avec matricule automatique) sera créée pour ce membre.</span>
                </div>
              }
            </section>

            <!-- Sécurité (seulement à la création) -->
            @if (!editingUser()) {
              <section>
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-lawyer-primary/10 flex items-center justify-center">
                    <span class="material-icons text-lawyer-primary text-lg">lock</span>
                  </div>
                  <h3 class="text-base font-semibold text-lawyer-dark">Sécurité</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Mot de passe <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">lock</span>
                      <input [type]="showPassword() ? 'text' : 'password'"
                             [(ngModel)]="form.password"
                             class="input-field pl-11 pr-11"
                             placeholder="Min. 8 caractères">
                      <button type="button"
                              (click)="showPassword.set(!showPassword())"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <span class="material-icons text-xl">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Confirmation <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">lock</span>
                      <input [type]="showPassword() ? 'text' : 'password'"
                             [(ngModel)]="form.confirmPassword"
                             class="input-field pl-11"
                             placeholder="Retapez le mot de passe">
                    </div>
                  </div>
                </div>
                <p class="mt-2 text-xs text-slate-500">Le collaborateur pourra changer son mot de passe après sa première connexion.</p>
              </section>
            }
          </div>

          <!-- FOOTER -->
          <div class="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button (click)="closeModal()" class="btn-secondary" [disabled]="saving()">Annuler</button>
            <button (click)="saveUser()" class="btn-primary flex items-center gap-2" [disabled]="saving()">
              @if (saving()) {
                <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Enregistrement...
              } @else {
                <span class="material-icons text-lg">{{ editingUser() ? 'save' : 'person_add' }}</span>
                {{ editingUser() ? 'Mettre à jour' : 'Créer le compte' }}
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .material-icons { font-size: 20px; }
    .form-label {
      @apply block text-sm font-semibold text-slate-700 mb-1.5;
    }
    .input-field.pl-11, .select-field.pl-11 { padding-left: 44px !important; }
    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class CollaborateursListComponent implements OnInit {
  users = signal<User[]>([]);
  collaborateurs = signal<Collaborateur[]>([]);
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  saving = signal(false);
  formError = signal('');
  showPassword = signal(false);

  filters = { search: '', role: '', statut: '' };

  filteredUsers = computed(() => {
    let list = [...this.users()];
    const term = this.filters.search.toLowerCase().trim();
    if (term) {
      list = list.filter(u =>
        (u.nom || '').toLowerCase().includes(term) ||
        (u.prenom || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)
      );
    }
    if (this.filters.role) list = list.filter(u => u.role === this.filters.role);
    if (this.filters.statut === 'actif') list = list.filter(u => u.isActive);
    if (this.filters.statut === 'inactif') list = list.filter(u => !u.isActive);
    return list;
  });

  roleOptions = [
    { value: 'admin' as const,          label: 'Administrateur', icon: 'admin_panel_settings' },
    { value: 'avocat' as const,         label: 'Avocat',         icon: 'gavel' },
    { value: 'collaborateur' as const,  label: 'Collaborateur',  icon: 'badge' },
    { value: 'assistant' as const,      label: 'Assistant',      icon: 'support_agent' },
    { value: 'secretaire' as const,     label: 'Secrétaire',     icon: 'edit_note' },
  ];

  get allowedRoles() {
    const currentRole = this.authService.currentUser()?.role;
    if (currentRole === 'admin') {
      return this.roleOptions;
    }
    if (currentRole === 'avocat') {
      return this.roleOptions.filter(r => r.value === 'collaborateur' || r.value === 'assistant' || r.value === 'secretaire');
    }
    return [];
  }

  private allPermissions: Record<string, string[]> = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats'],
    avocat: ['read', 'write', 'delete', 'manage_dossiers', 'manage_clients', 'view_stats'],
    collaborateur: ['read', 'write', 'manage_dossiers', 'manage_clients'],
    assistant: ['read', 'write', 'manage_dossiers', 'manage_clients'],
    secretaire: ['read', 'manage_clients'],
  };

  form: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: 'admin' | 'avocat' | 'collaborateur' | 'assistant' | 'secretaire';
    password: string;
    confirmPassword: string;
  } = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'collaborateur',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadCollaborateurs();
  }

  currentUserId(): string | null {
    return this.authService.currentUser()?.id || null;
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadCollaborateurs() {
    this.userService.getCollaborateurs().subscribe({
      next: (list) => this.collaborateurs.set(list),
      error: (err) => console.error('Error loading collaborateurs:', err)
    });
  }

  applyFilters() {
    // computed() re-évalue automatiquement
  }

  totalCount() { return this.users().length; }
  countByRole(role: string) { return this.users().filter(u => u.role === role).length; }
  countCollaborateurs() {
    return this.users().filter(u => u.role === 'collaborateur' || u.role === 'assistant').length;
  }
  activeCount() { return this.users().filter(u => u.isActive).length; }

  getInitials(nom: string, prenom: string): string {
    return ((nom?.[0] || '') + (prenom?.[0] || '')).toUpperCase();
  }

  getAvatarColor(role: string): string {
    const colors: Record<string, string> = {
      admin: 'bg-red-500',
      avocat: 'bg-lawyer-primary',
      collaborateur: 'bg-blue-500',
      assistant: 'bg-teal-500',
      secretaire: 'bg-purple-500',
    };
    return colors[role] || 'bg-slate-500';
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

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'badge-danger',
      avocat: 'badge-info',
      collaborateur: 'badge-success',
      assistant: 'badge-info',
      secretaire: 'badge-warning',
    };
    return classes[role] || 'badge-info';
  }

  getPermissionsForRole(role: string): string[] {
    return this.allPermissions[role] || ['read'];
  }

  getPermissionLabel(perm: string): string {
    const labels: Record<string, string> = {
      read: 'Lecture',
      write: 'Écriture',
      delete: 'Suppression',
      manage_users: 'Gestion utilisateurs',
      manage_dossiers: 'Gestion dossiers',
      manage_clients: 'Gestion clients',
      view_stats: 'Voir les stats',
    };
    return labels[perm] || perm;
  }

  toggleActive(user: User) {
    if (user._id === this.currentUserId()) return;
    this.userService.toggleUserActive(user._id, !user.isActive).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u._id === updated._id ? updated : u));
      },
      error: (err) => console.error('Error toggling user:', err)
    });
  }

  deleteUser(user: User) {
    if (user._id === this.currentUserId()) return;
    if (confirm(`Supprimer définitivement le compte de ${user.prenom} ${user.nom} ?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  openCreateModal() {
    this.editingUser.set(null);
    this.formError.set('');
    this.form = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'collaborateur',
      password: '',
      confirmPassword: ''
    };
    this.showPassword.set(false);
    this.showModal.set(true);
  }

  openEditModal(user: User) {
    this.editingUser.set(user);
    this.formError.set('');
    this.form = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      role: user.role as any,
      password: '',
      confirmPassword: ''
    };
    this.showPassword.set(false);
    this.showModal.set(true);
  }

  closeModal() {
    if (this.saving()) return;
    this.showModal.set(false);
    this.editingUser.set(null);
    this.formError.set('');
  }

  saveUser() {
    this.formError.set('');

    // Validations
    if (!this.form.prenom.trim() || !this.form.nom.trim()) {
      this.formError.set('Le prénom et le nom sont obligatoires.');
      return;
    }
    if (!this.form.email.trim()) {
      this.formError.set('L\'email est obligatoire.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      this.formError.set('L\'email n\'est pas valide.');
      return;
    }

    if (this.editingUser()) {
      // Update : uniquement nom, prenom, email, telephone, role
      this.saving.set(true);
      this.userService.updateUser(this.editingUser()!._id, {
        nom: this.form.nom,
        prenom: this.form.prenom,
        email: this.form.email,
        telephone: this.form.telephone,
        role: this.form.role,
      } as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(err.error?.message || 'Erreur lors de la mise à jour.');
        }
      });
    } else {
      // Create
      if (this.form.password.length < 8) {
        this.formError.set('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.formError.set('Les mots de passe ne correspondent pas.');
        return;
      }
      this.saving.set(true);
      const payload: CreateUserPayload = {
        email: this.form.email,
        password: this.form.password,
        nom: this.form.nom,
        prenom: this.form.prenom,
        role: this.form.role,
        telephone: this.form.telephone || undefined,
      };
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.loadUsers();
          this.loadCollaborateurs();
          this.closeModal();
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(err.error?.message || 'Erreur lors de la création.');
        }
      });
    }
  }
}
