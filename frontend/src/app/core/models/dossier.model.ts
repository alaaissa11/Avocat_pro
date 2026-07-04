export type TypeAffaire = 'civil' | 'penal' | 'commercial' | 'travail' | 'famille' | 'administratif' | 'immobilier' | 'bancaire' | 'autre';

export type StatutDossier = 'nouveau' | 'en_cours' | 'en_attente' | 'cloture' | 'archive';

export interface Adversary {
  nom?: string;
  avocat?: string;
  email?: string;
}

export interface IAPrediction {
  categorieSuggeree?: string;
  confiance?: number;
  datePrediction?: Date;
  dureeSuggeree?: number;
  dureeConfiance?: number;
  probabiliteSuccess?: number;
  avocatRecommandeId?: string;
  avocatRecommandeNom?: string;
  documentsSuggernes?: string[];
  planningSuggere?: {
    etapes: Array<{ etape: string; delai: number; ordre: number }>;
    dureeTotale?: number;
  };
}

export interface HistoriqueItem {
  action: string;
  userId?: { _id: string; nom: string; prenom: string };
  date: Date;
  details?: string;
  previousValue?: any;
  newValue?: any;
}

export interface Dossier {
  _id: string;
  numero: string;
  titre: string;
  description?: string;
  clientId: { _id: string; nom: string; prenom?: string } | string;
  typeAffaire: TypeAffaire;
  sousType?: string;
  statut: StatutDossier;
  priorite: number;
  assigneA?: { _id: string; nom: string; prenom?: string } | string | null;
  collaboreurs?: Array<{ _id: string; nom: string; prenom: string }>;
  chargeEstimee: number;
  chargeConsommee: number;
  dateCreation: Date;
  dateAudience?: Date;
  dateCloture?: Date;
  numeroRG?: string;
  numeroDecision?: string;
  juridiction?: string;
  adversary?: Adversary;
  iaPrediction?: IAPrediction;
  historique: HistoriqueItem[];
  createdBy?: { _id: string; nom: string; prenom: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface DossierResponse {
  dossiers: Dossier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DossierStats {
  total: number;
  nouveau: number;
  enCours: number;
  cloture: number;
  byType: Array<{ _id: string; count: number }>;
  byMonth: Array<{ _id: string; count: number }>;
}