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

export default function PrimaryButton({ children, size = 'md', block, className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl bg-emergency text-white font-semibold shadow-card',
        'hover:bg-red-700 active:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed',
        sizeMap[size],
        block ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
