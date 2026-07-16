import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Toggle button (toujours visible) -->
    <button (click)="toggleNav()"
            class="fixed top-3 right-4 z-[60] w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200"
            [title]="navVisible() ? 'Masquer le menu' : 'Afficher le menu'">
      @if (navVisible()) {
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      } @else {
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
      }
    </button>

    <!-- Nav -->
    <nav [class.-translate-y-full]="!navVisible()"
         class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 h-16 transition-transform duration-300 ease-in-out">
      <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-3 no-underline">
          <div class="logo-icon-home">
            <span class="logo-letter-home">A</span>
            <div class="logo-glow-home"></div>
          </div>
          <div>
            <div class="logo-text-home">AVOCAT<span class="logo-accent-home">PRO</span></div>
            <div class="logo-sub-home">Cabinet Boussayene Knani</div>
          </div>
        </a>
        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-6">
            <a href="#modules" class="text-sm text-slate-500 hover:text-lawyer-primary transition-colors font-medium">Services</a>
            <a href="#expertise" class="text-sm text-slate-500 hover:text-lawyer-primary transition-colors font-medium">Expertise</a>
            <a routerLink="/login"
               class="text-sm px-5 py-2 bg-lawyer-primary text-white font-medium rounded-lg hover:bg-lawyer-secondary transition-all shadow-sm">
              Connexion
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="min-h-screen flex items-center relative overflow-hidden bg-lawyer-dark">
      <video autoplay muted loop playsinline preload="auto"
             class="absolute inset-0 w-full h-full object-cover"
             poster="">
        <source src="assets/hero-bg.mp4" type="video/mp4">
      </video>
      <div class="absolute inset-0 bg-gradient-to-r from-lawyer-dark/85 via-lawyer-dark/70 to-lawyer-dark/50"></div>
      <div class="w-full px-6 pt-20 pb-16 relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <div class="flex justify-center mb-5">
            <div class="flex items-center gap-3">
              <div class="logo-icon-home" style="width:54px;height:54px;border-radius:15px;">
                <span class="logo-letter-home" style="font-size:24px;">A</span>
                <div class="logo-glow-home" style="border-radius:17px;"></div>
              </div>
              <div class="text-left leading-tight">
                <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                  AVOCAT<span style="background:linear-gradient(135deg,#c6a052,#d4af37,#e6c65c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PRO</span>
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.6);">Cabinet Boussayene Knani</div>
              </div>
            </div>
          </div>
          <h1 class="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
            Conseil &amp;<br>Contentieux
          </h1>
          <p class="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Plateforme juridique nouvelle génération : dossiers, clients, audiences, 
            documents, équipe et assistance IA dans un espace unique sécurisé.
          </p>
          <div class="flex flex-wrap justify-center gap-4 mt-10">
            <a routerLink="/login"
               class="inline-flex items-center gap-2 px-8 py-3 bg-lawyer-accent text-lawyer-dark font-semibold rounded-lg hover:bg-yellow-400 transition-all shadow-lg text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              Accéder à la plateforme
            </a>
            <a href="#modules"
               class="inline-flex items-center gap-2 px-8 py-3 border-2 border-white/20 text-white/80 font-medium rounded-lg hover:border-white/50 hover:text-white transition-all text-sm">
              Découvrir
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </a>
          </div>
          <div class="mt-14 pt-6 border-t border-white/10 max-w-xs mx-auto">
            <p class="text-xs text-white/40">
              <span class="font-semibold text-white/70">300+</span> professionnels font confiance
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Modules -->
    <section id="modules" class="py-16 md:py-20 bg-slate-50/60">
      <div class="w-full px-6">
        <div class="text-center mb-10 md:mb-12">
          <span class="inline-block text-xs tracking-[0.2em] uppercase font-semibold text-lawyer-accent mb-3">Modules</span>
          <h2 class="font-serif text-3xl md:text-4xl font-bold text-lawyer-dark">Une plateforme complète</h2>
          <p class="text-slate-500 text-sm mt-2 max-w-md mx-auto">Tous les outils nécessaires à la gestion de votre cabinet au même endroit.</p>
        </div>
        <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          @for (feat of features; track feat.title) {
            <div class="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center group">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" [style.background]="feat.bg">
                <span class="text-lg font-bold" [style.color]="feat.color">{{ feat.letter }}</span>
              </div>
              <h3 class="font-semibold text-lawyer-dark text-sm">{{ feat.title }}</h3>
              <p class="text-xs text-slate-400 mt-1">{{ feat.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section id="expertise" class="py-16 md:py-20 bg-white">
      <div class="w-full px-6">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-12">
            <span class="inline-block text-xs tracking-[0.2em] uppercase font-semibold text-lawyer-accent mb-3">Expertise</span>
            <h2 class="font-serif text-3xl md:text-4xl font-bold text-lawyer-dark">Chiffres clés</h2>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
            @for (s of stats; track s.label) {
              <div class="text-center p-7 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all">
                <p class="text-4xl md:text-5xl font-bold text-lawyer-primary mb-1">{{ s.value }}</p>
                <p class="text-xs text-slate-500">{{ s.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom: CTA + Footer side by side -->
    <section class="bg-lawyer-dark">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
          <!-- CTA -->
          <div class="bg-lawyer-primary relative overflow-hidden p-10 md:p-14 flex flex-col justify-center">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,82,0.08),transparent_60%)]"></div>
            <div class="relative">
              <h2 class="font-serif text-2xl md:text-3xl font-bold text-white mb-3">Prêt à moderniser<br>votre cabinet ?</h2>
              <p class="text-blue-200/70 text-sm mb-6">Accédez à votre espace dès maintenant.</p>
              <a routerLink="/login"
                 class="inline-flex items-center gap-2 px-7 py-3 bg-lawyer-accent text-lawyer-dark font-semibold rounded-lg hover:bg-yellow-400 transition-all shadow-lg">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                Connexion
              </a>
            </div>
          </div>
          <!-- Footer -->
          <div class="p-10 md:p-14">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-lawyer-accent to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-lawyer-dark font-serif font-bold">A</span>
                  </div>
                  <div>
                    <div class="font-serif font-bold text-white text-base">AVOCAT<span class="text-lawyer-accent">PRO</span></div>
                  </div>
                </div>
                <p class="text-slate-400 text-xs leading-relaxed">Cabinet Boussayene Knani<br>Conseil &amp; Contentieux</p>
                <div class="mt-5 pt-5 border-t border-white/10">
                  <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Liens rapides</h4>
                  <ul class="space-y-2">
                    <li><a href="#modules" class="text-xs text-slate-400 hover:text-lawyer-accent transition-colors">Services</a></li>
                    <li><a href="#expertise" class="text-xs text-slate-400 hover:text-lawyer-accent transition-colors">Expertise</a></li>
                    <li><a routerLink="/login" class="text-xs text-slate-400 hover:text-lawyer-accent transition-colors">Connexion</a></li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
                <ul class="space-y-2.5">
                  <li class="text-xs text-slate-400">Tunis, Tunisie</li>
                  <li class="text-xs text-slate-400">contact&#64;cabinet.tn</li>
                  <li class="text-xs text-slate-400">+216 XX XXX XXX</li>
                </ul>
                <div class="mt-5 pt-5 border-t border-white/10">
                  <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Horaires</h4>
                  <ul class="space-y-2">
                    <li class="text-xs text-slate-400">Lun-Ven : 8h30 – 18h</li>
                    <li class="text-xs text-slate-400">Sam : 9h – 13h</li>
                    <li class="text-xs text-slate-400">Dim : Fermé</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-white/5 py-4">
        <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-xs text-slate-500">&copy; {{ year }} Cabinet Boussayene Knani. Tous droits réservés.</p>
          <p class="text-xs text-slate-600">Conçu avec soin à Tunis</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; width: 100%; min-height: 100vh; }

    .logo-icon-home {
      width: 42px;
      height: 42px;
      background: linear-gradient(145deg, #c6a052 0%, #d4af37 50%, #e6c65c 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 15px rgba(198, 160, 82, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4);
      position: relative;
      animation: logoFloat 4s ease-in-out infinite;
      flex-shrink: 0;
    }

    .logo-letter-home {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: bold;
      color: #1a365d;
      z-index: 2;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .logo-glow-home {
      position: absolute;
      inset: -4px;
      background: linear-gradient(145deg, rgba(198, 160, 82, 0.4), transparent);
      border-radius: 14px;
      filter: blur(8px);
      animation: glow 3s ease-in-out infinite;
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    @keyframes glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .logo-text-home {
      font-family: Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      color: #0d1b2a;
      letter-spacing: -0.3px;
      line-height: 1.3;
    }

    .logo-accent-home {
      background: linear-gradient(135deg, #c6a052 0%, #d4af37 50%, #e6c65c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-sub-home {
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.3;
      margin-top: 1px;
    }
  `]
})
export class HomeComponent {
  year = new Date().getFullYear();
  navVisible = signal(true);

  toggleNav(): void {
    this.navVisible.update(v => !v);
  }

  features = [
    { letter: 'D', title: 'Dossiers', desc: 'Gestion complète', bg: '#eff6ff', color: '#2563eb' },
    { letter: 'C', title: 'Clients', desc: 'Fiches clients', bg: '#ecfdf5', color: '#059669' },
    { letter: 'A', title: 'Audiences', desc: 'Calendrier', bg: '#faf5ff', color: '#7c3aed' },
    { letter: 'M', title: 'Messagerie', desc: 'Communications', bg: '#fdf2f8', color: '#db2777' },
    { letter: 'T', title: 'Tâches', desc: 'Suivi échéances', bg: '#fff7ed', color: '#ea580c' },
    { letter: 'D', title: 'Documents', desc: 'GED sécurisée', bg: '#fefce8', color: '#ca8a04' },
    { letter: 'É', title: 'Équipe', desc: 'Collaboration', bg: '#eef2ff', color: '#4f46e5' },
    { letter: 'H', title: 'Historique', desc: 'Traçabilité', bg: '#f8fafc', color: '#64748b' },
    { letter: 'IA', title: 'IA', desc: 'Assistance', bg: '#f5f3ff', color: '#6d28d9' },
  ];

  stats = [
    { value: '15+', label: "Années d'expertise" },
    { value: '500+', label: 'Dossiers traités' },
    { value: '300+', label: 'Clients accompagnés' },
    { value: '94%', label: 'Taux de succès' },
  ];
}
