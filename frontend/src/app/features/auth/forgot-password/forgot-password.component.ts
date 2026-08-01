import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <div class="card-auth">
        <div class="card-header">
          <div class="form-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2>Mot de passe oublié</h2>
          <p>Saisissez votre email professionnel pour recevoir un lien de réinitialisation.</p>
        </div>

        @if (sent()) {
          <div class="success-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
            <div>
              <p class="font-semibold">Email envoyé</p>
              <p>Si un compte existe pour <strong>{{ email }}</strong>, un lien de réinitialisation vient d'être envoyé. Vérifiez votre boîte mail (et vos spams).</p>
            </div>
          </div>
          <a routerLink="/login" class="btn-primary w-full flex items-center justify-center gap-2 mt-4">
            Retour à la connexion
          </a>
        } @else {
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="input-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Email professionnel
              </label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="votre@email.com"
                class="input-field"
                required
              >
            </div>

            @if (error()) {
              <div class="error-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {{ error() }}
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn-primary w-full flex items-center justify-center gap-2">
              @if (loading()) {
                <span class="spinner"></span>
                Envoi en cours...
              } @else {
                Envoyer le lien de réinitialisation
              }
            </button>
          </form>

          <div class="form-footer">
            <p>Vous vous souvenez de votre mot de passe ? <a routerLink="/login">Se connecter</a></p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :host { display: block; width: 100vw; height: 100vh; }

    .page-container {
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .bg-shapes { position: absolute; inset: -50%; overflow: hidden; pointer-events: none; }
    .shape { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.6; animation: float 25s infinite ease-in-out; }
    .shape-1 { width: 600px; height: 600px; background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%); top: -200px; right: -200px; }
    .shape-2 { width: 500px; height: 500px; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); bottom: -150px; left: -150px; animation-delay: -8s; }
    .shape-3 { width: 350px; height: 350px; background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%); top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.3; animation-delay: -15s; }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
      25% { transform: translate(30px, -30px) scale(1.1) rotate(5deg); }
      50% { transform: translate(-20px, 20px) scale(0.95) rotate(-3deg); }
      75% { transform: translate(15px, 15px) scale(1.02) rotate(2deg); }
    }

    .card-auth {
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.97);
      border-radius: 20px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      padding: 32px;
      position: relative;
      z-index: 1;
      backdrop-filter: blur(20px);
      animation: cardAppear 0.5s ease-out;
    }

    @keyframes cardAppear { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .card-header { text-align: center; margin-bottom: 24px; }
    .form-icon {
      width: 56px; height: 56px; margin: 0 auto 14px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: white; box-shadow: 0 6px 20px rgba(26, 54, 93, 0.35);
    }
    .card-header h2 { font-size: 22px; font-weight: 700; color: #1a365d; font-family: Georgia, serif; margin: 0 0 8px; }
    .card-header p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }

    .auth-form { display: flex; flex-direction: column; gap: 14px; }
    .input-group { display: flex; flex-direction: column; gap: 6px; }
    .input-group label { font-size: 12px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; }
    .input-group label svg { color: #1a365d; }
    .input-field {
      width: 100%; padding: 11px 12px; border: 2px solid #e5e7eb; border-radius: 10px;
      font-size: 13px; outline: none; background: #f9fafb; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .input-field:hover { border-color: #c6a052; }
    .input-field:focus { border-color: #1a365d; box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.15); background: white; }
    .input-field::placeholder { color: #9ca3af; }

    .error-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid #fecaca; color: #dc2626; padding: 10px 12px; border-radius: 10px;
      font-size: 12px; display: flex; align-items: center; gap: 8px;
    }

    .success-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0; color: #166534; padding: 14px 16px; border-radius: 10px;
      font-size: 13px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5;
    }
    .success-box svg { flex-shrink: 0; margin-top: 1px; }

    .btn-primary {
      padding: 12px 20px; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(26, 54, 93, 0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(26, 54, 93, 0.4); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .form-footer { text-align: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid #e5e7eb; }
    .form-footer p { font-size: 12px; color: #6b7280; margin: 0; }
    .form-footer a { color: #1a365d; text-decoration: none; font-weight: 600; }

    .font-semibold { font-weight: 600; }
    .w-full { width: 100%; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 8px; }
    .mt-4 { margin-top: 16px; }

    @media (max-width: 500px) {
      .page-container { padding: 12px; }
      .card-auth { padding: 24px 20px; border-radius: 16px; }
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  loading = signal(false);
  error = signal('');
  sent = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    if (!this.email) {
      this.error.set('Veuillez saisir votre email');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de l\'envoi de l\'email');
      }
    });
  }
}
