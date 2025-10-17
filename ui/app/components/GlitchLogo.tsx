'use client';

import { useEffect, useState } from 'react';

interface Strip {
  id: number;
  top: number;
  height: number;
  glitchX1: number;
  glitchHue1: number;
  glitchX2: number;
  glitchHue2: number;
  animationName: string;
  duration: number;
  delay: number;
}

const random = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min)) + min;
};

const generateStrips = (totalHeight: number): Strip[] => {
  const strips: Strip[] = [];
  let currentTop = 0;
  let id = 0;

  // Generate strips with guaranteed complete coverage
  while (currentTop < totalHeight) {
    const remainingHeight = totalHeight - currentTop;
    const stripHeight = Math.min(random(2, 4), remainingHeight);
    
    // For the last strip, use ALL remaining height to ensure complete coverage
    const actualHeight = remainingHeight <= 4 ? remainingHeight : stripHeight;
    
    const duration = random(5, 10);
    const animationName = `glitch-${duration}`;
    
    strips.push({
      id: id++,
      top: currentTop,
      height: actualHeight,
      glitchX1: random(-25, 25), // Much more dramatic horizontal displacement
      glitchHue1: random(-120, 120), // More dramatic color shifts
      glitchX2: random(-25, 25),
      glitchHue2: random(-120, 120),
      animationName,
      duration: duration * 2000, // Much slower animations
      delay: random(0, 3) // Longer delays for less frequent glitching
    });

    currentTop += actualHeight;
    
    // Safety check to prevent infinite loops
    if (actualHeight <= 0) break;
  }

  // Debug: log the total coverage
  console.log(`Generated ${strips.length} strips, total height: ${currentTop}/${totalHeight}`);
  console.log('Strips:', strips.map(s => `top: ${s.top}, height: ${s.height}`));
  
  return strips;
};

export default function GlitchLogo() {
  const [strips, setStrips] = useState<Strip[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Generate strips for a logo that's approximately 92px tall (15% bigger)
    const logoHeight = 92;
    const generatedStrips = generateStrips(logoHeight);
    setStrips(generatedStrips);
  }, []);

  return (
    <div 
      className="glitch-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {strips.map((strip) => (
        <div
          key={strip.id}
          className={`glitch-strip ${isHovered ? 'glitch-intensified' : ''}`}
          style={{
            '--glitch-x-1': `${strip.glitchX1}px`,
            '--glitch-hue-1': `${strip.glitchHue1}deg`,
            '--glitch-x-2': `${strip.glitchX2}px`,
            '--glitch-hue-2': `${strip.glitchHue2}deg`,
            top: `${strip.top}px`,
            backgroundPosition: `0 -${strip.top}px`,
            height: `${strip.height}px`,
            animationName: strip.animationName,
            animationDuration: `${strip.duration}ms`,
            animationDelay: `${strip.delay}s`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
