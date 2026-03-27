
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const channelCol = document.getElementById('channel-column');
    const programCol = document.getElementById('program-column');
    const detailsCol = document.getElementById('details-column');
    
    const channelList = document.getElementById('channel-list');
    const programList = document.getElementById('program-list');
    const keyPointsDisplay = document.getElementById('key-points-display');
    const welcomeMessage = detailsCol.querySelector('.welcome-message');

    let allData = [];
    let activeChannelId = null;
    let activeProgramId = null;

    // --- Data Fetching ---
    fetch('data_v2.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            renderChannels();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            channelList.innerHTML = '<li>Error loading channels.</li>';
        });

    // --- Render Functions ---

    function renderChannels() {
        channelList.innerHTML = '';
        allData.forEach(channel => {
            const li = document.createElement('li');
            li.textContent = channel.channelName;
            li.dataset.channelId = channel.channelId;
            channelList.appendChild(li);
        });
    }

    function renderPrograms(channelId) {
        const channel = allData.find(c => c.channelId === channelId);
        if (!channel) return;

        programList.innerHTML = '';
        channel.programs.forEach(program => {
            const li = document.createElement('li');
            li.textContent = program.title;
            li.dataset.programId = program.id;
            programList.appendChild(li);
        });

        programCol.style.display = 'flex'; // Show program column
    }

    function renderKeyPoints(programId) {
        let program = null;
        for (const channel of allData) {
            const foundProgram = channel.programs.find(p => p.id === programId);
            if (foundProgram) {
                program = foundProgram;
                break;
            }
        }

        if (!program) return;

        welcomeMessage.style.display = 'none';
        keyPointsDisplay.style.display = 'block';
        
        const formatText = (text) => text.replace(/\\n/g, '<br>');

        keyPointsDisplay.innerHTML = `
            <h2>${program.title}</h2>
            <div class="key-point-section">
                <h3>摘要 (Summary)</h3>
                <p>${formatText(program.summary || '')}</p>
            </div>
            <div class="key-point-section">
                <h3>高亮 (Highlights)</h3>
                <p>${formatText(program.highlights || '')}</p>
            </div>
            <div class="key-point-section">
                <h3>分章节内容 (Chapters)</h3>
                <div>${formatText(program.chapters || '')}</div>
            </div>
        `;
    }

    // --- Event Listeners ---

    channelList.addEventListener('click', (event) => {
        if (event.target.tagName !== 'LI') return;

        const newChannelId = event.target.dataset.channelId;
        if (newChannelId === activeChannelId) return; // Avoid re-rendering if the same channel is clicked

        activeChannelId = newChannelId;

        // Update active visual state
        const currentActive = channelList.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        event.target.classList.add('active');

        // Reset subsequent columns
        programCol.style.display = 'none';
        programList.innerHTML = '';
        keyPointsDisplay.style.display = 'none';
        welcomeMessage.style.display = 'block';
        activeProgramId = null;

        renderPrograms(activeChannelId);
    });

    programList.addEventListener('click', (event) => {
        if (event.target.tagName !== 'LI') return;

        const newProgramId = event.target.dataset.programId;
        if (newProgramId === activeProgramId) return; // Avoid re-rendering

        activeProgramId = newProgramId;

        const currentActive = programList.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        event.target.classList.add('active');
        
        renderKeyPoints(activeProgramId);
    });
});
