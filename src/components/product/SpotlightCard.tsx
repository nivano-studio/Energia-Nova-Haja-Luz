import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  glowColor?: string;
  glowSize?: number;
  glowOpacity?: number;
  contentClassName?: string;
  as?: React.ElementType;
}

export default function SpotlightCard({
  children,
  className = '',
  glowColor = 'rgba(255, 210, 0, 0.15)', // Default is a beautiful yellow glow
  glowSize = 400,
  glowOpacity = 1,
  contentClassName = 'relative z-20 flex flex-col justify-between h-full w-full',
  style = {},
  as: Component = 'div',
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <Component
      ref={cardRef as React.RefObject<never>}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* Background Glow Layer (Desfoque/Glow seguindo o mouse) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-[1]"
        style={{
          background: `radial-gradient(${glowSize * 0.6}px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          filter: 'blur(24px)',
          opacity: isHovered ? glowOpacity : 0,
        }}
      />
      
      {/* Border Glow Layer (Borda iluminada acompanhando o mouse) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          padding: '1px',
          background: `radial-gradient(${glowSize * 0.8}px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Content wrapper to keep it above the glow layer */}
      <div className={contentClassName}>
        {children}
      </div>

      {/* Foreground Highlight Layer (Spotlight sobre os itens opacos) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-50 mix-blend-screen"
        style={{
          background: `radial-gradient(${glowSize * 0.45}px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          opacity: isHovered ? glowOpacity * 0.6 : 0,
        }}
      />
    </Component>
  );
}
