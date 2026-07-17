import { PLO, Course, Setting, Student, Assignment } from '../types';

export const INITIAL_PLOS: PLO[] = [
  {
    id: 'PLO1',
    verb: 'Construct',
    text: 'Construct strategic responses to business challenges/opportunities.',
    bloomLevel: 'Create',
    order: 1,
    shortNotation: 'Strategic Responses',
    dimensions: [
      {
        id: '1.1',
        name: 'Business Environment Analysis',
        rubric: {
          exceeds: 'Applies multiple frameworks and diagnostic tools using data-driven insights to analyze business context and identify challenges and opportunities',
          meets: 'Uses one or more frameworks and diagnostic tool with limited depth or weak data linkage.',
          doesNotMeet: 'Lack appropriate framework or analysis is incorrect'
        }
      },
      {
        id: '1.2',
        name: 'Construct Strategic Responses',
        rubric: {
          exceeds: 'Constructs feasible, well-aligned strategic responses supported by analysis.',
          meets: 'Strategic responses are reasonably aligned and supported by analysis.',
          doesNotMeet: 'Strategic responses are unclear, unrealistic, not aligned with business context'
        }
      }
    ]
  },
  {
    id: 'PLO2',
    verb: 'Assess',
    text: 'Assess ethical implications of business activities.',
    bloomLevel: 'Evaluate',
    order: 2,
    shortNotation: 'Ethical Assessment',
    dimensions: [
      {
        id: '2.1',
        name: 'Ethical Issue Identification',
        rubric: {
          exceeds: 'Accurately and comprehensively identifies ethical implications, stakeholders, and potential impacts of business activities.',
          meets: 'Identifies the main ethical implications and stakeholders related to business activities.',
          doesNotMeet: 'Fails to identify key ethical implications or stakeholders in business activities.'
        }
      },
      {
        id: '2.2',
        name: 'Ethical Analysis & Framework Application',
        rubric: {
          exceeds: 'Critically applies appropriate ethical theories, frameworks, and professional standards to analyze business activities with strong justification.',
          meets: 'Applies relevant ethical frameworks and standards adequately to analyze business activities.',
          doesNotMeet: 'Ethical frameworks are missing, incorrectly applied, or analysis is superficial'
        }
      },
      {
        id: '2.3',
        name: 'Values-Based Decision-Making',
        rubric: {
          exceeds: 'Proposes well-justified decisions and actions that strongly reflect ethical values, social responsibility, and professional integrity.',
          meets: 'Proposes decisions generally aligned with ethical values and professional standards.',
          doesNotMeet: 'Decisions lack ethical justification or disregard ethical values and professional responsibility.'
        }
      }
    ]
  },
  {
    id: 'PLO3',
    verb: 'Develop',
    text: 'Develop, implement, and evaluate solutions to business problems.',
    bloomLevel: 'Create',
    order: 3,
    shortNotation: 'Problem Solving',
    dimensions: [
      {
        id: '3.1',
        name: 'Solution Design',
        rubric: {
          exceeds: 'Develops accurate, feasible, and well- supported solutions aligned with the problem and supported by appropriate analysis',
          meets: 'Develops partially supported solutions with limited analysis or minor errors',
          doesNotMeet: 'Develops unclear, unsupported, or misaligned solutions'
        }
      },
      {
        id: '3.2',
        name: 'Implementation Planning',
        rubric: {
          exceeds: 'Provides a realistic and detailed implementation plan and effectively applies quantitative and/or qualitative analysis to justify decisions and recommendations',
          meets: 'Provides a limited implementation plan with partial quantitative or qualitative justification',
          doesNotMeet: 'Provides an unclear or incomplete implementation plan with weak, incorrect, or missing analysis'
        }
      },
      {
        id: '3.3',
        name: 'Evaluation & Continuous Improvement',
        rubric: {
          exceeds: 'Critically evaluates outcomes, validates assumptions, and proposes meaningful improvements',
          meets: 'Provides limited evaluation with minimal insight into assumptions or improvements.',
          doesNotMeet: 'Provides little or no meaningful evaluation or improvement analysis'
        }
      }
    ]
  },
  {
    id: 'PLO4',
    verb: 'Formulate',
    text: 'Formulate business decisions and systematic analysis that reflects critical thinking.',
    bloomLevel: 'Create',
    order: 4,
    shortNotation: 'Critical Thinking & Decision-Making',
    dimensions: [
      {
        id: '4.1',
        name: 'Challenges status quo using quantitative data',
        rubric: {
          exceeds: 'Demonstrates comprehensive and critical analysis using relevant quantitative data, challenges assumptions and conventional thinking, identifies potential bias or limitations, and provides insightful evidence-based conclusions and recommendations.',
          meets: 'Uses appropriate quantitative data and logical analysis to support conclusions, evaluate assumptions, and develop reasonable recommendations. Uses appropriate data and analysis to support logical conclusions and recommendation',
          doesNotMeet: 'Demonstrates limited, inaccurate, or unsupported analysis, relies on weak interpretation of quantitative data, or fails to critically evaluate assumptions and conclusions.'
        }
      }
    ]
  },
  {
    id: 'PLO5',
    verb: 'Collaborate',
    text: 'Collaborate effectively as a business leader and team member in cross-cultural and global contexts to achieve common goals.',
    bloomLevel: 'Apply',
    order: 5,
    shortNotation: 'Collaboration',
    dimensions: [
      {
        id: '5.1',
        name: 'Team Contribution & Collaboration in cross-cultural context',
        rubric: {
          exceeds: 'Collaborates effectively and professionally while demonstrating respect for diverse perspectives and constructive contribution to team process and outcomes',
          meets: 'Collaborates appropriately with others and demonstrates consideration of diverse perspectives and shared team responsibilities',
          doesNotMeet: 'Demonstrates limited or inconsistent collaboration, engagement with diverse perspectives, or contribution to shared team responsibilities'
        }
      }
    ]
  },
  {
    id: 'PLO6',
    verb: 'Lead',
    text: 'Lead teams through the resolution of problems and successful completion of projects and tasks.',
    bloomLevel: 'Apply',
    order: 6,
    shortNotation: 'Leadership',
    dimensions: [
      {
        id: '6.1',
        name: 'Leads Team',
        rubric: {
          exceeds: 'Consistently motivates and coordinates team members, facilitates strong collaboration and engagement, resolves challenges constructively, and drives the team toward high performance outcomes.',
          meets: 'Provides clear direction and support to team members, communicates regularly, contributes positively to collaboration, and supports achievement of team goals',
          doesNotMeet: 'Provides limited direction to team members, participates inconsistently in team communication and meetings, and contributes unevenly to team motivation and collaboration'
        }
      },
      {
        id: '6.2',
        name: 'Project & Task Management',
        rubric: {
          exceeds: 'Proactively organizes and coordinates internal and external tasks, anticipates challenges, maintains strong communication with stakeholders, and consistently delivers high-quality outcomes on or ahead of schedule',
          meets: 'Completes assigned internal and external tasks on time, manages timelines and deliverables effectively, and communicates progress appropriately',
          doesNotMeet: 'Completes tasks inconsistently, demonstrates limited coordination of timelines and deliverables, and requires reminders or follow-up to meet expectations'
        }
      }
    ]
  },
  {
    id: 'PLO7',
    verb: 'Integrate',
    text: 'Integrate personal values and perspectives into problem solving and take responsibility for decisions.',
    bloomLevel: 'Create',
    order: 7,
    shortNotation: 'Personal Responsibility & Values',
    dimensions: [
      {
        id: '7.1',
        name: 'Values-Based Decision-Making',
        rubric: {
          exceeds: 'Clearly articulates personal values and consistently integrates them into decision-making. Demonstrates strong self-awareness and critically reflects on how values influence problem-solving and outcomes.',
          meets: 'Identifies personal values and incorporates them into decision- making with some evidence of reflection and alignment.',
          doesNotMeet: 'Demonstrates limited or unclear awareness of personal values, with weak or no connection to decision-making processes.'
        }
      },
      {
        id: '7.2',
        name: 'Accountability & Decision Justification',
        rubric: {
          exceeds: 'Takes full responsibility for decisions, provides well-reasoned and evidence-based justification, and critically evaluates outcomes, including lessons learned and areas for improvement.',
          meets: 'Accepts responsibility for decisions and provides reasonable justification supported by some analysis, with basic reflection on outcomes.',
          doesNotMeet: 'Avoids or inconsistently accepts responsibility, provides weak or unclear justification, and demonstrates little or no reflection on outcomes.'
        }
      }
    ]
  },
  {
    id: 'PLO8',
    verb: 'Communicate',
    text: 'Communicate ideas persuasively (written and oral) as a result of thorough analysis of information.',
    bloomLevel: 'Apply',
    order: 8,
    shortNotation: 'Communication',
    dimensions: [
      {
        id: '8.1',
        name: 'Written Communication',
        rubric: {
          exceeds: 'Clear, persuasive, well-structured business writing supported by credible evidence, professional tone, and polished formatting with minimal to no errors.',
          meets: 'Clear and organized business writing with relevant evidence, professional tone, and appropriate formatting with minor errors.',
          doesNotMeet: 'Unclear, poorly organized writing, lacking evidence, professional tone, or appropriate business formatting.'
        }
      },
      {
        id: '8.2',
        name: 'Oral Communication',
        rubric: {
          exceeds: 'Confident, engaging presentation with professional delivery and effective use of supporting materials to reinforce key business ideas and recommendations.',
          meets: 'Clear presentation with professional delivery, despite minor issues, and adequate support for key business ideas and recommendations.',
          doesNotMeet: 'Unclear or unprofessional presentation, lacking or completely missing effective delivery or adequate support for business communication.'
        }
      }
    ]
  },
  {
    id: 'PLO9',
    verb: 'Gather',
    text: 'Gather, analyze, and synthesize information for a business context.',
    bloomLevel: 'Analyze',
    order: 9,
    shortNotation: 'Information Analysis & Synthesis',
    dimensions: [
      {
        id: '9.1',
        name: 'Data Management (Data Collection + Data Cleaning + Data Normalization + Data governance)',
        rubric: {
          exceeds: 'Uses relevant, credible, and high- quality sources effectively',
          meets: 'Uses some relevant sources, but limited credibility or relevance',
          doesNotMeet: 'Uses poor, irrelevant, or insufficient sources'
        }
      },
      {
        id: '9.2',
        name: 'Data Analysis & Interpretation',
        rubric: {
          exceeds: 'Close to PLO 4.1- needs more discussion',
          meets: 'N.A',
          doesNotMeet: 'N.A'
        }
      },
      {
        id: '9.3',
        name: 'Insight Generation for Business Decisions',
        rubric: {
          exceeds: 'Close to PLO 4.2- needs more discussion',
          meets: 'N.A',
          doesNotMeet: 'N.A'
        }
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  // Term 1 (Tier 1: Analytical Foundation)
  {
    id: 'BUSI601',
    code: 'BUSI 601',
    name: 'Business Environment, Ethics & Strategy',
    description: 'Explores external socio-political, economic, and legal environments. Evaluates corporate social responsibility and strategic responses.',
    term: 1,
    clos: [
      { id: 'CLO1', verb: 'Identify', text: 'Identify statutory and legal regulations affecting local and national businesses.' },
      { id: 'CLO2', verb: 'Explain', text: 'Explain corporate social responsibility (CSR) philosophies and reporting models.' },
      { id: 'CLO3', verb: 'Evaluate', text: 'Evaluate ethical dilemmas in global labor, community, and environmental standards.' },
      { id: 'CLO4', verb: 'Analyze', text: 'Analyze external environmental forces in business planning using PESTEL and SWOT.' }
    ]
  },
  {
    id: 'ACCT601',
    code: 'ACCT 601',
    name: 'Financial Reporting & Analysis',
    description: 'Introduction to financial accounting standards. Covers statement preparation, interpretation, and analysis of transactions.',
    term: 1,
    clos: [
      { id: 'CLO1', verb: 'Record', text: 'Record business transactions within double-entry ledger systems.' },
      { id: 'CLO2', verb: 'Prepare', text: 'Prepare the core financial reports: Balance Sheet, Income, and Cash Flow statements.' },
      { id: 'CLO3', verb: 'Analyze', text: 'Analyze corporate liquidity, solvency, and profitability using financial ratios.' },
      { id: 'CLO4', verb: 'Interpret', text: 'Interpret financial statement disclosures to evaluate operational and investment risks.' }
    ]
  },
  {
    id: 'ORGB601',
    code: 'ORGB 601',
    name: 'Organizational Behaviour',
    description: 'Focuses on individual, group, and organizational level dynamics. Analyzes motivation, leadership styles, and conflict resolution.',
    term: 1,
    clos: [
      { id: 'CLO1', verb: 'Recognize', text: 'Recognize diverse leadership styles and their alignment with organizational culture.' },
      { id: 'CLO2', verb: 'Explain', text: 'Explain contemporary motivation theories to enhance employee productivity and retention.' },
      { id: 'CLO3', verb: 'Analyze', text: 'Analyze team dynamics, communication barriers, and group performance models.' },
      { id: 'CLO4', verb: 'Formulate', text: 'Formulate effective conflict resolution and negotiation strategies for corporate teams.' }
    ]
  },
  {
    id: 'OPMT620',
    code: 'OPMT 620',
    name: 'Quantitative Methods for Decision Making',
    description: 'Develops mathematical and statistical modeling skills for business problem solving and predictive analytics.',
    term: 1,
    clos: [
      { id: 'CLO1', verb: 'Summarize', text: 'Summarize multi-variable datasets with central tendency and dispersion measures.' },
      { id: 'CLO2', verb: 'Perform', text: 'Perform hypothesis testing and statistical inferences on corporate data samples.' },
      { id: 'CLO3', verb: 'Build', text: 'Build linear regression models to forecast sales and operational demand.' },
      { id: 'CLO4', verb: 'Apply', text: 'Apply decision tree analysis to evaluate and choose optimal strategic alternatives.' }
    ]
  },
  // Term 2 (Tier 2: Management Principles and Practices)
  {
    id: 'MRKT621',
    code: 'MRKT 621',
    name: 'Marketing Management',
    description: 'Covers strategic marketing, segment target positioning, branding, and promotional tools for customer relationships.',
    term: 2,
    clos: [
      { id: 'CLO1', verb: 'Conduct', text: 'Conduct market segmentation and targeting analyses based on demographic and psychographic data.' },
      { id: 'CLO2', verb: 'Design', text: 'Design an integrated marketing mix (4 Ps) tailored to local and global markets.' },
      { id: 'CLO3', verb: 'Evaluate', text: 'Evaluate brand equity metrics and product positioning structures relative to competitors.' },
      { id: 'CLO4', verb: 'Create', text: 'Create a comprehensive marketing launch plan for a new service or product.' }
    ]
  },
  {
    id: 'FNCE623',
    code: 'FNCE 623',
    name: 'Financial Management',
    description: 'Explores financial planning, capital budgeting, cost of capital, dividend policy, and working capital management.',
    term: 2,
    clos: [
      { id: 'CLO1', verb: 'Calculate', text: 'Calculate the weighted average cost of capital (WACC) for corporate investments.' },
      { id: 'CLO2', verb: 'Evaluate', text: 'Evaluate capital expenditure projects using Net Present Value (NPV) and IRR techniques.' },
      { id: 'CLO3', verb: 'Formulate', text: 'Formulate working capital policies for managing corporate cash, inventory, and credit.' },
      { id: 'CLO4', verb: 'Analyze', text: 'Analyze optimal corporate capital structures and financial risk leverage ratios.' }
    ]
  },
  {
    id: 'HRMT624',
    code: 'HRMT 624',
    name: 'Human Resource Management',
    description: 'Covers staffing models, training, appraisal frameworks, collective bargaining, and equitable compensation programs.',
    term: 2,
    clos: [
      { id: 'CLO1', verb: 'Align', text: 'Align human resource strategies with organizational mission and core labor laws.' },
      { id: 'CLO2', verb: 'Design', text: 'Design objective talent recruitment, selection, and onboarding processes.' },
      { id: 'CLO3', verb: 'Create', text: 'Create performance appraisal systems and employee motivation frameworks.' },
      { id: 'CLO4', verb: 'Formulate', text: 'Formulate global workforce retention strategies and equitable compensation programs.' }
    ]
  },
  {
    id: 'ECON622',
    code: 'ECON 622',
    name: 'Managerial Economics',
    description: 'Applies microeconomic theory and macroeconomic indicators to corporate decision-making and pricing strategy.',
    term: 2,
    clos: [
      { id: 'CLO1', verb: 'Analyze', text: 'Analyze consumer demand elasticity and cost functions for product lines.' },
      { id: 'CLO2', verb: 'Determine', text: 'Determine optimal output and pricing strategy under different market structures.' },
      { id: 'CLO3', verb: 'Evaluate', text: 'Evaluate the impact of macroeconomic policies and exchange rates on operations.' },
      { id: 'CLO4', verb: 'Assess', text: 'Assess regulatory anti-trust guidelines and competitive game-theoretic behaviors.' }
    ]
  },
  // Term 3 (Tier 3: Strategic Applications)
  {
    id: 'ANLY630',
    code: 'ANLY 630',
    name: 'Business Analytics',
    description: 'Integrates database queries, data visualization, predictive analytics, and executive dashboard design.',
    term: 3,
    clos: [
      { id: 'CLO1', verb: 'Extract', text: 'Extract and clean raw organizational data using structured query techniques.' },
      { id: 'CLO2', verb: 'Construct', text: 'Construct interactive business intelligence dashboards to support executive decisions.' },
      { id: 'CLO3', verb: 'Interpret', text: 'Interpret predictive analytics model outputs to inform tactical and strategic choices.' },
      { id: 'CLO4', verb: 'Formulate', text: 'Formulate robust data governance, privacy, and compliance policies for enterprise data.' }
    ]
  },
  {
    id: 'OPMT621',
    code: 'OPMT 621',
    name: 'Operations Management',
    description: 'Covers production systems, process flow design, supply chain networks, inventory control, and Lean/Six Sigma principles.',
    term: 3,
    clos: [
      { id: 'CLO1', verb: 'Identify', text: 'Identify operational bottlenecks and process wastes in manufacturing and service environments.' },
      { id: 'CLO2', verb: 'Apply', text: 'Apply Lean operations and Six Sigma quality control methodologies to optimize workflows.' },
      { id: 'CLO3', verb: 'Model', text: 'Model optimal inventory replenishment levels using Economic Order Quantity (EOQ).' },
      { id: 'CLO4', verb: 'Design', text: 'Design global supply chain logistics and shipping networks to maximize efficiency.' }
    ]
  },
  {
    id: 'OPMT625',
    code: 'OPMT 625',
    name: 'Project Management',
    description: 'Covers project planning, scoping, critical path methods, budget reserves, risk matrices, and reviews.',
    term: 3,
    clos: [
      { id: 'CLO1', verb: 'Draft', text: 'Draft a comprehensive project charter defining scope, milestones, and deliverables.' },
      { id: 'CLO2', verb: 'Construct', text: 'Construct a detailed Work Breakdown Structure (WBS) and Gantt schedule.' },
      { id: 'CLO3', verb: 'Evaluate', text: 'Evaluate qualitative project risks, probabilities, and budget contingency reserves.' },
      { id: 'CLO4', verb: 'Lead', text: 'Lead project execution tracking using Earned Value Management (EVM) metrics.' }
    ]
  },
  // Term 4 (Tier 4: Integration and Career)
  {
    id: 'BUSI650',
    code: 'BUSI 650',
    name: 'Strategic Management',
    description: 'Corporate-level strategy formulation. Analyzes competitor trends, mergers/alliances, and balanced scorecard design.',
    term: 4,
    clos: [
      { id: 'CLO1', verb: 'Perform', text: 'Perform internal resource and capability audits using VRIO frameworks.' },
      { id: 'CLO2', verb: 'Formulate', text: 'Formulate corporate growth, diversification, and market expansion strategies.' },
      { id: 'CLO3', verb: 'Design', text: 'Design a Balanced Scorecard to translate high-level strategy into key performance indicators.' },
      { id: 'CLO4', verb: 'Evaluate', text: 'Evaluate strategic merger, acquisition, or joint venture opportunities.' }
    ]
  },
  {
    id: 'CAPS602',
    code: 'CAPS 602',
    name: 'Consulting Project',
    description: 'Applied capstone project. Synthesizes the full MBA toolkit to solve a real-world client operational or strategic problem.',
    term: 4,
    clos: [
      { id: 'CLO1', verb: 'Define', text: 'Define a complex organizational challenge and frame an actionable consulting scope.' },
      { id: 'CLO2', verb: 'Collect', text: 'Collect and analyze primary operational metrics and qualitative data from client stakeholders.' },
      { id: 'CLO3', verb: 'Diagnose', text: 'Diagnose performance gaps, operational inefficiencies, or strategic errors using MBA toolsets.' },
      { id: 'CLO4', verb: 'Formulate', text: 'Formulate complete strategic advisory recommendations, turnaround plans, and implementation roadmaps.' }
    ]
  }
];

// Default seed mappings (courseId_cloId -> PLO IDs)
export const INITIAL_MAPPINGS: { [key: string]: string[] } = {
  // BUSI 601
  'BUSI601_CLO1': ['PLO1'],
  'BUSI601_CLO2': ['PLO3'],
  'BUSI601_CLO3': ['PLO3'],
  'BUSI601_CLO4': ['PLO1', 'PLO2'],

  // ACCT 601
  'ACCT601_CLO1': ['PLO1'],
  'ACCT601_CLO2': ['PLO1'],
  'ACCT601_CLO3': ['PLO1', 'PLO6'],
  'ACCT601_CLO4': ['PLO1'],

  // ORGB 601
  'ORGB601_CLO1': ['PLO5'],
  'ORGB601_CLO2': ['PLO5'],
  'ORGB601_CLO3': ['PLO4', 'PLO5'],
  'ORGB601_CLO4': ['PLO5'],

  // OPMT 620
  'OPMT620_CLO1': ['PLO1', 'PLO6'],
  'OPMT620_CLO2': ['PLO1', 'PLO6'],
  'OPMT620_CLO3': ['PLO6'],
  'OPMT620_CLO4': ['PLO1'],

  // MRKT 621
  'MRKT621_CLO1': ['PLO1', 'PLO2'],
  'MRKT621_CLO2': ['PLO4'],
  'MRKT621_CLO3': ['PLO1'],
  'MRKT621_CLO4': ['PLO4'],

  // FNCE 623
  'FNCE623_CLO1': ['PLO6'],
  'FNCE623_CLO2': ['PLO1', 'PLO3'],
  'FNCE623_CLO3': ['PLO1'],
  'FNCE623_CLO4': ['PLO1'],

  // HRMT 624
  'HRMT624_CLO1': ['PLO3'],
  'HRMT624_CLO2': ['PLO5'],
  'HRMT624_CLO3': ['PLO5'],
  'HRMT624_CLO4': ['PLO2', 'PLO5'],

  // ECON 622
  'ECON622_CLO1': ['PLO1'],
  'ECON622_CLO2': ['PLO1'],
  'ECON622_CLO3': ['PLO2'],
  'ECON622_CLO4': ['PLO3'],

  // ANLY 630
  'ANLY630_CLO1': ['PLO6'],
  'ANLY630_CLO2': ['PLO4', 'PLO6'],
  'ANLY630_CLO3': ['PLO1', 'PLO6'],
  'ANLY630_CLO4': ['PLO3', 'PLO6'],

  // OPMT 621
  'OPMT621_CLO1': ['PLO1'],
  'OPMT621_CLO2': ['PLO6'],
  'OPMT621_CLO3': ['PLO6'],
  'OPMT621_CLO4': ['PLO2', 'PLO6'],

  // OPMT 625
  'OPMT625_CLO1': ['PLO4'],
  'OPMT625_CLO2': ['PLO6'],
  'OPMT625_CLO3': ['PLO1'],
  'OPMT625_CLO4': ['PLO5'],

  // BUSI 650
  'BUSI650_CLO1': ['PLO1'],
  'BUSI650_CLO2': ['PLO1', 'PLO2'],
  'BUSI650_CLO3': ['PLO1', 'PLO6'],
  'BUSI650_CLO4': ['PLO1', 'PLO3'],

  // CAPS 602
  'CAPS602_CLO1': ['PLO1', 'PLO4'],
  'CAPS602_CLO2': ['PLO6'],
  'CAPS602_CLO3': ['PLO1'],
  'CAPS602_CLO4': ['PLO1', 'PLO4', 'PLO5']
};

export const DEFAULT_SETTINGS: Setting = {
  id: 'general',
  thresholdTerm: 3,
  thresholdProgram: 5
};

// Initial assignments seed for each course
export const INITIAL_ASSIGNMENTS: { [courseId: string]: Assignment[] } = {
  'BUSI601': [
    { id: 'BUSI601_A1', name: 'CSR Policy Case Study', weight: 30, clos: ['CLO2'], plos: ['PLO3'] },
    { id: 'BUSI601_A2', name: 'External PESTEL & SWOT Analysis', weight: 30, clos: ['CLO4'], plos: ['PLO1', 'PLO2'] },
    { id: 'BUSI601_A3', name: 'Final Strategy Advisory Paper', weight: 40, clos: ['CLO1', 'CLO3'], plos: ['PLO1', 'PLO3'] }
  ],
  'ACCT601': [
    { id: 'ACCT601_A1', name: 'Double-Entry Ledger Exercise', weight: 40, clos: ['CLO1', 'CLO2'], plos: ['PLO1'] },
    { id: 'ACCT601_A2', name: 'Financial Statement Health Presentation', weight: 60, clos: ['CLO3', 'CLO4'], plos: ['PLO1', 'PLO6'] }
  ],
  'ORGB601': [
    { id: 'ORGB601_A1', name: 'Leadership Self-Reflective Journal', weight: 30, clos: ['CLO1'], plos: ['PLO5'] },
    { id: 'ORGB601_A2', name: 'High-Performance Team Motivation Plan', weight: 30, clos: ['CLO2'], plos: ['PLO5'] },
    { id: 'ORGB601_A3', name: 'Corporate Conflict Advisory Brief', weight: 40, clos: ['CLO3', 'CLO4'], plos: ['PLO4', 'PLO5'] }
  ],
  'OPMT620': [
    { id: 'OPMT620_A1', name: 'Operational Data Descriptive Stats Lab', weight: 30, clos: ['CLO1'], plos: ['PLO1', 'PLO6'] },
    { id: 'OPMT620_A2', name: 'Multiple Regression Sales Forecasting', weight: 45, clos: ['CLO3'], plos: ['PLO6'] },
    { id: 'OPMT620_A3', name: 'Decision Trees Strategic Options Paper', weight: 25, clos: ['CLO4'], plos: ['PLO1'] }
  ],
  'MRKT621': [
    { id: 'MRKT621_A1', name: 'Target Segment Audit & Positioning Paper', weight: 40, clos: ['CLO1', 'CLO3'], plos: ['PLO1', 'PLO2'] },
    { id: 'MRKT621_A2', name: 'Integrated Marketing Launch Plan', weight: 60, clos: ['CLO2', 'CLO4'], plos: ['PLO4'] }
  ],
  'FNCE623': [
    { id: 'FNCE623_A1', name: 'Corporate WACC & Capital Budgeting Excel Model', weight: 50, clos: ['CLO1', 'CLO2'], plos: ['PLO1', 'PLO6'] },
    { id: 'FNCE623_A2', name: 'Optimal Capital Structure & Risk Proposal', weight: 50, clos: ['CLO3', 'CLO4'], plos: ['PLO1'] }
  ],
  'HRMT624': [
    { id: 'HRMT624_A1', name: 'Workplace Recruiting and Onboarding Handbook', weight: 50, clos: ['CLO1', 'CLO2'], plos: ['PLO3', 'PLO5'] },
    { id: 'HRMT624_A2', name: 'Global Compensation & Retention Matrix', weight: 50, clos: ['CLO3', 'CLO4'], plos: ['PLO2', 'PLO5'] }
  ],
  'ECON622': [
    { id: 'ECON622_A1', name: 'Microeconomic Pricing & Cost Case Study', weight: 50, clos: ['CLO1', 'CLO2'], plos: ['PLO1'] },
    { id: 'ECON622_A2', name: 'Macroeconomic Exchange Rate Operational Audit', weight: 50, clos: ['CLO3', 'CLO4'], plos: ['PLO2', 'PLO3'] }
  ],
  'ANLY630': [
    { id: 'ANLY630_A1', name: 'SQL Query and Database Cleaning Lab', weight: 30, clos: ['CLO1'], plos: ['PLO6'] },
    { id: 'ANLY630_A2', name: 'Executive Tableau Sales Dashboard', weight: 50, clos: ['CLO2', 'CLO3'], plos: ['PLO4', 'PLO6'] },
    { id: 'ANLY630_A3', name: 'Data Governance and Compliance Brief', weight: 20, clos: ['CLO4'], plos: ['PLO3', 'PLO6'] }
  ],
  'OPMT621': [
    { id: 'OPMT621_A1', name: 'Lean Operations Waste Diagnostics', weight: 50, clos: ['CLO1', 'CLO2'], plos: ['PLO1', 'PLO6'] },
    { id: 'OPMT621_A2', name: 'EOQ Logistics and Shipping Network Map', weight: 50, clos: ['CLO3', 'CLO4'], plos: ['PLO2', 'PLO6'] }
  ],
  'OPMT625': [
    { id: 'OPMT625_A1', name: 'Comprehensive Scope Charter & WBS', weight: 40, clos: ['CLO1', 'CLO2'], plos: ['PLO4', 'PLO6'] },
    { id: 'OPMT625_A2', name: 'Project Risk Analysis and Earned Value Report', weight: 60, clos: ['CLO3', 'CLO4'], plos: ['PLO1', 'PLO5'] }
  ],
  'BUSI650': [
    { id: 'BUSI650_A1', name: 'Corporate VRIO Capability Audit', weight: 30, clos: ['CLO1'], plos: ['PLO1'] },
    { id: 'BUSI650_A2', name: 'Strategic Diversification and Balanced Scorecard', weight: 70, clos: ['CLO2', 'CLO3', 'CLO4'], plos: ['PLO2', 'PLO6'] }
  ],
  'CAPS602': [
    { id: 'CAPS602_A1', name: 'Client Operational Discovery Memo', weight: 20, clos: ['CLO1'], plos: ['PLO4'] },
    { id: 'CAPS602_A2', name: 'Final Client advisory Turnaround Plan', weight: 80, clos: ['CLO2', 'CLO3', 'CLO4'], plos: ['PLO1', 'PLO4', 'PLO5', 'PLO6'] }
  ]
};

// Default sample students seed
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student_1',
    name: 'Emily Chen',
    email: 'emily.chen@myucw.ca',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    grades: {
      'BUSI601': { 'BUSI601_A1': 88, 'BUSI601_A2': 92, 'BUSI601_A3': 90 },
      'ACCT601': { 'ACCT601_A1': 90, 'ACCT601_A2': 87 },
      'ORGB601': { 'ORGB601_A1': 85, 'ORGB601_A2': 95, 'ORGB601_A3': 88 },
      'OPMT620': { 'OPMT620_A1': 91, 'OPMT620_A2': 89, 'OPMT620_A3': 93 },
      'MRKT621': { 'MRKT621_A1': 92, 'MRKT621_A2': 91 }
    }
  },
  {
    id: 'student_2',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@myucw.ca',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    grades: {
      'BUSI601': { 'BUSI601_A1': 72, 'BUSI601_A2': 78, 'BUSI601_A3': 81 },
      'ACCT601': { 'ACCT601_A1': 75, 'ACCT601_A2': 71 },
      'ORGB601': { 'ORGB601_A1': 80, 'ORGB601_A2': 82, 'ORGB601_A3': 79 },
      'OPMT620': { 'OPMT620_A1': 68, 'OPMT620_A2': 74, 'OPMT620_A3': 70 }
    }
  },
  {
    id: 'student_3',
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@myucw.ca',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    grades: {
      'BUSI601': { 'BUSI601_A1': 94, 'BUSI601_A2': 96, 'BUSI601_A3': 95 },
      'ACCT601': { 'ACCT601_A1': 96, 'ACCT601_A2': 98 },
      'ORGB601': { 'ORGB601_A1': 91, 'ORGB601_A2': 88, 'ORGB601_A3': 92 },
      'OPMT620': { 'OPMT620_A1': 96, 'OPMT620_A2': 98, 'OPMT620_A3': 97 },
      'MRKT621': { 'MRKT621_A1': 90, 'MRKT621_A2': 92 }
    }
  }
];
