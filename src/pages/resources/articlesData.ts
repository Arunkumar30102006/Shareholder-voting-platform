export interface ResourceArticleData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  category: string;
  readTime: string;
  publishedDate: string;
  lastReviewedDate: string;
  statutorySource: string;
  statutoryVersion: string;
  reviewer: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
  }[];
  relatedLinks: {
    title: string;
    url: string;
  }[];
}

export const RESOURCE_ARTICLES: Record<string, ResourceArticleData> = {
  'what-is-shareholder-e-voting': {
    slug: 'what-is-shareholder-e-voting',
    title: 'What is Shareholder E-Voting? Statutory Guide | Vote India Secure',
    metaDescription: 'Comprehensive primer on electronic voting under Companies Act Section 108: legal mandate, physical vs remote comparison, and benefits.',
    h1: 'What is Shareholder E-Voting? Comprehensive Statutory Guide',
    category: 'Foundations & Law',
    readTime: '8 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies Act, 2013 (Section 108) & Companies (Management and Administration) Rules, 2014 (Rule 20)',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'Electronic voting (e-voting) is the statutory mechanism permitting shareholders of a corporate entity to cast weighted votes on general meeting resolutions via secure digital infrastructure, replacing physical ballot papers.',
    sections: [
      {
        heading: '1. The Legal Framework: Section 108 & Rule 20',
        content: 'Prior to the enactment of the Companies Act, 2013, voting at company general meetings was primarily conducted in person via show of hands or physical paper polling. Section 108 introduced a transformative mandate requiring prescribed classes of companies to provide members with electronic voting facilities.',
        bulletPoints: [
          'Mandatory Applicability: Every company listed on a recognized stock exchange, and every unlisted public company having 1,000 or more members, must provide an e-voting facility.',
          'Two Distinct Modes: E-voting encompasses (a) remote e-voting prior to the meeting, and (b) electronic voting during the general meeting (venue voting / InstaPoll).',
          'Legal Equivalence: Ballots cast electronically carry identical legal weight to physical polls under Section 109.'
        ]
      },
      {
        heading: '2. Physical vs. Remote Electronic Voting: Key Differences',
        content: 'Remote e-voting eliminates geographical barriers, allowing domestic retail investors, institutional funds, and Non-Resident Indian (NRI) shareholders to vote without physically traveling to the registered office.',
        bulletPoints: [
          'Participation Reach: Physical meetings rarely exceeded fractional local turnout; electronic voting regularly achieves high participation across demat holders.',
          'Tabulation Accuracy: Manual counting of paper slips is susceptible to human error; electronic platforms tabulate weighted equity holdings instantly.',
          'Secrecy Protections: Physical secret ballots require physical ballot boxes; Rule 20(4)(xii) mandates that digital registers remain sealed until formal scrutinizer unblocking.'
        ]
      },
      {
        heading: '3. Technical Prerequisites for Secured Systems',
        content: 'Rule 20 specifies that a secured electronic voting system must maintain high reliability, cryptographic integrity, and zero unauthorized access. Modern platforms utilize SHA-256 ballot hashing, tamper-evident audit logs, and independent two-witness scrutinizer access.'
      }
    ],
    relatedLinks: [
      { title: 'How AGM E-Voting Works', url: '/resources/how-agm-e-voting-works' },
      { title: 'Shareholder E-Voting Software', url: '/shareholder-e-voting' },
      { title: 'Regulatory Framework', url: '/regulatory-framework' }
    ]
  },
  'how-agm-e-voting-works': {
    slug: 'how-agm-e-voting-works',
    title: 'How AGM E-Voting Works Under Section 108 | Vote India Secure',
    metaDescription: 'Detailed operational timeline for Annual General Meetings: 21 clear days notice, remote voting window, venue balloting, and quorum.',
    h1: 'How AGM E-Voting Works Under Section 108',
    category: 'Operational Walkthrough',
    readTime: '9 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies Act, 2013 (Section 96 & 108) & Rule 20 of Companies Rules, 2014',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'An Annual General Meeting (AGM) requires coordination between corporate secretarial teams, depositories, independent scrutinizers, and registered shareholders under strict statutory timelines.',
    sections: [
      {
        heading: '1. Dispatch of Notice (T-21 Clear Days)',
        content: 'Under Section 101 of the Companies Act, an AGM notice must be sent at least 21 clear days prior to the meeting. For electronic voting, Rule 20(4)(iv) requires companies to publish public notices in at least one English newspaper and one vernacular newspaper circulated in the registered office district.',
        bulletPoints: [
          'Contents: Date, time, venue/virtual access, business agenda, cut-off date, and scrutinizer details.',
          'Login Credentials: Dispatch of Voting User IDs and PINs via registered email or SMS to eligible shareholders.'
        ]
      },
      {
        heading: '2. The Statutory Remote E-Voting Window',
        content: 'Under Rule 20(4)(vi), the remote e-voting window must remain open for not less than three (3) days and must close strictly at 5:00 p.m. on the date immediately preceding the general meeting. Once closed, no remote ballots can be submitted.',
      },
      {
        heading: '3. Meeting Day Balloting & Scrutinizer Unblocking',
        content: 'During the AGM, shareholders who did not participate remotely may vote electronically during the meeting. Following meeting closure, the appointed independent Scrutinizer counts venue ballots and unblocks remote votes in the presence of at least two independent witnesses.',
      }
    ],
    relatedLinks: [
      { title: 'AGM E-Voting Platform', url: '/agm-voting' },
      { title: 'Scrutinizer Workflow Guide', url: '/resources/scrutinizer-voting-workflow' },
      { title: 'Record Date Entitlement', url: '/resources/record-date-and-voting-entitlement' }
    ]
  },
  'how-egm-e-voting-works': {
    slug: 'how-egm-e-voting-works',
    title: 'How EGM E-Voting Works Under Section 100 | Vote India Secure',
    metaDescription: 'Statutory procedure for Extraordinary General Meetings: Board requisitions, member requisitions under Section 100, and short notice provisions.',
    h1: 'How EGM E-Voting Works Under Section 100',
    category: 'Special Governance',
    readTime: '8 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies Act, 2013 (Section 100, 101, 108 & 114) & Rule 20',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'Extraordinary General Meetings (EGMs) are convened to transact urgent special business that cannot wait until the next AGM, such as capital restructuring, MOA amendments, or director removals.',
    sections: [
      {
        heading: '1. Requisition Paths Under Section 100',
        content: 'An EGM may be convened by the Board of Directors on its own motion or upon the formal requisition of members holding not less than 10% of the paid-up share capital carrying voting rights.',
        bulletPoints: [
          'Board-Convened EGM: Routine or urgent special business initiated by corporate management.',
          'Member-Requisitioned EGM: If the Board fails within 21 days to call the meeting within 45 days of valid requisition, the requisitionists may call and hold the meeting themselves within 3 months.'
        ]
      },
      {
        heading: '2. Shorter Notice Provisions Under Section 101',
        content: 'While general meetings normally mandate 21 clear days notice, Section 101(1) proviso allows an EGM to be called on shorter notice if consent is given by members representing not less than 95% of the paid-up share capital carrying voting rights.',
      },
      {
        heading: '3. Special Resolutions & Supermajorities',
        content: 'Most business transacted at an EGM constitutes Special Business requiring Special Resolutions under Section 114(2), meaning affirmative votes must equal at least three times negative votes ($Assent \\ge 3 \\times Dissent$).',
      }
    ],
    relatedLinks: [
      { title: 'EGM E-Voting Platform', url: '/egm-voting' },
      { title: 'Ordinary vs Special Resolutions', url: '/resources/ordinary-vs-special-resolution' },
      { title: 'Corporate Proxy Voting', url: '/proxy-voting' }
    ]
  },
  'how-proxy-voting-works': {
    slug: 'how-proxy-voting-works',
    title: 'How Corporate Proxy Voting Works Under Section 105 | Vote India Secure',
    metaDescription: 'Legal rights and technical mechanisms of proxy voting under Companies Act Section 105: Form MGT-11 appointment and entitlement limits.',
    h1: 'How Corporate Proxy Voting Works Under Section 105',
    category: 'Proxy & Representation',
    readTime: '7 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies Act, 2013 (Section 105) & Rule 19 of Companies (Management and Administration) Rules, 2014',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'A proxy is an authorized representative appointed by a shareholder to attend and vote on their behalf at a general meeting when the shareholder cannot attend in person.',
    sections: [
      {
        heading: '1. The Right to Appoint a Proxy (Section 105)',
        content: 'Any member of a company entitled to attend and vote at a meeting is statutorily entitled to appoint another person as a proxy. The proxy need not be a member of the company, except in specific non-profit or guarantee companies.',
      },
      {
        heading: '2. The 48-Hour Deposit Rule & Form MGT-11',
        content: 'Under Section 105(4), the proxy instrument (Form MGT-11) must be deposited with the company at least 48 hours prior to the meeting. Any corporate article provision attempting to impose a longer deadline is invalid.',
      },
      {
        heading: '3. Statutory Capacity Caps under Rule 19',
        content: 'A single individual may act as proxy on behalf of members not exceeding 50 and holding in the aggregate not more than 10% of the total share capital carrying voting rights. A member holding more than 10% may appoint a single proxy, but that proxy cannot represent any other shareholder.',
      }
    ],
    relatedLinks: [
      { title: 'Corporate Proxy Voting Software', url: '/proxy-voting' },
      { title: 'Shareholder E-Voting', url: '/shareholder-e-voting' }
    ]
  },
  'record-date-and-voting-entitlement': {
    slug: 'record-date-and-voting-entitlement',
    title: 'Record Date & Voting Entitlement Mechanics | Vote India Secure',
    metaDescription: 'Analysis of cut-off date determination under Rule 20(4)(vii), depository registry coordination, and weighted shareholding calculations.',
    h1: 'Record Date & Voting Entitlement Mechanics',
    category: 'Registry & Operations',
    readTime: '7 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies (Management and Administration) Rules, 2014 (Rule 20(4)(vii))',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'The statutory cut-off date (record date) freezes shareholder entitlement, determining exactly who holds voting rights and the numerical weight of their ballots.',
    sections: [
      {
        heading: '1. The 7-Day Cut-Off Rule',
        content: 'Rule 20(4)(vii) specifies that the company shall fix a cut-off date for determining the eligibility of members to vote by remote e-voting or at the meeting. This date cannot be earlier than seven (7) days before the general meeting.',
      },
      {
        heading: '2. Depository Registry Ingestion (Benpos)',
        content: 'As of the close of business on the cut-off date, the Registrar and Transfer Agent (RTA) exports the Beneficiary Position (Benpos) files from NSDL and CDSL, alongside physical folio registers. This dataset forms the immutable voter master.',
      },
      {
        heading: '3. One Share, One Vote Principle',
        content: 'Under Section 47 of the Companies Act, voting entitlement on equity shares is strictly proportionate to the paid-up share capital held on the cut-off date, unless differential voting rights shares are legally issued.',
      }
    ],
    relatedLinks: [
      { title: 'What is Shareholder E-Voting?', url: '/resources/what-is-shareholder-e-voting' },
      { title: 'Regulatory Framework', url: '/regulatory-framework' }
    ]
  },
  'ordinary-vs-special-resolution': {
    slug: 'ordinary-vs-special-resolution',
    title: 'Ordinary vs Special Resolutions Under Section 114 | Vote India Secure',
    metaDescription: 'Statutory formulas and procedural differences between Ordinary and Special Resolutions under Section 114 of the Companies Act 2013.',
    h1: 'Ordinary vs Special Resolutions Under Section 114',
    category: 'Statutory Formulas',
    readTime: '8 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies Act, 2013 (Section 114) & Companies Rules, 2014',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'Section 114 of the Companies Act defines the exact mathematical thresholds required to pass Ordinary and Special Resolutions at corporate meetings.',
    sections: [
      {
        heading: '1. Ordinary Resolutions (Section 114(1))',
        content: 'An Ordinary Resolution requires a simple majority. The statutory formula is: Assent Votes > Dissent Votes. Uncast votes and abstentions are excluded from the denominator.',
        bulletPoints: [
          'Ordinary Business: Adoption of financial statements, dividend declarations, auditor appointments, director appointments in place of retiring directors.',
          'Formula: $\\text{Assent} > \\text{Dissent}$'
        ]
      },
      {
        heading: '2. Special Resolutions (Section 114(2))',
        content: 'A Special Resolution requires a 3x supermajority. The statutory formula is: Assent Votes >= 3 * Dissent Votes (i.e. at least 75% of valid votes cast). The notice must explicitly state the intention to propose the resolution as a special resolution.',
        bulletPoints: [
          'Key Triggers: Alteration of MOA/AOA, reduction of share capital, buyback authorizations, loans/investments exceeding Section 186 limits.',
          'Formula: $\\text{Assent} \\ge 3 \\times \\text{Dissent}$'
        ]
      },
      {
        heading: '3. Treatment of Invalid Ballots and Abstentions',
        content: 'Under Rule 20 and Form MGT-13 standards, invalid votes (e.g. duplicate attempts, expired sessions) and abstentions are reported separately and do not factor into the pass/fail determination of valid votes.',
      }
    ],
    relatedLinks: [
      { title: 'EGM E-Voting Platform', url: '/egm-voting' },
      { title: 'Scrutinizer Tools', url: '/scrutinizer-tools' }
    ]
  },
  'scrutinizer-voting-workflow': {
    slug: 'scrutinizer-voting-workflow',
    title: 'Independent Scrutinizer Voting Workflow | Vote India Secure',
    metaDescription: 'Role of the scrutinizer under Rule 20(4)(ix): unblocking votes before two witnesses, register maintenance, and Form MGT-13 aligned reporting.',
    h1: 'Independent Scrutinizer Voting Workflow',
    category: 'Audit & Compliance',
    readTime: '9 min read',
    publishedDate: '2026-08-25',
    lastReviewedDate: '2026-09-20',
    statutorySource: 'Companies Act, 2013 (Section 108 & 109) & Rule 20(4)(ix)-(xv)',
    statutoryVersion: 'As amended up to 2026',
    reviewer: 'Corporate Governance & Statutory Architecture Review',
    summary: 'The independent scrutinizer is the statutory guarantor of fair balloting, responsible for supervising voting, conducting the dual-witness unblocking, and presenting the consolidated report.',
    sections: [
      {
        heading: '1. Appointment and Independence (Rule 20(4)(ix))',
        content: 'The scrutinizer must be an independent professional (PCS, FCA, FCMA, or Advocate) appointed by the Board of Directors. They must maintain total neutrality and cannot be in the employment of the company.',
      },
      {
        heading: '2. The Unblocking Ceremony (Rule 20(4)(xii))',
        content: 'The electronic voting register is sealed by cryptographic controls. After the general meeting concludes, the scrutinizer unblocks the remote votes in the presence of at least two independent witnesses who sign an affirmation confirming they are not employees of the company.',
      },
      {
        heading: '3. Consolidated Report & Form MGT-13 Formatting',
        content: 'Within three days of meeting conclusion, the scrutinizer issues a consolidated report tabulating affirmative, negative, and invalid votes for both remote and meeting-day ballots, submitted directly to the Chairman.',
      }
    ],
    relatedLinks: [
      { title: 'Scrutinizer Tools Portal', url: '/scrutinizer-tools' },
      { title: 'Ordinary vs Special Resolutions', url: '/resources/ordinary-vs-special-resolution' },
      { title: 'Regulatory Framework', url: '/regulatory-framework' }
    ]
  }
};
