import React from 'react';
import type { FeatureItem } from '../config/siteConfig';
import { IconHelper } from './IconHelper';

interface FeatureGridProps {
  features: FeatureItem[];
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
  return (
    <section id="features" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#1b1c1e] border border-[#ff6363]/40 mb-4 shadow-[0_0_16px_rgba(255,99,99,0.1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6363] animate-pulse" />
          <span className="font-['GeistMono'] text-[11px] font-medium tracking-[0.073em] uppercase text-[#ffffff]">
            THE 5 PILLARS OF THE PROBLEM STATEMENT
          </span>
        </div>
        <h2 className="font-['Inter'] font-normal text-[28px] sm:text-[36px] text-[#ffffff] tracking-tight">
          Every requirement addressed. Zero compromise.
        </h2>
        <p className="mt-3 font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#9c9c9d] max-w-[620px]">
          From high-velocity Groq LPU synthesis to 100% on-device edge privacy, every capability is designed to turn hours of chat overload into instantaneous clarity.
        </p>
      </div>

      {/* Grid of Key-Shadow Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="group relative rounded-[16px] bg-[#07080a] p-6 transition-all duration-300 hover:-translate-y-1.5 border border-[#27282b] hover:border-[#ff6363]/50 hover:shadow-[0_8px_30px_rgba(255,99,99,0.08)]"
            style={{
              boxShadow:
                'rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 8px 24px 0px',
            }}
          >
            {/* Top row: Circular 99999px icon backing + optional badge */}
            <div className="flex items-center justify-between mb-6">
              <div
                className="w-12 h-12 rounded-[99999px] flex items-center justify-center bg-[#111214] border border-[#2f3031] text-[#e6e6e6] transition-transform duration-200 group-hover:scale-105"
                style={{
                  boxShadow:
                    'rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.3) 0px 2px 4px 0px',
                }}
              >
                <IconHelper name={feature.icon} className="w-5 h-5 text-[#e6e6e6]" />
              </div>

              {feature.badge && (
                <span className="font-['GeistMono'] text-[10px] text-[#9c9c9d] bg-[#1b1c1e] px-2 py-0.5 rounded-[6px] border border-[#2f3031]">
                  {feature.badge}
                </span>
              )}
            </div>

            {/* Subheading: 20px Inter 500 in Pure White */}
            <h3 className="font-['Inter'] font-medium text-[20px] text-[#ffffff] leading-[1.2] mb-3">
              {feature.title}
            </h3>

            {/* Body: 16px Inter 400 in Ash #9c9c9d */}
            <p className="font-['Inter'] font-normal text-[15px] text-[#9c9c9d] leading-[1.6]">
              {feature.description}
            </p>

            {/* Metric Footer if available */}
            {feature.metric && (
              <div className="mt-6 pt-4 border-t border-[#1b1c1e] flex items-baseline gap-2">
                <span className="font-['SF_Pro_Text',sans-serif] text-[20px] font-semibold text-[#ffffff]">
                  {feature.metric}
                </span>
                <span className="font-['GeistMono'] text-[11px] text-[#6a6b6c]">
                  {feature.metricLabel}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
