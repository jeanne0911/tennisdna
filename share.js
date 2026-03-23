// ========== 分享功能模块 ==========
import { resultTypes, matchTable } from './data.js';
import { showToast } from './app.js';

/**
 * 显示分享海报弹窗
 */
export function showShareModal(result, mainType, subType, typeScores) {
  const match = matchTable[mainType];
  const bestMatchType = resultTypes[match.best.id];

  const overlay = document.createElement('div');
  overlay.id = 'share-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,0.92);
    display:flex;flex-direction:column;
    align-items:center;justify-content:flex-start;
    overflow-y:auto;
    padding: 12px 0 32px;
    backdrop-filter:blur(8px);
    -webkit-backdrop-filter:blur(8px);
  `;

  overlay.innerHTML = `
    <!-- 顶部操作栏 -->
    <div style="width:100%;max-width:420px;display:flex;align-items:center;justify-content:space-between;padding:0 16px 10px;flex-shrink:0;">
      <span style="color:#9ca3af;font-size:13px;">长按图片保存 / 分享给好友</span>
      <button id="btn-close-share" style="
        width:32px;height:32px;border-radius:50%;
        background:rgba(255,255,255,0.1);border:none;
        color:#fff;font-size:16px;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
      ">✕</button>
    </div>

    <!-- 海报主体（自适应缩放） -->
    <div id="share-poster-wrapper" style="
      width:100%;max-width:420px;flex-shrink:0;
      display:flex;justify-content:center;
    ">
    <div id="share-poster" style="
      width:100%;
      border-radius:20px;overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
      position:relative;
      background: linear-gradient(160deg, #0d1f3c 0%, #0a1628 45%, #071020 100%);
      transform-origin: top center;
    ">
      <!-- 背景光晕 -->
      <div style="
        position:absolute;top:-80px;left:50%;transform:translateX(-50%);
        width:320px;height:320px;border-radius:50%;
        background:radial-gradient(circle, ${result.color}1a 0%, transparent 70%);
        pointer-events:none;
      "></div>
      <!-- 装饰网球 -->
      <div style="position:absolute;top:12px;right:14px;font-size:44px;opacity:0.05;transform:rotate(15deg);pointer-events:none;line-height:1;">🎾</div>

      <!-- ① 顶部品牌 + 类型标题 -->
      <div style="padding:18px 22px 14px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:20px;">🎾</span>
          <span style="color:#c8e64c;font-size:16px;font-weight:800;letter-spacing:0.5px;">Tennis DNA Test</span>
        </div>
        <div style="
          display:inline-flex;align-items:center;gap:4px;
          padding:4px 12px;border-radius:20px;
          background:rgba(200,230,76,0.1);border:1px solid rgba(200,230,76,0.2);
          color:#c8e64c;font-size:13px;font-weight:700;
        ">🧬 我的网球DNA</div>
      </div>

      <!-- ② 类型名称 -->
      <div style="padding:0 22px 16px;text-align:center;">
        <div style="
          font-size:40px;font-weight:900;
          color:${result.color};
          text-shadow:0 0 24px ${result.color}55;
          line-height:1.2;
        ">${result.emoji} ${result.name}</div>
      </div>

      <!-- 分割线 -->
      <div style="margin:0 22px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);"></div>

      <!-- ③ 主内容区：能力雷达标题在框外，关键特征+雷达图在同一个框内（与结果页一致） -->
      <div style="padding:0 22px 12px;">
        <!-- 标题行：能力雷达在框外左侧 -->
        <div style="color:#6b7280;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
          📊 能力雷达
        </div>
        <!-- 同一个卡片框：左关键特征 + 右雷达图 -->
        <div style="border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <div style="display:flex;align-items:stretch;">
            <!-- 左：关键特征（含标题） -->
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:9px;padding:12px 14px;border-right:1px solid rgba(255,255,255,0.05);">
              <div style="color:#6b7280;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">🏷️ 关键特征</div>
              ${result.traits.map(trait => `
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="width:6px;height:6px;border-radius:50%;background:${result.color};flex-shrink:0;display:inline-block;"></span>
                  <span style="color:#e5e7eb;font-size:16px;font-weight:500;">${trait}</span>
                </div>
              `).join('')}
            </div>
            <!-- 右：雷达图 -->
            <div style="flex:0 0 190px;display:flex;align-items:center;justify-content:center;padding:4px 0;">
              <canvas id="share-radar-canvas" style="display:block;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <div style="margin:0 22px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);"></div>

      <!-- ④ 代表球星 -->
      <div style="padding:12px 22px 10px;">
        <div style="color:#6b7280;font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:8px;text-transform:uppercase;">⭐ 代表球星</div>
        <div style="
          display:flex;align-items:center;gap:10px;
          padding:10px 12px;border-radius:12px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.07);
        ">
          <div style="width:52px;height:52px;border-radius:10px;overflow:hidden;flex-shrink:0;border:1px solid rgba(255,255,255,0.1);">
            <img src="${result.starPhoto}" alt="${result.star}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.style.display='none';">
          </div>
          <div style="flex:1;min-width:0;">
            <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:3px;">${result.star}</div>
            <div style="color:#9ca3af;font-size:14px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${result.starDesc}</div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <div style="margin:0 22px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);"></div>

      <!-- ⑤ 搭子匹配（三个） -->
      <div style="padding:12px 22px 12px;">
        <div style="color:#6b7280;font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:9px;text-transform:uppercase;">💥 搭子匹配</div>
        <!-- 最佳搭档 -->
        <div style="
          display:flex;align-items:center;gap:10px;
          padding:9px 12px;border-radius:12px;
          background:linear-gradient(135deg,rgba(200,230,76,0.07),rgba(200,230,76,0.02));
          border:1px solid rgba(200,230,76,0.15);
          margin-bottom:7px;
          position:relative;
        ">
          <div style="position:absolute;top:5px;right:8px;font-size:11px;color:#c8e64c;font-weight:700;">⭐ 最佳</div>
          <div style="
            width:36px;height:36px;border-radius:10px;flex-shrink:0;
            background:${bestMatchType.color}15;border:1px solid ${bestMatchType.color}44;
            display:flex;align-items:center;justify-content:center;font-size:20px;
          ">${bestMatchType.emoji}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:16px;font-weight:800;color:${bestMatchType.color};">${bestMatchType.name}</div>
            <div style="color:#d1d5db;font-size:14px;font-weight:600;">${match.best.matchEmoji} 「${match.best.matchName}」</div>
          </div>
        </div>
        <!-- 其他两个搭子 -->
        ${match.others.map(other => {
          const otherType = resultTypes[other.id];
          return `
            <div style="
              display:flex;align-items:center;gap:10px;
              padding:9px 12px;border-radius:12px;
              background:rgba(255,255,255,0.03);
              border:1px solid rgba(255,255,255,0.07);
              margin-bottom:7px;
            ">
              <div style="
                width:36px;height:36px;border-radius:10px;flex-shrink:0;
                background:${otherType.color}10;border:1px solid ${otherType.color}33;
                display:flex;align-items:center;justify-content:center;font-size:20px;
              ">${otherType.emoji}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:16px;font-weight:700;color:${otherType.color};">${otherType.name}</div>
                <div style="color:#9ca3af;font-size:14px;">${other.matchEmoji} 「${other.matchName}」</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 分割线 -->
      <div style="margin:0 22px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);"></div>

      <!-- ⑥ 底部：左侧扫码提示+社交媒体 + 右侧二维码（上边缘对齐） -->
      <div style="padding:8px 22px 6px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div style="flex:1;">
          <div style="color:#c8e64c;font-size:16px;font-weight:700;margin-bottom:8px;">🎾 扫码测测你的网球DNA</div>
          <div style="color:#9ca3af;font-size:13px;margin-bottom:6px;">更多有趣活动，请关注</div>
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
            <img src="/static/red.png" style="width:16px;height:16px;border-radius:3px;flex-shrink:0;" alt="小红书">
            <span style="color:#e5e7eb;font-size:14px;font-weight:600;">小红书：一起趣玩</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            <svg viewBox="0 0 24 24" width="16" height="16" style="flex-shrink:0;">
              <circle cx="12" cy="12" r="11" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
              <text x="12" y="12" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="12" font-weight="bold">@</text>
            </svg>
            <span style="color:#e5e7eb;font-size:14px;font-weight:600;">Threads：fun.go_official</span>
          </div>
        </div>
        <div style="flex-shrink:0;text-align:center;">
          <div style="
            width:88px;height:88px;border-radius:10px;
            background:#fff;
            display:flex;align-items:center;justify-content:center;
            overflow:hidden;
          ">
            <img src="/static/http___150.158.141.205_8080.png" style="width:84px;height:84px;display:block;" alt="二维码">
          </div>
        </div>
      </div>
      <!-- 分割线 -->
      <div style="margin:8px 22px 0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);"></div>

      <!-- ⑦ 页脚：©️一起趣玩 放到最底部 -->
      <div style="padding:12px 22px 16px;text-align:center;">
        <div style="color:#c8e64c;font-size:15px;font-weight:800;">©️ 一起趣玩</div>
      </div>
    </div>

    </div><!-- end share-poster -->
    </div><!-- end share-poster-wrapper -->

    <!-- 底部操作按钮 -->
    <div style="width:100%;max-width:420px;margin-top:14px;display:flex;flex-direction:column;gap:8px;flex-shrink:0;padding:0 12px;box-sizing:border-box;">
      <button id="btn-save-poster" style="
        width:100%;padding:14px;border-radius:14px;border:none;cursor:pointer;
        background:linear-gradient(135deg, #c8e64c, #4ade80);
        color:#0a1628;font-size:15px;font-weight:800;
        display:flex;align-items:center;justify-content:center;gap:8px;
        box-shadow:0 6px 20px rgba(200,230,76,0.3);
        -webkit-tap-highlight-color:transparent;
      ">
        <span style="font-size:18px;">💾</span> 保存海报 · 分享给好友
      </button>
      <button id="btn-close-share2" style="
        width:100%;padding:11px;border-radius:14px;cursor:pointer;
        background:transparent;border:none;
        color:#6b7280;font-size:13px;
        -webkit-tap-highlight-color:transparent;
      ">关闭</button>
      <p style="text-align:center;font-size:14px;font-weight:700;color:#c8e64c;margin-top:4px;">©️ 一起趣玩</p>
    </div>
  `;

  // 注入动画样式
  if (!document.getElementById('poster-anim-style')) {
    const style = document.createElement('style');
    style.id = 'poster-anim-style';
    style.textContent = `
      @keyframes posterFadeIn {
        from { opacity:0; transform:translateY(16px) scale(0.97); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      #share-poster {
        animation: posterFadeIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // 海报自适应缩放：确保完整显示在屏幕内
  setTimeout(() => {
    const poster = overlay.querySelector('#share-poster');
    const wrapper = overlay.querySelector('#share-poster-wrapper');
    if (poster && wrapper) {
      const viewportH = window.innerHeight;
      const topBarH = 60;
      const bottomH = 100;
      const availableH = viewportH - topBarH - bottomH - 24;
      const posterH = poster.scrollHeight;
      if (posterH > availableH && availableH > 0) {
        const scale = availableH / posterH;
        poster.style.transform = `scale(${scale})`;
        poster.style.transformOrigin = 'top center';
        wrapper.style.height = (posterH * scale) + 'px';
        wrapper.style.overflow = 'visible';
      }
    }
  }, 200);

  // 绘制雷达图（Canvas）
  setTimeout(() => {
    drawShareRadar(overlay.querySelector('#share-radar-canvas'), result);
  }, 50);

  // 二维码已使用静态图片，无需动态生成

  // 关闭
  const closeHandler = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(() => overlay.remove(), 200);
  };
  overlay.querySelector('#btn-close-share').addEventListener('click', closeHandler);
  overlay.querySelector('#btn-close-share2').addEventListener('click', closeHandler);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeHandler();
  });

  // 保存海报
  overlay.querySelector('#btn-save-poster').addEventListener('click', () => {
    showToast('正在生成海报...');
    setTimeout(() => {
      generateShareCard(result, mainType, subType, typeScores);
    }, 100);
  });
}

/**
 * 在 Canvas 上绘制雷达图（用于分享弹窗）
 */
function drawShareRadar(canvas, result) {
  if (!canvas) return;
  const dpr = Math.max(window.devicePixelRatio || 2, 2);
  const displaySize = 190;
  canvas.width = displaySize * dpr;
  canvas.height = displaySize * dpr;
  canvas.style.width = displaySize + 'px';
  canvas.style.height = displaySize + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = displaySize, H = displaySize;
  const cx = W / 2, cy = H / 2;
  const R = 60;
  const keys = Object.keys(result.stats);
  const values = keys.map(k => result.stats[k] / 100);
  const labels = { attack: '进攻性', stability: '稳定性', variety: '变化性', vibe: '氛围感' };
  const n = keys.length;

  ctx.clearRect(0, 0, W, H);

  for (let level = 1; level <= 4; level++) {
    const r = R * (level / 4);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = R * values[i];
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = result.color + '28';
  ctx.fill();
  ctx.strokeStyle = result.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = R * values[i];
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = result.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelR = R + 16;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    ctx.fillText(labels[keys[i]], x, y);
  }
}

/**
 * 生成分享卡片（Canvas）并下载
 */
export function generateShareCard(result, mainType, subType, typeScores) {
  console.log('开始生成分享海报...');
  const match = matchTable[mainType];
  const bestMatchType = resultTypes[match.best.id];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const W = 750;
  const H = 1200;
  canvas.width = W;
  canvas.height = H;

  // ---- 背景 ----
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0d1f3c');
  bgGrad.addColorStop(0.5, '#0a1628');
  bgGrad.addColorStop(1, '#071020');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const topGlow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 380);
  topGlow.addColorStop(0, result.color + '1a');
  topGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, 380);

  // ---- 品牌标识 ----
  const emojiFont = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol"';
  ctx.fillStyle = '#c8e64c';
  ctx.font = `bold 30px ${emojiFont},sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🎾 Tennis DNA Test', 56, 64);

  // ---- 类型名称 ----
  ctx.fillStyle = result.color;
  ctx.font = `bold 68px ${emojiFont},sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = result.color;
  ctx.shadowBlur = 28;
  ctx.fillText(`${result.emoji} ${result.name}`, W / 2, 152);
  ctx.shadowBlur = 0;

  // ---- 分割线 ----
  const drawDivider = (y) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(W - 56, y);
    ctx.stroke();
  };
  drawDivider(182);

  // ---- 左：关键字（带框）+ 右：雷达图 ----
  const sectionY = 204;
  const leftW = 290;
  const radarSize = 210;
  const radarBoxX = 56 + leftW + 24;
  const radarBoxW = W - 112 - leftW - 24;

  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  roundRect(ctx, 56, sectionY, leftW, radarSize + 10, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, 56, sectionY, leftW, radarSize + 10, 14);
  ctx.stroke();

  ctx.fillStyle = '#6b7280';
  ctx.font = `bold 20px ${emojiFont},sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🏷️ 关键特征', 72, sectionY + 30);

  const traits = result.traits || [];
  traits.forEach((trait, i) => {
    const ty = sectionY + 62 + i * 40;
    ctx.beginPath();
    ctx.arc(80, ty - 5, 5, 0, Math.PI * 2);
    ctx.fillStyle = result.color;
    ctx.fill();
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(trait, 96, ty);
  });

  ctx.fillStyle = '#6b7280';
  ctx.font = `bold 20px ${emojiFont},sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('📊 能力雷达', radarBoxX, sectionY + 30);

  const radarCx = radarBoxX + radarBoxW / 2;
  const radarCy = sectionY + radarSize / 2 + 20;
  drawCanvasRadar(ctx, result, radarCx, radarCy, 82);

  drawDivider(sectionY + radarSize + 30);

  // ---- 代表球星 ----
  const starY = sectionY + radarSize + 50;
  ctx.fillStyle = '#6b7280';
  ctx.font = `bold 20px ${emojiFont},sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('⭐ 代表球星', 56, starY);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  roundRect(ctx, 56, starY + 16, W - 112, 80, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  roundRect(ctx, 56, starY + 16, W - 112, 80, 14);
  ctx.stroke();

  const starImgSize = 56;
  const starImgX = 72;
  const starImgY = starY + 28;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(result.star, starImgX + starImgSize + 14, starY + 52);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px sans-serif';
  wrapText(ctx, result.starDesc, starImgX + starImgSize + 14, starY + 74, W - 200, 22);

  drawDivider(starY + 116);

  // ---- 搭子匹配 ----
  const matchY = starY + 134;
  ctx.fillStyle = '#6b7280';
  ctx.font = `bold 20px ${emojiFont},sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('💥 搭子匹配', 56, matchY);

  const matchGrad = ctx.createLinearGradient(56, matchY + 16, W - 56, matchY + 16);
  matchGrad.addColorStop(0, 'rgba(200,230,76,0.08)');
  matchGrad.addColorStop(1, 'rgba(200,230,76,0.02)');
  ctx.fillStyle = matchGrad;
  roundRect(ctx, 56, matchY + 16, W - 112, 70, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,230,76,0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, 56, matchY + 16, W - 112, 70, 12);
  ctx.stroke();

  ctx.fillStyle = '#c8e64c';
  ctx.font = `bold 16px ${emojiFont},sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('⭐ 最佳', W - 70, matchY + 32);

  ctx.fillStyle = bestMatchType.color + '15';
  roundRect(ctx, 70, matchY + 24, 46, 46, 10);
  ctx.fill();
  ctx.strokeStyle = bestMatchType.color + '44';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 70, matchY + 24, 46, 46, 10);
  ctx.stroke();
  ctx.font = '26px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = bestMatchType.color;
  ctx.fillText(bestMatchType.emoji, 93, matchY + 47);
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = bestMatchType.color;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(bestMatchType.name, 130, matchY + 42);
  ctx.fillStyle = '#d1d5db';
  ctx.font = `bold 18px ${emojiFont},sans-serif`;
  ctx.fillText(`${match.best.matchEmoji} 「${match.best.matchName}」`, 130, matchY + 64);

  match.others.forEach((other, i) => {
    const otherType = resultTypes[other.id];
    const oy = matchY + 100 + i * 78;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    roundRect(ctx, 56, oy, W - 112, 66, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    roundRect(ctx, 56, oy, W - 112, 66, 12);
    ctx.stroke();

    ctx.fillStyle = otherType.color + '10';
    roundRect(ctx, 70, oy + 10, 46, 46, 10);
    ctx.fill();
    ctx.strokeStyle = otherType.color + '33';
    ctx.lineWidth = 1;
    roundRect(ctx, 70, oy + 10, 46, 46, 10);
    ctx.stroke();
    ctx.font = '26px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = otherType.color;
    ctx.fillText(otherType.emoji, 93, oy + 33);
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = otherType.color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(otherType.name, 130, oy + 32);
    ctx.fillStyle = '#9ca3af';
    ctx.font = `15px ${emojiFont},sans-serif`;
    ctx.fillText(`${other.matchEmoji} 「${other.matchName}」`, 130, oy + 54);
  });

  drawDivider(matchY + 268);

  // ---- 底部：左侧扫码提示+社交媒体 + 右侧二维码（上边缘对齐） ----
  const bottomY = matchY + 286;

  // 二维码尺寸和位置（调大到120，上边缘与文字上方对齐）
  const qrSize = 120;
  const qrX = W - 56 - qrSize;
  const qrY = bottomY + 4;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 12);
  ctx.fill();

  // "扫码测测你的网球DNA" 左对齐，与二维码上边缘对齐
  ctx.fillStyle = '#c8e64c';
  ctx.font = `bold 24px ${emojiFont},sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🎾 扫码测测你的网球DNA', 56, bottomY + 22);

  // "更多有趣活动，请关注"
  ctx.fillStyle = '#9ca3af';
  ctx.font = '19px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('更多有趣活动，请关注', 56, bottomY + 54);

  // 小红书
  const xhsLogoY = bottomY + 78;
  ctx.fillStyle = '#e5e7eb';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('小红书：一起趣玩', 56 + 28, xhsLogoY + 5);

  // Threads
  const thLogoY = bottomY + 110;
  ctx.beginPath();
  ctx.arc(56 + 10, thLogoY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(56 + 10, thLogoY, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('@', 56 + 10, thLogoY);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#e5e7eb';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Threads：fun.go_official', 56 + 28, thLogoY + 5);

  drawDivider(bottomY + 140);

  // "©️ 一起趣玩" 放在最底部
  ctx.fillStyle = '#c8e64c';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('©️ 一起趣玩', W / 2, bottomY + 174);

  // ---- 加载图片并下载 ----
  const xhsLogoUrl = '/static/red.png';
  const qrCodeUrl = '/static/http___150.158.141.205_8080.png';

  const drawAllAndDownload = (starImgEl, xhsLogoEl, qrImgEl) => {
    if (starImgEl) {
      try {
        ctx.save();
        roundRect(ctx, starImgX, starImgY, starImgSize, starImgSize, 8);
        ctx.clip();
        const imgAspect = starImgEl.naturalWidth / starImgEl.naturalHeight;
        let sx = 0, sy = 0, sw = starImgEl.naturalWidth, sh = starImgEl.naturalHeight;
        if (imgAspect > 1) {
          sw = starImgEl.naturalHeight;
          sx = (starImgEl.naturalWidth - sw) / 2;
        } else {
          sh = starImgEl.naturalWidth;
          sy = (starImgEl.naturalHeight - sh) / 2;
        }
        ctx.drawImage(starImgEl, sx, sy, sw, sh, starImgX, starImgY, starImgSize, starImgSize);
        ctx.restore();
      } catch(e) {
        try { ctx.restore(); } catch(_) {}
      }
    }
    if (xhsLogoEl) {
      try {
        ctx.save();
        roundRect(ctx, 56, xhsLogoY - 10, 20, 20, 4);
        ctx.clip();
        ctx.drawImage(xhsLogoEl, 0, 0, xhsLogoEl.naturalWidth, xhsLogoEl.naturalHeight, 56, xhsLogoY - 10, 20, 20);
        ctx.restore();
      } catch(e) {
        try { ctx.restore(); } catch(_) {}
        ctx.fillStyle = '#FF2442';
        roundRect(ctx, 56, xhsLogoY - 10, 20, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('红', 66, xhsLogoY);
        ctx.textBaseline = 'alphabetic';
      }
    } else {
      ctx.fillStyle = '#FF2442';
      roundRect(ctx, 56, xhsLogoY - 10, 20, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('红', 66, xhsLogoY);
      ctx.textBaseline = 'alphabetic';
    }
    // 绘制二维码图片
    if (qrImgEl) {
      try {
        ctx.save();
        roundRect(ctx, qrX + 4, qrY + 4, qrSize - 8, qrSize - 8, 6);
        ctx.clip();
        ctx.drawImage(qrImgEl, 0, 0, qrImgEl.naturalWidth, qrImgEl.naturalHeight, qrX + 4, qrY + 4, qrSize - 8, qrSize - 8);
        ctx.restore();
      } catch(e) {
        try { ctx.restore(); } catch(_) {}
      }
    }
    downloadCanvas(canvas, result.name);
  };

  let starImgLoaded = null;
  let xhsLogoLoaded = null;
  let qrImgLoaded = null;
  let loadCount = 0;
  const totalLoads = 3;

  const checkAllLoaded = () => {
    loadCount++;
    console.log(`图片加载进度: ${loadCount}/${totalLoads}`);
    if (loadCount >= totalLoads) {
      drawAllAndDownload(starImgLoaded, xhsLogoLoaded, qrImgLoaded);
    }
  };

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { console.log('球星头像加载成功:', result.starPhoto); starImgLoaded = img; checkAllLoaded(); };
  img.onerror = () => { console.error('球星头像加载失败:', result.starPhoto); checkAllLoaded(); };
  const starPhotoUrl = result.starPhoto;
  img.src = starPhotoUrl + (starPhotoUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
  console.log('开始加载球星头像:', img.src);

  const xhsImg = new Image();
  xhsImg.crossOrigin = 'anonymous';
  xhsImg.onload = () => { console.log('小红书logo加载成功'); xhsLogoLoaded = xhsImg; checkAllLoaded(); };
  xhsImg.onerror = () => { console.error('小红书logo加载失败'); checkAllLoaded(); };
  xhsImg.src = xhsLogoUrl + '?_t=' + Date.now();
  console.log('开始加载小红书logo:', xhsImg.src);

  const qrImg = new Image();
  qrImg.crossOrigin = 'anonymous';
  qrImg.onload = () => { console.log('二维码加载成功'); qrImgLoaded = qrImg; checkAllLoaded(); };
  qrImg.onerror = () => { console.error('二维码加载失败'); checkAllLoaded(); };
  qrImg.src = qrCodeUrl + '?_t=' + Date.now();
  console.log('开始加载二维码:', qrImg.src);
}

function downloadCanvas(canvas, name) {
  console.log('开始下载canvas...');
  // 判断是否在移动端（特别是微信）
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

  console.log('设备检测:', { isMobile, isWeChat, userAgent: navigator.userAgent });

  if (isMobile || isWeChat) {
    // 移动端/微信：显示图片供长按保存
    try {
      const dataURL = canvas.toDataURL('image/png');
      console.log('生成dataURL成功，长度:', dataURL.length);
      if (dataURL && dataURL !== 'data:,') {
        showImageForSave(dataURL, name);
        showToast('长按图片保存到相册');
        return;
      } else {
        console.error('dataURL为空');
      }
    } catch(e) {
      console.error('生成dataURL失败:', e);
    }
  }

  // PC端：使用传统下载方式
  try {
    const dataURL = canvas.toDataURL('image/png');
    if (dataURL && dataURL !== 'data:,') {
      console.log('PC端下载方式1: dataURL');
      const link = document.createElement('a');
      link.download = `网球DNA_${name}.png`;
      link.href = dataURL;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); }, 200);
      showToast('海报已保存！快去分享吧 🎾');
      return;
    }
  } catch(e1) {
    console.error('PC端下载方式1失败:', e1);
  }

  try {
    console.log('PC端下载方式2: blob');
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('blob生成成功，大小:', blob.size);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `网球DNA_${name}.png`;
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 500);
        showToast('海报已保存！快去分享吧 🎾');
      } else {
        console.error('blob为空');
        showToast('保存失败，请截屏保存 📸');
      }
    }, 'image/png');
  } catch(e2) {
    console.error('PC端下载方式2失败:', e2);
    showToast('请截屏保存后分享 📸');
  }
}

/**
 * 显示图片供长按保存（移动端/微信）
 */
function showImageForSave(dataURL, name) {
  // 检查是否已有图片弹窗，有则移除
  const existing = document.getElementById('image-save-modal');
  if (existing) {
    document.body.removeChild(existing);
  }

  const modal = document.createElement('div');
  modal.id = 'image-save-modal';
  modal.style.cssText = `
    position:fixed;
    inset:0;
    z-index:10000;
    background:rgba(0,0,0,0.95);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:20px;
    animation: fadeIn 0.3s ease;
  `;

  const img = document.createElement('img');
  img.src = dataURL;
  img.style.cssText = `
    max-width:100%;
    max-height:80vh;
    border-radius:12px;
    box-shadow:0 10px 40px rgba(0,0,0,0.5);
  `;

  const tip = document.createElement('div');
  tip.style.cssText = `
    color:#fff;
    margin-top:20px;
    font-size:16px;
    font-weight:600;
    text-align:center;
  `;
  tip.innerHTML = '📱 长按图片保存到相册';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position:absolute;
    top:20px;
    right:20px;
    width:44px;
    height:44px;
    border-radius:50%;
    background:rgba(255,255,255,0.15);
    border:none;
    color:#fff;
    font-size:20px;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
  `;

  closeBtn.onclick = () => {
    modal.style.opacity = '0';
    setTimeout(() => document.body.removeChild(modal), 300);
  };

  modal.appendChild(closeBtn);
  modal.appendChild(img);
  modal.appendChild(tip);
  document.body.appendChild(modal);

  // 添加动画样式
  if (!document.getElementById('image-save-style')) {
    const style = document.createElement('style');
    style.id = 'image-save-style';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity:0; }
        to { opacity:1; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 在主 Canvas 上绘制雷达图（标签在外）
 */
function drawCanvasRadar(ctx, result, cx, cy, R) {
  const keys = Object.keys(result.stats);
  const values = keys.map(k => result.stats[k] / 100);
  const labels = { attack: '进攻性', stability: '稳定性', variety: '变化性', vibe: '氛围感' };
  const n = keys.length;

  for (let level = 1; level <= 4; level++) {
    const r = R * (level / 4);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = R * values[i];
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = result.color + '28';
  ctx.fill();
  ctx.strokeStyle = result.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = R * values[i];
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = result.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = '#9ca3af';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelR = R + 22;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    ctx.fillText(labels[keys[i]], x, y);
  }
  ctx.textBaseline = 'alphabetic';
}

// Canvas辅助：圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Canvas辅助：自动换行文字
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let currentY = y;
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}