import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Users, CheckCircle2, Clock, Phone, ShieldCheck,
  Layers, Briefcase, GraduationCap, Lock, ChevronRight,
  Ban, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [disqualifications, setDisqualifications] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, teamsData, roundMappings, disqualData, deadlineData] = await Promise.all([
          api('/api/dashboard/stats'),
          api('/api/teams'),
          api('/api/round-mappings'),
          api('/api/disqualifications'),
          api('/api/deadlines')
        ]);

        setStats(statsData.stats);
        setTeams(teamsData.teams);
        setDisqualifications(disqualData.disqualifications || []);
        setDeadlines(deadlineData.deadlines || []);

        // Calculate round-wise team counts
        const mentorEmail = user?.email;
        const roundCounts = { 'Round 1': 0, 'Round 2': 0, 'Round 3': 0 };
        const uniqueTeams = new Set();

        roundMappings.mappings?.forEach(mapping => {
          if (mapping.mentor_email === mentorEmail) {
            roundCounts[mapping.round_name]++;
            uniqueTeams.add(mapping.team_id);
          }
        });

        setStats(prev => ({
          ...prev,
          round_assignments: roundCounts,
          total_unique_teams: uniqueTeams.size
        }));

      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-10 w-1/3 bg-muted rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
      </div>
      <div className="h-40 bg-muted rounded-xl" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
      </div>
    </div>
  );

  const total = (stats?.completed_evaluations || 0) + (stats?.pending_evaluations || 0);
  const pct = total > 0 ? ((stats?.completed_evaluations || 0) / total) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header Section */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium tracking-wider text-primary uppercase">Mentor Portal</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" style={{fontFamily:'Space Grotesk'}}>
          Overview Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome back, <span className="font-semibold text-foreground">{user?.username}</span>
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground mb-1" style={{fontFamily:'Space Grotesk'}}>
              {stats?.total_unique_teams || stats?.assigned_teams || 0}
            </p>
            <p className="text-sm font-medium text-muted-foreground">Unique Teams</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground mb-1" style={{fontFamily:'Space Grotesk'}}>
              {stats?.completed_evaluations || 0}
            </p>
            <p className="text-sm font-medium text-muted-foreground">Evaluated</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground mb-1" style={{fontFamily:'Space Grotesk'}}>
              {stats?.pending_evaluations || 0}
            </p>
            <p className="text-sm font-medium text-muted-foreground">Pending Action</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col h-full justify-center">
            <div className="flex items-end justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold tabular-nums text-foreground" style={{fontFamily:'Space Grotesk'}}>{Math.round(pct)}%</p>
            </div>
            <Progress value={pct} className="h-3 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </Progress>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {stats?.completed_evaluations || 0} of {total} total tasks done
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Round-wise Assignments */}
      {stats?.round_assignments && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2" style={{fontFamily:'Space Grotesk'}}>
            <Layers className="w-6 h-6 text-primary" /> Evaluation Pipeline
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Round 1', 'Round 2', 'Round 3'].map((roundName, index) => {
              const roundCount = stats.round_assignments[roundName] || 0;
              const hasAssignments = roundCount > 0;
              
              return (
                <Card key={roundName} className={`border relative overflow-hidden transition-all duration-300 ${
                  hasAssignments ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-border/50 bg-card/30'
                }`}>
                  {hasAssignments && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg" style={{fontFamily:'Space Grotesk'}}>{roundName}</h3>
                      <Badge variant="outline" className={hasAssignments ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}>
                        Stage {index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-4xl font-bold tabular-nums tracking-tight ${hasAssignments ? 'text-foreground' : 'text-muted-foreground/50'}`} style={{fontFamily:'Space Grotesk'}}>
                        {roundCount}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">Teams</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Assigned Teams */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2" style={{fontFamily:'Space Grotesk'}}>
            <Briefcase className="w-6 h-6 text-primary" /> Your Assigned Teams
          </h2>
          <Badge variant="secondary" className="px-3 py-1 font-medium">{teams.length} Total</Badge>
        </div>

        {/* Legend */}
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-semibold text-muted-foreground">Round Status:</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 px-2">
                  R1 Done
                </Badge>
                <span className="text-muted-foreground">Evaluated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 px-2 gap-1">
                  <Ban className="w-3 h-3" />
                  R1
                </Badge>
                <span className="text-muted-foreground">Disqualified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20 px-2 gap-1">
                  <AlertCircle className="w-3 h-3" />
                  R1
                </Badge>
                <span className="text-muted-foreground">Missed Deadline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 px-2 gap-1">
                  <Lock className="w-3 h-3" />
                  R2
                </Badge>
                <span className="text-muted-foreground">Prev Round Missing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs px-2">
                  R1
                </Badge>
                <span className="text-muted-foreground">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="mentor-assigned-teams-list">
          {teams.map(team => (
            <Link key={team.team_id} to={`/mentor/evaluations?team=${team.team_id}`} className="block group">
              <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-bold text-lg truncate text-foreground group-hover:text-primary transition-colors">
                        {team.team_name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground bg-muted/50 inline-block px-1.5 py-0.5 rounded mt-1">
                        ID: {team.team_id}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-muted/30 capitalize whitespace-nowrap">
                      {team.status || 'Active'}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 flex-1 mb-5">
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                        {team.project_domain || <span className="italic text-muted-foreground">Project title pending</span>}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{team.college_name}</span>
                    </div>
                    
                    {team.team_lead_mobile && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{team.team_lead_mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Round Badges Footer */}
                  <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex gap-2">
                      {['Round 1', 'Round 2', 'Round 3'].map((round, idx) => {
                        const isAssigned = team.assigned_rounds?.includes(round);
                        const evalStatusField = `round_${idx + 1}_eval_status`;
                        const isEvaluated = team[evalStatusField] === 'evaluated';

                        // Check blocking conditions
                        const isDisqualified = disqualifications.some(
                          d => d.team_id === team.team_id && d.round_name === round
                        );

                        const deadline = deadlines.find(d => d.round_name === round);
                        const now = new Date();
                        const deadlinePassed = deadline && new Date(deadline.submission_deadline) < now;
                        const hasSubmission = team[`round_${idx + 1}_submitted`];
                        const missedDeadline = deadlinePassed && !hasSubmission;

                        // Check previous round
                        const prevRoundMissing = idx > 0 && !team[`round_${idx}_submitted`];

                        if (isDisqualified) {
                          return (
                            <Badge key={round} variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs px-2 gap-1">
                              <Ban className="w-3 h-3" />
                              R{idx + 1}
                            </Badge>
                          );
                        }

                        if (isEvaluated) {
                          return (
                            <Badge key={round} variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs px-2">
                              R{idx + 1} Done
                            </Badge>
                          );
                        }

                        if (missedDeadline) {
                          return (
                            <Badge key={round} variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 text-xs px-2 gap-1">
                              <AlertCircle className="w-3 h-3" />
                              R{idx + 1}
                            </Badge>
                          );
                        }

                        if (prevRoundMissing) {
                          return (
                            <Badge key={round} variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs px-2 gap-1">
                              <Lock className="w-3 h-3" />
                              R{idx + 1}
                            </Badge>
                          );
                        }
                        
                        if (isAssigned) {
                          return (
                            <Badge key={round} variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs px-2 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                              R{idx + 1}
                            </Badge>
                          );
                        }

                        return (
                          <Badge key={round} variant="outline" className="bg-muted/50 text-muted-foreground border-transparent text-xs px-2 flex items-center gap-1 opacity-60">
                            R{idx + 1} <Lock className="w-2.5 h-2.5" />
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
