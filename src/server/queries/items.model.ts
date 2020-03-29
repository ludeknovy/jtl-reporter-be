export enum ItemDataType {
  Kpi = 'kpi',
  Error = 'error',
  MonitoringLogs = 'monitoring_logs'
}

export enum ItemStatus {
  None = '10',
  Passed = '0',
  Error = '1',
  Terminated = '2',
  Failed = '3'
}

export enum ReportStatus {
  Ready = 'ready',
  Error = 'error',
  InProgress = 'in_progress'
}
