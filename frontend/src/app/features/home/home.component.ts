import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
      <div class="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2 md:gap-3 no-underline min-w-0">
          <div class="logo-icon-home flex-shrink-0">
            <span class="logo-letter-home">A</span>
            <div class="logo-glow-home"></div>
          </div>
          <div class="min-w-0">
            <div class="logo-text-home truncate">AVOCAT<span class="logo-accent-home">PRO</span></div>
            <div class="logo-sub-home hidden sm:block">Cabinet Boussayene Knani</div>
          </div>
        </a>
        <div class="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <div class="hidden md:flex items-center gap-6">
            <a href="#modules" class="text-sm text-slate-500 hover:text-lawyer-primary transition-colors font-medium">Services</a>
            <a href="#expertise" class="text-sm text-slate-500 hover:text-lawyer-primary transition-colors font-medium">Expertise</a>
          </div>
          <a routerLink="/login"
             class="text-xs md:text-sm px-4 md:px-5 py-2 bg-lawyer-primary text-white font-medium rounded-lg hover:bg-lawyer-secondary transition-all shadow-sm">
            Connexion
          </a>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="min-h-screen flex items-center relative overflow-hidden bg-lawyer-dark">
      <video #heroVideo autoplay muted loop playsinline preload="auto"
             class="absolute inset-0 w-full h-full object-cover video-ken-burns">
        <source src="assets/hero-bg.mp4" type="video/mp4">
      </video>
      <div class="absolute inset-0 bg-gradient-to-r from-lawyer-dark/70 via-lawyer-dark/50 to-lawyer-dark/30"></div>
      <div class="w-full px-6 pt-20 pb-16 relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <div class="flex justify-center mb-5">
            <div class="flex items-center gap-3">
              <div class="logo-icon-home" style="width:44px;height:44px;border-radius:13px;">
                <span class="logo-letter-home" style="font-size:20px;">A</span>
                <div class="logo-glow-home" style="border-radius:15px;"></div>
              </div>
              <div class="text-left leading-tight">
                <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                  AVOCAT<span style="background:linear-gradient(135deg,#c6a052,#d4af37,#e6c65c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PRO</span>
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.6);">Cabinet Boussayene Knani</div>
              </div>
            </div>
          </div>
          <h1 class="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
            Conseil &amp;<br>Contentieux
          </h1>
          <p class="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Plateforme juridique nouvelle génération : dossiers, clients, audiences, 
            documents, équipe et assistance IA dans un espace unique sécurisé.
          </p>
          <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mt-10">
            <a routerLink="/login"
               class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-lawyer-accent text-lawyer-dark font-semibold rounded-lg hover:bg-yellow-400 transition-all shadow-lg text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              Accéder à la plateforme
            </a>
            <a href="#modules"
               class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 border-2 border-white/20 text-white/80 font-medium rounded-lg hover:border-white/50 hover:text-white transition-all text-sm">
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
    <section id="modules" class="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white">
      <div class="w-full px-6">
        <div class="text-center mb-14">
          <span class="inline-block text-xs tracking-[0.2em] uppercase font-semibold text-lawyer-accent mb-4 px-4 py-1.5 border border-lawyer-accent/20 rounded-full bg-lawyer-accent/5">Notre plateforme</span>
          <h2 class="font-serif text-4xl md:text-5xl font-bold text-lawyer-dark leading-tight">Un écosystème <span class="text-lawyer-accent">complet</span></h2>
          <p class="text-slate-400 text-sm mt-3 max-w-lg mx-auto">Tous les outils essentiels de votre cabinet, réunis dans un espace unique et sécurisé.</p>
        </div>
        <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (feat of features; track feat.title) {
            <div class="group relative bg-white rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-default"
                 [style.boxShadow]="'0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'">
              <div class="absolute inset-x-0 top-0 h-1 rounded-t-2xl transition-all duration-300 group-hover:h-1.5 opacity-0 group-hover:opacity-100" [style.background]="'linear-gradient(90deg, '+feat.color+', '+feat.color+'88)'"></div>
              <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                     [style.background]="feat.bg">
                  <span [innerHTML]="feat.safeIcon" class="[&>svg]:w-9 [&>svg]:h-9" [style.color]="feat.color"></span>
                </div>
                <h3 class="font-serif font-bold text-lawyer-dark text-lg mb-1.5">{{ feat.title }}</h3>
                <p class="text-slate-400 text-xs leading-relaxed">{{ feat.desc }}</p>
              </div>
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
          <div class="bg-lawyer-dark relative overflow-hidden p-10 md:p-14 flex flex-col justify-center">
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
          <div class="p-8 md:p-12">
            <div class="grid grid-cols-2 gap-4 h-full">
              <!-- Brand -->
              <div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col justify-center hover:border-lawyer-accent hover:shadow-lg hover:shadow-lawyer-accent/10 hover:bg-white/[0.07] transition-all duration-300">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-lawyer-accent to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-lawyer-dark font-serif font-bold">A</span>
                  </div>
                  <div>
                    <div class="font-serif font-bold text-white text-base leading-tight">AVOCAT<span class="text-lawyer-accent">PRO</span></div>
                    <p class="text-slate-400 text-xs leading-relaxed mt-0.5">Cabinet Boussayene Knani</p>
                  </div>
                </div>
                <p class="text-slate-500 text-xs mt-3 border-t border-white/5 pt-3">Conseil &amp; Contentieux</p>
              </div>
              <!-- Liens rapides -->
              <div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col justify-center hover:border-lawyer-accent hover:shadow-lg hover:shadow-lawyer-accent/10 hover:bg-white/[0.07] transition-all duration-300">
                <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Liens rapides</h4>
                <ul class="space-y-2">
                  <li><a href="#modules" class="text-xs text-slate-400 hover:text-lawyer-accent transition-colors">Services</a></li>
                  <li><a href="#expertise" class="text-xs text-slate-400 hover:text-lawyer-accent transition-colors">Expertise</a></li>
                  <li><a routerLink="/login" class="text-xs text-slate-400 hover:text-lawyer-accent transition-colors">Connexion</a></li>
                </ul>
              </div>
              <!-- Contact -->
              <div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col justify-center hover:border-lawyer-accent hover:shadow-lg hover:shadow-lawyer-accent/10 hover:bg-white/[0.07] transition-all duration-300">
                <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Contact</h4>
                <ul class="space-y-2">
                  <li class="text-xs text-slate-400 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    Tunis, Tunisie
                  </li>
                  <li class="text-xs text-slate-400 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                    contact&#64;cabinet.tn
                  </li>
                  <li class="text-xs text-slate-400 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                    +216 XX XXX XXX
                  </li>
                </ul>
              </div>
              <!-- Horaires -->
              <div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col justify-center hover:border-lawyer-accent hover:shadow-lg hover:shadow-lawyer-accent/10 hover:bg-white/[0.07] transition-all duration-300">
                <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Horaires</h4>
                <ul class="space-y-2">
                  <li class="flex items-center justify-between text-xs text-slate-400"><span>Lun–Ven</span><span class="text-white/70">8h30 – 18h</span></li>
                  <li class="flex items-center justify-between text-xs text-slate-400"><span>Samedi</span><span class="text-white/70">9h – 13h</span></li>
                  <li class="flex items-center justify-between text-xs text-slate-400"><span>Dimanche</span><span class="text-white/50">Fermé</span></li>
                </ul>
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

    .video-ken-burns {
      animation: kenBurns 4s ease-in-out infinite;
    }

    @keyframes kenBurns {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
  `]
})
export class HomeComponent implements AfterViewInit {
  year = new Date().getFullYear();
  navVisible = signal(true);
  features: Array<{ safeIcon: SafeHtml; title: string; desc: string; bg: string; color: string }> = [];

  @ViewChild('heroVideo') videoRef!: ElementRef<HTMLVideoElement>;

  constructor(private sanitizer: DomSanitizer) {
    this.initFeatures();
  }

  ngAfterViewInit(): void {
    const video = this.videoRef?.nativeElement;
    if (video) video.play().catch(() => {});
  }

  toggleNav(): void {
    this.navVisible.update(v => !v);
  }

  private initFeatures(): void {
    const raw: Array<{ icon: string; title: string; desc: string; bg: string; color: string }> = [
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>`,
      title: 'Dossiers',
      desc: 'Suivi complet des affaires de votre cabinet, de l\'ouverture à la clôture.',
      bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      color: '#2563eb'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>`,
      title: 'Clients',
      desc: 'Fiches centralisées avec historique, documents et suivi des rendez-vous.',
      bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      color: '#059669'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>`,
      title: 'Audiences',
      desc: 'Calendrier partagé avec rappels automatiques et vue synthétique mensuelle.',
      bg: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
      color: '#7c3aed'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>`,
      title: 'Messagerie',
      desc: 'Boîte de réception interne pour communiquer avec votre équipe en temps réel.',
      bg: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
      color: '#db2777'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"/></svg>`,
      title: 'Tâches',
      desc: 'Planning des échéances, priorisation et délégation entre collaborateurs.',
      bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
      color: '#ea580c'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`,
      title: 'Documents',
      desc: 'GED sécurisée avec classement par dossier et contrôle d\'accès intégré.',
      bg: 'linear-gradient(135deg, #fefce8, #fef9c3)',
      color: '#ca8a04'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>`,
      title: 'Équipe',
      desc: 'Invitation, rôles et collaboration fluide au sein de votre cabinet.',
      bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
      color: '#4f46e5'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      title: 'Historique',
      desc: 'Journal des actions avec filtres avancés pour une traçabilité complète.',
      bg: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      color: '#64748b'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>`,
      title: 'Assistance IA',
      desc: 'Suggestion intelligente du type d\'affaire et aide à la décision.',
      bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
      color: '#6d28d9'
    },
  ];
    this.features = raw.map(f => ({ ...f, safeIcon: this.sanitizer.bypassSecurityTrustHtml(f.icon) }));
  }

  stats = [
    { value: '15+', label: "Années d'expertise" },
    { value: '500+', label: 'Dossiers traités' },
    { value: '300+', label: 'Clients accompagnés' },
    { value: '94%', label: 'Taux de succès' },
  ];
}
