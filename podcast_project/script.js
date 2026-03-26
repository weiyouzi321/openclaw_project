
document.addEventListener('DOMContentLoaded', () => {
    const episodeList = document.getElementById('episode-list');
    const contentArea = document.getElementById('content-area');
    const welcomeMessage = contentArea.querySelector('.welcome-message');
    const episodeDetailsContainer = document.getElementById('episode-details');

    let allEpisodes = [];

    // Fetch and process the episode data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allEpisodes = data;
            populateEpisodeList(allEpisodes);
        })
        .catch(error => {
            console.error("Error fetching episode data:", error);
            episodeList.innerHTML = '<li>Error loading episodes.</li>';
        });

    // Create the list of episodes in the sidebar
    function populateEpisodeList(episodes) {
        episodeList.innerHTML = ''; // Clear existing list
        episodes.forEach((episode, index) => {
            const li = document.createElement('li');
            li.textContent = episode.title || `Episode ${episode.id}`;
            li.dataset.index = index;
            episodeList.appendChild(li);
        });
    }

    // Handle clicks on the episode list
    episodeList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            // Remove active class from previously selected item
            const currentActive = episodeList.querySelector('.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            // Add active class to the clicked item
            event.target.classList.add('active');

            const episodeIndex = event.target.dataset.index;
            const episode = allEpisodes[episodeIndex];
            displayEpisodeDetails(episode);
        }
    });

    // Display the details of the selected episode
    function displayEpisodeDetails(episode) {
        welcomeMessage.classList.add('hidden');
        episodeDetailsContainer.classList.remove('hidden');

        // Sanitize and format text for HTML
        const formatText = (text) => text.replace(/\\n/g, '\n');
        
        const keywordsHTML = (episode.keywords_raw || '')
            .split(/\d+\.\s/)
            .filter(Boolean)
            .map(kw => {
                const parts = kw.split('**_');
                if(parts.length < 2) return '';
                const term = parts[0].replace(/\*\*/g, '').trim();
                const definition = parts.slice(1).join('**_').trim();
                return `<div class="keyword-item"><strong>${term}:</strong> ${formatText(definition)}</div>`;
            })
            .join('');

        episodeDetailsContainer.innerHTML = `
            <h2>${episode.title || `Episode ${episode.id}`}</h2>

            <div class="detail-section">
                <h3>Summary</h3>
                <p>${formatText(episode.summary)}</p>
            </div>

            <div class="detail-section">
                <h3>Highlights</h3>
                <p>${formatText(episode.highlights)}</p>
            </div>
            
            <div class="detail-section">
                <h3>Keywords</h3>
                <div class="keywords-container">${keywordsHTML}</div>
            </div>

            <div class="detail-section">
                <h3>Chapters</h3>
                <p>${formatText(episode.chapters)}</p>
            </div>
        `;
    }
});
