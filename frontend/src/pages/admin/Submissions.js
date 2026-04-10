import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Search, X, FileText, Github, Video, CheckCircle, XCircle, Clock, Presentation } from 'lucide-react';

export default function SubmissionsPage() {
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, submitted, not_submitted, ruled_out
  const [currentRound, setCurrentRound] = useState('Round 1');

  const rounds = ['Round 1', 'Round 2', 'Round 3'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsData, submissionsData, deadlinesData] = await Promise.all([
        api('/api/teams?limit=500'),
        api('/api/submissions'),
        api('/api/deadlines')
      ]);

      setTeams(teamsData.teams || []);
      setSubmissions(submissionsData.submissions || []);
      setDeadlines(deadlinesData.deadlines || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load submissions data');
    } finally {
      setLoading(false);
    }
  };

  // Get deadline for a round
  const getDeadline = (roundName) => {
    return deadlines.find(d => d.round_name === roundName);
  };

  // Check if deadline passed
  const isDeadlinePassed = (roundName) => {
    const deadline = getDeadline(roundName);
    if (!deadline || !deadline.submission_deadline) return false;
    return new Date() > new Date(deadline.submission_deadline);
  };

  // Get submission for team and round
  const getSubmission = (teamId, roundName) => {
    return submissions.find(s => s.team_id === teamId && s.round_name === roundName);
  };

  // Check if team is ruled out (missed any deadline without submitting)
  const isTeamRuledOut = (team) => {
    for (const round of rounds) {
      const deadline = getDeadline(round);
      if (!deadline) continue;
      
      const deadlinePassed = isDeadlinePassed(round);
      const submission = getSubmission(team.team_id, round);
      
      if (deadlinePassed && !submission) {
        return { ruledOut: true, round };
      }
    }
    return { ruledOut: false };
  };

  // Enrich teams with submission status for current round
  const enrichedTeams = teams.map(team => {
    const submission = getSubmission(team.team_id, currentRound);
    const deadlinePassed = isDeadlinePassed(currentRound);
    const ruledOutStatus = isTeamRuledOut(team);

    return {
      ...team,
      submission,
      hasSubmitted: !!submission,
      deadlinePassed,
      ruledOut: ruledOutStatus.ruledOut,
      ruledOutRound: ruledOutStatus.round,
      status: ruledOutStatus.ruledOut ? 'ruled_out' : (submission ? 'submitted' : (deadlinePassed ? 'ruled_out' : 'not_submitted'))
    };
  });

  // Filter teams
  const filteredTeams = enrichedTeams.filter(team => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        team.team_name?.toLowerCase().includes(query) ||
        team.team_id?.toLowerCase().includes(query) ||
        team.team_lead_name?.toLowerCase().includes(query) ||
        team.college_name?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus === 'all') return true;
    return team.status === filterStatus;
  });

  // Statistics for current round
  const stats = {
    total: teams.length,
    submitted: enrichedTeams.filter(t => t.hasSubmitted).length,
    notSubmitted: enrichedTeams.filter(t => !t.hasSubmitted && !t.ruledOut).length,
    ruledOut: enrichedTeams.filter(t => t.ruledOut).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
          Submissions Management
        </h1>
        <p className="text-muted-foreground mt-1">Track and manage team submissions across all rounds</p>
      </div>

      {/* Round Tabs */}
      <Tabs value={currentRound} onValueChange={setCurrentRound} className="mb-6">
        <TabsList>
          {rounds.map(round => (
            <TabsTrigger key={round} value={round}>
              {round}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Submitted</p>
                <p className="text-2xl font-bold text-orange-600">{stats.notSubmitted}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ruled Out</p>
                <p className="text-2xl font-bold text-red-600">{stats.ruledOut}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by team name, ID, lead, or college..."
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

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams ({enrichedTeams.length})</SelectItem>
                <SelectItem value="submitted">Submitted ({stats.submitted})</SelectItem>
                <SelectItem value="not_submitted">Not Submitted ({stats.notSubmitted})</SelectItem>
                <SelectItem value="ruled_out">Ruled Out ({stats.ruledOut})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentRound} Submissions ({filteredTeams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No teams found matching your search' : 'No teams found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team ID</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Team Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Links</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.map((team) => {
                    const submission = team.submission;

                    return (
                      <TableRow key={team.team_id}>
                        <TableCell className="font-mono text-xs">{team.team_id}</TableCell>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell className="text-sm">{team.team_lead_name}</TableCell>
                        <TableCell>
                          {team.ruledOut ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Ruled Out ({team.ruledOutRound})
                            </Badge>
                          ) : submission ? (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Submitted
                            </Badge>
                          ) : team.deadlinePassed ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Missed Deadline
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission ? (
                            <div className="flex flex-wrap gap-2">
                              {/* PPT Link */}
                              {submission.ppt_link && (
                                <a
                                  href={submission.ppt_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                  title="View PPT"
                                >
                                  <Presentation className="w-4 h-4" />
                                  PPT
                                </a>
                              )}

                              {/* GitHub Link */}
                              {submission.github_link && (
                                <a
                                  href={submission.github_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                  title="View GitHub"
                                >
                                  <Github className="w-4 h-4" />
                                  GitHub
                                </a>
                              )}

                              {/* Video Link */}
                              {submission.video_link && (
                                <a
                                  href={submission.video_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                  title="View Video"
                                >
                                  <Video className="w-4 h-4" />
                                  Video
                                </a>
                              )}

                              {/* No links */}
                              {!submission.ppt_link && !submission.github_link && !submission.video_link && (
                                <span className="text-muted-foreground text-sm">No links provided</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {submission?.submitted_at || submission?.updated_at ? (
                            new Date(submission.submitted_at || submission.updated_at).toLocaleString()
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

