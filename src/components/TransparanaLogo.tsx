import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'print';
  showSlogan?: boolean;
  variant?: 'brand' | 'light' | 'white' | 'dark';
}

export const TransparanaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'sm',
  showSlogan = false,
  variant = 'brand'
}) => {
  // Sizing definitions matching the official mark (proportional to 240x86)
  const dimensions = {
    xs: { width: 62, height: 23 },
    sm: { width: 82, height: 30 },
    md: { width: 115, height: 42 },
    lg: { width: 160, height: 58 },
    xl: { width: 210, height: 76 },
    print: { width: 135, height: 49 }
  };

  const isLight = variant === 'light';
  const isWhite = variant === 'white';

  const cyanColor = isLight ? '#00D8D4' : '#00B7B5';
  const blackAccentColor = isLight || isWhite ? '#FFFFFF' : '#111827';
  const textColor = isLight || isWhite ? '#FFFFFF' : '#111827';

  const dim = dimensions[size] || dimensions.sm;

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none shrink-0 ${className}`}>
      <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 240 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-visible"
      >
        {/* Symbol "TP" Aerodynamic Wings */}
        <g id="tp-symbol" transform="translate(18, 4)">
          {/* Top Bar - Cyan speed streak */}
          <polygon points="42,6 84,6 72,16 30,16" fill={cyanColor} />

          {/* Top & Right Aerodynamic Loop */}
          <path
            d="M 84,6 L 176,6 C 193,6 205,13 205,25 C 205,37 193,44 176,44 L 138,44 L 149,34 L 172,34 C 181,34 189,30 189,25 C 189,20 181,16 172,16 L 72,16 L 84,6 Z"
            fill={cyanColor}
          />

          {/* Middle Bar - Cyan speed streak */}
          <polygon points="28,20 70,20 58,30 16,30" fill={cyanColor} />

          {/* Middle Bar - Black/White 'T' horizontal bar */}
          <polygon points="76,20 166,20 154,30 64,30" fill={blackAccentColor} />

          {/* Bottom Bar - Cyan speed streak */}
          <polygon points="14,34 56,34 44,44 2,44" fill={cyanColor} />

          {/* Bottom Bar - Black/White 'T' angled stem */}
          <polygon points="80,34 118,34 106,44 68,44" fill={blackAccentColor} />
        </g>

        {/* Wordmark TRANSPARANÁ with ample horizontal bounding space */}
        <text
          x="120"
          y="76"
          textAnchor="middle"
          fill={textColor}
          fontFamily="'Arial', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="20.5"
          letterSpacing="1.2"
        >
          TRANSPARANÁ
        </text>
      </svg>

      {showSlogan && (
        <div className={`flex flex-col items-center mt-1 pt-1 border-t ${isLight ? 'border-teal-700/50' : 'border-slate-300'}`}>
          <span className={`text-[11px] font-black tracking-wider uppercase ${isLight ? 'text-teal-300' : 'text-[#205857]'}`}>
            SELENE
          </span>
          <span className={`text-[9px] font-medium leading-tight ${isLight ? 'text-teal-100/90' : 'text-slate-500'}`}>
            Cuidando de Quem Conduz
          </span>
        </div>
      )}
    </div>
  );
};
