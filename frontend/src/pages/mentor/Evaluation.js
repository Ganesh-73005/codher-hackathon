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
import { Save, Loader2, CheckCircle, FileText, Eye, Lock, GraduationCap } from 'lucide-react';
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
  }, []);

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
      toast.success('Evaluation submitted! Status email sent to team.');
      setExistingEval({ status: 'evaluated' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentSub = submissions[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Team Evaluation</h1>
        <p className="text-muted-foreground mt-1">Evaluate your assigned teams across rounds</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Team Selector Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Teams</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {teams.map(team => (
                  <div
                    key={team.team_id}
                    onClick={() => setSelectedTeam(team)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${selectedTeam?.team_id === team.team_id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    <p className="text-sm font-medium">{team.team_name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{team.team_id}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge className={`text-[10px] h-4 ${team.round_1_eval_status === 'evaluated' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>R1</Badge>
                      <Badge className={`text-[10px] h-4 ${team.round_2_eval_status === 'evaluated' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>R2</Badge>
                      <Badge className={`text-[10px] h-4 ${team.round_3_eval_status === 'evaluated' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>R3</Badge>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Panel */}
        <div className="lg:col-span-3">
          {!selectedTeam ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">Select a team to start evaluation</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Team Info */}
              <Card className="border-0 shadow-sm mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold" style={{fontFamily:'Space Grotesk'}}>{selectedTeam.team_name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedTeam.project_title} | {selectedTeam.college_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Lead: {selectedTeam.team_lead_name} ({selectedTeam.team_lead_email})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/mentor/rubrics" target="_blank">
                        <Button variant="outline" size="sm" className="gap-2">
                          <GraduationCap className="w-4 h-4" /> View Rubrics
                        </Button>
                      </Link>
                      <Badge variant="secondary">{selectedTeam.project_domain}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Round Tabs */}
              <Tabs value={round} onValueChange={setRound} data-testid="mentor-round-tabs">
                <TabsList>
                  {['Round 1', 'Round 2', 'Round 3'].map(r => (
                    <TabsTrigger
                      key={r}
                      value={r}
                      disabled={!canEvaluateRound(r)}
                      className="relative"
                    >
                      {r}
                      {!canEvaluateRound(r) && <Lock className="w-3 h-3 ml-1 inline" />}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {!canEvaluateRound(round) && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    You are not assigned to evaluate this team for {round}. Please contact the admin if you believe this is an error.
                  </p>
                </div>
              )}

              {/* Submission Viewer with Embeds */}
              <Accordion type="single" collapsible defaultValue="submissions" className="mt-4 mb-4">
                <AccordionItem value="submissions" className="border rounded-xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">View Submission</span>
                      {currentSub && <Badge variant="secondary" className="text-xs ml-2">Submitted</Badge>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {!currentSub ? (
                      <div className="text-center py-6">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No submission for {round} yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* PPT/PDF Preview */}
                        {(currentSub.ppt_link || currentSub.submission_link) && (
                          <GDrivePDFEmbed 
                            url={currentSub.ppt_link || currentSub.submission_link} 
                            title={`${round} - PPT / PDF Presentation`} 
                          />
                        )}
                        
                        {/* GitHub Link */}
                        {currentSub.github_link && (
                          <GitHubLinkCard 
                            url={currentSub.github_link} 
                            title={`${round} - GitHub Repository`} 
                          />
                        )}
                        
                        {/* Video Preview */}
                        {currentSub.video_link && (
                          <GDriveVideoEmbed 
                            url={currentSub.video_link} 
                            title={`${round} - Demo Video`} 
                          />
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Scoring */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Rubric Evaluation</CardTitle>
                    <div className="text-right">
                      <p className="text-3xl font-bold tabular-nums text-primary" style={{fontFamily:'Space Grotesk'}}>{totalScore}</p>
                      <p className="text-xs text-muted-foreground">/100</p>
                    </div>
                  </div>
                  {existingEval && <Badge variant="outline" className="mt-1"><CheckCircle className="w-3 h-3 mr-1" /> Previously evaluated</Badge>}
                </CardHeader>
                <CardContent className="space-y-6">
                  {scores.map((score, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{score.category_name}</Label>
                        <span className="text-lg font-semibold tabular-nums text-primary" style={{fontFamily:'Space Grotesk'}}>{score.score}/{score.max_score}</span>
                      </div>
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
                        className="w-full"
                        data-testid="mentor-rubric-slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        {score.max_score >= 10 && <span>{Math.floor(score.max_score / 4)}</span>}
                        {score.max_score >= 10 && <span>{Math.floor(score.max_score / 2)}</span>}
                        {score.max_score >= 15 && <span>{Math.floor(score.max_score * 3 / 4)}</span>}
                        <span>{score.max_score}</span>
                      </div>
                    </div>
                  ))}

                  <div>
                    <Label>Feedback</Label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback for the team..."
                      className="mt-1.5 min-h-[120px]"
                      data-testid="mentor-feedback-textarea"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{feedback.length} characters</p>
                  </div>

                  <Button onClick={handleSubmit} disabled={submitting || !canEvaluateRound(round)} className="w-full btn-press" size="lg" data-testid="mentor-submit-evaluation-button">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Save className="w-4 h-4 mr-2" /> Submit Evaluation</>}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
