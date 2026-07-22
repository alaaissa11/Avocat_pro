import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  _id: string;
  receiver: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  lu: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  unread: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  private http = inject(HttpClient);

  getNotifications(page = 1): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.apiUrl}?page=${page}`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread`);
  }

  markAsLu(id: string): Observable<{ message: string; unread: number }> {
    return this.http.put<{ message: string; unread: number }>(`${this.apiUrl}/${id}/lu`, {});
  }

  markAllAsLu(): Observable<{ message: string; unread: number }> {
    return this.http.put<{ message: string; unread: number }>(`${this.apiUrl}/all/lu`, {});
  }
}
