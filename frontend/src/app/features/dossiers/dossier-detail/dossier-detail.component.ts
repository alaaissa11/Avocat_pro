import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../../core/services/dossier.service';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-dossier-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dossier-detail.component.html',
  styleUrls: ['./dossier-detail.component.css']
})
export class DossierDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dossierService = inject(DossierService);
  private clientService = inject(ClientService);

  dossier = signal<any>(null);
  client = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDossier(id);
    }
  }

  loadDossier(id: string) {
    this.dossierService.getDossierById(id).subscribe({
      next: (dossier) => {
        this.dossier.set(dossier);
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
}