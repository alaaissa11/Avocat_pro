import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Documents</h1>
          <p class="text-slate-500 text-sm">Gestion documentaire des dossiers</p>
        </div>
        <button class="btn-primary flex items-center gap-2">
          <span class="material-icons text-lg">upload_file</span>
          Uploader
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <input type="text" placeholder="Rechercher..." class="input-field">
        </div>
        <select class="select-field">
          <option value="">Tous les dossiers</option>
          <option value="1">DOS-2024-001</option>
          <option value="2">DOS-2024-002</option>
        </select>
        <select class="select-field">
          <option value="">Tous les types</option>
          <option value="pdf">PDF</option>
          <option value="doc">Word</option>
          <option value="image">Image</option>
        </select>
        <select class="select-field">
          <option value="">Plus récent</option>
          <option value="old">Plus ancien</option>
          <option value="name">Nom</option>
        </select>
      </div>

      <div class="card overflow-hidden p-0">
        <table class="w-full">
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
            @for (doc of documents(); track doc.id) {
              <tr class="table-row-hover">
                <td class="table-cell">
                  <div class="flex items-center gap-3">
                    <span class="material-icons" [ngClass]="getFileIconClass(doc.type)">{{ getFileIcon(doc.type) }}</span>
                    <span class="font-medium text-lawyer-dark">{{ doc.nom }}</span>
                  </div>
                </td>
                <td class="table-cell text-slate-600">{{ doc.dossier }}</td>
                <td class="table-cell">
                  <span class="badge badge-info">{{ doc.type }}</span>
                </td>
                <td class="table-cell text-slate-500">{{ doc.taille }}</td>
                <td class="table-cell text-slate-500">{{ doc.date }}</td>
                <td class="table-cell text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button class="p-2 text-slate-400 hover:text-lawyer-primary hover:bg-slate-100 rounded">
                      <span class="material-icons text-sm">download</span>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-lawyer-accent hover:bg-slate-100 rounded">
                      <span class="material-icons text-sm">visibility</span>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-lawyer-danger hover:bg-slate-100 rounded">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class DocumentsComponent {
  documents = signal([
    { id: 1, nom: 'Plainte-001.pdf', dossier: 'DOS-2024-001', type: 'PDF', taille: '2.4 MB', date: '15/01/2024' },
    { id: 2, nom: 'Contrat-ABC.docx', dossier: 'DOS-2024-002', type: 'DOCX', taille: '156 KB', date: '14/01/2024' },
    { id: 3, nom: 'Pouvoir-Signature.pdf', dossier: 'DOS-2024-001', type: 'PDF', taille: '89 KB', date: '12/01/2024' },
    { id: 4, nom: 'Facture-012.pdf', dossier: 'DOS-2024-003', type: 'PDF', taille: '1.2 MB', date: '10/01/2024' },
  ]);

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      'PDF': 'picture_as_pdf',
      'DOCX': 'description',
      'DOC': 'description',
      'XLS': 'table_chart',
      'IMAGE': 'image'
    };
    return icons[type] || 'insert_drive_file';
  }

  getFileIconClass(type: string): string {
    const classes: Record<string, string> = {
      'PDF': 'text-red-500',
      'DOCX': 'text-blue-500',
      'DOC': 'text-blue-500',
      'XLS': 'text-green-500',
      'IMAGE': 'text-purple-500'
    };
    return classes[type] || 'text-slate-400';
  }
}