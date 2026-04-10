import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trophy, Loader2, CheckCircle, Lock } from 'lucide-react';

export default function ReleaseResults() {
  const [flags, setFlags] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(null);

  const fetchData = async () => {
    try {
      const data = await api('/api/release-status');
      setFlags(data.flags);
      setLogs(data.logs);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRelease = async (roundName, release) => {
    setReleasing(roundName);
    try {
      await api('/api/release-results', {
        method: 'POST',
        body: JSON.stringify({ round_name: roundName, release }),
      });
      toast.success(`Results ${release ? 'released' : 'revoked'} for ${roundName}`);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReleasing(null);
    }
  };

  const rounds = ['Round 1', 'Round 2', 'Round 3', 'Global'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'Space Grotesk'}}>Release Results</h1>
        <p className="text-muted-foreground mt-1">Control when teams can see their evaluation scores</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 skeleton-shimmer rounded-xl" />)}</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {rounds.map((round) => {
              const isReleased = flags[round] || false;
              return (
                <Card key={round} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isReleased ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                        <div>
                          <p className="font-semibold" style={{fontFamily:'Space Grotesk'}}>{round}</p>
                          <p className="text-xs text-muted-foreground">{isReleased ? 'Results are visible to teams' : 'Results are hidden from teams'}</p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center gap-2" data-testid="release-round-switch">
                            <Switch checked={isReleased} />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-testid="release-confirm-dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>{isReleased ? 'Revoke' : 'Release'} {round} Results?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {isReleased
                                ? `Teams will no longer be able to see their scores for ${round}.`
                                : `Teams will be able to see their evaluation scores for ${round}. An email notification will be sent to all active teams.`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRelease(round, !isReleased)} disabled={releasing === round}>
                              {releasing === round ? <Loader2 className="w-4 h-4 animate-spin" /> : isReleased ? 'Revoke Results' : 'Release Results'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Audit Log */}
          {logs.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Release Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <Table data-testid="release-audit-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Round</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Released By</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{log.round_name}</TableCell>
                          <TableCell><Badge variant={log.action === 'released' ? 'default' : 'secondary'}>{log.action}</Badge></TableCell>
                          <TableCell className="text-xs">{log.released_by_name || log.released_by}</TableCell>
                          <TableCell className="text-xs">{log.released_at ? new Date(log.released_at).toLocaleString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
