import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2, UserCheck, Users } from 'lucide-react';

export default function RoundMapping() {
  const [mappings, setMappings] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedRounds, setSelectedRounds] = useState([]);

  const rounds = ['Round 1', 'Round 2', 'Round 3'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mappingsData, mentorsData, teamsData] = await Promise.all([
        api('/api/round-mappings'),
        api('/api/mentors'),
        api('/api/teams')
      ]);
      setMappings(mappingsData.mappings || []);
      setMentors(mentorsData.mentors || []);
      setTeams(teamsData.teams || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error(`Failed to load data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMapping = async () => {
    if (!selectedMentor || selectedTeams.length === 0 || selectedRounds.length === 0) {
      toast.error('Please select mentor, teams, and rounds');
      return;
    }

    try {
      await api('/api/round-mappings', {
        method: 'POST',
        body: JSON.stringify({
          mentor_id: selectedMentor,
          team_ids: selectedTeams,
          rounds: selectedRounds
        })
      });
      toast.success('Round mappings created successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create mappings');
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!window.confirm('Delete this mapping?')) return;
    try {
      await api(`/api/round-mappings/${mappingId}`, { method: 'DELETE' });
      toast.success('Mapping deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete mapping');
    }
  };

  const resetForm = () => {
    setSelectedMentor('');
    setSelectedTeams([]);
    setSelectedRounds([]);
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const toggleRoundSelection = (round) => {
    setSelectedRounds(prev =>
      prev.includes(round) ? prev.filter(r => r !== round) : [...prev, round]
    );
  };

  // Group mappings by mentor
  const mappingsByMentor = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.mentor_id]) {
      acc[mapping.mentor_id] = {
        mentor_name: mapping.mentor_name,
        mentor_email: mapping.mentor_email,
        mappings: []
      };
    }
    acc[mapping.mentor_id].mappings.push(mapping);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Round-wise Mentor Mapping
          </h1>
          <p className="text-muted-foreground mt-1">Assign mentors to teams for specific rounds</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Mapping
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Current Mappings ({mappings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(mappingsByMentor).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No mappings created yet</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(mappingsByMentor).map(([mentorId, data]) => (
                <div key={mentorId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{data.mentor_name}</h3>
                    <span className="text-sm text-muted-foreground">({data.mentor_email})</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team ID</TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Round</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.mappings.map((mapping) => (
                        <TableRow key={mapping._id}>
                          <TableCell className="font-mono text-xs">{mapping.team_id}</TableCell>
                          <TableCell>{mapping.team_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{mapping.round_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={mapping.status === 'active' ? 'default' : 'secondary'}>
                              {mapping.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMapping(mapping._id)}
                              className="gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Mapping Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Round-wise Mentor Mapping</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Select Mentor */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Mentor</label>
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.mentor_id} value={mentor.mentor_id}>
                      {mentor.mentor_name} ({mentor.mentor_email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Rounds */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Rounds (Multi-select)</label>
              <div className="flex gap-4">
                {rounds.map((round) => (
                  <div key={round} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedRounds.includes(round)}
                      onCheckedChange={() => toggleRoundSelection(round)}
                    />
                    <label className="text-sm">{round}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Teams */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Teams (Multi-select)</label>
              <div className="border rounded-lg max-h-64 overflow-y-auto p-3 space-y-2">
                {teams.map((team) => (
                  <div key={team.team_id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      checked={selectedTeams.includes(team.team_id)}
                      onCheckedChange={() => toggleTeamSelection(team.team_id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{team.team_name}</p>
                      <p className="text-xs text-muted-foreground">{team.team_id}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTeams.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedTeams.length} team(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateMapping}>Create Mappings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

