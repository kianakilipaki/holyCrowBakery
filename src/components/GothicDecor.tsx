export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-[#d094ad] opacity-30" />
      <span className="text-[#d094ad] text-sm tracking-[0.5rem] opacity-70">
        {label ?? '✦ ⋆ ✦'}
      </span>
      <div className="flex-1 h-px bg-[#d094ad] opacity-30" />
    </div>
  )
}

export function StarDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <span className="text-[#d094ad] opacity-50 text-xs">⋆</span>
      <span className="text-[#d094ad] opacity-70 text-sm">✦</span>
      <span className="text-[#d094ad] opacity-50 text-xs">⋆</span>
    </div>
  )
}

export function GFBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide border"
      style={{ backgroundColor: '#9da23d20', color: '#9da23d', borderColor: '#9da23d50', fontFamily: 'Nunito, sans-serif' }}>
      ✓ Celiac-conscious preparation
    </span>
  )
}
