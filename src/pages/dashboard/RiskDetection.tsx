import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp, FileText, Download, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sampleDocuments, sampleRiskItems, RiskItem } from '@/data/sampleData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const categoryConfig = {
  compliance: { label: 'Compliance', icon: FileText, score: 75 },
  financial: { label: 'Financial', icon: AlertCircle, score: 60 },
  title: { label: 'Title', icon: CheckCircle, score: 85 },
  party: { label: 'Party', icon: CheckCircle, score: 90 },
  legal: { label: 'Legal', icon: AlertCircle, score: 55 },
  fraud: { label: 'Fraud', icon: CheckCircle, score: 95 },
};

const RiskDetection = () => {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [risks, setRisks] = useState<RiskItem[]>(sampleRiskItems);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const overallScore = 65;
  
  const handleAnalyze = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskLevelBg = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const getOverallStatus = (score: number) => {
    if (score >= 80) return { label: 'LOW RISK', color: 'text-success' };
    if (score >= 60) return { label: 'MODERATE RISK', color: 'text-warning' };
    return { label: 'HIGH RISK', color: 'text-destructive' };
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleResolve = (riskId: string) => {
    setRisks(risks.map(r => 
      r.id === riskId ? { ...r, resolved: true } : r
    ));
    toast({
      title: "Risk marked as resolved",
      description: "The risk item has been marked as resolved.",
    });
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedRisks = [...risks].sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const highRisks = sortedRisks.filter(r => r.priority === 'high' && !r.resolved);
  const mediumRisks = sortedRisks.filter(r => r.priority === 'medium' && !r.resolved);
  const lowRisks = sortedRisks.filter(r => r.priority === 'low' && !r.resolved);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Risk Detection
          </h1>
          <p className="text-muted-foreground">
            Identify potential legal risks, compliance issues, and anomalies in property documents.
          </p>
        </div>
      </div>

      {/* Document Selection */}
      {!showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Document for Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a document..." />
                </SelectTrigger>
                <SelectContent>
                  {sampleDocuments.filter(d => d.status === 'analyzed').map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground hidden sm:block self-center">OR</span>
              <Button variant="outline">
                Upload New Document
              </Button>
            </div>
            
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Run Risk Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-6 animate-slide-up">
          {/* Overall Score */}
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-muted-foreground">OVERALL RISK ASSESSMENT</p>
                
                <div className="relative max-w-md mx-auto">
                  <Progress value={100 - overallScore} className="h-4" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground bg-background px-2">
                      {overallScore}%
                    </span>
                  </div>
                </div>
                
                <p className={cn(
                  "text-2xl font-bold",
                  getOverallStatus(overallScore).color
                )}>
                  {getOverallStatus(overallScore).label}
                </p>
                
                <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                  <span>Low (0-40)</span>
                  <span>Moderate (40-70)</span>
                  <span>High (70-100)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              const categoryRisks = risks.filter(r => r.category === key && !r.resolved);
              
              return (
                <Card key={key} className="text-center">
                  <CardContent className="pt-6 pb-4">
                    <div className={cn(
                      "inline-flex p-2 rounded-full mb-2",
                      getRiskLevelBg(config.score)
                    )}>
                      <Icon className={cn("h-5 w-5", getRiskLevelColor(config.score))} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">{config.label}</p>
                    <p className={cn("text-2xl font-bold", getRiskLevelColor(config.score))}>
                      {config.score}/100
                    </p>
                    {categoryRisks.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryRisks.length} issue{categoryRisks.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Risk Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Identified Risks ({risks.filter(r => !r.resolved).length} items)
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowResults(false)}>
                Analyze Another
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Priority */}
              {highRisks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    HIGH PRIORITY
                  </p>
                  {highRisks.map(risk => (
                    <RiskCard 
                      key={risk.id} 
                      risk={risk} 
                      expanded={expandedRisk === risk.id}
                      onToggle={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      onResolve={() => handleResolve(risk.id)}
                    />
                  ))}
                </div>
              )}

              {/* Medium Priority */}
              {mediumRisks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-warning flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    MEDIUM PRIORITY
                  </p>
                  {mediumRisks.map(risk => (
                    <RiskCard 
                      key={risk.id} 
                      risk={risk} 
                      expanded={expandedRisk === risk.id}
                      onToggle={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      onResolve={() => handleResolve(risk.id)}
                    />
                  ))}
                </div>
              )}

              {/* Low Priority */}
              {lowRisks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    LOW PRIORITY
                  </p>
                  {lowRisks.map(risk => (
                    <RiskCard 
                      key={risk.id} 
                      risk={risk} 
                      expanded={expandedRisk === risk.id}
                      onToggle={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      onResolve={() => handleResolve(risk.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Risk Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
                <Button variant="outline">
                  Export as JSON
                </Button>
                <Button variant="outline">
                  Share Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

interface RiskCardProps {
  risk: RiskItem;
  expanded: boolean;
  onToggle: () => void;
  onResolve: () => void;
}

const RiskCard = ({ risk, expanded, onToggle, onResolve }: RiskCardProps) => {
  const priorityColors = {
    high: 'border-l-destructive',
    medium: 'border-l-warning',
    low: 'border-l-muted-foreground',
  };

  return (
    <div className={cn(
      "border rounded-lg border-l-4 overflow-hidden",
      priorityColors[risk.priority]
    )}>
      <div 
        className="p-4 flex items-start justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className={cn(
            "h-5 w-5 mt-0.5",
            risk.priority === 'high' ? 'text-destructive' : 
            risk.priority === 'medium' ? 'text-warning' : 'text-muted-foreground'
          )} />
          <div>
            <p className="font-medium text-foreground">{risk.title}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {risk.description}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-slide-up">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Recommendation</p>
            <p className="text-sm text-muted-foreground">{risk.recommendation}</p>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onToggle}>
              View Details
            </Button>
            <Button size="sm" variant="outline" onClick={onResolve}>
              <Check className="h-4 w-4 mr-1" />
              Mark Resolved
            </Button>
            <Button size="sm" variant="ghost">
              Add Note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDetection;
