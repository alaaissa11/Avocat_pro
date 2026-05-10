import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Calendrier</h1>
          <p class="text-slate-500 text-sm">Planification des audiences et échéances</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
            <button class="px-3 py-1 text-sm hover:bg-slate-100 rounded">Mois</button>
            <button class="px-3 py-1 text-sm bg-lawyer-primary text-white rounded">Semaine</button>
            <button class="px-3 py-1 text-sm hover:bg-slate-100 rounded">Jour</button>
          </div>
          <button class="btn-primary flex items-center gap-2">
            <span class="material-icons text-lg">add</span>
            Ajouter
          </button>
        </div>
      </div>

      <div class="card overflow-hidden p-0">
        <!-- Calendar Header -->
        <div class="grid grid-cols-7 bg-lawyer-primary text-white">
          @for (day of days; track day) {
            <div class="py-3 text-center text-sm font-medium">{{ day }}</div>
          }
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7">
          @for (hour of hours; track hour) {
            <div class="border border-slate-100 min-h-[80px] p-2 hover:bg-slate-50 transition-colors">
              @if (hour === 9) {
                <div class="bg-lawyer-primary/10 rounded p-1 mb-1">
                  <p class="text-xs font-medium text-lawyer-primary">Audience</p>
                  <p class="text-xs text-slate-500">DOS-2024-001</p>
                </div>
              }
              @if (hour === 11) {
                <div class="bg-amber-100 rounded p-1 mb-1">
                  <p class="text-xs font-medium text-amber-700">Réunion</p>
                  <p class="text-xs text-slate-500">Équipe</p>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-6 mt-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 bg-lawyer-primary rounded"></span>
          <span class="text-sm text-slate-600">Audience</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 bg-amber-400 rounded"></span>
          <span class="text-sm text-slate-600">Réunion</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 bg-green-500 rounded"></span>
          <span class="text-sm text-slate-600">Échéance</span>
        </div>
      </div>
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class CalendarComponent {
  days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  hours = Array.from({ length: 24 }, (_, i) => i);
}