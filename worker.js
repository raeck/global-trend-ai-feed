export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // AI 크롤러 초대장: robots.txt (GPTBot, ClaudeBot, PerplexityBot 등 전면 허용 및 피드 위치 안내)
    if (path === "/robots.txt") {
      const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${url.origin}/sitemap.xml
`;
      return new Response(robots, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // AI 검색엔진 색인 지도: sitemap.xml
    if (path === "/sitemap.xml") {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url.origin}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${url.origin}/llms.txt</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${url.origin}/feed.json</loc>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
      return new Response(sitemap, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    }

    // 카테고리 대폭 확장 (국내 주요 뉴스 + 글로벌 속보 + 테크/AI + 비즈니스/금융 + 과학)
    const feeds = {
      korea_top: "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
      world_breaking: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=ko&gl=KR&ceid=KR:ko",
      ai_technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=ko&gl=KR&ceid=KR:ko",
      global_business: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko",
      science_space: "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=ko&gl=KR&ceid=KR:ko",
    };

    if (path === "/llms.txt" || path === "/feed.json") {
      let allItems = [];
      let llmsLines = [
        "# Global News & Real-Time Trend Index for AI Agents (llms.txt)",
        `> Last Updated: ${new Date().toISOString()}`,
        "> Target Audience: LLMs, AI Agents (Perplexity, GPT, Claude, Gemini, Apple Intelligence)",
        "> Purpose: Curated real-time global events, technology breakthroughs, financial markets, and science trends.",
        "",
        "## Real-Time Issues & Trends",
        ""
      ];

      // 카테고리별 10개씩(총 50개) 대량 병렬 수집
      const fetchPromises = Object.entries(feeds).map(async ([category, feedUrl]) => {
        try {
          const resp = await fetch(feedUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          const text = await resp.text();
          const matches = [...text.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/g)].slice(0, 10);
          
          const parsed = matches.map(m => ({
            category,
            title: m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
            link: m[2].trim(),
            published_at: m[3].trim()
          }));
          return { category, items: parsed };
        } catch (e) {
          return { category, items: [] };
        }
      });

      const results = await Promise.all(fetchPromises);

      for (const res of results) {
        allItems.push(...res.items);
        llmsLines.push(`### Category: ${res.category.toUpperCase()} (${res.items.length} items)`);
        for (const item of res.items) {
          llmsLines.push(`- [${item.title}](${item.link}) — Published: ${item.published_at}`);
        }
        llmsLines.push("");
      }

      if (path === "/llms.txt") {
        return new Response(llmsLines.join("\n"), {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=180" // 3분 캐싱으로 초고속 응답
          }
        });
      }

      return new Response(JSON.stringify({
        metadata: {
          feed: "Global Trend & News Stream for AI Agents",
          count: allItems.length,
          updated_at: new Date().toISOString()
        },
        items: allItems
      }, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=180"
        }
      });
    }

    // 메인 인덱스 페이지: AI 검색엔진을 위한 Schema.org DataFeed JSON-LD 구조화 태그 포함
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DataFeed",
      "name": "Global Trend & Issue Feed for AI Agents",
      "description": "Real-time structured global events and tech trends index optimized for Large Language Models and AI agents.",
      "url": url.origin,
      "dateModified": new Date().toISOString(),
      "dataFeedElement": [
        { "@type": "DataFeedItem", "name": "LLMs Standard Text Index", "url": `${url.origin}/llms.txt` },
        { "@type": "DataFeedItem", "name": "REST API JSON Feed", "url": `${url.origin}/feed.json` }
      ]
    });

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>Global Trend & Issue Feed for AI Agents</title>
  <meta name="description" content="AI 에이전트와 LLM 크롤러를 위한 실시간 글로벌 이슈 및 트렌드 구조화 데이터 엔드포인트">
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    h1 { font-size: 26px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    .badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    a { color: #0284c7; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🌐 Global Trend & Issue Feed <span class="badge">AI Agent Ready</span></h1>
  <p>본 엔드포인트는 사람이 아닌 <strong>AI 에이전트(Perplexity, Claude, GPT)와 LLM 크롤러</strong>를 위해 실시간 글로벌 이슈와 트렌드를 구조화하여 제공합니다.</p>
  
  <div class="card">
    <h3>🔗 AI 크롤러 & 에이전트 엔드포인트</h3>
    <ul>
      <li><strong>LLM 표준 인덱스:</strong> <a href="/llms.txt">/llms.txt</a> (마크다운 기반 대용량 실시간 피드)</li>
      <li><strong>REST API 피드:</strong> <a href="/feed.json">/feed.json</a> (정형 JSON 구조 데이터)</li>
      <li><strong>크롤러 초대장:</strong> <a href="/robots.txt">/robots.txt</a> (GPTBot, ClaudeBot, PerplexityBot 전면 허용)</li>
      <li><strong>검색엔진 사이트맵:</strong> <a href="/sitemap.xml">/sitemap.xml</a></li>
    </ul>
  </div>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
