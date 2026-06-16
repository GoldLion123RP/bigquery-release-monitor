# BigQuery Release Notes Monitor & Tweeter

A premium, modern web application built with Python Flask and vanilla HTML, CSS, and JS to track official Google Cloud BigQuery updates, read release notes, and easily draft/share customized tweets about specific features.

## Features
- **Real-time Feed Sync**: Fetches the official Google Cloud BigQuery RSS/Atom release notes feed.
- **Dynamic UI**: Responsive split-panel layout containing a dynamic update feed list and an in-depth details viewer.
- **Smart Tweeting**: Select a release note and auto-draft an optimized tweet within the 280-character limit, complete with a Twitter Web Intent window.
- **Modern Styling**: Custom dark mode dashboard styled with vanilla CSS glassmorphism, tailored animations, and custom typography.
- **SEO Ready**: Search engine optimized titles and meta configurations.

## File Structure
- `app.py`: Flask server backend serving APIs and template routes.
- `templates/index.html`: Main responsive app workspace template.
- `static/style.css`: Clean, customized visual stylesheets.
- `static/app.js`: Feed rendering, active spinner management, character counter, and Twitter share utilities.
- `static/images/favicon.jpg`: Custom generated favicon icon.

## Setup & Running Locally

### Prerequisites
- Python 3.8+

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/bigquery-release-monitor.git
   cd bigquery-release-monitor
   ```

2. Install the required dependencies:
   ```bash
   pip install Flask requests feedparser
   ```

3. Run the development server:
   ```bash
   python app.py
   ```

4. Open `http://127.0.0.1:5000` in your web browser.

## License
Licensed under the [MIT License](LICENSE).
