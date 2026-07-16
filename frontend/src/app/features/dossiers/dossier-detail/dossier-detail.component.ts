import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../../core/services/dossier.service';
import { ClientService } from '../../../core/services/client.service';
import { UserService, User } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentService, Document } from '../../../core/services/document.service';
import { DelegationService, Delegation } from '../../../core/services/delegation.service';
import { CommentaireService, Commentaire } from '../../../core/services/commentaire.service';

@Component({
  selector: 'app-dossier-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dossier-detail.component.html',
  styleUrls: ['./dossier-detail.component.css']
})
export class DossierDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dossierService = inject(DossierService);
  private clientService = inject(ClientService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  dossier = signal<any>(null);
  client = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  availableAvocats = signal<User[]>([]);
  selectedAvocatId = signal<string>('');
  editingAssignee = signal(false);
  savingAssignee = signal(false);
  private documentService = inject(DocumentService);
  private delegationService = inject(DelegationService);
  private commentaireService = inject(CommentaireService);
  dossierDocuments = signal<Document[]>([]);

  // Delegation
  showDelegationModal = signal(false);
  delegationNew = signal({ delegueA: '', dateDebut: '', dateFin: '', motif: '' });
  delegation = signal<Delegation | null>(null);
  delegationUsers = signal<User[]>([]);

  // Comments
  comments = signal<Commentaire[]>([]);
  commentNew = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDossier(id);
    }
    this.loadAvocats();
  }

  loadDossier(id: string) {
    this.dossierService.getDossierById(id).subscribe({
      next: (dossier) => {
        this.dossier.set(dossier);
        this.loadDossierDocuments(id);
        this.loadDelegation(id);
        this.loadComments('dossier', id);
        const clientId = typeof dossier.clientId === 'object' ? dossier.clientId._id : dossier.clientId;
        if (clientId) {
          this.clientService.getClientById(clientId).subscribe({
            next: (client) => this.client.set(client),
            error: () => this.client.set(null)
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  loadDossierDocuments(dossierId: string) {
    this.documentService.getDocuments({ dossierId, limit: 100 }).subscribe({
      next: (response) => this.dossierDocuments.set(response.documents),
      error: (err) => console.error('Error loading documents:', err)
    });
  }

  downloadDocument(doc: Document) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nom;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading:', err)
    });
  }

  viewDocument(doc: Document) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Error viewing document:', err)
    });
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      contrat: 'bg-blue-100 text-blue-700',
      plainte: 'bg-red-100 text-red-700',
      facture: 'bg-green-100 text-green-700',
      pouvoir: 'bg-purple-100 text-purple-700',
      jugement: 'bg-amber-100 text-amber-700',
      decision: 'bg-indigo-100 text-indigo-700',
      correspondance: 'bg-slate-100 text-slate-700',
      requete: 'bg-cyan-100 text-cyan-700',
      piece_jointe: 'bg-pink-100 text-pink-700',
      autre: 'bg-slate-100 text-slate-600'
    };
    return classes[type] || 'bg-slate-100 text-slate-600';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      contrat: 'Contrat',
      plainte: 'Plainte',
      facture: 'Facture',
      pouvoir: 'Pouvoir',
      jugement: 'Jugement',
      decision: 'Décision',
      correspondance: 'Correspondance',
      requete: 'Requête',
      piece_jointe: 'Pièce jointe',
      autre: 'Autre'
    };
    return labels[type] || type;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  loadAvocats() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        const currentUser = this.authService.currentUser();
        if (currentUser?.role === 'admin') {
          this.availableAvocats.set(users.filter(u => u.role === 'avocat'));
        }
      },
      error: (err) => console.error('Error loading avocats:', err)
    });
  }

  canEditAssignee(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin';
  }

  startEditAssignee() {
    const d = this.dossier();
    if (d?.assigneA) {
      const assigneId = typeof d.assigneA === 'object' ? d.assigneA._id : d.assigneA;
      this.selectedAvocatId.set(assigneId || '');
    } else {
      this.selectedAvocatId.set('');
    }
    this.editingAssignee.set(true);
  }

  cancelEditAssignee() {
    this.editingAssignee.set(false);
    this.selectedAvocatId.set('');
  }

  saveAssignee() {
    const dossier = this.dossier();
    if (!dossier) return;

    this.savingAssignee.set(true);
    this.dossierService.updateDossier(dossier._id, { assigneA: this.selectedAvocatId() || null }).subscribe({
      next: (updated) => {
        this.dossier.set(updated);
        this.savingAssignee.set(false);
        this.editingAssignee.set(false);
      },
      error: (err) => {
        this.savingAssignee.set(false);
        console.error('Error updating assignee:', err);
      }
    });
  }

  getStatusColor(statut: string): string {
    const colors: any = {
      'nouveau': 'bg-blue-100 text-blue-700',
      'en_cours': 'bg-amber-100 text-amber-700',
      'en_attente': 'bg-orange-100 text-orange-700',
      'cloture': 'bg-green-100 text-green-700',
      'archive': 'bg-slate-100 text-slate-700'
    };
    return colors[statut] || 'bg-slate-100 text-slate-700';
  }

  getStatusLabel(statut: string): string {
    const labels: any = {
      'nouveau': 'Nouveau',
      'en_cours': 'En cours',
      'en_attente': 'En attente',
      'cloture': 'Clôturé',
      'archive': 'Archivé'
    };
    return labels[statut] || statut;
  }

  getPriorityLabel(priorite: number): string {
    const labels: any = {
      1: 'Haute',
      2: 'Moyenne-Haute',
      3: 'Moyenne',
      4: 'Moyenne-Basse',
      5: 'Basse'
    };
    return labels[priorite] || 'Moyenne';
  }

  getPriorityColor(priorite: number): string {
    const colors: any = {
      1: 'text-red-600',
      2: 'text-orange-600',
      3: 'text-amber-600',
      4: 'text-lime-600',
      5: 'text-green-600'
    };
    return colors[priorite] || 'text-slate-600';
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  get currentUser() { return this.authService.currentUser(); }

  canDelegate(): boolean {
    return this.currentUser?.role === 'avocat' || this.currentUser?.role === 'admin';
  }

  updateDelegationNew(field: string, value: string) {
    this.delegationNew.update(v => ({ ...v, [field]: value }));
  }

  loadDelegation(dossierId: string) {
    this.delegationService.getEntityDelegation('dossier', dossierId).subscribe({
      next: (res) => this.delegation.set(res),
      error: () => this.delegation.set(null)
    });
  }

  loadDelegationUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => this.delegationUsers.set(users.filter(u => u._id !== this.currentUser?.id)),
      error: () => this.delegationUsers.set([])
    });
  }

  getDelegationStatusBadge(statut: string): string {
    const badges: Record<string, string> = { 'en_attente': 'badge-warning', 'acceptee': 'badge-success', 'refusee': 'badge-danger', 'terminee': 'badge-info' };
    return badges[statut] || 'badge-info';
  }

  getDelegationStatusLabel(statut: string): string {
    const labels: Record<string, string> = { 'en_attente': 'En attente', 'acceptee': 'Acceptée', 'refusee': 'Refusée', 'terminee': 'Terminée' };
    return labels[statut] || statut;
  }

  openDelegationModal() {
    this.delegationNew.set({ delegueA: '', dateDebut: '', dateFin: '', motif: '' });
    this.loadDelegationUsers();
    const d = this.dossier();
    if (d) this.loadDelegation(d._id);
    this.showDelegationModal.set(true);
  }

  closeDelegationModal() {
    this.showDelegationModal.set(false);
    this.delegationNew.set({ delegueA: '', dateDebut: '', dateFin: '', motif: '' });
  }

  createDelegation() {
    const d = this.delegationNew();
    if (!d.delegueA || !d.dateDebut || !d.dateFin) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const dossier = this.dossier();
    if (!dossier) return;
    this.delegationService.createDelegation({
      entiteType: 'dossier',
      entiteId: dossier._id,
      delegueA: d.delegueA,
      dateDebut: d.dateDebut,
      dateFin: d.dateFin,
      motif: d.motif
    }).subscribe({
      next: () => {
        this.loadDelegation(dossier._id);
        this.delegationNew.set({ delegueA: '', dateDebut: '', dateFin: '', motif: '' });
      },
      error: (err) => console.error('Error creating delegation:', err)
    });
  }

  acceptDelegation(delId: string) {
    this.delegationService.acceptDelegation(delId).subscribe({
      next: () => { const d = this.dossier(); if (d) this.loadDelegation(d._id); },
      error: (err) => console.error('Error accepting delegation:', err)
    });
  }

  refuseDelegation(delId: string) {
    this.delegationService.refuseDelegation(delId).subscribe({
      next: () => { const d = this.dossier(); if (d) this.loadDelegation(d._id); },
      error: (err) => console.error('Error refusing delegation:', err)
    });
  }

  terminerDelegation(delId: string) {
    this.delegationService.terminerDelegation(delId).subscribe({
      next: () => { const d = this.dossier(); if (d) this.loadDelegation(d._id); },
      error: (err) => console.error('Error terminating delegation:', err)
    });
  }

  // Comments
  loadComments(entiteType: string, entiteId: string) {
    this.commentaireService.getComments(entiteType, entiteId).subscribe({
      next: (res) => this.comments.set(res),
      error: () => this.comments.set([])
    });
  }

  addComment() {
    const dossier = this.dossier();
    if (!dossier || !this.commentNew().trim()) return;
    this.commentaireService.createComment({
      entiteType: 'dossier',
      entiteId: dossier._id,
      contenu: this.commentNew()
    }).subscribe({
      next: () => {
        this.commentNew.set('');
        this.loadComments('dossier', dossier._id);
      },
      error: (err) => console.error('Error adding comment:', err)
    });
  }

  deleteComment(commentId: string) {
    const dossier = this.dossier();
    if (!dossier) return;
    this.commentaireService.deleteComment(commentId).subscribe({
      next: () => this.loadComments('dossier', dossier._id),
      error: (err) => console.error('Error deleting comment:', err)
    });
  }
}