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
        <div class="shape shape-4"></div>
      </div>
      
      <div class="login-card">
        <div class="branding-panel">
          <div class="brand-decoration"></div>
          <div class="brand-decoration-2"></div>
          <div class="branding-content">
            <div class="logo-section fade-in">
              <div class="logo-icon">
                <span class="logo-letter">A</span>
                <div class="logo-glow"></div>
              </div>
              <div class="logo-text">
                <h1>AVOCAT<span class="accent">PRO</span></h1>
                <p class="subtitle">Cabinet Boussayene Knani</p>
              </div>
            </div>

            <div class="tagline fade-in" style="animation-delay: 0.1s">
              <h2 class="typewriter">
                {{ displayText }}
              </h2>
              <p>Solution numérique pour le suivi automatisé de vos dossiers avec traçabilité complète.</p>
            </div>

            <div class="features">
              <div class="feature-item fade-in" style="animation-delay: 0.2s">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span>Sécurité des données</span>
              </div>
              <div class="feature-item fade-in" style="animation-delay: 0.3s">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <span>Traçabilité complète</span>
              </div>
              <div class="feature-item fade-in" style="animation-delay: 0.4s">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span>Collaboration optimisée</span>
              </div>
              <div class="feature-item fade-in" style="animation-delay: 0.5s">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m9 9 6 6 4-4"/></svg>
                </div>
                <span>Dossiers digitalisés</span>
              </div>
            </div>

            <div class="branding-footer fade-in" style="animation-delay: 0.6s">
              <p>© 2024 Cabinet Boussayene Knani</p>
              <p class="footer-tagline">Excellence Juridique & Innovation</p>
            </div>
          </div>
        </div>

        <div class="form-panel">
          <div class="form-decoration"></div>
          <div class="form-content">
            <div class="form-header fade-in" style="animation-delay: 0.3s">
              <div class="form-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              </div>
              <h2>Bienvenue</h2>
              <p>Connectez-vous pour accéder à votre espace</p>
            </div>

            <form (ngSubmit)="onLogin()" class="login-form">
              <div class="input-group fade-in" style="animation-delay: 0.4s">
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

              <div class="input-group fade-in" style="animation-delay: 0.5s">
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

              <div class="form-options fade-in" style="animation-delay: 0.6s">
                <label class="remember-me">
                  <input type="checkbox">
                  <span class="checkmark"></span>
                  Se souvenir de moi
                </label>
                <a href="#" class="forgot-password">Mot de passe oublié ?</a>
              </div>

              @if (error()) {
                <div class="error-box fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  {{ error() }}
                </div>
              }

              <button type="submit" [disabled]="loading()" class="login-btn fade-in" style="animation-delay: 0.7s">
                @if (loading()) {
                  <span class="spinner"></span>
                  Connexion en cours...
                } @else {
                  <span>Se connecter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                }
              </button>
            </form>

            <div class="form-footer fade-in" style="animation-delay: 0.8s">
              <p>Vous êtes un nouveau client ? <a href="#">Créer un compte</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      const text = "Gestion Juridique Intelligente";
      let i = 0;

      function typeWriter() {
        if (i < text.length) {
          document.getElementById("typewriter").innerHTML += text.charAt(i);
          i++;
          setTimeout(typeWriter, 80); // vitesse
        }
      }

      window.addEventListener("load", typeWriter);
    </script>
  `,
styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    

    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
    }

    @media (max-width: 900px) {
      :host {
        height: auto;
        min-height: 100vh;
        overflow-y: auto;
      }
    }
    .typewriter {
      display: inline-block;
      border-right: 2px solid #000;
      white-space: pre-line;
      overflow: hidden;
      animation: blinkCursor 0.7s infinite;
      max-width: 100%;
    }

    @keyframes blinkCursor {
      50% {
          border-color: transparent;
      }
    }

    .page-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .bg-shapes {
      position: absolute;
      inset: -50%;
      overflow: hidden;
      pointer-events: none;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.6;
      animation: float 25s infinite ease-in-out;
    }

    .shape-1 {
      width: 600px;
      height: 600px;
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%);
      top: -200px;
      right: -200px;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 500px;
      height: 500px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      bottom: -150px;
      left: -150px;
      animation-delay: -8s;
    }

    .shape-3 {
      width: 350px;
      height: 350px;
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 100%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.3;
      animation-delay: -15s;
    }

    .shape-4 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      top: 10%;
      right: 30%;
      opacity: 0.25;
      animation-delay: -5s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
      25% { transform: translate(30px, -30px) scale(1.1) rotate(5deg); }
      50% { transform: translate(-20px, 20px) scale(0.95) rotate(-3deg); }
      75% { transform: translate(15px, 15px) scale(1.02) rotate(2deg); }
    }

    .login-card {
      display: flex;
      width: 100%;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.97);
      border-radius: 20px;
      box-shadow: 
        0 20px 40px -10px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      overflow: hidden;
      position: relative;
      z-index: 1;
      backdrop-filter: blur(20px);
      animation: cardAppear 0.5s ease-out;
    }

    @keyframes cardAppear {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .fade-in {
      opacity: 0;
      animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .typing-effect {
      overflow: hidden;
      white-space: nowrap;
      animation: typing 2s steps(40) forwards;
    }

    @keyframes typing {
      from { width: 0; }
      to { width: 100%; }
    }

    .blink-cursor::after {
      content: '|';
      animation: blink 0.8s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .branding-panel {
      width: 44%;
      background: linear-gradient(160deg, #1a365d 0%, #0d1b2a 60%, #1a365d 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .brand-decoration {
      position: absolute;
      top: -200px;
      right: -200px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(198, 160, 82, 0.15) 0%, transparent 70%);
      animation: pulse 10s infinite ease-in-out;
    }

    .brand-decoration-2 {
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(26, 54, 93, 0.3) 0%, transparent 70%);
      animation: pulse 12s infinite ease-in-out reverse;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.15); }
    }

    .branding-panel::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 180px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
      pointer-events: none;
    }

    .branding-content {
      position: relative;
      z-index: 2;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(145deg, #c6a052 0%, #d4af37 50%, #e6c65c 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 5px 15px rgba(198, 160, 82, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
      position: relative;
      animation: logoFloat 4s ease-in-out infinite;
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    .logo-letter {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: bold;
      color: #1a365d;
      z-index: 2;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .logo-glow {
      position: absolute;
      inset: -4px;
      background: linear-gradient(145deg, rgba(198, 160, 82, 0.4), transparent);
      border-radius: 14px;
      filter: blur(8px);
      animation: glow 3s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .logo-text h1 {
      font-family: Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }

    .accent {
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 50%, #e6c65c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.75);
      margin: 2px 0 0 0;
      font-weight: 400;
      letter-spacing: 0.5px;
    }

    .tagline {
      margin-bottom: 16px;
    }

    .tagline h2 {
      font-family: Georgia, serif;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      line-height: 1.25;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }

    .tagline p {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.5;
      margin: 0;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
    }

    .feature-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(5px);
      border-color: rgba(198, 160, 82, 0.3);
    }

    .feature-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, rgba(198, 160, 82, 0.25) 0%, rgba(198, 160, 82, 0.1) 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c6a052;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .feature-item:hover .feature-icon {
      background: linear-gradient(135deg, rgba(198, 160, 82, 0.4) 0%, rgba(198, 160, 82, 0.2) 100%);
      transform: scale(1.05);
    }

    .branding-footer {
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      margin-top: auto;
    }

    .branding-footer p {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    .footer-tagline {
      font-size: 9px !important;
      color: rgba(198, 160, 82, 0.8) !important;
      margin-top: 4px !important;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .form-panel {
      width: 56%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: white;
      position: relative;
      overflow: hidden;
    }

    .form-decoration {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(26, 54, 93, 0.05) 0%, transparent 70%);
      border-radius: 50%;
    }

    .form-content {
      width: 100%;
      max-width: 280px;
      position: relative;
      z-index: 1;
    }

    .form-header {
      margin-bottom: 20px;
      text-align: center;
    }

    .form-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      color: white;
      box-shadow: 0 6px 20px rgba(26, 54, 93, 0.35);
      animation: iconPulse 3s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% { box-shadow: 0 6px 20px rgba(26, 54, 93, 0.35); }
      50% { box-shadow: 0 8px 25px rgba(26, 54, 93, 0.45); }
    }

    .form-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1a365d;
      margin: 0 0 8px 0;
      font-family: Georgia, serif;
    }

    .form-header p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-group label {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .input-group label svg {
      color: #1a365d;
    }

    .password-wrapper {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      transition: color 0.25s ease;
    }

    .toggle-password:hover {
      color: #1a365d;
    }

    .input-field {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 13px;
      outline: none;
      background: #f9fafb;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .input-field:hover {
      border-color: #c6a052;
      transform: translateY(-1px);
    }

    .input-field:focus {
      border-color: #1a365d;
      box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.15), 0 4px 12px rgba(26, 54, 93, 0.1);
      background: white;
      transform: translateY(-2px);
    }

    .input-field::placeholder {
      color: #9ca3af;
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6b7280;
      cursor: pointer;
    }

    .remember-me input {
      display: none;
    }

    .checkmark {
      width: 16px;
      height: 16px;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
    }

    .remember-me input:checked + .checkmark {
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      border-color: #1a365d;
      transform: scale(1.05);
    }

    .remember-me input:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 10px;
      font-weight: bold;
    }

    .forgot-password {
      color: #1a365d;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.25s ease;
      position: relative;
    }

    .forgot-password::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 0;
      height: 1.5px;
      background: #c6a052;
      transition: width 0.3s ease;
    }

    .forgot-password:hover {
      color: #c6a052;
    }

    .forgot-password:hover::after {
      width: 100%;
    }

    .error-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }

    .login-btn {
      width: 100%;
      padding: 12px 20px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
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
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-footer {
      text-align: center;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
    }

    .form-footer p {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    .form-footer a {
      color: #1a365d;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.25s ease;
      position: relative;
    }

    .form-footer a::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 0;
      height: 1.5px;
      background: #c6a052;
      transition: width 0.3s ease;
    }

    .form-footer a:hover {
      color: #c6a052;
    }

    .form-footer a:hover::after {
      width: 100%;
    }

    @media (max-width: 900px) {
      .page-container {
        align-items: flex-start;
        overflow-y: auto;
      }
      .login-card {
        flex-direction: column;
        max-width: 400px;
        margin: auto 0;
      }
      .branding-panel {
        width: 100%;
        padding: 20px;
      }
      .form-panel {
        width: 100%;
        padding: 24px;
      }
    }

    @media (max-width: 500px) {
      .page-container {
        padding: 12px;
      }
      .login-card {
        max-width: 100%;
        border-radius: 16px;
      }
      .branding-content {
        padding: 16px;
      }
      .form-panel {
        padding: 20px 16px;
      }
      .tagline h2 {
        font-size: 16px;
      }
      .feature-item {
        padding: 8px 12px;
        font-size: 11px;
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
  text = "Gestion Juridique\nIntelligente";
  displayText = "";
  i = 0;
  typing = true;
  ngOnInit() {
    this.loopTypewriter();
  }

  loopTypewriter() {
    if (this.typing) {

      // phase écriture
      if (this.i < this.text.length) {
        this.displayText += this.text.charAt(this.i);
        this.i++;
        setTimeout(() => this.loopTypewriter(), 80);
      } 
      else {
        // pause puis effacement
        this.typing = false;
        setTimeout(() => this.erase(), 1500);
      }
    }
  }

  erase() {
    if (this.displayText.length > 0) {
      this.displayText = this.displayText.slice(0, -1);
      setTimeout(() => this.erase(), 40);
    } 
    else {
      // reset et recommencer
      this.i = 0;
      this.typing = true;
      this.loopTypewriter();
    }
  }

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