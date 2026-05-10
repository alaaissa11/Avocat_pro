/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'lawyer-primary': '#1a365d',      // Navy blue - professionnel
        'lawyer-secondary': '#2c5282',    // Bleu soutenu
        'lawyer-accent': '#c6a052',       // Or - prestige
        'lawyer-light': '#f7fafc',        // Gris clair
        'lawyer-dark': '#0d1b2a',         // Noir bleuté
        'lawyer-gold': '#d4af37',         // Or classique
        'lawyer-success': '#38a169',      // Vert succès
        'lawyer-warning': '#d69e2e',      // Orange avertissement
        'lawyer-danger': '#e53e3e',       // Rouge erreur
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['"Inter"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'professional': '0 4px 6px -1px rgba(26, 54, 93, 0.1), 0 2px 4px -1px rgba(26, 54, 93, 0.06)',
        'card': '0 10px 15px -3px rgba(26, 54, 93, 0.1), 0 4px 6px -2px rgba(26, 54, 93, 0.05)',
        'hover': '0 20px 25px -5px rgba(26, 54, 93, 0.15), 0 10px 10px -5px rgba(26, 54, 93, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}