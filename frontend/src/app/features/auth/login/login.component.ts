import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      
      <div class="login-card">
        <div class="branding-panel">
          <div class="branding-content">
            <div class="logo-section">
              <div class="logo-icon">
                <span class="logo-letter">A</span>
                <div class="logo-glow"></div>
              </div>
              <div class="logo-text">
                <h1>AVOCAT<span class="accent">PRO</span></h1>
                <p class="subtitle">Cabinet Boussayene Knani</p>
              </div>
            </div>

            <div class="tagline">
              <h2>Gestion Juridique Intelligente</h2>
              <p>Solution numérique pour le suivi automatisé de vos dossiers avec traçabilité complète.</p>
            </div>

            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span>Sécurité des données</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <span>Traçabilité complète</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span>Collaboration optimisée</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m9 9 6 6 4-4"/></svg>
                </div>
                <span>Dossiers digitalisés</span>
              </div>
            </div>

            <div class="branding-footer">
              <p>© 2024 Cabinet Boussayene Knani</p>
              <p class="footer-tagline">Excellence Juridique & Innovation</p>
            </div>
          </div>
        </div>

        <div class="form-panel">
          <div class="form-content">
            <div class="form-header">
              <div class="form-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              </div>
              <h2>Bonjour !</h2>
              <p>Connectez-vous pour accéder à votre espace</p>
            </div>

            <form (ngSubmit)="onLogin()" class="login-form">
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

              <div class="input-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Mot de passe
                </label>
                <div class="password-wrapper">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="••••••••"
                    class="input-field"
                    required
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

              <div class="form-options">
                <label class="remember-me">
                  <input type="checkbox">
                  <span class="checkmark"></span>
                  Se souvenir de moi
                </label>
                <a href="#" class="forgot-password">Mot de passe oublié ?</a>
              </div>

              @if (error()) {
                <div class="error-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  {{ error() }}
                </div>
              }

              <button type="submit" [disabled]="loading()" class="login-btn">
                @if (loading()) {
                  <span class="spinner"></span>
                  Connexion en cours...
                } @else {
                  <span>Se connecter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                }
              </button>
            </form>

            <div class="form-footer">
              <p>Vous êtes un nouveau client ? <a href="#">Créer un compte</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .page-container {
      min-height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .bg-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      animation: float 20s infinite ease-in-out;
    }

    .shape-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%);
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      bottom: -50px;
      left: -50px;
      animation-delay: -5s;
    }

    .shape-3 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.2;
      animation-delay: -10s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(20px, -20px) scale(1.05); }
      50% { transform: translate(-10px, 10px) scale(0.95); }
      75% { transform: translate(10px, 10px) scale(1.02); }
    }

    .login-card {
      display: flex;
      width: 100%;
      max-width: 1000px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      position: relative;
      z-index: 1;
      backdrop-filter: blur(20px);
    }

    .branding-panel {
      width: 42%;
      background: linear-gradient(145deg, #1a365d 0%, #0d1b2a 50%, #1a365d 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .branding-panel::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(ellipse at center, rgba(198, 160, 82, 0.15) 0%, transparent 50%);
      animation: pulse 8s infinite ease-in-out;
    }

    .branding-panel::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 150px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }

    .branding-content {
      position: relative;
      z-index: 2;
      padding: 40px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 48px;
    }

    .logo-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(145deg, #c6a052 0%, #d4af37 50%, #e6c65c 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 4px 20px rgba(198, 160, 82, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      position: relative;
    }

    .logo-letter {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: bold;
      color: #1a365d;
      z-index: 2;
    }

    .logo-glow {
      position: absolute;
      inset: -5px;
      background: linear-gradient(145deg, rgba(198, 160, 82, 0.3), transparent);
      border-radius: 16px;
      filter: blur(10px);
    }

    .logo-text h1 {
      font-family: Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .accent {
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      margin: 4px 0 0 0;
      font-weight: 300;
    }

    .tagline {
      margin-bottom: 36px;
    }

    .tagline h2 {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 12px 0;
      line-height: 1.2;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .tagline p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin: 0;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 18px;
      flex: 1;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .feature-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(5px);
    }

    .feature-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, rgba(198, 160, 82, 0.2) 0%, rgba(198, 160, 82, 0.1) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c6a052;
      flex-shrink: 0;
    }

    .branding-footer {
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      margin-top: auto;
    }

    .branding-footer p {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    .footer-tagline {
      font-size: 11px !important;
      color: rgba(198, 160, 82, 0.7) !important;
      margin-top: 6px !important;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .form-panel {
      width: 58%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: white;
    }

    .form-content {
      width: 100%;
      max-width: 380px;
    }

    .form-header {
      margin-bottom: 36px;
      text-align: center;
    }

    .form-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;
      box-shadow: 0 8px 25px rgba(26, 54, 93, 0.3);
    }

    .form-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1a365d;
      margin: 0 0 8px 0;
      font-family: Georgia, serif;
    }

    .form-header p {
      font-size: 15px;
      color: #64748b;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-group label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-group label svg {
      color: #1a365d;
    }

    .password-wrapper {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
    }

    .toggle-password:hover {
      color: #1a365d;
    }

    .input-field {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 15px;
      outline: none;
      background: #f8fafc;
      transition: all 0.3s ease;
    }

    .input-field:focus {
      border-color: #1a365d;
      box-shadow: 0 0 0 4px rgba(26, 54, 93, 0.1);
      background: white;
    }

    .input-field::placeholder {
      color: #9ca3af;
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      cursor: pointer;
    }

    .remember-me input {
      display: none;
    }

    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .remember-me input:checked + .checkmark {
      background: #1a365d;
      border-color: #1a365d;
    }

    .remember-me input:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 12px;
    }

    .forgot-password {
      color: #1a365d;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .forgot-password:hover {
      color: #c6a052;
    }

    .error-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 14px 16px;
      border-radius: 12px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .login-btn {
      width: 100%;
      padding: 16px 24px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(26, 54, 93, 0.3);
      position: relative;
      overflow: hidden;
    }

    .login-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .login-btn:hover:not(:disabled)::before {
      opacity: 1;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(26, 54, 93, 0.4);
    }

    .login-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-btn span, .login-btn svg {
      position: relative;
      z-index: 1;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-footer {
      text-align: center;
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .form-footer p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .form-footer a {
      color: #1a365d;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .form-footer a:hover {
      color: #c6a052;
    }

    @media (max-width: 900px) {
      .login-card {
        flex-direction: column;
        max-width: 480px;
      }
      .branding-panel {
        width: 100%;
        padding: 32px;
      }
      .form-panel {
        width: 100%;
        padding: 40px 32px;
      }
    }

    @media (max-width: 500px) {
      .page-container {
        padding: 16px;
      }
      .branding-content {
        padding: 28px;
      }
      .form-panel {
        padding: 32px 24px;
      }
      .tagline h2 {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur de connexion');
      }
    });
  }
}