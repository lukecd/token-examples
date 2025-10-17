'use client';

import { useEffect, useState } from 'react';

interface StaticStrip {
  id: number;
  top: number;
  height: number;
  intensity: number;
  color: string;
  animationDelay: number;
}

const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const generateStaticStrips = (totalHeight: number): StaticStrip[] => {
  const strips: StaticStrip[] = [];
  let currentTop = 0;
  let id = 0;

  while (currentTop < totalHeight) {
    const stripHeight = random(1, 4);
    const remainingHeight = totalHeight - currentTop;
    const actualHeight = Math.min(stripHeight, remainingHeight);
    
    // All brand colors with much lower intensities
    const colors = ['#FFBD48', '#4EC9C0', '#C6B8FF', '#FF3FAE'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    strips.push({
      id: id++,
      top: currentTop,
      height: actualHeight,
      intensity: random(0.02, 0.15), // Much more subtle
      color,
      animationDelay: random(0, 3)
    });

    currentTop += actualHeight;
  }

  return strips;
};

interface TVStaticGlitchProps {
  isActive: boolean;
  className?: string;
}

export default function TVStaticGlitch({ isActive, className = '' }: TVStaticGlitchProps) {
  const [strips, setStrips] = useState<StaticStrip[]>([]);

  useEffect(() => {
    if (isActive) {
      const generatedStrips = generateStaticStrips(400); // Height for swap card
      setStrips(generatedStrips);
    } else {
      setStrips([]); // Clear strips when not active
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={`tv-static-overlay ${className}`}>
      {/* TV Static Strips */}
      {strips.map((strip) => (
        <div
          key={strip.id}
          className="static-strip"
          style={{
            top: `${strip.top}px`,
            height: `${strip.height}px`,
            backgroundColor: strip.color,
            opacity: strip.intensity,
            animationDelay: `${strip.animationDelay}s`
          }}
        />
      ))}
      
      {/* Scan Lines */}
      <div className="scan-lines"></div>
      
      {/* TV Static Noise */}
      <div className="tv-noise"></div>
    </div>
  );
}
