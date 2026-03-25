type Loading3DProps = {
  label?: string;
  className?: string;
};

export function Loading3D({
  label = "Inicializando render 3D...",
  className = "h-96 w-full",
}: Loading3DProps) {
  return (
    <div className={`quantum-loader-shell flex items-center justify-center rounded-[1.8rem] ${className}`}>
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="quantum-loader-core">
          <div className="quantum-loader-ring" />
          <div className="quantum-loader-ring delay-1" />
          <div className="quantum-loader-ring delay-2" />
          <div className="quantum-loader-dot" />
        </div>
        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-100/78">
          {label}
        </div>
      </div>
    </div>
  );
}
