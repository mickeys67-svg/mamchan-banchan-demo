/* ============================================================
   맘찬 — 반찬 예약주문 데모 v2 · 로직 (vanilla JS)
   고객: 홈/구독/내예약/마이  ·  관리자: 대시보드/주문/메뉴/구독/CRM/카카오
   ============================================================ */
'use strict';

/* ---------- 기준일 2026-06-15 ---------- */
const DEMO = { y: 2026, m: 5, d: 15 };
const WON = n => n.toLocaleString('ko-KR') + '원';
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

/* ---------- 메뉴 풀 ---------- */
const POOL = [
  { f:'🍖', n:'제육볶음',        d:'국내산 앞다리살을 매콤 양념에 볶아낸 대표 집반찬', p:9800,  was:11000, tags:['매콤','1인분 250g'], kcal:420 },
  { f:'🐟', n:'고등어무조림',    d:'두툼한 고등어와 무를 칼칼하게 조린 밥도둑',       p:10800, was:12000, tags:['오메가3','국물자작'], kcal:380 },
  { f:'🥩', n:'소불고기',        d:'간장 양념에 재운 부드러운 한우 등심 불고기',       p:12800, was:14500, tags:['아이추천','달큰'], kcal:450 },
  { f:'🍜', n:'잡채',            d:'아삭한 채소와 쫄깃한 당면이 가득한 잔치 잡채',     p:9800,  was:10500, tags:['채소듬뿍'], kcal:340 },
  { f:'🐔', n:'춘천식 닭갈비',   d:'고소한 양념에 볶아낸 매콤 닭갈비',                 p:10800, was:12000, tags:['매콤','인기'], kcal:410 },
  { f:'🐟', n:'코다리조림',      d:'쫄깃한 코다리를 매콤달콤하게 조렸어요',           p:11800, was:13000, tags:['저칼로리'], kcal:300 },
  { f:'🍲', n:'돼지김치찜',      d:'푹 익은 묵은지와 통목살의 깊은 조화',             p:11800, was:13500, tags:['든든','국물'], kcal:480 },
  { f:'🥘', n:'갈비찜',          d:'명절에만 먹던 갈비찜을 매일 식탁에서',            p:14800, was:17000, tags:['프리미엄','선물'], kcal:520 },
  { f:'🍤', n:'간장새우장',      d:'탱글한 새우를 간장에 푹 재운 밥도둑',             p:13800, was:15000, tags:['밥도둑','신상'], kcal:260 },
  { f:'🥬', n:'된장찌개+나물3종', d:'구수한 강된장과 제철 나물 3종 구성',             p:9800,  was:10800, tags:['건강','채식'], kcal:290 },
  { f:'🍗', n:'안동찜닭',        d:'당면 듬뿍, 달콤짭짤한 안동식 찜닭',               p:12800, was:14000, tags:['든든','가족'], kcal:470 },
  { f:'🐟', n:'갈치조림',        d:'살이 통통한 제주 은갈치 무조림',                 p:13800, was:15500, tags:['프리미엄'], kcal:360 },
  { f:'🥩', n:'LA갈비',          d:'숯불향 가득 양념 LA꽃갈비',                       p:15800, was:18000, tags:['프리미엄','선물'], kcal:540 },
  { f:'🍳', n:'계란장조림 한상', d:'계란장조림+오이무침+멸치볶음 단정한 한 상',       p:8800,  was:9800,  tags:['가성비','밑반찬'], kcal:320 },
  { f:'🍲', n:'순두부찌개',      d:'얼큰한 해물 순두부찌개 (2인분)',                 p:9800,  was:10800, tags:['국물','매콤'], kcal:310 },
  { f:'🐙', n:'낙지볶음',        d:'쫄깃한 낙지의 불맛 매운 볶음',                   p:13800, was:15000, tags:['매콤','술안주'], kcal:390 },
  { f:'🥗', n:'집밥 정식세트',   d:'잡곡밥+국+밑반찬 5종 균형 한 끼',                p:11800, was:13000, tags:['균형식','인기'], kcal:430 },
  { f:'🍖', n:'돼지불백',        d:'불맛 가득 돼지불고기 백반',                       p:10800, was:12000, tags:['든든'], kcal:440 },
  { f:'🍲', n:'부대찌개',        d:'햄·소시지 푸짐한 부대찌개 (2인분)',              p:10800, was:12000, tags:['든든','국물'], kcal:500 },
  { f:'🐟', n:'동태찌개',        d:'시원한 국물의 얼큰 동태찌개',                     p:9800,  was:10800, tags:['국물'], kcal:280 },
];
const OPTIONS = [
  { n:'옵션 없음',          p:0 },
  { n:'수제 계란말이 추가',  p:3000 },
  { n:'제철나물 3종 추가',   p:3500 },
  { n:'잡곡밥 2공기 추가',   p:2500 },
  { n:'정성국 1리터 추가',   p:4000 },
];
const REVIEWS = [
  { n:'정*아', s:'★★★★★', t:'간이 딱 좋아요. 아이들도 잘 먹어서 매주 시켜요!' },
  { n:'김*은', s:'★★★★★', t:'반찬가게보다 훨씬 신선하고 양도 넉넉합니다.' },
  { n:'박*호', s:'★★★★☆', t:'배송 빠르고 좋아요. 조금 더 매웠으면 👍' },
];

function menuFor(y, m, day) {
  const dow = new Date(y, m, day).getDay();
  if (dow === 0 || dow === 6) return null;
  return POOL[(y * 372 + m * 31 + day) % POOL.length];
}
function capFor(y, m, day) {
  const seed = (y * 13 + m * 7 + day * 17);
  const limit = 60 + (seed % 5) * 10;
  let ordered = (seed * 29) % (limit + 12);
  if (ordered > limit) ordered = limit;
  return { limit, ordered };
}
function stateOf(y, m, day) {
  if (!menuFor(y, m, day)) return 'off';
  const isPast = (y < DEMO.y) || (y === DEMO.y && (m < DEMO.m || (m === DEMO.m && day < DEMO.d)));
  if (isPast) return 'past';
  const c = capFor(y, m, day); const left = c.limit - c.ordered;
  if (left <= 0) return 'out';
  if (left <= 8) return 'hot';
  return 'ok';
}

/* =================== 대분류 뷰 전환 =================== */
function showView(v) {
  document.querySelectorAll('.view').forEach(e => e.classList.remove('on'));
  document.getElementById('view-' + v).classList.add('on');
  document.getElementById('nv-customer').classList.toggle('on', v === 'customer');
  document.getElementById('nv-admin').classList.toggle('on', v === 'admin');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =================== 고객 하단 탭 =================== */
function switchTab(t, btn) {
  document.querySelectorAll('.pscreen').forEach(e => e.classList.remove('on'));
  document.getElementById('ps-' + t).classList.add('on');
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  if (t === 'orders') buildOrders();
  if (t === 'my') buildMy();
}

/* =================== 캘린더 =================== */
let viewY = DEMO.y, viewM = DEMO.m;
function buildCal() {
  document.getElementById('calYM').innerHTML =
    `<b>${viewY}년 ${viewM + 1}월</b><span>${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][viewM]} ${viewY}</span>`;
  const first = new Date(viewY, viewM, 1).getDay();
  const days = new Date(viewY, viewM + 1, 0).getDate();
  const g = document.getElementById('calGrid'); g.innerHTML = '';
  for (let i = 0; i < first; i++) g.appendChild(Object.assign(document.createElement('div'), { className: 'cell empty' }));
  for (let day = 1; day <= days; day++) {
    const st = stateOf(viewY, viewM, day);
    const m = menuFor(viewY, viewM, day);
    const isToday = viewY === DEMO.y && viewM === DEMO.m && day === DEMO.d;
    const cell = document.createElement('div');
    cell.className = 'cell ' + (st === 'off' ? 'off' : st === 'past' ? 'past' : 'click') + (isToday ? ' todaymark' : '');
    let chip = '';
    if (st === 'ok') chip = '<div class="chip ok">예약</div>';
    else if (st === 'hot') { const c = capFor(viewY, viewM, day); chip = `<div class="chip hot">${c.limit - c.ordered}개</div>`; }
    else if (st === 'out') chip = '<div class="chip out">마감</div>';
    else if (st === 'off') chip = '<div class="offtxt">휴무</div>';
    cell.innerHTML = `<div class="d">${day}</div>` + (m ? `<div class="em">${m.f}</div><div class="nm">${m.n}</div>` : '') + chip;
    if (st === 'ok' || st === 'hot') { cell.onclick = () => openSheet(day); cell.tabIndex = 0; cell.setAttribute('role','button'); cell.onkeydown = e => { if (e.key === 'Enter') openSheet(day); }; }
    else if (st === 'out') cell.onclick = () => toast('😢 해당 날짜는 마감되었어요');
    g.appendChild(cell);
  }
  document.getElementById('calPrev').disabled = (viewY < DEMO.y) || (viewY === DEMO.y && viewM <= DEMO.m);
}
function navMonth(d) {
  viewM += d;
  if (viewM < 0) { viewM = 11; viewY--; }
  if (viewM > 11) { viewM = 0; viewY++; }
  buildCal();
}

/* =================== 주문 시트 =================== */
let cur = { y: 0, m: 0, day: 0, qty: 1, opt: 0 };
function openSheet(day) {
  cur = { y: viewY, m: viewM, day, qty: 1, opt: 0 };
  const m = menuFor(viewY, viewM, day);
  const dow = DOW[new Date(viewY, viewM, day).getDay()];
  document.getElementById('shDate').textContent = `${viewM + 1}월 ${day}일 (${dow}) 배송 예약`;
  document.getElementById('shTitle').textContent = m.n;
  document.getElementById('shIco').textContent = m.f;
  document.getElementById('shDesc').textContent = m.d;
  document.getElementById('shTags').innerHTML =
    m.tags.map(t => `<span class="tg">${t}</span>`).join('') + `<span class="tg gray">🔥 ${m.kcal}kcal</span><span class="tg gray">냉장배송</span>`;
  const off = Math.round((1 - m.p / m.was) * 100);
  document.getElementById('shPrice').innerHTML =
    `<span class="now">${WON(m.p)}</span><span class="was">${WON(m.was)}</span><span class="off">${off}%</span>`;
  const ob = document.getElementById('shOpts'); ob.innerHTML = '';
  OPTIONS.forEach((o, i) => {
    const el = document.createElement('div');
    el.className = 'opt' + (i === 0 ? ' sel' : '');
    el.onclick = () => selOpt(i);
    el.innerHTML = `<div class="l"><div class="radio"></div><span class="on">${o.n}</span></div><span class="op">${o.p ? '+' + WON(o.p) : '기본'}</span>`;
    ob.appendChild(el);
  });
  document.getElementById('shReviews').innerHTML = REVIEWS.map(r =>
    `<div class="rev"><div class="rav">${r.n[0]}</div><div class="rb"><div class="rn">${r.n}</div><div class="rs">${r.s}</div><div class="rt">${r.t}</div></div></div>`).join('');
  document.getElementById('shQty').textContent = '1';
  refreshSheet();
  openOverlay('mask', 'sheet');
}
function closeSheet() { closeOverlay('mask', 'sheet'); }
function selOpt(i) { cur.opt = i; document.querySelectorAll('#shOpts .opt').forEach((e, x) => e.classList.toggle('sel', x === i)); refreshSheet(); }
function stepQty(n) { cur.qty = Math.max(1, Math.min(20, cur.qty + n)); document.getElementById('shQty').textContent = cur.qty; refreshSheet(); }
function linePrice() { return (menuFor(cur.y, cur.m, cur.day).p + OPTIONS[cur.opt].p) * cur.qty; }
function refreshSheet() { document.getElementById('shAddPrice').textContent = WON(linePrice()); }

/* =================== 장바구니 =================== */
let cart = [];
let coupon = null;
function addToCart() {
  const m = menuFor(cur.y, cur.m, cur.day);
  cart.push({ y: cur.y, m: cur.m, day: cur.day, name: m.n, ico: m.f, base: m.p, opt: OPTIONS[cur.opt].n, optP: OPTIONS[cur.opt].p, qty: cur.qty });
  updateBadge(); closeSheet();
  toast(`🛒 ${cur.m + 1}/${cur.day} ${m.n} 담았어요`);
}
function updateBadge() {
  const b = document.getElementById('cartBadge');
  const n = cart.reduce((s, i) => s + i.qty, 0);
  if (n) { b.style.display = 'grid'; b.textContent = n; } else b.style.display = 'none';
}
function openCart() { renderCart(); openOverlay('cartMask', 'cartSheet'); }
function closeCart() { closeOverlay('cartMask', 'cartSheet'); }
function cartItemPrice(it) { return (it.base + it.optP) * it.qty; }
function cartQty(i, d) { cart[i].qty = Math.max(1, Math.min(20, cart[i].qty + d)); updateBadge(); renderCart(); }
function cartDel(i) { cart.splice(i, 1); updateBadge(); renderCart(); }
function renderCart() {
  const list = document.getElementById('cartList');
  document.getElementById('cartCheckoutWrap').style.display = cart.length ? 'block' : 'none';
  if (!cart.length) {
    list.innerHTML = `<div class="cart-empty"><span class="big">🗓️</span>담은 메뉴가 없어요.<br>달력에서 원하는 배송일을 선택해 보세요</div>`;
    document.getElementById('cartFoot').style.display = 'none';
    return;
  }
  list.innerHTML = cart.map((it, i) => `
    <div class="cline">
      <div class="em">${it.ico}</div>
      <div class="info">
        <div class="dt">${it.m + 1}/${it.day} (${DOW[new Date(it.y, it.m, it.day).getDay()]}) 배송</div>
        <b>${it.name}</b><p>${it.opt}</p>
        <div class="mini-step"><button onclick="cartQty(${i},-1)" aria-label="수량 감소">−</button><b>${it.qty}</b><button onclick="cartQty(${i},1)" aria-label="수량 증가">+</button></div>
      </div>
      <div class="right"><div class="pr">${WON(cartItemPrice(it))}</div><button onclick="cartDel(${i})" aria-label="삭제" style="border:0;background:none;color:#bcc4be;font-size:17px;margin-top:8px">✕</button></div>
    </div>`).join('');
  const sub = cart.reduce((s, it) => s + cartItemPrice(it), 0);
  const disc = coupon ? Math.min(coupon.amount, sub) : 0;
  document.getElementById('cartFoot').style.display = 'block';
  document.getElementById('cartSum').innerHTML =
    `<div class="sumrow"><span>상품금액</span><span>${WON(sub)}</span></div>` +
    `<div class="sumrow"><span>배송비</span><span>무료</span></div>` +
    (coupon ? `<div class="sumrow disc"><span>${coupon.label}</span><span>-${WON(disc)}</span></div>` : '') +
    `<div class="sumrow tot"><span>총 결제금액</span><span class="v">${WON(sub - disc)}</span></div>`;
}
function applyCoupon() {
  const v = document.getElementById('couponInput').value.trim().toUpperCase();
  const codes = { 'MOM5000': { label: '신규가입 5,000원 쿠폰', amount: 5000 }, 'WELCOME': { label: '웰컴 3,000원 쿠폰', amount: 3000 }, 'VIP15': { label: 'VIP 15% (최대 8,000원)', amount: 8000 } };
  if (codes[v]) { coupon = { code: v, ...codes[v] }; toast('🎟️ 쿠폰이 적용되었어요'); }
  else if (!v) { toast('쿠폰 번호를 입력해 주세요'); return; }
  else { coupon = null; toast('유효하지 않은 쿠폰입니다 (MOM5000 체험)'); }
  renderCart();
}
function checkout() {
  if (!cart.length) return;
  const sub = cart.reduce((s, it) => s + cartItemPrice(it), 0);
  const disc = coupon ? Math.min(coupon.amount, sub) : 0;
  document.getElementById('sucMsg').innerHTML = `${cart.length}개 날짜 · 총 <b>${WON(sub - disc)}</b> 결제가 완료되었습니다.`;
  document.getElementById('sucNo').textContent = '주문번호 MOM-20260615-' + (1000 + Math.floor(Math.random() * 9000));
  closeCart();
  document.getElementById('success').classList.add('on');
}
function closeSuccess() {
  document.getElementById('success').classList.remove('on');
  cart = []; coupon = null; updateBadge();
  document.getElementById('couponInput').value = '';
}

/* 재주문 */
function reorder() {
  cart = [
    { y: DEMO.y, m: DEMO.m, day: 16, name: menuFor(DEMO.y, DEMO.m, 16).n, ico: menuFor(DEMO.y, DEMO.m, 16).f, base: menuFor(DEMO.y, DEMO.m, 16).p, opt: '수제 계란말이 추가', optP: 3000, qty: 1 },
    { y: DEMO.y, m: DEMO.m, day: 18, name: menuFor(DEMO.y, DEMO.m, 18).n, ico: menuFor(DEMO.y, DEMO.m, 18).f, base: menuFor(DEMO.y, DEMO.m, 18).p, opt: '옵션 없음', optP: 0, qty: 1 },
  ];
  updateBadge(); openCart();
  toast('🔁 지난 주문을 장바구니에 담았어요');
}

/* =================== 토스트 =================== */
let tt;
function toast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200);
}

/* =================== 시트 공용 + ESC =================== */
function openOverlay(maskId, sheetId) { document.getElementById(maskId).classList.add('on'); document.getElementById(sheetId).classList.add('on'); }
function closeOverlay(maskId, sheetId) { document.getElementById(maskId).classList.remove('on'); document.getElementById(sheetId).classList.remove('on'); }
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeSheet(); closeCart(); closeDrawer();
  ['modalMenu', 'modalCoupon', 'modalKakao'].forEach(id => closeModal(id));
});

/* =================== 인기 메뉴 =================== */
function buildPopular() {
  const ranks = [{ ...POOL[12], sold: 1284 }, { ...POOL[7], sold: 1102 }, { ...POOL[0], sold: 987 }, { ...POOL[8], sold: 856 }, { ...POOL[16], sold: 742 }];
  document.getElementById('popular').innerHTML = ranks.map((m, i) => `
    <div class="pcard" onclick="toast('인기 메뉴는 달력에서 예약일을 선택하세요 🗓️')">
      <span class="rk">BEST ${i + 1}</span><div class="em">${m.f}</div><b>${m.n}</b>
      <div class="pr">${WON(m.p)}</div><div class="sold">이번달 ${m.sold.toLocaleString()}개 판매</div>
    </div>`).join('');
}

/* =================== 내 예약 =================== */
const MYORDERS = {
  upcoming: [
    { day: 16, opt: '수제 계란말이 추가', price: 13800, step: 1 },
    { day: 18, opt: '옵션 없음', price: 8800, step: 0 },
  ],
  done: [
    { day: 12, opt: '제철나물 3종 추가', price: 13300 },
    { day: 5, opt: '옵션 없음', price: 14800 },
  ],
};
let orderTab = 'upcoming';
function buildOrders(tab) {
  if (tab) orderTab = tab;
  document.querySelectorAll('#otabs button').forEach(b => b.classList.toggle('on', b.dataset.ot === orderTab));
  const wrap = document.getElementById('orderList');
  if (orderTab === 'upcoming') {
    wrap.innerHTML = MYORDERS.upcoming.map(o => {
      const m = menuFor(DEMO.y, DEMO.m, o.day);
      const steps = ['주문완료', '배송준비', '배송중', '배송완료'];
      const st = o.step <= 0 ? '<span class="ostatus os-prep">배송준비중</span>' : '<span class="ostatus os-ship">배송중</span>';
      const track = steps.map((s, i) => `<div class="step ${i < o.step ? 'done' : i === o.step ? 'cur' : ''}"><div class="c">${i < o.step ? '✓' : i + 1}</div><div class="l">${s}</div></div>`).join('');
      return `<div class="ocard">
        <div class="oh"><div class="dt">📦 6/${o.day} (${DOW[new Date(DEMO.y, DEMO.m, o.day).getDay()]}) 배송 예정</div>${st}</div>
        <div class="oitem"><div class="em">${m.f}</div><div class="info"><b>${m.n}</b><p>${o.opt}</p></div><div class="pr">${WON(o.price)}</div></div>
        <div class="track">${track}</div>
        <div class="obtns"><button onclick="toast('배송 조회 (데모)')">배송 조회</button><button onclick="toast('주문 변경은 마감 전까지 가능 (데모)')">주문 변경</button></div>
      </div>`;
    }).join('');
  } else {
    wrap.innerHTML = MYORDERS.done.map(o => {
      const m = menuFor(DEMO.y, DEMO.m, o.day);
      return `<div class="ocard">
        <div class="oh"><div class="dt">✅ 6/${o.day} 배송완료</div><span class="ostatus os-done">완료</span></div>
        <div class="oitem"><div class="em">${m.f}</div><div class="info"><b>${m.n}</b><p>${o.opt}</p></div><div class="pr">${WON(o.price)}</div></div>
        <div class="obtns"><button class="pri" onclick="reorder()">🔁 재주문</button><button onclick="toast('리뷰 작성 (데모)')">리뷰 쓰기</button></div>
      </div>`;
    }).join('');
  }
}

/* =================== 마이페이지 =================== */
function buildMy() {
  document.getElementById('myCoupons').innerHTML = [
    { amt: '15%', t: 'GOLD 등급 쿠폰', d: '~6/30 · 최대 8,000원' },
    { amt: '5,000', t: '신규가입 쿠폰', d: '~6/22 · 코드 MOM5000' },
  ].map(c => `<div class="coupon-card"><div class="amt">${c.amt}<span style="font-size:12px">${c.amt === '15%' ? '' : '원'}</span></div><div class="ci"><b>${c.t}</b><p>${c.d}</p></div><button class="use" onclick="toast('쿠폰함에서 사용 (데모)')">사용</button></div>`).join('');
}

/* =================== 정기구독 (고객) =================== */
function subscribe(plan) { toast(`🔁 '${plan}' 구독을 시작합니다 (데모)`); }

/* ===================================================================
   관리자
   =================================================================== */
function showPanel(p, btn) {
  document.querySelectorAll('.apanel').forEach(e => e.classList.remove('on'));
  document.getElementById('panel-' + p).classList.add('on');
  document.querySelectorAll('.anav').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}
function spark(data, color) {
  const w = 70, h = 26, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1) * w).toFixed(1)},${(h - (v - min) / (max - min || 1) * h).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" class="spark"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function buildAdmin() {
  /* KPI */
  document.getElementById('kpis').innerHTML = `
    <div class="kpi"><div class="ic" style="background:var(--green-soft)">💰</div><div class="k">이번달 객단가</div><div class="v">38,400<small>원</small></div><div class="d up">▲ 12.4% vs 전월</div>${spark([28,30,29,33,34,36,38], 'var(--green)')}</div>
    <div class="kpi"><div class="ic" style="background:var(--coral-soft)">🔁</div><div class="k">재주문율</div><div class="v">63<small>%</small></div><div class="d up">▲ 8.1%p</div>${spark([48,50,52,55,57,60,63], 'var(--coral)')}</div>
    <div class="kpi"><div class="ic" style="background:var(--purple-soft)">👥</div><div class="k">활성 회원</div><div class="v">2,841<small>명</small></div><div class="d up">▲ 마이그레이션 완료</div>${spark([2100,2300,2450,2600,2700,2780,2841], 'var(--purple)')}</div>
    <div class="kpi"><div class="ic" style="background:var(--amber-soft)">💤</div><div class="k">휴면 고객</div><div class="v">512<small>명</small></div><div class="d dn">▼ 재활성 캠페인 대상</div>${spark([640,620,600,580,560,530,512], 'var(--amber)')}</div>`;

  /* 매출 추이 라인차트 (14일) */
  buildLineChart();

  /* 베스트 메뉴 랭킹 */
  const best = [{ ...POOL[12], v: 1284 }, { ...POOL[7], v: 1102 }, { ...POOL[0], v: 987 }, { ...POOL[16], v: 856 }, { ...POOL[8], v: 742 }];
  const bmax = best[0].v;
  document.getElementById('bestRank').innerHTML = best.map((m, i) =>
    `<div class="rank ${i < 3 ? 'top' + (i + 1) : ''}"><div class="no">${i + 1}</div><div class="em">${m.f}</div><div class="rn">${m.n}</div><div class="rbar"><i style="width:${m.v / bmax * 100}%"></i></div><div class="rv">${m.v.toLocaleString()}</div></div>`).join('');

  /* 등급 도넛 */
  const grades = [{ l: 'VIP', v: 184, c: '#8b5cf6' }, { l: 'GOLD', v: 523, c: '#f5a524' }, { l: 'SILVER', v: 1098, c: '#90a0b0' }, { l: 'BASIC', v: 1036, c: '#c3b9a8' }];
  const total = grades.reduce((s, g) => s + g.v, 0);
  let acc = 0; const R = 52, C = 2 * Math.PI * R;
  const segs = grades.map(g => { const frac = g.v / total; const dash = `${(frac * C).toFixed(1)} ${C.toFixed(1)}`; const off = -acc * C; acc += frac; return `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${g.c}" stroke-width="20" stroke-dasharray="${dash}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 70 70)"/>`; }).join('');
  document.getElementById('donut').innerHTML = `<svg width="140" height="140">${segs}<text x="70" y="66" text-anchor="middle" font-size="13" fill="#7c8a82" font-weight="700">전체</text><text x="70" y="86" text-anchor="middle" font-size="18" fill="#16201a" font-weight="800">${total.toLocaleString()}</text></svg>`;
  document.getElementById('donutLegend').innerHTML = grades.map(g => `<div class="dl"><i style="background:${g.c}"></i>${g.l}<b>${g.v.toLocaleString()}명</b><span>${(g.v / total * 100).toFixed(1)}%</span></div>`).join('');

  /* 일자별 예약 현황 */
  document.getElementById('dashRows').innerHTML = [15, 16, 17, 18, 19].map(day => {
    const m = menuFor(DEMO.y, DEMO.m, day), c = capFor(DEMO.y, DEMO.m, day);
    const pct = Math.round(c.ordered / c.limit * 100), st = stateOf(DEMO.y, DEMO.m, day);
    const cls = pct >= 100 ? 'full' : pct >= 85 ? 'warn' : '';
    const pill = st === 'out' ? '<span class="pill p-out">마감</span>' : st === 'hot' ? '<span class="pill p-hot">임박</span>' : '<span class="pill p-open">진행중</span>';
    return `<tr><td><b>6/${day}</b></td><td>${m.f} ${m.n}</td><td>${c.ordered} / ${c.limit}</td><td><div style="display:flex;align-items:center;gap:8px"><div class="capbar"><i class="${cls}" style="width:${Math.min(pct, 100)}%"></i></div><span style="font-size:11px;color:var(--sub);font-weight:700">${pct}%</span></div></td><td>${pill}</td></tr>`;
  }).join('');

  buildOrdersPanel();
  buildSubsPanel();
  buildMenuPanel();
  buildCrm('all');
  buildKakao();
}

function buildLineChart() {
  const data = [288, 312, 301, 330, 348, 322, 360, 372, 355, 401, 419, 388, 410, 441];
  const W = 560, H = 150, pad = 8;
  const max = Math.max(...data), min = Math.min(...data) - 20;
  const X = i => pad + i / (data.length - 1) * (W - pad * 2);
  const Y = v => H - ((v - min) / (max - min) * (H - 20)) - 6;
  const line = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area = `${pad},${H} ${line} ${W - pad},${H}`;
  const dots = data.map((v, i) => i % 2 === 1 ? `<circle class="lc-dot" cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3"/>` : '').join('');
  document.getElementById('lineChart').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="linechart" preserveAspectRatio="none">
      <defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#12a85f" stop-opacity="0.22"/><stop offset="100%" stop-color="#12a85f" stop-opacity="0"/></linearGradient></defs>
      <line class="lc-grid" x1="0" y1="${H * .33}" x2="${W}" y2="${H * .33}"/><line class="lc-grid" x1="0" y1="${H * .66}" x2="${W}" y2="${H * .66}"/>
      <polygon class="lc-area" points="${area}"/><polyline class="lc-line" points="${line}"/>${dots}
    </svg>`;
}

/* ===== 주문 관리 ===== */
const ADMIN_ORDERS = [
  { id: 'MOM-9821', cust: '김민은', day: 16, qty: 2, amt: 25600, st: 'prep' },
  { id: 'MOM-9820', cust: '이준호', day: 16, qty: 1, amt: 13800, st: 'recv' },
  { id: 'MOM-9819', cust: '박서영', day: 16, qty: 3, amt: 31400, st: 'prep' },
  { id: 'MOM-9818', cust: '정유아', day: 15, qty: 1, amt: 9800, st: 'ship' },
  { id: 'MOM-9817', cust: '윤하지', day: 15, qty: 2, amt: 21600, st: 'ship' },
  { id: 'MOM-9816', cust: '한가결', day: 15, qty: 1, amt: 11800, st: 'done' },
  { id: 'MOM-9815', cust: '강도민', day: 17, qty: 4, amt: 47200, st: 'recv' },
];
const ST_LABEL = { recv: '접수', prep: '준비중', ship: '배송중', done: '완료' };
function buildOrdersPanel() {
  const cnt = { recv: 0, prep: 0, ship: 0, done: 0 };
  ADMIN_ORDERS.forEach(o => cnt[o.st]++);
  document.getElementById('orderStats').innerHTML = `
    <div class="ostat"><div class="l"><i style="background:#90a0b0"></i>신규 접수</div><div class="v">${cnt.recv}</div></div>
    <div class="ostat"><div class="l"><i style="background:var(--amber)"></i>준비중</div><div class="v">${cnt.prep}</div></div>
    <div class="ostat"><div class="l"><i style="background:var(--green)"></i>배송중</div><div class="v">${cnt.ship}</div></div>
    <div class="ostat"><div class="l"><i style="background:#c3b9a8"></i>완료</div><div class="v">${cnt.done}</div></div>`;
  document.getElementById('adminOrderRows').innerHTML = ADMIN_ORDERS.map((o, i) => {
    const m = menuFor(DEMO.y, DEMO.m, o.day);
    const opts = Object.keys(ST_LABEL).map(k => `<option value="${k}" ${k === o.st ? 'selected' : ''}>${ST_LABEL[k]}</option>`).join('');
    return `<tr><td><b>${o.id}</b></td><td>${o.cust}</td><td>6/${o.day}</td><td>${m.f} ${m.n}</td><td>${o.qty}개</td><td>${WON(o.amt)}</td><td><select class="statsel s-${o.st}" onchange="changeOrderStatus(${i},this)">${opts}</select></td></tr>`;
  }).join('');
}
function changeOrderStatus(i, sel) {
  ADMIN_ORDERS[i].st = sel.value;
  sel.className = 'statsel s-' + sel.value;
  buildOrdersPanel();
  toast(`📦 ${ADMIN_ORDERS[i].id} → ${ST_LABEL[sel.value]}`);
}

/* ===== 구독 관리 ===== */
const SUBSCRIBERS = [
  { n: '김민은', plan: '주5회', next: '6/16', amt: 245000, st: 'active' },
  { n: '이준호', plan: '주3회', next: '6/17', amt: 147000, st: 'active' },
  { n: '박서영', plan: '주2회', next: '6/18', amt: 98000, st: 'active' },
  { n: '정유아', plan: '주3회', next: '6/19', amt: 147000, st: 'pause' },
  { n: '최성수', plan: '주2회', next: '-', amt: 98000, st: 'cancel' },
];
function buildSubsPanel() {
  const active = SUBSCRIBERS.filter(s => s.st === 'active');
  const mrr = active.reduce((s, x) => s + x.amt, 0) * 4 / 10000;
  document.getElementById('mrrCards').innerHTML = `
    <div class="m"><div class="l">활성 구독자</div><div class="v">684<small style="font-size:14px;color:var(--sub)">명</small></div><div class="d up" style="color:var(--green-d)">▲ 이번달 +112명</div></div>
    <div class="m"><div class="l">월 반복매출(MRR)</div><div class="v">2,840<small style="font-size:14px;color:var(--sub)">만원</small></div><div class="d up" style="color:var(--green-d)">▲ 18.2%</div></div>
    <div class="m"><div class="l">구독 이탈률</div><div class="v">3.1<small style="font-size:14px;color:var(--sub)">%</small></div><div class="d up" style="color:var(--green-d)">▼ 1.4%p 개선</div></div>`;
  const badge = { active: '<span class="subbadge sb-active">활성</span>', pause: '<span class="subbadge sb-pause">일시정지</span>', cancel: '<span class="subbadge sb-cancel">해지</span>' };
  document.getElementById('subRows').innerHTML = SUBSCRIBERS.map(s =>
    `<tr><td><b>${s.n}</b></td><td><span class="planmini">${s.plan}</span></td><td>${s.next}</td><td>${WON(s.amt)}/월</td><td>${badge[s.st]}</td><td><button class="btn btn-ghost" onclick="toast('구독 상세 (데모)')">관리</button></td></tr>`).join('');
}

/* ===== 메뉴·예약 제어 ===== */
let capOverride = {};
function buildMenuPanel() {
  document.getElementById('menuRows').innerHTML = [15, 16, 17, 18, 19, 22, 23, 24].map(day => {
    const m = menuFor(DEMO.y, DEMO.m, day), c = capFor(DEMO.y, DEMO.m, day), st = stateOf(DEMO.y, DEMO.m, day);
    const ov = capOverride[day];
    const limit = ov ? ov.limit : c.limit, cutoff = ov ? ov.cutoff : '전일 18:00';
    const pill = st === 'out' ? '<span class="pill p-out">자동품절</span>' : day >= 24 ? '<span class="pill p-draft">작성중</span>' : '<span class="pill p-open">오픈</span>';
    return `<tr><td><b>6/${day}</b> <span style="color:var(--sub);font-size:11px">(${DOW[new Date(DEMO.y, DEMO.m, day).getDay()]})</span></td><td>${m.f} ${m.n}</td><td>옵션 4종</td><td>${c.ordered} / <b>${limit}</b>개</td><td>${cutoff}</td><td>${pill}</td><td><button class="btn btn-ghost" onclick="editMenu(${day})">수정</button></td></tr>`;
  }).join('');
}
let editDay = null;
function editMenu(day) {
  editDay = day;
  const c = capFor(DEMO.y, DEMO.m, day), m = menuFor(DEMO.y, DEMO.m, day), ov = capOverride[day];
  document.getElementById('emTitle').textContent = `6월 ${day}일 · ${m.n}`;
  document.getElementById('emLimit').value = ov ? ov.limit : c.limit;
  document.getElementById('emCutoff').value = ov ? ov.cutoff : '전일 18:00';
  openModal('modalMenu');
}
function saveMenu() {
  capOverride[editDay] = { limit: parseInt(document.getElementById('emLimit').value) || 80, cutoff: document.getElementById('emCutoff').value };
  closeModal('modalMenu'); buildMenuPanel();
  toast(`✅ 6/${editDay} 예약 설정이 저장되었습니다`);
}

/* ===== CRM ===== */
const CUSTOMERS = [
  { n: '김민은', amt: 1840000, o: 62, last: '6/14', login: '오늘', g: 'vip', gl: 'VIP', seg: ['vip'], cyc: 4.8 },
  { n: '이준호', amt: 1520000, o: 51, last: '6/13', login: '1일 전', g: 'vip', gl: 'VIP', seg: ['vip'], cyc: 5.5 },
  { n: '박서영', amt: 680000, o: 24, last: '6/10', login: '3일 전', g: 'gold', gl: 'GOLD', seg: [], cyc: 7.1 },
  { n: '최성수', amt: 540000, o: 19, last: '4/02', login: '74일 전', g: 'gold', gl: 'GOLD', seg: ['atrisk'], cyc: 18.2, tag: '이탈위험' },
  { n: '정유아', amt: 240000, o: 9, last: '6/12', login: '2일 전', g: 'silver', gl: 'SILVER', seg: [], cyc: 9.4 },
  { n: '강도민', amt: 198000, o: 7, last: '2/18', login: '117일 전', g: 'silver', gl: 'SILVER', seg: ['dormant'], cyc: 12.0, tag: '휴면' },
  { n: '윤하지', amt: 58000, o: 2, last: '6/09', login: '6일 전', g: 'basic', gl: 'BASIC', seg: ['new'], cyc: 5.0, tag: '신규' },
  { n: '임재근', amt: 39000, o: 1, last: '1/22', login: '144일 전', g: 'basic', gl: 'BASIC', seg: ['dormant'], cyc: 0, tag: '휴면' },
  { n: '한가결', amt: 29800, o: 1, last: '6/11', login: '4일 전', g: 'basic', gl: 'BASIC', seg: ['new'], cyc: 0, tag: '신규' },
];
function buildCrm(f) {
  const rows = CUSTOMERS.filter(c => f === 'all' || c.seg.includes(f));
  document.getElementById('crmRows').innerHTML = rows.map(c => {
    const idx = CUSTOMERS.indexOf(c);
    const tag = c.tag ? `<span class="pill ${c.tag === '신규' ? 'p-open' : 'p-out'}">${c.tag}</span>` : '<span style="color:var(--faint)">정상</span>';
    return `<tr class="click" onclick="openDrawer(${idx})"><td><b>${c.n}</b></td><td><span class="pill g-${c.g}">${c.gl}</span></td><td>${WON(c.amt)}</td><td>${c.o}회</td><td>${c.last}</td><td>${tag}</td><td><button class="btn btn-soft" onclick="event.stopPropagation();issueCoupon('${c.n}',this)">쿠폰발급</button></td></tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--sub);padding:30px">해당 세그먼트 고객이 없습니다</td></tr>';
  const counts = { all: CUSTOMERS.length, vip: 184, dormant: 512, atrisk: 147, new: 286 };
  document.querySelectorAll('#crmSeg button').forEach(b => { const ct = b.querySelector('.ct'); if (ct) ct.textContent = counts[b.dataset.seg]; });
}
function filterCrm(f, btn) { document.querySelectorAll('#crmSeg button').forEach(b => b.classList.remove('on')); btn.classList.add('on'); buildCrm(f); }
function issueCoupon(name, btn) { openModal('modalCoupon'); document.getElementById('coupTarget').textContent = name; window._coupBtn = btn; }
function confirmCoupon() {
  const t = document.getElementById('coupType').value; closeModal('modalCoupon');
  if (window._coupBtn) { window._coupBtn.textContent = '발급완료 ✓'; window._coupBtn.classList.add('done'); }
  toast(`🎟️ ${document.getElementById('coupTarget').textContent}님께 ${t} 쿠폰 발급`);
}
function openDrawer(idx) {
  const c = CUSTOMERS[idx];
  document.getElementById('drAv').textContent = c.n[0];
  document.getElementById('drName').textContent = c.n + ' 님';
  document.getElementById('drGrade').innerHTML = `<span class="pill g-${c.g}" style="background:rgba(255,255,255,.22);color:#fff">${c.gl}</span> · 마지막 접속 ${c.login}`;
  document.getElementById('drStat').innerHTML = `
    <div class="s"><div class="l">누적 구매액</div><div class="v">${(c.amt / 10000).toLocaleString()}만</div></div>
    <div class="s"><div class="l">총 주문수</div><div class="v">${c.o}회</div></div>
    <div class="s"><div class="l">재주문 주기</div><div class="v">${c.cyc ? c.cyc + '일' : '-'}</div></div>
    <div class="s"><div class="l">최근 주문</div><div class="v" style="font-size:15px">${c.last}</div></div>`;
  document.getElementById('drTimeline').innerHTML = ['집밥 정식세트 주문', '갈비찜 + 계란말이 추가', '소불고기 주문', '리뷰 작성 (★5)'].map((t, i) => `<div class="ti"><div class="dt">${['최근', '2주 전', '3주 전', '4주 전'][i]}</div><div class="tx">${t}</div></div>`).join('');
  openOverlay('drawerMask', 'drawer');
}
function closeDrawer() { closeOverlay('drawerMask', 'drawer'); }

/* ===== 카카오 알림톡 (캠페인 성과 포함) ===== */
const KK = [
  { i: '🗓️', t: '익월 신규 메뉴 오픈 알림', msg: '[맘찬] 7월 메뉴표가 오픈되었어요! 이달의 신상 \'간장새우장\'을 가장 먼저 만나보세요 🍱', target: '전체 활성 회원', cnt: '2,841명', when: '7/1 오전 10시 예약', auto: 'CMS 월메뉴 등록 시 자동', reach: 96, click: 28, conv: 11 },
  { i: '⏰', t: '당일 주문 마감 임박', msg: '[맘찬] 오늘 18시 주문 마감! 내일(6/16) 받을 \'고등어무조림\'을 지금 담아보세요 ⏰', target: '오늘 미주문 단골', cnt: '1,204명', when: '매일 15:00 자동', auto: '마감 3시간 전 트리거', reach: 94, click: 34, conv: 19 },
  { i: '🎟️', t: '타겟 쿠폰 번호 발송', msg: '[맘찬] VIP님께 드리는 15% 감사 쿠폰! 코드 VIP15 (~6/30) 💚', target: 'VIP·GOLD 등급', cnt: '707명', when: '수동 발송', auto: 'CRM 세그먼트 연동', reach: 98, click: 41, conv: 24 },
  { i: '💤', t: '휴면 고객 재활성화', msg: '[맘찬] 오랜만이에요 :) 돌아오신 분께 첫 주문 5,000원 할인! 코드 MOM5000 🎁', target: '90일+ 미접속', cnt: '512명', when: '주 1회 자동', auto: '휴면 자동 필터 연동', reach: 89, click: 17, conv: 8 },
];
function buildKakao() {
  document.getElementById('kkList').innerHTML = KK.map((k, i) => `
    <div class="kkrow">
      <div class="kkico">${k.i}</div>
      <div class="kkinfo">
        <b>${k.t}</b>
        <div class="msg">${k.msg}</div>
        <div class="meta"><span>👥 대상 <b>${k.target} (${k.cnt})</b></span><span>🕒 ${k.when}</span><span>⚙️ ${k.auto}</span></div>
        <div class="kkstats"><div class="ks">발송<b>${k.cnt}</b></div><div class="ks">도달률<b>${k.reach}%</b></div><div class="ks">클릭률<b>${k.click}%</b></div><div class="ks">전환율<b class="g">${k.conv}%</b></div></div>
      </div>
      <button class="btn btn-pri" style="padding:11px 18px;align-self:flex-start" onclick="sendKakao(${i},this)">발송</button>
    </div>`).join('');
}
function sendKakao(i, btn) {
  window._kkBtn = btn; window._kkIdx = i;
  document.getElementById('kkConfirm').innerHTML = `<b>${KK[i].t}</b><br>대상: ${KK[i].target} <b>${KK[i].cnt}</b>에게 알림톡을 발송할까요?`;
  openModal('modalKakao');
}
function confirmKakao() {
  closeModal('modalKakao');
  if (window._kkBtn) { window._kkBtn.textContent = '발송완료 ✓'; window._kkBtn.classList.add('done'); }
  toast(`📨 ${KK[window._kkIdx].cnt}에게 발송 완료`);
}

/* 모달 공용 */
function openModal(id) { document.getElementById(id).classList.add('on'); }
function closeModal(id) { document.getElementById(id).classList.remove('on'); }

/* init */
buildCal();
buildPopular();
buildAdmin();
