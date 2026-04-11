import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { GDrivePDFEmbed, GDriveVideoEmbed, GitHubLinkCard } from '../../components/GDriveEmbed';
import { toast } from 'sonner';
import {
  Save, Loader2, CheckCircle, FileText, Eye, Lock,
  GraduationCap, FileSearch, User, Award, MessageSquare,
  LayoutList, AlertCircle, Sparkles, RefreshCw, Ban, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Hardcoded evaluation categories matching rubrics
const CATEGORIES = [
  { name: 'Innovation & Creativity', maxScore: 20 },
  { name: 'Technical Implementation', maxScore: 25 },
  { name: 'Functionality & Completion', maxScore: 20 },
  { name: 'Presentation & Communication', maxScore: 15 },
  { name: 'Impact & Relevance to Track', maxScore: 10 },
  { name: 'Code Quality & Scalability', maxScore: 10 }
];

export default function MentorEvaluation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [round, setRound] = useState('Round 1');
  const [scores, setScores] = useState(CATEGORIES.map(c => ({ category_name: c.name, score: 0, max_score: c.maxScore, comment: '' })));
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingEval, setExistingEval] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roundAssignments, setRoundAssignments] = useState({});
  const [disqualifications, setDisqualifications] = useState([]);
  const [disqualifying, setDisqualifying] = useState(false);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    api('/api/teams').then(d => {
      setTeams(d.teams);
      const teamId = searchParams.get('team');
      if (teamId) {
        const found = d.teams.find(t => t.team_id === teamId);
        if (found) setSelectedTeam(found);
      }
    }).catch(console.error).finally(() => setLoading(false));

    // Fetch disqualifications
    api('/api/disqualifications').then(d => {
      setDisqualifications(d.disqualifications || []);
    }).catch(console.error);

    // Fetch deadlines
    api('/api/deadlines').then(d => {
      setDeadlines(d.deadlines || []);
    }).catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    if (selectedTeam) {
      // Fetch round assignments for this team
      api(`/api/round-mappings/team/${selectedTeam.team_id}`)
        .then(d => {
          const assignments = {};
          d.mappings?.forEach(m => {
            if (!assignments[m.round_name]) assignments[m.round_name] = [];
            assignments[m.round_name].push(m.mentor_id);
          });
          setRoundAssignments(assignments);
        }).catch(console.error);

      api(`/api/evaluations?team_id=${selectedTeam.team_id}&round_name=${encodeURIComponent(round)}`)
        .then(d => {
          if (d.evaluations.length > 0) {
            const ev = d.evaluations[0];
            setExistingEval(ev);
            setFeedback(ev.feedback || '');
            if (ev.scores?.length) {
              setScores(CATEGORIES.map(c => {
                const existing = ev.scores.find(s => s.category_name === c.name);
                return { category_name: c.name, score: existing?.score || 0, max_score: c.maxScore, comment: existing?.comment || '' };
              }));
            }
          } else {
            setExistingEval(null);
            setScores(CATEGORIES.map(c => ({ category_name: c.name, score: 0, max_score: c.maxScore, comment: '' })));
            setFeedback('');
          }
        }).catch(console.error);

      // Fetch ALL submissions for this team (all rounds) to check previous rounds
      api(`/api/submissions?team_id=${selectedTeam.team_id}`)
        .then(d => setSubmissions(d.submissions)).catch(console.error);
    }
  }, [selectedTeam, round]);

  const totalScore = scores.reduce((sum, s) => sum + (parseInt(s.score) || 0), 0);

  // Refresh submissions manually
  const refreshSubmissions = async () => {
    if (!selectedTeam) return;

    setRefreshing(true);
    try {
      const data = await api(`/api/submissions?team_id=${selectedTeam.team_id}&round_name=${encodeURIComponent(round)}`);
      setSubmissions(data.submissions);
      toast.success('Submissions refreshed!');
    } catch (err) {
      toast.error('Failed to refresh submissions');
    } finally {
      setRefreshing(false);
    }
  };

  // Check if team is disqualified for this round
  const isTeamDisqualified = (teamId, roundName) => {
    return disqualifications.some(d => d.team_id === teamId && d.round_name === roundName);
  };

  // Check if team missed deadline (only if deadline passed)
  const isMissedDeadline = (roundName) => {
    const deadline = deadlines.find(d => d.round_name === roundName);
    if (!deadline || !deadline.submission_deadline) return false;

    const deadlineDate = new Date(deadline.submission_deadline);
    const now = new Date();

    // Only consider missed if deadline has passed
    if (now <= deadlineDate) return false;

    // Deadline passed - check submission
    if (!currentSub) return true; // No submission after deadline

    const submittedDate = new Date(currentSub.submitted_at);
    return submittedDate > deadlineDate; // Submitted after deadline
  };

  // Check if previous round was not submitted (blocking logic)
  const isPreviousRoundNotSubmitted = (roundName) => {
    const rounds = ['Round 1', 'Round 2', 'Round 3'];
    const currentIndex = rounds.indexOf(roundName);

    if (currentIndex === 0) return false; // Round 1 has no previous

    const previousRound = rounds[currentIndex - 1];

    // Check if team submitted for previous round
    const prevSubmission = submissions.find(s => s.round_name === previousRound);
    return !prevSubmission;
  };

  // Disqualify team (cascades to subsequent rounds)
  const handleDisqualify = async () => {
    if (!selectedTeam) return;

    const reason = prompt('Enter reason for disqualification:');
    if (!reason) return;

    setDisqualifying(true);
    try {
      // Determine which rounds to disqualify
      const rounds = ['Round 1', 'Round 2', 'Round 3'];
      const currentRoundIndex = rounds.indexOf(round);
      const roundsToDisqualify = rounds.slice(currentRoundIndex); // Current + subsequent rounds

      // Disqualify for all subsequent rounds
      for (const r of roundsToDisqualify) {
        await api('/api/disqualify', {
          method: 'POST',
          body: JSON.stringify({
            team_id: selectedTeam.team_id,
            round_name: r,
            reason: r === round ? reason : `Disqualified in ${round}: ${reason}`
          })
        });
      }

      const data = await api('/api/disqualifications');
      setDisqualifications(data.disqualifications || []);

      toast.success(`Team disqualified for ${round} and subsequent rounds`);
    } catch (err) {
      toast.error(err.message || 'Failed to disqualify team');
    } finally {
      setDisqualifying(false);
    }
  };

  // Revert disqualification
  const handleRevertDisqualification = async () => {
    if (!selectedTeam) return;

    setDisqualifying(true);
    try {
      await api(`/api/disqualify?team_id=${selectedTeam.team_id}&round_name=${encodeURIComponent(round)}`, {
        method: 'DELETE'
      });

      const data = await api('/api/disqualifications');
      setDisqualifications(data.disqualifications || []);

      toast.success('Disqualification reverted');
    } catch (err) {
      toast.error(err.message || 'Failed to revert disqualification');
    } finally {
      setDisqualifying(false);
    }
  };

  // Check if mentor can evaluate this round for this team
  const canEvaluateRound = (roundName) => {
    if (!selectedTeam) return false;

    // Check round-wise assignment
    const roundMentors = roundAssignments[roundName] || [];
    if (roundMentors.includes(user?.mentor_id)) return true;

    // Check traditional assignment (backward compatibility)
    const mentorEmail = user?.email;
    if (selectedTeam.assigned_mentor_email === mentorEmail) return true;

    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api('/api/evaluations', {
        method: 'POST',
        body: JSON.stringify({
          team_id: selectedTeam.team_id,
          round_name: round,
          scores: scores.map(s => ({ ...s, score: parseInt(s.score) || 0 })),
          feedback,
        }),
      });
      toast.success('Evaluation submitted successfully! Status email sent to the team.');
      setExistingEval({ status: 'evaluated' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Get submission for current round (since we now fetch all rounds for the team)
  const currentSub = submissions.find(s => s.round_name === round);

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-10 w-1/3 bg-muted rounded-lg" />
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="h-[600px] bg-muted rounded-xl" />
        <div className="lg:col-span-3 h-[600px] bg-muted rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header Section */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileSearch className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium tracking-wider text-primary uppercase">Evaluation Portal</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" style={{fontFamily:'Space Grotesk'}}>
          Review & Score
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Evaluate your assigned teams across multiple rounds and provide structured feedback.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Team Selector Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden sticky top-6">
            <div className="bg-muted/30 border-b border-border/40 px-4 py-3 flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Assigned Teams</CardTitle>
            </div>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-280px)] pr-3">
                <div className="space-y-1.5">
                  {teams.map(team => {
                    const isSelected = selectedTeam?.team_id === team.team_id;
                    const isCurrentRoundDisqualified = isTeamDisqualified(team.team_id, round);

                    // Check blocking conditions for this team
                    const checkTeamMissedDeadline = () => {
                      const deadline = deadlines.find(d => d.round_name === round);
                      if (!deadline || !deadline.submission_deadline) return false;
                      const deadlineDate = new Date(deadline.submission_deadline);
                      const now = new Date();
                      if (now <= deadlineDate) return false;
                      const teamSub = submissions.find(s => s.team_id === team.team_id && s.round_name === round);
                      if (!teamSub) return true;
                      return new Date(teamSub.submitted_at) > deadlineDate;
                    };

                    const checkTeamPrevRoundMissing = () => {
                      const rounds = ['Round 1', 'Round 2', 'Round 3'];
                      const currentIndex = rounds.indexOf(round);
                      if (currentIndex === 0) return false;
                      const previousRound = rounds[currentIndex - 1];
                      return !submissions.find(s => s.team_id === team.team_id && s.round_name === previousRound);
                    };

                    const teamMissedDeadline = checkTeamMissedDeadline();
                    const teamPrevRoundMissing = checkTeamPrevRoundMissing();

                    return (
                      <div
                        key={team.team_id}
                        onClick={() => setSelectedTeam(team)}
                        className={`group flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'border-transparent hover:border-border/50 hover:bg-muted/40'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-semibold truncate flex items-center gap-1.5 ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                            <span className="truncate">{team.team_name}</span>
                            {isCurrentRoundDisqualified && (
                              <Ban className="w-3.5 h-3.5 text-red-500 shrink-0" title="Disqualified for current round" />
                            )}
                            {!isCurrentRoundDisqualified && teamPrevRoundMissing && (
                              <Lock className="w-3.5 h-3.5 text-orange-500 shrink-0" title="Previous round not submitted" />
                            )}
                            {!isCurrentRoundDisqualified && !teamPrevRoundMissing && teamMissedDeadline && (
                              <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" title="Missed deadline" />
                            )}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{team.team_id}</p>
                        </div>
                        <div className="flex gap-1.5 mt-1">
                          {[1, 2, 3].map(r => {
                            const roundName = `Round ${r}`;
                            const evalStatus = team[`round_${r}_eval_status`];
                            const isEvaluated = evalStatus === 'evaluated';
                            const isDisqualifiedRound = isTeamDisqualified(team.team_id, roundName);

                            return (
                              <Badge
                                key={r}
                                variant="outline"
                                className={`text-[10px] h-5 px-1.5 border-0 font-medium ${
                                  isDisqualifiedRound
                                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 line-through'
                                    : isEvaluated
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                                title={isDisqualifiedRound ? 'Disqualified' : isEvaluated ? 'Evaluated' : 'Pending'}
                              >
                                {isDisqualifiedRound ? '⛔' : ''} R{r}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Panel */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedTeam ? (
            <Card className="border border-dashed border-border/60 shadow-sm bg-card/30 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <LayoutList className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground" style={{fontFamily:'Space Grotesk'}}>No Team Selected</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
                Select a team from the sidebar to view their submissions and begin the evaluation process.
              </p>
            </Card>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* Team Info Header */}
              <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground" style={{fontFamily:'Space Grotesk'}}>
                          {selectedTeam.team_name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">{selectedTeam.project_domain}</Badge>
                          <span className="text-sm text-muted-foreground">ID: <span className="font-mono">{selectedTeam.team_id}</span></span>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-lg border border-border/50 inline-block">
                        <p className="text-sm font-medium text-foreground">{selectedTeam.project_title || 'Pending Project Title'}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" /> {selectedTeam.college_name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" /> {selectedTeam.team_lead_name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      <Link to="/mentor/rubrics" target="_blank">
                        <Button variant="outline" className="shadow-sm hover:border-primary/50 transition-colors">
                          <FileText className="w-4 h-4 mr-2 text-primary" /> View Rubrics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Round Tabs */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-1.5 rounded-xl shadow-sm">
                <Tabs value={round} onValueChange={setRound} data-testid="mentor-round-tabs">
                  <TabsList className="w-full h-auto p-0 bg-transparent">
                    {['Round 1', 'Round 2', 'Round 3'].map(r => {
                      const isLocked = !canEvaluateRound(r);
                      return (
                        <TabsTrigger
                          key={r}
                          value={r}
                          disabled={isLocked}
                          className={`flex-1 py-2.5 rounded-lg transition-all ${
                            isLocked ? 'opacity-50' : ''
                          } data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:ring-2 data-[state=active]:ring-primary/40 data-[state=active]:ring-offset-2 data-[state=active]:ring-offset-background`}
                        >
                          <span className="flex items-center justify-center gap-2 font-medium">
                            {r}
                            {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              {!canEvaluateRound(round) && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">Round Locked</p>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
                      You are not assigned to evaluate this team for {round}. If you believe this is an error, please contact the admin.
                    </p>
                  </div>
                </div>
              )}

              {/* Disqualification Status & Actions */}
              {selectedTeam && isTeamDisqualified(selectedTeam.team_id, round) ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30">
                  <Ban className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900 dark:text-red-300 text-base">Team Disqualified for {round}</p>
                    <p className="text-sm text-red-800/90 dark:text-red-200/90 mt-1">
                      {disqualifications.find(d => d.team_id === selectedTeam.team_id && d.round_name === round)?.reason || 'This team has been disqualified'}
                    </p>
                    <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-2">
                      Disqualified teams cannot be evaluated or submit for subsequent rounds.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevertDisqualification}
                    disabled={disqualifying}
                    className="gap-1.5 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {disqualifying ? 'Reverting...' : 'Revert'}
                  </Button>
                </div>
              ) : canEvaluateRound(round) && (isMissedDeadline(round) || isPreviousRoundNotSubmitted(round)) ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-900 dark:text-orange-300 text-sm">
                      {isPreviousRoundNotSubmitted(round)
                        ? 'Previous Round Not Submitted'
                        : !currentSub
                        ? 'Deadline Passed - No Submission'
                        : 'Submitted After Deadline'}
                    </p>
                    <p className="text-sm text-orange-800/80 dark:text-orange-200/80 mt-1">
                      {isPreviousRoundNotSubmitted(round)
                        ? `This team has not submitted for the previous round. They must submit for all previous rounds before this round can be evaluated.`
                        : !currentSub
                        ? 'The deadline has passed and this team has not submitted any work for this round.'
                        : 'This team submitted after the deadline and cannot be evaluated.'
                      }
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisqualify}
                    disabled={disqualifying}
                    className="gap-1.5 shrink-0"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {disqualifying ? 'Disqualifying...' : 'Disqualify'}
                  </Button>
                </div>
              ) : canEvaluateRound(round) && selectedTeam && (
                <div className="flex items-center justify-end gap-2 p-3 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Manage team status</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisqualify}
                    disabled={disqualifying}
                    className="gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {disqualifying ? 'Disqualifying...' : 'Disqualify Team'}
                  </Button>
                </div>
              )}

              {/* Project Details */}
              {(selectedTeam.project_title || selectedTeam.project_description) && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg" style={{fontFamily:'Space Grotesk'}}>
                      Project Details
                    </h3>
                  </div>
                  {selectedTeam.project_title && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Title
                      </p>
                      <p className="text-base font-semibold">
                        {selectedTeam.project_title}
                      </p>
                    </div>
                  )}
                  {selectedTeam.project_description && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Description
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedTeam.project_description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submission Viewer */}
              {canEvaluateRound(round) && (
                <Accordion type="single" collapsible defaultValue="submissions" className="w-full">
                  <AccordionItem value="submissions" className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:border-b border-border/40">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <Eye className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-base" style={{fontFamily:'Space Grotesk'}}>Team Deliverables</span>
                        {currentSub ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs shadow-none ml-2">
                            Ready for Review
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs ml-2">Pending Submission</Badge>
                        )}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!refreshing) refreshSubmissions();
                          }}
                          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            refreshing
                              ? 'text-muted-foreground cursor-not-allowed'
                              : 'text-primary hover:bg-accent cursor-pointer'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pt-5 pb-5">
                      {!currentSub ? (
                        <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/60">
                          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="font-medium text-foreground">No deliverables submitted</p>
                          <p className="text-sm text-muted-foreground mt-1">The team has not submitted their work for {round} yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {(currentSub.ppt_link || currentSub.submission_link) && (
                            <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                              <GDrivePDFEmbed url={currentSub.ppt_link || currentSub.submission_link} title={`${round} - Presentation`} />
                            </div>
                          )}
                          {currentSub.github_link && (
                            <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                              <GitHubLinkCard url={currentSub.github_link} title={`${round} - Source Code`} />
                            </div>
                          )}
                          {currentSub.video_link && (
                            <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                              <GDriveVideoEmbed url={currentSub.video_link} title={`${round} - Demo Video`} />
                            </div>
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Scoring Engine */}
              {canEvaluateRound(round) && !isTeamDisqualified(selectedTeam?.team_id, round) && !isMissedDeadline(round) && !isPreviousRoundNotSubmitted(round) && (
                <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm relative overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl" style={{fontFamily:'Space Grotesk'}}>Scorecard</CardTitle>
                        {existingEval && (
                          <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                            <CheckCircle className="w-3 h-3 mr-1" /> Evaluated
                          </Badge>
                        )}
                      </div>
                      
                      {/* Sticky-like Total Score Display */}
                      <div className="flex items-baseline gap-1 text-right bg-background border border-border/50 px-4 py-2 rounded-xl shadow-sm">
                        <span className="text-3xl font-bold tabular-nums text-primary" style={{fontFamily:'Space Grotesk'}}>{totalScore}</span>
                        <span className="text-sm font-medium text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    
                    {/* Dynamic Sliders */}
                    <div className="space-y-6">
                      {scores.map((score, idx) => (
                        <div key={idx} className="bg-muted/20 border border-border/40 p-4 rounded-xl transition-colors hover:bg-muted/40">
                          <div className="flex items-center justify-between mb-4">
                            <Label className="text-base font-semibold text-foreground/90">{score.category_name}</Label>
                            <div className="bg-background border border-border/50 px-3 py-1 rounded-md shadow-sm">
                              <span className="text-lg font-bold tabular-nums text-primary" style={{fontFamily:'Space Grotesk'}}>{score.score}</span>
                              <span className="text-xs text-muted-foreground ml-1">/ {score.max_score}</span>
                            </div>
                          </div>
                          
                          <div className="px-1">
                            <input
                              type="range"
                              min="0"
                              max={score.max_score}
                              value={score.score}
                              onChange={(e) => {
                                const newScores = [...scores];
                                newScores[idx].score = parseInt(e.target.value);
                                setScores(newScores);
                              }}
                              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                              data-testid="mentor-rubric-slider"
                            />
                            <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2 px-1">
                              <span>0</span>
                              {score.max_score >= 10 && <span>{Math.floor(score.max_score / 4)}</span>}
                              {score.max_score >= 10 && <span>{Math.floor(score.max_score / 2)}</span>}
                              {score.max_score >= 15 && <span>{Math.floor(score.max_score * 3 / 4)}</span>}
                              <span>{score.max_score}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Feedback Section */}
                    <div className="pt-4 border-t border-border/40">
                      <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-primary" /> Overall Feedback
                      </Label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive, detailed feedback for the team. What did they do well? What can be improved?"
                        className="min-h-[140px] resize-y bg-background/50 focus-visible:ring-primary/30 transition-all text-base"
                        data-testid="mentor-feedback-textarea"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground font-medium">{feedback.length} characters written</p>
                        {feedback.length < 50 && <p className="text-xs text-amber-500 font-medium">Detailed feedback is highly recommended.</p>}
                      </div>
                    </div>

                    {/* Submit Action */}
                    <Button 
                      onClick={handleSubmit} 
                      disabled={submitting} 
                      className="w-full h-14 text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" 
                      data-testid="mentor-submit-evaluation-button"
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting Evaluation...</>
                      ) : existingEval ? (
                        <><Sparkles className="w-5 h-5 mr-2" /> Update Evaluation</>
                      ) : (
                        <><Save className="w-5 h-5 mr-2" /> Finalize & Submit Evaluation</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
