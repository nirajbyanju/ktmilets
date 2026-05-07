/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lato", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        body: ["Lato", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        brand: ['"Playfair Display"', "Georgia", "Times New Roman", "serif"],
        display: ['"Playfair Display"', "Georgia", "Times New Roman", "serif"],
      },
      fontSize: {
        xxs: ["0.70rem", "1rem"],
      },
      colors: {
        // Primary color (KTM Test Prep deep blue)
        "opsh-primary": {
          DEFAULT: "#0B1F4D",
          light: "#173A82",
          hover: "#102E68",
          dark: "#071638",
          active: "#05102B",
        },

        // Secondary (KTM strong red)
        "opsh-secondary": {
          DEFAULT: "#D71920",
          light: "#EF3E45",
          dark: "#A90F16",
          hover: "#BE151C",
          active: "#8E0D13",
        },

        // Tertiary (for accents, links, buttons)
        "opsh-third": {
          DEFAULT: "#2563A9",
          light: "#3B82C4",
          dark: "#1D4F87",
          hover: "#2F75BA",
          active: "#173D68",
        },

        // Fourth (interactive elements, hover, buttons)
        "opsh-fourth": {
          DEFAULT: "#007BFF",
          light: "#3395ff",
          dark: "#0062cc",
          hover: "#1a8cff",
          active: "#0056b3",
        },

        // Neutral backgrounds & surfaces
        "opsh-background": {
          DEFAULT: "#F4F5F7",
          light: "#FFFFFF",
          dark: "#E8EBF0",
          muted: "#F8F9FA",
        },

        "opsh-grey": {
          DEFAULT: "#E8EEF2",
          light: "#F1F7FB",
          dark: "#D0D6DC",
          border: "#CED4DA",
        },

        "opsh-darkgrey": {
          DEFAULT: "#4B4B4B",
          light: "#6B6B6B",
          dark: "#2C2C2C",
        },

        "opsh-muted": {
          DEFAULT: "#838282",
          light: "#8A9299",
          dark: "#495057",
        },

        "opsh-black": {
          DEFAULT: "#424242",
          light: "#2C0412",
          dark: "#0C0106",
        },

        "opsh-white": {
          DEFAULT: "#F9F9F9",
          pure: "#FFFFFF",
          off: "#F0F0F0",
        },

        // Status colors
        "opsh-success": {
          DEFAULT: "#2f6f5e",
          light: "#34ce57",
          dark: "#1e7e34",
          hover: "#2eb953",
          active: "#1a7431",
        },

        "opsh-warning": {
          DEFAULT: "#FFC107",
          light: "#ffce3a",
          dark: "#d39e00",
          hover: "#ffca2c",
          active: "#b38b00",
        },

        "opsh-danger": {
          DEFAULT: "#E63946",
          light: "#ea535e",
          dark: "#c41e3a",
          hover: "#e94551",
          active: "#b51a2d",
        },

        "opsh-info": {
          DEFAULT: "#386FA4",
          light: "#4a85b8",
          dark: "#2d5986",
          hover: "#437bb1",
          active: "#264c73",
        },

        // Accent for buttons, hover states
        "opsh-accent": {
          DEFAULT: "#6EA7F7",
          light: "#8ab9f9",
          dark: "#4c8df0",
          hover: "#7db0f8",
          active: "#3d7fe9",
        },
        "opsh-text": {
          DEFAULT: "#f5f0dd",
          light: "#8D8D8D",
          dark: "#5C5C5C",
          muted: "#A0A0A0",
          off: "#F5F0DD",
          black: "#1c1c1e",
        },

        "opsh-texts": {
          DEFAULT: "#5C5C5C",
        },

        // Gradient colors
        "opsh-gradient": {
          primary: "linear-gradient(135deg, #0B1F4D 0%, #173A82 100%)",
          secondary: "linear-gradient(135deg, #D71920 0%, #EF3E45 100%)",
          blue: "linear-gradient(135deg, #007BFF 0%, #3395ff 100%)",
          success: "linear-gradient(135deg, #28A745 0%, #34ce57 100%)",
        },
      },

      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // Box shadow variants
      boxShadow: {
        'opsh-sm': '0 2px 4px rgba(11, 31, 77, 0.1)',
        'opsh-md': '0 4px 8px rgba(11, 31, 77, 0.12)',
        'opsh-lg': '0 8px 16px rgba(11, 31, 77, 0.15)',
        'opsh-xl': '0 12px 24px rgba(11, 31, 77, 0.18)',
        'opsh-inner': 'inset 0 2px 4px rgba(11, 31, 77, 0.06)',

        // Colored shadows
        'opsh-primary': '0 4px 12px rgba(11, 31, 77, 0.2)',
        'opsh-secondary': '0 4px 12px rgba(215, 25, 32, 0.2)',
        'opsh-fourth': '0 4px 12px rgba(0, 123, 255, 0.2)',
      },

      // Border radius variants
      borderRadius: {
        'opsh-sm': '4px',
        'opsh-md': '8px',
        'opsh-lg': '12px',
        'opsh-xl': '16px',
        'opsh-full': '24px',
      },
    },
  },
  plugins: [
    function ({ addComponents, addUtilities }) {
      // Login button gradient
      addComponents({
        ".user-login": {
          background:
            "linear-gradient(to right, #0B1F4D 0%, #0B1F4D 50%, #D71920 50%, #D71920 100%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "right",
          cursor: "pointer",
          transition: "background-position 0.4s ease-in-out",
        },
        ".user-login:hover": {
          backgroundPosition: "left",
        },

        // Gradient buttons
        ".btn-gradient-primary": {
          background: "linear-gradient(135deg, #0B1F4D 0%, #173A82 100%)",
          transition: "all 0.3s ease",
        },
        ".btn-gradient-primary:hover": {
          background: "linear-gradient(135deg, #102E68 0%, #173A82 100%)",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(11, 31, 77, 0.25)",
        },
        ".btn-gradient-primary:active": {
          transform: "translateY(0)",
          boxShadow: "0 2px 4px rgba(11, 31, 77, 0.2)",
        },

        ".btn-gradient-secondary": {
          background: "linear-gradient(135deg, #D71920 0%, #EF3E45 100%)",
          transition: "all 0.3s ease",
        },
        ".btn-gradient-secondary:hover": {
          background: "linear-gradient(135deg, #BE151C 0%, #EF3E45 100%)",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(215, 25, 32, 0.25)",
        },
        ".btn-gradient-secondary:active": {
          transform: "translateY(0)",
          boxShadow: "0 2px 4px rgba(215, 25, 32, 0.2)",
        },

        // Hover effect utilities
        ".hover-lift": {
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        },
        ".hover-lift:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
        },

        ".hover-glow-primary": {
          transition: "box-shadow 0.3s ease",
        },
        ".hover-glow-primary:hover": {
          boxShadow: "0 0 20px rgba(11, 31, 77, 0.3)",
        },

        ".hover-glow-secondary": {
          transition: "box-shadow 0.3s ease",
        },
        ".hover-glow-secondary:hover": {
          boxShadow: "0 0 20px rgba(215, 25, 32, 0.3)",
        },

        // Card styles
        ".card-hover": {
          transition: "all 0.3s ease",
        },
        ".card-hover:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(11, 31, 77, 0.15)",
        },

        // Border transitions
        ".border-hover-primary": {
          border: "2px solid transparent",
          transition: "border-color 0.3s ease",
        },
        ".border-hover-primary:hover": {
          borderColor: "#0B1F4D",
        },

        ".border-hover-secondary": {
          border: "2px solid transparent",
          transition: "border-color 0.3s ease",
        },
        ".border-hover-secondary:hover": {
          borderColor: "#D71920",
        },

        // Text hover effects
        ".text-hover-primary": {
          transition: "color 0.2s ease",
        },
        ".text-hover-primary:hover": {
          color: "#0B1F4D",
        },

        ".text-hover-secondary": {
          transition: "color 0.2s ease",
        },
        ".text-hover-secondary:hover": {
          color: "#D71920",
        },

        // Background transitions
        ".bg-transition": {
          transition: "background-color 0.3s ease",
        },

        // Scale on hover
        ".scale-hover": {
          transition: "transform 0.2s ease",
        },
        ".scale-hover:hover": {
          transform: "scale(1.05)",
        },

        ".scale-hover-sm": {
          transition: "transform 0.2s ease",
        },
        ".scale-hover-sm:hover": {
          transform: "scale(1.02)",
        },
      });

      // Add custom utilities
      addUtilities({
        // Text gradients
        '.text-gradient-primary': {
          background: 'linear-gradient(135deg, #0B1F4D 0%, #173A82 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          background: 'linear-gradient(135deg, #D71920 0%, #EF3E45 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-blue': {
          background: 'linear-gradient(135deg, #007BFF 0%, #3395ff 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },

        // Smooth transitions
        '.transition-all-smooth': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.transition-colors-smooth': {
          transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },

        // Focus styles
        '.focus-ring-primary': {
          '&:focus': {
            outline: 'none',
            'ring-2': 'ring-opsh-primary',
            'ring-offset-2': 'ring-offset-2',
          },
        },
        '.focus-ring-secondary': {
          '&:focus': {
            outline: 'none',
            'ring-2': 'ring-opsh-secondary',
            'ring-offset-2': 'ring-offset-2',
          },
        },

        // Glass morphism effect
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-effect-dark': {
          background: 'rgba(0, 0, 0, 0.2)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.max-w-opsh': {
          maxWidth: '1480px',
        },
        '.container': {
          maxWidth: '1480px',
        },
        '.container-opsh': {
          maxWidth: '1350',
        },
      });
    },
  ],
});
