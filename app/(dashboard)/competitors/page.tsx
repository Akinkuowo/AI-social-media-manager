"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Plus, 
  Search, 
  BarChart3, 
  Flame, 
  ArrowRight,
  Target,
  Zap,
  Tag,
  MessageSquare,
  Heart,
  Calendar,
  Eye,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface CompetitorPost {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  postedAt: string;
  hashtags: string;
}

interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
  posts: CompetitorPost[];
}

interface GapAnalysis {
  analysis: string;
  gapTitle: string;
  gapDescription: string;
  actionableSteps: string[];
  dominantHashtags: string[];
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedComp, setSelectedComp] = useState<Competitor | null>(null);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const res = await fetch("/api/competitors");
      const data = await res.json();
      setCompetitors(data);
      if (data.length > 0 && !selectedComp) {
        setSelectedComp(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Monitor a Rival',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Competitor Name">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Handle (e.g. @rivalBrand)">' +
        '<select id="swal-input3" class="swal2-select">' +
          '<option value="instagram">Instagram</option>' +
          '<option value="facebook">Facebook</option>' +
          '<option value="linkedin">LinkedIn</option>' +
        '</select>',
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value,
          (document.getElementById('swal-input3') as HTMLSelectElement).value
        ];
      },
      showCancelButton: true,
      confirmButtonText: 'Start Monitoring',
      confirmButtonColor: '#6366f1',
      background: '#1e1e2e',
      color: '#ffffff'
    });

    if (formValues) {
      const [name, handle, platform] = formValues;
      if (!name || !handle) return;

      try {
        const res = await fetch("/api/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, handle, platform })
        });
        if (res.ok) {
          MySwal.fire({
            icon: 'success',
            title: 'Monitoring Started',
            text: `Analyzing ${name}'s strategy...`,
            background: '#1e1e2e',
            color: '#fff'
          });
          fetchCompetitors();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const runGapAnalysis = async (comp: Competitor) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/competitors/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorId: comp.id })
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Competitor Monitoring</h1>
          <p className="text-muted-foreground mt-1 text-sm">Analyze rivals, find content gaps, and dominate your niche.</p>
        </div>
        <button 
          onClick={handleAddCompetitor}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Track New Rival
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Competitor List & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Tracked Competitors
              </h3>
            </div>
            
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {competitors.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No competitors added yet.</p>
                </div>
              ) : (
                competitors.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedComp(comp);
                      setAnalysis(null);
                    }}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 ${selectedComp?.id === comp.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-primary">
                      {comp.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{comp.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{comp.handle} • {comp.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{(comp.followerCount / 1000).toFixed(1)}k</p>
                      <p className="text-[10px] text-green-500 flex items-center justify-end">
                        <TrendingUp className="w-2 h-2 mr-0.5" />
                        {comp.engagementRate}%
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Insights Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="font-bold text-lg mb-2">Market Sentiment</h3>
            <p className="text-xs text-white/80 mb-4">Your niche is currently trending towards long-form video content. Brands like {competitors[0]?.name || 'others'} are shifting 40% of their mix to Reels.</p>
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/20">
              <Zap className="w-3 h-3 text-yellow-300" />
              Trend Score: 8.4/10
            </div>
          </div>
        </div>

        {/* Right: Detailed Analysis */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {selectedComp ? (
              <motion.div
                key={selectedComp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Competitor Profile Info */}
                <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-foreground border border-border">
                      {selectedComp.name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedComp.name} Analysis</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-muted border border-border px-2 py-0.5 rounded-full text-muted-foreground capitalize">{selectedComp.platform}</span>
                        <span className="text-xs text-muted-foreground">{selectedComp.handle}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 divide-x divide-border">
                    <div className="pl-6 first:pl-0">
                      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Followers</p>
                      <p className="text-xl font-bold text-foreground">{selectedComp.followerCount.toLocaleString()}</p>
                    </div>
                    <div className="pl-6">
                      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Avg. Engagement</p>
                      <p className="text-xl font-bold text-primary">{selectedComp.engagementRate}%</p>
                    </div>
                    <div className="pl-6">
                      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Status</p>
                      <div className="flex items-center gap-1.5 text-green-500 font-bold text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Gap Analysis Section */}
                <div className="bg-surface/30 backdrop-blur-sm border border-border rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart3 className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                    {!analysis && !isAnalyzing && (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Target className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Run Content Gap Analysis</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                          Our AI will compare your recent posts against {selectedComp.name} to find specific topics and content styles you are missing.
                        </p>
                        <button 
                          onClick={() => runGapAnalysis(selectedComp)}
                          className="bg-foreground text-background px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-foreground/90 transition-all"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          Compare Strategy
                        </button>
                      </>
                    )}

                    {isAnalyzing && (
                      <div className="py-12 space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Deconstructing {selectedComp.name}'s win-rate...</p>
                      </div>
                    )}

                    {analysis && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full text-left space-y-6"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Strategy Gap Found</span>
                            <h3 className="text-2xl font-bold text-foreground mt-3">{analysis.gapTitle}</h3>
                          </div>
                          <div className="bg-muted p-2 rounded-lg cursor-pointer hover:bg-muted/80" onClick={() => setAnalysis(null)}>
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.gapDescription}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-xl p-4 border border-border">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              Actionable Steps
                            </h4>
                            <ul className="space-y-2">
                              {analysis.actionableSteps.map((step, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <ArrowRight className="w-3 h-3 text-primary opacity-50" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 border border-border">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Tag className="w-3 h-3 text-purple-500" />
                              Dominant Hashtags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysis.dominantHashtags.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-surface border border-border px-2 py-1 rounded text-primary font-medium hover:border-primary transition-colors cursor-default">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Top Posts Wall */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Top Performing Posts
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedComp.posts.map((post) => (
                      <div key={post.id} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all group">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.postedAt).toLocaleDateString()}
                          </span>
                          <span className="bg-muted px-2 py-1 rounded group-hover:bg-primary/10 group-hover:text-primary transition-colors">Platform Best</span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-3 mb-4 leading-relaxed italic border-l-4 border-muted pl-4">"{post.caption}"</p>
                        <div className="flex items-center gap-4 border-t border-border pt-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                            {post.comments}
                          </div>
                          <div className="ml-auto text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
                            Analyze
                            <Eye className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl h-[400px] flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Competitor Selected</h2>
                <p className="text-muted-foreground text-sm max-w-sm">Select a competitor from the list on the left to deconstruct their marketing strategy and find opportunities.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
