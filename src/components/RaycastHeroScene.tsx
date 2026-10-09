import React, { useEffect, useRef } from 'react';

export interface RaycastHeroSceneProps {
  selectedBg?: string;
  onSelectBg?: (bg: string) => void;
}

export const RAYCAST_BG_OPTIONS = [
  {
    id: 'exact-live',
    name: 'Raycast Dark Straight Ribbons',
    url: '/raycast_dark_straight.png',
    localFallback: '/raycast_dark_straight.png',
  },
  {
    id: 'distortion-4',
    name: 'Red Ribbons 4 (Dense)',
    url: 'https://misc-assets.raycast.com/wallpapers/red_distortion_4_preview.png',
    localFallback: '/red_distortion_4.png',
  },
  {
    id: 'distortion-3',
    name: 'Red Ribbons 3 (Deep Contrast)',
    url: 'https://misc-assets.raycast.com/wallpapers/red_distortion_3_preview.png',
    localFallback: '/red_distortion_3.png',
  },
];

export const RaycastHeroScene: React.FC<RaycastHeroSceneProps> = ({
  selectedBg = 'exact-live',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const activeOption =
    RAYCAST_BG_OPTIONS.find((o) => o.id === selectedBg) || RAYCAST_BG_OPTIONS[0];

  // Smooth, subtle interactive mouse parallax
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX / innerWidth - 0.5) * 2;
      mouseY = (e.clientY / innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      if (imgRef.current) {
        const moveX = currentX * 12;
        const moveY = currentY * 6;
        const rotY = currentX * 1.5;
        const rotX = -currentY * 1.0;
        imgRef.current.style.transform = `scale(1.03) translate3d(${moveX}px, ${moveY}px, 0px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      animId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none bg-[#040506]">
      {/* 1. Straight & Dark Red Ribbons (Authentic Raycast screenshot match) */}
      <img
        ref={imgRef}
        src={activeOption.localFallback || activeOption.url}
        alt="Raycast Dark Red Ribbons Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none will-change-transform"
        style={{
          transform: 'scale(1.03)',
        }}
      />

      {/* 2. Soft bottom fade into void black for continuous page scroll */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 88%, #040506 100%)',
        }}
      />
    </div>
  );
};
