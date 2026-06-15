import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, useTransform, HTMLMotionProps } from 'motion/react';

interface SpotlightCardProps extends Omit<HTMLMotionProps<'div'>, 'style'> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. "rgba(124, 58, 237, 0.15)" (violet)
  borderColor?: string; // e.g. "rgba(124, 58, 237, 0.4)"
  tiltEnabled?: boolean;
}

export function SpotlightCard({
  children,
  className = '',
  glowColor = 'rgba(124, 58, 237, 0.12)',
  borderColor = 'rgba(124, 58, 237, 0.3)',
  tiltEnabled = true,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Background spotlight glow template
  const backgroundGlow = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 80%)`;
  
  // Border spotlight template to make the borders glow under the path of the cursor
  const borderGlow = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${borderColor}, transparent 80%)`;

  useEffect(() => {
    if (cardRef.current) {
      setDimensions({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight
      });
    }
  }, []);

  // Update dimensions if window gets resized
  useEffect(() => {
    const handleResize = () => {
      if (cardRef.current) {
        setDimensions({
          width: cardRef.current.offsetWidth,
          height: cardRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optional 3D tilt effects
  const rotateX = useTransform(mouseY, [0, dimensions.height || 400], [5, -5]);
  const rotateY = useTransform(mouseX, [0, dimensions.width || 400], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    if (props.onMouseMove) props.onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Gracefully transition back to the center style when mouse leaves
    mouseX.set(dimensions.width / 2);
    mouseY.set(dimensions.height / 2);
    if (props.onMouseLeave) props.onMouseLeave(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    if (props.onMouseEnter) props.onMouseEnter(e);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
      style={
        tiltEnabled
          ? {
              rotateX: rotateX,
              rotateY: rotateY,
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }
          : {}
      }
      className={`glass-card relative overflow-hidden rounded-[24px] ${className} border-white/5 transition-shadow duration-300`}
    >
      {/* Spotlight glow layer inside card */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-100 transition-opacity duration-300"
        style={{ background: backgroundGlow }}
      />

      {/* Dynamic border highlight on hover */}
      <motion.div
        className="pointer-events-none absolute -inset-[1px] z-10 rounded-[24px] opacity-100 transition-opacity duration-300"
        style={{
          background: borderGlow,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskComposite: 'xor',
          padding: '1px' // Creates the 1px border matching card bounds
        }}
      />

      {/* Card Content layer with preserver-3d so text/content has dimension */}
      <div className="relative z-20 h-full w-full" style={{ transform: 'translateZ(10px)' }}>
        {children}
      </div>
    </motion.div>
  );
}
