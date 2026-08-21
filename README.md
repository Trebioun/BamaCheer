# Bama Cheer Extreme — Landing Page

A one-page site with a client-editable content panel (no code required to update text, photos, or contact info).

## What's in here

```
index.html          → the page structure
css/style.css        → all styling
js/main.js           → loads data/content.json into the page + handles the contact form
data/content.json    → EVERY editable piece of content (hero text, about, programs, testimonials, contact info)
admin/               → the client's content editor (Decap CMS)
images/              → photos go here
```

The page pulls its text and contact details from `data/content.json` at load time. That's the file the client will edit through the `/admin` panel — you never touch HTML for a routine content update.

## 1. Push to GitHub

```bash
cd bama-cheer-extreme
git init
git add .
git commit -m "Initial landing page"
```

Create a new repo on GitHub, then push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bama-cheer-extreme.git
git branch -M main
git push -u origin main
```

## 2. Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Connect GitHub, pick this repo
3. Build settings: leave the build command blank, publish directory = `/` (this is a static site, nothing to build)
4. Deploy — you'll get a live URL like `bama-cheer-extreme.netlify.app`
5. Later: **Site settings → Domain management** to add the client's real domain

## 3. Turn on the content editor (Decap CMS)

1. In Netlify: **Site settings → Identity → Enable Identity**
2. Under Identity → **Registration**, set to **Invite only** (so random people can't sign up)
3. Under Identity → **Services**, enable **Git Gateway** — this lets the CMS commit content changes back to GitHub on the client's behalf
4. Go to **Identity** tab → **Invite users** → send the client an invite email. They'll set a password and be able to log in.
5. The client logs in at `yoursite.netlify.app/admin` and edits everything through a form UI. Saving triggers a new commit → Netlify auto-rebuilds → live in ~30 seconds.

## 4. Connect the contact form

The form currently posts to a placeholder Formspree endpoint. To make it real:

1. Sign up free at [formspree.io](https://formspree.io)
2. Create a new form, copy the form ID
3. In `index.html`, find:
   ```html
   <form class="contact-form" id="contactForm" action="https://formspree.io/f/REPLACE_WITH_FORM_ID" method="POST">
   ```
   Replace `REPLACE_WITH_FORM_ID` with the real ID
4. Commit and push — Netlify redeploys automatically

(Web3Forms is a free alternative if you'd rather not use Formspree — same idea, different `action` URL and a hidden `access_key` input.)

## 5. Swap in real content

- Replace placeholder text in `data/content.json` (or just do it through `/admin` once it's live — that's the whole point)
- Drop real photos in `images/`, then set `hero.backgroundImage` to the new filename
- Update `contact.mapEmbedSrc` with the gym's actual Google Maps embed link:
  Google Maps → search the address → Share → Embed a map → copy the `src` URL from the iframe code

## Notes

- No build step, no npm install — it's plain HTML/CSS/JS, so it'll run anywhere static files are served.
- Everything is mobile-responsive down to small phones.
- If you ever want a blog or more pages, this same repo can grow — the `/admin` setup extends to more collections without starting over.
