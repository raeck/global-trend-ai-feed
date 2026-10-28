export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = url.origin;

    // AI 크롤러 전용 응답 헤더 (CORS 전면 허용 + AI Content-Signal 명시 + 즉시 캐싱)
    const baseHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "X-Robots-Tag": "all, index, follow, ai-input:yes, ai-train:yes, search:yes",
      "Content-Signal": "ai-input=yes, search=yes",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: baseHeaders });
    }

    // 1. IndexNow API Key 검증 엔드포인트
    if (path === "/e3a7c8b2d1f44a95a1c2e3f4a5b6c7d8.txt") {
      return new Response("e3a7c8b2d1f44a95a1c2e3f4a5b6c7d8", {
        headers: { ...baseHeaders, "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // 2. AI 크롤러 공식 초대장: robots.txt (최신 10대 AI 봇 전면 허용 + Content-Signal 명시)
    if (path === "/robots.txt") {
      const robots = `# Optimized robots.txt for AI Agents & LLM Web Search Engines
User-agent: *
Allow: /

# Dedicated AI Agents & LLMs
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Cohere-ai
Allow: /

# Cloudflare & Open Web Content Signals for AI
Content-Signal: ai-input=yes, search=yes

Sitemap: ${origin}/sitemap.xml
`;
      return new Response(robots, {
        headers: { ...baseHeaders, "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // 3. AI 검색엔진 색인 지도: sitemap.xml
    if (path === "/sitemap.xml") {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>${origin}/llms.txt</loc><changefreq>always</changefreq><priority>1.0</priority></url>
  <url><loc>${origin}/llms-full.txt</loc><changefreq>always</changefreq><priority>1.0</priority></url>
  <url><loc>${origin}/dev-trends.txt</loc><changefreq>always</changefreq><priority>1.0</priority></url>
  <url><loc>${origin}/api/dev-trends.json</loc><changefreq>always</changefreq><priority>1.0</priority></url>
  <url><loc>${origin}/finance.txt</loc><changefreq>always</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/api/finance.json</loc><changefreq>always</changefreq><priority>0.9</priority></url>
  <url><loc>${origin}/feed.json</loc><changefreq>always</changefreq><priority>0.8</priority></url>
</urlset>`;
      return new Response(sitemap, {
        headers: { ...baseHeaders, "Content-Type": "application/xml; charset=utf-8" }
      });
    }

    // 4. 개발자 전문 피드: Hacker News 실시간 탑 15 스토리
    if (path === "/api/dev-trends.json" || path === "/dev-trends.txt") {
      let devItems = [];
      try {
        const hnResp = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
        const topIds = (await hnResp.json()).slice(0, 15);
        
        const itemPromises = topIds.map(async (id) => {
          try {
            const itemResp = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const item = await itemResp.json();
            return {
              id: item.id,
              title: item.title,
              url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
              score: item.score,
              comments: item.descendants || 0,
              by: item.by,
              time: new Date(item.time * 1000).toISOString()
            };
          } catch(e) { return null; }
        });

        const resolved = await Promise.all(itemPromises);
        devItems = resolved.filter(Boolean);
      } catch(e) {
        devItems = [];
      }

      if (path === "/dev-trends.txt") {
        let txt = `# Developer & Tech Trends Feed for AI Agents (Hacker News Top Stories)
> Updated: ${new Date().toISOString()}
> Target: Coding Assistants, Dev Agents (Claude Code, GitHub Copilot, Cursor, Perplexity)

## Real-Time Hacker News Top Developer Issues
`;
        for (const it of devItems) {
          txt += `- [${it.title}](${it.url}) — Score: ${it.score} pts | Comments: ${it.comments} | By: ${it.by}\n`;
        }
        return new Response(txt, {
          headers: { ...baseHeaders, "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=180" }
        });
      }

      return new Response(JSON.stringify({
        metadata: {
          feed: "Developer Trends & Engineering Discussions for AI Agents",
          source: "Hacker News Firebase API",
          count: devItems.length,
          updated_at: new Date().toISOString()
        },
        items: devItems
      }, null, 2), {
        headers: { ...baseHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=180" }
      });
    }

    // 5. 실시간 금융 및 암호화폐 지표 (/api/finance.json, /finance.txt)
    if (path === "/api/finance.json" || path === "/finance.txt") {
      let forexData = {};
      let cryptoData = {};

      try {
        const fxResp = await fetch("https://open.er-api.com/v6/latest/USD", { headers: { "User-Agent": "Mozilla/5.0" } });
        const fxJson = await fxResp.json();
        if (fxJson && fxJson.rates) {
          forexData = {
            usd_krw: fxJson.rates.KRW,
            usd_jpy: fxJson.rates.JPY,
            usd_eur: fxJson.rates.EUR,
            last_updated: fxJson.time_last_update_utc
          };
        }
      } catch (e) {}

      try {
        const cryptoResp = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,krw&include_24hr_change=true", { headers: { "User-Agent": "Mozilla/5.0" } });
        cryptoData = await cryptoResp.json();
      } catch (e) {}

      if (path === "/finance.txt") {
        const textSummary = `# Real-Time Global Finance & Crypto Feed for LLMs
> Updated: ${new Date().toISOString()}

## 1. Foreign Exchange Rates (USD Base)
- USD/KRW (원·달러): ${forexData.usd_krw ? forexData.usd_krw.toLocaleString() + ' KRW' : 'Loading'}
- USD/JPY (엔·달러): ${forexData.usd_jpy ? forexData.usd_jpy.toFixed(2) + ' JPY' : 'Loading'}
- USD/EUR (유로·달러): ${forexData.usd_eur ? forexData.usd_eur.toFixed(4) + ' EUR' : 'Loading'}

## 2. Cryptocurrency Real-Time Market
- Bitcoin (BTC): $${cryptoData.bitcoin?.usd?.toLocaleString() || 'N/A'} (약 ${cryptoData.bitcoin?.krw?.toLocaleString() || 'N/A'}원 / 24h 변동: ${cryptoData.bitcoin?.usd_24h_change?.toFixed(2) || '0'}%)
- Ethereum (ETH): $${cryptoData.ethereum?.usd?.toLocaleString() || 'N/A'} (약 ${cryptoData.ethereum?.krw?.toLocaleString() || 'N/A'}원 / 24h 변동: ${cryptoData.ethereum?.usd_24h_change?.toFixed(2) || '0'}%)
- Solana (SOL): $${cryptoData.solana?.usd?.toLocaleString() || 'N/A'} (약 ${cryptoData.solana?.krw?.toLocaleString() || 'N/A'}원 / 24h 변동: ${cryptoData.solana?.usd_24h_change?.toFixed(2) || '0'}%)
`;
        return new Response(textSummary, {
          headers: { ...baseHeaders, "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=60" }
        });
      }

      return new Response(JSON.stringify({
        metadata: { feed: "Real-Time Global Finance & Crypto Stream for AI Agents", timestamp: new Date().toISOString() },
        forex: forexData,
        crypto: cryptoData
      }, null, 2), {
        headers: { ...baseHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" }
      });
    }

    // 6. 실시간 뉴스 및 트렌드 피드 (5개 카테고리)
    const feeds = {
      korea_top: "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
      world_breaking: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=ko&gl=KR&ceid=KR:ko",
      ai_technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=ko&gl=KR&ceid=KR:ko",
      global_business: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko",
      science_space: "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=ko&gl=KR&ceid=KR:ko",
    };

    // 7. [고급 튜닝] llms.txt & llms-full.txt (심층 컨텍스트 전용)
    if (path === "/llms.txt" || path === "/llms-full.txt" || path === "/feed.json") {
      let allItems = [];
      let llmsLines = [
        "# Global Trend & Intelligence Hub for AI Agents (llms.txt)",
        `> Last Updated: ${new Date().toISOString()}`,
        "> Target Audience: LLMs, Coding Assistants, AI Agents (Perplexity, GPT, Claude Code, Gemini, Apple Intelligence)",
        "> Purpose: Curated real-time developer trends, global events, financial markets, and science breakthroughs.",
        "",
        "## Real-Time Specialized Endpoints",
        `- [Developer & Hacker News Feed](${origin}/dev-trends.txt) — JSON: ${origin}/api/dev-trends.json`,
        `- [Real-Time Forex & Crypto Data](${origin}/finance.txt) — JSON: ${origin}/api/finance.json`,
        "",
        "## Real-Time Issues & Trends",
        ""
      ];

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

      if (path === "/llms.txt" || path === "/llms-full.txt") {
        return new Response(llmsLines.join("\n"), {
          headers: { ...baseHeaders, "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=180" }
        });
      }

      return new Response(JSON.stringify({
        metadata: { feed: "Global Trend & News Stream for AI Agents", count: allItems.length, updated_at: new Date().toISOString() },
        items: allItems
      }, null, 2), {
        headers: { ...baseHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=180" }
      });
    }

    // 8. 메인 인덱스 페이지 (Schema.org JSON-LD 메타데이터 포함)
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DataFeed",
      "name": "Global Developer & Trend Data Hub for AI Agents",
      "description": "Real-time structured developer discussions, tech trends, forex, and crypto index optimized for LLMs and AI agents.",
      "url": origin,
      "dateModified": new Date().toISOString(),
      "dataFeedElement": [
        { "@type": "DataFeedItem", "name": "LLMs Standard Text Index", "url": `${origin}/llms.txt` },
        { "@type": "DataFeedItem", "name": "LLMs Full Context Index", "url": `${origin}/llms-full.txt` },
        { "@type": "DataFeedItem", "name": "Developer & Hacker News Feed", "url": `${origin}/dev-trends.txt` },
        { "@type": "DataFeedItem", "name": "Developer Trends JSON API", "url": `${origin}/api/dev-trends.json` },
        { "@type": "DataFeedItem", "name": "Real-Time Finance Text", "url": `${origin}/finance.txt` },
        { "@type": "DataFeedItem", "name": "Real-Time Finance JSON API", "url": `${origin}/api/finance.json` },
        { "@type": "DataFeedItem", "name": "Global News JSON Feed", "url": `${origin}/feed.json` }
      ]
    });

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>Global Developer & Trend Data Hub for AI Agents</title>
  <meta name="description" content="AI 코딩 에이전트와 LLM 크롤러를 위한 실시간 개발자 토론, 트렌드, 환율, 암호화폐 데이터 허브">
  <meta name="robots" content="all, index, follow">
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    h1 { font-size: 26px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    .badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
    .badge-dev { background: #6366f1; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
    .badge-finance { background: #16a34a; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    a { color: #0284c7; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🌐 Global Developer & Trend Hub <span class="badge">AI Agent Ready</span></h1>
  <p>본 엔드포인트는 사람이 아닌 <strong>AI 코딩 에이전트(Claude Code, Cursor, Copilot, Perplexity)와 LLM 크롤러</strong>를 위해 실시간 개발자 토론과 글로벌 트렌드 데이터를 구조화하여 제공합니다.</p>

  <div class="card">
    <h3>💻 개발자 트렌드 & 엔지니어링 토론 <span class="badge-dev">NEW</span></h3>
    <ul>
      <li><strong>해커뉴스(Hacker News) 실시간 텍스트 피드:</strong> <a href="/dev-trends.txt">/dev-trends.txt</a> (추천 점수 및 댓글 수 포함)</li>
      <li><strong>개발자 트렌드 REST API:</strong> <a href="/api/dev-trends.json">/api/dev-trends.json</a> (정형 JSON)</li>
    </ul>
  </div>

  <div class="card">
    <h3>📈 실시간 금융 & 암호화폐 데이터 피드 <span class="badge-finance">LIVE</span></h3>
    <ul>
      <li><strong>실시간 환율·코인 텍스트 요약:</strong> <a href="/finance.txt">/finance.txt</a> (원·달러/엔화 환율 + 비트코인 시세)</li>
      <li><strong>실시간 금융 REST API:</strong> <a href="/api/finance.json">/api/finance.json</a> (정형 JSON)</li>
    </ul>
  </div>

  <div class="card">
    <h3>🔗 글로벌 트렌드 & 인덱스 엔드포인트</h3>
    <ul>
      <li><strong>LLM 통합 표준 인덱스:</strong> <a href="/llms.txt">/llms.txt</a></li>
      <li><strong>LLM 심층 컨텍스트 풀버전:</strong> <a href="/llms-full.txt">/llms-full.txt</a></li>
      <li><strong>글로벌 속보 REST API:</strong> <a href="/feed.json">/feed.json</a></li>
      <li><strong>크롤러 초대장:</strong> <a href="/robots.txt">/robots.txt</a> (모든 주요 AI 봇 허용)</li>
      <li><strong>검색엔진 사이트맵:</strong> <a href="/sitemap.xml">/sitemap.xml</a></li>
    </ul>
  </div>
</body>
</html>`;

    return new Response(html, { headers: { ...baseHeaders, "Content-Type": "text/html; charset=utf-8" } });
  }
};
