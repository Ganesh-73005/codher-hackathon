import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  GraduationCap, Trophy, BarChart3, Clock, 
  Lightbulb, CheckCircle2, Target, Scale, ListChecks
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Hardcoded rubrics data from CSV
export const RUBRICS_DATA = {
  categories: [
    {
      name: "Innovation & Creativity",
      weightage: 20,
      maxScore: 20,
      color: "#8b5cf6",
      guidelines: [
        { range: "0-5", description: "Replicates existing solutions with minimal to no innovation." },
        { range: "6-10", description: "Common approach with minor creative variations; still adds value but lacks originality." },
        { range: "11-15", description: "Some level of originality; modifies existing ideas innovatively but not a groundbreaking concept." },
        { range: "16-20", description: "Highly novel idea with a unique approach; demonstrates out-of-the-box thinking beyond standard solutions." }
      ]
    },
    {
      name: "Technical Implementation",
      weightage: 25,
      maxScore: 25,
      color: "#3b82f6",
      guidelines: [
        { range: "0-5", description: "Poor execution; major issues in implementation, code structure, or logic." },
        { range: "6-10", description: "Limited technical depth; incomplete or inefficient implementation." },
        { range: "11-15", description: "Basic technical implementation with some functional aspects; may lack complexity or robustness." },
        { range: "16-20", description: "Good technical depth, with a structured approach but some room for optimization or improvement in execution." },
        { range: "21-25", description: "Advanced implementation with well-structured code, efficient algorithms, and seamless execution. Uses appropriate frameworks and technologies effectively." }
      ]
    },
    {
      name: "Functionality & Completion",
      weightage: 20,
      maxScore: 20,
      color: "#10b981",
      guidelines: [
        { range: "0-5", description: "Major non-functionality; project does not perform as described." },
        { range: "6-10", description: "Partially functional; critical features missing or incomplete." },
        { range: "11-15", description: "Mostly functional with minor bugs or missing non-critical features." },
        { range: "16-20", description: "Fully functional with all core features working as intended. Minimal to no bugs." }
      ]
    },
    {
      name: "Presentation & Communication",
      weightage: 15,
      maxScore: 15,
      color: "#f59e0b",
      guidelines: [
        { range: "0-5", description: "Poor presentation with minimal explanation or unclear communication." },
        { range: "6-9", description: "Basic presentation; lacks strong delivery or clear articulation of project details." },
        { range: "10-12", description: "Good explanation, though some aspects may lack depth or clarity." },
        { range: "13-15", description: "Clear, well-structured, and engaging presentation; strong articulation of problem, solution, and technical details." }
      ]
    },
    {
      name: "Impact & Relevance to Track",
      weightage: 10,
      maxScore: 10,
      color: "#ec4899",
      guidelines: [
        { range: "0-2", description: "Misaligned with the track; unclear purpose or minimal real-world application." },
        { range: "3-5", description: "Somewhat related to the track but lacks clarity in impact." },
        { range: "6-8", description: "Relevant to the track but may have a limited real-world application." },
        { range: "9-10", description: "Strong alignment with the chosen track and significant real-world impact potential." }
      ]
    },
    {
      name: "Code Quality & Scalability",
      weightage: 10,
      maxScore: 10,
      color: "#06b6d4",
      guidelines: [
        { range: "0-2", description: "Poorly structured, unreadable, or inefficient code with minimal scalability." },
        { range: "3-5", description: "Code works but lacks proper structure, readability, or scalability considerations." },
        { range: "6-8", description: "Good structure with some improvements needed in documentation or optimization." },
        { range: "9-10", description: "Clean, modular, well-documented code with excellent scalability." }
      ]
    }
  ],
  totalMaxScore: 100,
  judgingNotes: [
    "Distribute scores fairly across teams to differentiate strong projects from weaker ones.",
    "Provide brief feedback in the comments for reference.",
    "In case of a tie, consider Innovation & Creativity + Technical Implementation as tiebreakers.",
    "All presentations are 8 minutes long: 6 minutes presentation + 2 minutes Q&A session."
  ]
};

// Custom modern tooltip for the pie charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <p className="text-sm font-semibold text-foreground">{payload[0].payload.fullName || payload[0].name}</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground ml-5">
          Value: <span className="text-foreground">{payload[0].value}{payload[0].name.includes('%') ? '' : ''}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Rubrics() {
  // Prepare data for pie charts
  const weightageData = RUBRICS_DATA.categories.map(cat => ({
    name: cat.name,
    fullName: cat.name,
    value: cat.weightage,
    color: cat.color
  }));

  const categoryBreakdown = RUBRICS_DATA.categories.map(cat => ({
    name: cat.name.split(' ')[0], // Short name for chart
    fullName: cat.name,
    value: cat.maxScore,
    color: cat.color
  }));

  const topCategories = RUBRICS_DATA.categories
    .filter(c => c.weightage >= 20)
    .map(cat => ({
      name: cat.name.substring(0, 15) + '...',
      fullName: cat.name,
      value: cat.weightage,
      color: cat.color
    }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        fontSize="12" 
        fontWeight="bold"
        className="drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header Section */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium tracking-wider text-primary uppercase">Deep Dive</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" style={{fontFamily:'Space Grotesk'}}>
          Evaluation Rubrics
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Detailed scoring guidelines and judging criteria for the Hackathon Finals.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Categories</p>
                <p className="text-3xl font-bold text-foreground">{RUBRICS_DATA.categories.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Maximum Score</p>
                <p className="text-3xl font-bold text-foreground">{RUBRICS_DATA.totalMaxScore}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Presentation Time</p>
                <p className="text-3xl font-bold text-foreground">8 <span className="text-xl text-muted-foreground font-medium">min</span></p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart 1: Category Weightage Distribution */}
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/40">
            <CardTitle className="text-base font-semibold" style={{fontFamily:'Space Grotesk'}}>Weightage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={weightageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  dataKey="value"
                  stroke="var(--background)"
                  strokeWidth={2}
                  className="focus:outline-none"
                >
                  {weightageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {weightageData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: item.color}} />
                    <span className="truncate font-medium text-muted-foreground">{item.name.substring(0, 22)}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Score Distribution */}
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/40">
            <CardTitle className="text-base font-semibold" style={{fontFamily:'Space Grotesk'}}>Max Scores by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  dataKey="value"
                  stroke="var(--background)"
                  strokeWidth={2}
                  className="focus:outline-none"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center">
              <Badge variant="secondary" className="bg-muted font-medium py-1">
                Total Output: {RUBRICS_DATA.totalMaxScore} points
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Top Priority Categories */}
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/40">
            <CardTitle className="text-base font-semibold" style={{fontFamily:'Space Grotesk'}}>High Priority (≥20%)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  dataKey="value"
                  stroke="var(--background)"
                  strokeWidth={2}
                  className="focus:outline-none"
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {topCategories.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: item.color}} />
                    <span className="font-medium text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Rubrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2" style={{fontFamily:'Space Grotesk'}}>
          <ListChecks className="w-6 h-6 text-primary" />
          Detailed Scoring Guidelines
        </h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {RUBRICS_DATA.categories.map((category, idx) => (
            <Card 
              key={idx} 
              className="relative overflow-hidden border border-border/50 shadow-sm bg-card/30 hover:bg-card/60 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: category.color }} />
              <CardContent className="p-6 pl-8">
                <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-border/40">
                  <h3 className="text-lg font-bold text-foreground leading-tight" style={{fontFamily:'Space Grotesk'}}>
                    {category.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className="shrink-0 font-bold border-0 shadow-sm" 
                    style={{backgroundColor: `${category.color}15`, color: category.color}}
                  >
                    {category.maxScore} pts
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {category.guidelines.map((guideline, gidx) => (
                    <div 
                      key={gidx} 
                      className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/50 transition-all duration-200"
                    >
                      <Badge 
                        variant="outline" 
                        className="shrink-0 font-mono text-[11px] h-6 mt-0.5 border"
                        style={{
                          borderColor: `${category.color}30`, 
                          color: category.color,
                          backgroundColor: `${category.color}05`
                        }}
                      >
                        {guideline.range}
                      </Badge>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors leading-relaxed">
                        {guideline.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Judging Notes Panel */}
      <Card className="border border-amber-500/20 shadow-sm bg-amber-500/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <CardHeader className="pb-3 border-b border-amber-500/10">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-300" style={{fontFamily:'Space Grotesk'}}>
            <Lightbulb className="w-5 h-5 text-amber-500" /> Important Notes for Judges
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid md:grid-cols-2 gap-4">
            {RUBRICS_DATA.judgingNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                <div className="mt-0.5 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium text-amber-950 dark:text-amber-200/90 leading-relaxed">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
