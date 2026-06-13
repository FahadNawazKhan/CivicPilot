import { useState } from 'react';
import { Upload, FileText, Loader2, Link2, Folder } from 'lucide-react';



const DocumentVerification = ({ documents = [], onDocumentVerified, csrfToken }) => {
  const [docStates, setDocStates] = useState({});

  const handleFileUpload = async (docName, file) => {
    if (!file) return;

    setDocStates(prev => ({
      ...prev,
      [docName]: { status: 'uploading', feedback: 'Verifying document details...' }
    }));

    const formData = new FormData();
    formData.append('document', file);
    formData.append('docName', docName);

    try {
      const response = await fetch('/api/verify-document', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Verification failed');
      }

      const data = await response.json();
      
      setDocStates(prev => ({
        ...prev,
        [docName]: {
          status: data.status,
          feedback: data.feedback,
          fileName: file.name
        }
      }));

      if (data.valid) {
        onDocumentVerified(docName, true);
      } else {
        onDocumentVerified(docName, false);
      }
    } catch (err) {
      console.error(err);
      setDocStates(prev => ({
        ...prev,
        [docName]: {
          status: 'error',
          feedback: err.message || 'Error processing document file'
        }
      }));
      onDocumentVerified(docName, false);
    }
  };

  const getCategory = (name) => {
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes('aadhaar') || 
      lowerName.includes('pan') || 
      lowerName.includes('proof of identity') || 
      lowerName.includes('birth') || 
      lowerName.includes('dob') || 
      lowerName.includes('age') || 
      lowerName.includes('photo') || 
      lowerName.includes('passport')
    ) {
      return 'Identity';
    }
    return 'Business';
  };

  const renderDossierCard = (doc) => {
    const docState = docStates[doc.name] || { status: 'idle' };
    const isUploading = docState.status === 'uploading';
    const isSuccess = docState.status === 'success';
    const isWarning = docState.status === 'warning';
    const isError = docState.status === 'error';

    let cardBg = 'bg-[#FDFDFC] border-ink/15';
    if (isSuccess) cardBg = 'bg-[#FCFAF5] border-inkGreen/30';
    if (isWarning) cardBg = 'bg-[#FCFAF5] border-brass/45';
    if (isError) cardBg = 'bg-[#FDFDFC] border-inkRed/40';
    if (isUploading) cardBg = 'bg-[#FAF8F5] border-brass/50 animate-pulse';

    return (
      <div
        key={doc.name}
        className={`p-4 rounded-xl border relative transition-all flex flex-col justify-between min-h-[12.5rem] h-auto shadow-xs hover:shadow-sm ${cardBg}`}
      >
        {/* Physical Paperclip element */}
        <div className="paperclip-clip"><div className="paperclip-inner"/></div>

        <div>
          <div className="flex justify-between items-start gap-4">
            <div className={`p-2 rounded-lg border shrink-0 ${
              isSuccess 
                ? 'bg-inkGreen border-inkGreen text-parchment' 
                : 'bg-parchment border-ink/10 text-ink/40'
            }`}>
              <FileText className="w-4 h-4" />
            </div>

            {/* Distressed Stamp Indicator */}
            <span className={`stamp-ink scale-90 ${
              isSuccess 
                ? 'stamp-green' 
                : (isWarning || isError) 
                ? 'stamp-red' 
                : 'stamp-brass opacity-60'
            }`}>
              {isUploading ? 'VERIFYING' : isSuccess ? 'VERIFIED' : isWarning ? 'WARNING' : isError ? 'REJECTED' : 'NOT UPLOADED'}
            </span>
          </div>

          <h4 className="font-garamond font-bold text-base text-ink mt-3 line-clamp-1 uppercase tracking-wide">{doc.name}</h4>
          <p className="text-[10px] text-ink/75 mt-1 line-clamp-2 leading-relaxed font-medium">{doc.description}</p>
          
          {docState.fileName && (
            <p className="text-[9px] text-[#2F5C8F] font-caveat font-bold mt-1 max-w-[70%] truncate">
              Paper: {docState.fileName}
            </p>
          )}
        </div>

        <div className="border-t border-dashed border-ink/10 pt-2 flex items-center justify-between gap-4 mt-2">
          <div className="flex-1 text-[9px] text-ink/60 truncate font-typewriter mr-1">
            {isUploading ? (
              <span className="flex items-center gap-1 text-ink/60">
                <Loader2 className="w-3 h-3 animate-spin text-brass" />
                Checking file...
              </span>
            ) : docState.feedback ? (
              <span className="truncate block" title={docState.feedback}>
                {docState.feedback}
              </span>
            ) : (
              <span>No file uploaded</span>
            )}
          </div>

          <label className={`cursor-pointer shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all shadow-sm ${
            isUploading
              ? 'bg-parchment text-ink/30 border-ink/10 pointer-events-none'
              : isSuccess
              ? 'bg-parchment hover:bg-[#F2ECD9] text-ink/70 border-ink/15'
              : 'bg-brass hover:bg-brass/90 border-brass text-parchment font-extrabold'
          }`}>
            <Upload className="w-3 h-3 stroke-[2.5]" />
            <span>{isSuccess ? 'RE-UPLOAD' : 'UPLOAD'}</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFileUpload(doc.name, e.target.files?.[0])}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    );
  };

  const identityDocs = documents.filter(d => getCategory(d.name) === 'Identity');
  const businessDocs = documents.filter(d => getCategory(d.name) === 'Business');

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brass/30 bg-[#FAF6EE] text-brass text-[10px] font-mono font-bold uppercase tracking-wider">
          <Link2 className="w-3.5 h-3.5 text-brass" />
          <span>Section 3. Documents Checklist</span>
        </div>
        <h3 className="text-2xl font-garamond font-bold text-ink mt-3 uppercase tracking-wide">Upload Documents</h3>
        <p className="text-xs text-ink/70 mt-1">
          Upload and verify your required documents to ensure they meet the requirements.
        </p>
      </div>

      {/* Identity Folder Sleeve */}
      {identityDocs.length > 0 && (
        <div className="dossier-sleeve p-4 pt-8 rounded-xl mb-8 relative mt-6">
          <div className="dossier-tab-tab absolute -top-5 left-4 px-3 py-0.5 flex items-center gap-1 bg-[#EAD5A0] shadow-xs">
            <Folder className="w-3 h-3 shrink-0" />
            <span className="uppercase text-[9px] font-mono tracking-wider font-extrabold">Identity Documents</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {identityDocs.map(renderDossierCard)}
          </div>
        </div>
      )}

      {/* Business Folder Sleeve */}
      {businessDocs.length > 0 && (
        <div className="dossier-sleeve p-4 pt-8 rounded-xl mb-4 relative mt-6">
          <div className="dossier-tab-tab absolute -top-5 left-4 px-3 py-0.5 flex items-center gap-1 bg-[#EAD5A0] shadow-xs">
            <Folder className="w-3 h-3 shrink-0" />
            <span className="uppercase text-[9px] font-mono tracking-wider font-extrabold">Business Documents</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {businessDocs.map(renderDossierCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;