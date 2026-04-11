import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  GraduationCap, Award, Target, Clock, Scale, 
  Lightbulb, CheckCircle2, BarChart3, ChevronRight 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Same rubrics data from shared component
const RUBRICS_DATA = {
  categories: [
    { name: "Innovation & Creativity", weightage: 20, maxScore: 20, color: "#8b5cf6" },
    { name: "Technical Implementation", weightage: 25, maxScore: 25, color: "#3b82f6" },
    { name: "Functionality & Completion", weightage: 20, maxScore: 20, color: "#10b981" },
    { name: "Presentation & Communication", weightage: 15, maxScore: 15, color: "#f59e0b" },
    { name: "Impact & Relevance to Track", weightage: 10, maxScore: 10, color: "#ec4899" },
    { name: "Code Quality & Scalability", weightage: 10, maxScore: 10, color: "#06b6d4" }
  ],
  totalMaxScore: 100,
  judgingNotes: [
    "Distribute scores fairly across teams to differentiate strong projects from weaker ones.",
    "Provide brief feedback in the comments for reference.",
    "In case of a tie, consider Innovation & Creativity + Technical Implementation as tiebreakers.",
    "All presentations are 8 minutes long: 6 minutes presentation + 2 minutes Q&A session."
  ]
};

export default function RubricsSimple() {
  const chartData = RUBRICS_DATA.categories.map(cat => ({
    name: cat.name,
    value: cat.maxScore,
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
        fontSize="13" 
        fontWeight="bold"
        className="drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom Tooltip for the Pie Chart to match the modern theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
            <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground ml-5">
            Maximum Score: <span className="text-foreground">{payload[0].value} points</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header Section */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium tracking-wider text-primary uppercase">Evaluation Criteria</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" style={{fontFamily:'Space Grotesk'}}>
          Judging Rubrics
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          A comprehensive breakdown of how your project will be evaluated and scored.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 flex flex-col">
          <CardHeader className="pb-2 border-b border-border/40">
            <CardTitle className="text-lg flex items-center justify-between" style={{fontFamily:'Space Grotesk'}}>
              Score Distribution
              <Badge variant="secondary" className="font-semibold bg-primary/10 text-primary border-0">Total: 100 pts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6">
            <div className="w-full h-[320px] relative">
              {/* Decorative background circle */}
              <div className="absolute inset-0 m-auto w-[200px] h-[200px] rounded-full border border-muted/50 -z-10" />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    innerRadius={65}
                    outerRadius={120}
                    dataKey="value"
                    stroke="var(--background)"
                    strokeWidth={3}
                    className="focus:outline-none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Categories */}
        <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-lg" style={{fontFamily:'Space Grotesk'}}>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {RUBRICS_DATA.categories.map((category, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105" 
                      style={{backgroundColor: `${category.color}15`}}
                    >
                      <div 
                        className="w-3 h-3 rounded-full relative"
                        style={{ backgroundColor: category.color }}
                      >
                        {/* Glow effect */}
                        <div 
                          className="absolute inset-0 rounded-full blur-[4px] opacity-60"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className="font-bold border-0 shadow-sm transition-transform duration-300 group-hover:scale-105" 
                      style={{backgroundColor: `${category.color}15`, color: category.color}}
                    >
                      {category.maxScore} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Panels Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Key Points for Teams */}
        <Card className="border border-blue-500/20 shadow-sm bg-blue-500/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-300" style={{fontFamily:'Space Grotesk'}}>
              <Award className="w-5 h-5 text-blue-500" /> Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-blue-500/10 mt-0.5">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-950 dark:text-blue-200 block mb-0.5">Total Structure</span>
                  <span className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">Evaluation spans across 6 distinct categories totaling exactly 100 points.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-blue-500/10 mt-0.5">
                  <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-950 dark:text-blue-200 block mb-0.5">Highest Weightage</span>
                  <span className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">Focus heavily on Technical Implementation, which carries the maximum individual weight (25 points).</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-blue-500/10 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-950 dark:text-blue-200 block mb-0.5">Strict Timing</span>
                  <span className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">Presentations are capped at 8 minutes: 6 minutes for pitching and a 2-minute Q&A session.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-blue-500/10 mt-0.5">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-950 dark:text-blue-200 block mb-0.5">Tiebreaker Rules</span>
                  <span className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">In the event of a tie, combined scores in Innovation & Creativity + Technical Implementation will resolve it.</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Mentor's Evaluation Notes */}
        <Card className="border border-amber-500/20 shadow-sm bg-amber-500/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-300" style={{fontFamily:'Space Grotesk'}}>
              <Lightbulb className="w-5 h-5 text-amber-500" /> Evaluator's Perspective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300/80 leading-relaxed">
                These are the internal guidelines provided to the mentoring and judging panel. Keep these in mind while presenting.
              </p>
            </div>
            <ul className="space-y-3">
              {RUBRICS_DATA.judgingNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-500/10 transition-colors">
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed">
                    {note}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
