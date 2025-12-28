"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 420;

const CITY_POINTS = [
  {
    name: "Antalya",
    description: "",
    districts: ["Alanya", "Muratpaşa", "Konyaaltı"],
  },
  {
    name: "Ankara",
    description: "",
    districts: ["Çankaya", "Keçiören", "Yenimahalle"],
  },
  {
    name: "Çankırı",
    description: "",
    districts: ["Ilgaz", "Çerkeş", "Kurşunlu"],
  },
  {
    name: "Burdur",
    description: "",
    districts: ["Bucak", "Gölhisar", "Yeşilova"],
  },
  {
    name: "Eskişehir",
    description: "",
    districts: ["Odunpazarı", "Tepebaşı", "Sivrihisar"],
  },
  {
    name: "Konya",
    description: "",
    districts: ["Selçuklu", "Meram", "Karatay"],
  },
  {
    name: "Amasya",
    description: "",
    districts: ["Merkez", "Merzifon", "Suluova"],
  },
] as const;

type Point = { x: number; y: number };

export default function Roadmap3D() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [points, setPoints] = useState<Point[]>(
    Array(CITY_POINTS.length).fill({ x: 0, y: 0 })
  );

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const totalLength = path.getTotalLength();
    const step = totalLength / (CITY_POINTS.length - 1);

    const computed = CITY_POINTS.map((_, idx) => {
      const { x, y } = path.getPointAtLength(totalLength - idx * step);
      return { x, y };
    });

    setPoints(computed);
  }, []);

  return (
    <section className="bg-slate-950 py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: 120 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-emerald-400 font-semibold text-sm uppercase tracking-[0.3em]">
            Yol Haritamız
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-5">
            Sizin İçin Her Yerdeyiz
          </h2>
          <p className="text-slate-400 text-lg">
            Her şehir, bir kilometre taşımızı temsil ediyor.
          </p>
        </div>

        <div className="relative" style={{ perspective: "1200px" }}>
          <div
            className="relative w-full h-[420px]"
            style={{
              transform: "rotateX(12deg) skewX(6deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <svg
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="roadGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="12"
                    stdDeviation="18"
                    floodColor="#14b8a6"
                    floodOpacity="0.25"
                  />
                </filter>
              </defs>
              <path
                ref={pathRef}
                d={`
                  M 1100 220
                  C 980 60, 880 380, 760 210
                  C 630 20, 520 390, 390 210
                  C 280 70, 160 320, 60 220
                `}
                stroke="url(#roadGradient)"
                strokeWidth={24}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#shadow)"
              />
            </svg>

            {points.map((point, idx) => (
              <div
                key={CITY_POINTS[idx].name}
                className="absolute flex flex-col items-center gap-3 text-center"
                style={{
                  left: `${(point.x / VIEWBOX_WIDTH) * 100}%`,
                  top: `${(point.y / VIEWBOX_HEIGHT) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Districts */}
                {CITY_POINTS[idx].districts.map((district, dIdx) => {
                  // Fan out to the right side
                  // dIdx 0: Top-Right
                  // dIdx 1: Right
                  // dIdx 2: Bottom-Right
                  const offsets = [
                    { x: 90, y: -60 }, // Top-Right
                    { x: 110, y: 0 },  // Right
                    { x: 90, y: 60 }   // Bottom-Right
                  ];

                  const { x, y } = offsets[dIdx] || offsets[1];

                  const length = Math.sqrt(x * x + y * y);
                  const angle = Math.atan2(y, x) * (180 / Math.PI);

                  const startOffset = 24;
                  const endOffset = 10;
                  const lineLength = Math.max(0, length - startOffset - endOffset);

                  return (
                    <div
                      key={district}
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: 0,
                        height: 0,
                        overflow: "visible"
                      }}
                    >
                      {/* Line */}
                      <div
                        className="absolute border-t border-dashed border-emerald-500/50 origin-left"
                        style={{
                          width: `${lineLength}px`,
                          height: "1px",
                          left: "0px",
                          top: "0px",
                          transform: `rotate(${angle}deg) translate(${startOffset}px, 0)`,
                        }}
                      />

                      {/* Label */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                        }}
                      >
                        <span className="text-[10px] font-bold tracking-wide text-emerald-100 bg-slate-900/90 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] whitespace-nowrap backdrop-blur-sm">
                          {district}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="relative group z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-lg shadow-emerald-500/40 flex items-center justify-center text-white font-semibold">
                    {idx + 1}
                  </div>
                  <div className="absolute inset-x-0 -bottom-2 h-2 bg-emerald-400/50 blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
                <div className="max-w-xs bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-white z-10">
                  <p className="text-sm font-bold tracking-wide uppercase text-emerald-300 mb-1">
                    {CITY_POINTS[idx].name}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {CITY_POINTS[idx].description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
