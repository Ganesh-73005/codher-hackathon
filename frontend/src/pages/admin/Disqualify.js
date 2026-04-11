import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Ban, Search, User, Mail, Building2, 
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';

export default function DisqualifyTeams() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [reason, setReason] = useState('');
  const [disqualifying, setDisqualifying] = useState(false);
  const [disqualifications, setDisqualifications] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchDisqualifications();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = teams.filter(team =>
        team.team_name.toLowerCase().includes(query) ||
        team.team_id.toLowerCase().includes(query) ||
        team.college?.toLowerCase().includes(query) ||
        team.team_lead_name?.toLowerCase().includes(query)
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams(teams);
    }
  }, [searchQuery, teams]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await api('/api/teams');
      setTeams(data.teams || []);
      setFilteredTeams(data.teams || []);
    } catch (err) {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisqualifications = async () => {
    try {
      const data = await api('/api/disqualifications');
      setDisqualifications(data.disqualifications || []);
    } catch (err) {
      console.error('Failed to fetch disqualifications:', err);
    }
  };

  const getTeamDisqualifications = (teamId) => {
    return disqualifications.filter(d => d.team_id === teamId);
  };

  const isRoundDisqualified = (teamId, roundName) => {
    return disqualifications.some(d => d.team_id === teamId && d.round_name === roundName);
  };

  const handleRoundToggle = (round) => {
    if (selectedRounds.includes(round)) {
      setSelectedRounds(selectedRounds.filter(r => r !== round));
    } else {
      setSelectedRounds([...selectedRounds, round]);
    }
  };

  const handleDisqualify = async () => {
    if (!selectedTeam) {
      toast.error('Please select a team');
      return;
    }

    if (selectedRounds.length === 0) {
      toast.error('Please select at least one round');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setDisqualifying(true);
    try {
      // Disqualify for each selected round
      const rounds = ['Round 1', 'Round 2', 'Round 3'];
      
      for (const roundName of selectedRounds) {
        const roundIndex = rounds.indexOf(roundName);
        const roundsToDisqualify = rounds.slice(roundIndex); // Current + subsequent

        for (const r of roundsToDisqualify) {
          await api('/api/disqualify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              team_id: selectedTeam.team_id,
              round_name: r,
              reason: r === roundName ? reason : `Disqualified in ${roundName}: ${reason}`
            })
          });
        }
      }

      toast.success(`Team disqualified successfully for ${selectedRounds.join(', ')} and subsequent rounds`);

      // Refresh data
      await fetchDisqualifications();

      // Reset form
      setSelectedTeam(null);
      setSelectedRounds([]);
      setReason('');

    } catch (err) {
      toast.error(err.message || 'Failed to disqualify team');
    } finally {
      setDisqualifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Ban className="w-8 h-8 text-red-600" />
          Disqualify Teams
        </h1>
        <p className="text-muted-foreground mt-1">
          Search for teams and disqualify them from specific rounds
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Team Search & Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Teams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by team name, ID, college, or lead..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Team List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredTeams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ban className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No teams found</p>
                  </div>
                ) : (
                  filteredTeams.map((team) => {
                    const teamDisquals = getTeamDisqualifications(team.team_id);
                    const hasDisqualifications = teamDisquals.length > 0;

                    return (
                      <div
                        key={team.team_id}
                        onClick={() => setSelectedTeam(team)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedTeam?.team_id === team.team_id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : hasDisqualifications
                            ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm flex items-center gap-2">
                                {team.team_name}
                                {selectedTeam?.team_id === team.team_id && (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                )}
                              </p>
                              {hasDisqualifications && (
                                <Ban className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs mt-1 font-mono">
                              {team.team_id}
                            </Badge>

                            {/* Disqualification Badges */}
                            {hasDisqualifications && (
                              <div className="flex gap-1 mt-2">
                                {['Round 1', 'Round 2', 'Round 3'].map(round => {
                                  const isDisq = isRoundDisqualified(team.team_id, round);
                                  return isDisq ? (
                                    <Badge key={round} variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 text-[10px] px-1.5 py-0">
                                      R{round.split(' ')[1]}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}

                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                {team.team_lead_name || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3" />
                                {team.team_lead_email || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" />
                                {team.college || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Disqualification Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disqualification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedTeam ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a team from the list to disqualify</p>
                </div>
              ) : (
                <>
                  {/* Selected Team Info */}
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-semibold mb-1">Selected Team</p>
                    <p className="text-lg font-bold">{selectedTeam.team_name}</p>
                    <Badge variant="outline" className="mt-1 font-mono text-xs">
                      {selectedTeam.team_id}
                    </Badge>

                    {/* Current Disqualification Status */}
                    {getTeamDisqualifications(selectedTeam.team_id).length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-2">
                          Currently Disqualified:
                        </p>
                        <div className="flex gap-1">
                          {['Round 1', 'Round 2', 'Round 3'].map(round => {
                            const disqual = disqualifications.find(
                              d => d.team_id === selectedTeam.team_id && d.round_name === round
                            );
                            return disqual ? (
                              <Badge
                                key={round}
                                variant="outline"
                                className="bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30 text-xs"
                              >
                                R{round.split(' ')[1]}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Round Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Select Round(s) to Disqualify</Label>
                    <p className="text-xs text-muted-foreground">
                      Selecting a round will also disqualify all subsequent rounds
                    </p>
                    <div className="space-y-2">
                      {['Round 1', 'Round 2', 'Round 3'].map((round) => {
                        const alreadyDisqualified = isRoundDisqualified(selectedTeam.team_id, round);
                        const disqual = disqualifications.find(
                          d => d.team_id === selectedTeam.team_id && d.round_name === round
                        );

                        return (
                          <div
                            key={round}
                            onClick={() => !alreadyDisqualified && handleRoundToggle(round)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              alreadyDisqualified
                                ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                                : selectedRounds.includes(round)
                                ? 'border-red-500 bg-red-500/10 cursor-pointer'
                                : 'border-border hover:border-red-500/50 cursor-pointer'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              alreadyDisqualified
                                ? 'border-gray-400 bg-gray-300 dark:bg-gray-700'
                                : selectedRounds.includes(round)
                                ? 'border-red-500 bg-red-500'
                                : 'border-muted-foreground'
                            }`}>
                              {(alreadyDisqualified || selectedRounds.includes(round)) && (
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{round}</span>
                              {alreadyDisqualified && disqual && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Already disqualified: {disqual.reason}
                                </p>
                              )}
                            </div>
                            {alreadyDisqualified && (
                              <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                Disqualified
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-semibold">
                      Reason for Disqualification *
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter the reason for disqualification (e.g., Plagiarism, Code of conduct violation, etc.)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Warning */}
                  {selectedRounds.length > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-orange-900 dark:text-orange-300">
                          This will disqualify the team for:
                        </p>
                        <ul className="mt-1 space-y-1 text-orange-800/90 dark:text-orange-200/80">
                          {selectedRounds.map(round => {
                            const rounds = ['Round 1', 'Round 2', 'Round 3'];
                            const idx = rounds.indexOf(round);
                            const affected = rounds.slice(idx);
                            return (
                              <li key={round}>• {affected.join(', ')}</li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTeam(null);
                        setSelectedRounds([]);
                        setReason('');
                      }}
                      disabled={disqualifying}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisqualify}
                      disabled={disqualifying || selectedRounds.length === 0 || !reason.trim()}
                      className="flex-1 gap-2"
                    >
                      {disqualifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Disqualifying...
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          Disqualify Team
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
