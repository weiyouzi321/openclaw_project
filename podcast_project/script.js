
document.addEventListener('DOMContentLoaded', () => {
    const channelList = document.getElementById('channel-list');
    const programList = document.getElementById('program-list');
    const keyPointsDisplay = document.getElementById('key-points-display');
    const welcomeMessage = document.querySelector('.welcome-message');

    let allData = [];
    let activeChannelId = null;
    let activeProgramId = null;

    // Load data from unified source
    fetch('data_v2.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            renderChannels();
        })
        .catch(error => console.error("Error fetching data:", error));

    function renderChannels() {
        channelList.innerHTML = '';
        allData.forEach(channel => {
            const li = document.createElement('li');
            li.textContent = channel.channelName;
            // Enhanced active state logic
            li.className = activeChannelId === channel.channelId ? 'active' : '';
            li.onclick = () => selectChannel(channel.channelId, li);
            channelList.appendChild(li);
        });
    }

    function selectChannel(channelId, element) {
        activeChannelId = channelId;
        activeProgramId = null; // Reset program when channel changes
        
        document.querySelectorAll('#channel-list li').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        const channel = allData.find(c => c.channelId === channelId);
        renderPrograms(channel.programs);
        
        // UI reset for new channel
        document.getElementById('program-column').style.display = 'flex';
        keyPointsDisplay.style.display = 'none';
        welcomeMessage.style.display = 'block';
    }

    function renderPrograms(programs) {
        programList.innerHTML = '';
        programs.forEach(program => {
            const li = document.createElement('li');
            li.textContent = program.title;
            li.onclick = () => selectProgram(program.id, li);
            programList.appendChild(li);
        });
    }

    function selectProgram(programId, element) {
        activeProgramId = programId;
        document.querySelectorAll('#program-list li').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        // Find program across all channels
        let program = null;
        for (const channel of allData) {
            program = channel.programs.find(p => p.id === programId);
            if (program) break;
        }

        if (program) renderDetails(program);
    }

    function renderDetails(program) {
        welcomeMessage.style.display = 'none';
        keyPointsDisplay.style.display = 'block';
        
        const formatText = (text) => {
            if (!text) return '';
            return text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        };

        // 1. Chapters Section (Supporting Array or Raw String)
        let chaptersHTML = '';
        if (Array.isArray(program.chapters)) {
            chaptersHTML = `
                <div class="chapters-timeline">
                    ${program.chapters.map(c => `
                        <div class="chapter-item" style="margin-bottom: 12px; display: flex; align-items: baseline;">
                            <span class="timestamp" style="background: #eef4ff; color: #377EB8; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 0.9em; cursor: pointer;">${c.timestamp}</span>
                            <span class="chapter-title" style="margin-left: 15px; color: #333; font-weight: 500;">${c.title}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            chaptersHTML = `<p>${formatText(program.chapters)}</p>`;
        }

        // 2. Highlights Section
        let highlightsHTML = '';
        if (Array.isArray(program.highlights)) {
            highlightsHTML = program.highlights.map(h => `
                <div class="highlight-item" style="margin-bottom: 15px; border-left: 4px solid #E41A1C; padding: 5px 15px; background: #fffdfd; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 0.85em; color: #888; margin-bottom: 4px;">Time: ${h.timestamp}</div>
                    <p style="margin: 0; color: #444; line-height: 1.5; font-style: italic;">"${h.text}"</p>
                </div>
            `).join('');
        } else {
            highlightsHTML = `<p>${formatText(program.highlights)}</p>`;
        }

        // 3. Q&A Section
        let qaHTML = '';
        if (Array.isArray(program.qa)) {
            qaHTML = `
                <div class="key-point-section">
                    <h3>深度解读 (Q&A)</h3>
                    <div class="qa-list">
                        ${program.qa.map(item => `
                            <div class="qa-card" style="background: #f8f9fa; border: 1px solid #edf0f2; padding: 18px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                                <div class="question" style="font-weight: bold; color: #2c3e50; font-size: 1.05em; margin-bottom: 10px;">Q: ${item.question || item.q}</div>
                                <div class="answer" style="color: #50595e; line-height: 1.7; padding-left: 20px; border-left: 2px solid #ddd;">${item.answer || item.a}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 4. Final Assembly
        keyPointsDisplay.innerHTML = `
            <div class="content-header" style="margin-bottom: 30px;">
                <h2 style="font-size: 1.8em; color: #1a1a1a; line-height: 1.3; margin-bottom: 15px;">${program.title}</h2>
                <div class="meta-info" style="color: #888; font-size: 0.9em;">ID: ${program.id.split('/').pop()}</div>
            </div>

            <div class="key-point-section">
                <h3>本期摘要</h3>
                <p style="font-size: 1.1em; line-height: 1.8; color: #333;">${formatText(program.summary)}</p>
            </div>

            ${qaHTML}

            <div class="key-point-section">
                <h3>章节导览</h3>
                ${chaptersHTML}
            </div>

            <div class="key-point-section">
                <h3>精彩高亮</h3>
                <div class="highlights-grid">${highlightsHTML}</div>
            </div>
        `;
    }
});
