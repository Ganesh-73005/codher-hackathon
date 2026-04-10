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
import { Save, Loader2, CheckCircle, FileText, Link as LinkIcon, GitBranch, Video, AlertTriangle, Info, AlertCircle } from 'lucide-react';

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
      toast.success(`Submission for ${round} saved!`);
      const d = await api('/api/submissions');
      setSubmissions(d.submissions);
    } catch (err) { toast.error(err.message); }
    setSubmitting(false);
  };

  const getDeadline = (roundName) => deadlines.find(d => d.round_name === roundName);
  const fields = ROUND_FIELDS[round] || [];

  // Check if a round is locked due to previous round not submitted
  const isRoundLocked = (roundName) => {
    const rounds = ['Round 1', 'Round 2', 'Round 3'];
    const currentIndex = rounds.indexOf(roundName);

    // Round 1 is never locked
    if (currentIndex === 0) return { locked: false, reason: '' };

    // Check all previous rounds
    for (let i = 0; i < currentIndex; i++) {
      const prevRound = rounds[i];
      const prevDeadline = getDeadline(prevRound);
      const prevSubmission = submissions.find(s => s.round_name === prevRound);

      // If previous round has a deadline
      if (prevDeadline && prevDeadline.submission_deadline) {
        const deadlineDate = new Date(prevDeadline.submission_deadline);
        const now = new Date();

        // If deadline passed and no submission, lock current round
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

  // Auto-switch to Round 1 if current round is locked
  React.useEffect(() => {
    if (currentRoundLock.locked && round !== 'Round 1') {
      setRound('Round 1');
      toast.warning(currentRoundLock.reason);
    }
  }, [currentRoundLock.locked, round, currentRoundLock.reason]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Submissions</h1>
        <p className="text-muted-foreground mt-1">Submit your project deliverables per round</p>
      </div>

      {/* Permission Notes */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium text-sm">Important Submission Guidelines:</p>
          <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
            <li>All PPT/PDF files must be uploaded to <strong>Google Drive</strong> in <strong>.pdf format</strong> only</li>
            <li>Set Google Drive sharing to <strong>"Anyone with the link can view"</strong></li>
            <li>For GitHub repositories, ensure the repo has <strong>public visibility</strong></li>
            <li>Demo videos must be uploaded to <strong>Google Drive</strong> with view access enabled</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <Tabs value={round} onValueChange={setRound}>
            <TabsList>
              <TabsTrigger value="Round 1">
                Round 1
              </TabsTrigger>
              <TabsTrigger
                value="Round 2"
                disabled={isRoundLocked('Round 2').locked}
                onClick={(e) => {
                  if (isRoundLocked('Round 2').locked) {
                    e.preventDefault();
                    toast.error(isRoundLocked('Round 2').reason);
                  }
                }}
              >
                Round 2 {isRoundLocked('Round 2').locked && '🔒'}
              </TabsTrigger>
              <TabsTrigger
                value="Round 3"
                disabled={isRoundLocked('Round 3').locked}
                onClick={(e) => {
                  if (isRoundLocked('Round 3').locked) {
                    e.preventDefault();
                    toast.error(isRoundLocked('Round 3').reason);
                  }
                }}
              >
                Round 3 {isRoundLocked('Round 3').locked && '🔒'}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6 space-y-4">
            {/* Round Locked Warning */}
            {currentRoundLock.locked && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <p className="font-medium text-sm">🔒 This round is locked</p>
                  <p className="text-xs mt-1">{currentRoundLock.reason}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Deadline info */}
            {getDeadline(round) && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                new Date(getDeadline(round).submission_deadline) < new Date()
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-muted/50'
              }`}>
                <FileText className={`w-4 h-4 ${
                  new Date(getDeadline(round).submission_deadline) < new Date()
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <span className={`text-sm ${
                    new Date(getDeadline(round).submission_deadline) < new Date()
                      ? 'text-red-700 font-semibold'
                      : ''
                  }`}>
                    Deadline: <strong>{getDeadline(round).submission_deadline || 'TBD'}</strong>
                  </span>
                  {new Date(getDeadline(round).submission_deadline) < new Date() && (
                    <p className="text-xs text-red-600 mt-0.5">⚠️ Deadline has passed - submissions are closed</p>
                  )}
                </div>
              </div>
            )}

            {existingSub && (
              <div className="p-3 rounded-lg bg-green-50 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Previously submitted on {new Date(existingSub.submitted_at || existingSub.updated_at).toLocaleString()}</span>
              </div>
            )}

            {/* Round-specific fields */}
            {fields.map((field) => {
              const Icon = field.icon;
              const isDisabled = currentRoundLock.locked || (getDeadline(round) && new Date(getDeadline(round).submission_deadline) < new Date());
              return (
                <div key={field.key}>
                  <Label className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {field.label}
                  </Label>
                  <div className="relative mt-1.5">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={`pl-9 ${errors[field.key] ? 'border-destructive' : ''}`}
                      disabled={isDisabled}
                    />
                  </div>
                  {errors[field.key] && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {errors[field.key]}
                    </p>
                  )}
                </div>
              );
            })}

            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                currentRoundLock.locked ||
                (getDeadline(round) && new Date(getDeadline(round).submission_deadline) < new Date())
              }
              className="w-full btn-press"
              size="lg"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : currentRoundLock.locked ? (
                <><AlertCircle className="w-4 h-4 mr-2" /> Round Locked</>
              ) : getDeadline(round) && new Date(getDeadline(round).submission_deadline) < new Date() ? (
                <><AlertTriangle className="w-4 h-4 mr-2" /> Deadline Passed</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Submission</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview of submitted content */}
      {existingSub && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{fontFamily:'Space Grotesk'}}>Your Submission Preview</h2>
          
          {(existingSub.ppt_link || existingSub.submission_link) && (
            <GDrivePDFEmbed url={existingSub.ppt_link || existingSub.submission_link} title={`${round} - PPT / PDF`} />
          )}
          
          {existingSub.github_link && (
            <GitHubLinkCard url={existingSub.github_link} title={`${round} - GitHub Repository`} />
          )}
          
          {existingSub.video_link && (
            <GDriveVideoEmbed url={existingSub.video_link} title={`${round} - Demo Video`} />
          )}
        </div>
      )}

      {/* All Submissions Overview */}
      <Card className="border-0 shadow-sm mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['Round 1', 'Round 2', 'Round 3'].map(r => {
              const sub = submissions.find(s => s.round_name === r);
              const fieldCount = (ROUND_FIELDS[r] || []).length;
              const filledCount = sub ? (ROUND_FIELDS[r] || []).filter(f => sub[f.key]).length : 0;
              return (
                <div key={r} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{r}</p>
                    {sub && (
                      <p className="text-xs text-muted-foreground">
                        {filledCount}/{fieldCount} links submitted
                      </p>
                    )}
                  </div>
                  <Badge className={sub ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                    {sub ? 'Submitted' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
