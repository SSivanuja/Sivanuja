import { useState } from 'react';
import { Search, Filter, Grid, List, Upload, FileText, MoreVertical, Trash2, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sampleDocuments, Document } from '@/data/sampleData';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Documents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  const filteredDocs = sampleDocuments
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const toggleSelect = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const selectAll = () => {
    if (selectedDocs.size === filteredDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocs.map(d => d.id)));
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.status === 'pending') {
      return <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">Queued</span>;
    }
    if (doc.riskCount > 0) {
      return <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">{doc.riskCount} Risks</span>;
    }
    return <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">Analyzed</span>;
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground">
            Manage your uploaded legal documents
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/analyzer')}>
          <Upload className="h-4 w-4 mr-2" />
          Upload New
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="partition">Partition</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedDocs.size === filteredDocs.length && filteredDocs.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocs.map((doc) => (
                    <tr 
                      key={doc.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        selectedDocs.has(doc.id) && "bg-muted/20"
                      )}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedDocs.has(doc.id)}
                          onCheckedChange={() => toggleSelect(doc.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <FileText className="h-4 w-4 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground hidden md:table-cell">
                        {getTypeLabel(doc.type)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(doc)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate('/dashboard/analyzer')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Analysis
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredDocs.map((doc) => (
                <Card 
                  key={doc.id}
                  className={cn(
                    "cursor-pointer hover:shadow-card-hover transition-all",
                    selectedDocs.has(doc.id) && "ring-2 ring-primary"
                  )}
                  onClick={() => toggleSelect(doc.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-lg bg-destructive/10">
                        <FileText className="h-6 w-6 text-destructive" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate('/dashboard/analyzer')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-medium text-foreground text-sm truncate">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{doc.size}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(doc.uploadedAt)}
                      </span>
                      {getStatusBadge(doc)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {filteredDocs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No documents found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/dashboard/analyzer')}
              >
                Upload your first document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredDocs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{filteredDocs.length} of {sampleDocuments.length} documents
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
