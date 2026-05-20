import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Keyword {
  word: string;
  weight: number;
  category: string;
}

export interface SimilarDossier {
  id: string;
  numero: string;
  titre: string;
  similarite: number;
  dateCloture: Date;
}

export interface PredictionDuration {
  jours: number;
  mois: number;
  confiance: number;
  baseHistorique: number;
  breakdown?: {
    moyenne: number;
    priorite: number;
    ajustement: number;
  };
}

export interface PredictionSuccess {
  taux: number;
  confiance: number;
  total: number;
  favorables: number;
  defavorables: number;
}

export interface LawyerRecommendation {
  recommandation: {
    id: string;
    nom: string;
    prenom: string;
    tauxSucces: number;
    experiencia: string;
  };
  alternatives: Array<{
    id: string;
    nom: string;
    prenom: string;
    tauxSucces: number;
  }>;
  confiance: number;
}

export interface SuggestedDocument {
  nom: string;
  frequence: number;
  priorite: string;
  obligatoire: boolean;
}

export interface PlanningStep {
  etape: string;
  delai: number;
  ordre: number;
  priorite: string;
  suggestions: string;
  deadline: string;
}

export interface PlanningSuggestion {
  etapes: PlanningStep[];
  dureeTotale: number;
  priorite: number;
  conseils: string[];
}

export interface AIPrediction {
  timestamp: Date;
  motsCles: Keyword[];
  categorie: {
    suggeree: string;
    confiance: number;
    alternatives: string[];
  };
  similarDossiers: SimilarDossier[];
  duree: PredictionDuration;
  probabiliteSuccess: PredictionSuccess;
  avocatRecommande: LawyerRecommendation;
  documentsSuggeres: SuggestedDocument[];
  planningSugere: PlanningSuggestion;
  metadonnéesApprentissage: {
    version: string;
    algorithme: string;
    dateEntrainement: Date;
    totalDossiersAnalyses: number;
    scoreSimilariteMoyen: number;
  };
}

export interface FeedbackData {
  predictionsRecues: boolean;
  suggestionDureeAcceptee?: boolean;
  suggestionSuccessAcceptee?: boolean;
  suggestionAvocatAcceptee?: boolean;
  suggestionDocumentsAcceptee?: boolean;
  suggestionPlanningAcceptee?: boolean;
  commentaires?: string;
  accuracyDuree?: number;
  accuracySuccess?: number;
}

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/ia';

  predictDossier(data: {
    titre: string;
    description: string;
    typeAffaire?: string;
    priorite?: number;
  }): Observable<{ success: boolean; data: AIPrediction }> {
    return this.http.post<{ success: boolean; data: AIPrediction }>(
      `${this.apiUrl}/predict`,
      data
    );
  }

  analyzeText(text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze`, { text });
  }

  submitFeedback(
    predictionId: string,
    dossierId: string,
    feedback: FeedbackData
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback`, {
      predictionId,
      dossierId,
      ...feedback
    });
  }

  getPlanningTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/planning-types`);
  }
}