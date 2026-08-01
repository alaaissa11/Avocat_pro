import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
          <h2>Nouveau mot de passe</h2>
          <p>Choisissez un nouveau mot de passe (8 caractères minimum).</p>
        </div>

        @if (success()) {
          <div class="success-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            <div>
              <p class="font-semibold">Mot de passe réinitialisé</p>
              <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            </div>
          </div>
          <a routerLink="/login" class="btn-primary w-full flex items-center justify-center gap-2 mt-4">
            Se connecter
          </a>
        } @else if (tokenInvalid()) {
          <div class="error-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <div>
              <p class="font-semibold">Lien invalide ou expiré</p>
              <p>Ce lien de réinitialisation est invalide ou a expiré (validité : 1 heure).</p>
            </div>
          </div>
          <a routerLink="/forgot-password" class="btn-primary w-full flex items-center justify-center gap-2 mt-4">
            Renvoyer un nouveau lien
          </a>
        } @else {
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="input-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Nouveau mot de passe
              </label>
              <div class="password-wrapper">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  class="input-field"
                  required
                  minlength="8"
                >
                <button type="button" class="toggle-password" (click)="togglePassword()">
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  }
                </button>
              </div>
            </div>

            <div class="input-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
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
                Réinitialisation...
              } @else {
                Réinitialiser mon mot de passe
              }
            </button>
          </form>
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

    .password-wrapper { position: relative; }
    .toggle-password {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;
    }
    .toggle-password:hover { color: #1a365d; }

    .input-field {
      width: 100%; padding: 11px 12px; border: 2px solid #e5e7eb; border-radius: 10px;
      font-size: 13px; outline: none; background: #f9fafb; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .input-field:hover { border-color: #c6a052; }
    .input-field:focus { border-color: #1a365d; box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.15); background: white; }
    .input-field::placeholder { color: #9ca3af; }

    .error-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid #fecaca; color: #dc2626; padding: 12px 14px; border-radius: 10px;
      font-size: 12px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
    }
    .error-box svg { flex-shrink: 0; margin-top: 1px; }

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
export class ResetPasswordComponent {
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);
  tokenInvalid = signal(false);
  showPassword = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.tokenInvalid.set(true);
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (!this.password || !this.confirmPassword) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          this.tokenInvalid.set(true);
        } else {
          this.error.set(err.error?.message || 'Erreur lors de la réinitialisation');
        }
      }
    });
  }
}
