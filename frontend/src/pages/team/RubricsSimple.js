import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { GraduationCap } from 'lucide-react';
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
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="14" fontWeight="bold">
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
        <p className="text-muted-foreground mt-1">Understanding how your project will be evaluated</p>
      </div>

      {/* Score Distribution Chart */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Score Distribution (Total: 100 points)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Evaluation Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RUBRICS_DATA.categories.map((category, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: category.color}}></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <Badge style={{backgroundColor: category.color, color: 'white'}}>
                    {category.maxScore} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Points for Teams */}
      <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950 mb-6">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Key Points to Remember</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
              <span className="font-bold">•</span>
              <span><strong>Total Score:</strong> 100 points across 6 categories</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
              <span className="font-bold">•</span>
              <span><strong>Highest Weight:</strong> Technical Implementation (25 points)</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
              <span className="font-bold">•</span>
              <span><strong>Presentation Time:</strong> 8 minutes total (6 min presentation + 2 min Q&A)</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
              <span className="font-bold">•</span>
              <span><strong>Tiebreaker:</strong> Innovation & Creativity + Technical Implementation</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Mentor's Evaluation Notes */}
      <Card className="border-0 shadow-sm bg-amber-50 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">What Mentors Look For</CardTitle>
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
