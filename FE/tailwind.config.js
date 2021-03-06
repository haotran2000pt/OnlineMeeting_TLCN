const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './layouts/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  mode: "jit",
  theme: {
    extend: {
      colors: {
        teal: colors.teal,
        emerald: colors.emerald,
        cyan: colors.cyan,
        tan: "#EBE7E4",
        main: "rgb(244,247,246)",
        gumbo: "#83A9AC",
        darkblue: "#2E446F",
        "darkblue-2": "#484F68",
        "darkblue-3": "#34495E",
        indigo: colors.indigo,
        lightblue: "#EDF0FF",
        "lightblue-100": "#e3e7ff",
        truegray: colors.trueGray,
        warmgray: colors.warmGray
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
