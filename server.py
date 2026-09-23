import os
import re
import json
import mimetypes
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import requests
from loguru import logger

from tiktokcomment import TiktokComment
from tiktokcomment.typing import Comments

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

APP_PIN = os.environ.get('APP_PIN', '112233')

def resolve_tiktok_aweme_id(raw_input: str) -> str:
    """
    Mendukung berbagai variasi input TikTok:
    - Angka ID langsung (misal: 7688421946832293141)
    - URL web panjang (misal: https://www.tiktok.com/@user/video/7688421946832293141)
    - Shortlink aplikasi (misal: https://vt.tiktok.com/ZSbJY5aH9/ atau vm.tiktok.com)
    """
    raw_input = raw_input.strip()

    # 1. Cek langsung jika input sudah mengandung 15-22 digit angka
    match = re.search(r"(\d{15,22})", raw_input)
    if match:
        return match.group(1)

    # 2. Cek jika input adalah URL shortlink atau web link
    if "tiktok.com" in raw_input or raw_input.startswith("http://") or raw_input.startswith("https://"):
        url = raw_input
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        # Coba HEAD request terlebih dahulu (cepat & hemat bandwidth)
        try:
            resp = requests.head(url, headers=headers, allow_redirects=True, timeout=10)
            match = re.search(r"(\d{15,22})", resp.url)
            if match:
                logger.info(f"Resolved TikTok shortlink {url} -> {resp.url} (aweme_id: {match.group(1)})")
                return match.group(1)
        except Exception as e:
            logger.warning(f"HEAD request failed resolving TikTok URL {url}: {e}")

        # Fallback ke GET request
        try:
            resp = requests.get(url, headers=headers, stream=True, allow_redirects=True, timeout=12)
            match = re.search(r"(\d{15,22})", resp.url)
            if match:
                logger.info(f"Resolved TikTok shortlink (GET) {url} -> {resp.url} (aweme_id: {match.group(1)})")
                return match.group(1)

            for history_resp in resp.history:
                match = re.search(r"(\d{15,22})", history_resp.url)
                if match:
                    return match.group(1)
                loc = history_resp.headers.get("Location", "")
                match = re.search(r"(\d{15,22})", loc)
                if match:
                    return match.group(1)

            chunk = resp.raw.read(15000).decode("utf-8", errors="ignore")
            match = re.search(r"(\d{15,22})", chunk)
            if match:
                return match.group(1)
        except Exception as e:
            logger.error(f"Error resolving TikTok shortlink {url}: {e}")

    return None

class TikTokApiHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Access-Pin')

    def _is_authorized(self):
        if not APP_PIN:
            return True
        pin_header = self.headers.get('X-Access-Pin', '').strip()
        if pin_header == APP_PIN:
            return True
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if params.get('pin') and params.get('pin')[0].strip() == APP_PIN:
            return True
        return False

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status_code: int, data: dict or list):
        payload = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/') and path != '/api/status':
            if not self._is_authorized():
                self._send_json(401, {"error": "Unauthorized: PIN Akses diperlukan atau tidak valid."})
                return

        if path == '/api/files':
            self.handle_list_files()
        elif path.startswith('/api/ai/analysis/'):
            filename = urllib.parse.unquote(path[len('/api/ai/analysis/'):])
            self.handle_get_ai_analysis(filename)
        elif path.startswith('/api/files/'):
            filename = urllib.parse.unquote(path[len('/api/files/'):])
            self.handle_get_file(filename)
        elif path == '/api/status':
            self._send_json(200, {"status": "ok", "time": datetime.now().isoformat()})
        elif path.startswith('/api/'):
            self._send_json(404, {"error": "API route not found"})
        else:
            self.handle_static(path)

    def handle_static(self, path):
        dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web', 'dist')
        if not os.path.exists(dist_dir):
            self._send_json(404, {"error": "Frontend build not found. Run 'npm run build' inside web directory."})
            return

        rel_path = path.lstrip('/')
        target_path = os.path.join(dist_dir, rel_path)

        if not os.path.exists(target_path) or os.path.isdir(target_path):
            target_path = os.path.join(dist_dir, 'index.html')

        try:
            content_type, _ = mimetypes.guess_type(target_path)
            content_type = content_type or 'application/octet-stream'
            with open(target_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self._send_json(500, {"error": f"Error serving static file: {str(e)}"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/'):
            if not self._is_authorized():
                self._send_json(401, {"error": "Unauthorized: PIN Akses diperlukan atau tidak valid."})
                return

        if path == '/api/scrape':
            self.handle_scrape()
        elif path == '/api/ai/analyze':
            self.handle_ai_analyze()
        else:
            self._send_json(404, {"error": "Not Found"})

    def handle_get_ai_analysis(self, filename: str):
        from ai_analyzer import load_cached_analysis
        cached = load_cached_analysis(filename)
        if cached:
            self._send_json(200, {"found": True, "analysis": cached})
        else:
            self._send_json(200, {"found": False})

    def handle_ai_analyze(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        filename = body.get('filename')
        sample_size = int(body.get('sample_size', 50))
        preferred_model = body.get('model', 'gemini-3.8-flash')

        if not filename:
            self._send_json(400, {"error": "Nama file wajib dicantumkan."})
            return

        try:
            from ai_analyzer import analyze_video_comments
            result = analyze_video_comments(filename, sample_size=sample_size, preferred_model=preferred_model)
            self._send_json(200, {"success": True, "analysis": result})
        except Exception as e:
            logger.error(f"Error analyzing AI comments: {e}")
            self._send_json(500, {"error": str(e)})

    def handle_list_files(self):
        try:
            files_info = []
            for fname in os.listdir(DATA_DIR):
                if fname.lower().endswith('.json') and not fname.lower().endswith('_ai_analysis.json'):
                    fpath = os.path.join(DATA_DIR, fname)
                    stat = os.stat(fpath)
                    meta = {
                        "filename": fname,
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "caption": "",
                        "comments_count": 0
                    }
                    try:
                        # Quick peek to grab caption and comment count
                        with open(fpath, 'r', encoding='utf-8') as f:
                            content = json.load(f)
                            meta["caption"] = content.get("caption", "")
                            meta["video_url"] = content.get("video_url", "")
                            meta["comments_count"] = len(content.get("comments", []))
                    except Exception:
                        pass
                    files_info.append(meta)

            # Sort by modified time descending (newest first)
            files_info.sort(key=lambda x: x["modified"], reverse=True)
            self._send_json(200, {"files": files_info})
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            self._send_json(500, {"error": str(e)})

    def handle_get_file(self, filename: str):
        # Prevent directory traversal
        safe_filename = os.path.basename(filename)
        fpath = os.path.join(DATA_DIR, safe_filename)

        if not os.path.exists(fpath):
            self._send_json(404, {"error": f"File '{safe_filename}' not found"})
            return

        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = json.load(f)
            self._send_json(200, content)
        except Exception as e:
            logger.error(f"Error reading {safe_filename}: {e}")
            self._send_json(500, {"error": str(e)})

    def handle_scrape(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        platform = body.get('platform', 'tiktok').lower()
        raw_input = str(body.get('url') or body.get('aweme_id', '')).strip()

        if platform == 'instagram':
            from instagramcomment import InstagramComment, extract_instagram_shortcode
            post_id = extract_instagram_shortcode(raw_input)
            if not post_id:
                self._send_json(400, {"error": "Format link atau shortcode Instagram tidak valid. Contoh: https://www.instagram.com/reel/C1ACfnvh4KE/ atau Cm2cJmABD1p"})
                return

            cookie = body.get('cookie') or os.environ.get('INSTAGRAM_COOKIE', '')
            if not cookie or not cookie.strip():
                self._send_json(400, {"error": "Cookie Instagram diperlukan untuk mengambil komentar. Silakan masukkan Cookie akun Instagram Anda."})
                return

            try:
                ig_scraper = InstagramComment(cookie=cookie)
                data = ig_scraper.execute(post_id=post_id, max_comments=300)
                final_filename = f"ig_{post_id}.json"
                final_path = os.path.join(DATA_DIR, final_filename)

                with open(final_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=4)

                logger.info(f"Instagram scraped and saved successfully: {final_path}")
                self._send_json(200, {
                    "success": True,
                    "platform": "instagram",
                    "id": post_id,
                    "filename": final_filename,
                    "data": data
                })
            except Exception as e:
                logger.error(f"Error scraping Instagram {post_id}: {e}")
                self._send_json(500, {"error": f"Gagal scrape Instagram: {str(e)}"})
            return

        # Default: TikTok Scraper
        aweme_id = resolve_tiktok_aweme_id(raw_input)
        if not aweme_id:
            self._send_json(400, {
                "error": "Format link atau ID video TikTok tidak valid. Pastikan link dapat diakses atau mengandung ID video yang benar (contoh: https://vt.tiktok.com/ZSbJY5aH9/ atau 7688421946832293141)"
            })
            return

        logger.info(f"API Scrape request received for TikTok aweme_id: {aweme_id}")

        try:
            scraper = TiktokComment()
            comments: Comments = scraper(aweme_id=aweme_id)
            final_path = os.path.join(DATA_DIR, f"{aweme_id}.json")

            with open(final_path, 'w', encoding='utf-8') as f:
                json.dump(comments.dict, f, ensure_ascii=False, indent=4)

            logger.info(f"TikTok scraped and saved successfully: {final_path}")
            self._send_json(200, {
                "success": True,
                "platform": "tiktok",
                "aweme_id": aweme_id,
                "filename": f"{aweme_id}.json",
                "data": comments.dict
            })
        except Exception as e:
            logger.error(f"Error scraping TikTok {aweme_id}: {e}")
            self._send_json(500, {"error": f"Gagal scrape video TikTok: {str(e)}"})

def run_server(port=5000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, TikTokApiHandler)
    logger.info(f"Backend API server berjalan di http://localhost:{port}")
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run_server(port)
