import { motion } from 'framer-motion';
import { 
  Search, 
  AlertTriangle, 
  History, 
  Trash2, 
  Bookmark, 
  Compass, 
  Clock, 
  IndianRupee, 
  FolderOpen 
} from 'lucide-react';

const LandingPage = ({
  searchQuery,
  setSearchQuery,
  handleDiscover,
  isSearching,
  discoveryError,
  goalChips = [],
  exploreGoals = [],
  popularProcesses = [],
  activeJourneys = [],
  processesList = [],
  completedSteps = {},
  getProcessProgress,
  handleSelectProcess,
  handleCancelJourney,
  handleStartJourney
}) => {

  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="notebook-container grid grid-cols-1 lg:grid-cols-12 min-h-[80vh] relative p-4 sm:p-10 lg:p-14"
    >
      {/* Binder details down the middle */}
      <div className="hidden lg:block notebook-spine" />
      <div className="hidden lg:flex notebook-binder-rings">
        <div className="binder-ring" />
        <div className="binder-ring" />
        <div className="binder-ring" />
        <div className="binder-ring" />
        <div className="binder-ring" />
      </div>

      {/* Left Page (Search and Active logs) */}
      <div className="lg:col-span-6 flex flex-col pr-0 lg:pr-14 xl:pr-18 pb-8 lg:pb-0">
        <div className="text-center lg:text-left py-8 max-w-xl">
          <h2 className="text-4xl sm:text-6xl font-garamond font-bold text-ink tracking-tight leading-tight">
            Search Government Services
          </h2>
          <p className="marginal-note mt-2 text-inkRed italic">Search for a process (e.g. Passport, Driving License)...</p>
          
          {/* Search Field */}
          <form onSubmit={handleDiscover} className="mt-8 relative w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 w-5 h-5" />
              <input
                type="text"
                placeholder="e.g., Passport, Driving License, Business Registration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 rounded-xl bg-parchment border border-ink/20 text-ink placeholder:text-ink/30 focus:outline-none focus:border-brass transition-all font-medium bg-[#FDFCFA]"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-brass hover:bg-brass/90 border border-brass text-parchment font-mono font-extrabold text-xs shadow transition-all"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {discoveryError && (
              <div className="mt-4 text-inkRed font-mono text-xs font-bold flex items-center gap-1.5 justify-center bg-parchment border border-inkRed/30 py-2 rounded-lg shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-inkRed" />
                {discoveryError}
              </div>
            )}
          </form>

          {/* Quick Map Markers Links (Stamped Tags) */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono font-bold justify-center lg:justify-start">
            {goalChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(chip.query);
                  handleDiscover(null, chip.query);
                }}
                className="px-3 py-1 rounded bg-[#F1EAD9] hover:bg-brass/25 border border-brass/40 text-ink shadow-sm transition-colors text-[10px] uppercase font-bold"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Journeys Index - "My Journeys log" */}
        <div className="border-t border-dashed border-ink/20 pt-6 mt-6 flex-1">
          <h3 className="text-2xl font-garamond font-bold text-ink mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-brass" />
            <span>My Tracked Services</span>
          </h3>
          {activeJourneys.length === 0 ? (
            <div className="border border-dashed border-ink/15 p-8 rounded-2xl text-center text-ink/40 bg-[#FCFAF5]/50">
              <p className="font-garamond italic text-base">You haven't tracked any services yet.</p>
              <p className="text-xs mt-1.5">Use the search bar above to track a new service.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {activeJourneys.map(id => {
                const proc = processesList.find(p => p.id === id);
                if (!proc) return null;
                const pct = getProcessProgress(proc);
                
                return (
                  <div
                    key={id}
                    onClick={() => handleSelectProcess(id)}
                    className="p-4 rounded-xl border border-ink/15 hover:border-brass bg-[#FDFDFC] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="stamp-ink stamp-brass text-[9px] scale-90 py-0.5 px-1.5">TRACKED</span>
                        <h4 className="font-garamond font-bold text-lg text-ink truncate group-hover:text-brass transition-colors uppercase tracking-wide">{proc.name}</h4>
                      </div>
                      <p className="text-[10px] text-ink/60 mt-1 font-mono">
                        Next: <span className="text-inkRed font-bold">{proc.steps.find(s => !completedSteps[s.id])?.title || "Finished"}</span>
                      </p>
                      {/* progress bar */}
                      <div className="w-full bg-[#EADFCA] h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <div className="bg-inkGreen h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs text-ink/70 font-bold">{pct}%</span>
                      <button
                        onClick={(e) => handleCancelJourney(e, id)}
                        className="p-1.5 border border-ink/10 hover:border-inkRed/40 hover:text-inkRed rounded-lg text-ink/30 transition-colors bg-parchment"
                        title="Discard entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Page (Library Destinations & Bookshelf Categories) */}
      <div className="lg:col-span-6 flex flex-col pl-0 lg:pl-14 xl:pr-6 pt-8 lg:pt-0">
        <div id="library-section" className="flex-1">
          <h3 className="text-2xl font-garamond font-bold text-ink mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-brass" />
            <span>Popular Services</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularProcesses.map((proc) => (
              <div
                key={proc.id}
                onClick={() => {
                  handleSelectProcess(proc.id);
                  handleStartJourney(proc.id);
                }}
                className="p-4 rounded-xl border border-ink/10 hover:border-brass/80 bg-[#FCFBF8] shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group min-h-[11rem] h-auto"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] uppercase font-bold text-brass border border-brass/20 px-1.5 py-0.5 rounded bg-parchment">
                      {proc.department.split(',')[0]}
                    </span>
                    <span className="text-ink/30 group-hover:text-brass transition-colors text-xs font-mono flex items-center"><Compass className="w-3.5 h-3.5" /></span>
                  </div>
                  <h4 className="font-garamond font-bold text-lg text-ink mt-2 line-clamp-1 group-hover:text-brass transition-colors uppercase tracking-wide">{proc.name}</h4>
                  <p className="text-[11px] text-ink/75 line-clamp-2 leading-relaxed mt-1">
                    {proc.description}
                  </p>
                </div>
                <div className="border-t border-dashed border-ink/10 pt-2 flex flex-col gap-1 text-[10px] font-mono text-ink/55 font-bold mt-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Clock className="w-3 h-3 text-ink/40 shrink-0" />
                    <span className="truncate" title={proc.timeline}>{proc.timeline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IndianRupee className="w-3 h-3 text-inkGreen/60 shrink-0" />
                    <span className="text-inkGreen truncate" title={proc.estimatedCost}>{proc.estimatedCost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explore by Goal bookshelf category */}
        <div className="border-t border-dashed border-ink/20 pt-6 mt-6">
          <h3 className="text-2xl font-garamond font-bold text-ink mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brass" />
            <span>Service Categories</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {exploreGoals.map((goal, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSearchQuery(goal.query);
                  handleDiscover(null, goal.query);
                }}
                className="p-3 rounded-lg border border-brass/25 hover:border-brass bg-[#F6EFE0] hover:bg-[#FAF4E5] shadow-sm cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <span className="text-xl select-none group-hover:scale-110 transition-transform">
                  {(() => {
                    const IconComp = goal.icon;
                    return <IconComp className="w-6 h-6 text-brass" />;
                  })()}
                </span>
                <span className="font-garamond font-bold text-xs text-ink uppercase tracking-wider">{goal.title.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default LandingPage;