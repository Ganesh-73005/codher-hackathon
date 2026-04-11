import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2, UserCheck, Users, Search, X } from 'lucide-react';

export default function RoundMapping() {
  const [mappings, setMappings] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Filter states
  const [filterRound, setFilterRound] = useState('all');
  const [filterMentor, setFilterMentor] = useState('all');
  const [tableSearchQuery, setTableSearchQuery] = useState('');

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
    try {
      await api(`/api/round-mappings/${mappingId}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      console.error('Failed to delete mapping:', err);
      return false;
    }
  };

  const handleDeleteAllMappings = async (mappingIds, teamName) => {
    if (!window.confirm(`Delete all ${mappingIds.length} round mapping(s) for ${teamName}?`)) return;

    try {
      await Promise.all(mappingIds.map(id => api(`/api/round-mappings/${id}`, { method: 'DELETE' })));
      toast.success('All mappings deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete some mappings');
      fetchData(); // Refresh anyway to show what was deleted
    }
  };

  const resetForm = () => {
    setSelectedMentor('');
    setSelectedTeams([]);
    setSelectedRounds([]);
    setSelectedGroups([]);
    setSearchQuery('');
  };

  // Calculate available groups from teams
  const availableGroups = [...new Set(teams.map(t => t.group_number).filter(Boolean))].sort((a, b) => a - b);

  // Handle group selection - add all teams from selected groups
  const handleGroupSelection = (groupNumber) => {
    const isSelected = selectedGroups.includes(groupNumber);

    if (isSelected) {
      // Deselect group and remove its teams
      setSelectedGroups(selectedGroups.filter(g => g !== groupNumber));
      const groupTeamIds = teams.filter(t => t.group_number === groupNumber).map(t => t.team_id);
      setSelectedTeams(selectedTeams.filter(id => !groupTeamIds.includes(id)));
    } else {
      // Select group and add all its teams
      setSelectedGroups([...selectedGroups, groupNumber]);
      const groupTeamIds = teams.filter(t => t.group_number === groupNumber).map(t => t.team_id);
      const newTeams = [...new Set([...selectedTeams, ...groupTeamIds])];
      setSelectedTeams(newTeams);
    }
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      team.team_id?.toLowerCase().includes(query) ||
      team.team_name?.toLowerCase().includes(query) ||
      team.team_lead_name?.toLowerCase().includes(query) ||
      team.team_lead_email?.toLowerCase().includes(query) ||
      team.college_name?.toLowerCase().includes(query)
    );
  });

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

  // Filter and search mappings
  const filteredMappings = mappings.filter(mapping => {
    // Round filter
    if (filterRound !== 'all' && mapping.round_name !== filterRound) {
      return false;
    }

    // Mentor filter
    if (filterMentor !== 'all' && mapping.mentor_email !== filterMentor) {
      return false;
    }

    // Search query
    if (tableSearchQuery) {
      const query = tableSearchQuery.toLowerCase();
      return (
        mapping.team_name?.toLowerCase().includes(query) ||
        mapping.team_id?.toLowerCase().includes(query) ||
        mapping.mentor_name?.toLowerCase().includes(query) ||
        mapping.mentor_email?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Group mappings by mentor and then by team (aggregate rounds)
  const mappingsByMentor = filteredMappings.reduce((acc, mapping) => {
    if (!acc[mapping.mentor_id]) {
      acc[mapping.mentor_id] = {
        mentor_name: mapping.mentor_name,
        mentor_email: mapping.mentor_email,
        teams: {}
      };
    }

    // Group by team within mentor
    if (!acc[mapping.mentor_id].teams[mapping.team_id]) {
      acc[mapping.mentor_id].teams[mapping.team_id] = {
        team_id: mapping.team_id,
        team_name: mapping.team_name,
        rounds: [],
        mapping_ids: [],
        status: mapping.status
      };
    }

    // Add round and mapping ID to the team
    acc[mapping.mentor_id].teams[mapping.team_id].rounds.push(mapping.round_name);
    acc[mapping.mentor_id].teams[mapping.team_id].mapping_ids.push(mapping._id);

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

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by team, mentor name, or email..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {tableSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTableSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Round Filter */}
            <Select value={filterRound} onValueChange={setFilterRound}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                <SelectItem value="Round 1">Round 1</SelectItem>
                <SelectItem value="Round 2">Round 2</SelectItem>
                <SelectItem value="Round 3">Round 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Mentor Filter */}
            <Select value={filterMentor} onValueChange={setFilterMentor}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by Mentor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mentors</SelectItem>
                {mentors.map(mentor => (
                  <SelectItem key={mentor.mentor_email} value={mentor.mentor_email}>
                    {mentor.mentor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(filterRound !== 'all' || filterMentor !== 'all' || tableSearchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterRound('all');
                  setFilterMentor('all');
                  setTableSearchQuery('');
                }}
                className="w-full md:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredMappings.length} of {mappings.length} mappings
            {(filterRound !== 'all' || filterMentor !== 'all' || tableSearchQuery) && (
              <span className="ml-2 text-primary">
                (Filtered)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Current Mappings ({filteredMappings.length})</CardTitle>
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
                        <TableHead>Assigned Rounds</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(data.teams).map((team) => (
                        <TableRow key={team.team_id}>
                          <TableCell className="font-mono text-xs">{team.team_id}</TableCell>
                          <TableCell>{team.team_name}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {team.rounds.sort().map((round, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {round}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                              {team.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAllMappings(team.mapping_ids, team.team_name)}
                              className="gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete All
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

              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by team ID, name, lead, email, or college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Group Selection */}
              {availableGroups.length > 0 && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg border">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Quick Select by Group
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {availableGroups.map((groupNum) => {
                      const groupTeams = teams.filter(t => t.group_number === groupNum);
                      const isSelected = selectedGroups.includes(groupNum);

                      return (
                        <Button
                          key={groupNum}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleGroupSelection(groupNum)}
                          className="gap-1"
                        >
                          Group {groupNum}
                          <Badge variant={isSelected ? "secondary" : "outline"} className="ml-1 text-xs">
                            {groupTeams.length}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                  {selectedGroups.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected {selectedGroups.length} group(s) with {selectedTeams.length} teams
                    </p>
                  )}
                </div>
              )}

              {/* Teams List */}
              <div className="border rounded-lg max-h-64 overflow-y-auto p-3 space-y-2">
                {filteredTeams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? 'No teams found matching your search' : 'No teams available'}
                  </p>
                ) : (
                  filteredTeams.map((team) => (
                    <div key={team.team_id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                      <Checkbox
                        checked={selectedTeams.includes(team.team_id)}
                        onCheckedChange={() => toggleTeamSelection(team.team_id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{team.team_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {team.team_id} | {team.team_lead_name}
                        </p>
                        {searchQuery && team.college_name && (
                          <p className="text-xs text-muted-foreground truncate">{team.college_name}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Selection Summary */}
              <div className="flex items-center justify-between mt-2">
                {selectedTeams.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTeams.length} team(s) selected
                  </p>
                )}
                {searchQuery && (
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredTeams.length} of {teams.length} teams
                  </p>
                )}
              </div>
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

