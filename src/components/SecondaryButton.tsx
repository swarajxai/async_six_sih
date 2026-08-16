import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}

const sizeMap = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export default function SecondaryButton({ children, size = 'md', block, className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl bg-white text-navy-900 font-semibold ring-1 ring-slate-200 shadow-card',
        'hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed',
        sizeMap[size],
        block ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
