import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function EvaluationMonitoring() {
  const [evaluations, setEvaluations] = useState([]);
  const [round, setRound] = useState('Round 1');
  const [loading, setLoading] = useState(true);

  const fetchEvals = async () => {
    setLoading(true);
    try {
      const data = await api(`/api/evaluations?round_name=${encodeURIComponent(round)}`);
      setEvaluations(data.evaluations);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchEvals(); }, [round]);

  const handleExportExcel = async () => {
    try {
      const API_BASE = 'https://4dqf2ei3vk.execute-api.ap-southeast-2.amazonaws.com';
      const response = await fetch(`${API_BASE}/api/evaluations/export/excel?round_name=${encodeURIComponent(round)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations_${round.replace(' ', '_').toLowerCase()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Evaluations exported to Excel');
    } catch (err) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      const API_BASE = 'https://4dqf2ei3vk.execute-api.ap-southeast-2.amazonaws.com';
      const response = await fetch(`${API_BASE}/api/evaluations/export/pdf?round_name=${encodeURIComponent(round)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations_${round.replace(' ', '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Evaluations exported to PDF');
    } catch (err) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Evaluation Monitoring</h1>
          <p className="text-muted-foreground mt-1">Track all mentor evaluations across rounds</p>
        </div>
        {evaluations.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <Tabs value={round} onValueChange={setRound} data-testid="admin-evaluation-round-tabs">
            <TabsList>
              <TabsTrigger value="Round 1">Round 1</TabsTrigger>
              <TabsTrigger value="Round 2">Round 2</TabsTrigger>
              <TabsTrigger value="Round 3">Round 3</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 skeleton-shimmer rounded-lg" />)}</div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No evaluations submitted for {round} yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table data-testid="admin-evaluation-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead className="text-xs">Innovation<br/>(20)</TableHead>
                      <TableHead className="text-xs">Technical<br/>(25)</TableHead>
                      <TableHead className="text-xs">Functionality<br/>(20)</TableHead>
                      <TableHead className="text-xs">Presentation<br/>(15)</TableHead>
                      <TableHead className="text-xs">Impact<br/>(10)</TableHead>
                      <TableHead className="text-xs">Code Quality<br/>(10)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((ev) => {
                      const scores = ev.scores || [];
                      const getScore = (cat) => scores.find(s => s.category_name?.includes(cat))?.score || '-';
                      return (
                        <TableRow key={ev._id} className="table-row-hover">
                          <TableCell>
                            <div><p className="font-medium text-sm">{ev.team_name || ev.team_id}</p><p className="text-xs text-muted-foreground font-mono">{ev.team_id}</p></div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{ev.mentor_id}</TableCell>
                          <TableCell className="tabular-nums text-center">{getScore('Innovation')}</TableCell>
                          <TableCell className="tabular-nums text-center">{getScore('Technical')}</TableCell>
                          <TableCell className="tabular-nums text-center">{getScore('Functionality')}</TableCell>
                          <TableCell className="tabular-nums text-center">{getScore('Presentation')}</TableCell>
                          <TableCell className="tabular-nums text-center">{getScore('Impact')}</TableCell>
                          <TableCell className="tabular-nums text-center">{getScore('Code Quality')}</TableCell>
                          <TableCell><span className="font-semibold tabular-nums text-primary">{ev.total_score}/100</span></TableCell>
                          <TableCell><Badge variant={ev.status === 'evaluated' ? 'default' : 'secondary'}>{ev.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{ev.submitted_at ? new Date(ev.submitted_at).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
