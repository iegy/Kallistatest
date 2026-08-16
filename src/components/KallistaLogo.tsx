import React from 'react';

interface KallistaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'monochrome' | 'gold';
  customImageUrl?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  subtitleClassName?: string;
  inverted?: boolean;
}

export const KallistaLogo: React.FC<KallistaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'color',
  customImageUrl,
  showSubtitle = false,
  subtitleText = 'BY RONADISA',
  subtitleClassName = '',
  inverted = false,
}) => {
  if (customImageUrl) {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={customImageUrl}
          alt="Kallista Logo"
          draggable={false}
          className={`max-w-full object-contain transition-transform duration-300 ${
            size === 'sm' ? 'h-7' : size === 'md' ? 'h-10' : size === 'lg' ? 'h-16' : 'h-24'
          }`}
          referrerPolicy="no-referrer"
        />
        {showSubtitle && (
          <span
            className={`text-[9px] tracking-[0.35em] uppercase mt-1 font-light ${subtitleClassName} ${
              inverted ? 'text-[#c6a585]' : 'text-[#8a8075]'
            }`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    );
  }

  // Exact letter heights and viewBox for the stylized K Λ L L I S T Λ logo
  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  };

  // Authentic color palette extracted directly from user's official logo image (IMG-20260731-WA0100.jpg)
  const colors = {
    K: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#7D8B7A', // Sage Olive Green
    A1: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#CE8864', // Terracotta Ochre
    L1: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#C7B7A2', // Warm Champagne
    L2: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#CCBFAD', // Soft Sand Beige
    I: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#7D8B7A', // Sage Olive Green
    S: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#CD8260', // Terracotta Coral
    T: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#BCAFA0', // Warm Taupe
    A2: variant === 'monochrome' ? 'currentColor' : variant === 'gold' ? '#c6a585' : '#6F7F6C', // Deep Moss Green
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Pristine Vector SVG rendering matching exact letter geometry */}
      <svg
        viewBox="0 0 540 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heights[size]} max-w-full w-auto`}
        aria-label="KALLISTA"
      >
        {/* Letter K */}
        <path
          d="M 12 8 L 12 56 M 12 33 L 42 8 M 22 24 L 44 56"
          stroke={colors.K}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter Λ (Chevron / Inverted V) */}
        <path
          d="M 72 56 L 94 8 L 116 56"
          stroke={colors.A1}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter L */}
        <path
          d="M 144 8 L 144 56 L 174 56"
          stroke={colors.L1}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter L */}
        <path
          d="M 204 8 L 204 56 L 234 56"
          stroke={colors.L2}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter I */}
        <path
          d="M 264 8 L 264 56"
          stroke={colors.I}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Letter S */}
        <path
          d="M 334 16 C 330 9, 314 7, 304 14 C 292 22, 292 32, 334 38 C 342 40, 344 48, 338 52 C 330 57, 308 57, 300 48"
          stroke={colors.S}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter T */}
        <path
          d="M 374 8 L 420 8 M 397 8 L 397 56"
          stroke={colors.T}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter Λ (Chevron / Inverted V) */}
        <path
          d="M 448 56 L 470 8 L 492 56"
          stroke={colors.A2}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showSubtitle && (
        <span
          className={`tracking-[0.45em] text-[#8a8075] uppercase font-serif mt-1 ${subtitleClassName} ${
            size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-xs'
          }`}
          style={{ letterSpacing: '0.45em' }}
        >
          {subtitleText}
        </span>
      )}
    </div>
  );
};
