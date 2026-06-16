document.addEventListener('DOMContentLoaded', () => {
    let releaseNotes = [];
    let selectedNote = null;

    // Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshSpinner = document.getElementById('refresh-spinner');
    const notesCount = document.getElementById('notes-count');
    const feedList = document.getElementById('feed-list');
    
    const viewerEmpty = document.getElementById('viewer-empty');
    const viewerContent = document.getElementById('viewer-content');
    
    const viewDate = document.getElementById('view-date');
    const viewTitle = document.getElementById('view-title');
    const viewBody = document.getElementById('view-body');
    
    const tweetBox = document.getElementById('tweet-box');
    const charCount = document.getElementById('char-count');
    const tweetBtn = document.getElementById('tweet-btn');

    // Fetch and render feed items
    async function fetchFeed() {
        // Start Loading State
        refreshSpinner.classList.add('active');
        refreshBtn.disabled = true;
        
        try {
            const response = await fetch('/api/notes');
            const data = await response.json();
            
            if (data.success) {
                releaseNotes = data.entries;
                renderFeedList();
            } else {
                alert(`Error fetching release notes: ${data.error}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to connect to backend server.');
        } finally {
            // End Loading State
            refreshSpinner.classList.remove('active');
            refreshBtn.disabled = false;
        }
    }

    // Render feed items list in the UI
    function renderFeedList() {
        feedList.innerHTML = '';
        notesCount.textContent = `${releaseNotes.length} items`;
        
        if (releaseNotes.length === 0) {
            feedList.innerHTML = `
                <div class="empty-state">
                    <p>No notes loaded. Click Refresh Feed to fetch the latest updates.</p>
                </div>
            `;
            return;
        }
        
        releaseNotes.forEach((note, index) => {
            const dateStr = formatDate(note.updated);
            
            const card = document.createElement('div');
            card.className = `note-card ${selectedNote && selectedNote.id === note.id ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="card-meta">${dateStr}</div>
                <div class="card-title">${escapeHTML(note.title)}</div>
            `;
            
            card.addEventListener('click', () => {
                selectNote(note, card);
            });
            
            feedList.appendChild(card);
        });
    }

    // Select and display note details
    function selectNote(note, cardElement) {
        selectedNote = note;
        
        // Update selection styling in list
        document.querySelectorAll('.note-card').forEach(el => el.classList.remove('selected'));
        if (cardElement) {
            cardElement.classList.add('selected');
        }
        
        // Show viewer content
        viewerEmpty.classList.add('hidden');
        viewerContent.classList.remove('hidden');
        
        // Set content details
        viewDate.textContent = formatDate(note.updated);
        viewTitle.textContent = note.title;
        viewBody.innerHTML = note.content; // Render HTML content from feed safely
        
        // Generate pre-populated tweet draft
        generateTweetDraft(note);
    }

    // Format ISO or standard RSS date to readable local format
    function formatDate(dateString) {
        if (!dateString) return 'Unknown Date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    }

    // Generate Twitter share intent structure
    function generateTweetDraft(note) {
        // Extract plain text for tweet if content has markup
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up text spacing
        const cleanContent = textContent.replace(/\s+/g, ' ').trim();
        
        // Create summary for tweet: Title + snippet + source link
        const baseTitle = `BigQuery Update: ${note.title}`;
        let snippet = cleanContent;
        
        // Construct the URL to append (Google BigQuery official link, or note link if provided)
        const noteLink = note.link || 'https://cloud.google.com/bigquery/docs/release-notes';
        
        // X/Twitter Web Intent structure layout: "Title - Snippet... Link"
        // Calculate max snippet length considering characters for template and link
        const templateLength = baseTitle.length + noteLink.length + 8; // account for delimiters, spaces
        const maxSnippetLength = 280 - templateLength;
        
        if (snippet.length > maxSnippetLength) {
            snippet = snippet.substring(0, maxSnippetLength - 3) + '...';
        }
        
        const tweetText = `🚀 ${baseTitle}\n\n"${snippet}"\n\nRead more: ${noteLink}`;
        
        tweetBox.value = tweetText;
        updateCharCount();
    }

    // Update tweet character count
    function updateCharCount() {
        const length = tweetBox.value.length;
        charCount.textContent = `${length} / 280`;
        
        charCount.className = 'char-count';
        if (length > 280) {
            charCount.classList.add('error');
            tweetBtn.disabled = true;
        } else if (length > 250) {
            charCount.classList.add('warning');
            tweetBtn.disabled = false;
        } else {
            tweetBtn.disabled = false;
        }
    }

    // Event listener for custom tweet edits
    tweetBox.addEventListener('input', updateCharCount);

    // Share/Tweet trigger
    tweetBtn.addEventListener('click', () => {
        if (!tweetBox.value) return;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetBox.value)}`;
        window.open(tweetUrl, '_blank', 'width=550,height=420');
    });

    // Helper to escape plain title strings to avoid HTML injection
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Setup refresh button event
    refreshBtn.addEventListener('click', fetchFeed);

    // About Modal functionality
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutBtn = document.getElementById('close-about-btn');

    aboutBtn.addEventListener('click', () => {
        aboutModal.classList.remove('hidden');
    });

    closeAboutBtn.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });

    // Close modal if user clicks outside of modal-card
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
        }
    });

    // Fetch initial notes on load
    fetchFeed();
});
