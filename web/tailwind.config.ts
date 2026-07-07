import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        'primary-light': '#10B981',
        'primary-subtle': '#ECFDF5',
        'primary-subtle-border': '#A7F3D0',
        danger: '#EF4444',
        'danger-subtle': '#FEF2F2',
        warning: '#F59E0B',
        'warning-subtle': '#FEF3C7',
        info: '#3B82F6',
        'info-subtle': '#EFF6FF',
      },
    },
  },
  plugins: [],
}
export default config
