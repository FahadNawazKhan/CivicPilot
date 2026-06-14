import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileDown, 
  RefreshCw, 
  Landmark, 
  FileText, 
  ClipboardList, 
  FolderClosed, 
  HelpCircle, 
  ExternalLink, 
  Compass,
  MessageSquare
} from 'lucide-react';

import RoadmapFlow from './RoadmapFlow';
import EligibilityChecker from './EligibilityChecker';
import DocumentVerification from './DocumentVerification';
import CitizenHubPanel from './CitizenHubPanel';

const Dashboard = ({
  selectedProcess,
  setSelectedProcess,
  completedSteps = {},
  handleResetProgress,
  generateActionPlanPDF,
  isEligible,
  setIsEligible,
  progressPct,
  mobileDashboardView,
  setMobileDashboardView,
  activeTab,
  setActiveTab,
  selectedStepId,
  setSelectedStepId,
  handleToggleStep,
  handleDocVerified,
  verifiedDocs = {},
  csrfToken,
  setIsChatOpen,
  documentVault,
  setDocumentVault,
  currentUser
}) => {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="notebook-container grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] relative p-4 sm:p-10 lg:p-12"
    >
      {/* Spine and loops decorative elements */}
      <div className="hidden lg:block notebook-spine" />
      <div className="hidden lg:flex notebook-binder-rings">
        <div className="binder-ring" />
        <div className="binder-ring" />
        <div className="binder-ring" />
        <div className="binder-ring" />
        <div className="binder-ring" />
      </div>

      {/* Mobile segment toggle tab bar (only visible below lg) */}
      <div className="lg:hidden col-span-1 bg-[#F2ECD9] border border-ink/15 p-1 rounded-xl mb-4 text-[10px] font-mono font-bold w-full shadow-xs flex">
        <button
          onClick={() => setMobileDashboardView('roadmap')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all uppercase ${
            mobileDashboardView === 'roadmap'
              ? 'bg-brass text-parchment shadow-sm'
              : 'text-ink/70 hover:bg-parchment/40'
          }`}
        >
          1. Steps Checklist
        </button>
        <button
          onClick={() => setMobileDashboardView('guide')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all uppercase ${
            mobileDashboardView === 'guide'
              ? 'bg-brass text-parchment shadow-sm'
              : 'text-ink/70 hover:bg-parchment/40'
          }`}
        >
          2. Guide & Sheets
        </button>
      </div>

      {/* Left Page (Route Path & Steps Checkpoints) */}
      <div className={`lg:col-span-6 pr-0 lg:pr-14 xl:pr-18 pb-8 lg:pb-0 ${mobileDashboardView === 'roadmap' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
        {/* Back button and title */}
        <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-4 mb-4">
          <button
            onClick={() => {
              setSelectedProcess(null);
              setSelectedStepId(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 border border-ink/15 rounded-lg bg-[#FAF6EE] text-[10px] font-mono font-bold text-ink hover:bg-[#F3EBD9] transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back to Services</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateActionPlanPDF(selectedProcess, completedSteps, isEligible)}
              className="px-3 py-1 rounded-lg bg-brass hover:bg-brass/90 text-parchment text-[10px] font-mono font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5 text-parchment" />
              <span>Download Guide PDF</span>
            </button>
            <button
              onClick={handleResetProgress}
              className="p-1 border border-ink/10 rounded-lg hover:bg-[#FAF6EE] text-ink/50 hover:text-inkRed transition-colors bg-parchment shadow-sm"
              title="Reset journal log"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-brass border border-brass/25 px-2 py-0.5 rounded bg-[#F1EAD9] flex items-center w-fit gap-1">
            <Landmark className="w-3 h-3 text-brass" />
            <span>{selectedProcess.department}</span>
          </span>
          <h2 className="text-3xl font-garamond font-bold text-ink mt-3 uppercase tracking-wide">
            {selectedProcess.name}
          </h2>
          <p className="text-ink/80 text-xs mt-2 leading-relaxed">
            {selectedProcess.description}
          </p>
        </div>

        {/* Metadata cards grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-dashed border-ink/20 mb-6 font-mono text-[10px] font-bold">
          <div>
            <span className="text-ink/50 uppercase text-[9px] block">Timeline</span>
            <span className="text-ink text-xs">{selectedProcess.timeline}</span>
          </div>
          <div>
            <span className="text-ink/50 uppercase text-[9px] block">Estimate Cost</span>
            <span className="text-ink text-xs text-inkGreen">{selectedProcess.estimatedCost}</span>
          </div>
          <div>
            <span className="text-ink/50 uppercase text-[9px] block">Checkpoints</span>
            <span className="text-ink text-xs">{selectedProcess.steps.length} Steps</span>
          </div>
        </div>

        {/* The Checkpoints Path list */}
        <div className="flex-1">
          <RoadmapFlow 
            steps={selectedProcess.steps}
            completedSteps={completedSteps}
            currentStepIndex={selectedProcess.steps.findIndex(s => !completedSteps[s.id])}
            onToggleStep={handleToggleStep}
            onStepClick={(id) => {
              setSelectedStepId(id);
              if (window.innerWidth < 1024) {
                setMobileDashboardView('guide');
              }
            }}
            selectedStepId={selectedStepId || selectedProcess.steps.find(s => !completedSteps[s.id])?.id || selectedProcess.steps[0]?.id}
          />
        </div>
      </div>

      {/* Right Page (Active Worksheets Details) */}
      <div className={`lg:col-span-6 pl-0 lg:pl-14 xl:pr-6 pt-8 lg:pt-0 justify-between ${mobileDashboardView === 'guide' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
        <div>
          {/* Worksheet tabs: Designed like divider page tabs sticking out */}
          <div className="flex gap-1 border-b border-ink/10 pb-px mb-4 overflow-x-auto">
            {[
              { id: 'roadmap', label: '1. Step Details', icon: FileText },
              { id: 'eligibility', label: '2. Eligibility', icon: ClipboardList },
              { id: 'documents', label: '3. Documents', icon: FolderClosed },
              { id: 'tips', label: '4. Citizen Forum', icon: MessageSquare }
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-[10px] rounded-t-lg font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    activeTab === tab.id 
                      ? 'bg-[#FAF6EE] border-ink/20 border-b-[#FAF6EE] text-brass border-t-2 border-t-brass' 
                      : 'bg-[#F2ECD9] text-ink/75 border-ink/10 border-b-ink/20 hover:bg-[#FAF6EE]/50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 text-brass" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Worksheet Panel */}
          <div className="min-h-[350px]">
            {activeTab === 'roadmap' && (
              (() => {
                const currentStep = selectedProcess.steps.find(s => s.id === selectedStepId) 
                  || selectedProcess.steps.find(s => !completedSteps[s.id]) 
                  || selectedProcess.steps[0];
                const isStepCompleted = !!completedSteps[currentStep.id];
                return (
                  <div className="p-5 rounded-xl border border-ink/10 bg-[#FAF4E5] space-y-4 shadow-sm relative">
                    <div className="paperclip-clip"><div className="paperclip-inner"/></div>
                    <span className="font-mono text-[9px] font-bold text-brass block mb-1">INSTRUCTIONS FOR THIS STEP</span>
                    <h3 className="font-garamond font-bold text-xl uppercase tracking-wide text-ink">{currentStep.title}</h3>
                    
                    <div className="flex gap-4 text-[10px] font-mono font-bold text-ink/60 border-t border-b border-dashed border-ink/15 py-2">
                      <span>Expected Time: {currentStep.duration}</span>
                      <span>Fees / Cost: <strong className="text-inkRed">{currentStep.cost}</strong></span>
                    </div>

                    <p className="text-xs text-ink/80 leading-relaxed font-medium">
                      {currentStep.desc}
                    </p>
                    
                    {currentStep.link && currentStep.link.startsWith('http') ? (
                      <div className="pt-2">
                        <a
                          href={currentStep.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brass hover:bg-brass/90 text-parchment font-mono font-extrabold text-[10px] uppercase tracking-wider shadow transition-colors w-full justify-center"
                        >
                          <span>Launch Official Portal</span>
                          <ExternalLink className="w-3.5 h-3.5 text-parchment" />
                        </a>
                      </div>
                    ) : currentStep.link ? (
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2ECD9] text-ink/75 font-mono font-bold text-[10px] uppercase tracking-wider w-full justify-center border border-ink/10 select-none">
                          <Landmark className="w-3.5 h-3.5 text-brass" />
                          <span>Location/Reference: {currentStep.link}</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Action Guidelines checklist inside Step Details */}
                    <div className="p-4 rounded-xl border border-ink/10 bg-[#FDFDFC] shadow-sm">
                      <h4 className="font-garamond font-bold text-sm text-ink uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-brass" />
                        <span>Action Guidelines</span>
                      </h4>
                      <ul className="space-y-3 text-xs text-ink/80 leading-relaxed font-medium">
                        <li className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            className="w-4.5 h-4.5 mt-0.5 accent-brass rounded border-ink/20 focus:ring-brass shrink-0 cursor-pointer"
                            checked={isStepCompleted}
                            onChange={() => handleToggleStep(currentStep.id)}
                          />
                          <span className={isStepCompleted ? "line-through text-ink/40" : ""}>
                            Mark this step as completed.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <input type="checkbox" className="w-4.5 h-4.5 mt-0.5 accent-brass rounded border-ink/20 focus:ring-brass shrink-0 cursor-pointer" />
                          <span>Fill in your details exactly as verified on your identity card.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <input type="checkbox" className="w-4.5 h-4.5 mt-0.5 accent-brass rounded border-ink/20 focus:ring-brass shrink-0 cursor-pointer" />
                          <span>Upload required documents and submit payment of <strong>{currentStep.cost}</strong>.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Required Documents List for the Step */}
                    <div className="p-4 rounded-xl border border-ink/10 bg-[#FDFDFC] shadow-sm">
                      <h4 className="font-garamond font-bold text-xs text-ink uppercase tracking-wide mb-2">Required Documents to Keep Ready</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProcess.documents.map((doc, idx) => (
                          <span 
                            key={idx} 
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold ${
                              verifiedDocs[doc.name] 
                                ? 'bg-inkGreen/5 border-inkGreen/30 text-inkGreen' 
                                : 'bg-parchment border-ink/10 text-ink/40'
                            }`}
                          >
                            {verifiedDocs[doc.name] ? '✓ ' : '○ '}{doc.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-ink/15">
                      <button
                        onClick={() => setIsChatOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brass bg-parchment hover:bg-[#FAF6EE] text-[10px] font-mono font-bold text-brass transition-all shadow-sm w-full justify-center"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Ask AI Sahayak for Step Guidance</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {activeTab === 'eligibility' && (
              <EligibilityChecker 
                key={selectedProcess.id}
                eligibilityRules={selectedProcess.eligibility}
                onEligibilityChange={(status) => setIsEligible(status)}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentVerification 
                documents={selectedProcess.documents}
                onDocumentVerified={handleDocVerified}
                csrfToken={csrfToken}
              />
            )}




            {activeTab === 'tips' && (
              <CitizenHubPanel 
                processId={selectedProcess.id}
                csrfToken={csrfToken}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>

        {/* Progress stamp & margins notes at the bottom of the right page */}
        <div className="border-t border-dashed border-ink/20 pt-4 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Horizontal milestone indicators */}
            <div className="flex items-center gap-1.5 py-1">
              {selectedProcess.steps.map((step, idx) => {
                const isCompleted = !!completedSteps[step.id];
                const isCurrent = idx === selectedProcess.steps.findIndex(s => !completedSteps[s.id]);
                return (
                  <div 
                    key={step.id} 
                    onClick={() => setSelectedStepId(step.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[8px] font-bold border transition-all cursor-pointer shadow-xs ${
                      isCompleted 
                        ? 'bg-inkGreen border-inkGreen text-parchment'
                        : isCurrent 
                        ? 'bg-brass border-brass text-parchment animate-pulse'
                        : 'bg-[#F2ECD9] border-ink/10 text-ink/40 hover:bg-[#FAF6EE]/40'
                    }`}
                    title={step.title}
                  >
                    <span>{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Circular progress stamp */}
            <div className="stamp-ink stamp-brass rotate-[-8deg] flex items-center gap-1.5 py-1 px-3 self-end sm:self-auto select-none pointer-events-none scale-90">
              <span className="font-mono text-[9px] font-bold">PROGRESS GAUGED:</span>
              <span className="font-mono text-xs font-black">{progressPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;