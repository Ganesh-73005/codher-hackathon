import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Save, FileText, Sparkles, CheckCircle } from 'lucide-react';

export default function ProjectPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectData, setProjectData] = useState({
    project_title: '',
    project_description: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const data = await api('/api/team/project');
      if (data.project_title || data.project_description) {
        setProjectData({
          project_title: data.project_title || '',
          project_description: data.project_description || ''
        });
      }
    } catch (err) {
      console.error('Failed to load project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectData.project_title.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (!projectData.project_description.trim()) {
      toast.error('Project description is required');
      return;
    }

    setSaving(true);
    try {
      await api('/api/team/project', {
        method: 'PUT',
        body: JSON.stringify(projectData)
      });
      toast.success('Project details saved successfully!');
      setHasChanges(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save project details');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const wordCount = projectData.project_description.trim().split(/\s+/).filter(Boolean).length;
  const charCount = projectData.project_description.length;

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
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2" style={{ fontFamily: 'Space Grotesk' }}>
          <Sparkles className="w-8 h-8 text-primary" />
          Project Details
        </h1>
        <p className="text-muted-foreground mt-1">
          Share your project title and description with mentors
        </p>
      </div>

      <div className="grid gap-6">
        {/* Project Title */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Title
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter your project title..."
              value={projectData.project_title}
              onChange={(e) => handleChange('project_title', e.target.value)}
              className="text-lg"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {projectData.project_title.length}/200 characters
            </p>
          </CardContent>
        </Card>

        {/* Project Description */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your project, the problem it solves, technologies used, and key features..."
              value={projectData.project_description}
              onChange={(e) => handleChange('project_description', e.target.value)}
              className="min-h-[300px] resize-y"
              maxLength={2000}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{wordCount} words • {charCount}/2000 characters</span>
              {charCount > 1800 && (
                <Badge variant="outline" className="text-xs">
                  {2000 - charCount} characters remaining
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hasChanges && projectData.project_title && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Saved
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Project Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}
