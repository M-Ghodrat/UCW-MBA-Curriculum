import { PLO, Course, Setting, Student, Assignment, AcademicProgram, FacultyComment, FeedbackRound } from '../types';

export const INITIAL_PROGRAMS: AcademicProgram[] = [
  {
    id: 'mba',
    code: 'MBA',
    name: 'Master of Business Administration (MBA)',
    degreeLevel: 'Graduate',
    accreditation: 'ACBSP Accredited',
    description: 'The ACBSP-accredited Master of Business Administration (MBA) program from University Canada West (UCW) will prepare you for leadership on the global stage. You will learn how to take challenging situations in stride, apply pragmatic solutions to problems and ultimately drive the success of an organization.',
    objectives: 'The program develops graduates who can formulate sustainable business strategy, build and direct diverse business teams, conduct analytics-driven business evaluation, and integrate digital technology solutions seamlessly into daily corporate operations.',
    termsCount: 4,
    termLabel: 'Term',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'bcom',
    code: 'BCom',
    name: 'Bachelor of Commerce (BCom)',
    degreeLevel: 'Undergraduate',
    accreditation: 'ACBSP Accredited',
    description: 'The Bachelor of Commerce (BCom) program from University Canada West (UCW) provides a comprehensive business education grounded in critical thinking, analytical decision-making, and ethical leadership.',
    objectives: '1. Acquire core foundational knowledge in commercial business disciplines.\n2. Apply quantitative and qualitative analytical tools to solve practical business problems.\n3. Demonstrate professional communication, teamwork, and ethical awareness across diverse organizations.',
    termsCount: 8,
    termLabel: 'Term',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_PLOS: PLO[] = [
  {
    id: 'PLO1',
    programId: 'mba',
    verb: 'Construct',
    text: 'Construct strategic responses to business challenges/opportunities.',
    bloomLevel: 'Create',
    order: 1,
    shortNotation: 'Strategic Responses',
    dimensions: [
      {
        id: '1.1',
        name: 'Analyze Strategic Context',
        rubric: {
          exceeds: 'Uses multiple relevant frameworks, diverse evidence, technology-supported insights where appropriate, and considers economic, social, environmental, AND Indigenous contexts to develop a comprehensive description of the strategic situation.',
          meets: 'Uses relevant frameworks, credible evidence, and some appropriate contextual factors to analyze the business situation and identify key challenges or opportunities.',
          doesNotMeet: 'Uses limited or inappropriate frameworks and evidence, with minimal consideration of relevant contextual factors, resulting in an incomplete or unsupported analysis.'
        }
      },
      {
        id: '1.2',
        name: 'Evaluate Strategic Alternatives',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and evaluates three or more alternatives; explicitly weighs risks against opportunities for each alternative; supports the evaluation with specific evidence (financial data, market research, case facts) rather than general assertion; identifies impacts across multiple stakeholder groups (e.g., customers, employees, shareholders, community)',
          meets: 'Compares at least two strategic alternatives against explicitly stated criteria (e.g., cost, feasibility, risk, time to implement); identifies impacts on at least one key stakeholder group for each alternative',
          doesNotMeet: 'Considers only one alternative, or presents multiple alternatives without stating the criteria used to compare them; stakeholder impacts are not identified, or are asserted without supporting reasoning'
        }
      },
      {
        id: '1.3',
        name: 'Construct Strategic Responses',
        rubric: {
          exceeds: 'Develops a feasible, innovative, and evidence-based strategic response that aligns with organizational goals, stakeholder needs, and implementation requirements.',
          meets: 'Develops a practical strategic response supported by analysis, relevant evidence, and consideration of implementation requirements.',
          doesNotMeet: 'Proposes a response that is unrealistic, insufficiently supported, or disconnected from the analysis of the business challenge or opportunity.'
        }
      }
    ]
  },
  {
    id: 'PLO2',
    programId: 'mba',
    verb: 'Assess',
    text: 'Assess ethical implications of business activities.',
    bloomLevel: 'Evaluate',
    order: 2,
    shortNotation: 'Ethical Assessment',
    dimensions: [
      {
        id: '2.1',
        name: 'Identify Ethical Issues',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and explicitly explains how two or more identified issues are connected (e.g., resolving one affects another); identifies at least one specific instance where stakeholder interests conflict, rather than listing interests separately; addresses Indigenous rights or interests when the situation involves them; traces at least one broader societal implication beyond the immediate organization (e.g., regulatory precedent, industry-wide effect, long-term reputational risk)',
          meets: 'Identifies at least two distinct ethical issues; names the stakeholder group(s) affected by each issue; states at least one broader social or organizational implication (e.g., reputational, regulatory, financial) for at least one issue',
          doesNotMeet: 'Fails to identify significant ethical issues, stakeholder concerns, or broader implications related to the situation.'
        }
      },
      {
        id: '2.2',
        name: 'Analyze Ethical Context',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and applies two or more ethical frameworks and compares what each implies for the situation; explicitly connects at least two contextual factors to one another (e.g., explains how a legal requirement conflicts with or is shaped by a cultural norm) rather than listing them separately; states an ethical conclusion and ties it back to specific framework principles as justification',
          meets: 'Names and correctly applies at least one recognized ethical framework (e.g., utilitarianism, deontology, virtue ethics, stakeholder theory) to the situation; addresses at least three of the four contextual factors (legal, cultural, technological, social), each discussed individually',
          doesNotMeet: 'Does not name a specific ethical framework, or applies one in a way that contradicts its own stated principles; addresses zero or one of the four contextual factors (legal, cultural, technological, social)'
        }
      },
      {
        id: '2.3',
        name: 'Make Responsible Recommendations',
        rubric: {
          exceeds: 'Recommends ethical, accountable, and sustainable actions supported by sound reasoning, stakeholder considerations, and awareness of short- and long-term consequences.',
          meets: 'Recommends ethically appropriate actions supported by reasoning, consideration of stakeholders, and awareness of potential consequences.',
          doesNotMeet: 'Recommends actions that lack ethical justification, accountability, or consideration of stakeholder impacts and long-term consequences.'
        }
      }
    ]
  },
  {
    id: 'PLO3',
    programId: 'mba',
    verb: 'Develop',
    text: 'Develop, implement, and evaluate solutions to business problems.',
    bloomLevel: 'Create',
    order: 3,
    shortNotation: 'Problem Solving',
    dimensions: [
      {
        id: '3.1',
        name: 'Diagnose & Define Problems',
        rubric: {
          exceeds: 'Identifies root causes using evidence from multiple perspectives, integrates relevant data and stakeholder insights, and demonstrates a comprehensive understanding of underlying factors influencing the problem.',
          meets: 'Identifies key issues using relevant information and demonstrates an understanding of the main factors contributing to the problem.',
          doesNotMeet: 'Provides a limited or inaccurate understanding of the problem, with unclear root causes and insufficient supporting evidence.'
        }
      },
      {
        id: '3.2',
        name: 'Design & Implement Solutions',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and identifies at least one specific implementation risk paired with a concrete mitigation or contingency step (not just "monitor closely"); sequences actions with explicit dependencies (what must happen before what, and by when); where a technology-enabled tool or process would materially aid execution, names the specific tool/process and how it\'s used — rather than a generic reference to "leveraging technology"',
          meets: 'Specifies concrete actions in sequence; identifies specific resources required (budget, staffing, time) with enough detail to act on; identifies at least one stakeholder group affected by implementation and how they are affected',
          doesNotMeet: 'Plan omits required actions, resources, or affected stakeholders, or specifies them too vaguely to act on (e.g., "allocate sufficient budget" without a figure or source); includes actions inconsistent with stated constraints (e.g., timeline, budget, staffing)'
        }
      },
      {
        id: '3.3',
        name: 'Evaluate & Improve Solutions',
        rubric: {
          exceeds: 'Uses meaningful measures to evaluate outcomes, analyzes performance results, identifies areas for improvement, and proposes continuous improvement strategies to enhance solution effectiveness over time.',
          meets: 'Evaluates outcomes using appropriate criteria and identifies opportunities to improve solution effectiveness.',
          doesNotMeet: 'Provides limited or unsupported evaluation of outcomes, with little evidence of reflection or consideration of improvement opportunities.'
        }
      }
    ]
  },
  {
    id: 'PLO4',
    programId: 'mba',
    verb: 'Formulate',
    text: 'Formulate business decisions and systematic analysis that reflects critical thinking.',
    bloomLevel: 'Create',
    order: 4,
    shortNotation: 'Critical Thinking & Decision-Making',
    dimensions: [
      {
        id: '4.1',
        name: 'Identify Relevant Information Amidst Uncertainty',
        rubric: {
          exceeds: 'Demonstrates critical and comprehensive evaluation of evidence, assumptions, uncertainties, technologically-aided search outputs, and information gaps.',
          meets: 'Recognizes relevant information, evidence and uncertainties, with some critical and comprehensive evaluation.',
          doesNotMeet: 'Displays a limited, inaccurate, or unsupported evaluation of or overlooks important information and evidence.'
        }
      },
      {
        id: '4.2',
        name: 'Explore Perspectives & Assumptions',
        rubric: {
          exceeds: 'Integrates multiple viewpoints in exploration, including Indigenous and diverse perspectives, while recognizing bias.',
          meets: 'Considers a few alternative viewpoints in exploration of perspectives and assumptions.',
          doesNotMeet: 'Fails to consider alternative viewpoints in exploration and/or relies on a single perspective.'
        }
      },
      {
        id: '4.3',
        name: 'Evaluate Merits & Limitations',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and weighs the merits against the limitations for at least one alternative to reach an explicit judgment about its net desirability (not merely listing both sides); describes at least one potential outcome in terms of likelihood or magnitude (e.g., "likely," "a significant cost increase," a range) rather than as a flat yes/no result; compares limitations across alternatives to identify which are more manageable or more severe relative to each other',
          meets: 'Identifies at least one merit and one limitation for each alternative considered; connects each merit or limitation to a specific likely outcome of that alternative (e.g., "faster to implement" tied to "reduces exposure to a competitor\'s first-mover advantage")',
          doesNotMeet: 'Fails to identify or ignores the merits and limitations of alternatives.'
        }
      },
      {
        id: '4.4',
        name: 'Finalize & Justify Decisions',
        rubric: {
          exceeds: 'Uses explicit and comprehensive decision criteria when formulating decisions and provides evidence-based justification to support the decision rationale.',
          meets: 'Provides evidence-based justification to support the decision rationale without explicitly stated criteria.',
          doesNotMeet: 'Provides weak or unsupported justification for decisions, if any.'
        }
      }
    ]
  },
  {
    id: 'PLO5',
    programId: 'mba',
    verb: 'Collaborate',
    text: 'Collaborate effectively as a business leader and team member in cross-cultural and global contexts to achieve common goals.',
    bloomLevel: 'Apply',
    order: 5,
    shortNotation: 'Collaboration',
    dimensions: [
      {
        id: '5.1',
        name: 'Contribute to Group Work',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and demonstrably improves team output beyond own assigned task — e.g., identifies and resolves a gap/error in another member\'s work, proposes a solution later adopted by the team, or takes on additional coordination/integration work reflected in team artifacts',
          meets: 'Completes assigned tasks on time and to a workable standard; responds to teammate feedback with revisions; peer/self-assessment and team artifacts (meeting notes, task log, shared documents) show a fair share of team workload',
          doesNotMeet: 'Misses agreed deadlines or deliverables more than once; contributions require rework by teammates without offering revisions; peer/self-assessment or team log shows contribution below an equitable share of team tasks'
        }
      },
      {
        id: '5.2',
        name: 'Display Inclusive Collaboration',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and initiates a specific, documented action that measurably increased a teammate\'s participation. For example, followed up individually with a teammate outside of group meetings to incorporate input that hadn\'t surfaced in discussion (reflected in messages or revised drafts), restructured task allocation to fit a stated need, or explicitly handed a leadership moment (running a meeting segment, presenting the team\'s work) to a quieter member, etc.',
          meets: 'Team artifacts (meeting notes, peer evaluation, shared documents) show at least one documented instance of soliciting input from a teammate before a decision was finalized, and credits teammates\' ideas by name in discussion or written work',
          doesNotMeet: 'Peer evaluation, self-assessment, or team log documents a specific instance of dismissing, interrupting, or excluding a teammate\'s contribution; or no evidence in team artifacts of soliciting input from teammates beyond default meeting attendance'
        }
      }
    ]
  },
  {
    id: 'PLO6',
    programId: 'mba',
    verb: 'Lead',
    text: 'Lead teams through the resolution of problems and successful completion of projects and tasks.',
    bloomLevel: 'Apply',
    order: 6,
    shortNotation: 'Leadership',
    dimensions: [
      {
        id: '6.1',
        name: 'Perform Emerging Leadership Behaviors',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and demonstrates leadership actions across at least two distinct categories (structuring work, resolving conflict, re-engaging a disengaged teammate), with evidence that a specific action directly prevented a negative outcome (e.g., a missed deadline, a stalled deliverable) — documented in team log, peer evaluation, or instructor observation',
          meets: 'At least one documented instance of: proposing a plan or structure the team otherwise lacked (e.g., task breakdown, meeting agenda, decision process), or resolving a specific team conflict or stalled decision — reflected in team log or peer evaluation',
          doesNotMeet: 'No documented instance of the student initiating structure, resolving a stalled decision or conflict, or re-engaging a disengaged teammate, when the team log or peer evaluation shows such a need arose'
        }
      },
      {
        id: '6.2',
        name: 'Integrate Organizational Considerations into Team Decisions',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and incorporates three or more considerations; explicitly identifies at least one instance where two considerations trade off against each other (e.g., an innovation opportunity that raises sustainability concerns) and explains how the team\'s recommendation resolves or navigates that tradeoff',
          meets: 'Deliverable explicitly incorporates at least two of the four considerations into the team\'s recommendation or decision, with stated reasoning connecting each consideration to the outcome (not merely listed)',
          doesNotMeet: 'Team deliverable addresses zero or one of the four considerations (ethics, sustainability, innovation, technology) explicitly, or a consideration is mentioned without being connected to the team\'s actual recommendation or decision'
        }
      }
    ]
  },
  {
    id: 'PLO7',
    programId: 'mba',
    verb: 'Integrate',
    text: 'Integrate personal values and perspectives into problem solving and take responsibility for decisions.',
    bloomLevel: 'Create',
    order: 7,
    shortNotation: 'Personal Responsibility & Values',
    dimensions: [
      {
        id: '7.1',
        name: 'Identify Personal Values and Perspectives',
        rubric: {
          exceeds: 'Critically reflects on personal values, assumptions, and perspectives, integrating them with alternative viewpoints to guide business decisions.',
          meets: 'Identifies personal values and incorporates them into decision-making with clear evidence of alignment.',
          doesNotMeet: 'Demonstrates weak or unclear personal values with no discernable connection to decision-making processes.'
        }
      },
      {
        id: '7.2',
        name: 'Maintain Accountability',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and explicitly evaluates whether the outcome aligned with the originally stated objective (not just whether it "worked out"); when the outcome fell short of that objective, identifies the specific gap between intended and actual result and explains why it occurred; connects the reflection to a general principle or approach for future decisions, rather than only a fix specific to this one case',
          meets: 'Explicitly attributes the outcome to their own decision or action; states the specific reasoning or criteria used in making that decision; identifies at least one specific thing they would repeat or change if facing a similar situation again',
          doesNotMeet: 'Attributes the outcome primarily to external factors, other people, or circumstances rather than to their own decision; does not state the reasoning behind the decision at the time it was made; does not identify anything they would repeat or change if facing the situation again'
        }
      }
    ]
  },
  {
    id: 'PLO8',
    programId: 'mba',
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
          exceeds: 'Meets all "Meets Standard" criteria, and anticipates and explicitly addresses at least one counterargument or alternative interpretation of the evidence; uses specific, concrete evidence to support every major claim; demonstrates strong command of grammar, spelling, punctuation, and formatting with minimal to no errors, and clear, precise sentence-level construction throughout',
          meets: 'States a clear central argument or recommendation early in the document; supports each major claim with specific evidence from the analysis; organizes content in a logical sequence appropriate to the document type; grammar, spelling, punctuation, and formatting follow professional business writing conventions, with occasional minor errors',
          doesNotMeet: 'Central argument or recommendation is unclear, absent, or not stated until late in the document; claims are asserted without supporting evidence from the analysis; grammar, spelling, punctuation, or formatting contains frequent errors inconsistent with professional business writing standards'
        }
      },
      {
        id: '8.2',
        name: 'Oral Communication',
        rubric: {
          exceeds: 'Delivers engaging presentations that effectively integrate presentation techniques (e.g., eye contact, storytelling, multimedia elements, varied speaking rate and pitch, and well-designed slides) with visuals to reinforce key business ideas.',
          meets: 'Delivers clear, professional presentations that effectively communicate business ideas.',
          doesNotMeet: 'Presentation lacks clarity, organization, or effective delivery.'
        }
      },
      {
        id: '8.3',
        name: 'Maintain Focus on the Relevant Audience',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and adapts communication across multiple aspects simultaneously (e.g., tone, structure, technical detail, and content selection together); when more than one audience is relevant, addresses each audience\'s distinct needs separately (e.g., a different framing for executives than for technical staff) rather than using one generic version for everyone',
          meets: 'Explicitly identifies the intended audience; adapts at least one aspect of communication (e.g., tone, level of technical detail, or content included/excluded) to match that audience\'s background or needs',
          doesNotMeet: 'Fails to adapt communication to the relevant audience.'
        }
      }
    ]
  },
  {
    id: 'PLO9',
    programId: 'mba',
    verb: 'Gather',
    text: 'Gather, analyze, and synthesize information for a business context.',
    bloomLevel: 'Analyze',
    order: 9,
    shortNotation: 'Information Analysis & Synthesis',
    dimensions: [
      {
        id: '9.1',
        name: 'Gather & Validate Information',
        rubric: {
          exceeds: 'Critically evaluates diverse, credible sources, leveraging sophisticated analytical tools, community wisdom (as appropriate), and research assets from varied perspectives.',
          meets: 'Utilizes relevant and credible sources to support business analysis.',
          doesNotMeet: 'Relies on weak, irrelevant, or insufficient sources for decision-making.'
        }
      },
      {
        id: '9.2',
        name: 'Analyze & Synthesize Information',
        rubric: {
          exceeds: 'Meets all "Meets Standard" criteria, and draws on three or more sources or perspectives (e.g., different data types, stakeholder viewpoints, or conflicting reports) to identify at least two distinct patterns or relationships; explicitly addresses a contradiction or tension between sources rather than presenting them as if they agree',
          meets: 'Draws on information from at least two distinct sources or datasets to identify at least one explicit pattern or relationship (e.g., a trend, a correlation, a cause-and-effect link) that is not stated directly in any single source',
          doesNotMeet: 'Presents information source-by-source without connecting it (e.g., summarizes each source in isolation), or states a conclusion not traceable to the information presented; identifies no explicit pattern or relationship across sources'
        }
      },
      {
        id: '9.3',
        name: 'Generate Insights',
        rubric: {
          exceeds: 'Develops actionable, evidence-based insights while explicitly acknowledging limitations to prevent oversight.',
          meets: 'Develops reasonable insights that are adequately supported by evidence.',
          doesNotMeet: 'Insights are absent, weak, unsupported, or contrary to critical evidence.'
        }
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  // Term 1: Analytical Foundation
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
  // Term 2: Management Principles and Practices
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
  // Term 3: Strategic Applications
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
  // Term 4: Integration and Career
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
  id: 'mba_general',
  programId: 'mba',
  thresholdTerm: 3,
  thresholdProgram: 5,
  facultySandboxEnabled: false,
  activeRoundId: '',
  activeRoundName: '',
  feedbackLevels: {
    plo: true,
    dimension: true,
    rubric: true
  }
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
export const INITIAL_BCOM_PLOS: PLO[] = [
  {
    id: 'PLO1',
    programId: 'bcom',
    verb: 'Apply',
    text: 'Apply contemporary business methods and analytical tools to organizational challenges.',
    bloomLevel: 'Apply',
    order: 1,
    shortNotation: 'Analytical Tools & Business Methods',
    dimensions: [
      {
        id: '1.1',
        name: 'Select Appropriate Business Methods and Analytical Tools',
        rubric: {
          exceeds: 'Selects the most appropriate business methods and analytical tools for the organizational challenge and justifies the selection using relevant criteria.',
          meets: 'Selects appropriate and relevant business methods and analytical tools that address the organizational challenge.',
          doesNotMeet: 'Selects methods or analytical tools that are inappropriate or poorly matched to the organizational challenge and requires substantial guidance.'
        }
      },
      {
        id: '1.2',
        name: 'Apply Methods and Analytical Tools',
        rubric: {
          exceeds: 'Applies methods and tools to the organizational context, explains the rationale for key adaptations, and applies them accurately to the challenge.',
          meets: 'Applies appropriate methods and tools correctly to address the organizational challenge.',
          doesNotMeet: 'Applies methods or tools inaccurately, incompletely, or without sufficient connection to the challenge.'
        }
      },
      {
        id: '1.3',
        name: 'Interpret Results and Develop Recommendations',
        rubric: {
          exceeds: 'Integrates analytical results from the relevant evidence to develop well-supported recommendations that address the organizational challenge and its implications.',
          meets: 'Interprets results appropriately and uses them to develop relevant recommendations.',
          doesNotMeet: 'Misinterprets results or provides recommendations that are unclear, inappropriate, or insufficiently supported.'
        }
      }
    ]
  },
  {
    id: 'PLO2',
    programId: 'bcom',
    verb: 'Evaluate',
    text: 'Evaluate complex business problems through critical, logical, and evidence-based reasoning.',
    bloomLevel: 'Evaluate',
    order: 2,
    shortNotation: 'Critical & Evidence-Based Reasoning',
    dimensions: [
      {
        id: '2.1',
        name: 'Analyze Business Problems',
        rubric: {
          exceeds: 'Identifies and analyzes relevant aspects of the business problem, including relationships, assumptions, and implications, and explains how they affect the analysis.',
          meets: 'Identifies and analyzes relevant factors associated with the business problem.',
          doesNotMeet: 'Provides limited, incomplete, or inaccurate analysis of the business problem.'
        }
      },
      {
        id: '2.2',
        name: 'Evaluate Evidence and Alternatives',
        rubric: {
          exceeds: 'Evaluates the quality and relevance of evidence using explicit criteria, weighs alternative explanations or solutions, and explains the implications of the comparison.',
          meets: 'Evaluates relevant evidence using appropriate criteria and considers alternative explanations or solutions.',
          doesNotMeet: 'Uses insufficient or inappropriate evidence or provides no consideration of alternatives.'
        }
      },
      {
        id: '2.3',
        name: 'Develop Evidence-Based Conclusions',
        rubric: {
          exceeds: 'Develops logical, well-supported conclusions that integrate evidence and address the complexity of the problem.',
          meets: 'Develops logical conclusions supported by relevant evidence.',
          doesNotMeet: 'Conclusions are unclear, illogical, or insufficiently supported by evidence.'
        }
      }
    ]
  },
  {
    id: 'PLO3',
    programId: 'bcom',
    verb: 'Describe',
    text: 'Describe business decisions and practices through ethical, legal, and social responsibility frameworks.',
    bloomLevel: 'Understand',
    order: 3,
    shortNotation: 'Ethical, Legal & Social Responsibility',
    dimensions: [
      {
        id: '3.1',
        name: 'Identify Ethical, Legal, and Social Responsibility Considerations',
        rubric: {
          exceeds: 'Identifies and analyzes multiple relevant ethical, legal, and social responsibility considerations and explains their implications.',
          meets: 'Identifies relevant ethical, legal, and social responsibility considerations.',
          doesNotMeet: 'Fails to identify significant considerations or demonstrates limited understanding of their relevance.'
        }
      },
      {
        id: '3.2',
        name: 'Apply Relevant Frameworks to Business Decisions',
        rubric: {
          exceeds: 'Integrates relevant ethical, legal, and social responsibility frameworks and analyzes how they apply to the business decision or practice.',
          meets: 'Applies relevant frameworks appropriately to the business decision or practice.',
          doesNotMeet: 'Applies frameworks inaccurately, superficially, or without sufficient connection to the decision or practice.'
        }
      },
      {
        id: '3.3',
        name: 'Explain Implications of Business Decisions and Practices',
        rubric: {
          exceeds: 'Clearly explains the potential consequences and competing considerations associated with business decisions and practices.',
          meets: 'Describes relevant implications of business decisions and practices.',
          doesNotMeet: 'Provides limited, unclear, or unsupported explanation of the implications.'
        }
      }
    ]
  },
  {
    id: 'PLO4',
    programId: 'bcom',
    verb: 'Communicate',
    text: 'Communicate business information and arguments across written, oral, and digital formats.',
    bloomLevel: 'Apply',
    order: 4,
    shortNotation: 'Business Communication & Arguments',
    dimensions: [
      {
        id: '4.1',
        name: 'Organize Business Information and Arguments',
        rubric: {
          exceeds: 'Uses a deliberate structure that prioritizes key information, establishes clear relationships among ideas, and strengthens the intended message.',
          meets: 'Organizes business information and arguments logically and coherently.',
          doesNotMeet: 'Communicates information with gaps in organization, relevance, or logical sequencing.'
        }
      },
      {
        id: '4.2',
        name: 'Communicate Clearly and Persuasively',
        rubric: {
          exceeds: 'Communicates ideas clearly and persuasively using appropriate evidence, reasoning, and language use.',
          meets: 'Communicates ideas clearly using appropriate evidence and reasoning.',
          doesNotMeet: 'Claims or recommendations are insufficiently supported by evidence and reasoning.'
        }
      },
      {
        id: '4.3',
        name: 'Adapt Communication Across Formats and Audiences',
        rubric: {
          exceeds: 'Effectively adapts content, tone, evidence, and presentation to different audiences and written, oral, or digital formats.',
          meets: 'Uses an appropriate communication for the audience and format.',
          doesNotMeet: 'Provides limited evidence of adapting communication to the audience or format.'
        }
      }
    ]
  },
  {
    id: 'PLO5',
    programId: 'bcom',
    verb: 'Explain',
    text: 'Explain the role of technology in business decisions and organizational performance.',
    bloomLevel: 'Understand',
    order: 5,
    shortNotation: 'Technology in Business Decisions',
    dimensions: [
      {
        id: '5.1',
        name: 'Identify the Role of Technology in Business',
        rubric: {
          exceeds: 'Analyzes multiple ways relevant technologies influence business decisions, processes, or organizational performance and connects those influences to the business context.',
          meets: 'Explains relevant ways technology influences business decisions or organizational performance.',
          doesNotMeet: 'Provides limited or inaccurate explanation of technology\'s role in business.'
        }
      },
      {
        id: '5.2',
        name: 'Evaluate Technology-Related Business Implications',
        rubric: {
          exceeds: 'Evaluates technology-related benefits, limitations, risks, and/or opportunities using relevant criteria and explains their implications for the business context.',
          meets: 'Identifies and evaluates relevant benefits, limitations, risks, or opportunities.',
          doesNotMeet: 'Provides limited or unsupported evaluation of technology-related implications.'
        }
      },
      {
        id: '5.3',
        name: 'Apply Technology Insights to Business Decisions',
        rubric: {
          exceeds: 'Integrates technology-related evidence into business decisions or recommendations, explains relevant trade-offs, and supports the proposed course of action with evidence.',
          meets: 'Connects technology-related considerations to an appropriate business decision or recommendation.',
          doesNotMeet: 'Provides limited or unclear connection between technology and the business decision or recommendation.'
        }
      }
    ]
  },
  {
    id: 'PLO6',
    programId: 'bcom',
    verb: 'Collaborate',
    text: 'Collaborate in diverse teams with leadership adaptability and interpersonal competence.',
    bloomLevel: 'Apply',
    order: 6,
    shortNotation: 'Team Collaboration & Leadership',
    dimensions: [
      {
        id: '6.1',
        name: 'Contribute to Team Objectives',
        rubric: {
          exceeds: 'Takes initiative beyond assigned responsibilities when needed, contributes resources or support that advance team progress, and helps others fulfill team objectives.',
          meets: 'Fulfills assigned responsibilities and makes appropriate contributions to team objectives.',
          doesNotMeet: 'Makes limited contributions, does not consistently fulfill responsibilities, or negatively affects team progress.'
        }
      },
      {
        id: '6.2',
        name: 'Collaborate Across Diverse Perspectives',
        rubric: {
          exceeds: 'Seeks out and incorporates different perspectives into team discussions, decisions, and outcomes.',
          meets: 'Recognizes and appropriately considers different perspectives when presented by team members.',
          doesNotMeet: 'Provides limited evidence of considering or incorporating different perspectives.'
        }
      },
      {
        id: '6.3',
        name: 'Demonstrate Leadership Adaptability and Interpersonal Competence',
        rubric: {
          exceeds: 'Adapts leadership and interpersonal approaches effectively to changing team needs, roles, and circumstances while supporting productive team relationships.',
          meets: 'Adjusts appropriately to team roles and circumstances and communicates constructively with team members.',
          doesNotMeet: 'Demonstrates limited adaptability or interpersonal effectiveness, affecting team communication or performance.'
        }
      }
    ]
  }
];

export const INITIAL_BCOM_COURSES: Course[] = [];
export const INITIAL_BCOM_MAPPINGS: { [key: string]: string[] } = {};
export const INITIAL_BCOM_ASSIGNMENTS: { [courseId: string]: Assignment[] } = {};
export const INITIAL_BCOM_STUDENTS: Student[] = [];

export const DEFAULT_PROGRAM_SETTINGS: Record<string, Setting> = {
  mba: DEFAULT_SETTINGS,
  bcom: {
    id: 'bcom_general',
    programId: 'bcom',
    thresholdTerm: 2,
    thresholdProgram: 4,
    facultySandboxEnabled: false,
    activeRoundId: '',
    activeRoundName: '',
    feedbackLevels: {
      plo: true,
      dimension: true,
      rubric: true
    }
  }
};

export const INITIAL_FEEDBACK_ROUNDS: FeedbackRound[] = [
  {
    id: 'mba_round_july_2026',
    programId: 'mba',
    name: 'July 2026',
    status: 'archived',
    createdAt: '2026-07-22T00:00:00.000Z',
    archivedAt: '2026-07-23T00:00:00.000Z',
    plosSnapshot: INITIAL_PLOS
  }
];

export const INITIAL_COMMENTS: FacultyComment[] = [
  {
    id: 'mba_comment_1',
    programId: 'mba',
    ploId: 'PLO1',
    dimensionId: '1.1',
    targetType: 'dimension',
    metricType: 'exceeds',
    commentText: 'The Business Environment Analysis criteria nicely aligns with ACBSP accreditation guidelines for strategic problem solving.',
    authorName: 'Dr. Sarah Jenkins (Faculty Chair)',
    createdAt: '2026-07-22T10:30:00.000Z',
    upvotes: ['voter_seed_1', 'voter_seed_2'],
    roundId: 'mba_round_july_2026',
    roundName: 'July 2026'
  },
  {
    id: 'mba_comment_2',
    programId: 'mba',
    ploId: 'PLO2',
    targetType: 'description',
    commentText: 'PLO2 Statement clearly emphasizes ethical analysis and framework application across corporate governance.',
    authorName: 'Prof. Michael Chen (Strategy Lead)',
    createdAt: '2026-07-22T14:20:00.000Z',
    upvotes: ['voter_seed_1'],
    roundId: 'mba_round_july_2026',
    roundName: 'July 2026'
  }
];

