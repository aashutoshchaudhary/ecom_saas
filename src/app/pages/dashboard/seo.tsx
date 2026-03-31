import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import {
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Globe,
  FileText,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Zap,
} from "lucide-react";
import { mockSeoData } from "../../lib/mock-data";
import { dataProvider } from "../../lib/data-provider";
import { useApiQuery } from "../../lib/hooks";
import { toast } from "sonner";

export function SEO() {
  const { data: seoDataResult } = useApiQuery(() => dataProvider.getSeoData(), []);
  const seoData = seoDataResult || mockSeoData;
  const [selectedPage, setSelectedPage] = useState(seoData.pages[0]);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const issueIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info": return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const issueColor = (type: string) => {
    switch (type) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "info": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold">SEO Tools</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Optimize your website for search engines with AI-powered suggestions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Sitemap regenerated!")}>
            <RefreshCw className="w-4 h-4" />
            Generate Sitemap
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600" onClick={() => toast.success("AI SEO analysis started! (50 credits used)")}>
            <Sparkles className="w-4 h-4" />
            AI SEO Audit
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={seoData.score >= 80 ? "#22c55e" : seoData.score >= 60 ? "#eab308" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${seoData.score * 2.83} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className={`text-3xl font-bold ${scoreColor(seoData.score)}`}>{seoData.score}</p>
                  <p className="text-xs text-gray-500">/ 100</p>
                </div>
              </div>
            </div>
            <p className="font-semibold">Overall SEO Score</p>
            <p className="text-sm text-gray-500 mt-1">
              {seoData.score >= 80 ? "Great!" : seoData.score >= 60 ? "Needs Improvement" : "Critical Issues"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Issues Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {seoData.suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {issueIcon(suggestion.type)}
                    <div>
                      <p className="font-medium text-sm">{suggestion.message}</p>
                      <p className="text-xs text-gray-500 mt-1">Page: {suggestion.page}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={issueColor(suggestion.type)}>{suggestion.type}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => toast.success("AI fix applied!")}>
                      <Sparkles className="w-3 h-3 mr-1" /> Fix
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags Editor</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Page-by-Page SEO Analysis</CardTitle>
              <CardDescription>Click a page to see detailed SEO metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData.pages.map((page) => (
                  <div
                    key={page.path}
                    onClick={() => setSelectedPage(page)}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPage.path === page.path
                        ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        page.status === "good" ? "bg-green-100 dark:bg-green-900/30" :
                        page.status === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                        "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {page.status === "good" ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         page.status === "warning" ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> :
                         <AlertCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{page.title}</p>
                        <p className="text-sm text-gray-500">{page.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${scoreColor(page.score)}`}>{page.score}</p>
                        <p className="text-xs text-gray-500">{page.issues} issues</p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBarColor(page.score)}`} style={{ width: `${page.score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meta Tags Editor - {selectedPage.title}</CardTitle>
                  <CardDescription>Edit SEO meta tags for {selectedPage.path}</CardDescription>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => toast.success("AI-generated meta tags applied!")}>
                  <Sparkles className="w-4 h-4" />
                  AI Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Page Title</Label>
                <Input defaultValue={selectedPage.title} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">{selectedPage.title.length}/60 characters (recommended: 50-60)</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea defaultValue="Shop the latest collection of premium products at Modern Boutique. Free shipping on orders over $50." className="mt-2" rows={3} />
                <p className="text-xs text-gray-500 mt-1">120/160 characters (recommended: 150-160)</p>
              </div>
              <div>
                <Label>Keywords</Label>
                <Input defaultValue="online store, modern boutique, premium products, e-commerce" className="mt-2" />
              </div>
              <Separator />
              <div>
                <Label className="mb-3 block">Open Graph Preview</Label>
                <div className="border rounded-lg overflow-hidden max-w-md">
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 uppercase">modernboutique.ai</p>
                    <p className="font-medium text-sm text-blue-600">{selectedPage.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Shop the latest collection of premium products...</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => toast.success("Meta tags saved!")}>Save Meta Tags</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sitemap Management</CardTitle>
                  <CardDescription>Auto-generated sitemap for search engines</CardDescription>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => toast.success("Sitemap submitted to Google!")}>
                  <ExternalLink className="w-4 h-4" />
                  Submit to Google
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto">
                <pre className="text-gray-700 dark:text-gray-300">{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://modernboutique.ai/</loc>
    <lastmod>2026-03-30</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://modernboutique.ai/products</loc>
    <lastmod>2026-03-30</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://modernboutique.ai/about</loc>
    <lastmod>2026-03-28</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://modernboutique.ai/blog</loc>
    <lastmod>2026-03-25</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://modernboutique.ai/contact</loc>
    <lastmod>2026-03-20</lastmod>
    <priority>0.6</priority>
  </url>
</urlset>`}</pre>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Last generated: March 30, 2026 at 9:00 AM</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Content Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Optimize Homepage H1", desc: "Your H1 tag could be more descriptive. Try: 'Premium Products for Modern Living'", cost: 10 },
                  { title: "Add Product Schema", desc: "Add structured data to product pages for rich snippets in search results", cost: 25 },
                  { title: "Improve Internal Linking", desc: "Add cross-links between related blog posts and product pages", cost: 15 },
                  { title: "Generate Alt Tags", desc: "Auto-generate descriptive alt tags for 23 images missing them", cost: 20 },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 flex-shrink-0" onClick={() => toast.success(`Applied! (${item.cost} credits used)`)}>
                        <Zap className="w-3 h-3" />
                        {item.cost} cr
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Keyword Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: "modern boutique online", position: 3, change: 2 },
                    { keyword: "premium products store", position: 8, change: -1 },
                    { keyword: "wireless headphones best", position: 12, change: 5 },
                    { keyword: "fitness equipment online", position: 24, change: 3 },
                    { keyword: "home decor modern", position: 15, change: 0 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="font-medium text-sm">{item.keyword}</p>
                        <p className="text-xs text-gray-500">Position #{item.position}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : "text-gray-500"
                      }`}>
                        {item.change > 0 ? <TrendingUp className="w-4 h-4" /> : item.change < 0 ? <TrendingUp className="w-4 h-4 rotate-180" /> : null}
                        {item.change !== 0 ? `${item.change > 0 ? "+" : ""}${item.change}` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
