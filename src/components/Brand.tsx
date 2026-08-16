import { Droplet } from 'lucide-react';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
}

export default function Brand({ size = 'md', showTagline = false, variant = 'dark' }: BrandProps) {
  const dims =
    size === 'sm' ? { box: 'h-7 w-7', icon: 16, text: 'text-base' } :
    size === 'lg' ? { box: 'h-12 w-12', icon: 26, text: 'text-2xl' } :
                   { box: 'h-9 w-9', icon: 20, text: 'text-xl' };

  const color = variant === 'dark' ? 'text-navy-900' : 'text-white';
  const sub = variant === 'dark' ? 'text-navy-700/70' : 'text-white/70';

  return (
    <div className="flex items-center gap-3">
      <div className={`${dims.box} rounded-xl bg-navy-900 grid place-items-center shadow-card`}>
        <Droplet size={dims.icon} className="text-emergency" fill="#DC2626" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight ${dims.text} ${color}`}>
          LIFE<span className="text-emergency">·</span>LINK
        </span>
        {showTagline && (
          <span className={`mt-1 text-xs font-medium ${sub}`}>
            Real-Time Emergency Blood Coordination
          </span>
        )}
      </div>
    </div>
  );
}
