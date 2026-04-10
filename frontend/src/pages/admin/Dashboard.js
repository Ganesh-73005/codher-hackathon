import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Users, UserCheck, ClipboardList, Mail, FileText, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/dashboard/stats').then(d => setStats(d.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton-shimmer rounded-xl" />)}</div>;

  const kpis = [
    { label: 'Total Teams', value: stats?.total_teams || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Mentors', value: stats?.active_mentors || 0, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Evaluations Done', value: stats?.completed_evaluations || 0, icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Reviews', value: stats?.pending_evaluations || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Submissions', value: stats?.total_submissions || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Emails Sent', value: stats?.emails_sent || 0, icon: Mail, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your hackathon management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="kpi-card border-0 shadow-sm" data-testid={`admin-kpi-${kpi.label.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-semibold tabular-nums" style={{fontFamily:'Space Grotesk'}}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/import" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><FileText className="w-4 h-4 text-purple-600" /></div>
              <div><p className="text-sm font-medium">Import Data</p><p className="text-xs text-muted-foreground">Upload Excel or Google Sheets</p></div>
            </a>
            <a href="/admin/mapping" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-blue-600" /></div>
              <div><p className="text-sm font-medium">Assign Mentors</p><p className="text-xs text-muted-foreground">Auto or manual mapping</p></div>
            </a>
            <a href="/admin/release" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-green-600" /></div>
              <div><p className="text-sm font-medium">Release Results</p><p className="text-xs text-muted-foreground">Publish scores to teams</p></div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Teams</span>
              <Badge variant="secondary">{stats?.active_teams || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Emails Failed</span>
              <Badge variant={stats?.emails_failed > 0 ? 'destructive' : 'secondary'}>{stats?.emails_failed || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
