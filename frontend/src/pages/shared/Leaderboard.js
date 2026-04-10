import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Trophy, Medal, Award, TrendingUp, Users, Target, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [released, setReleased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await api('/api/leaderboard');
      setLeaderboard(data.leaderboard || []);
      setReleased(data.released);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${API_BASE}/api/leaderboard/export/excel`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leaderboard.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Leaderboard exported to Excel');
    } catch (err) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${API_BASE}/api/leaderboard/export/pdf`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leaderboard.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Leaderboard exported to PDF');
    } catch (err) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!released && user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Leaderboard Coming Soon</h2>
        <p className="text-muted-foreground">
          The global leaderboard will be visible once the admin releases the final results.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2" style={{fontFamily:'Space Grotesk'}}>
            <Trophy className="w-8 h-8 text-primary" />
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">Overall hackathon rankings</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </div>
            <p className="text-2xl font-bold">{leaderboard.length}</p>
          </div>
          {leaderboard.length > 0 && (
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
      </div>

      {!released && user.role === 'admin' && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800">
              <strong>Admin Preview:</strong> This leaderboard is only visible to you. 
              Teams will see it after you enable "Global Release" in Release Results.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm" data-testid="leaderboard-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Rounds</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="w-3 h-3" />
                      Total Score
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((entry, idx) => (
                  <tr 
                    key={entry.team_id}
                    className={`hover:bg-muted/30 transition-colors ${
                      user.team_id === entry.team_id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    data-testid={`leaderboard-row-${entry.rank}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold">{entry.team_name}</p>
                        <p className="text-sm text-muted-foreground">{entry.team_lead_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{entry.college || '-'}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-1 justify-center">
                        {['Round 1', 'Round 2', 'Round 3'].map(round => (
                          <Badge 
                            key={round}
                            variant={entry.round_scores[round] ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {entry.round_scores[round] ? `R${round.split(' ')[1]}: ${entry.round_scores[round]}` : `R${round.split(' ')[1]}`}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <Badge className={`text-lg font-bold px-4 py-1 ${getRankBadgeColor(entry.rank)}`}>
                          {entry.total_score}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No teams have been evaluated yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {user.team_id && leaderboard.length > 0 && (
        <Card className="mt-4 border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            {(() => {
              const myTeam = leaderboard.find(e => e.team_id === user.team_id);
              if (!myTeam) return <p className="text-sm">Your team hasn't been evaluated yet.</p>;
              
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Team Rank</p>
                    <p className="text-3xl font-bold flex items-center gap-2">
                      {getRankIcon(myTeam.rank)}
                      <span>#{myTeam.rank}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className="text-3xl font-bold text-primary">{myTeam.total_score}</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
