# AI Safety Viewer-Minutes — Starter Project

This tiny project fetches all videos from a YouTube channel and computes **estimated viewer‑minutes**:

```
viewer_minutes = views * duration_minutes * average_watch_fraction
```

It’s set up for **Robert Miles – AI Safety** by default, but works for any channel.

---

## 1) Prereqs (Windows/Mac/Linux)

- Install **Python 3.10+**
- Create a free **YouTube Data API v3** key:
  1. Go to https://console.cloud.google.com/
  2. Create a project → _APIs & Services_ → _Enable APIs & Services_ → search **“YouTube Data API v3”** → **Enable**
  3. _APIs & Services_ → _Credentials_ → **Create credentials → API key**
  4. (Optional) **Restrict** the key to “YouTube Data API v3” + your IP

> Channel ID for **Robert Miles AI Safety** is: `UCLB7AzTwc6VFZrBsO2ucBMg`

---

## 2) Setup

In a terminal (PowerShell on Windows):

```bash
cd ai-safety-viewer-minutes

# (optional) create virtual env
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Save your API key
copy .env.example .env   # (Windows PowerShell: cp .env.example .env)
# then open .env in a text editor and paste your key
```

---

## 3) Run

**Robert Miles channel (default):**

```bash
python src/fetch_youtube_viewer_minutes.py --avg-watch 0.50 --out data/robert_miles_viewer_minutes.csv
```

**Any other channel:**

```bash
python src/fetch_youtube_viewer_minutes.py --channel-id <UC......> --avg-watch 0.55 --out data/out.csv
```

Flags:

- `--channel-id` : YouTube channel ID (starts with UC…)
- `--avg-watch` : Assumed average watch fraction (0.50 = 50%). Defaults to 0.50.
- `--max` : (optional) limit number of videos while testing.
- `--sleep` : seconds to sleep between API pages (default 0.0).

Outputs:

- A CSV at `data/...csv` with columns:
  - title, video_id, published_at, duration_min, views, avg_watch_fraction, est_viewer_minutes
- A one-line **summary** is printed (total views, total est. viewer‑minutes).

---

## 4) Sanity checks (what to look for)

- The script should fetch **~tens of videos** (Robert’s channel ~50+).
- Top rows by `est_viewer_minutes` should be **popular + longer** videos.
- No durations should be zero; Shorts will be ~0.5–1.0 min.
- Try sensitivity:
  ```bash
  for p in 0.4 0.5 0.6; do python src/fetch_youtube_viewer_minutes.py --avg-watch $p --out data/robert_miles_${p}.csv; done
  ```

---

## 5) Common issues

- **403 quotaExceeded**: You’ve hit daily API quota. Try later or apply for higher quota.
- **API key invalid**: Recreate key, ensure you pasted into `.env` as `YOUTUBE_API_KEY=...`
- **Channel not found**: Double-check `--channel-id` (must start with `UC`).

---

## 6) Next steps

- Aggregate viewer‑minutes per **year**, **topic**, or **format**.
- Add TikTok/Shorts ingestion later for cross‑platform comparisons.
- Plug the CSV into a **cost‑effectiveness** model (cost per viewer‑minute).
