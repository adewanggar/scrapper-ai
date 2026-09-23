import re
import os
from time import sleep, time
from datetime import datetime
from requests import Session, Response
from loguru import logger

class InstagramComment:
    def __init__(self, cookie: str = None) -> None:
        if not cookie or not cookie.strip():
            raise ValueError(
                "Cookie Instagram diperlukan untuk melakukan scraping. "
                "Silakan masukkan Cookie akun Instagram Anda di form atau tab Pengaturan."
            )

        self.__cookie = cookie.strip()
        self.__min_id = None
        self.__result = {
            "platform": "instagram",
            "username": "",
            "full_name": "",
            "caption": "",
            "date_now": "",
            "create_at": "",
            "post_url": "",
            "comments": []
        }

        self.__requests = Session()
        self.__requests.headers.update({
            "Cookie": self.__cookie,
            "User-Agent": "Instagram 126.0.0.25.121 Android (23/6.0.1; 320dpi; 720x1280; samsung; SM-A310F; a3xelte; samsungexynos7580; en_GB; 110937453)"
        })

    def __format_date(self, milisecond: int) -> str:
        try:
            return datetime.fromtimestamp(milisecond).strftime("%Y-%m-%dT%H:%M:%S")
        except Exception:
            try:
                return datetime.fromtimestamp(milisecond / 1000).strftime("%Y-%m-%dT%H:%M:%S")
            except Exception:
                return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    def __decode_media_id(self, post_id: str) -> int:
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
        media_id = 0
        for char in post_id:
            if char in alphabet:
                media_id = media_id * 64 + alphabet.index(char)
        return media_id

    def __build_params(self) -> dict:
        params = {
            "can_support_threading": True,
            "sort_order": "popular"
        }
        if self.__min_id:
            params["min_id"] = self.__min_id
        return params

    def __get_reply_comment(self, comment_id: str, media_id: int):
        min_id = ''
        child_comments = []
        page_count = 0

        while page_count < 5:  # Cap replies pagination to avoid rate limits
            page_count += 1
            try:
                url = f'https://www.instagram.com/api/v1/media/{media_id}/comments/{comment_id}/child_comments/'
                params = {"min_id": min_id} if min_id else {}
                resp = self.__requests.get(url, params=params, timeout=15)
                if resp.status_code != 200:
                    break
                data = resp.json()

                for comment in data.get('child_comments', []):
                    user = comment.get("user", {})
                    child_comments.append({
                        "username": user.get("username", "anon"),
                        "nickname": user.get("full_name", user.get("username", "")),
                        "comment": comment.get("text", ""),
                        "create_time": self.__format_date(comment.get("created_at", round(time()))),
                        "avatar": user.get("profile_pic_url", ""),
                        "total_like": comment.get("comment_like_count", 0)
                    })

                if not data.get('has_more_head_child_comments'):
                    break

                min_id = data.get('next_min_child_cursor', '')
                if not min_id:
                    break

                sleep(0.5)
            except Exception as e:
                logger.warning(f"Error getting reply comments for {comment_id}: {e}")
                break

        return child_comments

    def __filter_comments(self, response: dict, media_id: int, max_comments: int) -> bool:
        comments_list = response.get('comments', [])

        for comment in comments_list:
            if len(self.__result['comments']) >= max_comments:
                return True

            user = comment.get("user", {})
            child_count = comment.get("child_comment_count", 0)
            comment_pk = comment.get("pk")

            replies = []
            if child_count and comment_pk:
                replies = self.__get_reply_comment(comment_pk, media_id)

            self.__result['comments'].append({
                "username": user.get("username", "anon"),
                "nickname": user.get("full_name", user.get("username", "")),
                "comment": comment.get("text", ""),
                "create_time": self.__format_date(comment.get("created_at", round(time()))),
                "avatar": user.get("profile_pic_url", ""),
                "total_like": comment.get("comment_like_count", 0),
                "total_reply": child_count,
                "replies": replies
            })

            sleep(0.3)

        if 'next_min_id' not in response or len(self.__result['comments']) >= max_comments:
            return True

        self.__min_id = response['next_min_id']
        return False

    def execute(self, post_id: str, max_comments: int = 300) -> dict:
        media_id = self.__decode_media_id(post_id)
        if not media_id:
            raise ValueError(f"Post ID / Shortcode Instagram tidak valid: {post_id}")

        logger.info(f"Mengambil komentar Instagram untuk shortcode {post_id} (Media ID: {media_id})...")
        pages = 0

        while pages < 20:  # Safety ceiling of 20 pages
            pages += 1
            url = f'https://www.instagram.com/api/v1/media/{media_id}/comments/'
            resp = self.__requests.get(url, params=self.__build_params(), timeout=20)

            if resp.status_code == 401 or resp.status_code == 403:
                raise ValueError("Gagal mengambil komentar Instagram: Cookie login tidak valid atau sudah kedaluwarsa.")
            if resp.status_code != 200:
                raise ValueError(f"Gagal mengambil komentar Instagram (Status code: {resp.status_code}).")

            data = resp.json()

            if not self.__result['caption']:
                caption_obj = data.get("caption") or {}
                user_obj = caption_obj.get("user") or {}
                self.__result["username"] = user_obj.get("username", "")
                self.__result["full_name"] = user_obj.get("full_name", "")
                self.__result["caption"] = caption_obj.get("text", "")
                self.__result["date_now"] = self.__format_date(round(time() * 1000))
                self.__result["create_at"] = self.__format_date(caption_obj.get("created_at", round(time())))
                self.__result["post_url"] = f"https://www.instagram.com/p/{post_id}/"

            is_finished = self.__filter_comments(data, media_id, max_comments)
            if is_finished:
                break

            sleep(0.5)

        logger.info(f"Berhasil mengambil {len(self.__result['comments'])} komentar Instagram.")
        return self.__result

def extract_instagram_shortcode(url_or_id: str) -> str:
    url_str = url_or_id.strip()
    m = re.search(r'instagram\.com/(?:p|reel|reels)/([^/?#&]+)', url_str)
    if m:
        return m.group(1)
    m = re.search(r'^[A-Za-z0-9_-]+$', url_str)
    if m:
        return m.group(0)
    return None
