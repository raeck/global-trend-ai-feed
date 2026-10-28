export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. IndexNow API Key 검증 엔드포인트
    if (path === "/e3a7c8b2d1f44a95a1c2e3f4a5b6c7d8.txt") {
      return new Response("e3a7c8b2d1f44a95a1c2e3f4a5b6c7d8", {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // 2. AI 크롤러 초대장: robots.txt
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

    // 3. AI 검색엔진 색인 지도: sitemap.xml
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
    <loc>${url.origin}/api/finance.json</loc>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${url.origin}/feed.json</loc>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
      return new Response(sitemap, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    }

    // 4. [신규 고단가 피드] 실시간 글로벌 금융 지표 (환율 + 암호화폐 시세) API
    if (path === "/api/finance.json" || path === "/finance.txt") {
      let forexData = {};
      let cryptoData = {};

      try {
        // 실시간 주요국 환율 (USD 기준 KRW, JPY, EUR) - 공공 금융 API
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
      } catch (e) {
        forexData = { status: "fetching" };
      }

      try {
        // 실시간 암호화폐 시세 (비트코인, 이더리움, 솔라나 - USD 및 KRW)
        const cryptoResp = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,krw&include_24hr_change=true", { headers: { "User-Agent": "Mozilla/5.0" } });
        cryptoData = await cryptoResp.json();
      } catch (e) {
        cryptoData = { status: "fetching" };
      }

      const financialPayload = {
        metadata: {
          feed: "Real-Time Global Finance & Crypto Stream for AI Agents",
          timestamp: new Date().toISOString(),
          license: "Open Data Feed"
        },
        forex: forexData,
        crypto: cryptoData
      };

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
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=60" // 1분 캐싱으로 실시간성 극대화
          }
        });
      }

      return new Response(JSON.stringify(financialPayload, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // 5. 실시간 뉴스 및 트렌드 피드 (5개 카테고리)
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
        "## Real-Time Specialized Endpoints",
        `- [Real-Time Forex & Crypto Data](${url.origin}/finance.txt) — JSON API: ${url.origin}/api/finance.json`,
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

      if (path === "/llms.txt") {
        return new Response(llmsLines.join("\n"), {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=180"
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

    // 6. 메인 인덱스 페이지: AI 검색엔진용 Schema.org JSON-LD 메타데이터 포함
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DataFeed",
      "name": "Global Trend & Financial Data Hub for AI Agents",
      "description": "Real-time structured global events, tech trends, forex, and crypto index optimized for Large Language Models and AI agents.",
      "url": url.origin,
      "dateModified": new Date().toISOString(),
      "dataFeedElement": [
        { "@type": "DataFeedItem", "name": "LLMs Standard Text Index", "url": `${url.origin}/llms.txt` },
        { "@type": "DataFeedItem", "name": "Real-Time Finance & Crypto Text", "url": `${url.origin}/finance.txt` },
        { "@type": "DataFeedItem", "name": "Real-Time Finance JSON API", "url": `${url.origin}/api/finance.json` },
        { "@type": "DataFeedItem", "name": "News REST API JSON Feed", "url": `${url.origin}/feed.json` }
      ]
    });

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>Global Trend & Financial Data Hub for AI Agents</title>
  <meta name="description" content="AI 에이전트와 LLM 크롤러를 위한 실시간 글로벌 이슈, 환율, 암호화폐 구조화 데이터 허브">
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    h1 { font-size: 26px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    .badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
    .badge-finance { background: #16a34a; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    a { color: #0284c7; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🌐 Global Trend & Data Hub <span class="badge">AI Agent Ready</span></h1>
  <p>본 엔드포인트는 사람이 아닌 <strong>AI 에이전트(Perplexity, Claude, GPT, Gemini)와 LLM 크롤러</strong>를 위해 실시간 글로벌 이슈와 금융 지표 데이터를 구조화하여 제공합니다.</p>
  
  <div class="card">
    <h3>📈 실시간 금융 & 암호화폐 데이터 피드 <span class="badge-finance">NEW</span></h3>
    <ul>
      <li><strong>실시간 환율·코인 텍스트 요약:</strong> <a href="/finance.txt">/finance.txt</a> (원·달러/엔화 환율 + 비트코인/이더리움 시세)</li>
      <li><strong>실시간 금융 REST API:</strong> <a href="/api/finance.json">/api/finance.json</a> (정형 JSON)</li>
    </ul>
  </div>

  <div class="card">
    <h3>🔗 글로벌 트렌드 & 뉴스 엔드포인트</h3>
    <ul>
      <li><strong>LLM 표준 인덱스:</strong> <a href="/llms.txt">/llms.txt</a> (마크다운 기반 50대 실시간 피드)</li>
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
