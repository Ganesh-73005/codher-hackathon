import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Mail, Loader2, Search, Users, UserCheck } from 'lucide-react';

export default function EmailComposer() {
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [recipientType, setRecipientType] = useState('teams');

  useEffect(() => {
    api('/api/teams').then(d => setTeams(d.teams)).catch(console.error);
    api('/api/mentors').then(d => setMentors(d.mentors)).catch(console.error);
    api('/api/email/logs').then(d => setLogs(d.logs)).catch(console.error);
  }, []);

  const recipients = recipientType === 'teams'
    ? teams.filter(t => t.team_lead_email?.toLowerCase().includes(search.toLowerCase()) || t.team_name?.toLowerCase().includes(search.toLowerCase()))
    : mentors.filter(m => m.mentor_email?.toLowerCase().includes(search.toLowerCase()) || m.mentor_name?.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (email) => {
    setSelected(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const selectAll = () => {
    const emails = recipients.map(r => recipientType === 'teams' ? r.team_lead_email : r.mentor_email);
    setSelected(emails);
  };

  const handleSend = async () => {
    if (!selected.length || !subject || !body) {
      toast.error('Please fill all fields and select recipients');
      return;
    }
    setSending(true);
    try {
      const data = await api('/api/email/send', {
        method: 'POST',
        body: JSON.stringify({ recipients: selected, subject, body_html: body }),
      });
      toast.success(`Sent: ${data.sent}, Failed: ${data.failed}`);
      setSelected([]);
      setSubject('');
      setBody('');
      api('/api/email/logs').then(d => setLogs(d.logs));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Email Composer</h1>
        <p className="text-muted-foreground mt-1">Send custom emails to teams and mentors</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recipients */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Recipients</CardTitle>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant={recipientType === 'teams' ? 'default' : 'outline'} onClick={() => { setRecipientType('teams'); setSelected([]); }}>
                <Users className="w-3 h-3 mr-1" /> Teams
              </Button>
              <Button size="sm" variant={recipientType === 'mentors' ? 'default' : 'outline'} onClick={() => { setRecipientType('mentors'); setSelected([]); }}>
                <UserCheck className="w-3 h-3 mr-1" /> Mentors
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="email-recipients-filter" />
              </div>
              <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {recipients.map((r, i) => {
                  const email = recipientType === 'teams' ? r.team_lead_email : r.mentor_email;
                  const name = recipientType === 'teams' ? r.team_name : r.mentor_name;
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer" onClick={() => toggleSelect(email)}>
                      <Checkbox checked={selected.includes(email)} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">{selected.length} selected</p>
          </CardContent>
        </Card>

        {/* Compose */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Compose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." className="mt-1.5" />
            </div>
            <div>
              <Label>Message (HTML supported)</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="<p>Dear Team,</p><p>...</p>" className="mt-1.5 min-h-[200px]" data-testid="email-body-textarea" />
              <p className="text-xs text-muted-foreground mt-1">{body.length} characters</p>
            </div>
            <Button onClick={handleSend} disabled={sending} className="w-full btn-press" data-testid="email-send-button">
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Email</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Logs */}
      {logs.length > 0 && (
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Email Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 20).map((log, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{log.to_email}</TableCell>
                      <TableCell className="text-xs truncate max-w-[200px]">{log.subject}</TableCell>
                      <TableCell><Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>{log.status}</Badge></TableCell>
                      <TableCell className="text-xs">{log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
