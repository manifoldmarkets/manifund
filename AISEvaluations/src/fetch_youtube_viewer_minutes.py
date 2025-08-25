import argparse
import os
import time
from datetime import datetime, timezone
import pandas as pd
import isodate
from tqdm import tqdm
from dotenv import load_dotenv

# Google API
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def parse_args():
    ap = argparse.ArgumentParser(description="Fetch YouTube videos and estimate viewer-minutes")
    ap.add_argument("--channel-id", type=str, default=None, help="YouTube channel ID starting with UC...")
    ap.add_argument("--avg-watch", type=float, default=0.50, help="Assumed average watch fraction (0.50 = 50%)")
    ap.add_argument("--out", type=str, default="data/out.csv", help="Output CSV path")
    ap.add_argument("--max", type=int, default=None, help="Optional limit of videos to fetch (for testing)")
    ap.add_argument("--sleep", type=float, default=0.0, help="Seconds to sleep between API pages (avoid quota spikes)")
    return ap.parse_args()

def get_env():
    load_dotenv()
    api_key = os.getenv("YOUTUBE_API_KEY")
    default_channel = os.getenv("DEFAULT_CHANNEL_ID", "UCLB7AzTwc6VFZrBsO2ucBMg")  # Robert Miles by default
    if not api_key:
        raise RuntimeError("Missing YOUTUBE_API_KEY in environment (.env)")
    return api_key, default_channel

def get_uploads_playlist_id(youtube, channel_id: str) -> str:
    resp = youtube.channels().list(part="contentDetails", id=channel_id).execute()
    items = resp.get("items", [])
    if not items:
        raise RuntimeError(f"Channel not found or no contentDetails for {channel_id}")
    return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]

def fetch_videos(api_key: str, channel_id: str, limit: int | None = None, sleep_s: float = 0.0):
    youtube = build("youtube", "v3", developerKey=api_key)
    uploads_id = get_uploads_playlist_id(youtube, channel_id)

    video_ids = []
    next_token = None
    while True:
        req = youtube.playlistItems().list(
            part="contentDetails",
            playlistId=uploads_id,
            maxResults=50,
            pageToken=next_token,
        )
        resp = req.execute()
        for item in resp.get("items", []):
            video_ids.append(item["contentDetails"]["videoId"])
        next_token = resp.get("nextPageToken")
        if limit and len(video_ids) >= limit:
            video_ids = video_ids[:limit]
            break
        if not next_token:
            break
        if sleep_s > 0:
            time.sleep(sleep_s)

    results = []
    for batch in tqdm(list(chunked(video_ids, 50)), desc="Fetching video details"):
        vreq = build("youtube", "v3", developerKey=api_key).videos().list(
            part="snippet,contentDetails,statistics",
            id=",".join(batch),
        )
        vresp = vreq.execute()
        for it in vresp.get("items", []):
            vid = it["id"]
            sn = it["snippet"]
            cd = it["contentDetails"]
            st = it.get("statistics", {})

            title = sn.get("title", "")
            published_at = sn.get("publishedAt")
            try:
                duration_iso = cd.get("duration", "PT0S")
                duration_sec = isodate.parse_duration(duration_iso).total_seconds()
            except Exception:
                duration_sec = 0.0
            duration_min = duration_sec / 60.0 if duration_sec else 0.0

            views = int(st.get("viewCount", 0))

            results.append({
                "video_id": vid,
                "title": title,
                "published_at": published_at,
                "duration_min": round(duration_min, 3),
                "views": views,
            })

    return pd.DataFrame(results)

def compute_viewer_minutes(df: pd.DataFrame, avg_watch: float) -> pd.DataFrame:
    df = df.copy()
    df["avg_watch_fraction"] = avg_watch
    df["est_viewer_minutes"] = (df["views"] * df["duration_min"] * df["avg_watch_fraction"]).round(2)
    df.sort_values(["est_viewer_minutes"], ascending=False, inplace=True)
    return df

def main():
    args = parse_args()
    api_key, default_channel = get_env()
    channel_id = args.channel_id or default_channel

    try:
        raw = fetch_videos(api_key=api_key, channel_id=channel_id, limit=args.max, sleep_s=args.sleep)
    except HttpError as e:
        print("YouTube API error:", e)
        return
    except Exception as e:
        print("Error:", e)
        return

    df = compute_viewer_minutes(raw, args.avg_watch)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    df.to_csv(args.out, index=False, encoding="utf-8-sig")

    total_views = int(df["views"].sum())
    total_vm = float(df["est_viewer_minutes"].sum())
    print(f"✅ Wrote {len(df)} videos to {args.out}")
    print(f"Totals — views: {total_views:,} | est. viewer-minutes (@{args.avg_watch:.0%}): {total_vm:,.0f}")

if __name__ == "__main__":
    main()
