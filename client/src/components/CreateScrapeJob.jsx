import React, { useState } from 'react';
import { triggerIndeedScrape } from '../api/client';

const CreateScrapeJob = () => {
  const [tags, setTags] = useState(['Software Engineer', 'Remote']);
  const [inputText, setInputText] = useState('');
  const [location, setLocation] = useState('Bengaluru, India');
  const [maxPages, setMaxPages] = useState(3);
  const [usePlaywright, setUsePlaywright] = useState(true);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputText) {
      setTags([...tags, inputText]);
      setInputText('');
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleStartScrape = async () => {
    // Validation
    if (tags.length === 0) {
      setError('Please add at least one keyword');
      return;
    }
    
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await triggerIndeedScrape({
        keyword: tags.join(' '),
        location: location.trim(),
        maxPages: maxPages,
        usePlaywright: usePlaywright,
        headless: true,
      });
      
      setResult(response);
      console.log('Scraping completed:', response);
      
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Scraping failed');
      console.error('Scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Scrape Job</h1>
        <p className="mt-2 text-sm text-gray-500">Configure a new automated scraping task.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* URL Input */}
          <div className="space-y-4">
            <label htmlFor="url" className="block text-sm font-semibold text-gray-900">
              Target Website URL
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">https://</span>
                </div>
                <input
                    type="text"
                    id="url"
                    value="in.indeed.com/jobs"
                    disabled
                    className="block w-full pl-16 pr-4 py-3 bg-gray-100 border border-gray-200 text-gray-600 text-sm rounded-xl cursor-not-allowed"
                />
            </div>
          </div>

          {/* Keywords Tag Input */}
          <div className="space-y-4">
             <label className="block text-sm font-semibold text-gray-900">
              Keywords <span className="text-gray-400 font-normal ml-1">(Press Enter to add)</span>
            </label>
            <div className="min-h-[52px] p-2 bg-gray-50/50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-gray-900/5 focus-within:border-gray-900 focus-within:bg-white transition-all duration-200 flex flex-wrap gap-2 items-center">
                {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-800 shadow-sm animate-fade-in">
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)} 
                          disabled={isLoading}
                          className="ml-1.5 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder={tags.length === 0 ? "e.g. Software Engineer" : ""}
                    className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 p-1 text-sm text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                />
            </div>
          </div>

          {/* Scraper Method Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">
              Scraper Method
            </label>
            <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="usePlaywright"
                  checked={usePlaywright}
                  onChange={(e) => setUsePlaywright(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:opacity-50"
                />
                <div className="flex-1">
                  <label htmlFor="usePlaywright" className="block text-sm font-medium text-gray-900 cursor-pointer">
                    Use Playwright Browser Automation
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    {usePlaywright ? (
                      <>
                        <span className="font-medium text-green-600">✓ Enabled:</span> Uses real Chrome browser to handle JavaScript-rendered content. 
                        More reliable but slower. Best for modern job sites.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-blue-600">✓ Using axios + cheerio:</span> Faster HTTP-based scraping. 
                        Works for static HTML but may miss JavaScript content.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid for Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-900">
                    Location Filter
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        id="location"
                        placeholder="Bangalore, Karnataka"
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 focus:bg-white transition-all duration-200"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label htmlFor="pages" className="block text-sm font-semibold text-gray-900">
                    Max Pages
                </label>
                <div className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setMaxPages(Math.max(1, maxPages - 1))}
                        disabled={isLoading || maxPages <= 1}
                        className="flex items-center justify-center w-10 h-[46px] bg-gray-50/50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50/50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                    </button>
                    <input
                        type="number"
                        id="pages"
                        value={maxPages}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setMaxPages(Math.min(10, Math.max(1, val)));
                        }}
                        min={1}
                        max={10}
                        disabled={isLoading}
                        className="flex-1 text-center px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        type="button"
                        onClick={() => setMaxPages(Math.min(10, maxPages + 1))}
                        disabled={isLoading || maxPages >= 10}
                        className="flex items-center justify-center w-10 h-[46px] bg-gray-50/50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50/50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>
          </div>

        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-900">Scraping Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && result.success && (
          <div className="mx-6 mb-4 p-6 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">Scraping Completed Successfully!</p>
                <p className="text-sm text-green-700 mt-1">{result.message}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-500 font-medium">Jobs Found</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.data.stats.totalJobs}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-500 font-medium">Pages Scraped</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.data.stats.pagesScraped}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-500 font-medium">Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.data.duration}s</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-500 font-medium">Errors</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.data.stats.errors}</p>
              </div>
            </div>
            
            {/* Show import results */}
            {result.data.import && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Lead Import Summary:</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-700">{result.data.import.imported}</p>
                    <p className="text-xs text-gray-600">Imported</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">{result.data.import.duplicates}</p>
                    <p className="text-xs text-gray-600">Duplicates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{result.data.import.errors}</p>
                    <p className="text-xs text-gray-600">Errors</p>
                  </div>
                </div>
                {result.data.import.imported > 0 && (
                  <p className="text-xs text-blue-700 mt-3 text-center">
                    ✓ {result.data.import.imported} new lead{result.data.import.imported !== 1 ? 's' : ''} added to your database
                  </p>
                )}
              </div>
            )}

            {/* Show sample jobs */}
            {result.data.jobs && result.data.jobs.length > 0 && (() => {
              // Filter jobs that match any of the keywords
              const matchedJobs = result.data.jobs.filter(job => {
                const jobTitle = (job.title || '').toLowerCase();
                const jobDescription = (job.description || '').toLowerCase();
                const jobText = `${jobTitle} ${jobDescription}`;
                
                // Check if any keyword appears in the job title or description
                return tags.some(keyword => 
                  jobText.includes(keyword.toLowerCase())
                );
              });
              
              // Take first 15 matched jobs, or all jobs if fewer than 15 matched
              const displayJobs = matchedJobs.length > 0 
                ? matchedJobs.slice(0, 15) 
                : result.data.jobs.slice(0, 15);
              
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">
                      {matchedJobs.length > 0 
                        ? `Keyword-Matched Results (showing ${Math.min(15, matchedJobs.length)} of ${matchedJobs.length}):`
                        : `Sample Results (first ${displayJobs.length}):`}
                    </p>
                    {matchedJobs.length > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ {matchedJobs.length} matches found
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {displayJobs.map((job, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 text-sm hover:border-gray-300 transition-colors">
                        <p className="font-semibold text-gray-900">{job.title || 'No title'}</p>
                        <p className="text-gray-600 text-xs mt-1">{job.company || 'Unknown company'} • {job.location || 'No location'}</p>
                        {job.salary && (
                          <p className="text-green-700 text-xs mt-1 font-medium">{job.salary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-end gap-3">
             <button 
               onClick={handleCancel}
               disabled={isLoading}
               className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Cancel
             </button>
             <button 
               onClick={handleStartScrape}
               disabled={isLoading}
               className="px-5 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-black transition-all duration-200 shadow-lg shadow-gray-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
             >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scraping...
                  </>
                ) : (
                  'Start Scraping'
                )}
             </button>
        </div>
      </div>
    </div>
  );
};


export default CreateScrapeJob;
