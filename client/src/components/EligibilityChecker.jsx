import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, AlertCircle } from 'lucide-react';

const EligibilityChecker = ({ eligibilityRules = [], onEligibilityChange }) => {
  const [answers, setAnswers] = useState(() => {
    const initialAnswers = {};
    eligibilityRules.forEach(rule => {
      initialAnswers[rule.id] = null; // null means unanswered, true/false for yes/no
    });
    return initialAnswers;
  });

  // Derived state computed dynamically during render
  const failures = [];
  let allAnswered = true;

  eligibilityRules.forEach(rule => {
    const userAns = answers[rule.id];
    if (userAns === null) {
      allAnswered = false;
    } else if (userAns !== rule.expected) {
      failures.push(rule.errorMsg);
    }
  });

  const isEligible = failures.length === 0;
  const isFormComplete = allAnswered;

  const handleAnswerSelect = (ruleId, value) => {
    const nextAnswers = {
      ...answers,
      [ruleId]: value
    };
    setAnswers(nextAnswers);

    // Calculate new eligibility to notify parent
    const nextFailures = [];
    let nextAllAnswered = true;

    eligibilityRules.forEach(rule => {
      const userAns = nextAnswers[rule.id];
      if (userAns === null) {
        nextAllAnswered = false;
      } else if (userAns !== rule.expected) {
        nextFailures.push(rule.errorMsg);
      }
    });

    const nextIsEligible = nextFailures.length === 0;
    onEligibilityChange(nextAllAnswered ? nextIsEligible : false);
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-[#FCFAF5] border border-ink/15 shadow-sm relative overflow-hidden">
      {/* Ruled lines pattern subtle margin spacer */}
      <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-inkRed/20" />

      <div className="mb-6 pl-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brass/30 bg-[#FAF6EE] text-brass text-[10px] font-mono font-bold uppercase tracking-wider">
          <ClipboardList className="w-3.5 h-3.5 text-brass" />
          <span>Section 2. Eligibility Check</span>
        </div>
        <h3 className="text-2xl font-garamond font-bold text-ink mt-3 uppercase tracking-wide">Eligibility Requirements</h3>
        <p className="text-xs text-ink/75 mt-1">
          Review the requirements below and answer YES or NO.
        </p>
      </div>

      {/* Ruled Questions list */}
      <div className="space-y-4 pl-6 relative">
        {eligibilityRules.map((rule, idx) => (
          <div key={rule.id} className="p-4 rounded-xl border border-ink/10 bg-[#FDFDFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex-1">
              <span className="font-mono text-[9px] font-bold text-brass block mb-1">CHECK {idx + 1}</span>
              <p className="text-ink font-garamond text-base font-bold leading-relaxed">{rule.question}</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAnswerSelect(rule.id, true)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  answers[rule.id] === true
                    ? 'bg-brass border-brass text-parchment font-extrabold shadow-sm'
                    : 'bg-parchment border-ink/15 text-ink/70 hover:bg-[#FAF4E5]'
                }`}
              >
                ✓ YES
              </button>
              <button
                onClick={() => handleAnswerSelect(rule.id, false)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  answers[rule.id] === false
                    ? 'bg-inkRed border-inkRed text-parchment font-extrabold shadow-sm'
                    : 'bg-parchment border-ink/15 text-ink/70 hover:bg-[#FAF4E5]'
                }`}
              >
                ✗ NO
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Verification alerts */}
      <div className="pl-6">
        <AnimatePresence mode="wait">
          {isFormComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-6 flex justify-center"
            >
              {isEligible ? (
                <div className="p-4 rounded-xl bg-inkGreen/5 border border-inkGreen/30 text-inkGreen flex items-start gap-4 w-full relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 stamp-ink stamp-green scale-110 font-bold select-none pointer-events-none">
                    CLEARED
                  </div>
                  <div>
                    <h4 className="font-garamond font-bold text-xl uppercase tracking-wider">STATUS: ELIGIBLE</h4>
                    <p className="text-[11px] text-ink/80 leading-relaxed mt-1 max-w-[75%] font-medium">
                      All requirements met. You comply with the rules.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-inkRed/5 border border-inkRed/30 text-inkRed flex items-start gap-4 w-full relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 stamp-ink stamp-red scale-110 font-bold select-none pointer-events-none">
                    HOLD
                  </div>
                  <div>
                    <h4 className="font-garamond font-bold text-xl uppercase tracking-wider">STATUS: NOT ELIGIBLE YET</h4>
                    <ul className="list-disc pl-4 text-[10px] mt-1.5 space-y-1 text-ink/80 font-medium max-w-[70%]">
                      {failures.map((fail, i) => (
                        <li key={i}>{fail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!isFormComplete && eligibilityRules.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-3 rounded-xl border border-dashed border-ink/15 text-ink/40 flex items-center gap-2 text-[10px] justify-center font-bold bg-[#FAF6EE]/50"
            >
              <AlertCircle className="w-3.5 h-3.5 text-brass shrink-0" />
              <span>Answer all questions above to check your eligibility.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cursive Signature and Stamp block at bottom */}
        <div className="mt-6 border-t border-dashed border-ink/20 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="font-mono text-[9px] text-ink/50 font-bold space-y-0.5">
            <p>DATE: {new Date().toLocaleDateString()}</p>
            <p>ELIGIBILITY STATUS: {isFormComplete ? (isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE') : 'PENDING'}</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="font-mono text-[8px] text-ink/40 uppercase block font-bold">Verification stamp</span>
            <span className="font-caveat text-xl text-[#2F5C8F] font-bold italic select-none underline decoration-wavy decoration-brass/40">
              CivicPilot Assistant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecker;