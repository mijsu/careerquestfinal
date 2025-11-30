import AuditLogTable from '../AuditLogTable';

//todo: remove mock functionality
const mockLogs = [
  {
    id: "1",
    timestamp: "2025-01-15 14:32:01",
    user: "admin@careerquest.com",
    action: "Syllabus Upload",
    details: "Uploaded CS301_DataStructures.pdf - Generated 45 questions for Full Stack Development path",
    status: "success" as const
  },
  {
    id: "2",
    timestamp: "2025-01-15 13:15:22",
    user: "emily.davis@student.edu",
    action: "Quiz Completion",
    details: "Completed 'Algorithms Mastery Quiz' - Score: 85% - XP Earned: 250",
    status: "success" as const
  },
  {
    id: "3",
    timestamp: "2025-01-15 12:08:45",
    user: "john.smith@student.edu",
    action: "Assessment Terminated",
    details: "Tab switch detected during 'Final Assessment CS401' - Auto-submitted",
    status: "warning" as const
  },
  {
    id: "4",
    timestamp: "2025-01-15 11:45:11",
    user: "admin@careerquest.com",
    action: "User Account Created",
    details: "Created new student account for sarah.connor@student.edu - Assigned to AI-guided path",
    status: "success" as const
  },
  {
    id: "5",
    timestamp: "2025-01-15 10:22:33",
    user: "system",
    action: "Career Path Assignment Failed",
    details: "Unable to assign career path to user_12345 - Insufficient data collected",
    status: "error" as const
  }
];

export default function AuditLogTableExample() {
  return <AuditLogTable logs={mockLogs} />;
}
