import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  _id: string;
  sender: { _id: string; nom: string; prenom: string; role: string };
  receiver: { _id: string; nom: string; prenom: string; role: string };
  content: string;
  lu: boolean;
  createdAt: string;
}

export interface Conversation {
  user: { _id: string; nom: string; prenom: string; role: string };
  lastMessage: Message;
  unread: number;
}

@Injectable({ providedIn: 'root' })
export class MessagerieService {
  private apiUrl = 'http://localhost:3000/api/messages';

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getMessages(withUserId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/with/${withUserId}`);
  }

  envoyerMessage(receiverId: string, content: string): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, { receiverId, content });
  }

  markAsLu(withUserId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/with/${withUserId}/lu`, {});
  }
}
