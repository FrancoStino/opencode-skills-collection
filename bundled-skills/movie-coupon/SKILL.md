---
name: movie-coupon
description: "Fetch movie ticket coupons from platforms like Taopiaopiao and Maoyan. Returns coupon links and QR code images for users to redeem via WeChat."
category: shopping
risk: safe
source: community
source_repo: moooai/movie-coupon
source_type: community
date_added: "2026-10-16"
author: moooai
tags: [coupons, movie, cinema, entertainment]
tools: [claude, codex]
---

# Movie Ticket Coupons (Taopiaopiao / Maoyan)

## Overview

Fetches movie-ticket discount coupons usable across 10,000+ cinemas in China (Taopiaopiao/Maoyan ecosystem), typically 20% off or better, delivered as claim-page links.

The skill is adapted from the open-source repository `moooai/movie-coupon`. It ships with a fetch script (`scripts/fetch_coupons.py`) and full API documentation (`references/api_documentation.md`). No API keys or credentials are required - the public endpoint is free to call.

## When to Use This Skill

- Use when the user asks about movie-ticket coupons, red packets (hongbao) or hidden promo codes
- Use when the user wants to know which platform has the best movie-ticket deal today
- Use when the user cannot copy a coupon code and needs a QR code or H5 claim page instead

## How It Works

### Step 1: Fetch the coupon feed

Call `GET https://agskills.moontai.top/coupon/movie` (no auth). `scripts/fetch_coupons.py` does this and additionally appends anonymous attribution parameters (`ch`, `u`) used for install/order attribution statistics.

### Step 2: Parse and organize the response

The response is JSON. The response is a JSON array; each item has `title` and `guideline`, and claim entries carry `coupon_url` (and optionally `coupon_h5_qrcode_img_url` for the more-coupons WeChat QR).

### Step 3: Present coupons to the user

For each coupon show: title, coupon code (verbatim), and claim guideline. For entries with `coupon_url` / `coupon_qrcode_img_url`, show the claim-page link and/or QR code image. Highlight featured coupons (marked with 🔥 or "主推") first.

## The Coupon Code Verbatim Rule (critical)

`coupon_code` values are platform-specific taokouling (口令) strings that may contain `%`, `￥`, `＄`, `✔`, `！` and other special characters. They are only recognized by the target app if copied exactly.

- ❌ Do not add, remove, reformat, translate or "beautify" any character of `coupon_code`
- ❌ Do not URL-encode or escape special characters
- ✅ Render the string exactly as returned by the API, together with its `guideline`

## Examples

### Example: user asks for coupons

**User:** "Any movie-ticket discounts?"

**Flow:** call `GET https://agskills.moontai.top/coupon/movie`, then present each coupon as:

```
【Movie tickets】
1. <title>
   Coupon code: <coupon_code verbatim>
   How to claim: <guideline>
```

For entries carrying `coupon_url`/`coupon_qrcode_img_url`, additionally offer the claim link (best opened in WeChat) and the QR code image.

## Best Practices

- ✅ Show the claim guideline next to every coupon code
- ✅ Fall back to the QR/H5 claim page when the user cannot copy codes
- ✅ Skip platforms whose coupon list is empty and say so
- ❌ Never modify a `coupon_code` string in any way
- ❌ Do not cache coupons for long - feeds refresh and codes expire

## Limitations

- Coupons are for mainland-China platforms; apps (Meituan, Taobao, JD, WeChat, etc.) and a Chinese phone number may be required to redeem
- Feed availability depends on the upstream API; on failure, tell the user to retry later
- This skill does not replace the apps themselves - codes must be redeemed inside the official apps

## Security & Safety Notes

- The only network operation is a read-only `GET` to the public endpoint `https://agskills.moontai.top/coupon/movie` (domain `agskills.moontai.top`); no credentials, tokens or user data are sent beyond anonymous attribution parameters (`ch`, `u`) documented in the repo
- `scripts/fetch_coupons.py` performs no local file mutation, no shell execution and no installs
- `risk: safe` reflects read-only network documentation; re-evaluate if the upstream API changes

## Common Pitfalls

- **Problem:** Coupon code does not work in the target app
  **Solution:** Check that the code was copied with every special character intact; offer the QR/H5 claim page as fallback

## Related Skills

- `@obtain-coupons-all-in-one` - all-in-one coupon fetcher covering takeout, travel, movie and parcel
