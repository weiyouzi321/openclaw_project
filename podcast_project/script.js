
document.addEventListener('DOMContentLoaded', () => {
    const channelList = document.getElementById('channel-list');
    const programList = document.getElementById('program-list');
    const keyPointsDisplay = document.getElementById('key-points-display');
    const welcomeMessage = document.querySelector('.welcome-message');

    let allData = [];
    let activeChannelId = null;
    let activeProgramId = null;

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
            li.onclick = () => selectChannel(channel.channelId, li);
            channelList.appendChild(li);
        });
    }

    function selectChannel(channelId, element) {
        if (activeChannelId === channelId) return;
        activeChannelId = channelId;
        
        document.querySelectorAll('#channel-list li').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        const channel = allData.find(c => c.channelId === channelId);
        renderPrograms(channel.programs);
        
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

        let program;
        allData.forEach(c => {
            const found = c.programs.find(p => p.id === programId);
            if (found) program = found;
        });

        renderDetails(program);
    }

    function renderDetails(program) {
        welcomeMessage.style.display = 'none';
        keyPointsDisplay.style.display = 'block';
        
        const formatText = (text) => text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

        let insightsHTML = '';
        if (program.key_insights) {
            insightsHTML = `
                <div class="key-point-section">
                    <h3>核心见解 (Key Insights)</h3>
                    <div class="insights-grid">
                        ${program.key_insights.map(i => `<div class="insight-card">${i}</div>`).join('')}
                    </div>
                </div>
            `;
        }

        let qaHTML = '';
        if (program.qa) {
            qaHTML = `
                <div class="key-point-section">
                    <h3>深度问答 (Q&A)</h3>
                    <div class="qa-list">
                        ${program.qa.map(item => `
                            <div class="qa-item">
                                <div class="question">Q: ${item.q}</div>
                                <div class="answer">A: ${item.a}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        keyPointsDisplay.innerHTML = `
            <h2>${program.title}</h2>
            <div class="key-point-section">
                <h3>内容摘要</h3>
                <p>${formatText(program.summary)}</p>
            </div>
            ${insightsHTML}
            ${qaHTML}
            <div class="key-point-section">
                <h3>精彩高亮</h3>
                <p>${formatText(program.highlights || '')}</p>
            </div>
            <div class="key-point-section">
                <h3>分章节精要</h3>
                <div>${formatText(program.chapters || '')}</div>
            </div>
        `;
    }
});
