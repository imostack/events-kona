/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",

        // Primary color system
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          80: "color-mix(in srgb, var(--primary) 80%, white)",
          60: "color-mix(in srgb, var(--primary) 60%, white)",
        },

        // Secondary color system
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          80: "color-mix(in srgb, var(--secondary) 80%, white)",
          60: "color-mix(in srgb, var(--secondary) 60%, white)",
        },

        // Accent colors
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          80: "color-mix(in srgb, var(--accent) 80%, white)",
        },

        // Other semantic colors
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },

      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
  plugins: [],
};
