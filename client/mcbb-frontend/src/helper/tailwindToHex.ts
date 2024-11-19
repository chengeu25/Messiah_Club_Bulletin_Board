type TailwindColorShades = {
  [key: number]: string;
};

type TailwindColors = {
  [key: string]: string | TailwindColorShades;
};

const tailwindColors: TailwindColors = {
  transparent: 'transparent',
  black: '#000000',
  white: '#ffffff',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#0F172A' // Added 950 shade
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A1',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#67000D' // Added 950 shade
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#1E1A78' // Added 950 shade
  },
  green: {
    50: '#ECFDF5',
    100: '#C6F6D5',
    200: '#9AE6B4',
    300: '#68D391',
    400: '#48BB78',
    500: '#38A169',
    600: '#2F855A',
    700: '#276749',
    800: '#22543D',
    900: '#1C4532',
    950: '#0F3B2D' // Added 950 shade
  },
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FCEB8B',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#4D3B0D' // Added 950 shade
  },
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A855F7',
    500: '#9333EA',
    600: '#7E22CE',
    700: '#6B21A8',
    800: '#581C87',
    900: '#4C1D6E',
    950: '#3B0F6D' // Added 950 shade
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#6A2C0D' // Added 950 shade
  }
};

const tailwindColorToHex = (color: string): string | null => {
  const [colorName, shade] = color.split('-');

  if (tailwindColors[colorName]) {
    if (typeof tailwindColors[colorName] === 'string') {
      return tailwindColors[colorName]; // Return hex for colors without shades
    } else if (shade && !isNaN(Number(shade))) {
      const shadeNumber = Number(shade);
      if (tailwindColors[colorName][shadeNumber]) {
        return tailwindColors[colorName][shadeNumber]; // Return hex for specific shades
      }
    }
  }

  return null; // Return null if color is not found
};

export default tailwindColorToHex;
