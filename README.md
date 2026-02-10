# CxN Clan Wiki

A comprehensive wiki and resource hub for the CxN clan in Total Battle. This static site runs locally and provides strategy guides, tools, announcements, and game reference materials for clan members.

## � Authentication

The site is password-protected for clan members only.

### How Authentication Works

1. **Member Verification**: Only users listed in `data/clan_members.json` can access the site
2. **First-Time Login**: New members enter their clan name and set their own password
3. **Returning Login**: Members enter their clan name and password
4. **Session Duration**: 7 days before requiring re-login
5. **Password Storage**: Passwords are SHA-256 hashed and stored in browser localStorage

### For Members

- Use your **exact clan name** (case-insensitive) to log in
- First time logging in? Just enter your name and you'll be prompted to create a password
- Forgot your password? Ask an admin to reset it

### For Admins

**Reset a member's password:**
1. Open browser console on the site (F12 → Console)
2. Run: `CxNAuth.resetMemberPassword('MemberName')`
3. Member will be prompted to set a new password on next login

**Add a new member:**
1. Add them to `data/clan_members.json` under the appropriate rank
2. They can set their password on first login

**Remove a member:**
1. Remove them from `data/clan_members.json`
2. Their active session will be invalidated on next page load

**Generate a password hash (for admin accounts):**
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('YOUR_PASSWORD').digest('hex'));"
```

## �🚀 Quick Start

### Running Locally

Since this is a static HTML site, you can run it using any local server:

**Option 1: VS Code Live Server Extension**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"

**Option 2: Python**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

**Option 3: Node.js (built-in server)**
```bash
node serve.js
# Then open http://localhost:8080
```

## 🔎 Site Search (Pagefind)

The site uses [Pagefind](https://pagefind.app/) for client-side full-text search. Pagefind indexes all static HTML pages at build time and produces a small set of static files that power instant search in the browser — no server required.

### Install & Build Steps

**1. Install dependencies** (first time only):
```bash
npm install
```
This installs the Pagefind CLI as a dev dependency (defined in `package.json`).

**2. Build the search index:**
```bash
# Using npm script
npm run build

# Or using the shell script directly
chmod +x index-search.sh   # first time only (macOS/Linux)
./index-search.sh
```
This scans every HTML page in the repo, extracts text content, and writes the search index to the `pagefind/` directory.

**3. Commit and deploy:**
```bash
git add pagefind/
git commit -m "Update search index"
git push
```
The `pagefind/` folder must be committed so GitHub Pages can serve the index files.

### When to Rebuild the Index

Re-run `npm run build` whenever you:
- Add, remove, or rename an HTML page
- Make significant content changes to existing pages
- Want search results to reflect the latest content

### How It Works

- **`nav.js`** injects a Search button into the navigation bar on every page
- Clicking the button (or pressing **Ctrl+K** / **Cmd+K**) opens a full-screen search overlay
- As you type, Pagefind fetches matching index fragments and displays results instantly
- Press **Esc** or click outside the overlay to close it
- The `css/search.css` file themes the Pagefind UI to match the site's medieval aesthetic

### Key Files

| File | Purpose |
|------|---------|
| `package.json` | Defines `pagefind` as a devDependency and build scripts |
| `index-search.sh` | Shell script to build the search index |
| `pagefind/` | Generated search index and Pagefind runtime (auto-created) |
| `css/search.css` | Theme overrides for the Pagefind search UI |
| `js/nav.js` | Injects the search button, overlay, and keyboard shortcuts |

## 📁 Project Structure

```
CxN_wiki/
├── index.html              # Homepage
├── package.json            # npm config & Pagefind devDependency
├── index-search.sh         # Build script for Pagefind search index
├── serve.js                # Local dev server (Node.js)
├── site.json               # Site-wide configuration
├── .gitignore              # Git ignore rules
├── README.md               # This file
│
├── pagefind/               # Generated search index (commit for deploy)
│
├── assets/                 # All images and media
│   ├── branding/           # Clan logos, icons
│   ├── icons/              # Medal icons, UI elements
│   ├── screenshots/        # Game screenshots
│   └── tiles/              # Page/strategy tiles
│
├── css/                    # Stylesheets
│   ├── style.css           # Main site styles
│   ├── auth.css            # Authentication/login styles
│   ├── search.css          # Pagefind search UI theme overrides
│   ├── calculator.css      # Calculator tool styles
│   └── trophy-room.css     # Trophy room styles
│
├── js/                     # JavaScript
│   ├── auth.js             # Site authentication module
│   ├── nav.js              # Shared navigation component
│   ├── basic-calculator.js
│   └── compensation-calculator.js
│
├── data/                   # JSON data files
│   ├── clan_members.json   # Clan member roster (controls login access)
│   └── troop_data.json     # Troop statistics
│
├── templates/              # HTML templates for new pages
│   └── page-template.html
│
├── about/                  # About section
├── announcements/          # Clan announcements
├── faq/                    # Frequently asked questions
├── roe/                    # Rules of Engagement
├── strategy/               # Strategy guides
├── tools/                  # Interactive calculators
├── trophy-room/            # Clan achievements
├── wiki/                   # General wiki articles
│
└── archive/                # Old/reference files
```

## ⚙️ Site Configuration

The site is configured via `site.json` in the project root. This centralizes:

| Setting | Description |
|---------|-------------|
| `siteName` | Site title used across pages |
| `siteTagline` | Tagline shown on homepage |
| `copyright` | Footer copyright info (holder, year, suffix) |
| `branding.logo` | Path to the site logo |
| `navigation` | Array of navigation menu items |
| `sections` | Metadata for each section (title, description) |
| `meta` | SEO metadata (description, keywords) |

### Adding a Navigation Item

Edit `site.json` and add to the `navigation` array:
```json
{ "href": "new-section/index.html", "text": "Display Name", "id": "new-section" }
```

## 📝 Adding New Pages

1. Copy `templates/page-template.html` to your target directory
2. Update the `<title>` tag
3. Update the page content in the container
4. Adjust CSS/JS paths based on directory depth:
   - Root level: `css/style.css`, `js/nav.js`
   - Subdirectory: `../css/style.css`, `../js/nav.js`

### Using the Shared Navigation

The `nav.js` script automatically injects the navigation and footer (reading from `site.json`) and handles authentication. Include both `auth.js` and `nav.js`:

```html
<link rel="stylesheet" href="css/auth.css">
<!-- ... other CSS ... -->

<nav id="main-nav"></nav>
<!-- your content -->
<footer id="main-footer"></footer>

<script src="js/auth.js"></script>
<script src="js/nav.js"></script>  <!-- or ../js/auth.js and ../js/nav.js in subdirectories -->
```

**Important**: `auth.js` must be loaded before `nav.js` for authentication to work.

## 🎨 Styling

The site uses a medieval fantasy theme matching Total Battle's aesthetic:
- **Primary colors**: Dark teal/blue-green (`#192d32`)
- **Accent colors**: Warm metallic gold (`#d4a574`)
- **Fonts**: Cinzel (headings), Crimson Text (body)

CSS variables are defined in `:root` in `css/style.css`.

## 🔧 Tools

- **Compensation Calculator**: Calculate troop loss compensation values
- **Basic Calculator**: General-purpose game calculations

## 🤝 Contributing

1. Create your page using the template
2. Add images to the appropriate `assets/` subfolder
3. Test locally before committing
4. Use consistent naming: `kebab-case` for all files (e.g., `my-new-image.png`)

## 📁 File Naming Convention

All files should use `kebab-case`:
- ✅ `ragnarok-tile.png`
- ✅ `medal-of-the-hunt-gold-icon.jpg`
- ❌ `Ragnarok_tile.png`
- ❌ `medalOfTheHuntGold_icon.jpg`

## 📜 License

Internal clan resource - not for public distribution.
