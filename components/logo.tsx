export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-2xl font-bold text-primary">✿</span>
        <span className="text-xl font-semibold tracking-tight ml-1">Busca Vida Garden</span>
      </div>
    </div>
  )
}
