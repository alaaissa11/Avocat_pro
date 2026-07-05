import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DossierService } from '../../../core/services/dossier.service';
import { ClientService, Client } from '../../../core/services/client.service';
import { IaService, AIPrediction, FeedbackData } from '../../../core/services/ia.service';
import { UserService, User } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { TypeAffaire } from '../../../core/models/dossier.model';
import { ClientCreateComponent } from '../../clients/client-create/client-create.component';
import { EventEmitter, Output } from '@angular/core';

interface ClientSearchResult {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-dossier-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClientCreateComponent],
  templateUrl: './dossier-create.component.html',
  styleUrls: ['./dossier-create.component.css']
})
export class DossierCreateComponent implements OnInit {
  private dossierService = inject(DossierService);
  private clientService = inject(ClientService);
  private iaService = inject(IaService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  availableAvocats = signal<User[]>([]);
  selectedAvocatId = signal<string>('');
  searchClient = '';
  selectedClient = signal<Client | null>(null);
  searchResults = signal<Client[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  showCreateClientModal = signal(false);
  @Output() clientCreated = new EventEmitter<Client>();

  showTimePicker = signal(false);
  timePickerType = signal<'debut' | 'fin'>('debut');
  selectedHourValue = '09';
  selectedMinuteValue = '00';

  hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  minutes = ['00', '15', '30', '45'];

  showIAPredictions = signal(false);
  iaPrediction = signal<AIPrediction | null>(null);
  iaLoading = signal(false);
  iaError = signal<string | null>(null);
  predictionId = signal<string>('');

  acceptedSuggestions = signal<{
    duree: boolean;
    success: boolean;
    avocat: boolean;
    documents: boolean;
    planning: boolean;
  }>({
    duree: false,
    success: false,
    avocat: false,
    documents: false,
    planning: false
  });

  dossier = {
    titre: '',
    description: '',
    typeAffaire: '' as TypeAffaire | '',
    sousType: '',
    priorite: 3,
    dateAudience: '',
    heureDebut: '',
    heureFin: '',
    juridiction: '',
    assigneA: '',
    adversary: {
      nom: '',
      avocat: '',
      email: ''
    }
  };

  typeAffaires: {code: TypeAffaire; label: string}[] = [
    { code: 'civil', label: 'Civil' },
    { code: 'penal', label: 'Pénal' },
    { code: 'commercial', label: 'Commercial' },
    { code: 'travail', label: 'Travail' },
    { code: 'famille', label: 'Famille' },
    { code: 'administratif', label: 'Administratif' },
    { code: 'immobilier', label: 'Immobilier' },
    { code: 'bancaire', label: 'Bancaire' },
    { code: 'autre', label: 'Autre' }
  ];

  priorities = [
    { value: 1, label: 'Haute', icon: 'arrow_upward', iconClass: 'text-red-500', bgClass: 'bg-red-50 hover:border-red-200' },
    { value: 2, label: 'Moyenne-Haute', icon: 'arrow_upward', iconClass: 'text-orange-500', bgClass: 'bg-orange-50 hover:border-orange-200' },
    { value: 3, label: 'Moyenne', icon: 'remove', iconClass: 'text-amber-500', bgClass: 'bg-amber-50 hover:border-amber-200' },
    { value: 4, label: 'Moyenne-Basse', icon: 'arrow_downward', iconClass: 'text-lime-500', bgClass: 'bg-lime-50 hover:border-lime-200' },
    { value: 5, label: 'Basse', icon: 'arrow_downward', iconClass: 'text-green-500', bgClass: 'bg-green-50 hover:border-green-200' }
  ];

  ngOnInit() {
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) {
      this.clientService.getClientById(clientId).subscribe({
        next: (client) => {
          this.selectedClient.set(client);
        },
        error: (err) => console.error('Error loading client:', err)
      });
    }

    this.userService.getUsers().subscribe({
      next: (users) => {
        const currentUser = this.authService.currentUser();
        if (currentUser?.role === 'admin') {
          this.availableAvocats.set(users.filter(u => u.role === 'avocat'));
        } else if (currentUser?.role === 'avocat') {
          const userFromList = users.find(u => u._id === currentUser.id);
          if (userFromList) {
            this.availableAvocats.set([userFromList]);
            this.selectedAvocatId.set(userFromList._id);
          }
        }
      },
      error: (err) => console.error('Error loading avocats:', err)
    });
  }

  onClientSearch() {
    if (this.searchClient.length > 2) {
      this.clientService.getClients({ search: this.searchClient, limit: 10 }).subscribe({
        next: (response) => this.searchResults.set(response.clients),
        error: (err) => console.error('Error searching clients:', err)
      });
    } else {
      this.searchResults.set([]);
    }
  }

  selectClient(client: Client) {
    this.selectedClient.set(client);
    this.searchClient = '';
    this.searchResults.set([]);
  }

  clearClient() {
    this.selectedClient.set(null);
    this.searchClient = '';
  }

  createNewClient() {
    this.showCreateClientModal.set(true);
  }

  closeCreateClientModal() {
    this.showCreateClientModal.set(false);
  }

  onClientCreated(client: Client) {
    this.selectClient(client);
    this.showCreateClientModal.set(false);
  }

  isFormValid(): boolean {
    const validTypes = ['civil', 'penal', 'commercial', 'travail', 'famille', 'administratif', 'immobilier', 'bancaire', 'autre'];
    return !!(
      this.selectedClient() &&
      this.dossier.titre &&
      this.dossier.typeAffaire &&
      validTypes.includes(this.dossier.typeAffaire)
    );
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.error.set(null);

    const dossierData: any = {
      titre: this.dossier.titre,
      description: this.dossier.description,
      typeAffaire: this.dossier.typeAffaire,
      sousType: this.dossier.sousType,
      priorite: this.dossier.priorite,
      juridiction: this.dossier.juridiction,
      adversary: this.dossier.adversary,
      clientId: this.selectedClient()?._id,
      assigneA: this.selectedAvocatId() || undefined,
      dateAudience: this.dossier.dateAudience ? this.formatDateWithTime(this.dossier.dateAudience, this.dossier.heureDebut, this.dossier.heureFin) : undefined
    };

    this.dossierService.createDossier(dossierData).subscribe({
      next: (created) => {
        this.loading.set(false);
        this.router.navigate(['/dossiers', created._id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de la création du dossier');
      }
    });
  }

  formatDateWithTime(date: string, heureDebut: string, heureFin: string): string {
    const dateObj = new Date(date);
    let dateTime: Date;
    
    if (heureDebut) {
      const [hours, minutes] = heureDebut.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    dateTime = new Date(dateObj);
    return dateTime.toISOString();
  }

  openTimePicker(type: 'debut' | 'fin') {
    this.timePickerType.set(type);
    if (type === 'debut' && this.dossier.heureDebut) {
      const [h, m] = this.dossier.heureDebut.split(':');
      this.selectedHourValue = h;
      this.selectedMinuteValue = m;
    } else if (type === 'fin' && this.dossier.heureFin) {
      const [h, m] = this.dossier.heureFin.split(':');
      this.selectedHourValue = h;
      this.selectedMinuteValue = m;
    } else {
      this.selectedHourValue = '09';
      this.selectedMinuteValue = '00';
    }
    this.showTimePicker.set(true);
  }

  closeTimePicker() {
    this.showTimePicker.set(false);
  }

  confirmTime() {
    const time = `${this.selectedHourValue}:${this.selectedMinuteValue}`;
    if (this.timePickerType() === 'debut') {
      this.dossier.heureDebut = time;
      if (!this.dossier.heureFin) {
        const hour = parseInt(this.selectedHourValue) + 1;
        this.dossier.heureFin = `${hour.toString().padStart(2, '0')}:${this.selectedMinuteValue}`;
      }
    } else {
      this.dossier.heureFin = time;
    }
    this.closeTimePicker();
  }

  getIaPredictions() {
    if (!this.dossier.titre || !this.dossier.description) {
      this.iaError.set('Veuillez entrer un titre et une description pour l\'analyse IA');
      return;
    }

    this.iaLoading.set(true);
    this.iaError.set(null);

    this.iaService.predictDossier({
      titre: this.dossier.titre,
      description: this.dossier.description,
      typeAffaire: this.dossier.typeAffaire as string,
      priorite: this.dossier.priorite
    }).subscribe({
      next: (response) => {
        this.iaLoading.set(false);
        this.iaPrediction.set(response.data);
        this.showIAPredictions.set(true);
        this.predictionId.set(`pred_${Date.now()}`);
        this.acceptedSuggestions.set({
          duree: false,
          success: false,
          avocat: false,
          documents: false,
          planning: false
        });
      },
      error: (err) => {
        this.iaLoading.set(false);
        this.iaError.set(err.error?.message || 'Erreur lors de l\'analyse IA');
      }
    });
  }

  applySuggestion(type: 'duree' | 'success' | 'avocat' | 'documents' | 'planning') {
    const current = this.acceptedSuggestions();
    this.acceptedSuggestions.set({ ...current, [type]: true });
  }

  toggleIAPanel() {
    this.showIAPredictions.set(!this.showIAPredictions());
  }

  closeIAPanel() {
    this.showIAPredictions.set(false);
  }

  submitWithFeedback() {
    const prediction = this.iaPrediction();
    const accepted = this.acceptedSuggestions();

    if (prediction && this.selectedClient() && this.dossier.titre && this.dossier.typeAffaire) {
      this.loading.set(true);
      this.error.set(null);

      const dossierData: any = {
        titre: this.dossier.titre,
        description: this.dossier.description,
        typeAffaire: this.dossier.typeAffaire,
        sousType: this.dossier.sousType,
        priorite: this.dossier.priorite,
        juridiction: this.dossier.juridiction,
        adversary: this.dossier.adversary,
        clientId: this.selectedClient()?._id,
      assigneA: this.selectedAvocatId() || undefined,
        dateAudience: this.dossier.dateAudience ? this.formatDateWithTime(this.dossier.dateAudience, this.dossier.heureDebut, this.dossier.heureFin) : undefined,
        iaPrediction: {
          categorieSuggeree: prediction.categorie?.suggeree,
          confiance: prediction.categorie?.confiance,
          datePrediction: prediction.timestamp,
          dureeSuggeree: prediction.duree?.jours,
          dureeConfiance: prediction.duree?.confiance,
          probabiliteSuccess: prediction.probabiliteSuccess?.taux,
          avocatRecommandeId: prediction.avocatRecommande?.recommandation?.id,
          avocatRecommandeNom: prediction.avocatRecommande?.recommandation ? 
            `${prediction.avocatRecommande.recommandation.nom} ${prediction.avocatRecommande.recommandation.prenom}` : null,
          documentsSuggernes: prediction.documentsSuggeres?.map(d => d.nom),
          planningSugere: prediction.planningSugere
        },
        iaFeedback: {
          predictionsRecues: true,
          suggestionDureeAcceptee: accepted.duree,
          suggestionSuccessAcceptee: accepted.success,
          suggestionAvocatAcceptee: accepted.avocat,
          suggestionDocumentsAcceptee: accepted.documents,
          suggestionPlanningAcceptee: accepted.planning,
          dateFeedback: new Date()
        }
      };

      this.dossierService.createDossier(dossierData).subscribe({
        next: (created) => {
          if (this.predictionId()) {
            const feedback: FeedbackData = {
              predictionsRecues: true,
              suggestionDureeAcceptee: accepted.duree,
              suggestionSuccessAcceptee: accepted.success,
              suggestionAvocatAcceptee: accepted.avocat,
              suggestionDocumentsAcceptee: accepted.documents,
              suggestionPlanningAcceptee: accepted.planning
            };
            this.iaService.submitFeedback(this.predictionId(), created._id, feedback).subscribe();
          }
          this.loading.set(false);
          this.router.navigate(['/dossiers', created._id]);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Erreur lors de la création du dossier');
        }
      });
    }
  }
}