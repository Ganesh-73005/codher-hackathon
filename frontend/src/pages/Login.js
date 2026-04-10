import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LogIn, Shield, Users, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'mentor') navigate('/mentor');
      else navigate('/team');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient bg-gradient-to-br from-violet-50 to-purple-50 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl" style={{fontFamily:'Space Grotesk'}}>C</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight" style={{fontFamily:'Space Grotesk', color:'hsl(262 83% 58%)'}}>CodHER</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{fontFamily:'Space Grotesk'}}>Hackathon Platform</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            A 24hrs Women only Online hackathon designed to elevate the future of innovations.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-white/80 shadow-sm flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Admin Control</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-white/80 shadow-sm flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Mentor Tools</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-white/80 shadow-sm flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Team Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg" style={{fontFamily:'Space Grotesk'}}>C</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{fontFamily:'Space Grotesk', color:'hsl(262 83% 58%)'}}>CodHER</h1>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl" style={{fontFamily:'Space Grotesk'}}>Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedRole} onValueChange={setSelectedRole} className="mb-6">
                <TabsList className="grid w-full grid-cols-3" data-testid="login-role-tabs">
                  <TabsTrigger value="admin" className="text-xs sm:text-sm">Admin</TabsTrigger>
                  <TabsTrigger value="mentor" className="text-xs sm:text-sm">Mentor</TabsTrigger>
                  <TabsTrigger value="team" className="text-xs sm:text-sm">Team</TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg" data-testid="login-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full btn-press"
                  disabled={loading}
                  data-testid="login-submit-button"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                {selectedRole === 'admin' ? 'Use admin credentials to login' :
                 selectedRole === 'mentor' ? 'Use mentor credentials from import email' :
                 'Use team credentials from import email'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
