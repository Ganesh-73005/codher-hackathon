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
  LayoutList, AlertCircle, Sparkles
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
  const [roundAssignments, setRoundAssignments] = useState({});

  useEffect(() => {
    api('/api/teams').then(d => {
      setTeams(d.teams);
      const teamId = searchParams.get('team');
      if (teamId) {
        const found = d.teams.find(t => t.team_id === teamId);
        if (found) setSelectedTeam(found);
      }
    }).catch(console.error).finally(() => setLoading(false));
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

      api(`/api/submissions?team_id=${selectedTeam.team_id}&round_name=${encodeURIComponent(round)}`)
        .then(d => setSubmissions(d.submissions)).catch(console.error);
    }
  }, [selectedTeam, round]);

  const totalScore = scores.reduce((sum, s) => sum + (parseInt(s.score) || 0), 0);

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

  const currentSub = submissions[0];

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
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                            {team.team_name}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{team.team_id}</p>
                        </div>
                        <div className="flex gap-1.5 mt-1">
                          {[1, 2, 3].map(r => {
                            const evalStatus = team[`round_${r}_eval_status`];
                            const isEvaluated = evalStatus === 'evaluated';
                            return (
                              <Badge 
                                key={r}
                                variant="outline"
                                className={`text-[10px] h-5 px-1.5 border-0 font-medium ${
                                  isEvaluated 
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                R{r}
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

              {/* Submission Viewer */}
              {canEvaluateRound(round) && (
                <Accordion type="single" collapsible defaultValue="submissions" className="w-full">
                  <AccordionItem value="submissions" className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:border-b border-border/40">
                      <div className="flex items-center gap-3">
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
              {canEvaluateRound(round) && (
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
