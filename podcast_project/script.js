
document.addEventListener('DOMContentLoaded', () => {
    const channelList = document.getElementById('channel-list');
    const programList = document.getElementById('program-list');
    const keyPointsDisplay = document.getElementById('key-points-display');
    const welcomeMessage = document.querySelector('.welcome-message');

    let allData = [];
    let activeProgramId = null;

    fetch('data_v2.json')
        .then(response => response.json())
        .then(data => {
            // New structure: data_v2.json is a direct array of program objects
            allData = data;
            renderPrograms(allData);
        })
        .catch(error => console.error("Error fetching data:", error));

    function renderPrograms(programs) {
        programList.innerHTML = '';
        programs.forEach(program => {
            const li = document.createElement('li');
            li.textContent = program.title;
            li.onclick = () => selectProgram(program.id, li);
            programList.appendChild(li);
        });
        // Auto-show program column as we no longer have channel selection
        document.getElementById('program-column').style.display = 'flex';
    }

    function selectProgram(programId, element) {
        activeProgramId = programId;
        document.querySelectorAll('#program-list li').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        const program = allData.find(p => p.id === programId);
        renderDetails(program);
    }

    function renderDetails(program) {
        welcomeMessage.style.display = 'none';
        keyPointsDisplay.style.display = 'block';
        
        const formatText = (text) => {
            if (!text) return '';
            return text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        };

        // Handle Array structures for Chapters
        let chaptersHTML = '';
        if (Array.isArray(program.chapters)) {
            chaptersHTML = program.chapters.map(c => `
                <div class="chapter-item" style="margin-bottom: 10px;">
                    <span class="timestamp" style="color: #377EB8; font-weight: bold; cursor: pointer;">[${c.timestamp}]</span>
                    <span class="chapter-title" style="margin-left: 10px; font-weight: 500;">${c.title}</span>
                </div>
            `).join('');
        } else {
            chaptersHTML = formatText(program.chapters);
        }

        // Handle Array structures for Highlights
        let highlightsHTML = '';
        if (Array.isArray(program.highlights)) {
            highlightsHTML = program.highlights.map(h => `
                <div class="highlight-item" style="margin-bottom: 15px; border-left: 3px solid #E41A1C; padding-left: 10px; font-style: italic;">
                    <span class="timestamp" style="color: #666; font-size: 0.9em;">[${h.timestamp}]</span>
                    <p style="margin: 5px 0;">"${h.text}"</p>
                </div>
            `).join('');
        } else {
            highlightsHTML = formatText(program.highlights);
        }

        // Handle Q&A (supporting both .q/.a and .question/.answer keys)
        let qaHTML = '';
        if (Array.isArray(program.qa)) {
            qaHTML = `
                <div class="key-point-section">
                    <h3>深度问答 (Q&A)</h3>
                    <div class="qa-list">
                        ${program.qa.map(item => `
                            <div class="qa-item" style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                <div class="question" style="font-weight: bold; color: #333;">Q: ${item.question || item.q}</div>
                                <div class="answer" style="margin-top: 8px; color: #555;">A: ${item.answer || item.a}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        keyPointsDisplay.innerHTML = `
            <h2 style="color: #333; border-bottom: 2px solid #377EB8; padding-bottom: 10px;">${program.title}</h2>
            <div class="key-point-section">
                <h3>内容摘要</h3>
                <p style="line-height: 1.6;">${formatText(program.summary)}</p>
            </div>
            ${qaHTML}
            <div class="key-point-section">
                <h3>分章节精要</h3>
                <div class="chapters-container">${chaptersHTML}</div>
            </div>
            <div class="key-point-section">
                <h3>精彩高亮</h3>
                <div class="highlights-container">${highlightsHTML}</div>
            </div>
        `;
    }
});
