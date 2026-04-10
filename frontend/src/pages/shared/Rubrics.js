import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { GraduationCap, Trophy, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

export default function Rubrics() {
  // Prepare data for pie charts
  const weightageData = RUBRICS_DATA.categories.map(cat => ({
    name: cat.name,
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
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2" style={{fontFamily:'Space Grotesk'}}>
          <GraduationCap className="w-8 h-8 text-primary" />
          Evaluation Rubrics
        </h1>
        <p className="text-muted-foreground mt-1">CodHER Hackathon Finals Judging Criteria</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-3xl font-bold mt-1">{RUBRICS_DATA.categories.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maximum Score</p>
                <p className="text-3xl font-bold mt-1">{RUBRICS_DATA.totalMaxScore}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Presentation Time</p>
                <p className="text-3xl font-bold mt-1">8 min</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Section */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Chart 1: Category Weightage Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Category Weightage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={weightageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={70}
                  dataKey="value"
                >
                  {weightageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {weightageData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="truncate">{item.name.substring(0, 20)}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Score Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Maximum Scores by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={70}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Total: {RUBRICS_DATA.totalMaxScore} points
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Top Priority Categories */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">High Priority Categories (≥20%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={70}
                  dataKey="value"
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {topCategories.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Rubrics */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Detailed Scoring Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {RUBRICS_DATA.categories.map((category, idx) => (
              <div key={idx} className="border-l-4 pl-4" style={{borderColor: category.color}}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <Badge style={{backgroundColor: category.color, color: 'white'}}>
                    {category.weightage}% ({category.maxScore} points)
                  </Badge>
                </div>
                <div className="space-y-3">
                  {category.guidelines.map((guideline, gidx) => (
                    <div key={gidx} className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {guideline.range}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{guideline.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Judging Notes */}
      <Card className="border-0 shadow-sm bg-amber-50 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">Important Notes for Judges</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {RUBRICS_DATA.judgingNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100">
                <span className="font-bold">{idx + 1}.</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
