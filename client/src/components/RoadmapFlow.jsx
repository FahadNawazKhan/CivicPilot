import React from 'react';

const RoadmapFlow = ({
  steps = [],
  completedSteps = {},
  currentStepIndex,
  onToggleStep,
  onStepClick,
  selectedStepId
}) => {
  return (
    <div className="relative pl-6 border-l border-dashed border-ink/25 space-y-6">
      {steps.map((step, idx) => {
        const isCompleted = !!completedSteps[step.id];
        const isSelected = selectedStepId === step.id;
        const isNextStep = idx === currentStepIndex;

        return (
          <div
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`relative p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
              isSelected 
                ? 'bg-[#FAF4E5] border-brass ring-1 ring-brass/30' 
                : 'bg-[#FDFDFC] border-ink/10 hover:border-brass/50'
            }`}
          >
            {/* Timeline Circle Bullet */}
            <div 
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering details selection
                onToggleStep(step.id);
              }}
              className={`absolute -left-[35px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold transition-all shadow-xs ${
                isCompleted
                  ? 'bg-inkGreen border-inkGreen text-parchment hover:bg-inkGreen/95'
                  : isNextStep
                  ? 'bg-brass border-brass text-parchment animate-pulse'
                  : 'bg-[#F2ECD9] border-ink/15 text-ink/40 hover:bg-[#FAF6EE]/70'
              }`}
              title={isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              <span>{isCompleted ? '✓' : idx + 1}</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className={`font-garamond font-bold text-sm uppercase tracking-wide transition-colors ${
                  isCompleted ? 'line-through text-ink/40' : 'text-ink'
                }`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-ink/50 font-mono mt-0.5">
                  Est. time: {step.duration}
                </p>
              </div>
              
              <span className="font-mono text-[9px] text-inkRed/70 font-extrabold uppercase bg-parchment px-1.5 py-0.5 rounded border border-ink/5 shrink-0">
                {step.cost}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapFlow;