import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { GDrivePDFEmbed, GDriveVideoEmbed, GitHubLinkCard } from '../../components/GDriveEmbed';
import { toast } from 'sonner';
import { 
  Save, Loader2, CheckCircle, FileText, Link as LinkIcon, 
  GitBranch, Video, AlertTriangle, Info, AlertCircle, 
  CloudUpload, Lock, CheckCircle2, ChevronRight
} from 'lucide-react';

const ROUND_FIELDS = {
  'Round 1': [{ key: 'ppt_link', label: 'PPT / PDF Link (Google Drive)', icon: FileText, placeholder: 'https://drive.google.com/file/d/.../view' }],
  'Round 2': [
    { key: 'ppt_link', label: 'PPT / PDF Link (Google Drive)', icon: FileText, placeholder: 'https://drive.google.com/file/d/.../view' },
    { key: 'github_link', label: 'GitHub Repository Link', icon: GitBranch, placeholder: 'https://github.com/username/repo' },
  ],
  'Round 3': [
    { key: 'ppt_link', label: 'PPT / PDF Link (Google Drive)', icon: FileText, placeholder: 'https://drive.google.com/file/d/.../view' },
    { key: 'github_link', label: 'GitHub Repository Link', icon: GitBranch, placeholder: 'https://github.com/username/repo' },
    { key: 'video_link', label: 'Demo Video Link (Google Drive)', icon: Video, placeholder: 'https://drive.google.com/file/d/.../view' },
  ],
};

export default function TeamSubmissions() {
  const { user } = useAuth();
  const [round, setRound] = useState('Round 1');
  const [formData, setFormData] = useState({ ppt_link: '', github_link: '', video_link: '' });
  const [submissions, setSubmissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deadlines, setDeadlines] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api('/api/submissions').then(d => setSubmissions(d.submissions)).catch(console.error);
    api('/api/deadlines').then(d => setDeadlines(d.deadlines)).catch(console.error);
  }, []);

  const existingSub = submissions.find(s => s.round_name === round);

  useEffect(() => {
    if (existingSub) {
      setFormData({
        ppt_link: existingSub.ppt_link || existingSub.submission_link || '',
        github_link: existingSub.github_link || '',
        video_link: existingSub.video_link || '',
      });
    } else {
      setFormData({ ppt_link: '', github_link: '', video_link: '' });
    }
    setErrors({});
  }, [round, existingSub?.ppt_link, existingSub?.github_link, existingSub?.video_link]);

  const validate = () => {
    const errs = {};
    const fields = ROUND_FIELDS[round] || [];
    fields.forEach(f => {
      const val = formData[f.key];
      if (!val) {
        errs[f.key] = 'This field is required';
      } else if (f.key === 'ppt_link' && !val.match(/https?:\/\/(drive\.google\.com|docs\.google\.com)/)) {
        errs[f.key] = 'Must be a Google Drive link';
      } else if (f.key === 'video_link' && !val.match(/https?:\/\/(drive\.google\.com|docs\.google\.com)/)) {
        errs[f.key] = 'Must be a Google Drive link';
      } else if (f.key === 'github_link' && !val.match(/https?:\/\/(github\.com|gitlab\.com)/)) {
        errs[f.key] = 'Must be a valid GitHub/GitLab URL';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ round_name: round, ...formData }),
      });
      toast.success(`Submission for ${round} saved successfully!`);
      const d = await api('/api/submissions');
      setSubmissions(d.submissions);
    } catch (err) { toast.error(err.message); }
    setSubmitting(false);
  };

  const getDeadline = (roundName) => deadlines.find(d => d.round_name === roundName);
  const fields = ROUND_FIELDS[round] || [];

  const isRoundLocked = (roundName) => {
    const rounds = ['Round 1', 'Round 2', 'Round 3'];
    const currentIndex = rounds.indexOf(roundName);

    if (currentIndex === 0) return { locked: false, reason: '' };

    for (let i = 0; i < currentIndex; i++) {
      const prevRound = rounds[i];
      const prevDeadline = getDeadline(prevRound);
      const prevSubmission = submissions.find(s => s.round_name === prevRound);

      if (prevDeadline && prevDeadline.submission_deadline) {
        const deadlineDate = new Date(prevDeadline.submission_deadline);
        const now = new Date();

        if (now < deadlineDate) {
          return {
            locked: true,
            reason: `${prevRound} is still ongoing. Wait for ${prevRound} deadline to pass before accessing ${roundName}.`
          };
        }

        if (now > deadlineDate && !prevSubmission) {
          return {
            locked: true,
            reason: `${prevRound} deadline passed without submission. Complete ${prevRound} first.`
          };
        }
      }
    }

    return { locked: false, reason: '' };
  };

  const currentRoundLock = isRoundLocked(round);

  React.useEffect(() => {
    if (currentRoundLock.locked && round !== 'Round 1') {
      setRound('Round 1');
      toast.warning(currentRoundLock.reason);
    }
  }, [currentRoundLock.locked, round, currentRoundLock.reason]);

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header Section */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <CloudUpload className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium tracking-wider text-primary uppercase">Deliverables</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" style={{fontFamily:'Space Grotesk'}}>
          Submissions
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Upload and manage your project deliverables for each round.
        </p>
      </div>

      {/* Modern Info Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-500/5 border border-blue-500/20 p-6">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-blue-900 dark:text-blue-300 mb-2">Submission Guidelines</h3>
            <ul className="text-sm text-blue-800/80 dark:text-blue-200/80 space-y-1.5 list-disc list-inside">
              <li>All PPT/PDF files must be uploaded to <strong className="font-semibold text-blue-900 dark:text-blue-200">Google Drive</strong> in <strong className="font-semibold text-blue-900 dark:text-blue-200">.pdf format</strong> only.</li>
              <li>Set Google Drive sharing to <strong className="font-semibold text-blue-900 dark:text-blue-200">"Anyone with the link can view"</strong>.</li>
              <li>For GitHub repositories, ensure the repo has <strong className="font-semibold text-blue-900 dark:text-blue-200">public visibility</strong>.</li>
              <li>Demo videos must be uploaded to <strong className="font-semibold text-blue-900 dark:text-blue-200">Google Drive</strong> with view access enabled.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-border/40 bg-muted/20 px-4 py-3">
              <Tabs value={round} onValueChange={setRound} className="w-full">
                <TabsList className="w-full bg-muted/50 p-1">
                  <TabsTrigger
                    value="Round 1"
                    className="flex-1 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:ring-2 data-[state=active]:ring-primary/40 data-[state=active]:ring-offset-2 data-[state=active]:ring-offset-background transition-all"
                  >
                    Round 1
                  </TabsTrigger>
                  <TabsTrigger
                    value="Round 2"
                    className="flex-1 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:ring-2 data-[state=active]:ring-primary/40 data-[state=active]:ring-offset-2 data-[state=active]:ring-offset-background transition-all"
                    disabled={isRoundLocked('Round 2').locked}
                    onClick={(e) => {
                      if (isRoundLocked('Round 2').locked) {
                        e.preventDefault();
                        toast.error(isRoundLocked('Round 2').reason);
                      }
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      Round 2 {isRoundLocked('Round 2').locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="Round 3"
                    className="flex-1 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:ring-2 data-[state=active]:ring-primary/40 data-[state=active]:ring-offset-2 data-[state=active]:ring-offset-background transition-all"
                    disabled={isRoundLocked('Round 3').locked}
                    onClick={(e) => {
                      if (isRoundLocked('Round 3').locked) {
                        e.preventDefault();
                        toast.error(isRoundLocked('Round 3').reason);
                      }
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      Round 3 {isRoundLocked('Round 3').locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Status Banners */}
                {currentRoundLock.locked && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-orange-900 dark:text-orange-300 text-sm">This round is currently locked</p>
                      <p className="text-sm text-orange-800/80 dark:text-orange-200/80 mt-1">{currentRoundLock.reason}</p>
                    </div>
                  </div>
                )}

                {!currentRoundLock.locked && getDeadline(round) && (
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${
                    new Date(getDeadline(round).submission_deadline) < new Date()
                      ? 'bg-rose-500/5 border-rose-500/20'
                      : 'bg-muted/30 border-border/50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        new Date(getDeadline(round).submission_deadline) < new Date() ? 'bg-rose-500/10' : 'bg-muted'
                      }`}>
                        <FileText className={`w-4 h-4 ${
                          new Date(getDeadline(round).submission_deadline) < new Date() ? 'text-rose-600' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Submission Deadline</p>
                        <p className={`text-sm font-semibold ${
                          new Date(getDeadline(round).submission_deadline) < new Date() ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                        }`}>
                          {getDeadline(round).submission_deadline
                            ? new Date(getDeadline(round).submission_deadline).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
                              })
                            : 'TBD'}
                        </p>
                      </div>
                    </div>
                    {new Date(getDeadline(round).submission_deadline) < new Date() && (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">Closed</Badge>
                    )}
                  </div>
                )}

                {existingSub && !currentRoundLock.locked && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">Successfully Submitted</p>
                      <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
                        Last updated on {new Date(existingSub.submitted_at || existingSub.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-5">
                  {fields.map((field) => {
                    const Icon = field.icon;
                    const isPassed = getDeadline(round) && new Date(getDeadline(round).submission_deadline) < new Date();
                    const isDisabled = currentRoundLock.locked || isPassed;
                    
                    return (
                      <div key={field.key} className="space-y-2 group">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          {field.label}
                        </Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                          <Input
                            value={formData[field.key]}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className={`pl-9 bg-background/50 focus-visible:ring-primary/30 transition-all ${
                              errors[field.key] ? 'border-destructive focus-visible:ring-destructive/30' : 'hover:border-border/80'
                            }`}
                            disabled={isDisabled}
                          />
                        </div>
                        {errors[field.key] && (
                          <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> {errors[field.key]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit CTA */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    currentRoundLock.locked ||
                    (getDeadline(round) && new Date(getDeadline(round).submission_deadline) < new Date())
                  }
                  className="w-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 h-12 text-base font-medium mt-4"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</>
                  ) : currentRoundLock.locked ? (
                    <><Lock className="w-5 h-5 mr-2" /> Round Locked</>
                  ) : getDeadline(round) && new Date(getDeadline(round).submission_deadline) < new Date() ? (
                    <><AlertTriangle className="w-5 h-5 mr-2" /> Deadline Passed</>
                  ) : existingSub ? (
                    <><Save className="w-5 h-5 mr-2" /> Update Submission</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" /> Submit Deliverables</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Overview Tracker */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-4" style={{fontFamily:'Space Grotesk'}}>Progress Tracker</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {['Round 1', 'Round 2', 'Round 3'].map((r, index) => {
                const sub = submissions.find(s => s.round_name === r);
                const fieldCount = (ROUND_FIELDS[r] || []).length;
                const filledCount = sub ? (ROUND_FIELDS[r] || []).filter(f => sub[f.key]).length : 0;
                
                return (
                  <Card key={r} className="border border-border/50 bg-card/50 overflow-hidden">
                    <div className={`h-1 w-full ${sub ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-sm">{r}</span>
                        {sub ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 h-5 px-1.5 text-[10px]">Submitted</Badge>
                        ) : (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground">Pending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sub ? `${filledCount}/${fieldCount} links provided` : 'Awaiting submission'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight mb-2" style={{fontFamily:'Space Grotesk'}}>Live Preview</h2>
            
            {!existingSub ? (
              <div className="border border-dashed border-border/60 rounded-2xl p-8 text-center bg-muted/10 flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No submission yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Submit links to preview your content here</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(existingSub.ppt_link || existingSub.submission_link) && (
                  <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm bg-card">
                    <div className="bg-muted/30 px-3 py-2 border-b border-border/50 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium">Presentation PDF</span>
                    </div>
                    <GDrivePDFEmbed url={existingSub.ppt_link || existingSub.submission_link} title={`${round} - PPT / PDF`} />
                  </div>
                )}
                
                {existingSub.github_link && (
                  <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm bg-card">
                    <GitHubLinkCard url={existingSub.github_link} title={`${round} - GitHub Repository`} />
                  </div>
                )}
                
                {existingSub.video_link && (
                  <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm bg-card">
                    <div className="bg-muted/30 px-3 py-2 border-b border-border/50 flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium">Demo Video</span>
                    </div>
                    <GDriveVideoEmbed url={existingSub.video_link} title={`${round} - Demo Video`} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
