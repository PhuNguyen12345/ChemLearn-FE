import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Clock, CheckCircle2 } from 'lucide-react';

const ParentDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor Alex's chemistry learning progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Test Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Chapter 3: Atomic Structure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              This week (+1.2 hrs from last week)
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Overall Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[80px] w-full flex items-end justify-between px-2">
              {/* Placeholder for simple bar/line chart */}
              {[40, 60, 50, 80, 75, 90, 85].map((h, i) => (
                <div key={i} className="w-6 bg-primary/20 rounded-t-sm relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all" 
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
