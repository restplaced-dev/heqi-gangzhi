const STORAGE_KEY = 'heqigangzhi-prototype-v2';

const seedData = {
  tanks: [
    {
      id: crypto.randomUUID(),
      name: '90 溪流缸',
      type: '溪流缸',
      volume: '90 × 45 × 21 cm',
      mood: '穩定觀察中',
      note: '吸鰍活動正常，前景石面有明顯覓食。',
      fish: [
        { id: crypto.randomUUID(), name: '石頭臉', species: '吸鰍', personality: '常貼在前景溪石上，藻錠出現會很快靠近。' },
        { id: crypto.randomUUID(), name: '小黑影', species: '鼠魚', personality: '晚上活躍，白天偏愛沉木下方。' }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: '鬥魚小窩',
      type: '單養缸',
      volume: '36 × 22 × 26 cm',
      mood: '適應良好',
      note: '今日有正常展鰭，看到人會靠近前方。',
      fish: [
        { id: crypto.randomUUID(), name: '紅茶', species: '鬥魚', personality: '看到鑷子會衝過來，但不太喜歡水流太強。' }
      ]
    }
  ],
  logs: [
    { id: crypto.randomUUID(), tankName: '90 溪流缸', type: '餵食', date: '今天', text: '藻錠少量，吸鰍有出來刮食；未見搶食壓力。' },
    { id: crypto.randomUUID(), tankName: '鬥魚小窩', type: '觀察', date: '昨天', text: '靠近前景停留時間變長，遇到人影沒有立刻躲開。' },
    { id: crypto.randomUUID(), tankName: '90 溪流缸', type: '換水', date: '3 天前', text: '換水約 25%，水流與溫度維持穩定。' }
  ],
  posts: [
    { id: crypto.randomUUID(), author: '河憩缸友', title: '今日缸照', body: '今天溪流缸石面開始長出薄薄生物膜，吸鰍巡邏得很勤。看起來不是「很會活」，而是有在使用這個環境。', tags: ['溪流缸', '魚魚日常'], likes: 18, comments: 3 },
    { id: crypto.randomUUID(), author: '小缸慢慢養', title: '終於敢出來吃飯', body: '這隻鼠魚剛來時都躲在後面，今天第一次在燈還開著時到前景吃沉底飼料。紀錄一下這個小進步。', tags: ['鼠魚', '日常觀察'], likes: 32, comments: 7 }
  ],
  reminders: [
    { id: crypto.randomUUID(), title: '90 溪流缸｜拍照紀錄', due: '今天' },
    { id: crypto.randomUUID(), title: '鬥魚小窩｜換水', due: '明天' }
  ]
};

let state = loadState();
let currentView = 'home';
let logType = '觀察';

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.warn('資料解析失敗，使用預設資料'); }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return structuredClone(seedData);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  render();
}

function tankOptions() {
  return state.tanks.map(t => `<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)}</option>`).join('');
}

function render() {
  const app = document.getElementById('app');
  const views = { home: renderHome, tanks: renderTanks, log: renderLogForm, social: renderSocial, profile: renderProfile };
  app.innerHTML = views[currentView]();
  bindViewEvents();
}

function renderHome() {
  const fishCount = state.tanks.reduce((sum, tank) => sum + tank.fish.length, 0);
  return `
    <section class="hero-card">
      <p class="eyebrow">今天的魚缸</p>
      <h2 class="hero-title">不是只有活著，<br>而是被好好看見。</h2>
      <p class="hero-subtitle">記錄餵食、換水、照片與日常觀察。先看魚的生活狀態，再看數據。</p>
      <div class="status-row">
        <div class="status-pill"><strong>${state.tanks.length}</strong><span>魚缸</span></div>
        <div class="status-pill"><strong>${fishCount}</strong><span>魚隻檔案</span></div>
        <div class="status-pill"><strong>${state.reminders.length}</strong><span>待辦</span></div>
      </div>
    </section>

    <div class="section-head">
      <div><h3>今日提醒</h3><p>不要讓魚缸靠人腦自動備份。</p></div>
      <button class="text-btn" data-viewlink="log">新增</button>
    </div>
    <div class="list">
      ${state.reminders.map(r => `
        <div class="log-item">
          <div class="log-icon">□</div>
          <div><p><strong>${escapeHtml(r.title)}</strong></p><span class="date">${escapeHtml(r.due)}</span></div>
        </div>
      `).join('') || emptyState('目前沒有提醒', '可以從紀錄頁建立日常節奏。')}
    </div>

    <div class="section-head">
      <div><h3>最近紀錄</h3><p>回頭看，才知道魚缸怎麼變穩。</p></div>
      <button class="text-btn" data-viewlink="log">寫一筆</button>
    </div>
    <div class="list">
      ${state.logs.slice(0, 4).map(renderLogItem).join('') || emptyState('尚無紀錄', '先寫一筆餵食或觀察。')}
    </div>
  `;
}

function renderTanks() {
  return `
    <div class="section-head">
      <div><h2>我的魚缸</h2><p>魚缸是環境，不只是容器。</p></div>
    </div>
    <div class="tank-grid">
      ${state.tanks.map((tank, index) => `
        <article class="tank-card">
          <div class="tank-top">
            <div class="tank-photo">${index + 1}</div>
            <div>
              <h3>${escapeHtml(tank.name)}</h3>
              <p class="tank-meta">${escapeHtml(tank.type)}｜${escapeHtml(tank.volume)}</p>
              <div class="tag-list"><span class="tag">${escapeHtml(tank.mood)}</span><span class="tag gray">${tank.fish.length} 隻魚</span></div>
            </div>
          </div>
          <p class="small muted" style="margin:14px 0 0;">${escapeHtml(tank.note)}</p>
          <div class="section-head" style="margin-top:14px;"><h3>魚隻檔案</h3></div>
          <div class="list">
            ${tank.fish.map(f => `
              <div class="log-item">
                <div class="fish-photo">魚</div>
                <div><p><strong>${escapeHtml(f.name)}</strong>｜${escapeHtml(f.species)}</p><span class="date">${escapeHtml(f.personality)}</span></div>
              </div>
            `).join('')}
          </div>
          <div class="tank-actions">
            <button class="btn-secondary" data-viewlink="log">寫日記</button>
            <button class="btn-ghost" data-addfish="${tank.id}">新增魚隻</button>
          </div>
        </article>
      `).join('')}
    </div>

    <div class="form-card" style="margin-top:14px;">
      <h3>新增魚缸</h3>
      <form id="tankForm">
        <div class="field"><label>魚缸名稱</label><input name="name" placeholder="例如：客廳鼠魚缸" required></div>
        <div class="field"><label>類型</label><select name="type"><option>淡水缸</option><option>溪流缸</option><option>草缸</option><option>蝦缸</option><option>海水缸</option><option>單養缸</option></select></div>
        <div class="field"><label>尺寸／水體</label><input name="volume" placeholder="例如：60 × 30 × 36 cm"></div>
        <button class="btn full" type="submit">建立魚缸</button>
      </form>
    </div>
  `;
}

function renderLogForm() {
  const types = ['觀察', '餵食', '換水', '拍照', '清潔', '新魚入缸', '狀態怪怪的'];
  return `
    <div class="section-head">
      <div><h2>新增紀錄</h2><p>以日常為主，先留下今天看到的狀態；細節可以之後再補。</p></div>
    </div>
    <section class="form-card">
      <div class="segmented">
        ${types.map(t => `<button type="button" class="${t === logType ? 'active' : ''}" data-logtype="${t}">${t}</button>`).join('')}
      </div>
      <form id="logForm">
        <input type="hidden" name="type" value="${escapeHtml(logType)}">
        <div class="field"><label>選擇魚缸</label><select name="tankName" required>${tankOptions()}</select></div>
        <div class="field"><label>今天狀態</label><select name="mood"><option value="">不特別標記</option><option>吃得不錯</option><option>活動正常</option><option>比較害羞</option><option>互動變多</option><option>有點怪怪的</option><option>想再觀察</option></select></div>
        <div class="field"><label>想補充什麼？（可留空）</label><textarea name="text" placeholder="例如：鼠魚比昨天敢到前景吃飯；或只按儲存，先留下一筆紀錄。"></textarea><p class="field-hint">備註不是考試卷，今天只想按一下也可以。</p></div>
        <div class="field"><label>公開到社群？</label><select name="share"><option value="no">先只存在私人日記</option><option value="yes">同步發成社群貼文</option></select></div>
        <button class="btn full" type="submit">儲存紀錄</button>
      </form>
    </section>

    <section class="card" style="margin-top:14px;">
      <h3>輕鬆紀錄小提醒</h3>
      <p class="small muted">可以只記一句話：今天吃了什麼、最常待在哪裡、跟同缸魚的互動、缸子看起來穩不穩。先留下痕跡，之後回頭看才會知道牠的日常節奏。</p>
      <div class="tag-list"><span class="tag warn">觀察優先</span><span class="tag gray">可留空</span><span class="tag gray">先存再補</span></div>
    </section>
  `;
}

function renderSocial() {
  return `
    <div class="section-head">
      <div><h2>魚缸動態</h2><p>看見別人的日常，不把魚只當背景。</p></div>
      <button class="text-btn" data-viewlink="log">發文</button>
    </div>
    <div class="segmented">
      <button class="active">全部</button><button>鼠魚</button><button>鬥魚</button><button>溪流缸</button><button>今日缸照</button>
    </div>
    ${state.posts.map(post => `
      <article class="post-card">
        <div class="post-head">
          <div class="avatar">${escapeHtml(post.author.slice(0, 2))}</div>
          <div><p class="post-title">${escapeHtml(post.author)}</p><span class="date small muted">剛剛更新</span></div>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="post-body">${escapeHtml(post.body)}</p>
        <div class="photo-placeholder">魚缸照片區</div>
        <div class="tag-list">${post.tags.map(t => `<span class="tag gray">#${escapeHtml(t)}</span>`).join('')}</div>
        <div class="post-actions" style="margin-top:12px;">
          <button data-like="${post.id}">♡ ${post.likes}</button>
          <button>留言 ${post.comments}</button>
          <button>收藏</button>
        </div>
      </article>
    `).join('')}
  `;
}

function renderProfile() {
  return `
    <section class="hero-card">
      <p class="eyebrow">Prototype</p>
      <h2 class="hero-title">河憩缸誌 Pro</h2>
      <p class="hero-subtitle">這是測試用原型。資料目前存在你的瀏覽器本機，重新安裝或清除瀏覽器資料後會消失。</p>
      <div class="tag-list"><span class="tag">日常紀錄</span><span class="tag">寵物化魚隻檔案</span><span class="tag">輕社群</span></div>
    </section>
    <section class="card">
      <h3>訂閱版可測方向</h3>
      <p class="small muted">不限魚缸、完整照片時間軸、自訂提醒、私人日記、雲端同步、貼文模板與月報。此原型先測流程，不處理付款。</p>
    </section>
    <section class="card">
      <h3>資料管理</h3>
      <p class="small muted">測試完可以重置回預設資料。</p>
      <button class="btn-ghost full" id="resetData">重置測試資料</button>
    </section>
  `;
}

function renderLogItem(log) {
  const icons = { '餵食': '食', '換水': '水', '拍照': '照', '觀察': '目', '清潔': '掃', '新魚入缸': '新', '狀態怪怪的': '？', '異常紀錄': '!' };
  const danger = log.type === '狀態怪怪的' || log.type === '異常紀錄' ? 'danger' : '';
  return `
    <div class="log-item">
      <div class="log-icon ${danger}">${icons[log.type] || '記'}</div>
      <div>
        <p><strong>${escapeHtml(log.type)}</strong>｜${escapeHtml(log.tankName)}</p>
        <p class="small muted">${escapeHtml(log.text)}</p>
        <span class="date">${escapeHtml(log.date)}</span>
      </div>
    </div>
  `;
}

function emptyState(title, body) {
  return `<div class="card empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></div>`;
}

function bindViewEvents() {
  document.querySelectorAll('[data-viewlink]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.viewlink)));
  document.querySelectorAll('[data-logtype]').forEach(btn => btn.addEventListener('click', () => { logType = btn.dataset.logtype; render(); }));

  const tankForm = document.getElementById('tankForm');
  if (tankForm) {
    tankForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(tankForm);
      state.tanks.unshift({
        id: crypto.randomUUID(),
        name: data.get('name').trim(),
        type: data.get('type'),
        volume: data.get('volume') || '未填寫',
        mood: '新建立',
        note: '尚未建立觀察紀錄。',
        fish: []
      });
      saveState();
      toast('已建立魚缸');
      render();
    });
  }

  const logForm = document.getElementById('logForm');
  if (logForm) {
    logForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(logForm);
      const note = data.get('text').trim();
      const mood = data.get('mood');
      const entryText = [mood ? `狀態：${mood}。` : '', note || `先留下一筆${data.get('type')}紀錄。`].join('');
      const entry = {
        id: crypto.randomUUID(),
        tankName: data.get('tankName'),
        type: data.get('type'),
        date: '剛剛',
        text: entryText
      };
      state.logs.unshift(entry);
      if (data.get('share') === 'yes') {
        state.posts.unshift({
          id: crypto.randomUUID(),
          author: '我的魚缸',
          title: `${entry.tankName}｜${entry.type}`,
          body: entry.text,
          tags: [entry.type, '魚魚日常'],
          likes: 0,
          comments: 0
        });
      }
      saveState();
      toast('紀錄已儲存');
      setView('home');
    });
  }

  document.querySelectorAll('[data-addfish]').forEach(btn => btn.addEventListener('click', () => {
    const tank = state.tanks.find(t => t.id === btn.dataset.addfish);
    const name = prompt('魚隻名字，例如：阿斑');
    if (!name) return;
    const species = prompt('魚種，例如：鼠魚、鬥魚、吸鰍') || '未填寫';
    const personality = prompt('牠的個性或習慣，例如：很愛躲、看到人會靠近') || '尚未記錄個性。';
    tank.fish.push({ id: crypto.randomUUID(), name, species, personality });
    saveState();
    toast('已新增魚隻檔案');
    render();
  }));

  document.querySelectorAll('[data-like]').forEach(btn => btn.addEventListener('click', () => {
    const post = state.posts.find(p => p.id === btn.dataset.like);
    post.likes += 1;
    saveState();
    render();
  }));

  const reset = document.getElementById('resetData');
  if (reset) reset.addEventListener('click', () => {
    if (!confirm('確定要重置測試資料？')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    toast('已重置');
    render();
  });
}

function setupGlobalEvents() {
  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  const dialog = document.getElementById('quickAddDialog');
  document.getElementById('openQuickAdd').addEventListener('click', () => dialog.showModal());
  document.querySelectorAll('[data-quick]').forEach(btn => btn.addEventListener('click', () => {
    dialog.close();
    logType = btn.dataset.quick === '拍照' ? '拍照' : btn.dataset.quick;
    setView('log');
  }));
}

function toast(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 1900);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\'':'&#039;', '"':'&quot;' }[char]));
}

setupGlobalEvents();
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
