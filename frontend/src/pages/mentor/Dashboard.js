import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Users, ClipboardList, CheckCircle, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/dashboard/stats').then(d => setStats(d.stats)),
      api('/api/teams').then(d => setTeams(d.teams)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton-shimmer rounded-xl" />)}</div>;

  const total = (stats?.completed_evaluations || 0) + (stats?.pending_evaluations || 0);
  const pct = total > 0 ? ((stats?.completed_evaluations || 0) / total) * 100 : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Mentor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.username}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="kpi-card border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-semibold tabular-nums" style={{fontFamily:'Space Grotesk'}}>{stats?.assigned_teams || 0}</p>
            <p className="text-xs text-muted-foreground">Assigned Teams</p>
          </CardContent>
        </Card>
        <Card className="kpi-card border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-semibold tabular-nums" style={{fontFamily:'Space Grotesk'}}>{stats?.completed_evaluations || 0}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="kpi-card border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-semibold tabular-nums" style={{fontFamily:'Space Grotesk'}}>{stats?.pending_evaluations || 0}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="kpi-card border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Completion</p>
            <Progress value={pct} className="h-2 mb-2" />
            <p className="text-lg font-semibold tabular-nums" style={{fontFamily:'Space Grotesk'}}>{Math.round(pct)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Round-wise Assignments */}
      {stats?.round_assignments && Object.keys(stats.round_assignments).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{fontFamily:'Space Grotesk'}}>Round-wise Team Assignments</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {['Round 1', 'Round 2', 'Round 3'].map(roundName => {
              const roundTeams = stats.round_assignments[roundName] || [];
              if (roundTeams.length === 0) return null;
              return (
                <Card key={roundName} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-sm" style={{fontFamily:'Space Grotesk'}}>{roundName}</h3>
                    <div className="space-y-2">
                      {roundTeams.map((team, idx) => (
                        <div key={idx} className="text-xs p-2 bg-muted rounded">
                          <p className="font-medium">{team.team_name}</p>
                          <p className="text-muted-foreground">{team.team_id}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4" style={{fontFamily:'Space Grotesk'}}>All Assigned Teams</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="mentor-assigned-teams-list">
        {teams.map(team => (
          <Link key={team.team_id} to={`/mentor/evaluations?team=${team.team_id}`}>
            <Card className="kpi-card border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{team.team_name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{team.team_id}</p>
                  </div>
                  <Badge variant="secondary">{team.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{team.project_domain || 'No project title'}</p>
                <p className="text-xs text-muted-foreground">{team.college_name}</p>
                {team.team_lead_mobile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" /> +{team.team_lead_mobile}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Badge
                    className={`text-xs ${
                      team.round_1_eval_status === 'evaluated' ? 'bg-green-100 text-green-700' :
                      team.assigned_rounds?.includes('Round 1') ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    R1 {!team.assigned_rounds?.includes('Round 1') && '🔒'}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      team.round_2_eval_status === 'evaluated' ? 'bg-green-100 text-green-700' :
                      team.assigned_rounds?.includes('Round 2') ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    R2 {!team.assigned_rounds?.includes('Round 2') && '🔒'}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      team.round_3_eval_status === 'evaluated' ? 'bg-green-100 text-green-700' :
                      team.assigned_rounds?.includes('Round 3') ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    R3 {!team.assigned_rounds?.includes('Round 3') && '🔒'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
