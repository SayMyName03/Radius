import React, { useState } from 'react';
import PrepGuide from './PrepGuide';
import { generatePrepGuide } from '../api/client';

const LeadDetailPanel = ({ lead, onClose }) => {
  if (!lead) return null;
  
  // Local state for the "mock" notes functionality
  const [note, setNote] = useState('Met at the conference. Interested in the enterprise plan.');
  
  // Prep guide state
  const [showPrepGuide, setShowPrepGuide] = useState(false);
  const [prepGuideData, setPrepGuideData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePrepGuide = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Prepare job data from lead
      const jobData = {
        title: lead.title || lead.name, // Use title or fallback to name
        company: lead.company || 'Unknown Company',
        description: lead.description || `Position at ${lead.company || 'company'}`,
        location: lead.location || 'Not specified',
        skills: lead.skills || [],
        salary: lead.salary || null,
      };

      const response = await generatePrepGuide({ jobData });
      
      if (response.success) {
        setPrepGuideData(response.data);
        setShowPrepGuide(true);
      } else {
        setError('Failed to generate preparation guide. Please try again.');
      }
    } catch (err) {
      console.error('Error generating prep guide:', err);
      setError(
        err.response?.data?.message ||
          'Unable to generate preparation guide. Please check your API key and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePrepGuide = () => {
    setShowPrepGuide(false);
    setPrepGuideData(null);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white/10 backdrop-blur-[2px] animate-fade-in" 
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-gray-50/50 max-h-screen shadow-2xl flex flex-col border-l border-gray-200 backdrop-blur-xl animate-slide-in-right">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white/80 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{lead.name}</h2>
            <p className="text-xs text-gray-500 font-mono">{lead.id ? `ID: ${lead.id.toString().padStart(6, '0')}` : 'ID: N/A'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">Close panel</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm flex items-center gap-2 hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 px-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Status</label>
            </div>
            <div className="relative flex-1">
              <select 
                className="block w-full text-sm font-medium text-gray-900 py-1.5 pl-2 pr-8 border-l border-gray-100 bg-transparent focus:ring-0 focus:outline-none cursor-pointer"
                defaultValue={lead.status}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Disqualified">Disqualified</option>
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => window.location.href = `mailto:${lead.email}?subject=Following up on ${lead.company || 'opportunity'}`}
               className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 duration-200"
             >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
             </button>
             <button 
               onClick={() => alert(`Meeting scheduler for ${lead.name} will be available soon!`)}
               className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 duration-200"
             >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Meeting
             </button>
          </div>

          {/* Interview Prep Guide Button */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  AI Interview Prep
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Get a personalized preparation guide powered by AI
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleGeneratePrepGuide}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Prep Guide
                </>
              )}
            </button>
          </div>

          {/* Contact Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
             <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Contact Info</h3>
             </div>
             <div className="p-4 space-y-4">
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                         <p className="text-xs text-gray-500">Email</p>
                         <p className="text-sm font-medium text-gray-900">{lead.email}</p>
                      </div>
                   </div>
                   <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                   </button>
                </div>

                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div>
                         <p className="text-xs text-gray-500">Location</p>
                         <p className="text-sm font-medium text-gray-900">{lead.location}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div>
                         <p className="text-xs text-gray-500">Phone</p>
                         <p className="text-sm font-medium text-gray-900">+1 (555) 000-0000</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Company Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
             <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Company Details</h3>
             </div>
             <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center text-lg font-bold">
                        {lead.company ? lead.company.charAt(0) : 'C'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{lead.company}</p>
                        <p className="text-xs text-gray-500">Technology & Services</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <p className="text-sm font-medium text-gray-900">Decision Maker</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Size</p>
                        <p className="text-sm font-medium text-gray-900">50-200 employees</p>
                    </div>
                </div>
             </div>
          </div>

           {/* Source Card */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{lead.source}</p>
                        <a href="#" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            View Profile
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                </div>
           </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest px-1">Notes</h3>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-32 p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-300 resize-none transition-all placeholder:text-gray-400"
                placeholder="Add a note about this lead..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white/50 flex gap-3">
             <button className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]">
                Save Changes
             </button>
        </div>

      </div>

      {/* Prep Guide Modal */}
      {showPrepGuide && prepGuideData && (
        <PrepGuide prepGuide={prepGuideData} onClose={handleClosePrepGuide} />
      )}
    </div>
  );
};

export default LeadDetailPanel;
