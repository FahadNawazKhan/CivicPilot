import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Trash2,
  Compass,
  Clock,
  IndianRupee,
  History,
  Bookmark,
  FolderOpen,
  Plane,
  Briefcase,
  FileText,
  UserCheck,
  Percent,
  FileDown,
  Landmark,
  ClipboardList,
  FolderClosed,
  HelpCircle,
  Lightbulb,
  Lock,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import AuthModal from './components/AuthModal';
import DocumentVault from './components/DocumentVault';
import { generateActionPlanPDF } from './utils/pdfGenerator';

function App() {
  const [processesList, setProcessesList] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveryError, setDiscoveryError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [mobileDashboardView, setMobileDashboardView] = useState('roadmap');

  // Progress states
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpilot_completed_steps');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [verifiedDocs, setVerifiedDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpilot_verified_docs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isEligible, setIsEligible] = useState(false);
  const [activeJourneys, setActiveJourneys] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpilot_active_journeys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [documentVault, setDocumentVault] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpilot_document_vault');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState(null);

  const seedDefaultVault = () => {
    const today = new Date();
    const passportExpiry = new Date();
    passportExpiry.setDate(today.getDate() + 15);
    const licenseExpiry = new Date();
    licenseExpiry.setDate(today.getDate() + 65);

    const defaultVault = [
      {
        id: 'demo-1',
        type: 'passport',
        typeName: 'Passport',
        holder: 'Fahad Nawaz Khan',
        number: 'Z9874521',
        expiry: passportExpiry.toISOString().split('T')[0],
        isPermanent: false,
        linkProcess: 'passport'
      },
      {
        id: 'demo-2',
        type: 'driving_license',
        typeName: 'Driving License',
        holder: 'Fahad Nawaz Khan',
        number: 'DL-1420220036',
        expiry: licenseExpiry.toISOString().split('T')[0],
        isPermanent: false,
        linkProcess: 'driving_license'
      },
      {
        id: 'demo-3',
        type: 'aadhaar',
        typeName: 'Aadhaar Card',
        holder: 'Fahad Nawaz Khan',
        number: 'XXXX-XXXX-8824',
        expiry: '',
        isPermanent: true,
        linkProcess: 'aadhaar'
      }
    ];
    setDocumentVault(defaultVault);
    localStorage.setItem('civicpilot_document_vault', JSON.stringify(defaultVault));
  };

  useEffect(() => {
    if (documentVault !== null) {
      localStorage.setItem('civicpilot_document_vault', JSON.stringify(documentVault));
    }
  }, [documentVault]);


  // Authentication & session state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [hasLoadedUserProgress, setHasLoadedUserProgress] = useState(false);

  // Fetch initial list of processes
  useEffect(() => {
    fetch('/api/processes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProcessesList(data);
        }
      })
      .catch(err => console.error("Error loading processes list:", err));
  }, []);

  // Check current session status, fetch CSRF token, and load progress if authenticated
  useEffect(() => {
    const checkSessionAndLoadProgress = async () => {
      try {
        // Fetch active CSRF token directly from API to prevent out-of-sync multi-cookie parses
        const csrfRes = await fetch('/api/csrf-token');
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json();
          setCsrfToken(csrfData.csrfToken);
        }

        const meRes = await fetch('/api/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);

          // User is authenticated, fetch progress from DB
          const progressRes = await fetch('/api/progress');
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            if (progressData) {
              if (progressData.completedSteps) setCompletedSteps(progressData.completedSteps);
              if (progressData.verifiedDocs) setVerifiedDocs(progressData.verifiedDocs);
              if (progressData.activeJourneys) setActiveJourneys(progressData.activeJourneys);
              if (progressData.documentVault !== undefined) {
                setDocumentVault(progressData.documentVault);
              } else {
                seedDefaultVault();
              }
            }
            setHasLoadedUserProgress(true);
          }
        } else {
          console.log("No active session detected, running in guest mode.");
          if (!localStorage.getItem('civicpilot_document_vault')) {
            seedDefaultVault();
          }
        }
      } catch (err) {
        console.warn("Could not synchronize session details, running in guest mode:", err);
      } finally {
        setIsInitialLoadDone(true);
      }
    };
    checkSessionAndLoadProgress();
  }, []);

  // Sync state changes back to database (debounced, ONLY when authenticated)
  useEffect(() => {
    if (!currentUser || !isInitialLoadDone || !hasLoadedUserProgress) return;

    const syncProgress = async () => {
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            completedSteps,
            verifiedDocs,
            activeJourneys,
            documentVault: documentVault || []
          })
        });
        if (!res.ok) {
          throw new Error('Failed to sync progress with database');
        }
      } catch (err) {
        console.error("Error syncing progress to database:", err);
      }
    };

    const timeoutId = setTimeout(syncProgress, 500);
    return () => clearTimeout(timeoutId);
  }, [completedSteps, verifiedDocs, activeJourneys, documentVault, currentUser, isInitialLoadDone, csrfToken, hasLoadedUserProgress]);

  const handleAuthSuccess = async (user, newCsrfToken) => {
    const activeCsrfToken = newCsrfToken || csrfToken;
    if (newCsrfToken) {
      setCsrfToken(newCsrfToken);
    }

    try {
      // 1. Fetch existing user progress from the database first
      const getRes = await fetch('/api/progress');
      if (getRes.ok) {
        const serverProgress = await getRes.json();

        // 2. Merge server-side progress with any local guest progress
        const mergedCompletedSteps = {
          ...(serverProgress.completedSteps || {}),
          ...completedSteps
        };
        const mergedVerifiedDocs = {
          ...(serverProgress.verifiedDocs || {}),
          ...verifiedDocs
        };
        const mergedActiveJourneys = Array.from(new Set([
          ...(serverProgress.activeJourneys || []),
          ...activeJourneys
        ]));
        
        const mergedDocumentVault = [
          ...(serverProgress.documentVault || []),
          ...(documentVault || [])
        ].filter((value, index, self) =>
          self.findIndex(d => d.id === value.id) === index
        );

        // 3. Save the merged state back to the database
        const postRes = await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': activeCsrfToken
          },
          body: JSON.stringify({
            completedSteps: mergedCompletedSteps,
            verifiedDocs: mergedVerifiedDocs,
            activeJourneys: mergedActiveJourneys,
            documentVault: mergedDocumentVault
          })
        });

        if (postRes.ok) {
          const progressData = await postRes.json();
          if (progressData) {
            setCompletedSteps(progressData.completedSteps || {});
            setVerifiedDocs(progressData.verifiedDocs || {});
            setActiveJourneys(progressData.activeJourneys || []);
            setDocumentVault(progressData.documentVault || []);
          }
          setHasLoadedUserProgress(true);
        } else {
          // If save fails, load the retrieved server progress directly
          setCompletedSteps(serverProgress.completedSteps || {});
          setVerifiedDocs(serverProgress.verifiedDocs || {});
          setActiveJourneys(serverProgress.activeJourneys || []);
          setDocumentVault(serverProgress.documentVault || []);
          setHasLoadedUserProgress(true);
        }
      }
    } catch (err) {
      console.error("Error synchronizing progress on login:", err);
    } finally {
      // 4. Set the current user last, once all state is updated
      setCurrentUser(user);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    setCurrentUser(null);
    setCsrfToken('');
    setCompletedSteps({});
    setVerifiedDocs({});
    setActiveJourneys([]);
    setHasLoadedUserProgress(false);
    localStorage.removeItem('civicpilot_completed_steps');
    localStorage.removeItem('civicpilot_verified_docs');
    localStorage.removeItem('civicpilot_active_journeys');
    setSelectedProcess(null);
    setSelectedStepId(null);

    // Refresh a guest CSRF token after logging out
    try {
      const csrfRes = await fetch('/api/csrf-token');
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        setCsrfToken(csrfData.csrfToken);
      }
    } catch (err) {
      console.warn("Could not reload guest CSRF token after logout:", err);
    }
  };

  // Sync state to LocalStorage as a local offline backup
  useEffect(() => {
    localStorage.setItem('civicpilot_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('civicpilot_verified_docs', JSON.stringify(verifiedDocs));
  }, [verifiedDocs]);

  useEffect(() => {
    localStorage.setItem('civicpilot_active_journeys', JSON.stringify(activeJourneys));
  }, [activeJourneys]);

  // Load process details
  const handleSelectProcess = async (processId) => {
    try {
      const res = await fetch(`/api/processes/${processId}`);
      if (!res.ok) throw new Error("Failed to load details");
      const data = await res.json();
      setSelectedProcess(data);
      setSelectedStepId(null);
      setActiveTab('roadmap');
      setDiscoveryError('');
    } catch (err) {
      console.error(err);
    }
  };

  // Start a new journey
  const handleStartJourney = (processId) => {
    if (!activeJourneys.includes(processId)) {
      const updated = [...activeJourneys, processId];
      setActiveJourneys(updated);
    }
  };

  // Remove a journey
  const handleCancelJourney = (e, processId) => {
    e.stopPropagation();
    const updated = activeJourneys.filter(id => id !== processId);
    setActiveJourneys(updated);

    // Clear progress for that specific journey
    if (processesList.find(p => p.id === processId)) {
      const targetProc = processesList.find(p => p.id === processId);

      // Clean steps
      const updatedSteps = { ...completedSteps };
      if (targetProc.steps) {
        targetProc.steps.forEach(s => delete updatedSteps[s.id]);
      }
      setCompletedSteps(updatedSteps);

      // Clean docs
      const updatedDocs = { ...verifiedDocs };
      if (targetProc.documents) {
        targetProc.documents.forEach(d => delete updatedDocs[d.name]);
      }
      setVerifiedDocs(updatedDocs);
    }
  };

  // Perform AI Process Discovery
  const handleDiscover = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const query = directQuery !== null ? directQuery : searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    setDiscoveryError('');
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      if (data.found && data.process) {
        handleSelectProcess(data.process.id);
        handleStartJourney(data.process.id);
      } else {
        setDiscoveryError(data.message || 'Could not locate that specific path. Choose manually below.');
      }
    } catch (err) {
      console.error(err);
      setDiscoveryError('Could not connect to registers. Select manually below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleStep = (stepId) => {
    setCompletedSteps(prev => {
      const updated = { ...prev, [stepId]: !prev[stepId] };
      return updated;
    });
  };

  const handleDocVerified = (docName, isValid) => {
    setVerifiedDocs(prev => {
      const updated = { ...prev, [docName]: isValid };
      return updated;
    });
  };

  const getProcessProgress = (proc) => {
    if (!proc) return 0;
    const totalSteps = proc.steps ? proc.steps.length : 0;
    const totalDocs = proc.documents ? proc.documents.length : 0;
    const totalItems = totalSteps + totalDocs + 1; // steps + docs + eligibility

    const doneSteps = proc.steps ? proc.steps.filter(s => completedSteps[s.id]).length : 0;
    const doneDocs = proc.documents ? proc.documents.filter(d => verifiedDocs[d.name]).length : 0;
    const doneEligible = isEligible ? 1 : 0;

    const completedItems = doneSteps + doneDocs + doneEligible;
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const getOverallProgress = () => {
    if (!selectedProcess) return 0;
    return getProcessProgress(selectedProcess);
  };

  const progressPct = getOverallProgress();

  const handleResetProgress = () => {
    if (selectedProcess) {
      const updatedSteps = { ...completedSteps };
      selectedProcess.steps.forEach(s => delete updatedSteps[s.id]);
      setCompletedSteps(updatedSteps);

      const updatedDocs = { ...verifiedDocs };
      selectedProcess.documents.forEach(d => delete updatedDocs[d.name]);
      setVerifiedDocs(updatedDocs);

      setIsEligible(false);
    }
  };

  // Setup static map marker chips
  const goalChips = [
    { label: "Restaurant", query: "I want to open a restaurant" },
    { label: "Passport", query: "I need a passport" },
    { label: "Business", query: "I want to start a business" },
    { label: "Medical Store", query: "Start a chemist / medical store" }
  ];

  const exploreGoals = [
    { icon: Plane, title: "Travel Services", query: "passport" },
    { icon: Briefcase, title: "Business Setup", query: "business" },
    { icon: FileText, title: "Licenses Vault", query: "license" },
    { icon: UserCheck, title: "Identity Log", query: "aadhaar" },
    { icon: Percent, title: "Taxes Registry", query: "gst" }
  ];

  const popularProcesses = processesList.filter(p =>
    ["passport", "driving_license", "restaurant", "medical_store"].includes(p.id)
  );

  return (
    <div className="desk-backdrop min-h-screen font-sans pb-16 relative text-ink">
      {/* Top Navbar: Styled like an engraved brass ruler lying on the desk */}
      {/* Top Floating Glass Console Navbar */}
      <header className="sticky top-4 z-40 px-3 sm:px-6 max-w-7xl mx-auto w-full select-none pointer-events-none mb-2">
        <div className="floating-glass-console rounded-2xl py-2.5 px-4 sm:px-6 flex items-center justify-between flex-nowrap gap-3 shadow-2xl relative gold-sheen pointer-events-auto">
          {/* Decorative Corner Brass Screw Rivet (Left) */}
          <div className="hidden sm:flex w-3.5 h-3.5 rounded-full brass-screw-rivet shrink-0">
            <div className="brass-screw-slit" />
          </div>

          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setSelectedProcess(null)}>
            <motion.div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-parchment/90 flex items-center justify-center text-brass border border-ink/15 shadow-inner"
              whileHover={{ rotate: 360 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-brass" />
            </motion.div>
            <div className="flex select-none">
              {"CIVICPILOT".split("").map((char, idx) => (
                <motion.span
                  key={idx}
                  className="font-garamond font-bold text-lg sm:text-2xl tracking-tight uppercase brass-glow-text"
                  whileHover={{ y: -5, scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 8 }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Repeating Ruler-style Ticks in the middle */}
          <div
            className="hidden md:block flex-1 h-3 mx-4 lg:mx-8 opacity-30 border-b border-brass/40"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #C19D53 0px, #C19D53 1px, transparent 1px, transparent 8px)' }}
          />

          <nav className="flex items-center gap-1.5 sm:gap-4 text-xs font-mono font-bold flex-nowrap shrink-0 relative z-10">
            <AnimatePresence>
              {hoveredNavId && (
                <motion.div
                  layoutId="nav-glow-highlight"
                  className="absolute bg-brass/15 border border-brass/35 rounded-lg -z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
            </AnimatePresence>

            {currentUser ? (
              <div
                className="flex items-center gap-1.5 sm:gap-3 border-r border-ink/20 pr-1.5 sm:pr-4 shrink-0 max-w-[110px] sm:max-w-none relative"
                onMouseEnter={() => setHoveredNavId('user')}
                onMouseLeave={() => setHoveredNavId(null)}
              >
                <span className="text-[9px] sm:text-[10px] uppercase text-parchment/80 truncate">
                  <span className="hidden md:inline opacity-75">Logged: </span>
                  <strong className="text-brass font-extrabold truncate max-w-[45px] sm:max-w-[100px] inline-block align-middle">{currentUser.username}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-1.5 py-0.5 rounded border border-inkRed/40 hover:bg-inkRed/15 text-inkRed transition-all text-[8px] sm:text-[9px] uppercase font-bold shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setHoveredNavId('signin')}
                onMouseLeave={() => setHoveredNavId(null)}
              >
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2 py-0.5 rounded border border-brass/40 hover:border-brass/80 text-brass transition-all text-[8px] sm:text-[9px] uppercase font-bold mr-1 sm:mr-2 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>
              </div>
            )}

            {selectedProcess ? (
              <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 flex-nowrap">
                {/* SVG Radial Progress Circle */}
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10">
                  <span className="text-[9px] sm:text-[10px] text-parchment/60 uppercase font-mono font-bold">Progress:</span>
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8 -rotate-90">
                      <circle cx="16" cy="16" r="13" className="stroke-white/10 fill-none" strokeWidth="2.5" />
                      <circle
                        cx="16" cy="16" r="13"
                        className="stroke-inkGreen fill-none transition-all duration-500"
                        strokeWidth="2.5"
                        strokeDasharray="81.68"
                        strokeDashoffset={81.68 - (81.68 * progressPct) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-mono font-bold text-parchment">{progressPct}%</span>
                  </div>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setHoveredNavId('download')}
                  onMouseLeave={() => setHoveredNavId(null)}
                >
                  <button
                    onClick={() => generateActionPlanPDF(selectedProcess, completedSteps, isEligible)}
                    className="px-2 py-1 sm:px-2.5 sm:py-1 rounded bg-[#C19D53] hover:bg-[#D7C191] text-black transition-all text-[9px] sm:text-[10px] uppercase font-mono font-bold flex items-center gap-1 shrink-0 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <FileDown className="w-3.5 h-3.5 text-black" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="inline sm:hidden">PDF</span>
                  </button>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setHoveredNavId('vault')}
                  onMouseLeave={() => setHoveredNavId(null)}
                >
                  <button
                    onClick={() => setIsVaultOpen(true)}
                    className="px-2 py-1 sm:px-2.5 sm:py-1 rounded border border-[#C19D53] bg-white hover:bg-[#C19D53] text-[#C19D53] hover:text-white transition-all text-[9px] sm:text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 shrink-0 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>My Vault</span>
                  </button>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setHoveredNavId('close')}
                  onMouseLeave={() => setHoveredNavId(null)}
                >
                  <button
                    onClick={() => {
                      setSelectedProcess(null);
                      setSelectedStepId(null);
                    }}
                    className="px-2 py-1 rounded border border-inkRed/40 hover:border-inkRed hover:bg-inkRed/15 transition-all text-[9px] sm:text-[10px] uppercase font-bold flex items-center gap-1 text-inkRed shrink-0 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    ✕ <span className="hidden sm:inline">Close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 flex-nowrap">
                {activeJourneys.length > 0 && (
                  <div
                    className="relative"
                    onMouseEnter={() => setHoveredNavId('active-journeys')}
                    onMouseLeave={() => setHoveredNavId(null)}
                  >
                    <span className="px-1.5 py-1 sm:px-2.5 sm:py-1 rounded bg-[#FAF6EE]/10 border border-brass/35 text-[9px] uppercase tracking-wide text-parchment flex items-center gap-1 shrink-0 shadow-xs">
                      <History className="w-3.5 h-3.5 text-brass" />
                      <span>{activeJourneys.length}<span className="hidden sm:inline"> Active {activeJourneys.length === 1 ? 'Service' : 'Services'}</span></span>
                    </span>
                  </div>
                )}

                <div
                  className="relative"
                  onMouseEnter={() => setHoveredNavId('vault')}
                  onMouseLeave={() => setHoveredNavId(null)}
                >
                  <button
                    onClick={() => setIsVaultOpen(true)}
                    className="px-2 py-1 sm:px-2.5 sm:py-1 rounded border border-[#C19D53] bg-white hover:bg-[#C19D53] text-[#C19D53] hover:text-white transition-all text-[9px] sm:text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 shrink-0 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>My Vault</span>
                  </button>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setHoveredNavId('assistant')}
                  onMouseLeave={() => setHoveredNavId(null)}
                >
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="px-2 py-1 sm:px-2.5 sm:py-1 rounded border border-[#C19D53] bg-white hover:bg-[#C19D53] text-[#C19D53] hover:text-white transition-all text-[9px] sm:text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 shrink-0 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>AI<span className="hidden sm:inline"> Sahayak</span></span>
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* Decorative Corner Brass Screw Rivet (Right) */}
          <div className="hidden sm:flex w-3.5 h-3.5 rounded-full brass-screw-rivet shrink-0">
            <div className="brass-screw-slit rotate-90" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 mt-4 sm:mt-8">
        <AnimatePresence mode="wait">
          {!selectedProcess ? (
            <LandingPage
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleDiscover={handleDiscover}
              isSearching={isSearching}
              discoveryError={discoveryError}
              goalChips={goalChips}
              exploreGoals={exploreGoals}
              popularProcesses={popularProcesses}
              activeJourneys={activeJourneys}
              processesList={processesList}
              completedSteps={completedSteps}
              getProcessProgress={getProcessProgress}
              handleSelectProcess={handleSelectProcess}
              handleCancelJourney={handleCancelJourney}
              handleStartJourney={handleStartJourney}
            />
          ) : (
            <Dashboard
              selectedProcess={selectedProcess}
              setSelectedProcess={setSelectedProcess}
              completedSteps={completedSteps}
              handleResetProgress={handleResetProgress}
              generateActionPlanPDF={generateActionPlanPDF}
              isEligible={isEligible}
              setIsEligible={setIsEligible}
              progressPct={progressPct}
              mobileDashboardView={mobileDashboardView}
              setMobileDashboardView={setMobileDashboardView}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedStepId={selectedStepId}
              setSelectedStepId={setSelectedStepId}
              handleToggleStep={handleToggleStep}
              handleDocVerified={handleDocVerified}
              verifiedDocs={verifiedDocs}
              csrfToken={csrfToken}
              setIsChatOpen={setIsChatOpen}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Slide drawer Guidebook AI Assistant panel */}
      <ChatAssistant
        key={selectedProcess?.id || 'default'}
        activeProcessId={selectedProcess?.id}
        activeProcessName={selectedProcess?.name}
        selectedStep={selectedProcess ? (selectedProcess.steps.find(s => s.id === selectedStepId)
          || selectedProcess.steps.find(s => !completedSteps[s.id])
          || selectedProcess.steps[0]) : null}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        csrfToken={csrfToken}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        csrfToken={csrfToken}
      />

      <AnimatePresence>
        {isVaultOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            {/* Modal Background click listener */}
            <motion.div
              className="absolute inset-0"
              onClick={() => setIsVaultOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Paper container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 rounded-2xl border border-ink/20 shadow-2xl bg-[#FCFAF5] text-ink z-10 font-sans"
            >
              {/* Paper clip decorative element */}
              <div className="paperclip-clip"><div className="paperclip-inner" /></div>

              {/* Close button */}
              <button
                onClick={() => setIsVaultOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-ink/10 text-ink/40 hover:text-inkRed hover:border-inkRed/30 transition-colors bg-parchment shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <DocumentVault
                handleSelectProcess={(processId) => {
                  handleSelectProcess(processId);
                  handleStartJourney(processId);
                  setIsVaultOpen(false);
                }}
                documentVault={documentVault || []}
                setDocumentVault={setDocumentVault}
                currentUser={currentUser}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;