// ========== 核心应用逻辑 ==========
import { questions, resultTypes, matchTable, typePriority } from './data.js';
import { showShareModal } from './share.js';

// 全局状态
const state = {
  currentPage: 'start',
  info: { level: null, freq: null },
  answers: [],       // 题目答案（每个元素是 type 字符串）
  currentQ: 0,       // 当前题目索引
  // 四种类型计分
  typeScores: { beast: 0, grinder: 0, striker: 0, social: 0 },
  mainType: null,     // 主DNA
  subType: null,      // 副DNA
  result: null,       // 最终结果对象
};

// ========== 页面管理 ==========
function showPage(pageId) {
  const allPages = document.querySelectorAll('.page');

  allPages.forEach(p => {
    if (p.id === `page-${pageId}`) {
      p.style.display = '';
      p.classList.remove('page-out');
      p.style.animation = 'none';
      p.offsetHeight; // reflow
      p.style.animation = '';
    } else {
      p.style.display = 'none';
    }
  });
  state.currentPage = pageId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 开始页面 ==========
function initStartPage() {
  document.getElementById('btn-start').addEventListener('click', () => {
    showPage('info');
  });
}

// ========== 基本信息页面 ==========
function initInfoPage() {
  const container = document.getElementById('page-info');
  container.addEventListener('click', (e) => {
    const option = e.target.closest('.info-option');
    if (!option) return;
    const field = option.dataset.field;
    const value = parseInt(option.dataset.value);

    let parent = option.parentElement;
    while (parent && parent.querySelectorAll('.info-option').length <= 1) {
      parent = parent.parentElement;
    }
    if (parent) {
      parent.querySelectorAll('.info-option').forEach(o => o.classList.remove('selected'));
    }
    option.classList.add('selected');
    state.info[field] = value;
    checkInfoComplete();
  });

  document.getElementById('btn-info-next').addEventListener('click', () => {
    if (state.info.level !== null && state.info.freq !== null) {
      showPage('test');
      renderQuestion();
    }
  });
}

function checkInfoComplete() {
  const btn = document.getElementById('btn-info-next');
  if (state.info.level !== null && state.info.freq !== null) {
    btn.disabled = false;
    btn.className = 'w-full py-4 rounded-2xl bg-gradient-to-r from-tennis-green to-green-400 text-tennis-dark font-bold text-base shadow-lg shadow-tennis-green/30 active:scale-95 transition-all';
    btn.textContent = '开始答题 →';
  }
}

// ========== 风格测试页面 ==========
function renderQuestion() {
  const q = questions[state.currentQ];
  const container = document.getElementById('question-container');
  const counter = document.getElementById('test-counter');
  const progress = document.getElementById('test-progress');

  counter.textContent = `第${state.currentQ + 1}题 / 共${questions.length}题`;
  const pct = 10 + ((state.currentQ) / questions.length) * 90;
  progress.style.width = `${pct}%`;

  container.innerHTML = `
    <div class="question-enter">
      <div class="text-center mb-8">
        <span class="text-5xl block mb-4">${q.emoji}</span>
        <h3 class="text-lg font-bold leading-relaxed">${q.question}</h3>
      </div>
      <div class="space-y-3" id="options-container">
        ${q.options.map((opt, idx) => `
          <button class="test-option w-full flex items-center gap-4 p-4 rounded-xl bg-tennis-card border border-white/5 text-left" data-idx="${idx}">
            <span class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-black text-tennis-green shrink-0">
              ${'ABCD'[idx]}
            </span>
            <span class="text-sm font-medium">${opt.text}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.test-option').forEach(opt => {
    opt.addEventListener('click', () => handleAnswer(parseInt(opt.dataset.idx)));
  });
}

function handleAnswer(idx) {
  const q = questions[state.currentQ];
  const selected = q.options[idx];

  // 显示选中动画
  const options = document.querySelectorAll('.test-option');
  options.forEach(o => o.classList.remove('selected-answer'));
  options[idx].classList.add('selected-answer');

  // 累加对应类型的分数
  state.typeScores[selected.type] = (state.typeScores[selected.type] || 0) + 1;
  state.answers.push(selected.type);

  // 延迟后跳到下一题
  setTimeout(() => {
    state.currentQ++;
    if (state.currentQ >= questions.length) {
      // 答完所有题，直接进入分析
      showPage('analyzing');
      startAnalyzing();
    } else {
      renderQuestion();
    }
  }, 400);
}

// ========== 分析动画 ==========
function startAnalyzing() {
  const texts = [
    '分析你的击球风格...',
    '评估进攻倾向...',
    '计算稳定指数...',
    '解码节奏偏好...',
    '匹配最佳搭子...',
    '生成你的网球DNA报告...',
  ];
  const bar = document.getElementById('analyze-bar');
  const textEl = document.getElementById('analyzing-text');
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const pct = Math.min((step / texts.length) * 100, 100);
    bar.style.width = `${pct}%`;
    if (step <= texts.length) {
      textEl.style.opacity = 0;
      setTimeout(() => {
        textEl.textContent = texts[Math.min(step, texts.length - 1)];
        textEl.style.opacity = 1;
      }, 200);
    }
    if (step >= texts.length + 1) {
      clearInterval(interval);
      calculateResult();
      showPage('result');
      renderResult();
    }
  }, 500);
}

// ========== 计算结果 ==========
function calculateResult() {
  const scores = state.typeScores;

  // 按分数排序，相同分数按优先级排
  const sorted = Object.entries(scores).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return typePriority.indexOf(a[0]) - typePriority.indexOf(b[0]);
  });

  state.mainType = sorted[0][0];
  state.subType = sorted[1][0];
  state.result = resultTypes[state.mainType];

  // 提交测试结果到后端
  submitTestResult();
}

// ========== 提交测试结果到后端 ==========
function submitTestResult() {
  const payload = {
    main_type: state.mainType,
    sub_type: state.subType,
    type_scores: state.typeScores,
    level: state.info.level,
    freq: state.info.freq,
  };

  // 尝试获取用户信息
  fetch('/ts:auth/tauth/info.ashx')
    .then(res => res.json())
    .then(userInfo => {
      if (userInfo && userInfo.EngName) {
        payload.eng_name = userInfo.EngName;
        payload.chn_name = userInfo.ChnName || '';
      }
    })
    .catch(() => {})
    .finally(() => {
      fetch('/api/submit_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(() => {
          // 提交成功后刷新完成人数
          fetchTestCount();
        })
        .catch(() => {});
    });
}

// ========== 渲染结果 ==========
function renderResult() {
  const r = state.result;
  const subResult = resultTypes[state.subType];
  const match = matchTable[state.mainType];
  const bestMatchType = resultTypes[match.best.id];

  const container = document.getElementById('result-container');

  container.innerHTML = `
    <!-- 英雄区域 -->
    <div class="result-hero result-section" style="animation-delay:0s">
      <div class="relative z-10">
        <div class="result-type-badge mb-4">
          <span>🧬</span> 你的网球DNA
        </div>
        <h2 class="text-4xl font-black mb-3" style="color:${r.color}">${r.emoji} ${r.name}</h2>
      </div>
    </div>

    <!-- 能力雷达图 + 关键字 左右布局 -->
    <div class="px-5 py-3 result-section" style="animation-delay:0.25s">
      <h3 class="text-base font-black mb-2">
        <i class="ri-bar-chart-2-fill text-tennis-green mr-1"></i> 能力雷达
      </h3>
      <div class="bg-tennis-card rounded-2xl border border-white/5 overflow-hidden">
        <div class="flex items-stretch">
          <!-- 左：关键字 -->
          <div class="flex-1 p-4 flex flex-col justify-center gap-2 border-r border-white/5">
            <div class="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">🏷️ 关键特征</div>
            ${r.traits.map(trait => `
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${r.color}"></span>
                <span class="text-sm font-medium text-gray-200">${trait}</span>
              </div>
            `).join('')}
          </div>
          <!-- 右：雷达图 -->
          <div class="flex-shrink-0 flex items-center justify-center" style="width:220px;padding:4px 0;">
            <div id="radar-chart" style="width:220px;height:220px;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 代表球星 -->
    <div class="px-5 py-3 result-section" style="animation-delay:0.45s">
      <h3 class="text-base font-black mb-2">
        <i class="ri-star-fill text-yellow-400 mr-1"></i> 代表球星
      </h3>
      <div class="bg-tennis-card rounded-2xl border border-white/5 overflow-hidden">
        <div class="flex items-center gap-4 p-4">
          <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/10">
            <img src="${r.starPhoto}" alt="${r.star}" class="w-full h-full object-cover" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=\\'text-3xl flex items-center justify-center w-full h-full\\'>⭐</span>';">
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-base text-white mb-1">${r.star}</div>
            <p class="text-xs text-gray-400 leading-relaxed">${r.starDesc}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搭子匹配 -->
    <div class="px-5 py-3 result-section" style="animation-delay:0.55s">
      <h3 class="text-base font-black mb-2">
        <i class="ri-heart-fill text-red-400 mr-1"></i> 搭子匹配
      </h3>

      <!-- 💥 最适合你的球局 -->
      <div class="mb-4">
        <div class="text-sm font-bold text-tennis-green mb-2.5">💥 最适合你的球局</div>
        <div class="match-card relative overflow-hidden p-5">
          <div class="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-tennis-green/20 text-tennis-green text-[10px] font-bold">⭐ 最佳</div>
          <div class="flex items-center gap-4 mb-3">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style="background:${bestMatchType.color}15;border:2px solid ${bestMatchType.color}44;">
              ${bestMatchType.emoji}
            </div>
            <div class="flex-1">
              <div class="font-black text-base mb-0.5" style="color:${bestMatchType.color}">${bestMatchType.name}</div>
              <div class="flex items-center gap-1.5">
                <span class="text-base">${match.best.matchEmoji}</span>
                <span class="text-sm font-bold text-white">「${match.best.matchName}」</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-400 leading-relaxed pl-[72px]">${match.best.reason}</p>
        </div>
      </div>

      <!-- 🎲 你也可以试试 -->
      <div>
        <div class="text-sm font-bold text-gray-400 mb-2.5">🎲 你也可以试试</div>
        <div class="space-y-2.5">
          ${match.others.map(other => {
            const otherType = resultTypes[other.id];
            return `
              <div class="flex items-center gap-3 p-3.5 rounded-xl bg-tennis-card/60 border border-white/5">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:${otherType.color}10;border:1px solid ${otherType.color}33;">
                  ${otherType.emoji}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="text-sm font-bold" style="color:${otherType.color}">${otherType.name}</span>
                    <span class="text-xs">${other.matchEmoji}</span>
                    <span class="text-xs font-bold text-gray-300">「${other.matchName}」</span>
                  </div>
                  <span class="text-[11px] text-gray-500">${other.reason}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="px-5 pt-4 pb-20 space-y-3 result-section" style="animation-delay:0.65s">
      <button id="btn-share" class="share-btn w-full bg-gradient-to-r from-tennis-green to-green-400 text-tennis-dark">
        <i class="ri-share-forward-fill"></i> 分享我的网球DNA
      </button>
      <button id="btn-retry" class="share-btn w-full bg-transparent border border-white/10 text-gray-400">
        <i class="ri-refresh-line"></i> 重新测试
      </button>
    </div>
  `;

  // 初始化雷达图
  setTimeout(() => initRadarChart(r), 300);

  // 绑定事件
  document.getElementById('btn-share').addEventListener('click', () => {
    showToast('正在生成海报...');
    setTimeout(() => {
      generateShareCard(state.result, state.mainType, state.subType, state.typeScores);
    }, 100);
  });

  document.getElementById('btn-retry').addEventListener('click', () => {
    resetTest();
  });
}

// ========== 渲染类型得分条 ==========
function renderScoreBars() {
  const scores = state.typeScores;
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const types = [
    { id: 'beast', name: '🦁 猛兽型', color: '#ef4444' },
    { id: 'grinder', name: '🐢 磨王型', color: '#10b981' },
    { id: 'striker', name: '⚡ 突击型', color: '#06b6d4' },
    { id: 'social', name: '🎉 社交型', color: '#a855f7' },
  ];

  return types.map(t => {
    const val = scores[t.id] || 0;
    const pct = Math.round((val / total) * 100);
    const isMain = t.id === state.mainType;
    return `
      <div class="mb-3 last:mb-0">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold ${isMain ? 'text-white' : 'text-gray-400'}">${t.name} ${isMain ? '← 主DNA' : ''}</span>
          <span class="text-xs font-bold" style="color:${t.color}">${val}票 · ${pct}%</span>
        </div>
        <div class="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000" style="width:${pct}%;background:${t.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== ECharts 雷达图 ==========
function initRadarChart(r) {
  const chartDom = document.getElementById('radar-chart');
  if (!chartDom || typeof echarts === 'undefined') return;

  const chart = echarts.init(chartDom, null, { renderer: 'canvas' });

  const statsLabels = {
    attack: '进攻性',
    stability: '稳定性',
    variety: '变化性',
    vibe: '氛围感',
  };

  const keys = Object.keys(r.stats);
  const values = keys.map(k => r.stats[k]);
  const labels = keys.map(k => statsLabels[k]);

  const option = {
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    radar: {
      indicator: labels.map(name => ({ name, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      radius: '50%',
      center: ['50%', '52%'],
      axisName: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: 500,
        padding: [2, 4],
      },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.06)' }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(200,230,76,0.02)', 'rgba(200,230,76,0.04)', 'rgba(200,230,76,0.02)', 'rgba(200,230,76,0.04)'],
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(255,255,255,0.08)' }
      },
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: r.name,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: r.color, width: 2 },
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.5,
            colorStops: [
              { offset: 0, color: r.color + '33' },
              { offset: 1, color: r.color + '11' },
            ]
          }
        },
        itemStyle: {
          color: r.color,
          borderColor: '#fff',
          borderWidth: 1,
        }
      }]
    }]
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

// ========== 重新测试 ==========
function resetTest() {
  state.info = { level: null, freq: null };
  state.answers = [];
  state.currentQ = 0;
  state.typeScores = { beast: 0, grinder: 0, striker: 0, social: 0 };
  state.mainType = null;
  state.subType = null;
  state.result = null;

  // 清除所有选中状态
  document.querySelectorAll('.info-option').forEach(o => o.classList.remove('selected'));

  // 重置按钮
  const infoBtn = document.getElementById('btn-info-next');
  infoBtn.disabled = true;
  infoBtn.className = 'w-full py-4 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 font-bold text-base cursor-not-allowed transition-all';
  infoBtn.textContent = '请完成以上选择';

  showPage('start');
}

// ========== Toast提示 ==========
export function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ========== 返回按钮 ==========
function initBackButtons() {
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const pages = ['start', 'info', 'test'];
      const currentIdx = pages.indexOf(state.currentPage);
      if (currentIdx > 0) {
        if (state.currentPage === 'test' && state.currentQ > 0) {
          // 测试中返回上一题
          state.currentQ--;
          const lastType = state.answers.pop();
          state.typeScores[lastType]--;
          renderQuestion();
        } else {
          showPage(pages[currentIdx - 1]);
        }
      }
    });
  });
}

// ========== 获取完成测试人数 ==========
function fetchTestCount() {
  fetch('/api/test_count')
    .then(res => res.json())
    .then(data => {
      if (data && typeof data.count === 'number') {
        const countEl = document.getElementById('test-count-number');
        if (countEl) {
          countEl.textContent = data.count.toLocaleString();
        }
      }
    })
    .catch(() => {});
}

// ========== 初始化 ==========
function init() {
  // 隐藏加载屏幕
  setTimeout(() => {
    const loading = document.getElementById('loading-screen');
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 0.4s';
    setTimeout(() => {
      loading.style.display = 'none';
      document.getElementById('app').style.display = '';
    }, 400);
  }, 1200);

  initStartPage();
  initInfoPage();
  initBackButtons();

  // 页面加载时获取完成测试人数
  fetchTestCount();
}

document.addEventListener('DOMContentLoaded', init);
