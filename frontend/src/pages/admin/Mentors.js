import React, { useState, useEffect } from 'react';
import { api, getAccessToken } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Search, UserCheck, Download, FileSpreadsheet, FileText, Mail, MailPlus, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';

const BACKEND_URL = 'https://4dqf2ei3vk.execute-api.ap-southeast-2.amazonaws.com';

export default function MentorsManagement() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [capacityDialog, setCapacityDialog] = useState({ open: false, mentor: null, newCapacity: 0 });
  const [addMentorDialog, setAddMentorDialog] = useState(false);
  const [newMentor, setNewMentor] = useState({
    mentor_name: '',
    mentor_email: '',
    mentor_mobile: '',
    expertise: '',
    organization: '',
    max_team_capacity: 3,
    send_email: true
  });

  useEffect(() => {
    fetchMentors();
  }, [search]);

  const handleExport = (format) => {
    const token = getAccessToken();
    const url = `${BACKEND_URL}/api/export/mentors/${format}`;

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `CodHER_Mentors_Export.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      })
      .catch(err => console.error('Export failed:', err));
  };

  const handleSendCredentials = async (mentorId) => {
    try {
      await api('/api/mentors/send-credentials', {
        method: 'POST',
        body: JSON.stringify({ mentor_id: mentorId })
      });
      toast.success('Credentials email sent successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to send email');
    }
  };

  const handleSendAllCredentials = async () => {
    if (!window.confirm('Send credentials email to all mentors? This may take a while.')) return;

    try {
      const result = await api('/api/mentors/send-all-credentials', { method: 'POST' });
      toast.success(`Sent to ${result.sent} mentors. ${result.failed} failed.`);
      if (result.errors && result.errors.length > 0) {
        console.error('Errors:', result.errors);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send emails');
    }
  };

  const openCapacityDialog = (mentor) => {
    setCapacityDialog({
      open: true,
      mentor: mentor,
      newCapacity: mentor.max_team_capacity || 3
    });
  };

  const handleUpdateCapacity = async () => {
    try {
      await api(`/api/mentors/${capacityDialog.mentor.mentor_id}/capacity`, {
        method: 'PATCH',
        body: JSON.stringify({ capacity: parseInt(capacityDialog.newCapacity) })
      });
      toast.success('Capacity updated successfully');
      setCapacityDialog({ open: false, mentor: null, newCapacity: 0 });
      fetchMentors();
    } catch (err) {
      toast.error(err.message || 'Failed to update capacity');
    }
  };

  const fetchMentors = () => {
    api(`/api/mentors?search=${search}`).then(d => setMentors(d.mentors)).catch(console.error).finally(() => setLoading(false));
  };

  const handleCreateMentor = async () => {
    if (!newMentor.mentor_name || !newMentor.mentor_email || !newMentor.mentor_mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await api('/api/mentors', {
        method: 'POST',
        body: JSON.stringify(newMentor)
      });
      toast.success(result.message);
      if (!newMentor.send_email && result.password) {
        toast.info(`Password: ${result.password}`, { duration: 10000 });
      }
      setAddMentorDialog(false);
      setNewMentor({
        mentor_name: '',
        mentor_email: '',
        mentor_mobile: '',
        expertise: '',
        organization: '',
        max_team_capacity: 3,
        send_email: true
      });
      fetchMentors();
    } catch (err) {
      toast.error(err.message || 'Failed to create mentor');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Mentors Management</h1>
          <p className="text-muted-foreground mt-1">{mentors.length} mentors registered</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddMentorDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Mentor
          </Button>
          <Button onClick={handleSendAllCredentials} variant="outline" className="gap-2">
            <MailPlus className="w-4 h-4" /> Send All Credentials
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="admin-mentors-export-button">
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
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search mentors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 skeleton-shimmer rounded-lg" />)}</div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No mentors found. Import data to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table data-testid="admin-mentors-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Eval Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentors.map((m) => {
                    const capacity = parseInt(m.max_team_capacity) || 3;
                    const assigned = m.assigned_teams_count || 0;
                    const pct = Math.min((assigned / capacity) * 100, 100);
                    return (
                      <TableRow key={m.mentor_id} className="table-row-hover">
                        <TableCell className="font-mono text-xs">{m.mentor_id}</TableCell>
                        <TableCell className="font-medium">{m.mentor_name}</TableCell>
                        <TableCell className="text-xs">{m.mentor_email}</TableCell>
                        <TableCell><Badge variant="secondary">{m.expertise || '-'}</Badge></TableCell>
                        <TableCell className="text-xs">{m.organization || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="w-16 h-2" data-testid="admin-mentor-capacity-progress" />
                            <span className="text-xs tabular-nums">{assigned}/{capacity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openCapacityDialog(m)}
                              className="h-6 px-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{m.eval_completion}</TableCell>
                        <TableCell><Badge variant={m.status === 'Active' ? 'default' : 'secondary'}>{m.status}</Badge></TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendCredentials(m.mentor_id)}
                            className="gap-1"
                          >
                            <Mail className="w-3 h-3" /> Send
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacity Update Dialog */}
      <Dialog open={capacityDialog.open} onOpenChange={(open) => setCapacityDialog({ ...capacityDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Mentor Capacity</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Update maximum team capacity for <strong>{capacityDialog.mentor?.mentor_name}</strong>
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Max Capacity:</label>
              <input
                type="number"
                min="0"
                max="50"
                value={capacityDialog.newCapacity}
                onChange={(e) => setCapacityDialog({ ...capacityDialog, newCapacity: e.target.value })}
                className="border rounded px-3 py-2 w-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCapacityDialog({ open: false, mentor: null, newCapacity: 0 })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCapacity}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Mentor Dialog */}
      <Dialog open={addMentorDialog} onOpenChange={setAddMentorDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Mentor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="mentor_name">Mentor Name *</Label>
              <Input
                id="mentor_name"
                value={newMentor.mentor_name}
                onChange={(e) => setNewMentor({ ...newMentor, mentor_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="mentor_email">Email Address *</Label>
              <Input
                id="mentor_email"
                type="email"
                value={newMentor.mentor_email}
                onChange={(e) => setNewMentor({ ...newMentor, mentor_email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="mentor_mobile">Mobile Number *</Label>
              <Input
                id="mentor_mobile"
                value={newMentor.mentor_mobile}
                onChange={(e) => setNewMentor({ ...newMentor, mentor_mobile: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <Label htmlFor="expertise">Expertise</Label>
              <Input
                id="expertise"
                value={newMentor.expertise}
                onChange={(e) => setNewMentor({ ...newMentor, expertise: e.target.value })}
                placeholder="AI/ML, Web Dev, etc."
              />
            </div>

            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={newMentor.organization}
                onChange={(e) => setNewMentor({ ...newMentor, organization: e.target.value })}
                placeholder="Company/University"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Max Team Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                max="50"
                value={newMentor.max_team_capacity}
                onChange={(e) => setNewMentor({ ...newMentor, max_team_capacity: parseInt(e.target.value) || 3 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="send_email"
                checked={newMentor.send_email}
                onCheckedChange={(checked) => setNewMentor({ ...newMentor, send_email: checked })}
              />
              <Label htmlFor="send_email" className="cursor-pointer">
                Send credentials email to mentor
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMentorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMentor}>Create Mentor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
