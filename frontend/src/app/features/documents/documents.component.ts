import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, Document } from '../../core/services/document.service';
import { DossierService } from '../../core/services/dossier.service';
import { Dossier } from '../../core/models/dossier.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Documents</h1>
          <p class="text-slate-500 text-sm">Gestion documentaire des dossiers</p>
        </div>
        <button (click)="openUploadModal()" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-lg">upload_file</span>
          Uploader
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            class="input-field"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          >
        </div>
        <select class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 8px 36px 8px 12px; font-size: 13px; font-weight: 500; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 10px center/18px; appearance: none; -webkit-appearance: none;" [(ngModel)]="selectedDossier" (change)="loadDocuments()">
          <option value="">Tous les dossiers</option>
          @for (dossier of dossiers(); track dossier._id) {
            <option [value]="dossier._id">{{ dossier.numero }} - {{ dossier.titre }}</option>
          }
        </select>
        <select class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 8px 36px 8px 12px; font-size: 13px; font-weight: 500; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 10px center/18px; appearance: none; -webkit-appearance: none;" [(ngModel)]="selectedType" (change)="loadDocuments()">
          <option value="">Tous les types</option>
          <option value="contrat">Contrat</option>
          <option value="plainte">Plainte</option>
          <option value="facture">Facture</option>
          <option value="pouvoir">Pouvoir</option>
          <option value="jugement">Jugement</option>
          <option value="correspondance">Correspondance</option>
          <option value="autre">Autre</option>
        </select>
        <select class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 8px 36px 8px 12px; font-size: 13px; font-weight: 500; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 10px center/18px; appearance: none; -webkit-appearance: none;" [(ngModel)]="sortBy" (change)="loadDocuments()">
          <option value="date_desc">Plus récent</option>
          <option value="date_asc">Plus ancien</option>
          <option value="name">Nom</option>
        </select>
      </div>

      <div class="card overflow-x-auto p-0">
        @if (loading()) {
          <div class="p-8 text-center">
            <span class="material-icons text-4xl text-slate-300 animate-spin block mb-2">refresh</span>
            Chargement...
          </div>
        } @else {
          <table class="w-full min-w-[700px]">
            <thead class="bg-slate-50">
              <tr>
                <th class="table-header">Nom</th>
                <th class="table-header">Dossier</th>
                <th class="table-header">Type</th>
                <th class="table-header">Taille</th>
                <th class="table-header">Date</th>
                <th class="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (doc of documents(); track doc._id) {
                <tr class="table-row-hover">
                  <td class="table-cell">
                    <div class="flex items-center gap-3">
                      <span class="material-icons" [ngClass]="getFileIconClass(doc.mimeType)">
                        {{ getFileIcon(doc.mimeType) }}
                      </span>
                      <div>
                        <span class="font-medium text-lawyer-dark">{{ doc.nom }}</span>
                        @if (doc.description) {
                          <p class="text-xs text-slate-500">{{ doc.description }}</p>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="table-cell text-slate-600">
                    @if (doc.dossierId) {
                      <span class="badge badge-info">{{ doc.dossierId.numero }}</span>
                    } @else {
                      <span class="text-slate-400">-</span>
                    }
                  </td>
                  <td class="table-cell">
                    <span class="badge" [ngClass]="getTypeBadgeClass(doc.type)">{{ getTypeLabel(doc.type) }}</span>
                  </td>
                  <td class="table-cell text-slate-500">{{ formatFileSize(doc.taille) }}</td>
                  <td class="table-cell text-slate-500">{{ doc.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="table-cell text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="downloadDocument(doc)" class="p-2 text-slate-400 hover:text-lawyer-primary hover:bg-slate-100 rounded" title="Télécharger">
                        <span class="material-icons text-sm">download</span>
                      </button>
                      <button (click)="confirmDelete(doc)" class="p-2 text-slate-400 hover:text-lawyer-danger hover:bg-slate-100 rounded" title="Supprimer">
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-500">
                    <span class="material-icons text-4xl text-slate-300 block mb-2">folder_open</span>
                    Aucun document trouvé
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Pagination -->
      @if (totalDocuments() > 0) {
        <div class="flex items-center justify-between mt-4">
          <p class="text-sm text-slate-500">
            Affichage de {{ paginationStart() }} à {{ paginationEnd() }} sur {{ totalDocuments() }} documents
          </p>
          <div class="flex gap-2">
            <button 
              class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" 
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              Précédent
            </button>
            @for (page of getPageNumbers(); track page) {
              <button 
                class="px-3 py-1 rounded hover:bg-slate-50"
                [ngClass]="page === currentPage() ? 'bg-lawyer-primary text-white' : 'border border-slate-200'"
                (click)="goToPage(page)"
              >
                {{ page }}
              </button>
            }
            <button 
              class="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
              [disabled]="currentPage() >= totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      }

      <!-- Upload Modal -->
      @if (showUploadModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeUploadModal()">
          <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-scale-in" (click)="$event.stopPropagation()">
            <!-- Header with gradient -->
            <div class="bg-gradient-to-r from-lawyer-primary to-lawyer-dark px-4 py-3 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-white">upload_file</span>
                  <h3 class="text-base font-bold text-white">Uploader un document</h3>
                </div>
                <button (click)="closeUploadModal()" class="text-white/80 hover:text-white p-1">
                  <span class="material-icons text-lg">close</span>
                </button>
              </div>
            </div>

            <form (ngSubmit)="uploadDocument()" class="p-4 space-y-3 overflow-y-auto flex-1">
              <!-- File Drop Zone -->
              <div 
                class="relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300 group"
                [ngClass]="selectedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-slate-300 hover:border-lawyer-primary hover:bg-slate-50'"
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event)"
              >
                <input 
                  #fileInput
                  type="file" 
                  class="hidden" 
                  (change)="onFileSelected($event)"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                >
                @if (selectedFile) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="material-icons text-xl text-green-600">description</span>
                    </div>
                    <div class="text-left flex-1 min-w-0">
                      <p class="font-medium text-lawyer-dark text-sm truncate">{{ selectedFile.name }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">{{ getFileExtension(selectedFile.name) }}</span>
                        <span class="text-xs text-slate-500">{{ formatFileSize(selectedFile.size) }}</span>
                      </div>
                    </div>
                    <button type="button" (click)="selectedFile = null; $event.stopPropagation()" class="text-red-500 hover:text-red-600 flex-shrink-0">
                      <span class="material-icons text-sm">close</span>
                    </button>
                  </div>
                } @else {
                  <div class="flex flex-col items-center py-2">
                    <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-lawyer-primary/10 transition-colors">
                      <span class="material-icons text-xl text-slate-400 group-hover:text-lawyer-primary transition-colors">cloud_upload</span>
                    </div>
                    <p class="text-sm text-slate-600">Glissez ou cliquez</p>
                    <div class="flex items-center gap-1 mt-2">
                      <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">PDF</span>
                      <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">DOC</span>
                      <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">IMG</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Dossier Selection -->
              <div>
                <label class="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                  <span class="material-icons text-lawyer-primary text-xs">folder</span>
                  Dossier
                </label>
                <select 
                  [(ngModel)]="uploadData.dossierId" 
                  name="dossierId" 
                  class="select-field"
                >
                  <option value="">Sélectionner un dossier...</option>
                  @for (dossier of dossiers(); track dossier._id) {
                    <option [value]="dossier._id">{{ dossier.numero }} - {{ dossier.titre }}</option>
                  }
                </select>
              </div>

              <!-- Type -->
              <div>
                <label class="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                  <span class="material-icons text-lawyer-primary text-xs">category</span>
                  Type de document
                </label>
                <select 
                  [(ngModel)]="uploadData.type" 
                  name="type" 
                  class="select-field"
                >
                  <option value="contrat">📄 Contrat</option>
                  <option value="plainte">⚖️ Plainte</option>
                  <option value="facture">💰 Facture</option>
                  <option value="pouvoir">✍️ Pouvoir</option>
                  <option value="jugement">⚖️ Jugement</option>
                  <option value="correspondance">📨 Correspondance</option>
                  <option value="autre">📁 Autre</option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                  <span class="material-icons text-lawyer-primary text-xs">notes</span>
                  Description (optionnel)
                </label>
                <textarea 
                  [(ngModel)]="uploadData.description" 
                  name="description" 
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lawyer-primary/20 focus:border-lawyer-primary transition-all resize-none" 
                  rows="2"
                  placeholder="Ajoutez une description..."
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 pt-2 flex-shrink-0 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  (click)="closeUploadModal()" 
                  class="flex-1 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="flex-1 px-3 py-2 bg-gradient-to-r from-lawyer-primary to-lawyer-dark text-white rounded-lg hover:opacity-90 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  [disabled]="!selectedFile || uploading()"
                >
                  @if (uploading()) {
                    <span class="material-icons text-sm animate-spin">refresh</span>
                    <span>Upload...</span>
                  } @else {
                    <span class="material-icons text-sm">cloud_upload</span>
                    <span>Uploader</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (documentToDelete()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" (click)="cancelDelete()">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-in" (click)="$event.stopPropagation()">
            <div class="text-center">
              <span class="material-icons text-4xl text-red-500 mb-3">warning</span>
              <h3 class="text-lg font-semibold text-lawyer-dark mb-2">Confirmer la suppression</h3>
              <p class="text-slate-600">Êtes-vous sûr de vouloir supprimer le document "{{ documentToDelete()?.nom }}" ?</p>
            </div>
            <div class="flex gap-3 mt-6">
              <button (click)="cancelDelete()" class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                Annuler
              </button>
              <button (click)="deleteDocument()" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class DocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);
  private dossierService = inject(DossierService);

  documents = signal<Document[]>([]);
  dossiers = signal<Dossier[]>([]);
  loading = signal(true);
  uploading = signal(false);

  searchQuery = '';
  selectedDossier = '';
  selectedType = '';
  sortBy = 'date_desc';

  currentPage = signal(1);
  limit = 10;
  totalDocuments = signal(0);
  totalPages = signal(1);
  paginationStart = signal(1);
  paginationEnd = signal(10);

  showUploadModal = signal(false);
  selectedFile: File | null = null;
  uploadData = {
    dossierId: '',
    type: 'autre',
    description: ''
  };

  documentToDelete = signal<Document | null>(null);

  ngOnInit() {
    this.loadDossiers();
    this.loadDocuments();
  }

  loadDossiers() {
    this.dossierService.getDossiers({ limit: 100 }).subscribe({
      next: (response) => this.dossiers.set(response.dossiers),
      error: (err) => console.error('Error loading dossiers:', err)
    });
  }

  loadDocuments() {
    this.loading.set(true);
    const params: any = {
      page: this.currentPage(),
      limit: this.limit
    };
    
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedDossier) params.dossierId = this.selectedDossier;
    if (this.selectedType) params.type = this.selectedType;

    this.documentService.getDocuments(params).subscribe({
      next: (response) => {
        this.documents.set(response.documents);
        this.totalDocuments.set(response.pagination.total);
        this.totalPages.set(response.pagination.pages);
        this.updatePagination();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.loading.set(false);
      }
    });
  }

  updatePagination() {
    const page = this.currentPage();
    this.paginationStart.set((page - 1) * this.limit + 1);
    this.paginationEnd.set(Math.min(page * this.limit, this.totalDocuments()));
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.currentPage();
    const total = this.totalPages();
    
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDocuments();
    }
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadDocuments();
  }

  openUploadModal() {
    this.selectedFile = null;
    this.uploadData = { dossierId: '', type: 'autre', description: '' };
    this.showUploadModal.set(true);
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  uploadDocument() {
    if (!this.selectedFile) return;

    this.uploading.set(true);
    this.documentService.uploadDocument(this.selectedFile, {
      dossierId: this.uploadData.dossierId || undefined,
      type: this.uploadData.type,
      description: this.uploadData.description || undefined
    }).subscribe({
      next: () => {
        this.uploading.set(false);
        this.closeUploadModal();
        this.loadDocuments();
      },
      error: (err) => {
        this.uploading.set(false);
        console.error('Error uploading document:', err);
      }
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

  confirmDelete(doc: Document) {
    this.documentToDelete.set(doc);
  }

  cancelDelete() {
    this.documentToDelete.set(null);
  }

  deleteDocument() {
    const doc = this.documentToDelete();
    if (!doc) return;

    this.documentService.deleteDocument(doc._id).subscribe({
      next: () => {
        this.cancelDelete();
        this.loadDocuments();
      },
      error: (err) => console.error('Error deleting:', err)
    });
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart';
    if (mimeType.includes('image')) return 'image';
    return 'insert_drive_file';
  }

  getFileIconClass(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'text-red-500';
    if (mimeType.includes('word')) return 'text-blue-500';
    if (mimeType.includes('excel')) return 'text-green-500';
    if (mimeType.includes('image')) return 'text-purple-500';
    return 'text-slate-400';
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      contrat: 'bg-blue-100 text-blue-700',
      plainte: 'bg-red-100 text-red-700',
      facture: 'bg-green-100 text-green-700',
      pouvoir: 'bg-purple-100 text-purple-700',
      jugement: 'bg-amber-100 text-amber-700',
      correspondance: 'bg-slate-100 text-slate-700',
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
      correspondance: 'Correspondance',
      autre: 'Autre'
    };
    return labels[type] || 'Autre';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || '';
  }
}