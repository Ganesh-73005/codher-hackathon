import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Settings, Save, Trash2, RefreshCw, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const [deadlines, setDeadlines] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editDeadline, setEditDeadline] = useState({ round_name: 'Round 1', submission_deadline: '', evaluation_deadline: '', grace_period_minutes: 0 });

  useEffect(() => {
    Promise.all([
      api('/api/deadlines').then(d => setDeadlines(d.deadlines)),
      api('/api/sync/logs').then(d => setSyncLogs(d.logs)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSaveDeadline = async () => {
    try {
      await api('/api/deadlines', {
        method: 'POST',
        body: JSON.stringify(editDeadline),
      });
      toast.success('Deadline saved');
      const d = await api('/api/deadlines');
      setDeadlines(d.deadlines);
    } catch (err) { toast.error(err.message); }
  };

  const handleSync = async () => {
    if (!sheetsUrl) return;
    setSyncing(true);
    try {
      const data = await api('/api/sync/trigger', {
        method: 'POST',
        body: JSON.stringify({ url: sheetsUrl }),
      });
      toast.success(`Sync complete: ${data.updated.teams_updated} teams updated`);
      const logs = await api('/api/sync/logs');
      setSyncLogs(logs.logs);
    } catch (err) { toast.error(err.message); }
    setSyncing(false);
  };

  const handleTruncate = async () => {
    try {
      await api('/api/admin/truncate', {
        method: 'POST',
        body: JSON.stringify({ confirm: 'DELETE_ALL_DATA' }),
      });
      toast.success('All data truncated');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Settings</h1>
        <p className="text-muted-foreground mt-1">Configure deadlines, sync, and system settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Deadlines */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Round</Label>
                <select className="w-full mt-1 p-2 border rounded-lg text-sm" value={editDeadline.round_name} onChange={(e) => setEditDeadline({...editDeadline, round_name: e.target.value})}>
                  <option>Round 1</option>
                  <option>Round 2</option>
                  <option>Round 3</option>
                </select>
              </div>
              <div>
                <Label>Grace Period (min)</Label>
                <Input type="number" className="mt-1" value={editDeadline.grace_period_minutes} onChange={(e) => setEditDeadline({...editDeadline, grace_period_minutes: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <Label>Submission Deadline</Label>
              <Input type="datetime-local" className="mt-1" value={editDeadline.submission_deadline} onChange={(e) => setEditDeadline({...editDeadline, submission_deadline: e.target.value})} />
            </div>
            <div>
              <Label>Evaluation Deadline</Label>
              <Input type="datetime-local" className="mt-1" value={editDeadline.evaluation_deadline} onChange={(e) => setEditDeadline({...editDeadline, evaluation_deadline: e.target.value})} />
            </div>
            <Button onClick={handleSaveDeadline} className="btn-press"><Save className="w-4 h-4 mr-2" /> Save Deadline</Button>

            {deadlines.length > 0 && (
              <div className="rounded-lg border overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Round</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Evaluation</TableHead>
                      <TableHead>Grace</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadlines.map((dl, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{dl.round_name}</TableCell>
                        <TableCell className="text-xs">{dl.submission_deadline || '-'}</TableCell>
                        <TableCell className="text-xs">{dl.evaluation_deadline || '-'}</TableCell>
                        <TableCell>{dl.grace_period_minutes || 0}m</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync & Data */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Google Sheets Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Google Sheets URL" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)} />
              <Button onClick={handleSync} disabled={syncing || !sheetsUrl} className="btn-press">
                {syncing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Trigger Sync</>}
              </Button>
            </CardContent>
          </Card>

          {/* Sync Logs */}
          {syncLogs.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sync Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {syncLogs.slice(0, 10).map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                      <span>{log.type}</span>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>{log.status || 'done'}</Badge>
                      <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-0 shadow-sm border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-destructive" style={{fontFamily:'Space Grotesk'}}>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="btn-press"><Trash2 className="w-4 h-4 mr-2" /> Truncate All Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete all teams, mentors, evaluations, chat messages, and emails. Only the admin account will be preserved.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTruncate} className="bg-destructive hover:bg-destructive/90">Yes, Delete Everything</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
