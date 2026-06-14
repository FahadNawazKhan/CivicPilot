import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Star, MessageSquare, MapPin, Clock, Plus, AlertCircle, CheckCircle, Search, ChevronDown, ChevronUp, UserCheck, HelpCircle } from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Documents', 'Fees & Payments', 'Timeline', 'Eligibility'];

const CitizenHubPanel = ({ processId, csrfToken, currentUser }) => {
  // Shared state alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==========================================
  // CITIZEN EXPERIENCE TIPS STATE & ACTIONS
  // ==========================================
  const [tips, setTips] = useState([]);
  const [stats, setStats] = useState({ avgDays: 0, totalReviews: 0, minDays: 0, maxDays: 0 });
  const [tipsLoading, setTipsLoading] = useState(true);

  // Form states - tips
  const [showTipForm, setShowTipForm] = useState(false);
  const [officeName, setOfficeName] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [tipRating, setTipRating] = useState(5);
  const [submittingTip, setSubmittingTip] = useState(false);

  const fetchTips = async () => {
    setTipsLoading(true);
    try {
      const res = await fetch(`/api/tips/${processId}`);
      if (res.ok) {
        const data = await res.json();
        setTips(data.tips || []);
        setStats(data.stats || { avgDays: 0, totalReviews: 0, minDays: 0, maxDays: 0 });
      }
    } catch (err) {
      console.error("Error fetching tips:", err);
    } finally {
      setTipsLoading(false);
    }
  };

  const handleTipSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!officeName.trim() || !experienceText.trim() || !estimatedDays) {
      setError('Please fill out all fields.');
      return;
    }

    const days = parseInt(estimatedDays);
    if (isNaN(days) || days < 0) {
      setError('Please enter a valid positive number for processing days.');
      return;
    }

    setSubmittingTip(true);
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          processId,
          officeName: officeName.trim(),
          experienceText: experienceText.trim(),
          estimatedDays: days,
          rating: tipRating
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Experience logged successfully!');
        setOfficeName('');
        setExperienceText('');
        setEstimatedDays('');
        setTipRating(5);
        setShowTipForm(false);
        fetchTips();
      } else {
        setError(data.error || 'Failed to submit experience.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error submitting experience.');
    } finally {
      setSubmittingTip(false);
    }
  };

  const handleTipUpvote = async (tipId) => {
    try {
      const res = await fetch(`/api/tips/${tipId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTips(prev => prev.map(t => t._id === tipId ? { ...t, upvotes: data.upvotes } : t));
      } else {
        alert(data.error || 'Failed to upvote.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // COMMUNITY Q&A HELP DESK STATE & ACTIONS
  // ==========================================
  const [questions, setQuestions] = useState([]);
  const [qaLoading, setQaLoading] = useState(true);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Expanded Questions tracker
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Form states - Q&A
  const [showQaForm, setShowQaForm] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionCategory, setQuestionCategory] = useState('General');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Answer states
  const [answerInputs, setAnswerInputs] = useState({});
  const [submittingAnswers, setSubmittingAnswers] = useState({});

  const fetchQuestions = async () => {
    setQaLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('processId', processId);
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      params.append('sort', sortBy);

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data || []);
      }
    } catch (err) {
      console.error("Error fetching QA:", err);
    } finally {
      setQaLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) {
      setError('Please sign in to ask a question.');
      return;
    }

    if (!questionTitle.trim() || !questionContent.trim()) {
      setError('Please provide both a title and details.');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          title: questionTitle.trim(),
          content: questionContent.trim(),
          category: questionCategory,
          processId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Your doubt was posted successfully!');
        setQuestionTitle('');
        setQuestionContent('');
        setQuestionCategory('General');
        setShowQaForm(false);
        fetchQuestions();
      } else {
        setError(data.error || 'Failed to submit question.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error submitting question.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleCreateAnswer = async (e, questionId) => {
    e.preventDefault();
    setError('');

    const inputContent = answerInputs[questionId] || '';
    if (!inputContent.trim()) return;

    if (!currentUser) {
      setError('Please sign in to submit answers.');
      return;
    }

    setSubmittingAnswers(prev => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ content: inputContent.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setQuestions(prev => prev.map(q => q._id === questionId ? data : q));
        setAnswerInputs(prev => ({ ...prev, [questionId]: '' }));
      } else {
        setError(data.error || 'Failed to post reply.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error posting reply.');
    } finally {
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleQuestionUpvote = async (questionId) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, upvotes: data.upvotes } : q));
      } else {
        alert(data.error || 'Failed to upvote.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerUpvote = async (questionId, answerId) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/answers/${answerId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(prev => prev.map(q => {
          if (q._id !== questionId) return q;
          const updatedAnswers = q.answers.map(ans => 
            ans._id === answerId ? { ...ans, upvotes: data.upvotes } : ans
          );
          return { ...q, answers: updatedAnswers };
        }));
      } else {
        alert(data.error || 'Failed to upvote.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  // Initial load
  useEffect(() => {
    fetchTips();
    fetchQuestions();
  }, [processId, selectedCategory, sortBy]);

  return (
    <div className="space-y-6 font-sans text-ink">
      


      {/* Shared Error & Success Alerts */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg border border-inkRed/20 bg-[#FFF5F3] text-inkRed text-xs font-bold font-mono flex items-start gap-2 shadow-inner"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg border border-inkGreen/20 bg-[#F2F7F4] text-inkGreen text-xs font-bold font-mono flex items-start gap-2 shadow-inner"
          >
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* SECTION A: CITIZEN EXPERIENCES & ADVISORIES */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-dashed border-ink/10 pb-3">
          <h4 className="font-garamond font-black text-sm uppercase text-ink/50 tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-brass" />
            <span>Citizen Experiences & Advisories</span>
          </h4>
          <button
            onClick={() => setShowTipForm(!showTipForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brass hover:bg-brass/90 border border-brass text-parchment font-mono font-extrabold text-[9px] uppercase shadow-sm transition-all"
          >
            {showTipForm ? 'Cancel Contribution' : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Share My Experience</span>
              </>
            )}
          </button>
        </div>

        {/* Share Experience Form */}
        <AnimatePresence>
          {showTipForm && (
            <motion.form
              onSubmit={handleTipSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden p-4 rounded-xl border border-brass/35 bg-[#FAF6EE] shadow-sm space-y-3.5"
            >
              <h5 className="font-garamond font-black text-sm text-ink uppercase tracking-wider border-b border-dashed border-brass/25 pb-1">
                Add Citizen Log & Field Note
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[8px] font-mono font-bold uppercase text-ink/65">Office Location / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Secunderabad Passport Seva Kendra"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    className="px-2.5 py-1.5 rounded bg-white border border-brass/30 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[8px] font-mono font-bold uppercase text-ink/65">Estimated Processing Days</label>
                  <input
                    type="number"
                    placeholder="e.g. 14"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="px-2.5 py-1.5 rounded bg-white border border-brass/30 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[8px] font-mono font-bold uppercase text-ink/65">Field Experience & Tips</label>
                <textarea
                  placeholder="e.g. Bring exact cash for photo. Counter queue is shorter around noon."
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  className="px-2.5 py-2 rounded bg-white border border-brass/30 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass min-h-[80px]"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-bold uppercase text-ink/65">Rating:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setTipRating(star)}
                        className="text-brass hover:scale-110 transition-transform"
                      >
                        <Star className={`w-3.5 h-3.5 ${star <= tipRating ? 'fill-brass text-brass' : 'text-ink/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingTip}
                  className="px-3.5 py-1.5 rounded-lg bg-inkGreen hover:bg-inkGreen/90 border border-inkGreen text-white font-mono font-extrabold text-[9px] uppercase shadow-sm transition-all"
                >
                  {submittingTip ? 'Submitting...' : 'Log Experience'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Experience Tips Listing */}
        {tipsLoading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-1 text-ink/40 font-mono text-[9px]">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brass border-t-transparent" />
            <span>Syncing Citizen Reviews...</span>
          </div>
        ) : tips.length === 0 ? (
          <div className="border border-dashed border-ink/15 p-8 rounded-xl text-center text-ink/40 bg-[#FCFAF5]/50 flex flex-col items-center justify-center gap-1.5">
            <MessageSquare className="w-5 h-5 text-brass opacity-60 animate-bounce" />
            <p className="font-garamond italic text-xs text-ink/65">No community tips have been submitted yet.</p>
            <p className="text-[10px]">Be the first to log details of your recent renewal process!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {tips.map((tip) => (
              <div
                key={tip._id}
                className="p-3 rounded-xl border border-ink/10 bg-[#FAFBFB] hover:shadow-2xs transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[8px] font-black uppercase text-brass border border-brass/25 px-1 py-0.5 rounded bg-[#FAF6EE] flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {tip.officeName}
                      </span>
                      <span className="font-mono text-[8px] font-black uppercase text-inkGreen border border-inkGreen/25 px-1 py-0.5 rounded bg-[#F2F7F4] flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {tip.estimatedDays} Days
                      </span>
                    </div>
                    <p className="text-[11px] text-ink/80 leading-relaxed font-medium pt-1">
                      {tip.experienceText}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-2.5 h-2.5 ${idx < tip.rating ? 'fill-brass text-brass' : 'text-ink/10'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[7px] font-mono text-ink/40">{new Date(tip.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-ink/10 pt-2 mt-2 flex justify-between items-center text-[8px] font-mono text-ink/65">
                  <span className="italic">Submitted by: <strong className="text-ink font-semibold">{tip.username}</strong></span>
                  <button
                    onClick={() => handleTipUpvote(tip._id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] border border-ink/10 text-ink transition-colors"
                  >
                    <ThumbsUp className="w-2.5 h-2.5 text-brass" />
                    <span>Upvote ({tip.upvotes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Neat divider separating the reviews section from the doubts forum */}
      <div className="border-t border-dashed border-ink/20 my-4" />

      {/* ==================================================================== */}
      {/* SECTION B: COMMUNITY Q&A FORUM */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-dashed border-ink/10 pb-3">
          <h4 className="font-garamond font-black text-sm uppercase text-ink/50 tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brass" />
            <span>Community Q&A Forum</span>
          </h4>
          <button
            onClick={() => setShowQaForm(!showQaForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brass hover:bg-brass/90 border border-brass text-parchment font-mono font-extrabold text-[9px] uppercase shadow-sm transition-all"
          >
            {showQaForm ? 'Cancel Doubt' : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Ask compliance doubt</span>
              </>
            )}
          </button>
        </div>

        {/* Ask Question Form */}
        <AnimatePresence>
          {showQaForm && (
            <motion.form
              onSubmit={handleCreateQuestion}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden p-4 rounded-xl border border-brass/35 bg-[#FAF6EE] shadow-sm space-y-3.5"
            >
              <h5 className="font-garamond font-black text-sm text-ink uppercase tracking-wider border-b border-dashed border-brass/25 pb-1">
                Ask compliance doubt / document question
              </h5>

              {!currentUser ? (
                <div className="p-4 rounded-lg border border-dashed border-brass/30 text-center font-mono text-[10px] text-ink/60 bg-white">
                  You must sign in to post questions on the board.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 flex flex-col space-y-1">
                      <label className="text-[8px] font-mono font-bold uppercase text-ink/65">Question Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Will rental agreement work if name doesn't match?"
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-white border border-brass/30 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass"
                        required
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[8px] font-mono font-bold uppercase text-ink/65">Category</label>
                      <select
                        value={questionCategory}
                        onChange={(e) => setQuestionCategory(e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-white border border-brass/30 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass"
                      >
                        {CATEGORIES.slice(1).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[8px] font-mono font-bold uppercase text-ink/65">Question Details</label>
                    <textarea
                      placeholder="Provide details about document verification exceptions or other guidelines you're unsure about."
                      value={questionContent}
                      onChange={(e) => setQuestionContent(e.target.value)}
                      className="px-2.5 py-2 rounded bg-white border border-brass/30 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass min-h-[80px]"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submittingQuestion}
                      className="px-3.5 py-1.5 rounded-lg bg-brass hover:bg-brass/90 border border-brass text-parchment font-mono font-extrabold text-[9px] uppercase shadow-sm transition-all"
                    >
                      {submittingQuestion ? 'Posting...' : 'Post Doubt'}
                    </button>
                  </div>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search doubt database (e.g. name mismatch, rent, PAN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-16 py-1.5 rounded-lg bg-white border border-ink/15 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/30" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-[#F1EAD9] border border-ink/10 text-[8px] font-mono font-black uppercase text-ink"
            >
              Find
            </button>
          </form>

          <div className="flex gap-2 text-[9px] font-mono font-bold shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white border border-ink/15 focus:outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white border border-ink/15 focus:outline-none"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Upvoted</option>
            </select>
          </div>
        </div>

        {/* Doubts Listing */}
        {qaLoading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-1 text-ink/40 font-mono text-[9px]">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brass border-t-transparent" />
            <span>Syncing Doubts database...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="border border-dashed border-ink/15 p-8 rounded-xl text-center text-ink/40 bg-[#FCFAF5]/50 flex flex-col items-center justify-center gap-1.5">
            <HelpCircle className="w-5 h-5 text-brass opacity-60" />
            <p className="font-garamond italic text-xs text-ink/65">No compliance doubts recorded here.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {questions.map((q) => {
              const isExpanded = expandedIds.has(q._id);
              return (
                <div
                  key={q._id}
                  className="p-3 rounded-xl border border-ink/10 bg-[#FAFBFB] hover:shadow-2xs transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[8px] font-black uppercase text-brass border border-brass/20 px-1 py-0.5 rounded bg-[#FAF6EE]">
                          {q.category}
                        </span>
                        <span className="text-[8px] font-mono text-ink/40">
                          Posted by {q.username}
                        </span>
                      </div>

                      <h4
                        onClick={() => toggleExpand(q._id)}
                        className="font-garamond font-black text-sm text-ink uppercase tracking-wide cursor-pointer hover:text-brass pt-1 flex items-center gap-1 select-none"
                      >
                        <span>{q.title}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-brass" /> : <ChevronDown className="w-3.5 h-3.5 text-ink/40" />}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleQuestionUpvote(q._id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] border border-ink/10 text-[8px] font-mono font-bold text-ink"
                      >
                        <ThumbsUp className="w-2.5 h-2.5 text-brass" />
                        <span>{q.upvotes}</span>
                      </button>
                      <span className="text-[8px] font-mono text-ink/50 border border-ink/10 px-1.5 py-0.5 rounded bg-white flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5 text-brass" />
                        {q.answers.length} replies
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-dashed border-ink/10 mt-3 pt-3 space-y-3"
                      >
                        <p className="text-[11px] text-ink/75 leading-relaxed bg-[#FCFAF5] p-3 rounded-lg border border-brass/10 italic">
                          {q.content}
                        </p>

                        <div className="space-y-2">
                          <span className="font-mono text-[7px] font-black uppercase tracking-wider text-ink/40 block">
                            Replies ({q.answers.length})
                          </span>
                          
                          {q.answers.length === 0 ? (
                            <p className="text-[10px] font-mono text-ink/40 italic pl-1">No advice submitted yet.</p>
                          ) : (
                            <div className="space-y-2 pl-3 border-l-2 border-brass/25">
                              {q.answers.map((ans) => (
                                <div key={ans._id} className="p-2.5 rounded-lg border border-ink/5 bg-white shadow-2xs space-y-1">
                                  <p className="text-[10px] text-ink/80 leading-relaxed font-medium">
                                    {ans.content}
                                  </p>
                                  <div className="flex justify-between items-center text-[7px] font-mono text-ink/40 pt-1 border-t border-dashed border-ink/5">
                                    <span className="flex items-center gap-0.5">
                                      <UserCheck className="w-2.5 h-2.5 text-inkGreen" />
                                      By <strong className="text-ink font-semibold">{ans.username}</strong>
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                                      <button
                                        onClick={() => handleAnswerUpvote(q._id, ans._id)}
                                        className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded hover:bg-[#FAF6EE] text-ink"
                                      >
                                        <ThumbsUp className="w-2 h-2 text-brass" />
                                        <span>({ans.upvotes})</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <form
                          onSubmit={(e) => handleCreateAnswer(e, q._id)}
                          className="flex gap-2 border-t border-dashed border-ink/10 pt-3"
                        >
                          {!currentUser ? (
                            <div className="w-full text-center py-2 text-[9px] font-mono text-ink/40 bg-[#FAF6EE]/50 border border-dashed border-ink/10 rounded-lg">
                              Please sign in to write advice/answers.
                            </div>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder="Suggest advice or answer compliance doubt..."
                                value={answerInputs[q._id] || ''}
                                onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q._id]: e.target.value }))}
                                className="flex-1 px-2 py-1.5 rounded-lg border border-ink/15 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-brass bg-white"
                                required
                              />
                              <button
                                type="submit"
                                disabled={submittingAnswers[q._id]}
                                className="px-3 py-1.5 rounded-lg bg-inkGreen hover:bg-inkGreen/90 border border-inkGreen text-white font-mono font-extrabold text-[8px] uppercase tracking-wide transition-all shadow-3xs"
                              >
                                {submittingAnswers[q._id] ? 'Sending...' : 'Reply'}
                              </button>
                            </>
                          )}
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CitizenHubPanel;
