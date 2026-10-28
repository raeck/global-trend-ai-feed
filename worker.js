export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const feeds = {
      global_top_news: "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
      world_news: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=ko&gl=KR&ceid=KR:ko",
      technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=ko&gl=KR&ceid=KR:ko",
      business: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko",
    };

    if (path === "/llms.txt" || path === "/feed.json") {
      let allItems = [];
      let llmsLines = [
        "# Global News & Trend Index for AI Agents (llms.txt)",
        `> Last Updated: ${new Date().toISOString()}`,
        "> Purpose: Real-time global news and tech trends for LLMs and AI Agents.",
        ""
      ];

      for (const [category, feedUrl] of Object.entries(feeds)) {
        try {
          const resp = await fetch(feedUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          const text = await resp.text();
          const items = [...text.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/g)].slice(0, 5);
          
          llmsLines.push(`## Category: ${category.toUpperCase()}`);
          for (const m of items) {
            const rawTitle = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
            const link = m[2].trim();
            const pubDate = m[3].trim();
            allItems.push({ category, title: rawTitle, link, published_at: pubDate });
            llmsLines.push(`- [${rawTitle}](${link}): ${pubDate}`);
          }
          llmsLines.push("");
        } catch (e) {}
      }

      if (path === "/llms.txt") {
        return new Response(llmsLines.join("\n"), {
          headers: { "Content-Type": "text/markdown; charset=utf-8", "Access-Control-Allow-Origin": "*" }
        });
      }

      return new Response(JSON.stringify({ updated_at: new Date().toISOString(), items: allItems }, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Global Trend & Issue Feed</title>
<style>body{font-family:sans-serif;max-width:700px;margin:50px auto;padding:0 20px;line-height:1.6;color:#1e293b;background:#f8fafc;}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);}
a{color:#0284c7;font-weight:600;text-decoration:none;}</style></head>
<body><div class="card">
<h1>🌐 Global Trend Feed for AI Agents</h1>
<p>AI 에이전트와 LLM 크롤러를 위한 실시간 글로벌 이슈 데이터 엔드포인트입니다.</p>
<ul>
<li><strong>LLM 표준 인덱스:</strong> <a href="/llms.txt">/llms.txt</a></li>
<li><strong>REST API 피드:</strong> <a href="/feed.json">/feed.json</a></li>
</ul>
</div></body></html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
