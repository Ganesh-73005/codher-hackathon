import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, FileText, Clock, UserCheck, MessageCircle, 
  Phone, Users, Mail, User, Calendar, PlayCircle, CheckCircle2, 
  XCircle, ChevronRight, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, teamsData, deadlinesData] = await Promise.all([
          api('/api/dashboard/stats'),
          api('/api/teams'),
          api('/api/deadlines')
        ]);

        setStats(statsData.stats);
        setDeadlines(deadlinesData.deadlines || []);

        // Find current team from teams list using user email
        const currentTeam = teamsData.teams?.find(t =>
          t.team_lead_email === user?.email ||
          t.team_id === user?.team_id
        );
        setTeamData(currentTeam);

      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Get round status - only one round can be live at a time
  const getRoundStatus = (roundName) => {
    const rounds = ['Round 1', 'Round 2', 'Round 3'];
    const currentIndex = rounds.indexOf(roundName);

    const deadline = deadlines.find(d => d.round_name === roundName);
    if (!deadline || !deadline.submission_deadline) {
      return { status: 'upcoming', label: 'Not Scheduled', color: 'text-muted-foreground', bg: 'bg-muted/50' };
    }

    const now = new Date();
    const deadlineDate = new Date(deadline.submission_deadline);

    // Check if any previous round is still live
    for (let i = 0; i < currentIndex; i++) {
      const prevRound = rounds[i];
      const prevDeadline = deadlines.find(d => d.round_name === prevRound);

      if (prevDeadline && prevDeadline.submission_deadline) {
        const prevDeadlineDate = new Date(prevDeadline.submission_deadline);

        if (now < prevDeadlineDate) {
          return { status: 'upcoming', label: 'Upcoming', color: 'text-muted-foreground', bg: 'bg-muted/50' };
        }
      }
    }

    // Now check current round status
    if (now < deadlineDate) {
      return { status: 'live', label: 'Live Now', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    } else {
      return { status: 'ended', label: 'Ended', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline || !deadline.submission_deadline) return 'TBD';
    return new Date(deadline.submission_deadline).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-1/3 bg-muted rounded-lg" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
      </div>
    </div>
  );

  // Modernized soft-UI colors for badges
  const statusColors = {
    'Not Submitted': 'bg-secondary text-secondary-foreground border-transparent',
    'Submitted': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    'Under Review': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    'Evaluated': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    'Final Results Released': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium tracking-wider text-primary uppercase">Workspace</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" style={{fontFamily:'Space Grotesk'}}>
            Team Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back, <span className="font-semibold text-foreground">{stats?.team_name || user?.username}</span>
          </p>
        </div>
        
        {/* Prominent Quick Actions moved to top for better UX, or keep at bottom. Added here as primary actions */}
        <div className="flex gap-3">
          <Link to="/team/submissions">
            <Button className="shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
              <FileText className="w-4 h-4 mr-2" /> Submit Work
            </Button>
          </Link>
          <Link to="/team/results">
            <Button variant="secondary" className="transition-all hover:-translate-y-0.5">
              <LayoutDashboard className="w-4 h-4 mr-2" /> View Results
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mentor Info */}
        {stats?.mentor_email && (
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden relative group" data-testid="team-mentor-card">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Assigned Mentor</p>
                  <p className="text-lg font-semibold leading-none mb-2">{stats.mentor_name || 'Assigned'}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> {stats.mentor_email}
                    </p>
                    {stats.mentor_mobile && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> {stats.mentor_mobile}
                      </p>
                    )}
                  </div>
                </div>
                <Link to="/team/chat">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members Info */}
        {teamData && (
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm" data-testid="team-members-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base">Team Roster</h3>
                    <Badge variant="secondary" className="font-normal">
                      {1 + (teamData.members?.length || 0)} Members
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {/* Team Lead */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate text-foreground">{teamData.team_lead_name}</p>
                          <Badge className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-0">LEAD</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{teamData.team_lead_email}</p>
                      </div>
                    </div>

                    {/* Other Members */}
                    {teamData.members && teamData.members.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {teamData.members.map((member, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate leading-tight">{member.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic px-2">Operating as a solo team</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Round Timings */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Timeline & Schedules</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {['Round 1', 'Round 2', 'Round 3'].map(roundName => {
            const deadline = deadlines.find(d => d.round_name === roundName);
            const roundStatus = getRoundStatus(roundName);
            const isLive = roundStatus.status === 'live';

            return (
              <Card key={roundName} className={`relative overflow-hidden border transition-all duration-300 ${
                isLive 
                  ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-card' 
                  : 'border-border/50 bg-card/50 shadow-sm hover:shadow-md'
              }`}>
                {isLive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                )}
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg" style={{fontFamily:'Space Grotesk'}}>{roundName}</h3>
                    {isLive && (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">LIVE</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <div className={`mt-0.5 rounded-full p-1.5 ${roundStatus.bg}`}>
                      <Clock className={`w-4 h-4 ${roundStatus.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Deadline</p>
                      <p className={`text-sm font-semibold ${isLive ? 'text-foreground' : roundStatus.color}`}>
                        {formatDeadline(deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <Badge variant="outline" className={`${roundStatus.bg} ${roundStatus.color} border-0 font-medium`}>
                      {roundStatus.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Round Status & Progress */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Evaluation Progress</h2>
        <div className="grid md:grid-cols-3 gap-6" data-testid="team-submission-status">
          {['Round 1', 'Round 2', 'Round 3'].map(roundName => {
            const roundData = stats?.rounds?.[roundName] || {};
            const isSubmitted = roundData.submission_status === 'Submitted';
            
            return (
              <Card key={roundName} className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-lg flex items-center justify-between" style={{fontFamily:'Space Grotesk'}}>
                    {roundName}
                    {isSubmitted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  {/* Round-wise Mentors */}
                  {stats?.round_mentors?.[roundName] && stats.round_mentors[roundName].length > 0 && (
                    <div className="mb-4 pb-4 border-b border-border/40">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">Evaluators</p>
                      <div className="space-y-2">
                        {stats.round_mentors[roundName].map((mentor, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm font-medium bg-muted/40 p-2 rounded-lg">
                            <UserCheck className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{mentor.mentor_name || mentor.mentor_email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between group">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Submission</span>
                      <Badge variant="outline" className={`border ${isSubmitted ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-muted/50 text-muted-foreground border-transparent'}`}>
                        {roundData.submission_status || 'Not Submitted'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between group">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Evaluation</span>
                      <Badge variant="outline" className={`border ${statusColors[roundData.eval_status] || 'bg-muted/50 text-muted-foreground border-transparent'}`}>
                        {roundData.eval_status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Deadlines Summary (if still required per requirements) */}
      {stats?.deadlines?.length > 0 && (
        <Card className="border border-border/50 shadow-sm bg-card/50" data-testid="team-deadlines-card">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Upcoming Milestones</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {stats.deadlines.map((dl, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">{dl.round_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground block">{dl.submission_deadline ? formatDeadline({submission_deadline: dl.submission_deadline}).split(' at ')[0] : 'TBD'}</span>
                    <span className="text-xs text-muted-foreground">{dl.submission_deadline ? formatDeadline({submission_deadline: dl.submission_deadline}).split(' at ')[1] : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
