import { Course, PLO } from '../types';

interface DomainKeywords {
  ploId: string;
  keywords: string[];
}

const DOMAIN_KEYWORDS: DomainKeywords[] = [
  {
    ploId: 'PLO1', // Critical Thinking & Problem Solving
    keywords: [
      'critical', 'thinking', 'problem', 'solve', 'analyze', 'evaluate', 'decision', 'formulate', 
      'statutory', 'legal', 'regulation', 'law', 'structure', 'concept', 'fundamental', 'principles', 
      'basic', 'define', 'recognize', 'recall', 'identify', 'audit', 'diagnose', 'assess', 'study'
    ]
  },
  {
    ploId: 'PLO2', // Global Perspective & Diversity
    keywords: [
      'global', 'macro', 'micro', 'socio-political', 'market forces', 'environment', 'consumer trends', 
      'influence', 'trend', 'external', 'diversity', 'culture', 'cultural', 'international', 'shipping', 'transport'
    ]
  },
  {
    ploId: 'PLO3', // Ethical Leadership & CSR
    keywords: [
      'ethics', 'ethical', 'csr', 'social responsibility', 'sustainability', 'environmental', 'moral', 
      'implications', 'values', 'rights', 'laws', 'compliance', 'legal', 'evaluate', 'appraise'
    ]
  },
  {
    ploId: 'PLO4', // Effective Communication
    keywords: [
      'communicate', 'communication', 'clear', 'stakeholder', 'present', 'presentation', 'writing', 
      'report', 'persuasively', 'audience', 'synthesize', 'speech', 'draft'
    ]
  },
  {
    ploId: 'PLO5', // Team Leadership & Collaboration
    keywords: [
      'team', 'leadership', 'conflict', 'motivation', 'culture', 'communication', 'group', 'onboarding', 
      'hr', 'human resource', 'collaboration', 'manage', 'people', 'negotiate', 'lead'
    ]
  },
  {
    ploId: 'PLO6', // Digital Transformation & Analytics
    keywords: [
      'quantitative', 'query', 'dataset', 'sql', 'database', 'statistical', 'measure', 'calculate', 
      'compute', 'excel', 'regression', 'predictive', 'data', 'analytics', 'model', 'run', 'gantt', 
      'estimate', 'digital', 'technology', 'information system', 'dashboard', 'it', 'software', 
      'align', 'policy', 'infrastructure', 'systems', 'roadmap', 'wacc', 'npv', 'irr'
    ]
  }
];

/**
 * Automatically maps Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs)
 * based on keyword density and action verb category overlap.
 */
export function generateSmartMappings(courses: Course[], plos: PLO[]): { [key: string]: string[] } {
  const mappings: { [key: string]: string[] } = {};

  for (const course of courses) {
    for (const clo of course.clos) {
      const cloKey = `${course.id}_${clo.id}`;
      const matchedPloIds: string[] = [];
      const cloTextLower = (clo.text + ' ' + clo.verb + ' ' + course.name + ' ' + course.description).toLowerCase();

      for (const domain of DOMAIN_KEYWORDS) {
        // Count how many keywords from this domain match the CLO text or metadata
        const matchCount = domain.keywords.reduce((acc, kw) => {
          if (cloTextLower.includes(kw.toLowerCase())) {
            return acc + 1;
          }
          return acc;
        }, 0);

        // If we have a robust match (at least 1 word matches), add this PLO mapping
        if (matchCount >= 1) {
          // Verify if the PLO actually exists in our plos array
          if (plos.some(p => p.id === domain.ploId)) {
            matchedPloIds.push(domain.ploId);
          }
        }
      }

      // Fallback: If no match is found, assign to PLO1 (foundational) or PLO6 depending on the course content
      if (matchedPloIds.length === 0) {
        if (course.term <= 2) {
          matchedPloIds.push('PLO1');
        } else {
          matchedPloIds.push('PLO6');
        }
      }

      mappings[cloKey] = matchedPloIds;
    }
  }

  return mappings;
}
