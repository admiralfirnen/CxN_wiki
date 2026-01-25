# CxN Clan Wiki

A comprehensive wiki and resource hub for the CxN clan in Total Battle. This static site runs locally and provides strategy guides, tools, announcements, and game reference materials for clan members.

## 🚀 Quick Start

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

**Option 3: Node.js**
```bash
npx serve
```

## 📁 Project Structure

```
CxN_wiki/
├── index.html              # Homepage
├── .gitignore              # Git ignore rules
├── README.md               # This file
│
├── assets/                 # All images and media
│   ├── branding/           # Clan logos, icons
│   ├── icons/              # Medal icons, UI elements
│   ├── screenshots/        # Game screenshots
│   └── tiles/              # Page/strategy tiles
│
├── css/                    # Stylesheets
│   ├── style.css           # Main site styles
│   ├── calculator.css      # Calculator tool styles
│   └── trophy-room.css     # Trophy room styles
│
├── js/                     # JavaScript
│   ├── nav.js              # Shared navigation component
│   ├── basic-calculator.js
│   └── compensation-calculator.js
│
├── data/                   # JSON data files
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

The `nav.js` script automatically injects the navigation and footer (reading from `site.json`). Just include:

```html
<nav id="main-nav"></nav>
<!-- your content -->
<footer id="main-footer"></footer>
<script src="js/nav.js"></script>  <!-- or ../js/nav.js in subdirectories -->
```

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
