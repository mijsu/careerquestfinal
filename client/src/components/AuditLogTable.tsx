import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Search, Filter, Calendar, User, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import React from "react";
import type { AuditLog } from "@shared/schema";

interface AuditLogTableProps {
  logs: AuditLog[];
}

const statusColors = {
  success: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  error: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const statusIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchQuery === '' ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userId && log.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const statusCounts = useMemo(() => {
    return {
      all: logs.length,
      success: logs.filter(l => l.status === 'success').length,
      warning: logs.filter(l => l.status === 'warning').length,
      error: logs.filter(l => l.status === 'error').length,
    };
  }, [logs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 p-4 border-b">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs by action, user, or details..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            data-testid="input-search-logs"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
            <SelectItem value="success">Success ({statusCounts.success})</SelectItem>
            <SelectItem value="warning">Warning ({statusCounts.warning})</SelectItem>
            <SelectItem value="error">Error ({statusCounts.error})</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredLogs.length} logs</span>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No audit logs found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left">
                  <th className="p-4 font-semibold text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Timestamp
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-sm">Action</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm w-12"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const StatusIcon = statusIcons[log.status as keyof typeof statusIcons] || AlertCircle;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        key={log.id}
                        className="border-b hover-elevate cursor-pointer transition-colors"
                        onClick={() => toggleRow(log.id)}
                        data-testid={`row-log-${log.id}`}
                      >
                        <td className="p-4">
                          <div className="text-sm font-medium">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-sm">{log.userId || 'System'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">{log.action}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={statusColors[log.status as keyof typeof statusColors]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className={`transition-transform ${expandedRow === log.id ? "rotate-180" : ""}`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      {expandedRow === log.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={5} className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <AlertCircle className="w-4 h-4" />
                                Event Details
                              </div>
                              <div className="bg-background p-4 rounded-lg border font-mono text-sm">
                                {log.details}
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Log ID:</span>
                                  <div className="font-mono text-xs mt-1">{log.id}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">User ID:</span>
                                  <div className="font-mono text-xs mt-1">{log.userId || 'N/A'}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Timestamp:</span>
                                  <div className="font-mono text-xs mt-1">
                                    {new Date(log.createdAt).toISOString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
