export interface AuditLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  data: string; // base64
}

export interface AuditFindingItem {
  item_name: string;
  claimed_qty: number;
  actual_qty: number;
  status: 'MATCH' | 'DISCREPANCY';
}

export interface AuditResult {
  audit_pass: boolean;
  discrepancy_details: string;
  risk_score: 'High' | 'Med' | 'Low';
  financial_impact: string;
  auditor_notes: string;
  findings_data: AuditFindingItem[];
}