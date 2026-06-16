import json
import xml.etree.ElementTree as ET
import urllib.request
import os

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
OUTPUT_DIR = "static/api"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "notes.json")

def fetch_and_build_static_json():
    print(f"Fetching XML feed from: {FEED_URL}")
    try:
        # Fetch the feed manually using standard library
        req = urllib.request.Request(
            FEED_URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
            
        # Parse XML
        root = ET.fromstring(xml_data)
        
        # Namespace map for Atom feeds
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        feed_title = root.find('atom:title', ns)
        feed_title_text = feed_title.text if feed_title is not None else "BigQuery Release Notes"
        
        entries = []
        for entry in root.findall('atom:entry', ns):
            title_el = entry.find('atom:title', ns)
            id_el = entry.find('atom:id', ns)
            updated_el = entry.find('atom:updated', ns)
            
            # Find link URL
            link_el = entry.find('atom:link', ns)
            link_href = link_el.attrib.get('href', '') if link_el is not None else ''
            
            # Find content or summary
            content_el = entry.find('atom:content', ns)
            if content_el is None:
                content_el = entry.find('atom:summary', ns)
                
            content_text = content_el.text if content_el is not None else ""
            
            entries.append({
                "id": id_el.text if id_el is not None else (title_el.text if title_el is not None else ""),
                "title": title_el.text if title_el is not None else "No Title",
                "link": link_href,
                "updated": updated_el.text if updated_el is not None else "",
                "content": content_text
            })
            
        # Ensure directories exist
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Write output file
        result = {
            "success": True,
            "title": feed_title_text,
            "entries": entries
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully compiled {len(entries)} updates to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error compiling feed to static JSON: {e}")
        # Write basic error fallback
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                "success": False,
                "error": str(e),
                "entries": []
            }, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    fetch_and_build_static_json()
