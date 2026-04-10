import React, { useState, useEffect } from 'react';
import { api, getAccessToken } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Search, Users, Download, FileSpreadsheet, FileText, Mail, MailPlus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = 'https://4dqf2ei3vk.execute-api.ap-southeast-2.amazonaws.com';

export default function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchTeams = async () => {
    try {
      const data = await api(`/api/teams?search=${search}&status=${statusFilter}`);
      setTeams(data.teams);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, [search, statusFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'evaluated': return 'bg-green-100 text-green-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'submitted': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleExport = (format) => {
    const token = getAccessToken();
    const url = `${BACKEND_URL}/api/export/teams/${format}`;
    const link = document.createElement('a');

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = URL.createObjectURL(blob);
        link.href = downloadUrl;
        link.download = `CodHER_Teams_Export.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      })
      .catch(err => console.error('Export failed:', err));
  };

  const handleSendCredentials = async (teamId) => {
    try {
      await api('/api/teams/send-credentials', {
        method: 'POST',
        body: JSON.stringify({ team_id: teamId })
      });
      toast.success('Credentials email sent successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to send email');
    }
  };

  const handleSendAllCredentials = async () => {
    if (!window.confirm('Send credentials email to all teams? This may take a while.')) return;

    try {
      const result = await api('/api/teams/send-all-credentials', { method: 'POST' });
      toast.success(`Sent to ${result.sent} teams. ${result.failed} failed.`);
      if (result.errors && result.errors.length > 0) {
        console.error('Errors:', result.errors);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send emails');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Teams Management</h1>
          <p className="text-muted-foreground mt-1">{total} teams registered</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSendAllCredentials} variant="outline" className="gap-2">
            <MailPlus className="w-4 h-4" /> Send All Credentials
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="admin-teams-export-button">
                <Download className="w-4 h-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-red-600" /> Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="admin-teams-search-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="admin-teams-filter-select">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 skeleton-shimmer rounded-lg" />)}</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No teams found. Import data to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table data-testid="admin-teams-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>R1</TableHead>
                    <TableHead>R2</TableHead>
                    <TableHead>R3</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.team_id} className="table-row-hover">
                      <TableCell className="font-mono text-xs">{team.team_id}</TableCell>
                      <TableCell className="font-medium">{team.team_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{team.team_lead_name}</p>
                          <p className="text-xs text-muted-foreground">{team.team_lead_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{team.college_name || '-'}</TableCell>
                      <TableCell className="text-xs">{team.assigned_mentor_email || <span className="text-amber-500">Unassigned</span>}</TableCell>
                      <TableCell><Badge className={`text-xs ${getStatusColor(team.round_1_eval_status)}`}>{team.round_1_eval_status}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${getStatusColor(team.round_2_eval_status)}`}>{team.round_2_eval_status}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${getStatusColor(team.round_3_eval_status)}`}>{team.round_3_eval_status}</Badge></TableCell>
                      <TableCell><Badge variant={team.status === 'Active' ? 'default' : 'secondary'}>{team.status}</Badge></TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendCredentials(team.team_id)}
                          className="gap-1"
                        >
                          <Mail className="w-3 h-3" /> Send
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
