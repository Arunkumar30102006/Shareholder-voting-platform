export type VoteType = "FOR" | "AGAINST" | "ABSTAIN";

export type EventType = "AGM" | "EGM" | "GENERAL_MEETING" | "POSTAL_BALLOT";
export type EgmRequisitionType = "BOARD_CONVENED" | "MEMBER_REQUISITION_SEC_100" | "NCLT_DIRECTED";
export type EventStatus = "draft" | "published" | "open" | "closed" | "results_finalized" | "archived";

export interface VotingItem {
    id: string;
    title: string;
    description: string;
    category: string;
    voted: boolean;
    vote: VoteType | null;
    voteHash?: string;
    merkleProof?: Array<{ position: 'left' | 'right', data: string }> | null;
    anchorRoot?: string;
}

export interface Shareholder {
    id: string;
    shareholder_name: string;
    shares_held: number;
    company_id: string;
    companies?: {
        company_name: string;
    };
}

export interface VotingSession {
    id: string;
    company_id: string;
    event_type: EventType;
    title: string;
    description?: string | null;
    status: EventStatus;
    // Canonical timing columns
    voting_start: string;
    voting_end: string;
    meeting_date?: string | null;
    meeting_end_date?: string | null;
    notice_date?: string | null;
    record_date: string;
    // Transitional compatibility aliases (during migration window)
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    // Meeting connection info
    meeting_link?: string | null;
    meeting_password?: string | null;
    meeting_platform?: string | null;
    voting_instructions?: string | null;
    is_meeting_emails_sent?: boolean;
    // Structured EGM fields
    egm_requisition_type?: EgmRequisitionType | null;
    is_short_notice?: boolean;
    explanatory_statement_reference?: string | null;
    egm_reason?: string | null;
    auto_start_done?: boolean;
    auto_end_done?: boolean;
}

// Minimal projection for event switcher
export interface EligibleEventSummary {
    id: string;
    session_id: string;
    event_type: EventType;
    title: string;
    status: EventStatus;
    notice_date: string | null;
    meeting_date: string | null;
    meeting_end_date: string | null;
    record_date: string | null;
    voting_start: string;
    voting_end: string;
    company_name: string;
    // Compatibility fields
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
}

// Verified detail projection for active event
export interface EligibleEventDetail extends EligibleEventSummary {
    description: string | null;
    meeting_link: string | null;
    meeting_platform: string | null;
    meeting_password?: string | null;
    voting_instructions: string | null;
    shares_count: number;
    dvr_multiplier: number;
    is_short_notice: boolean;
    egm_requisition_type: EgmRequisitionType | null;
    explanatory_statement_reference: string | null;
    egm_reason?: string | null;
    resolutions?: Resolution[];
}

export interface Resolution {
    id: string;
    title: string;
    description?: string;
    resolution_type: string;
    voting_session_id: string;
}

export interface VoteRecord {
    id: string;
    resolution_id: string;
    vote_value: VoteType;
    vote_hash: string;
    leaf_index?: number | null;
    weighted_votes?: number;
    created_at: string;
}

export interface ResolutionStats {
    resolution_id: string;
    for_count: number;
    against_count: number;
    abstain_count: number;
    total_weighted_votes: number;
    total_vote_count: number;
    last_updated: string;
}
