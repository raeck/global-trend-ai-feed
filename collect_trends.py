"""
AI 에이전트 & LLM 크롤러 전용 글로벌 이슈·트렌드 피드 수집기 (News & Trend Collector)
- 기능:
  1. 국내외 주요 글로벌 이슈 및 테크 트렌드 RSS 피드(Reuters, Google News 등) 자동 수집
  2. AI 에이전트가 1초 만에 파싱할 수 있는 최적화된 마크다운(llms.txt) 및 JSON API 데이터 생성
"""
import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "dist"
OUTPUT_DIR.mkdir(exist_ok=True)

# 주요 글로벌 이슈 및 테크 트렌드 공식 RSS 피드 소스
FEEDS = {
    "global_top_news": "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
    "world_news": "https://news.google.com/rss/headlines/section/topic/WORLD?hl=ko&gl=KR&ceid=KR:ko",
    "technology": "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=ko&gl=KR&ceid=KR:ko",
    "business": "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko",
}


def fetch_feed_items(category: str, url: str, limit: int = 5) -> list[dict]:
    items = []
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            xml_data = resp.read()
            root = ET.fromstring(xml_data)
            channel = root.find("channel")
            if channel is not None:
                for item in channel.findall("item")[:limit]:
                    title = item.findtext("title", "").strip()
                    link = item.findtext("link", "").strip()
                    pub_date = item.findtext("pubDate", "").strip()
                    description = item.findtext("description", "").strip()
                    items.append({
                        "category": category,
                        "title": title,
                        "link": link,
                        "published_at": pub_date,
                        "summary": description
                    })
    except Exception as e:
        print(f"[{category}] 피드 수집 알림: {e}")
    return items


def generate_feeds():
    print("🌐 글로벌 실시간 트렌드 및 이슈 피드를 수집 중입니다...")
    all_data = {
        "metadata": {
            "source": "Global Trend & Issue Feed for AI Agents",
            "updated_at": datetime.now().isoformat(),
            "schema_version": "1.0.0",
            "format": ["json", "llms.txt"]
        },
        "items": []
    }

    llms_txt_lines = [
        "# Global News & Trend Index for AI Agents (llms.txt)",
        f"> Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S KST')}",
        "> Purpose: Curated real-time global events, technology breakthroughs, and business trends optimized for LLM ingestion.",
        "",
        "## Real-Time Issues & Trends",
        ""
    ]

    for cat_name, feed_url in FEEDS.items():
        feed_items = fetch_feed_items(cat_name, feed_url, limit=5)
        all_data["items"].extend(feed_items)
        llms_txt_lines.append(f"### Category: {cat_name.upper()}")
        for item in feed_items:
            llms_txt_lines.append(f"- [{item['title']}]({item['link']}): {item['published_at']}")
        llms_txt_lines.append("")

    # 1. AI 크롤러 표준인 llms.txt 저장
    llms_path = OUTPUT_DIR / "llms.txt"
    llms_path.write_text("\n".join(llms_txt_lines), encoding="utf-8")
    print(f"✅ AI 크롤러 전용 마크다운 생성 완료: {llms_path}")

    # 2. AI 에이전트 호출용 API JSON 피드 저장
    json_path = OUTPUT_DIR / "feed.json"
    json_path.write_text(json.dumps(all_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ AI 에이전트 전용 JSON 피드 생성 완료: {json_path}")

    # 3. 브라우저로 접속한 사용자를 위한 깔끔한 HTML 인덱스 생성
    html_content = f"""<!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <title>Global Trend & Issue Feed for AI Agents</title>
      <meta name="description" content="AI 에이전트와 LLM 크롤러를 위한 실시간 글로벌 이슈 및 트렌드 구조화 데이터 엔드포인트">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #f8fafc; }}
        h1 {{ font-size: 26px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }}
        .badge {{ background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }}
        .card {{ background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
        a {{ color: #0284c7; text-decoration: none; font-weight: 600; }}
        a:hover {{ text-decoration: underline; }}
        pre {{ background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 13px; }}
      </style>
    </head>
    <body>
      <h1>🌐 Global Trend & Issue Feed <span class="badge">AI Agent Ready</span></h1>
      <p>본 엔드포인트는 사람이 아닌 <strong>AI 에이전트(Perplexity, Claude, GPT)와 LLM 크롤러</strong>를 위해 실시간 글로벌 이슈와 트렌드를 구조화하여 제공합니다.</p>
      
      <div class="card">
        <h3>🔗 AI 크롤러 & 에이전트 엔드포인트</h3>
        <ul>
          <li><strong>LLM 표준 인덱스:</strong> <a href="/llms.txt">/llms.txt</a> (마크다운 기반 초경량 파싱 데이터)</li>
          <li><strong>REST API 피드:</strong> <a href="/feed.json">/feed.json</a> (정형 JSON 구조 데이터)</li>
        </ul>
      </div>

      <div class="card">
        <h3>⚡ 실시간 수집 샘플 (총 {len(all_data['items'])}건)</h3>
        <p>마지막 업데이트: {datetime.now().strftime('%Y-%m-%d %H:%M:%S KST')}</p>
        <pre><code>curl -s https://[your-domain]/feed.json</code></pre>
      </div>
    </body>
    </html>"""
    (OUTPUT_DIR / "index.html").write_text(html_content, encoding="utf-8")
    print(f"✅ 웹 인덱스 페이지 생성 완료: {OUTPUT_DIR / 'index.html'}")


if __name__ == "__main__":
    generate_feeds()
