import React from 'react';
import type { TooltipRenderProps } from 'react-joyride';

export const DemoTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  size,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div
      {...tooltipProps}
      className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Step counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          {index + 1} of {size}
        </span>
        <button
          {...skipProps}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          Skip Tour
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-slate-700 leading-relaxed mb-5">
        {step.content}
      </p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: size }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === index ? 'bg-blue-600' : i < index ? 'bg-blue-300' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        {index > 0 && (
          <button
            {...backProps}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Back
          </button>
        )}
        {continuous && (
          <button
            {...primaryProps}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            {index === size - 1 ? 'Finish Tour' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
};
