import { FileText, Brain, GitBranch, AlertTriangle, Upload, MessageSquare, BarChart3, FileSearch, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sampleDocuments, dashboardStats, weeklyData } from '@/data/sampleData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  change: number;
  changeType: 'up' | 'down';
}) => (
  <Card className="hover:shadow-card-hover transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
          changeType === 'up' ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
        )}>
          {changeType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusBadge = (status: string, riskCount: number) => {
    if (status === 'pending') {
      return <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">Queued</span>;
    }
    if (riskCount > 0) {
      return <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">{riskCount} Risks</span>;
    }
    return <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">Analyzed</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {getGreeting()}, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your legal analysis overview for today.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/analyzer')} className="md:w-auto">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={FileText} 
          label="Documents Analyzed" 
          value={dashboardStats.documentsAnalyzed} 
          change={dashboardStats.documentsChange}
          changeType="up"
        />
        <StatCard 
          icon={Brain} 
          label="Queries Processed" 
          value={dashboardStats.queriesProcessed} 
          change={dashboardStats.queriesChange}
          changeType="up"
        />
        <StatCard 
          icon={GitBranch} 
          label="Entities Extracted" 
          value={dashboardStats.entitiesExtracted} 
          change={dashboardStats.entitiesChange}
          changeType="up"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Risks Found" 
          value={dashboardStats.risksFound} 
          change={Math.abs(dashboardStats.risksChange)}
          changeType="down"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Documents - Left 60% */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/documents')}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {sampleDocuments.slice(0, 5).map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard/analyzer')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <FileText className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDate(doc.uploadedAt)}
                    </span>
                    {getStatusBadge(doc.status, doc.riskCount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Right 40% */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                size="lg"
                onClick={() => navigate('/dashboard/analyzer')}
              >
                <Upload className="h-5 w-5 mr-3" />
                Upload New Document
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                onClick={() => navigate('/dashboard/reasoning')}
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Ask Legal Question
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                onClick={() => navigate('/dashboard/knowledge-graph')}
              >
                <GitBranch className="h-5 w-5 mr-3" />
                View Knowledge Graph
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                onClick={() => navigate('/dashboard/risk-detection')}
              >
                <FileSearch className="h-5 w-5 mr-3" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Chart Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="documents" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
