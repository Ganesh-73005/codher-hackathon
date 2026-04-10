import React, { useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Upload, Link, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportData() {
  const [source, setSource] = useState('file');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [importId, setImportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setPreview(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await api('/api/import/upload', { method: 'POST', body: formData, headers: {} });
      setPreview(data.preview);
      setImportId(data.import_id);
      toast.success('File parsed successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSheetsImport = async () => {
    if (!sheetsUrl) return;
    setLoading(true);
    setPreview(null);
    setResult(null);
    try {
      const data = await api('/api/import/google-sheets', { method: 'POST', body: JSON.stringify({ url: sheetsUrl }) });
      setPreview(data.preview);
      setImportId(data.import_id);
      toast.success('Sheet imported successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (sendEmails = true) => {
    if (!importId) return;
    setConfirming(true);
    try {
      const data = await api(`/api/import/confirm/${importId}`, {
        method: 'POST',
        body: JSON.stringify({ send_emails: sendEmails }),
      });
      setResult(data);
      toast.success('Import confirmed!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Import Data</h1>
        <p className="text-muted-foreground mt-1">Upload Excel file or import from Google Sheets</p>
      </div>

      {/* Source Selection */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="pt-6">
          <Tabs value={source} onValueChange={setSource} data-testid="import-source-tabs">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="file"><FileSpreadsheet className="w-4 h-4 mr-2" /> Excel File</TabsTrigger>
              <TabsTrigger value="url"><Link className="w-4 h-4 mr-2" /> Google Sheets</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Drop your Excel file here or click to browse</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="import-excel-upload-input"
                />
                <Button onClick={() => fileRef.current?.click()} disabled={loading} variant="outline">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing...</> : 'Select File'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Google Sheets URL</Label>
                  <Input
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    className="mt-1.5"
                    data-testid="import-sheets-url-input"
                  />
                </div>
                <Button onClick={handleSheetsImport} disabled={loading || !sheetsUrl} className="mt-7 btn-press">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle style={{fontFamily:'Space Grotesk'}}>Import Preview</CardTitle>
            <CardDescription>Review data before confirming import</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xl font-semibold text-purple-700">{preview.teams_count}</p>
                <p className="text-xs text-purple-600">Teams</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-semibold text-blue-700">{preview.mentors_count}</p>
                <p className="text-xs text-blue-600">Mentors</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-semibold text-green-700">{preview.deadlines_count}</p>
                <p className="text-xs text-green-600">Deadlines</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-xl font-semibold text-amber-700">{preview.rubrics_count}</p>
                <p className="text-xs text-amber-600">Rubrics</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-3 text-center">
                <p className="text-xl font-semibold text-rose-700">{preview.settings_count}</p>
                <p className="text-xs text-rose-600">Settings</p>
              </div>
            </div>

            {/* Errors */}
            {preview.errors?.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Validation Errors ({preview.errors.length})</p>
                  <ul className="text-xs space-y-0.5">
                    {preview.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {preview.warnings?.length > 0 && (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {preview.warnings.map((w, i) => <p key={i} className="text-xs">{w}</p>)}
                </AlertDescription>
              </Alert>
            )}

            {/* Teams Preview Table */}
            {preview.teams?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Teams Preview</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table data-testid="import-preview-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Lead</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Domain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.teams.map((t, i) => (
                        <TableRow key={i} className="table-row-hover">
                          <TableCell className="font-mono text-xs">{t.team_id}</TableCell>
                          <TableCell className="font-medium">{t.team_name}</TableCell>
                          <TableCell>{t.team_lead_name}</TableCell>
                          <TableCell className="text-xs">{t.team_lead_email}</TableCell>
                          <TableCell className="text-xs">{t.college_name}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{t.project_domain || '-'}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Mentors Preview */}
            {preview.mentors?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Mentors Preview</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Expertise</TableHead>
                        <TableHead>Capacity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.mentors.map((m, i) => (
                        <TableRow key={i} className="table-row-hover">
                          <TableCell className="font-mono text-xs">{m.mentor_id}</TableCell>
                          <TableCell className="font-medium">{m.mentor_name}</TableCell>
                          <TableCell className="text-xs">{m.mentor_email}</TableCell>
                          <TableCell>{m.expertise}</TableCell>
                          <TableCell>{m.max_team_capacity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Confirm */}
            {!result && preview.errors?.length === 0 && (
              <div className="flex gap-3 mt-6">
                <Button onClick={() => handleConfirm(true)} disabled={confirming} className="btn-press" data-testid="import-confirm-button">
                  {confirming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Confirm & Send Emails</>}
                </Button>
                <Button variant="outline" onClick={() => handleConfirm(false)} disabled={confirming}>
                  Confirm Without Emails
                </Button>
              </div>
            )}

            {/* Result */}
            {result && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <p className="font-medium">Import Confirmed!</p>
                  <p className="text-xs mt-1">Teams: {result.created?.teams} | Mentors: {result.created?.mentors} | Users: {result.created?.users} | Emails Sent: {result.created?.email_sent}</p>
                  {result.errors?.length > 0 && <p className="text-xs text-red-600 mt-1">Errors: {result.errors.join(', ')}</p>}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
