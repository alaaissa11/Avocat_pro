import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { BehaviorSubject } from 'rxjs';

export interface MockClient {
  id: string;
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  cin?: string;
  matriculeFiscal?: string;
  type: 'particulier' | 'entreprise';
  profession?: string;
}

export interface MockDossier {
  id: string;
  numero: string;
  titre: string;
  description: string;
  clientId: string;
  clientName: string;
  typeAffaire: string;
  sousType: string;
  statut: string;
  priorite: number;
  assigneA: string;
  chargeEstimee: number;
  chargeConsommee: number;
  dateCreation: Date;
  dateAudience?: Date;
  numeroRG: string;
  juridiction: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private clientsSubject = new BehaviorSubject<MockClient[]>([]);
  private dossiersSubject = new BehaviorSubject<MockDossier[]>([]);

  clients$ = this.clientsSubject.asObservable();
  dossiers$ = this.dossiersSubject.asObservable();

  private frenchCities = [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Monastir', 'Bizerte', 'Gabès',
    'Ariana', 'Gafsa', 'La Marsa', 'Hammamet', 'Nabeul', 'Kélibia', 'Mahdia',
    'Kasserine', 'Tataouine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
  ];

  private frenchStreets = [
    'Rue de la Liberté', 'Avenue Habib Bourguiba', 'Rue Mohamed V',
    'Avenue Hedi Chaker', 'Rue Emile Zola', 'Place de la République',
    'Rue du 9 Avril', 'Avenue Farhat Hached', 'Rue Taieb Slimane',
    'Boulevard de l\'Environnement'
  ];

  private frenchLastNames = [
    'Ben Ali', 'Trabelsi', 'Khalil', 'Mabrouk', 'Chaouch', 'Ben Ammar',
    'Bouguerra', 'Ben Slimane', 'Karray', 'Boukadida', 'Ben Hassen',
    'Dakhlaoui', 'Zoghbi', 'Cherif', 'Saïd', 'Bouzaiene', 'Ghouma',
    'Riahi', 'Ben Khelil', 'Charfeddine'
  ];

  private frenchFirstNames = [
    'Mohamed', 'Sarra', 'Mehdi', 'Nour', 'Ahmed', 'Fatma', 'Ali',
    'Amira', 'Youssef', 'Ines', 'Hichem', 'Rania', 'Omar', 'Mona',
    'Karim', 'Leila', 'Anis', 'Samira', 'Tarek', 'Nadia'
  ];

  private frenchCompanyNames = [
    'Solutions Tech', 'Groupe Atlantique', 'Société Nord-Sud',
    'Tunisie Construction', 'Afriqua Services', 'Méditerranée Invest',
    'Union Commerciale', 'Expertise Finance', 'Innovation Plus',
    'Delta Corporation', 'Oméga Entreprises', 'Alpha Group'
  ];

  private frenchJobTitles = [
    'directeur', 'ingénieur', 'enseignant', 'comptable', 'médecin',
    'avocat', 'architecte', 'commerçant', 'technicien', 'fonctionnaire'
  ];

  private frenchDossierTitles = [
    'Affaire de divorce', 'Contentieux commercial', 'Litige locatif',
    'Procès pénal', 'Contrat de travail', 'Succession familiale',
    'Gestion de patrimoine', 'Réclamation d\'assurance', 'Contentieux bancaire',
    'Affaire immobilière', 'Licenciement abusif', 'Créance impayée',
    'Vice de forme', 'Dommage corporel', 'Escroquerie', 'Vol',
    'Diffamation', 'Harcèlement', 'Contestation d\'amende', 'Bail commercial'
  ];

  private frenchDescriptions = [
    'Affaire concernant un litige entre deux parties concernant le paiement d\'une dette.',
    'Dossier de contentieux relatif à une rupture contractuelle.',
    'Affaire traitant d\'un différend sur les limites de propriété.',
    'Contentieux lié à un accident de la circulation.',
    'Affaire de recouvrement de créance suite à un impayé.',
    'Dossier relatif à un conflit du travail.',
    'Affaire concernant une succession et le partage des biens.',
    'Contentieux sur les clauses d\'un contrat commercial.',
    'Affaire de dommages et intérêts suite à un préjudice.',
    'Dossier traitant d\'une infraction au Code de la route.'
  ];

  constructor() {
    this.generateAllData();
  }

  private generateAllData(): void {
    this.generateClients(20, 30);
    this.generateDossiers(50, 100);
  }

  private generateFrenchPhone(): string {
    const prefix = faker.helpers.arrayElement(['+216 2', '+216 5', '+216 9']);
    const number = faker.string.numeric(8);
    return `${prefix} ${number}`;
  }

  generateClients(min: number, max: number): MockClient[] {
    const count = faker.number.int({ min, max });
    const clients: MockClient[] = [];

    for (let i = 0; i < count; i++) {
      const isCompany = faker.datatype.boolean();
      const lastName = faker.helpers.arrayElement(this.frenchLastNames);
      const firstName = faker.helpers.arrayElement(this.frenchFirstNames);
      const companyName = faker.helpers.arrayElement(this.frenchCompanyNames);

      clients.push({
        id: faker.string.uuid(),
        nom: isCompany ? companyName : lastName,
        prenom: isCompany ? undefined : firstName,
        raisonSociale: isCompany ? companyName : undefined,
        email: isCompany
          ? `contact@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.tn`
          : faker.internet.email({ firstName, lastName }).toLowerCase(),
        telephone: this.generateFrenchPhone(),
        adresse: `${faker.number.int({ min: 1, max: 150 })} ${faker.helpers.arrayElement(this.frenchStreets)}`,
        ville: faker.helpers.arrayElement(this.frenchCities),
        codePostal: faker.string.numeric(4),
        pays: 'Tunisie',
        cin: isCompany ? undefined : faker.string.numeric(8),
        matriculeFiscal: isCompany ? `MT${faker.string.alphanumeric(5).toUpperCase()}` : undefined,
        type: isCompany ? 'entreprise' : 'particulier',
        profession: isCompany ? undefined : faker.helpers.arrayElement(this.frenchJobTitles)
      });
    }

    this.clientsSubject.next(clients);
    return clients;
  }

  generateDossiers(min: number, max: number): MockDossier[] {
    const count = faker.number.int({ min, max });
    const clients = this.clientsSubject.value;
    const dossiers: MockDossier[] = [];

    const typesAffaire = ['civil', 'penal', 'commercial', 'travail', 'famille', 'administratif', 'immobilier', 'bancaire', 'autre'];
    const statuts = ['nouveau', 'en_cours', 'en_attente', 'cloture', 'archive'];
    const juridictions = ['Tribunal de Première Instance', 'Tribunal de Grande Instance', 'Cour d\'Appel', 'Tribunal Administratif', 'Cour de Cassation'];

    for (let i = 0; i < count; i++) {
      const client = clients.length > 0 ? faker.helpers.arrayElement(clients) : null;

      dossiers.push({
        id: faker.string.uuid(),
        numero: `DOS-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}`,
        titre: faker.helpers.arrayElement(this.frenchDossierTitles),
        description: faker.helpers.arrayElement(this.frenchDescriptions),
        clientId: client?.id || '',
        clientName: client ? `${client.prenom || ''} ${client.nom}`.trim() : '',
        typeAffaire: faker.helpers.arrayElement(typesAffaire),
        sousType: faker.helpers.arrayElement(typesAffaire).toUpperCase(),
        statut: faker.helpers.arrayElement(statuts),
        priorite: faker.number.int({ min: 1, max: 5 }),
        assigneA: faker.string.uuid(),
        chargeEstimee: faker.number.int({ min: 10, max: 200 }),
        chargeConsommee: faker.number.int({ min: 0, max: 200 }),
        dateCreation: faker.date.past({ years: 3 }),
        dateAudience: faker.date.future({ years: 2 }),
        numeroRG: `RG-${faker.string.numeric(6)}`,
        juridiction: faker.helpers.arrayElement(juridictions)
      });
    }

    this.dossiersSubject.next(dossiers);
    return dossiers;
  }

  regenerateClients(min: number, max: number): void {
    this.generateClients(min, max);
  }

  regenerateDossiers(min: number, max: number): void {
    this.generateDossiers(min, max);
  }

  getClients(): MockClient[] {
    return this.clientsSubject.value;
  }

  getDossiers(): MockDossier[] {
    return this.dossiersSubject.value;
  }
}