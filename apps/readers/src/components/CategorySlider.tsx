import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CategorySliderProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  autoSlideIntervalMs?: number;
}

export function CategorySlider({
  categories,
  selectedCategory,
  onSelectCategory,
  autoSlideIntervalMs = 4500,
}: CategorySliderProps) {
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLButtonElement>(null);

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoSliding || isHovered || categories.length <= 1) return;

    const timer = setInterval(() => {
      const currentIndex = categories.indexOf(selectedCategory);
      const nextIndex = (currentIndex + 1) % categories.length;
      onSelectCategory(categories[nextIndex]);
    }, autoSlideIntervalMs);

    return () => clearInterval(timer);
  }, [isAutoSliding, isHovered, selectedCategory, categories, onSelectCategory, autoSlideIntervalMs]);

  // Smooth scroll active category pill into center view
  useEffect(() => {
    if (activePillRef.current && scrollContainerRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedCategory]);

  const handlePrev = () => {
    const currentIndex = categories.indexOf(selectedCategory);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    onSelectCategory(categories[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = categories.indexOf(selectedCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    onSelectCategory(categories[nextIndex]);
  };

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        {/* Left: Active Section Label */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
            {selectedCategory === 'all' ? 'All Section Dispatches' : selectedCategory}
          </span>
        </div>

        {/* Right: Auto-Slide Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>{isAutoSliding ? (isHovered ? 'Paused (Hover)' : 'Auto-Sliding') : 'Manual'}</span>
          </div>

          {/* Play/Pause toggle */}
          <button
            type="button"
            onClick={() => setIsAutoSliding(!isAutoSliding)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer border ${
              isAutoSliding
                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isAutoSliding ? 'Pause auto-rotation' : 'Enable auto-rotation'}
          >
            {isAutoSliding ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="hidden sm:inline">{isAutoSliding ? 'Pause' : 'Auto Play'}</span>
          </button>

          {/* Left / Right Carousel Nav Arrows */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Previous section"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Next section"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slidable Categories Pills Track */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                ref={isSelected ? activePillRef : null}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#1e1b4b] text-white shadow-md scale-102 ring-2 ring-indigo-900/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Sections' : cat}
              </button>
            );
          })}
        </div>

        {/* Auto-slide Animated Progress Bar Indicator */}
        {isAutoSliding && !isHovered && (
          <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
            <div
              key={selectedCategory}
              className="h-full bg-indigo-600 transition-all ease-linear"
              style={{
                animation: `categoryProgress ${autoSlideIntervalMs}ms linear infinite`,
              }}
            />
          </div>
        )}
      </div>

      {/* Inline keyframe animation style */}
      <style>{`
        @keyframes categoryProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
