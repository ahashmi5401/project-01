'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import SectionEyebrow from '@/components/shared/SectionEyebrow';

export default function Hero() {
  const teethCount = 18;
  const cx = 200;
  const cy = 200;
  const rOuter = 100;
  const toothWidth = 22;
  const toothHeight = 16;

  return (
    <section className="relative min-h-screen pt-28 pb-16 flex items-center overflow-hidden border-b border-hairline">
      {/* Grid Pattern Accent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/30 to-navy pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
        {/* Left Copy Column */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <SectionEyebrow text="Engineering Design & Simulation Lab" />
          
          <h1 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-offwhite mb-6 leading-[1.1]">
            Design.<br className="hidden sm:inline" />
            Simulate. <span className="text-accent">Innovate.</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-steelblue mb-8 max-w-xl leading-relaxed">
            At Simuflux Lab, we are committed to empowering engineers, students, researchers, and industries through professional engineering training and advanced simulation solutions, bridging the gap between theory and practical industrial application.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Primary WhatsApp CTA Button */}
            <WhatsAppButton message="Hello SimuFlux, I would like to inquire about your engineering training and consultancy services." />
            
            {/* Secondary Outline Link */}
            <Link
              href="/consultancy"
              className="inline-flex items-center justify-center px-6 py-3 font-mono text-xs uppercase tracking-wider text-offwhite border border-hairline hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </div>

        {/* Right Programmatic Blueprint SVG Gear Column */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="relative w-full max-w-[400px] aspect-square border border-hairline/80 bg-navy/40 p-4 select-none">
            
            {/* Blueprint Grid Calibration Markers */}
            <div className="absolute top-2 left-2 font-mono text-[9px] text-steelblue/50">GRID: 18mm</div>
            <div className="absolute bottom-2 right-2 font-mono text-[9px] text-steelblue/50">DWG NO: SF-001-A</div>
            <div className="absolute top-2 right-2 font-mono text-[9px] text-accent font-bold">SCALE: 1:1</div>

            <svg
              viewBox="0 0 400 400"
              className="w-full h-full text-offwhite/80"
              role="img"
              aria-label="Technical line drawing of a spur gear with cross-sections and dimension markers"
            >
              <defs>
                {/* Cross-hatching pattern for sections */}
                <pattern
                  id="hatch-pattern"
                  width="10"
                  height="10"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="10"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                </pattern>
                
                {/* Arrowheads */}
                <marker
                  id="arrow-accent"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#E8622C" />
                </marker>
                
                <marker
                  id="arrow-white"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.4)" />
                </marker>
              </defs>

              {/* Center crosshair dashed lines */}
              <line
                x1="40"
                y1="200"
                x2="360"
                y2="200"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1"
                strokeDasharray="16, 4, 2, 4"
              />
              <line
                x1="200"
                y1="40"
                x2="200"
                y2="360"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1"
                strokeDasharray="16, 4, 2, 4"
              />

              {/* Pitch Circle Diameter (PCD) */}
              <circle
                cx={cx}
                cy={cy}
                r={100}
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1"
                strokeDasharray="4, 4"
              />

              {/* Rotating Gear Group */}
              <g className="animate-spin-slow origin-center">
                {/* Programmatic Gear Teeth */}
                {Array.from({ length: teethCount }).map((_, i) => {
                  const angle = (i * 360) / teethCount;
                  return (
                    <rect
                      key={i}
                      x={cx - toothWidth / 2}
                      y={cy - rOuter - toothHeight / 2}
                      width={toothWidth}
                      height={toothHeight}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.7)"
                      strokeWidth="1.5"
                      transform={`rotate(${angle}, ${cx}, ${cy})`}
                      rx="2"
                    />
                  );
                })}

                {/* Outer Rim Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rOuter}
                  fill="#0F2A47"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1.5"
                />

                {/* Inner Hub Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={50}
                  fill="url(#hatch-pattern)"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1.5"
                />

                {/* Shaft Hole */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={22}
                  fill="#0F2A47"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1.5"
                />

                {/* Keyway Slot */}
                <rect
                  x={cx - 5}
                  y={cy - 28}
                  width={10}
                  height={8}
                  fill="#0F2A47"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1.5"
                />
              </g>

              {/* Static CAD Annotations & Dimension Lines (Engineering blueprint details) */}
              
              {/* Gear Outer Diameter Dimension */}
              <line
                x1="80"
                y1="80"
                x2="130"
                y2="130"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              <line
                x1="320"
                y1="320"
                x2="270"
                y2="270"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              <line
                x1="60"
                y1="60"
                x2="340"
                y2="340"
                stroke="#E8622C"
                strokeWidth="1"
                markerStart="url(#arrow-accent)"
                markerEnd="url(#arrow-accent)"
              />
              
              {/* Outer dimension text box */}
              <rect x="250" y="275" width="60" height="15" fill="#0F2A47" />
              <text
                x="280"
                y="286"
                fill="#E8622C"
                className="font-mono text-[9px] font-bold text-center"
                textAnchor="middle"
              >
                Ø 216.00
              </text>

              {/* Pitch Circle Diameter (PCD) Marker */}
              <line
                x1="300"
                y1="200"
                x2="345"
                y2="170"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              <line
                x1="345"
                y1="170"
                x2="380"
                y2="170"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              <text
                x="350"
                y="164"
                fill="rgba(255, 255, 255, 0.6)"
                className="font-mono text-[8px]"
              >
                PCD Ø 200.00
              </text>

              {/* Keyway Spec */}
              <line
                x1="195"
                y1="180"
                x2="140"
                y2="155"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              <line
                x1="140"
                y1="155"
                x2="80"
                y2="155"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              <text
                x="85"
                y="150"
                fill="rgba(255, 255, 255, 0.6)"
                className="font-mono text-[8px]"
              >
                KEYWAY 10x8
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* CFD Facebook Video Placeholder comment */}
      {/* TODO: client has a real CFD simulation video on their Facebook page — request the original file and drop it in /public/videos/cfd-demo.mp4, then uncomment this block */}
      {/* 
      <div className="absolute bottom-6 left-6 hidden md:block">
        <div className="w-[180px] border border-hairline bg-navy/60 p-2 font-mono text-[9px] text-steelblue flex flex-col gap-1.5">
          <div className="flex items-center justify-between border-b border-hairline pb-1 text-[8px] uppercase tracking-wider text-accent font-bold">
            <span>Video Feed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </div>
          <p className="leading-tight">Simulation video clip to be loaded here.</p>
          <div className="aspect-video bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
            <span className="opacity-40">cfd-demo.mp4</span>
          </div>
        </div>
      </div>
      */}
    </section>
  );
}
