import { Hospital, MapPin } from 'lucide-react';

export default function MapPlaceholder({ progress = 0 }: { progress?: number }) {
  // progress 0..1
  const clamped = Math.max(0, Math.min(1, progress));
  const donorX = 30;
  const donorY = 70;
  const hospitalX = 230;
  const hospitalY = 50;

  const dotX = donorX + (hospitalX - donorX) * clamped;
  const dotY = donorY + (hospitalY - donorY) * clamped;

  return (
    <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 160"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dbe2ec" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* fake roads */}
        <path d="M 0 90 L 300 70" stroke="#c8d3e2" strokeWidth="6" strokeLinecap="round" />
        <path d="M 80 0 L 110 160" stroke="#c8d3e2" strokeWidth="4" strokeLinecap="round" />
        <path d="M 200 0 L 220 160" stroke="#c8d3e2" strokeWidth="4" strokeLinecap="round" />
        <path d="M 0 40 L 300 30" stroke="#dbe2ec" strokeWidth="3" strokeLinecap="round" />
        <path d="M 0 120 L 300 130" stroke="#dbe2ec" strokeWidth="3" strokeLinecap="round" />
        {/* route */}
        <line
          x1={donorX}
          y1={donorY}
          x2={hospitalX}
          y2={hospitalY}
          stroke="#0F4C81"
          strokeWidth="2.5"
          className="route-dash"
        />
        {/* moving dot */}
        <circle cx={dotX} cy={dotY} r="6" fill="#0F4C81" />
        <circle cx={dotX} cy={dotY} r="11" fill="#0F4C81" fillOpacity="0.18" />
        {/* donor pin */}
        <g transform={`translate(${donorX - 8}, ${donorY - 22})`}>
          <circle cx="8" cy="8" r="8" fill="#DC2626" />
          <circle cx="8" cy="8" r="3" fill="white" />
        </g>
        {/* hospital pin */}
        <g transform={`translate(${hospitalX - 10}, ${hospitalY - 26})`}>
          <rect x="0" y="0" width="20" height="20" rx="4" fill="#0A1C33" />
          <path d="M10 4 L12 9 L17 9 L13 12 L15 17 L10 14 L5 17 L7 12 L3 9 L8 9 Z" fill="#DC2626" />
        </g>
      </svg>
      <div className="relative h-40 sm:h-44" />
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
        <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-md px-2 py-1 text-navy-800 font-semibold ring-1 ring-slate-200">
          <MapPin size={12} className="text-emergency" /> Donor
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-md px-2 py-1 text-navy-800 font-semibold ring-1 ring-slate-200">
          <Hospital size={12} className="text-navy-900" /> Hospital
        </div>
      </div>
    </div>
  );
}
