import { useState } from 'react';

/**
 * PrepGuide Component
 * Displays LLM-generated interview preparation guide with clean Apple-esque design
 */
export default function PrepGuide({ prepGuide, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    roleOverview: true,
    coreTopics: true,
    skillBreakdown: true,
    interviewFocusAreas: true,
    preparationStrategy: false,
    companyTips: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!prepGuide) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Interview Preparation Guide
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Personalized prep plan powered by AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Key Takeaways - Always visible at top */}
          {prepGuide.keyTakeaways && prepGuide.keyTakeaways.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {prepGuide.keyTakeaways.map((takeaway, index) => (
                  <li
                    key={index}
                    className="text-blue-800 flex items-start text-sm"
                  >
                    <span className="text-blue-400 mr-2 font-bold">•</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role Overview */}
          {prepGuide.roleOverview && (
            <Section
              title="Role Overview"
              isExpanded={expandedSections.roleOverview}
              onToggle={() => toggleSection('roleOverview')}
            >
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {prepGuide.roleOverview.summary}
                </p>
                <div className="flex gap-3">
                  {prepGuide.roleOverview.level && (
                    <Badge label="Level" value={prepGuide.roleOverview.level} />
                  )}
                  {prepGuide.roleOverview.type && (
                    <Badge label="Type" value={prepGuide.roleOverview.type} />
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* Core Topics */}
          {prepGuide.coreTopics && prepGuide.coreTopics.length > 0 && (
            <Section
              title="Core Topics"
              isExpanded={expandedSections.coreTopics}
              onToggle={() => toggleSection('coreTopics')}
            >
              <div className="space-y-4">
                {prepGuide.coreTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-1"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {topic.topic}
                      </h4>
                      <ImportanceBadge importance={topic.importance} />
                    </div>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Skill Breakdown */}
          {prepGuide.skillBreakdown && (
            <Section
              title="Skill Breakdown"
              isExpanded={expandedSections.skillBreakdown}
              onToggle={() => toggleSection('skillBreakdown')}
            >
              <div className="space-y-5">
                {/* Must Know Skills */}
                {prepGuide.skillBreakdown.mustKnow &&
                  prepGuide.skillBreakdown.mustKnow.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                        Must Know
                      </h4>
                      <div className="grid gap-3">
                        {prepGuide.skillBreakdown.mustKnow.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-red-50 rounded-lg p-3 border border-red-100"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-900">
                                {skill.skill}
                              </span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                {skill.interviewLikelihood} likelihood
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {skill.proficiency}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Good to Have Skills */}
                {prepGuide.skillBreakdown.goodToHave &&
                  prepGuide.skillBreakdown.goodToHave.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Good to Have
                      </h4>
                      <div className="grid gap-3">
                        {prepGuide.skillBreakdown.goodToHave.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-green-50 rounded-lg p-3 border border-green-100"
                          >
                            <span className="font-medium text-gray-900 block mb-1">
                              {skill.skill}
                            </span>
                            <p className="text-sm text-gray-600">{skill.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Section>
          )}

          {/* Interview Focus Areas */}
          {prepGuide.interviewFocusAreas && (
            <Section
              title="Interview Focus Areas"
              isExpanded={expandedSections.interviewFocusAreas}
              onToggle={() => toggleSection('interviewFocusAreas')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {prepGuide.interviewFocusAreas.technical &&
                  prepGuide.interviewFocusAreas.technical.length > 0 && (
                    <FocusAreaCard
                      title="Technical"
                      iconType="technical"
                      items={prepGuide.interviewFocusAreas.technical}
                      color="purple"
                    />
                  )}
                {prepGuide.interviewFocusAreas.coding &&
                  prepGuide.interviewFocusAreas.coding.length > 0 && (
                    <FocusAreaCard
                      title="Coding"
                      iconType="coding"
                      items={prepGuide.interviewFocusAreas.coding}
                      color="blue"
                    />
                  )}
                {prepGuide.interviewFocusAreas.systemDesign &&
                  prepGuide.interviewFocusAreas.systemDesign.length > 0 && (
                    <FocusAreaCard
                      title="System Design"
                      iconType="systemDesign"
                      items={prepGuide.interviewFocusAreas.systemDesign}
                      color="orange"
                    />
                  )}
                {prepGuide.interviewFocusAreas.behavioral &&
                  prepGuide.interviewFocusAreas.behavioral.length > 0 && (
                    <FocusAreaCard
                      title="Behavioral"
                      iconType="behavioral"
                      items={prepGuide.interviewFocusAreas.behavioral}
                      color="green"
                    />
                  )}
              </div>
            </Section>
          )}

          {/* Preparation Strategy */}
          {prepGuide.preparationStrategy && (
            <Section
              title="Preparation Strategy"
              isExpanded={expandedSections.preparationStrategy}
              onToggle={() => toggleSection('preparationStrategy')}
            >
              <div className="space-y-5">
                {prepGuide.preparationStrategy.timeline && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      Recommended Timeline
                    </span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {prepGuide.preparationStrategy.timeline}
                    </p>
                  </div>
                )}

                {prepGuide.preparationStrategy.weeklyPlan &&
                  prepGuide.preparationStrategy.weeklyPlan.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Weekly Plan
                      </h4>
                      <div className="space-y-4">
                        {prepGuide.preparationStrategy.weeklyPlan.map(
                          (phase, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold mr-3">
                                  {index + 1}
                                </span>
                                <div>
                                  <h5 className="font-semibold text-gray-900">
                                    {phase.phase}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {phase.focus}
                                  </p>
                                </div>
                              </div>
                              {phase.activities && phase.activities.length > 0 && (
                                <ul className="mt-3 ml-11 space-y-1">
                                  {phase.activities.map((activity, actIdx) => (
                                    <li
                                      key={actIdx}
                                      className="text-sm text-gray-700 flex items-start"
                                    >
                                      <span className="text-blue-400 mr-2">✓</span>
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {prepGuide.preparationStrategy.practiceResources &&
                  prepGuide.preparationStrategy.practiceResources.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Practice Resources
                      </h4>
                      <div className="grid gap-3">
                        {prepGuide.preparationStrategy.practiceResources.map(
                          (resource, index) => (
                            <div
                              key={index}
                              className="flex items-start justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div>
                                <span className="font-medium text-gray-900 block">
                                  {resource.type}
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                  {resource.focus}
                                </p>
                              </div>
                              <PriorityBadge priority={resource.priority} />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </Section>
          )}

          {/* Company-Specific Tips */}
          {prepGuide.companySpecificTips &&
            prepGuide.companySpecificTips.length > 0 && (
              <Section
                title="Company-Specific Tips"
                isExpanded={expandedSections.companyTips}
                onToggle={() => toggleSection('companyTips')}
              >
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
                  <ul className="space-y-3">
                    {prepGuide.companySpecificTips.map((tip, index) => (
                      <li
                        key={index}
                        className="text-gray-700 flex items-start leading-relaxed"
                      >
                        <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Component with Expand/Collapse
function Section({ title, children, isExpanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && <div className="px-5 py-4 bg-white">{children}</div>}
    </div>
  );
}

// Badge Components
function Badge({ label, value }) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg px-3 py-1">
      <span className="text-xs font-medium text-gray-500 mr-1">{label}:</span>
      <span className="text-xs font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function ImportanceBadge({ importance }) {
  const colors = {
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${
        colors[importance] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {importance}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        colors[priority] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {priority}
    </span>
  );
}

function FocusAreaCard({ title, iconType, items, color }) {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200',
    blue: 'bg-blue-50 border-blue-200',
    orange: 'bg-orange-50 border-orange-200',
    green: 'bg-green-50 border-green-200',
  };

  const iconColorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  };

  const getIcon = () => {
    switch (iconType) {
      case 'technical':
        return (
          <svg className={`w-5 h-5 ${iconColorClasses[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'coding':
        return (
          <svg className={`w-5 h-5 ${iconColorClasses[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'systemDesign':
        return (
          <svg className={`w-5 h-5 ${iconColorClasses[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'behavioral':
        return (
          <svg className={`w-5 h-5 ${iconColorClasses[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-lg p-4 border ${colorClasses[color] || 'bg-gray-50 border-gray-200'}`}
    >
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
        <span className="mr-2">{getIcon()}</span>
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
