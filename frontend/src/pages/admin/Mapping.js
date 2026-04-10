import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Wand2, RefreshCw, Loader2, ClipboardList } from 'lucide-react';

export default function Mapping() {
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);

  const fetchData = async () => {
    try {
      const [teamsData, mentorsData] = await Promise.all([
        api('/api/teams'),
        api('/api/mentors')
      ]);
      setTeams(teamsData.teams);
      setMentors(mentorsData.mentors);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (teamId, mentorEmail) => {
    try {
      await api('/api/mapping/assign', {
        method: 'POST',
        body: JSON.stringify({ team_id: teamId, mentor_email: mentorEmail })
      });
      toast.success('Mentor assigned successfully');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const data = await api('/api/mapping/auto-assign', { method: 'POST' });
      toast.success(`Auto-assigned ${data.count} teams`);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAutoAssigning(false);
    }
  };

  const unassigned = teams.filter(t => !t.assigned_mentor_email);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Team-Mentor Mapping</h1>
          <p className="text-muted-foreground mt-1">{unassigned.length} teams unassigned</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAutoAssign} disabled={autoAssigning} className="btn-press" data-testid="mapping-auto-assign-button">
            {autoAssigning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning...</> : <><Wand2 className="w-4 h-4 mr-2" /> Auto Assign</>}
          </Button>
          <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Mentor Capacity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {mentors.map(m => {
          const capacity = parseInt(m.max_team_capacity) || 3;
          const assigned = m.assigned_teams_count || 0;
          const isFull = assigned >= capacity;
          return (
            <Card key={m.mentor_id} className={`border-0 shadow-sm ${isFull ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <p className="font-medium text-sm truncate">{m.mentor_name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.expertise}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isFull ? 'bg-red-400' : assigned > capacity * 0.7 ? 'bg-amber-400' : 'bg-green-400'}`}
                      style={{width: `${Math.min((assigned/capacity)*100, 100)}%`}} />
                  </div>
                  <span className="text-xs tabular-nums font-mono">{assigned}/{capacity}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Teams Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 skeleton-shimmer rounded-lg" />)}</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No teams to map. Import data first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table data-testid="mapping-teams-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Team ID</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Current Mentor</TableHead>
                    <TableHead>Assign Mentor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.team_id} className="table-row-hover">
                      <TableCell className="font-mono text-xs">{team.team_id}</TableCell>
                      <TableCell className="font-medium">{team.team_name}</TableCell>
                      <TableCell><Badge variant="secondary">{team.project_domain || '-'}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {team.assigned_mentor_email || <span className="text-amber-500">Unassigned</span>}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={team.assigned_mentor_email || ''}
                          onValueChange={(v) => handleAssign(team.team_id, v)}
                          data-testid="mapping-mentor-select"
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select mentor" />
                          </SelectTrigger>
                          <SelectContent>
                            {mentors.map(m => (
                              <SelectItem key={m.mentor_id} value={m.mentor_email}>
                                {m.mentor_name} ({m.assigned_teams_count}/{m.max_team_capacity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
