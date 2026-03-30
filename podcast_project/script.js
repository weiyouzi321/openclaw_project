
document.addEventListener('DOMContentLoaded', () => {
    const channelList = document.getElementById('channel-list');
    const programList = document.getElementById('program-list');
    const keyPointsDisplay = document.getElementById('key-points-display');
    const welcomeMessage = document.querySelector('.welcome-message');
    const programColumn = document.getElementById('program-column');

    let allData = [];
    let activeChannelId = null;
    let activeProgramId = null;

    console.log("Script loaded, fetching data_v2.json...");

    fetch('data_v2.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log("Data fetched successfully:", data);
            allData = data;
            renderChannels();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            welcomeMessage.innerHTML = `<h2>数据加载失败</h2><p>${error.message}</p>`;
        });

    function renderChannels() {
        if (!channelList) return;
        channelList.innerHTML = '';
        allData.forEach(channel => {
            const li = document.createElement('li');
            li.textContent = channel.channelName;
            li.className = activeChannelId === channel.channelId ? 'active' : '';
            li.onclick = () => selectChannel(channel.channelId, li);
            channelList.appendChild(li);
        });
        console.log("Channels rendered.");
    }

    function selectChannel(channelId, element) {
        console.log("Channel selected:", channelId);
        activeChannelId = channelId;
        activeProgramId = null;
        
        document.querySelectorAll('#channel-list li').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        const channel = allData.find(c => c.channelId === channelId);
        renderPrograms(channel.programs);
        
        // Ensure program column is visible
        if (programColumn) {
            programColumn.style.display = 'flex';
        }
        keyPointsDisplay.style.display = 'none';
        welcomeMessage.style.display = 'block';
        welcomeMessage.innerHTML = `<h2>已选择频道: ${channel.channelName}</h2><p>请从中间列选择一个节目来查看详细总结。</p>`;
    }

    function renderPrograms(programs) {
        if (!programList) return;
        programList.innerHTML = '';
        programs.forEach(program => {
            const li = document.createElement('li');
            li.textContent = program.title;
            li.className = activeProgramId === program.id ? 'active' : '';
            li.onclick = () => selectProgram(program.id, li);
            programList.appendChild(li);
        });
        console.log("Programs rendered.");
    }

    function selectProgram(programId, element) {
        console.log("Program selected:", programId);
        activeProgramId = programId;
        document.querySelectorAll('#program-list li').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

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

        // 1. Q&A Section
        let qaHTML = '';
        if (Array.isArray(program.qa) && program.qa.length > 0) {
            qaHTML = `
                <div class="key-point-section">
                    <h3>深度解读 (Q&A)</h3>
                    <div class="qa-list">
                        ${program.qa.map(item => `
                            <div class="qa-item">
                                <div class="question">Q: ${item.question || item.q}</div>
                                <div class="answer">A: ${item.answer || item.a}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 2. Chapters Section
        let chaptersHTML = '';
        if (Array.isArray(program.chapters)) {
            chaptersHTML = `
                <div class="key-point-section">
                    <h3>章节导览</h3>
                    <div class="chapters-timeline">
                        ${program.chapters.map(c => `
                            <div class="chapter-row" style="margin-bottom: 10px; display: flex; align-items: baseline;">
                                <span class="timestamp" style="color: #007bff; font-weight: bold; min-width: 70px;">${c.timestamp}</span>
                                <span class="chapter-title" style="margin-left: 10px;">${c.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 3. Highlights Section
        let highlightsHTML = '';
        if (Array.isArray(program.highlights)) {
            highlightsHTML = `
                <div class="key-point-section">
                    <h3>精彩高亮</h3>
                    ${program.highlights.map(h => `
                        <div class="highlight-card" style="border-left: 4px solid #dc3545; background: #fff5f5; padding: 15px; margin-bottom: 15px; border-radius: 0 8px 8px 0;">
                            <small style="color: #888;">时间: ${h.timestamp}</small>
                            <p style="margin: 5px 0; font-style: italic; color: #333;">"${h.text}"</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        keyPointsDisplay.innerHTML = `
            <header style="margin-bottom: 2rem;">
                <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${program.title}</h2>
                <div style="color: #6c757d; font-size: 0.9rem;">Episode ID: ${program.id.split('/').pop()}</div>
            </header>
            
            <div class="key-point-section">
                <h3>内容摘要</h3>
                <p style="font-size: 1.1rem; color: #444;">${formatText(program.summary)}</p>
            </div>

            ${qaHTML}
            ${chaptersHTML}
            ${highlightsHTML}
        `;
    }
});
