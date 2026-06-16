import logging
import feedparser
from flask import Flask, jsonify, render_template, request
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/notes")
def get_release_notes():
    try:
        # Fetch RSS/Atom XML feed content
        response = requests.get(FEED_URL, timeout=15)
        response.raise_for_status()
        
        # Parse XML with feedparser
        feed = feedparser.parse(response.content)
        
        entries = []
        for entry in feed.entries:
            # Parse components
            title = entry.get("title", "No Title")
            link = entry.get("link", "")
            updated = entry.get("updated", entry.get("published", ""))
            content_val = ""
            
            # Content or summary
            if "content" in entry:
                content_val = entry.content[0].value
            elif "summary" in entry:
                content_val = entry.summary
                
            entries.append({
                "id": entry.get("id", title),
                "title": title,
                "link": link,
                "updated": updated,
                "content": content_val
            })
            
        return jsonify({
            "success": True,
            "title": feed.feed.get("title", "BigQuery Release Notes"),
            "entries": entries
        })
    except Exception as e:
        logger.error(f"Error fetching/parsing release notes: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
