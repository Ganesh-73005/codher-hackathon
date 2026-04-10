import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { LayoutDashboard, FileText, Clock, UserCheck, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/dashboard/stats').then(d => setStats(d.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton-shimmer rounded-xl" />)}</div>;

  const statusColors = {
    'Not Submitted': 'bg-gray-100 text-gray-600',
    'Submitted': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Evaluated': 'bg-green-100 text-green-700',
    'Final Results Released': 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Team Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {stats?.team_name || user?.username}</p>
      </div>

      {/* Mentor Info */}
      {stats?.mentor_email && (
        <Card className="border-0 shadow-sm mb-6" data-testid="team-mentor-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Your Mentor: {stats.mentor_name || 'Assigned'}</p>
                <p className="text-xs text-muted-foreground">{stats.mentor_email} {stats.mentor_expertise ? `| ${stats.mentor_expertise}` : ''}</p>
                {stats.mentor_mobile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" /> {stats.mentor_mobile}
                  </p>
                )}
              </div>
              <Link to="/team/chat">
                <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 mr-1" /> Chat</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Round Status Cards */}
      <h2 className="text-lg font-semibold mb-4" style={{fontFamily:'Space Grotesk'}}>Round Status</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-6" data-testid="team-submission-status">
        {['Round 1', 'Round 2', 'Round 3'].map(roundName => {
          const roundData = stats?.rounds?.[roundName] || {};
          return (
            <Card key={roundName} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3" style={{fontFamily:'Space Grotesk'}}>{roundName}</h3>

                {/* Round-wise Mentors */}
                {stats?.round_mentors?.[roundName] && stats.round_mentors[roundName].length > 0 && (
                  <div className="mb-3 pb-3 border-b">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Assigned Mentors:</p>
                    {stats.round_mentors[roundName].map((mentor, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-1 mt-1">
                        <UserCheck className="w-3 h-3 text-primary" />
                        <span>{mentor.mentor_name || mentor.mentor_email}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Submission</span>
                    <Badge className={`text-xs ${roundData.submission_status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {roundData.submission_status || 'Not Submitted'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Evaluation</span>
                    <Badge className={`text-xs ${statusColors[roundData.eval_status] || 'bg-gray-100 text-gray-600'}`}>
                      {roundData.eval_status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deadlines */}
      {stats?.deadlines?.length > 0 && (
        <Card className="border-0 shadow-sm" data-testid="team-deadlines-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3" style={{fontFamily:'Space Grotesk'}}>Upcoming Deadlines</h3>
            <div className="space-y-2">
              {stats.deadlines.map((dl, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{dl.round_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{dl.submission_deadline || 'TBD'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 mt-6">
        <Link to="/team/submissions"><Button variant="outline" className="btn-press"><FileText className="w-4 h-4 mr-2" /> Submit Work</Button></Link>
        <Link to="/team/results"><Button variant="outline" className="btn-press"><LayoutDashboard className="w-4 h-4 mr-2" /> View Results</Button></Link>
      </div>
    </div>
  );
}
