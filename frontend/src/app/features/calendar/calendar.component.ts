import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CalendrierService, CalendrierEvent } from '../../core/services/calendrier.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEventItem[];
}

interface CalendarEventItem {
  id: string;
  titre: string;
  type: string;
  heure: string;
  color: string;
  dossierId?: string;
  dateDebut?: Date | string;
  dateFin?: Date | string;
  lieu?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Calendrier</h1>
          <p class="text-slate-500 text-sm">Planification des audiences et échéances</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- View Toggle -->
          <div class="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
            <button 
              (click)="setView('month')"
              class="px-3 py-1.5 text-sm rounded transition-all"
              [ngClass]="currentView() === 'month' ? 'bg-lawyer-primary text-white' : 'hover:bg-slate-100 text-slate-600'"
            >
              Mois
            </button>
            <button 
              (click)="setView('week')"
              class="px-3 py-1.5 text-sm rounded transition-all"
              [ngClass]="currentView() === 'week' ? 'bg-lawyer-primary text-white' : 'hover:bg-slate-100 text-slate-600'"
            >
              Semaine
            </button>
            <button 
              (click)="setView('day')"
              class="px-3 py-1.5 text-sm rounded transition-all"
              [ngClass]="currentView() === 'day' ? 'bg-lawyer-primary text-white' : 'hover:bg-slate-100 text-slate-600'"
            >
              Jour
            </button>
          </div>
          <button (click)="openCreateModal()" class="btn-primary flex items-center gap-2">
            <span class="material-icons text-lg">add</span>
            Ajouter
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="card mb-3 py-2">
        <div class="flex items-center justify-between">
          <button (click)="previous()" class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <span class="material-icons text-sm">chevron_left</span>
          </button>
          <h2 class="text-base font-semibold text-lawyer-dark">
            @switch (currentView()) {
              @case ('month') { {{ getMonthYear() }} }
              @case ('week') { {{ getWeekRange() }} }
              @case ('day') { {{ getDayDate() }} }
            }
          </h2>
          <button (click)="next()" class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <span class="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Calendar Grid - Month View -->
      @if (currentView() === 'month') {
        <div class="card overflow-hidden p-0">
          <!-- Days Header -->
          <div class="grid grid-cols-7 bg-lawyer-primary text-white">
            @for (day of weekDays; track day) {
              <div class="py-2 text-center text-xs font-medium">{{ day }}</div>
            }
          </div>
          <!-- Calendar Days -->
          <div class="grid grid-cols-7">
            @for (day of calendarDays(); track day.date) {
              <div 
                class="border border-slate-100 min-h-[90px] p-1.5 transition-colors cursor-pointer hover:bg-slate-50 text-xs"
                [ngClass]="{'bg-blue-50': day.isToday, 'opacity-50': !day.isCurrentMonth}"
                (click)="selectDay(day)"
              >
                <div class="flex items-center justify-between mb-0.5">
                  <span 
                    class="text-xs font-medium"
                    [ngClass]="day.isToday ? 'text-lawyer-primary' : 'text-slate-700'"
                  >
                    {{ day.date.getDate() }}
                  </span>
                  @if (day.events.length > 0) {
                    <span class="text-[10px] bg-lawyer-primary text-white px-1 py-0 rounded-full">
                      {{ day.events.length }}
                    </span>
                  }
                </div>
                <div class="space-y-0.5">
                  @for (event of day.events.slice(0, 2); track event.id) {
                    <div 
                      class="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer"
                      [ngClass]="event.color"
                      [title]="event.titre"
                      (click)="viewEvent(event, $event)"
                    >
                      {{ event.heure }}
                    </div>
                  }
                  @if (day.events.length > 2) {
                    <p class="text-[10px] text-slate-500">+{{ day.events.length - 2 }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Calendar Grid - Week View -->
      @if (currentView() === 'week') {
        <div class="card overflow-hidden p-0">
          <div class="grid grid-cols-8 bg-lawyer-primary text-white">
            <div class="py-2 text-center text-xs font-medium"></div>
            @for (day of getWeekDays(); track day.date) {
              <div class="py-2 text-center text-xs font-medium" [ngClass]="isToday(day.date) ? 'bg-lawyer-dark' : ''">
                {{ getDayName(day.date) }} {{ day.date.getDate() }}
              </div>
            }
          </div>
          <div class="grid grid-cols-8 max-h-[350px] overflow-y-auto">
            @for (hour of hours; track hour) {
              <div class="border border-slate-100 p-1 text-[10px] text-slate-500">
                {{ hour }}h
              </div>
              @for (day of getWeekDays(); track day.date) {
                <div class="border border-slate-100 min-h-[40px] p-0.5 hover:bg-slate-50">
                  @for (event of getEventsForHour(day.date, hour); track event.id) {
                    <div 
                      class="text-xs px-2 py-1 rounded mb-1 cursor-pointer"
                      [ngClass]="event.color"
                      (click)="viewEvent(event, $event)"
                    >
                      {{ event.titre }}
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      }

      <!-- Day View -->
      @if (currentView() === 'day') {
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-semibold text-lawyer-dark">{{ getDayFullDate() }}</h3>
          </div>
          <div class="space-y-2">
            @for (event of getTodayEvents(); track event.id) {
              <div class="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:shadow-md transition-shadow" [ngClass]="getEventBgColor(event.type)">
                <div class="flex flex-col items-center min-w-[50px]">
                  <span class="text-sm font-bold text-lawyer-dark">{{ getEventHour(event) }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="material-icons text-xs" [ngClass]="getEventIconColor(event.type)">
                      {{ getEventIcon(event.type) }}
                    </span>
                    <span class="font-medium text-lawyer-dark text-sm">{{ event.titre }}</span>
                  </div>
                  @if (event.dossierId) {
                    <p class="text-xs text-slate-600">Dossier: {{ event.dossierId }}</p>
                  }
                </div>
                <button class="p-1 hover:bg-white/50 rounded">
                  <span class="material-icons text-slate-400 text-sm">more_vert</span>
                </button>
              </div>
            } @empty {
              <div class="text-center py-6 text-slate-500">
                <span class="material-icons text-3xl text-slate-300 block mb-1">event_available</span>
                <span class="text-sm">Aucun événement</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Legend -->
      <div class="flex items-center gap-3 mt-3 flex-wrap">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-lawyer-primary rounded-full"></span>
          <span class="text-xs text-slate-600">Audience</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-amber-400 rounded-full"></span>
          <span class="text-xs text-slate-600">Rendez-vous</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          <span class="text-xs text-slate-600">Échéance</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-red-400 rounded-full"></span>
          <span class="text-xs text-slate-600">Congé</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span class="text-xs text-slate-600">Formation</span>
        </div>
      </div>

      <!-- Event Detail Modal -->
      @if (selectedEvent()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeEventModal()">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in" (click)="$event.stopPropagation()">
            <div class="p-6" [ngClass]="getEventHeaderColor(selectedEvent()!.type)">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="material-icons text-white">{{ getEventIcon(selectedEvent()!.type) }}</span>
                  <h3 class="text-xl font-bold text-white">{{ getEventTypeLabel(selectedEvent()!.type) }}</h3>
                </div>
                <button (click)="closeEventModal()" class="text-white/80 hover:text-white">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="p-6">
              <h4 class="text-2xl font-bold text-lawyer-dark mb-4">{{ selectedEvent()?.titre }}</h4>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-slate-600">
                  <span class="material-icons text-sm">schedule</span>
                  <span>{{ getEventFullDate(selectedEvent()!) }}</span>
                </div>
                @if (selectedEvent()?.lieu) {
                  <div class="flex items-center gap-3 text-slate-600">
                    <span class="material-icons text-sm">location_on</span>
                    <span>{{ selectedEvent()?.lieu }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button (click)="closeEventModal()" class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100">
                Fermer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Event Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" (click)="closeCreateModal()">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-slate-200">
              <h3 class="text-xl font-bold text-lawyer-dark">Nouvel événement</h3>
            </div>
            <form (ngSubmit)="createEvent()" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                <input type="text" [(ngModel)]="newEvent.titre" name="titre" class="input-field" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select [(ngModel)]="newEvent.type" name="type" class="select-field" style="border-radius: 12px; border: 2px solid #e2e8f0; padding: 10px 40px 10px 16px; font-size: 14px; font-weight: 500; color: #334155; background: white url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222.5%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat right 12px center/20px; appearance: none; -webkit-appearance: none;" required>
                  <option value="audience">Audience</option>
                  <option value="rendez_vous">Rendez-vous</option>
                  <option value="echeance">Échéance</option>
                  <option value="conge">Congé</option>
                  <option value="formation">Formation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Date début *</label>
                  <input type="datetime-local" [(ngModel)]="newEvent.dateDebut" name="dateDebut" class="input-field" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Date fin *</label>
                  <input type="datetime-local" [(ngModel)]="newEvent.dateFin" name="dateFin" class="input-field" required>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                <input type="text" [(ngModel)]="newEvent.lieu" name="lieu" class="input-field">
              </div>
              <div class="flex justify-end gap-2 pt-4">
                <button type="button" (click)="closeCreateModal()" class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100">
                  Annuler
                </button>
                <button type="submit" class="btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.material-icons { font-size: 18px; }`]
})
export class CalendarComponent implements OnInit {
  private calendrierService = inject(CalendrierService);

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  hours = Array.from({ length: 12 }, (_, i) => i + 8);

  currentDate = signal(new Date());
  currentView = signal<'month' | 'week' | 'day'>('month');
  calendarDays = signal<CalendarDay[]>([]);
  
  events = signal<CalendrierEvent[]>([]);
  
  selectedEvent = signal<any>(null);
  showCreateModal = signal(false);
  selectedDay = signal<Date | null>(null);

  newEvent: any = {
    titre: '',
    type: 'rendez_vous',
    dateDebut: '',
    dateFin: '',
    lieu: ''
  };

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    const start = this.getStartOfMonth();
    const end = this.getEndOfMonth();
    
    this.calendrierService.getEvents({ start: start.toISOString(), end: end.toISOString() }).subscribe({
      next: (data) => {
        this.events.set(data);
        this.generateCalendarDays();
      },
      error: (err) => console.error('Error loading events:', err)
    });
  }

  generateCalendarDays() {
    const days: CalendarDay[] = [];
    const current = this.currentDate();
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDay);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dayEvents = this.getEventsForDate(date);
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === current.getMonth(),
        isToday: this.isToday(date),
        events: dayEvents
      });
    }

    this.calendarDays.set(days);
  }

  getEventsForDate(date: Date): CalendarEventItem[] {
    const eventItems: CalendarEventItem[] = [];
    const dateStr = date.toDateString();

    this.events().forEach(event => {
      const eventDate = new Date(event.dateDebut);
      if (eventDate.toDateString() === dateStr) {
        eventItems.push({
          id: event._id,
          titre: event.titre,
          type: event.type,
          heure: this.formatHour(event.dateDebut),
          color: this.getEventColor(event.type),
          dossierId: event.dossierId?.numero,
          dateDebut: event.dateDebut,
          dateFin: event.dateFin,
          lieu: event.lieu
        });
      }
    });

    return eventItems.sort((a, b) => a.heure.localeCompare(b.heure));
  }

  getEventsForHour(date: Date, hour: number): CalendarEventItem[] {
    const dateStr = date.toDateString();
    const eventItems: CalendarEventItem[] = [];

    this.events().forEach(event => {
      if (!event.dateDebut) return;
      const eventDate = new Date(event.dateDebut);
      if (eventDate.toDateString() === dateStr && eventDate.getHours() === hour) {
        eventItems.push({
          id: event._id,
          titre: event.titre,
          type: event.type,
          heure: this.formatHour(event.dateDebut),
          color: this.getEventColor(event.type),
          dossierId: event.dossierId?.numero,
          dateDebut: event.dateDebut,
          dateFin: event.dateFin
        });
      }
    });

    return eventItems;
  }

  getTodayEvents(): CalendarEventItem[] {
    return this.getEventsForDate(this.currentDate());
  }

  formatHour(date: Date | string): string {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '00:00';
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '00:00';
    }
  }

  getEventColor(type: string): string {
    const colors: Record<string, string> = {
      audience: 'bg-lawyer-primary text-white',
      rendez_vous: 'bg-amber-400 text-white',
      echeance: 'bg-green-500 text-white',
      conge: 'bg-red-400 text-white',
      formation: 'bg-purple-500 text-white',
      autre: 'bg-slate-400 text-white'
    };
    return colors[type] || 'bg-slate-400 text-white';
  }

  getEventBgColor(type: string): string {
    const colors: Record<string, string> = {
      audience: 'bg-blue-50 border-blue-200',
      rendez_vous: 'bg-amber-50 border-amber-200',
      echeance: 'bg-green-50 border-green-200',
      conge: 'bg-red-50 border-red-200',
      formation: 'bg-purple-50 border-purple-200',
      autre: 'bg-slate-50 border-slate-200'
    };
    return colors[type] || 'bg-slate-50 border-slate-200';
  }

  getEventIcon(type: string): string {
    const icons: Record<string, string> = {
      audience: 'gavel',
      rendez_vous: 'event',
      echeance: 'flag',
      conge: 'beach_access',
      formation: 'school',
      autre: 'event_note'
    };
    return icons[type] || 'event_note';
  }

  getEventIconColor(type: string): string {
    const colors: Record<string, string> = {
      audience: 'text-lawyer-primary',
      rendez_vous: 'text-amber-600',
      echeance: 'text-green-600',
      conge: 'text-red-600',
      formation: 'text-purple-600',
      autre: 'text-slate-600'
    };
    return colors[type] || 'text-slate-600';
  }

  getEventHeaderColor(type: string): string {
    const colors: Record<string, string> = {
      audience: 'bg-lawyer-primary',
      rendez_vous: 'bg-amber-500',
      echeance: 'bg-green-500',
      conge: 'bg-red-400',
      formation: 'bg-purple-500',
      autre: 'bg-slate-500'
    };
    return colors[type] || 'bg-slate-500';
  }

  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      audience: 'Audience',
      rendez_vous: 'Rendez-vous',
      echeance: 'Échéance',
      conge: 'Congé',
      formation: 'Formation',
      autre: 'Autre'
    };
    return labels[type] || type;
  }

  getEventFullDate(event: any): string {
    if (!event.dateDebut) return '';
    const debut = new Date(event.dateDebut);
    const fin = event.dateFin ? new Date(event.dateFin) : null;
    
    const dateStr = this.formatDate(debut);
    const heureDebut = this.formatHour(event.dateDebut);
    const heureFin = fin ? this.formatHour(event.dateFin) : '';
    
    return fin ? `${dateStr} ${heureDebut} - ${heureFin}` : `${dateStr} ${heureDebut}`;
  }

  getEventHour(event: any): string {
    if (!event.dateDebut) return event.heure || '';
    try {
      const d = new Date(event.dateDebut);
      if (isNaN(d.getTime())) return event.heure || '';
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return event.heure || '';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  setView(view: 'month' | 'week' | 'day') {
    this.currentView.set(view);
  }

  previous() {
    const current = this.currentDate();
    const newDate = new Date(current);
    
    switch (this.currentView()) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    
    this.currentDate.set(newDate);
    this.generateCalendarDays();
    this.loadEvents();
  }

  next() {
    const current = this.currentDate();
    const newDate = new Date(current);
    
    switch (this.currentView()) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    
    this.currentDate.set(newDate);
    this.generateCalendarDays();
    this.loadEvents();
  }

  getMonthYear(): string {
    return this.currentDate().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  getWeekRange(): string {
    const start = this.getWeekDays()[0]?.date;
    const end = this.getWeekDays()[6]?.date;
    if (!start || !end) return '';
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  getDayDate(): string {
    return this.currentDate().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  getDayFullDate(): string {
    return this.formatDate(this.currentDate());
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  }

  getWeekDays(): { date: Date }[] {
    const days: { date: Date }[] = [];
    const current = this.currentDate();
    const startOfWeek = new Date(current);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({ date });
    }

    return days;
  }

  selectDay(day: CalendarDay) {
    this.selectedDay.set(day.date);
    this.currentDate.set(day.date);
    this.currentView.set('day');
  }

  viewEvent(event: CalendarEventItem, e: Event) {
    e.stopPropagation();
    this.selectedEvent.set(event);
  }

  closeEventModal() {
    this.selectedEvent.set(null);
  }

  openCreateModal() {
    const now = new Date();
    const debut = new Date(now);
    debut.setHours(debut.getHours() + 1, 0, 0, 0);
    const fin = new Date(debut);
    fin.setHours(fin.getHours() + 1);

    this.newEvent = {
      titre: '',
      type: 'rendez_vous',
      dateDebut: debut.toISOString().slice(0, 16),
      dateFin: fin.toISOString().slice(0, 16),
      lieu: ''
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  createEvent() {
    this.calendrierService.createEvent(this.newEvent).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadEvents();
      },
      error: (err) => console.error('Error creating event:', err)
    });
  }

  getStartOfMonth(): Date {
    return new Date(this.currentDate().getFullYear(), this.currentDate().getMonth(), 1);
  }

  getEndOfMonth(): Date {
    return new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + 1, 0);
  }
}