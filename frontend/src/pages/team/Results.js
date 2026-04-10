import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { GDrivePDFEmbed, GDriveVideoEmbed, GitHubLinkCard } from '../../components/GDriveEmbed';
import { Lock, Trophy, Star } from 'lucide-react';

export default function TeamResults() {
  const [evaluations, setEvaluations] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [round, setRound] = useState('Round 1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api(`/api/evaluations?round_name=${encodeURIComponent(round)}`).then(d => setEvaluations(d.evaluations)),
      api(`/api/submissions?round_name=${encodeURIComponent(round)}`).then(d => setSubmissions(d.submissions)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, [round]);

  const evaluation = evaluations[0];
  const submission = submissions[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Results</h1>
        <p className="text-muted-foreground mt-1">View your evaluation results when released by admin</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <Tabs value={round} onValueChange={setRound}>
            <TabsList>
              <TabsTrigger value="Round 1">Round 1</TabsTrigger>
              <TabsTrigger value="Round 2">Round 2</TabsTrigger>
              <TabsTrigger value="Round 3">Round 3</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6">
            {loading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 skeleton-shimmer rounded-lg" />)}</div>
            ) : !evaluation ? (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No evaluation found for {round}</p>
                <p className="text-xs text-muted-foreground mt-1">Your submission hasn't been evaluated yet.</p>
              </div>
            ) : !evaluation.released ? (
              <div className="text-center py-12" data-testid="team-results-lock-state">
                <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2" style={{fontFamily:'Space Grotesk'}}>Results Not Yet Released</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your submission for {round} has been evaluated. Detailed scores will be released by the admin. 
                  Current status: <Badge className="ml-1 bg-green-100 text-green-700">{evaluation.status}</Badge>
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold" style={{fontFamily:'Space Grotesk'}}>
                      Total Score: <span className="text-primary">{evaluation.total_score}/100</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Results released for {round}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-3 mb-6">
                  {evaluation.scores?.map((score, i) => (
                    <Card key={i} className="border shadow-none">
                      <CardContent className="p-3 text-center">
                        <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold tabular-nums text-primary" style={{fontFamily:'Space Grotesk'}}>{score.score}</p>
                        <p className="text-xs text-muted-foreground">/20</p>
                        <p className="text-xs font-medium mt-1 leading-tight">{score.category_name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {evaluation.feedback && (
                  <Card className="border shadow-none mb-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Mentor Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{evaluation.feedback}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submission Preview (always visible to team for their own work) */}
      {submission && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{fontFamily:'Space Grotesk'}}>Your Submission for {round}</h2>
          
          {(submission.ppt_link || submission.submission_link) && (
            <GDrivePDFEmbed url={submission.ppt_link || submission.submission_link} title={`${round} - PPT / PDF`} />
          )}
          
          {submission.github_link && (
            <GitHubLinkCard url={submission.github_link} title={`${round} - GitHub Repository`} />
          )}
          
          {submission.video_link && (
            <GDriveVideoEmbed url={submission.video_link} title={`${round} - Demo Video`} />
          )}
        </div>
      )}
    </div>
  );
}
