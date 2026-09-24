import os
import re
from datetime import datetime
import requests
from loguru import logger

DEFAULT_YOUTUBE_API_KEY = os.environ.get(
    "YOUTUBE_API_KEY",
    "AIzaSyC-mCSjAgmxEWd8SWY_3PRiDmh_lKGItz0"
)

def extract_youtube_video_id(url_or_id: str) -> str:
    """
    Ekstrak ID video YouTube (11 karakter) dari berbagai format URL atau input teks.
    Mendukung:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://m.youtube.com/watch?v=VIDEO_ID
    - https://www.youtube.com/live/VIDEO_ID
    - Langsung 11 karakter ID: VIDEO_ID
    """
    if not url_or_id:
        return None
    url_or_id = url_or_id.strip()

    # 1. Cek langsung 11 karakter alphanumeric
    if re.match(r"^[a-zA-Z0-9_-]{11}$", url_or_id):
        return url_or_id

    # 2. Cek variasi pattern URL
    patterns = [
        r"(?:v=|\/v\/|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})",
        r"m\.youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)

    return None

class YouTubeComment:
    """
    Scraper komentar YouTube resmi menggunakan YouTube Data API v3.
    """
    def __init__(self, api_key: str = None) -> None:
        self.api_key = (api_key or DEFAULT_YOUTUBE_API_KEY).strip()
        if not self.api_key:
            raise ValueError(
                "Google Console API Key untuk YouTube Data API v3 belum dikonfigurasi."
            )

    def _fetch_video_details(self, video_id: str) -> dict:
        url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "snippet,statistics",
            "id": video_id,
            "key": self.api_key
        }
        resp = requests.get(url, params=params, timeout=15)
        data = resp.json()

        if resp.status_code != 200:
            error_msg = data.get("error", {}).get("message", f"HTTP {resp.status_code}")
            errors = data.get("error", {}).get("errors", [])
            reason = errors[0].get("reason", "") if errors else ""
            if reason == "quotaExceeded":
                raise Exception("Batas kuota harian YouTube Data API telah tercapai (quotaExceeded).")
            if reason == "keyInvalid":
                raise Exception("API Key Google Console / YouTube Data API tidak valid (keyInvalid).")
            raise Exception(f"Gagal mengambil metadata video YouTube: {error_msg}")

        items = data.get("items", [])
        if not items:
            raise Exception(f"Video YouTube dengan ID '{video_id}' tidak ditemukan atau bersifat privat.")

        item = items[0]
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})

        return {
            "title": snippet.get("title", f"YouTube Video {video_id}"),
            "description": snippet.get("description", ""),
            "channel_title": snippet.get("channelTitle", "Kreator YouTube"),
            "channel_id": snippet.get("channelId", ""),
            "published_at": snippet.get("publishedAt", ""),
            "comment_count": int(stats.get("commentCount", 0)) if "commentCount" in stats else None,
            "view_count": int(stats.get("viewCount", 0)) if "viewCount" in stats else None,
            "like_count": int(stats.get("likeCount", 0)) if "likeCount" in stats else None,
        }

    def execute(self, video_id_or_url: str, max_comments: int = 500) -> dict:
        video_id = extract_youtube_video_id(video_id_or_url)
        if not video_id:
            raise ValueError(
                "Link atau ID video YouTube tidak valid. Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau https://youtu.be/dQw4w9WgXcQ"
            )

        logger.info(f"Memulai scrape komentar YouTube untuk Video ID: {video_id}")
        video_info = self._fetch_video_details(video_id)

        all_comments = []
        next_page_token = None
        base_url = "https://www.googleapis.com/youtube/v3/commentThreads"

        while len(all_comments) < max_comments:
            page_size = min(100, max_comments - len(all_comments))
            params = {
                "part": "snippet,replies",
                "videoId": video_id,
                "maxResults": page_size,
                "textFormat": "plainText",
                "order": "relevance",
                "key": self.api_key
            }
            if next_page_token:
                params["pageToken"] = next_page_token

            resp = requests.get(base_url, params=params, timeout=15)
            data = resp.json()

            if resp.status_code != 200:
                errors = data.get("error", {}).get("errors", [])
                reason = errors[0].get("reason", "") if errors else ""
                if reason == "commentsDisabled":
                    logger.warning(f"Komentar dinonaktifkan pada video {video_id}")
                    break
                if reason == "quotaExceeded":
                    logger.warning("Batas kuota YouTube API tercapai di tengah scraping.")
                    break
                error_msg = data.get("error", {}).get("message", f"HTTP {resp.status_code}")
                raise Exception(f"Gagal mengambil komentar YouTube: {error_msg}")

            items = data.get("items", [])
            if not items:
                break

            for item in items:
                snippet_top = item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                comment_id = item.get("id") or item.get("snippet", {}).get("topLevelComment", {}).get("id") or f"yt_{len(all_comments)+1}"

                author_name = snippet_top.get("authorDisplayName", "Pengguna YouTube")
                clean_username = author_name.lstrip("@").replace(" ", "_").lower() if author_name else "user"
                comment_text = snippet_top.get("textOriginal") or snippet_top.get("textDisplay") or ""

                pub_time = snippet_top.get("publishedAt", "")
                if pub_time:
                    create_time_clean = pub_time.replace("Z", "").split(".")[0]
                else:
                    create_time_clean = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

                # Parse replies if available
                replies_list = []
                replies_data = item.get("replies", {}).get("comments", [])
                for reply in replies_data:
                    r_snip = reply.get("snippet", {})
                    r_author = r_snip.get("authorDisplayName", "Pengguna YouTube")
                    r_text = r_snip.get("textOriginal") or r_snip.get("textDisplay") or ""
                    r_time = r_snip.get("publishedAt", "")
                    r_time_clean = r_time.replace("Z", "").split(".")[0] if r_time else create_time_clean

                    replies_list.append({
                        "comment_id": reply.get("id", f"{comment_id}_r{len(replies_list)+1}"),
                        "username": r_author.lstrip("@").replace(" ", "_").lower(),
                        "nickname": r_author,
                        "comment": r_text,
                        "create_time": r_time_clean,
                        "avatar": r_snip.get("authorProfileImageUrl", ""),
                        "like_count": int(r_snip.get("likeCount", 0)),
                        "total_reply": 0,
                        "replies": []
                    })

                all_comments.append({
                    "comment_id": comment_id,
                    "username": clean_username,
                    "nickname": author_name,
                    "comment": comment_text,
                    "create_time": create_time_clean,
                    "avatar": snippet_top.get("authorProfileImageUrl", ""),
                    "like_count": int(snippet_top.get("likeCount", 0)),
                    "total_reply": int(item.get("snippet", {}).get("totalReplyCount", len(replies_list))),
                    "replies": replies_list
                })

                if len(all_comments) >= max_comments:
                    break

            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break

        video_url = f"https://www.youtube.com/watch?v={video_id}"

        result = {
            "platform": "youtube",
            "video_id": video_id,
            "video_url": video_url,
            "caption": video_info["title"],
            "description": video_info["description"][:500] if video_info["description"] else "",
            "author_name": video_info["channel_title"],
            "channel_id": video_info["channel_id"],
            "published_at": video_info["published_at"],
            "date_now": datetime.now().isoformat(),
            "comments_count": len(all_comments),
            "total_comments_on_youtube": video_info["comment_count"],
            "comments": all_comments,
            "has_more": 1 if next_page_token else 0
        }

        logger.info(f"Berhasil mengumpulkan {len(all_comments)} komentar YouTube untuk {video_id}")
        return result
