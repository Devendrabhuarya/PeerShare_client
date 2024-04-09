import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'primary': "#fdfeff",
        'secendary': '#000000',
        'third': '#D9D9D9'
      },
      fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui', 'sans-serif', 'Poppins'],
        'secondary': ['Inria Serif', 'system-ui', 'sans-serif', 'Poppins'],
        'primary': ['ui-sans-serif', 'system-ui', 'sans-serif', 'Poppins'],
        'tag': ['Jacques Francois Shadow', 'system-ui', 'sans-serif', 'Poppins']
        // Add other font families as needed
      },
      zIndex: {
        '100': '100',
      },
      fontWeight: {
        thin: '100',
        hairline: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        'extra-bold': '800',
        black: '900',
      },
      screens: {
        'sm': { 'max': '767px' },
        'md': { 'max': '1023px' },
        'lg': { 'max': '1279px' },
        'xl': { 'min': '1280px' },
      },
    },
  },
  plugins: [],
};
export default config;
