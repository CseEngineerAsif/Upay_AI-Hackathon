import React, { useState } from 'react';

export interface OperatorItem {
  id: 'gp' | 'bl' | 'robi' | 'skitto' | 'teletalk';
  name: string; // Bangla display name (e.g. 'গ্রামীণফোন', 'বাংলালিংক', 'রবি', 'সার্কেল / স্কিটো', 'টেলিটক')
  shortName: string; // 'স্কিটো'
  logo: string;
  prefixes: string[];
  color: string;
}

export const OPERATORS: OperatorItem[] = [
  {
    id: 'gp',
    name: 'গ্রামীণফোন',
    shortName: 'গ্রামীণফোন',
    logo: '/logos/gp.png',
    prefixes: ['017', '013'],
    color: 'text-sky-600'
  },
  {
    id: 'bl',
    name: 'বাংলালিংক',
    shortName: 'বাংলালিংক',
    logo: '/logos/banglalink.png?v=4',
    prefixes: ['019', '014'],
    color: 'text-orange-500'
  },
  {
    id: 'robi',
    name: 'রবি',
    shortName: 'রবি',
    logo: '/logos/robi.png',
    prefixes: ['018'],
    color: 'text-red-500'
  },
  {
    id: 'skitto',
    name: 'সার্কেল / স্কিটো',
    shortName: 'স্কিটো',
    logo: '/logos/skitto.png',
    prefixes: ['0173', '0174'],
    color: 'text-amber-500'
  },
  {
    id: 'teletalk',
    name: 'টেলিটক',
    shortName: 'টেলিটক',
    logo: '/logos/teletalk.png?v=4',
    prefixes: ['015'],
    color: 'text-emerald-600'
  }
];

/**
 * Detect operator from phone number or name string
 */
export function detectOperator(input?: string | null): OperatorItem | null {
  if (!input) return null;
  const clean = input.trim();

  // Match by id
  const byId = OPERATORS.find((op) => op.id === clean.toLowerCase());
  if (byId) return byId;

  // Match by name or contains name
  const byName = OPERATORS.find((op) => 
    op.name === clean || 
    clean.includes(op.shortName) || 
    clean.includes(op.name) ||
    (op.id === 'skitto' && (clean.includes('সার্কেল') || clean.includes('স্কিটো') || clean.toLowerCase().includes('skitto')))
  );
  if (byName) return byName;

  // Match by phone prefix (e.g. 01711223344 or +88017...)
  const num = clean.replace(/[^0-9]/g, '');
  const localNum = num.startsWith('88') ? num.slice(2) : num;

  if (localNum.startsWith('015')) return OPERATORS.find((op) => op.id === 'teletalk') || null;
  if (localNum.startsWith('018')) return OPERATORS.find((op) => op.id === 'robi') || null;
  if (localNum.startsWith('019') || localNum.startsWith('014')) return OPERATORS.find((op) => op.id === 'bl') || null;
  if (localNum.startsWith('017') || localNum.startsWith('013')) return OPERATORS.find((op) => op.id === 'gp') || null;

  return null;
}

export function getOperatorById(id?: string | null): OperatorItem | null {
  if (!id) return null;
  return OPERATORS.find((op) => op.id === id) || null;
}

export function getOperatorByName(name?: string | null): OperatorItem | null {
  if (!name) return null;
  return detectOperator(name);
}

/**
 * Single operator logo symbol component with error handling and Skitto styling
 */
interface OperatorLogoProps {
  operator?: OperatorItem | string | null;
  size?: number; // Size in pixels, e.g. 24, 28, 40
  className?: string;
  alt?: string;
}

export const OperatorLogo: React.FC<OperatorLogoProps> = ({
  operator,
  size = 24,
  className = '',
  alt
}) => {
  const [hasError, setHasError] = useState(false);

  const op = typeof operator === 'string' ? detectOperator(operator) : operator;

  if (!op || hasError) {
    return null;
  }

  const isSkitto = op.id === 'skitto';
  // Skitto has a yellow background: show as a small rounded square (~40px, 8px radius or scaled)
  const borderRadius = isSkitto ? Math.max(3, Math.round(size * 0.2)) : 0;

  return (
    <img
      src={op.logo}
      alt={alt || op.name}
      onError={() => setHasError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: isSkitto ? `${borderRadius}px` : undefined
      }}
      className={`object-contain shrink-0 select-none ${isSkitto ? 'shadow-2xs' : ''} ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};

/**
 * Standard White Operator Card
 * - White rounded card (~12px radius), thin light border, soft shadow
 * - Fixed 40px-high box for logo (object-fit: contain)
 * - Skitto shown as rounded square (40px, 8px radius)
 * - Bangla name below in dark bold text
 * - Selected state: yellow (#FFD21F) border and light yellow background (#FFF9DE / #FFFBEA)
 * - Fallback: hides image on error, only shows Bangla name
 */
interface OperatorCardProps {
  operator: OperatorItem;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({
  operator,
  isSelected,
  onClick,
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const isSkitto = operator.id === 'skitto';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-2.5 rounded-[12px] border flex flex-col items-center justify-between transition-all cursor-pointer select-none text-left ${
        isSelected
          ? 'border-[#FFD21F] bg-[#FFF9DE] ring-2 ring-[#FFD21F]/60 shadow-xs'
          : 'border-slate-200/80 bg-white hover:bg-slate-50/80 shadow-xs hover:border-slate-300'
      } ${className}`}
    >
      {/* Fixed 40px-high logo box */}
      <div className="h-10 w-full flex items-center justify-center overflow-hidden">
        {!hasError ? (
          <img
            src={operator.logo}
            alt={operator.name}
            onError={() => setHasError(true)}
            className={`h-10 object-contain transition-transform ${
              isSkitto
                ? 'w-10 h-10 rounded-[8px] shadow-2xs'
                : 'max-w-[42px] max-h-10'
            }`}
            referrerPolicy="no-referrer"
          />
        ) : null}
      </div>

      {/* Bangla Name below in dark bold text */}
      <span className="text-xs font-bold text-slate-800 text-center mt-1.5 leading-tight tracking-tight block w-full truncate">
        {operator.name}
      </span>
    </button>
  );
};

/**
 * Standard 2-Row Operator Grid
 * Row 1: 3 cards (Grameenphone, Banglalink, Robi)
 * Row 2: 2 cards (Skitto, Teletalk)
 * Equal size, even gaps, centered row 2, fits ~390px width
 */
interface OperatorSelectionGridProps {
  selectedId: string | null;
  onSelect: (op: OperatorItem) => void;
  className?: string;
}

export const OperatorSelectionGrid: React.FC<OperatorSelectionGridProps> = ({
  selectedId,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {/* Row 1: 3 cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {OPERATORS.slice(0, 3).map((op) => (
          <OperatorCard
            key={op.id}
            operator={op}
            isSelected={selectedId === op.id || selectedId === op.name}
            onClick={() => onSelect(op)}
          />
        ))}
      </div>

      {/* Row 2: 2 cards with identical card width and equal gaps */}
      <div className="flex justify-center gap-2.5">
        {OPERATORS.slice(3, 5).map((op) => (
          <div key={op.id} className="w-[calc((100%-1.25rem)/3)]">
            <OperatorCard
              operator={op}
              isSelected={selectedId === op.id || selectedId === op.name}
              onClick={() => onSelect(op)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
