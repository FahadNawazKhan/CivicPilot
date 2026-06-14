import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Clock, Plus, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  { id: 'passport', name: 'Passport', isPermanent: false, linkProcess: 'passport' },
  { id: 'driving_license', name: 'Driving License', isPermanent: false, linkProcess: 'driving_license' },
  { id: 'aadhaar', name: 'Aadhaar Card', isPermanent: true, linkProcess: 'aadhaar' },
  { id: 'pan', name: 'PAN Card', isPermanent: true, linkProcess: 'gst_registration' },
  { id: 'rc', name: 'Vehicle Registration (RC)', isPermanent: false, linkProcess: 'driving_license' },
  { id: 'insurance', name: 'Vehicle Insurance', isPermanent: false, linkProcess: 'driving_license' }
];

const DocumentVault = ({ handleSelectProcess, setActiveTab, documentVault = [], setDocumentVault, currentUser }) => {
  const vault = documentVault;
  const saveVault = setDocumentVault;

  const [showAddForm, setShowAddForm] = useState(false);
  const [docType, setDocType] = useState('passport');
  const [holderName, setHolderName] = useState('');
  const [docId, setDocId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setInsights(null);
      return;
    }

    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const res = await fetch('/api/vault/insights');
        if (res.ok) {
          const data = await res.json();
          setInsights(data);
        } else {
          setInsights(null);
        }
      } catch (err) {
        console.warn("Could not load MongoDB insights:", err);
        setInsights(null);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchInsights();
  }, [vault, currentUser]);

  // 3. Expiry and Status Math
  const getExpiryDetails = (doc) => {
    if (doc.isPermanent) {
      return { days: null, status: 'permanent', label: 'Permanent / Lifelong', color: 'text-slate-500 bg-slate-100 border-slate-300' };
    }
    if (!doc.expiry) {
      return { days: null, status: 'unknown', label: 'No Expiry Set', color: 'text-ink/40 bg-parchment border-ink/10' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(doc.expiry);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { days, status: 'expired', label: `Expired by ${Math.abs(days)} days!`, color: 'text-inkRed bg-inkRed/10 border-inkRed/30' };
    }
    if (days === 0) {
      return { days, status: 'critical', label: 'Expires TODAY!', color: 'text-inkRed bg-inkRed/10 border-inkRed/40 font-extrabold animate-pulse' };
    }
    if (days <= 30) {
      return { days, status: 'critical', label: `${days} days left - Critical!`, color: 'text-inkRed bg-[#FDF2F0] border-inkRed/40' };
    }
    if (days <= 90) {
      return { days, status: 'warning', label: `${days} days left - Renew soon`, color: 'text-brass bg-[#FAF6EE] border-brass/40' };
    }
    return { days, status: 'valid', label: `${days} days remaining`, color: 'text-inkGreen bg-inkGreen/10 border-inkGreen/30' };
  };

  // 4. Submit New Document Form
  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!holderName.trim() || !docId.trim()) return;

    const selectedTypeInfo = DOCUMENT_TYPES.find(t => t.id === docType);
    if (!selectedTypeInfo) return;

    if (!selectedTypeInfo.isPermanent && !expiryDate) {
      alert("Please select an expiry date for this document type.");
      return;
    }

    const newDoc = {
      id: Date.now().toString(),
      type: docType,
      typeName: selectedTypeInfo.name,
      holder: holderName.trim(),
      number: docId.trim(),
      expiry: selectedTypeInfo.isPermanent ? '' : expiryDate,
      isPermanent: selectedTypeInfo.isPermanent,
      linkProcess: selectedTypeInfo.linkProcess
    };

    const newVault = [newDoc, ...vault];
    saveVault(newVault);

    // Reset Form
    setHolderName('');
    setDocId('');
    setExpiryDate('');
    setShowAddForm(false);
  };

  // 5. Delete Document
  const handleDelete = (id) => {
    const newVault = vault.filter(doc => doc.id !== id);
    saveVault(newVault);
  };

  // 6. Stats compilation
  const stats = vault.reduce((acc, doc) => {
    const details = getExpiryDetails(doc);
    acc[details.status] = (acc[details.status] || 0) + 1;
    return acc;
  }, { critical: 0, warning: 0, valid: 0, permanent: 0, expired: 0 });

  return (
    <div className="w-full h-full flex flex-col space-y-5 font-sans">
      
      {/* 1. Header Banner & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-dashed border-ink/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brass/30 bg-[#FAF6EE] text-brass text-[10px] font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-brass" />
            <span>Section 4. Document Expiry Tracker</span>
          </div>
          <h3 className="text-2xl font-garamond font-bold text-ink mt-3 uppercase tracking-wide">Document Renewal Vault</h3>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brass hover:bg-brass/90 border border-brass text-parchment font-mono font-extrabold text-[10px] uppercase shadow-sm transition-all"
        >
          {showAddForm ? 'Cancel Registration' : (
            <>
              <Plus className="w-4 h-4" />
              <span>Register Document</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Visual Progress Status Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Critical Alert', count: stats.critical + stats.expired, color: 'border-inkRed/30 bg-[#FAF4E5] text-inkRed', icon: ShieldAlert },
          { label: 'Soon Expiring', count: stats.warning, color: 'border-brass/35 bg-[#FAF6EE] text-brass', icon: Clock },
          { label: 'Safe & Valid', count: stats.valid, color: 'border-inkGreen/25 bg-[#F2F7F4] text-inkGreen', icon: CheckCircle2 },
          { label: 'Permanent', count: stats.permanent, color: 'border-ink/10 bg-[#FAFBFB] text-ink/75', icon: Award }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between shadow-xs ${item.color}`}>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider block opacity-75">{item.label}</span>
                <span className="text-xl font-garamond font-black mt-0.5 block">{item.count} Docs</span>
              </div>
              <Icon className="w-6 h-6 opacity-40 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* 3. Sliding Registration Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleAddDocument}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden p-5 rounded-2xl border border-brass/30 bg-[#FAF6EE] shadow-md space-y-4"
          >
            <h4 className="font-garamond font-extrabold text-base text-ink uppercase tracking-wide pb-1.5 border-b border-dashed border-brass/25">
              Secure Document Registration Log
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase text-ink/65">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-2.5 py-2 rounded-lg border border-brass/35 bg-[#FCFAF5] text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass cursor-pointer"
                >
                  {DOCUMENT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase text-ink/65">Holder Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Sharma"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="px-2.5 py-2 rounded-lg border border-brass/35 bg-[#FCFAF5] text-[10px] font-mono font-bold text-ink placeholder:text-ink/30 focus:outline-none focus:border-brass shadow-xs"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase text-ink/65">Document Number / ID</label>
                <input
                  type="text"
                  placeholder="e.g. Z9874521 or Aadhaar number"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  className="px-2.5 py-2 rounded-lg border border-brass/35 bg-[#FCFAF5] text-[10px] font-mono font-bold text-ink placeholder:text-ink/30 focus:outline-none focus:border-brass shadow-xs"
                  required
                />
              </div>

              {!DOCUMENT_TYPES.find(t => t.id === docType)?.isPermanent ? (
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase text-ink/65 font-bold text-inkRed">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-brass/35 bg-[#FCFAF5] text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass shadow-xs"
                    required
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-3 rounded-lg border border-dashed border-ink/10 bg-[#FCFAF5]/60 text-ink/50 text-[10px] font-mono font-semibold">
                  Permanent Document - No Expiry Check Needed
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-inkGreen hover:bg-inkGreen/90 border border-inkGreen text-[#FAF6EE] font-mono font-extrabold text-[10px] uppercase shadow-sm transition-all"
              >
                Log Registry Details
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 4. Vault Listing Grid & MongoDB Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Document Grid (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <h4 className="font-garamond font-black text-sm uppercase text-ink/40 tracking-wider">
            Registered Documents
          </h4>
          {vault.length === 0 ? (
            <div className="border border-dashed border-ink/15 p-12 rounded-2xl text-center text-ink/40 bg-[#FCFAF5]/50 flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-8 h-8 text-brass opacity-60" />
              <p className="font-garamond italic text-lg text-ink/65">Your document vault is currently empty.</p>
              <p className="text-xs">Click the "Register Document" button above to log and track your dates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vault.map((doc) => {
                const details = getExpiryDetails(doc);
                return (
                  <motion.div
                    key={doc.id}
                    layout
                    className="p-4 rounded-2xl border border-ink/10 bg-[#FAFBFB] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brass/30 transition-all group relative overflow-hidden"
                  >
                    {/* Stamped Status ribbon overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider ${details.color}`}>
                        {details.status}
                      </span>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 hover:text-inkRed text-ink/20 hover:bg-parchment/60 rounded border border-transparent hover:border-ink/10 transition-colors"
                        title="Delete document log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brass" />
                        <h4 className="font-garamond font-black text-lg text-ink uppercase tracking-wide group-hover:text-brass transition-colors">
                          {doc.typeName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono text-ink/70">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-ink/45">Holder</span>
                          <span className="font-bold truncate block">{doc.holder}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-ink/45">Document ID</span>
                          <span className="font-bold truncate block font-mono">{doc.number}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-ink/10 pt-3 mt-4 flex items-center justify-between">
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-ink/45">Expiration State</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono font-bold text-ink">
                          <Calendar className="w-3.5 h-3.5 text-ink/40" />
                          <span>{doc.isPermanent ? 'Lifelong validity' : doc.expiry}</span>
                        </div>
                      </div>

                      {!doc.isPermanent && (details.status === 'critical' || details.status === 'warning' || details.status === 'expired') ? (
                        <button
                          onClick={() => {
                            handleSelectProcess(doc.linkProcess);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-brass hover:bg-brass text-brass hover:text-parchment font-mono font-extrabold text-[8px] uppercase tracking-wider transition-colors shadow-2xs"
                        >
                          Renew Checklist
                        </button>
                      ) : null}
                    </div>

                    {/* Warning banner for soon expiring/expired docs */}
                    {!doc.isPermanent && (details.status === 'critical' || details.status === 'expired' || details.status === 'critical_pulse') && (
                      <div className="mt-3.5 p-2 rounded-lg border border-inkRed/25 bg-[#FFF5F3] text-inkRed text-[9px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{details.label}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: MongoDB Insights Console (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <h4 className="font-garamond font-black text-sm uppercase text-ink/40 tracking-wider mb-4">
            MongoDB Audit Console
          </h4>
          
          <div className="p-5 rounded-2xl border border-brass/35 bg-[#FAF6EE] flex flex-col justify-between relative shadow-sm flex-1 min-h-[320px] overflow-hidden">
            {/* Stamp decoration */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-brass/5 rounded-full flex items-center justify-center border border-dashed border-brass/20 rotate-12 select-none pointer-events-none">
              <span className="text-[7px] font-mono font-black text-brass/45 tracking-widest text-center uppercase leading-tight">
                MONGO_DB<br />AUDIT<br />ACTIVE
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 pb-2.5 border-b border-dashed border-brass/25">
                <div className="w-2 h-2 rounded-full bg-inkGreen animate-pulse shrink-0" />
                <h4 className="font-mono text-[9px] uppercase font-black text-ink/70 tracking-widest">
                  Live Aggregate Stats
                </h4>
              </div>

              {!currentUser ? (
                <div className="py-12 text-center space-y-3">
                  <p className="font-garamond italic text-xs text-ink/50 leading-relaxed">
                    Authenticate to activate MongoDB state synchronization and live aggregation analytics.
                  </p>
                  <div className="inline-block text-[8px] font-mono font-extrabold text-[#C19D53] border border-brass/35 bg-white px-2.5 py-1 rounded">
                    GUEST MODE ACTIVE
                  </div>
                </div>
              ) : loadingInsights ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-2 text-ink/40 font-mono text-[9px]">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brass border-t-transparent" />
                  <span>Pipeline computation active...</span>
                </div>
              ) : insights ? (
                <div className="mt-4 space-y-5">
                  {/* Circular Gauge and Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-ink/5 fill-none" strokeWidth="5" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className={`fill-none transition-all duration-500 ${
                            insights.healthScore >= 85
                              ? "stroke-inkGreen"
                              : insights.healthScore >= 60
                              ? "stroke-brass"
                              : "stroke-inkRed"
                          }`}
                          strokeWidth="5"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 - (213.6 * insights.healthScore) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-lg font-garamond font-black text-ink">{insights.healthScore}%</span>
                        <span className="block text-[6px] font-mono font-bold text-ink/40 uppercase tracking-tight">Health</span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-mono font-bold text-ink/75 mt-2.5 uppercase tracking-wide text-center">
                      {insights.healthScore >= 85
                        ? "Vault is Secure & Valid"
                        : insights.healthScore >= 60
                        ? "Impending Expiry Detected"
                        : "Critical Renewal Required"}
                    </span>
                  </div>

                  {/* Stats Counters */}
                  <div className="border-t border-dashed border-brass/25 pt-4 space-y-2 text-[9px] font-mono text-ink/70">
                    <div className="flex justify-between items-center">
                      <span className="opacity-75 uppercase">Total Logged Docs</span>
                      <span className="font-bold">{insights.totalDocs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-75 uppercase">Expired Docs</span>
                      <span className={`font-bold ${insights.expiredCount > 0 ? "text-inkRed" : ""}`}>
                        {insights.expiredCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-75 uppercase">Critical Days Left</span>
                      <span className={`font-bold ${insights.criticalCount > 0 ? "text-inkRed" : ""}`}>
                        {insights.criticalCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-75 uppercase">Permanent Validity</span>
                      <span className="font-bold text-inkGreen">{insights.permanentCount}</span>
                    </div>
                  </div>

                  {/* Next Renewal Advisory */}
                  {insights.nextRenewal ? (
                    <div className="mt-4 p-2.5 rounded-xl border border-inkRed/20 bg-[#FFF5F3] text-ink flex flex-col justify-between">
                      <div>
                        <span className="text-[7px] font-mono font-black text-inkRed uppercase tracking-wider block">
                          Urgent Renewal Required
                        </span>
                        <h5 className="font-garamond font-bold text-sm text-ink mt-0.5 uppercase tracking-wide truncate">
                          {insights.nextRenewal.typeName}
                        </h5>
                        <p className="text-[8px] font-mono text-ink/65 mt-1 leading-normal truncate">
                          Holder: <span className="font-bold text-ink">{insights.nextRenewal.holder}</span><br />
                          ID: <span className="font-bold text-ink">{insights.nextRenewal.number}</span>
                        </p>
                      </div>
                      
                      <div className="border-t border-dashed border-inkRed/15 pt-2 mt-2.5 flex items-center justify-between">
                        <span className="text-[8px] font-mono font-black text-inkRed uppercase">
                          {insights.nextRenewal.daysLeft <= 0
                            ? "Expired"
                            : `${insights.nextRenewal.daysLeft} days left`}
                        </span>
                        <button
                          onClick={() => handleSelectProcess(insights.nextRenewal.linkProcess)}
                          className="px-2 py-0.5 rounded bg-inkRed hover:bg-inkRed/90 border border-inkRed text-[#FFF5F3] font-mono font-black text-[7px] uppercase tracking-wider transition-colors shadow-2xs"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  ) : insights.totalDocs > 0 ? (
                    <div className="p-3 rounded-xl border border-inkGreen/20 bg-[#F2F7F4] text-ink text-center">
                      <span className="text-[7px] font-mono font-black text-inkGreen uppercase tracking-wider block">
                        Advisory Stable
                      </span>
                      <p className="font-garamond italic text-[11px] text-ink/70 mt-1">
                        All deadlines are currently stable.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="py-12 text-center text-ink/40 font-mono text-[9px]">
                  No document history registered.
                </div>
              )}
            </div>

            {/* Diagnostics */}
            <div className="border-t border-dashed border-brass/25 pt-3 mt-6 flex justify-between items-center text-[7px] font-mono text-ink/40 uppercase">
              <span>Engine: Mongoose 8.x</span>
              <span className="text-right">Index: userId_1 [Active]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
