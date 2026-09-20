export interface Nominee {
  id: string;
  nominee_name: string;
  nominee_email: string;
  designation: string | null;
  qualification: string | null;
  experience_years: number | null;
  bio: string | null;
  is_email_sent: boolean;
  created_at: string;
}

export type EventType = 'AGM' | 'EGM' | 'GENERAL_MEETING' | 'POSTAL_BALLOT';
export type EgmRequisitionType = 'BOARD_CONVENED' | 'MEMBER_REQUISITION_SEC_100' | 'NCLT_DIRECTED';
export type EventStatus = 'draft' | 'published' | 'open' | 'closed' | 'results_finalized' | 'archived';

export interface VotingSession {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  status: EventStatus;
  voting_start: string;
  voting_end: string;
  meeting_date: string | null;
  meeting_end_date: string | null;
  notice_date?: string | null;
  record_date: string | null;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  meeting_link: string | null;
  meeting_password: string | null;
  meeting_platform: string | null;
  voting_instructions: string | null;
  is_meeting_emails_sent: boolean;
  egm_requisition_type?: EgmRequisitionType | null;
  is_short_notice?: boolean;
  explanatory_statement_reference?: string | null;
  egm_reason?: string | null;
  auto_start_done?: boolean;
  auto_end_done?: boolean;
}

export interface Resolution {
  id: string;
  voting_session_id: string;
  title: string;
  description?: string | null;
  resolution_type: string;
  created_at?: string;
}

export interface ResolutionResult {
  id: string;
  title: string;
  description: string | null;
  resolution_type?: string;
  stats: {
    for: number;
    against: number;
    abstain: number;
    total: number;
    winner: boolean;
  };
}

export interface AnchorData {
  created_at: string;
  transaction_id: string;
  merkle_root?: string;
  vote_count?: number;
  blockchain_network?: string;
  [key: string]: unknown;
}

export interface Company {
  id: string;
  company_name: string;
  cin_number?: string;
  pan_number?: string;
  gstin?: string | null;
  company_type?: string;
  date_of_incorporation?: string;
  exchanges?: string[];
  isin_number?: string | null;
  authorized_capital?: number;
  paid_up_capital?: number;
  registered_address?: string;
  country?: string;
  state?: string;
  district?: string | null;
  pin_code?: string;
  contact_email?: string;
  contact_phone?: string;
  cs_name?: string;
  cs_membership_number?: string;
  cs_email?: string;
  cs_phone?: string;
  sebi_email?: string;
  sebi_reg_number?: string | null;
  rta_name?: string;
  rta_reg_number?: string | null;
}

export interface Shareholder {
  id: string;
  shareholder_name: string;
  email: string;
  phone?: string | null;
  shares_held: number;
  login_id?: string;
  is_credential_used?: boolean;
  credential_created_at?: string;
  created_at?: string;
  category?: string;
  holding_type?: string;
  pan_number?: string;
  dpid_client_id?: string;
}

export interface DashboardMetrics {
  shareholder_name: string;
  login_id: string;
  total_shares: number;
  shareholding_percentage: number;
  total_votes_cast: number;
  total_resolutions: number;
  participation_rate: number;
  voting_distribution: { name: string; value: number }[];
  participation_trend: { session: string; votes: number }[];
  shareholding_comparison: { category: string; amount: number }[];
}
