import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Clock, User } from "lucide-react";

const ARTICLES = [
  {
    id: "a1",
    title: "AI Predictions: How Our Model Beat the Experts",
    summary: "ScoreMatrix's AI engine correctly predicted 8 out of 10 match outcomes last weekend, outperforming professional analysts...",
    category: "analysis" as const,
    author: "Alex Chen",
    publishedAt: "2 hours ago",
    tags: ["AI", "Predictions", "Analysis"],
    readTime: 5,
  },
  {
    id: "a2",
    title: "Weekend Preview: Top 5 Matches to Watch",
    summary: "From the Milan Derby to the North London clash, here are the matches you cannot miss this weekend...",
    category: "news" as const,
    author: "Sarah Kim",
    publishedAt: "5 hours ago",
    tags: ["Weekend", "Preview", "Top Matches"],
    readTime: 4,
  },
  {
    id: "a3",
    title: "New Reward: Limited Edition Cyberpunk Jersey",
    summary: "The exclusive cyberpunk-themed football jersey is now available in the rewards catalog for 500 Free Points...",
    category: "feature" as const,
    author: "Mike Park",
    publishedAt: "1 day ago",
    tags: ["Rewards", "Merchandise", "Limited Edition"],
    readTime: 3,
  },
  {
    id: "a4",
    title: "5 Tips to Improve Your Prediction Accuracy",
    summary: "Want to climb the leaderboard? Here are five data-backed tips to help you make better predictions...",
    category: "tips" as const,
    author: "Lisa Wang",
    publishedAt: "2 days ago",
    tags: ["Tips", "Strategy", "Beginner"],
    readTime: 7,
  },
  {
    id: "a5",
    title: "League Spotlight: Cyber Squad Dominates Week 18",
    summary: "The private league 'Cyber Squad' saw record participation this week with 12 members submitting over 200 predictions...",
    category: "news" as const,
    author: "Tom Jones",
    publishedAt: "2 days ago",
    tags: ["League", "Community", "Spotlight"],
    readTime: 4,
  },
  {
    id: "a6",
    title: "Understanding the AI Confidence Score",
    summary: "Ever wonder what the AI confidence percentage really means? We break down the factors that influence the score...",
    category: "analysis" as const,
    author: "Alex Chen",
    publishedAt: "3 days ago",
    tags: ["AI", "Guide", "Deep Dive"],
    readTime: 6,
  },
  {
    id: "a7",
    title: "Season 3 Leaderboard: The Race Heats Up",
    summary: "With just two weeks remaining in the season, the top 10 leaderboard has never been more competitive...",
    category: "news" as const,
    author: "Sarah Kim",
    publishedAt: "4 days ago",
    tags: ["Leaderboard", "Season", "Competition"],
    readTime: 5,
  },
  {
    id: "a8",
    title: "New Feature: Head-to-Head Leagues",
    summary: "You can now challenge friends to direct 1v1 prediction battles in our new head-to-head league mode...",
    category: "feature" as const,
    author: "Mike Park",
    publishedAt: "5 days ago",
    tags: ["Features", "Update", "Leagues"],
    readTime: 4,
  },
  {
    id: "a9",
    title: "Form Guide: Who's Hot and Who's Not",
    summary: "Our weekly form analysis covering the top 5 in-form and out-of-form teams across all leagues...",
    category: "analysis" as const,
    author: "Lisa Wang",
    publishedAt: "6 days ago",
    tags: ["Form", "Analysis", "Statistics"],
    readTime: 6,
  },
];

const categoryConfig = {
  analysis: { color: "cyan" as const, label: "Analysis" },
  news: { color: "magenta" as const, label: "News" },
  feature: { color: "green" as const, label: "Feature" },
  tips: { color: "gold" as const, label: "Tips" },
};

export default function NewsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-white">
          News & Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Latest updates, match analysis, and prediction tips
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARTICLES.map((article) => {
          const cat = categoryConfig[article.category];
          return (
            <Link key={article.id} href={`/en/news/${article.id}`}>
              <Card hover neon={cat.color === "cyan" ? "cyan" : undefined} className="h-full flex flex-col p-4">
                <div className="mb-3">
                  <Badge variant={cat.color} size="sm">
                    {cat.label}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                  {article.summary}
                </p>
                <div className="mt-auto flex items-center justify-between text-[10px] text-gray-600">
                  <div className="flex items-center gap-1">
                    <User size={10} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
