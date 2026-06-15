/* ============================================================
   맘찬 — 반찬 예약주문 데모 v3 · 실동작 시스템
   localStorage 영속 · 고객↔관리자 양방향 연동 · CSV 추출 · 로그인
   ============================================================ */
'use strict';

const DEMO = { y: 2026, m: 5, d: 15 };
const WON = n => n.toLocaleString('ko-KR') + '원';
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const KEY = (y, m, d) => `${y}-${m}-${d}`;

const POOL = [
  { f:'🍖', n:'제육볶음', d:'국내산 앞다리살을 매콤 양념에 볶아낸 대표 집반찬', p:9800, was:11000, tags:['매콤','1인분 250g'], kcal:420 },
  { f:'🐟', n:'고등어무조림', d:'두툼한 고등어와 무를 칼칼하게 조린 밥도둑', p:10800, was:12000, tags:['오메가3','국물자작'], kcal:380 },
  { f:'🥩', n:'소불고기', d:'간장 양념에 재운 부드러운 한우 등심 불고기', p:12800, was:14500, tags:['아이추천','달큰'], kcal:450 },
  { f:'🍜', n:'잡채', d:'아삭한 채소와 쫄깃한 당면이 가득한 잔치 잡채', p:9800, was:10500, tags:['채소듬뿍'], kcal:340 },
  { f:'🐔', n:'춘천식 닭갈비', d:'고소한 양념에 볶아낸 매콤 닭갈비', p:10800, was:12000, tags:['매콤','인기'], kcal:410 },
  { f:'🐟', n:'코다리조림', d:'쫄깃한 코다리를 매콤달콤하게 조렸어요', p:11800, was:13000, tags:['저칼로리'], kcal:300 },
  { f:'🍲', n:'돼지김치찜', d:'푹 익은 묵은지와 통목살의 깊은 조화', p:11800, was:13500, tags:['든든','국물'], kcal:480 },
  { f:'🥘', n:'갈비찜', d:'명절에만 먹던 갈비찜을 매일 식탁에서', p:14800, was:17000, tags:['프리미엄','선물'], kcal:520 },
  { f:'🍤', n:'간장새우장', d:'탱글한 새우를 간장에 푹 재운 밥도둑', p:13800, was:15000, tags:['밥도둑','신상'], kcal:260 },
  { f:'🥬', n:'된장찌개+나물3종', d:'구수한 강된장과 제철 나물 3종 구성', p:9800, was:10800, tags:['건강','채식'], kcal:290 },
  { f:'🍗', n:'안동찜닭', d:'당면 듬뿍, 달콤짭짤한 안동식 찜닭', p:12800, was:14000, tags:['든든','가족'], kcal:470 },
  { f:'🐟', n:'갈치조림', d:'살이 통통한 제주 은갈치 무조림', p:13800, was:15500, tags:['프리미엄'], kcal:360 },
  { f:'🥩', n:'LA갈비', d:'숯불향 가득 양념 LA꽃갈비', p:15800, was:18000, tags:['프리미엄','선물'], kcal:540 },
  { f:'🍳', n:'계란장조림 한상', d:'계란장조림+오이무침+멸치볶음 단정한 한 상', p:8800, was:9800, tags:['가성비','밑반찬'], kcal:320 },
  { f:'🍲', n:'순두부찌개', d:'얼큰한 해물 순두부찌개 (2인분)', p:9800, was:10800, tags:['국물','매콤'], kcal:310 },
  { f:'🐙', n:'낙지볶음', d:'쫄깃한 낙지의 불맛 매운 볶음', p:13800, was:15000, tags:['매콤','술안주'], kcal:390 },
  { f:'🥗', n:'집밥 정식세트', d:'잡곡밥+국+밑반찬 5종 균형 한 끼', p:11800, was:13000, tags:['균형식','인기'], kcal:430 },
  { f:'🍖', n:'돼지불백', d:'불맛 가득 돼지불고기 백반', p:10800, was:12000, tags:['든든'], kcal:440 },
  { f:'🍲', n:'부대찌개', d:'햄·소시지 푸짐한 부대찌개 (2인분)', p:10800, was:12000, tags:['든든','국물'], kcal:500 },
  { f:'🐟', n:'동태찌개', d:'시원한 국물의 얼큰 동태찌개', p:9800, was:10800, tags:['국물'], kcal:280 },
];
const OPTIONS = [{ n:'옵션 없음', p:0 }, { n:'수제 계란말이 추가', p:3000 }, { n:'제철나물 3종 추가', p:3500 }, { n:'잡곡밥 2공기 추가', p:2500 }, { n:'정성국 1리터 추가', p:4000 }];
const REVIEWS = [{ n:'정*아', s:'★★★★★', t:'간이 딱 좋아요. 아이들도 잘 먹어서 매주 시켜요!' }, { n:'김*은', s:'★★★★★', t:'반찬가게보다 훨씬 신선하고 양도 넉넉합니다.' }, { n:'박*호', s:'★★★★☆', t:'배송 빠르고 좋아요. 조금 더 매웠으면 👍' }];

/* ---------- 기본 메뉴/재고 (시드) ---------- */
function basePoolFor(y, m, day) { const dow = new Date(y, m, day).getDay(); if (dow === 0 || dow === 6) return null; return POOL[(y * 372 + m * 31 + day) % POOL.length]; }
function baseCapFor(y, m, day) { const s = (y * 13 + m * 7 + day * 17); const limit = 60 + (s % 5) * 10; let o = (s * 29) % (limit + 12); if (o > limit) o = limit; return { limit, ordered: o }; }

/* ============================================================
   STORE — localStorage 영속 상태
   ============================================================ */
const SKEY = 'mamchan_demo_v3';
const Store = {
  d: null,
  load() { try { this.d = JSON.parse(localStorage.getItem(SKEY)); } catch (e) { this.d = null; } if (!this.d || this.d.v !== 3) this.reset(); },
  save() { try { localStorage.setItem(SKEY, JSON.stringify(this.d)); } catch (e) {} },
  reset() { this.d = seed(); this.save(); },
};
function seed() {
  const customers = [
    { id: 'M001', name: '김민은', amt: 1840000, orders: 62, lastOrder: '6/14', loginDays: 0, joined: '2024-03' },
    { id: 'M002', name: '이준호', amt: 1520000, orders: 51, lastOrder: '6/13', loginDays: 1, joined: '2024-05' },
    { id: 'M003', name: '박서영', amt: 680000, orders: 24, lastOrder: '6/10', loginDays: 3, joined: '2024-08' },
    { id: 'M004', name: '최성수', amt: 540000, orders: 19, lastOrder: '4/02', loginDays: 74, joined: '2024-06' },
    { id: 'M005', name: '정유아', amt: 240000, orders: 9, lastOrder: '6/12', loginDays: 2, joined: '2025-01' },
    { id: 'M006', name: '강도민', amt: 198000, orders: 7, lastOrder: '2/18', loginDays: 117, joined: '2024-11' },
    { id: 'M007', name: '윤하지', amt: 58000, orders: 2, lastOrder: '6/09', loginDays: 6, joined: '2026-05' },
    { id: 'M008', name: '임재근', amt: 39000, orders: 1, lastOrder: '1/22', loginDays: 144, joined: '2025-02' },
    { id: 'M009', name: '한가결', amt: 29800, orders: 1, lastOrder: '6/11', loginDays: 4, joined: '2026-06' },
  ];
  const orders = [
    { id: 'MOM-9821', cust: '김민은', y: 2026, m: 5, day: 16, label: '고등어무조림', emoji: '🐟', opt: '수제 계란말이 추가', qty: 2, amt: 25600, st: 'prep' },
    { id: 'MOM-9818', cust: '김민은', y: 2026, m: 5, day: 18, label: '계란장조림 한상', emoji: '🍳', opt: '옵션 없음', qty: 1, amt: 8800, st: 'recv' },
    { id: 'MOM-9810', cust: '김민은', y: 2026, m: 5, day: 12, label: '된장찌개+나물3종', emoji: '🥬', opt: '제철나물 3종 추가', qty: 1, amt: 13300, st: 'done' },
    { id: 'MOM-9802', cust: '김민은', y: 2026, m: 5, day: 5, label: '갈비찜', emoji: '🥘', opt: '옵션 없음', qty: 1, amt: 14800, st: 'done' },
    { id: 'MOM-9820', cust: '이준호', y: 2026, m: 5, day: 16, label: '고등어무조림', emoji: '🐟', opt: '옵션 없음', qty: 1, amt: 13800, st: 'recv' },
    { id: 'MOM-9819', cust: '박서영', y: 2026, m: 5, day: 16, label: '고등어무조림', emoji: '🐟', opt: '잡곡밥 2공기 추가', qty: 3, amt: 31400, st: 'prep' },
    { id: 'MOM-9817', cust: '윤하지', y: 2026, m: 5, day: 15, label: '간장새우장', emoji: '🍤', opt: '옵션 없음', qty: 2, amt: 21600, st: 'ship' },
    { id: 'MOM-9815', cust: '강도민', y: 2026, m: 5, day: 17, label: '소불고기', emoji: '🥩', opt: '옵션 없음', qty: 4, amt: 47200, st: 'recv' },
  ];
  const subs = [
    { name: '김민은', plan: '주5회', next: '6/16', amt: 245000, st: 'active' },
    { name: '이준호', plan: '주3회', next: '6/17', amt: 147000, st: 'active' },
    { name: '박서영', plan: '주2회', next: '6/18', amt: 98000, st: 'active' },
    { name: '정유아', plan: '주3회', next: '6/19', amt: 147000, st: 'pause' },
    { name: '최성수', plan: '주2회', next: '-', amt: 98000, st: 'cancel' },
  ];
  return {
    v: 3, seq: 9822,
    menuOverrides: {}, dynOrdered: {},
    orders, customers, subs, migrated: false,
    user: { loggedIn: false, guest: false, name: '게스트', grade: 'BASIC', points: 0, coupons: [] },
  };
}

/* ---------- 메뉴/재고 접근자 (override 반영) ---------- */
function menuOf(y, m, day) {
  const base = basePoolFor(y, m, day);
  const ov = Store.d.menuOverrides[KEY(y, m, day)];
  if (!base && !ov) return null;
  return Object.assign({}, base || { f: '🍱', n: '', d: '', p: 0, was: 0, kcal: 0, tags: [] }, ov || {});
}
function limitOf(y, m, day) { const ov = Store.d.menuOverrides[KEY(y, m, day)]; return ov && ov.limit ? ov.limit : baseCapFor(y, m, day).limit; }
function cutoffOf(y, m, day) { const ov = Store.d.menuOverrides[KEY(y, m, day)]; return ov && ov.cutoff ? ov.cutoff : '전일 18:00'; }
function orderedOf(y, m, day) { return baseCapFor(y, m, day).ordered + (Store.d.dynOrdered[KEY(y, m, day)] || 0); }
function stateOf(y, m, day) {
  if (!menuOf(y, m, day)) return 'off';
  const isPast = (y < DEMO.y) || (y === DEMO.y && (m < DEMO.m || (m === DEMO.m && day < DEMO.d)));
  if (isPast) return 'past';
  const left = limitOf(y, m, day) - orderedOf(y, m, day);
  if (left <= 0) return 'out';
  if (left <= 8) return 'hot';
  return 'ok';
}

/* ---------- 등급/휴면 자동 계산 ---------- */
function gradeOf(amt) { return amt >= 1000000 ? 'VIP' : amt >= 500000 ? 'GOLD' : amt >= 150000 ? 'SILVER' : 'BASIC'; }
function gcls(g) { return 'g-' + g.toLowerCase(); }
function isDormant(days) { return days >= 90; }

/* ============================================================
   로그인 / 사용자 상태
   ============================================================ */
function doLogin(type) {
  Store.d.user = { loggedIn: true, guest: false, name: '김민은', grade: 'GOLD', points: 12400, coupons: [{ amt: '15%', t: 'GOLD 등급 쿠폰', d: '~6/30 · 최대 8,000원' }, { amt: '5,000', t: '신규가입 쿠폰', d: '~6/22 · 코드 MOM5000' }] };
  Store.save(); renderUser();
  document.getElementById('login').classList.add('hide');
  toast(type === 'kakao' ? '💬 카카오로 로그인했어요' : '로그인되었습니다');
}
function doGuest() { Store.d.user = { loggedIn: false, guest: true, name: '게스트', grade: 'BASIC', points: 0, coupons: [] }; Store.save(); renderUser(); document.getElementById('login').classList.add('hide'); }
function logout() { Store.d.user = seed().user; Store.save(); document.getElementById('login').classList.remove('hide'); switchTabById('home'); }
function renderUser() {
  const u = Store.d.user;
  const init = u.name[0];
  document.getElementById('greetName').textContent = u.guest ? '게스트' : u.name + '님';
  document.getElementById('gradeAv').textContent = u.guest ? '?' : init;
  document.getElementById('gradeName').textContent = u.guest ? '비회원 둘러보기' : u.grade + ' 회원';
  document.getElementById('gradePts').textContent = u.guest ? '로그인하고 혜택을 받아보세요' : `적립금 ${u.points.toLocaleString()}원 · VIP까지 3회 남음`;
  document.getElementById('gradeBadge').style.display = u.guest ? 'none' : 'inline-block';
}

/* ============================================================
   뷰 / 탭
   ============================================================ */
function showView(v) {
  document.querySelectorAll('.view').forEach(e => e.classList.remove('on'));
  document.getElementById('view-' + v).classList.add('on');
  ['customer', 'admin', 'req'].forEach(x => { const b = document.getElementById('nv-' + x); if (b) b.classList.toggle('on', v === x); });
  if (v === 'admin') buildAdmin();
  if (v === 'req') buildRequirements();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   요구사항 충족 현황 (RFP 매핑) + 데모 바로가기
   ============================================================ */
const REQUIREMENTS = [
  { g: '2-1', title: '사용자 화면 및 주문 기능', items: [
    { t: '모바일 최적화 캘린더형 월간 메뉴표 UI 노출', loc: '고객 홈 · 달력', go: 'customer:home' },
    { t: '메인 화면 내 당월 메뉴표 즉시 확인 기능', loc: '고객 홈 첫 화면', go: 'customer:home' },
    { t: '캘린더 내 배송 희망 날짜 선택 기능', loc: '고객 홈 · 달력 셀 클릭', go: 'customer:home' },
    { t: '선택된 날짜별 메인 메뉴 정보 확인 기능', loc: '주문 상세 시트', go: 'customer:home' },
    { t: '일일 메뉴 1종 옵션 추가 선택 기능', loc: '주문 시트 · 옵션 선택', go: 'customer:home' },
    { t: '날짜별 선택 항목 장바구니 담기 및 통합 결제', loc: '장바구니 · 통합 결제', go: 'customer:home' },
  ] },
  { g: '2-2', title: '관리자 메뉴 및 예약 제어 기능', items: [
    { t: '월간 메뉴표 데이터 등록 및 수정 기능', loc: '관리자 · 메뉴·예약 제어', go: 'admin:menu' },
    { t: '일자별 주문 가능 수량 및 마감일 설정 기능', loc: '관리자 · 메뉴 수정 모달', go: 'admin:menu' },
    { t: '주문 마감 시간에 따른 프론트엔드 품절 처리', loc: '고객 달력 자동 품절 반영', go: 'admin:menu' },
    { t: '기존 회원 정보 마이그레이션 연동 (엑셀 추출 가능)', loc: '관리자 · 회원 데이터', go: 'admin:members' },
    { t: '기존 회원들의 구매 이력 데이터 연동 기능', loc: '관리자 · 회원 데이터/주문', go: 'admin:members' },
  ] },
  { g: '2-3', title: 'CRM 구축 및 마케팅 기능', items: [
    { t: '누적 구매 데이터 기반 회원 등급 자동 분류', loc: '관리자 · CRM / 회원 데이터', go: 'admin:crm' },
    { t: '회원 등급별 맞춤 쿠폰 자동 및 수동 발급', loc: '관리자 · CRM 쿠폰 발급', go: 'admin:crm' },
    { t: '미접속 기간 기반 휴면 고객 자동 필터링', loc: '관리자 · CRM 휴면 세그먼트', go: 'admin:crm' },
    { t: '고객 구매 패턴 기반 세분화 조회 기능', loc: '관리자 · CRM 세그먼트', go: 'admin:crm' },
    { t: '재주문 주기 통계 데이터 추출 기능', loc: '관리자 · 대시보드 / CRM 추출', go: 'admin:dash' },
  ] },
  { g: '2-4', title: '카카오채널 연동 기능', items: [
    { t: '익월 신규 월간 메뉴 오픈 시 카카오톡 알림 발송', loc: '관리자 · 알림톡 시나리오 ①', go: 'admin:kakao' },
    { t: '당일 주문 마감 임박 시 카카오톡 알림 발송', loc: '관리자 · 알림톡 시나리오 ②', go: 'admin:kakao' },
    { t: '타겟 고객 대상 쿠폰 번호 카카오톡 발송', loc: '관리자 · 알림톡 시나리오 ③', go: 'admin:kakao' },
    { t: '휴면 고객 대상 재활성화 유도 카카오톡 발송', loc: '관리자 · 알림톡 시나리오 ④', go: 'admin:kakao' },
  ] },
];
function buildRequirements() {
  const total = REQUIREMENTS.reduce((s, g) => s + g.items.length, 0);
  document.getElementById('reqTotal').textContent = total;
  document.getElementById('reqDone').textContent = total;
  document.getElementById('reqGroups').innerHTML = REQUIREMENTS.map(grp => `
    <div class="req-group">
      <div class="gh"><span class="gn">${grp.g}</span><b>${grp.title}</b><span class="gc">${grp.items.length}/${grp.items.length} 구현</span></div>
      ${grp.items.map(it => `<div class="req-item"><div class="ck">✓</div><div class="rt"><b>${it.t}</b><div class="loc">${it.loc}</div></div><button class="req-go" onclick="goTo('${it.go}')">데모에서 보기 →</button></div>`).join('')}
    </div>`).join('');
}
function goTo(target) {
  const [v, sub] = target.split(':');
  if (v === 'customer') {
    const u = Store.d.user; if (!u.loggedIn && !u.guest) doGuest();
    showView('customer');
    const btn = document.querySelector('.tabbar button[data-tab="' + sub + '"]');
    switchTab(sub, btn);
    if (sub === 'home') toast('🗓️ 달력에서 날짜를 눌러 예약해 보세요');
  } else if (v === 'admin') {
    showView('admin');
    const btn = document.querySelector('.anav[data-panel="' + sub + '"]');
    if (btn) showPanel(sub, btn);
  }
}
function switchTab(t, btn) { switchTabById(t); document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('on')); if (btn) btn.classList.add('on'); }
function switchTabById(t) {
  document.querySelectorAll('.pscreen').forEach(e => e.classList.remove('on'));
  document.getElementById('ps-' + t).classList.add('on');
  document.querySelectorAll('.tabbar button').forEach((b, i) => b.classList.toggle('on', b.dataset.tab === t));
  if (t === 'orders') buildOrders();
  if (t === 'my') buildMy();
}

/* ============================================================
   캘린더
   ============================================================ */
let viewY = DEMO.y, viewM = DEMO.m;
function buildCal() {
  document.getElementById('calYM').innerHTML = `<b>${viewY}년 ${viewM + 1}월</b><span>${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][viewM]} ${viewY}</span>`;
  const first = new Date(viewY, viewM, 1).getDay();
  const days = new Date(viewY, viewM + 1, 0).getDate();
  const g = document.getElementById('calGrid'); g.innerHTML = '';
  for (let i = 0; i < first; i++) g.appendChild(Object.assign(document.createElement('div'), { className: 'cell empty' }));
  for (let day = 1; day <= days; day++) {
    const st = stateOf(viewY, viewM, day), m = menuOf(viewY, viewM, day);
    const isToday = viewY === DEMO.y && viewM === DEMO.m && day === DEMO.d;
    const cell = document.createElement('div');
    cell.className = 'cell ' + (st === 'off' ? 'off' : st === 'past' ? 'past' : 'click') + (isToday ? ' todaymark' : '');
    let chip = '';
    if (st === 'ok') chip = '<div class="chip ok">예약</div>';
    else if (st === 'hot') chip = `<div class="chip hot">${limitOf(viewY, viewM, day) - orderedOf(viewY, viewM, day)}개</div>`;
    else if (st === 'out') chip = '<div class="chip out">마감</div>';
    else if (st === 'off') chip = '<div class="offtxt">휴무</div>';
    cell.innerHTML = `<div class="d">${day}</div>` + (m && m.n ? `<div class="em">${m.f}</div><div class="nm">${m.n}</div>` : '') + chip;
    if (st === 'ok' || st === 'hot') { cell.onclick = () => openSheet(day); cell.tabIndex = 0; cell.setAttribute('role', 'button'); cell.onkeydown = e => { if (e.key === 'Enter') openSheet(day); }; }
    else if (st === 'out') cell.onclick = () => toast('😢 해당 날짜는 마감되었어요');
    g.appendChild(cell);
  }
  document.getElementById('calPrev').disabled = (viewY < DEMO.y) || (viewY === DEMO.y && viewM <= DEMO.m);
}
function navMonth(d) { viewM += d; if (viewM < 0) { viewM = 11; viewY--; } if (viewM > 11) { viewM = 0; viewY++; } buildCal(); }

/* ============================================================
   주문 시트
   ============================================================ */
let cur = { y: 0, m: 0, day: 0, qty: 1, opt: 0 };
function openSheet(day) {
  cur = { y: viewY, m: viewM, day, qty: 1, opt: 0 };
  const m = menuOf(viewY, viewM, day), dow = DOW[new Date(viewY, viewM, day).getDay()];
  document.getElementById('shDate').textContent = `${viewM + 1}월 ${day}일 (${dow}) 배송 예약`;
  document.getElementById('shTitle').textContent = m.n;
  document.getElementById('shIco').textContent = m.f;
  document.getElementById('shDesc').textContent = m.d;
  document.getElementById('shTags').innerHTML = (m.tags || []).map(t => `<span class="tg">${t}</span>`).join('') + `<span class="tg gray">🔥 ${m.kcal}kcal</span><span class="tg gray">냉장배송</span>`;
  const off = m.was ? Math.round((1 - m.p / m.was) * 100) : 0;
  document.getElementById('shPrice').innerHTML = `<span class="now">${WON(m.p)}</span>` + (m.was ? `<span class="was">${WON(m.was)}</span><span class="off">${off}%</span>` : '');
  document.getElementById('shOpts').innerHTML = '';
  OPTIONS.forEach((o, i) => { const el = document.createElement('div'); el.className = 'opt' + (i === 0 ? ' sel' : ''); el.onclick = () => selOpt(i); el.innerHTML = `<div class="l"><div class="radio"></div><span class="on">${o.n}</span></div><span class="op">${o.p ? '+' + WON(o.p) : '기본'}</span>`; document.getElementById('shOpts').appendChild(el); });
  document.getElementById('shReviews').innerHTML = REVIEWS.map(r => `<div class="rev"><div class="rav">${r.n[0]}</div><div class="rb"><div class="rn">${r.n}</div><div class="rs">${r.s}</div><div class="rt">${r.t}</div></div></div>`).join('');
  document.getElementById('shQty').textContent = '1'; refreshSheet();
  openOverlay('mask', 'sheet');
}
function closeSheet() { closeOverlay('mask', 'sheet'); }
function selOpt(i) { cur.opt = i; document.querySelectorAll('#shOpts .opt').forEach((e, x) => e.classList.toggle('sel', x === i)); refreshSheet(); }
function stepQty(n) { cur.qty = Math.max(1, Math.min(20, cur.qty + n)); document.getElementById('shQty').textContent = cur.qty; refreshSheet(); }
function linePrice() { return (menuOf(cur.y, cur.m, cur.day).p + OPTIONS[cur.opt].p) * cur.qty; }
function refreshSheet() { document.getElementById('shAddPrice').textContent = WON(linePrice()); }

/* ============================================================
   장바구니 → 실제 주문 생성
   ============================================================ */
let cart = [], coupon = null;
function addToCart() { const m = menuOf(cur.y, cur.m, cur.day); cart.push({ y: cur.y, m: cur.m, day: cur.day, name: m.n, ico: m.f, base: m.p, opt: OPTIONS[cur.opt].n, optP: OPTIONS[cur.opt].p, qty: cur.qty }); updateBadge(); closeSheet(); toast(`🛒 ${cur.m + 1}/${cur.day} ${m.n} 담았어요`); }
function updateBadge() { const b = document.getElementById('cartBadge'); const n = cart.reduce((s, i) => s + i.qty, 0); if (n) { b.style.display = 'grid'; b.textContent = n; } else b.style.display = 'none'; }
function openCart() { renderCart(); openOverlay('cartMask', 'cartSheet'); }
function closeCart() { closeOverlay('cartMask', 'cartSheet'); }
function cartItemPrice(it) { return (it.base + it.optP) * it.qty; }
function cartQty(i, d) { cart[i].qty = Math.max(1, Math.min(20, cart[i].qty + d)); updateBadge(); renderCart(); }
function cartDel(i) { cart.splice(i, 1); updateBadge(); renderCart(); }
function renderCart() {
  const list = document.getElementById('cartList');
  document.getElementById('cartCheckoutWrap').style.display = cart.length ? 'block' : 'none';
  if (!cart.length) { list.innerHTML = `<div class="cart-empty"><span class="big">🗓️</span>담은 메뉴가 없어요.<br>달력에서 원하는 배송일을 선택해 보세요</div>`; document.getElementById('cartFoot').style.display = 'none'; return; }
  list.innerHTML = cart.map((it, i) => `<div class="cline"><div class="em">${it.ico}</div><div class="info"><div class="dt">${it.m + 1}/${it.day} (${DOW[new Date(it.y, it.m, it.day).getDay()]}) 배송</div><b>${it.name}</b><p>${it.opt}</p><div class="mini-step"><button onclick="cartQty(${i},-1)" aria-label="감소">−</button><b>${it.qty}</b><button onclick="cartQty(${i},1)" aria-label="증가">+</button></div></div><div class="right"><div class="pr">${WON(cartItemPrice(it))}</div><button onclick="cartDel(${i})" aria-label="삭제" style="border:0;background:none;color:#bcc4be;font-size:17px;margin-top:8px">✕</button></div></div>`).join('');
  const sub = cart.reduce((s, it) => s + cartItemPrice(it), 0), disc = coupon ? Math.min(coupon.amount, sub) : 0;
  document.getElementById('cartFoot').style.display = 'block';
  document.getElementById('cartSum').innerHTML = `<div class="sumrow"><span>상품금액</span><span>${WON(sub)}</span></div><div class="sumrow"><span>배송비</span><span>무료</span></div>` + (coupon ? `<div class="sumrow disc"><span>${coupon.label}</span><span>-${WON(disc)}</span></div>` : '') + `<div class="sumrow tot"><span>총 결제금액</span><span class="v">${WON(sub - disc)}</span></div>`;
}
function applyCoupon() {
  const v = document.getElementById('couponInput').value.trim().toUpperCase();
  const codes = { 'MOM5000': { label: '신규가입 5,000원 쿠폰', amount: 5000 }, 'WELCOME': { label: '웰컴 3,000원 쿠폰', amount: 3000 }, 'VIP15': { label: 'VIP 15% (최대 8,000원)', amount: 8000 } };
  if (codes[v]) { coupon = { code: v, ...codes[v] }; toast('🎟️ 쿠폰이 적용되었어요'); } else if (!v) { toast('쿠폰 번호를 입력해 주세요'); return; } else { coupon = null; toast('유효하지 않은 쿠폰입니다 (MOM5000 체험)'); }
  renderCart();
}
function checkout() {
  if (!cart.length) return;
  const sub = cart.reduce((s, it) => s + cartItemPrice(it), 0), disc = coupon ? Math.min(coupon.amount, sub) : 0;
  const u = Store.d.user;
  // 실제 주문 레코드 생성 + 재고 증가 (관리자 주문관리/대시보드에 반영)
  cart.forEach(it => {
    Store.d.seq++;
    Store.d.orders.unshift({ id: 'MOM-' + Store.d.seq, cust: u.name, y: it.y, m: it.m, day: it.day, label: it.name, emoji: it.ico, opt: it.opt, qty: it.qty, amt: cartItemPrice(it), st: 'recv', fresh: true });
    const k = KEY(it.y, it.m, it.day); Store.d.dynOrdered[k] = (Store.d.dynOrdered[k] || 0) + it.qty;
  });
  // 고객 누적/주문수 갱신 (등급 자동 재계산 근거)
  const me = Store.d.customers.find(c => c.name === u.name);
  if (me) { me.amt += (sub - disc); me.orders += cart.length; me.lastOrder = `${DEMO.m + 1}/${DEMO.d}`; me.loginDays = 0; }
  Store.save();
  document.getElementById('sucMsg').innerHTML = `${cart.length}개 날짜 · 총 <b>${WON(sub - disc)}</b> 결제가 완료되었습니다.`;
  document.getElementById('sucNo').textContent = '주문번호 MOM-' + Store.d.seq;
  closeCart(); document.getElementById('success').classList.add('on');
  buildCal();
}
function closeSuccess() { document.getElementById('success').classList.remove('on'); cart = []; coupon = null; updateBadge(); document.getElementById('couponInput').value = ''; }
function reorder() {
  cart = [{ y: DEMO.y, m: DEMO.m, day: 16, name: menuOf(DEMO.y, DEMO.m, 16).n, ico: menuOf(DEMO.y, DEMO.m, 16).f, base: menuOf(DEMO.y, DEMO.m, 16).p, opt: '수제 계란말이 추가', optP: 3000, qty: 1 }, { y: DEMO.y, m: DEMO.m, day: 18, name: menuOf(DEMO.y, DEMO.m, 18).n, ico: menuOf(DEMO.y, DEMO.m, 18).f, base: menuOf(DEMO.y, DEMO.m, 18).p, opt: '옵션 없음', optP: 0, qty: 1 }];
  updateBadge(); openCart(); toast('🔁 지난 주문을 장바구니에 담았어요');
}

/* ============================================================
   토스트 / 오버레이 / ESC
   ============================================================ */
let tt; function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }
function openOverlay(a, b) { document.getElementById(a).classList.add('on'); document.getElementById(b).classList.add('on'); }
function closeOverlay(a, b) { document.getElementById(a).classList.remove('on'); document.getElementById(b).classList.remove('on'); }
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; closeSheet(); closeCart(); closeDrawer(); ['modalMenu', 'modalRegister', 'modalCoupon', 'modalKakao'].forEach(closeModal); });

/* ============================================================
   인기 메뉴 / 내 예약 / 마이
   ============================================================ */
function buildPopular() {
  const ranks = [{ ...POOL[12], sold: 1284 }, { ...POOL[7], sold: 1102 }, { ...POOL[0], sold: 987 }, { ...POOL[8], sold: 856 }, { ...POOL[16], sold: 742 }];
  document.getElementById('popular').innerHTML = ranks.map((m, i) => `<div class="pcard" onclick="toast('인기 메뉴는 달력에서 예약일을 선택하세요 🗓️')"><span class="rk">BEST ${i + 1}</span><div class="em">${m.f}</div><b>${m.n}</b><div class="pr">${WON(m.p)}</div><div class="sold">이번달 ${m.sold.toLocaleString()}개 판매</div></div>`).join('');
}
let orderTab = 'upcoming';
const STEP_OF = { recv: 1, prep: 2, ship: 3, done: 4 };
function buildOrders(tab) {
  if (tab) orderTab = tab;
  document.querySelectorAll('#otabs button').forEach(b => b.classList.toggle('on', b.dataset.ot === orderTab));
  const mine = Store.d.orders.filter(o => o.cust === Store.d.user.name);
  const wrap = document.getElementById('orderList');
  const list = mine.filter(o => orderTab === 'upcoming' ? o.st !== 'done' : o.st === 'done');
  if (!list.length) { wrap.innerHTML = `<div class="adm-empty"><span class="big">📦</span>${orderTab === 'upcoming' ? '예정된 예약이 없어요.\n달력에서 주문해 보세요!' : '완료된 주문이 없어요.'}</div>`; return; }
  wrap.innerHTML = list.map(o => {
    if (orderTab === 'upcoming') {
      const steps = ['주문완료', '배송준비', '배송중', '배송완료'], cur = STEP_OF[o.st];
      const st = o.st === 'ship' ? '<span class="ostatus os-ship">배송중</span>' : '<span class="ostatus os-prep">배송준비중</span>';
      const track = steps.map((s, i) => `<div class="step ${i < cur - 1 ? 'done' : i === cur - 1 ? 'cur' : ''}"><div class="c">${i < cur - 1 ? '✓' : i + 1}</div><div class="l">${s}</div></div>`).join('');
      return `<div class="ocard"><div class="oh"><div class="dt">📦 ${o.m + 1}/${o.day} (${DOW[new Date(o.y, o.m, o.day).getDay()]}) 배송 예정</div>${st}</div><div class="oitem"><div class="em">${o.emoji}</div><div class="info"><b>${o.label}</b><p>${o.opt} · ${o.qty}개</p></div><div class="pr">${WON(o.amt)}</div></div><div class="track">${track}</div><div class="obtns"><button onclick="toast('배송 조회 (데모)')">배송 조회</button><button onclick="toast('주문 변경은 마감 전까지 가능 (데모)')">주문 변경</button></div></div>`;
    }
    return `<div class="ocard"><div class="oh"><div class="dt">✅ ${o.m + 1}/${o.day} 배송완료</div><span class="ostatus os-done">완료</span></div><div class="oitem"><div class="em">${o.emoji}</div><div class="info"><b>${o.label}</b><p>${o.opt} · ${o.qty}개</p></div><div class="pr">${WON(o.amt)}</div></div><div class="obtns"><button class="pri" onclick="reorder()">🔁 재주문</button><button onclick="toast('리뷰 작성 (데모)')">리뷰 쓰기</button></div></div>`;
  }).join('');
}
function buildMy() {
  const u = Store.d.user;
  document.getElementById('myCoupons').innerHTML = (u.coupons.length ? u.coupons : [{ amt: '–', t: '보유한 쿠폰이 없어요', d: '관리자가 발급하면 여기 표시됩니다' }]).map(c => `<div class="coupon-card"><div class="amt">${c.amt}<span style="font-size:12px">${c.amt === '15%' || c.amt === '–' ? '' : '원'}</span></div><div class="ci"><b>${c.t}</b><p>${c.d}</p></div>${c.amt === '–' ? '' : '<button class="use" onclick="toast(\'쿠폰함에서 사용 (데모)\')">사용</button>'}</div>`).join('');
}
function subscribe(plan) { toast(`🔁 '${plan}' 구독을 시작합니다 (데모)`); }

/* ============================================================
   관리자
   ============================================================ */
function showPanel(p, btn) { document.querySelectorAll('.apanel').forEach(e => e.classList.remove('on')); document.getElementById('panel-' + p).classList.add('on'); document.querySelectorAll('.anav').forEach(b => b.classList.remove('on')); btn.classList.add('on'); }
function spark(data, color) { const w = 70, h = 26, max = Math.max(...data), min = Math.min(...data); const pts = data.map((v, i) => `${(i / (data.length - 1) * w).toFixed(1)},${(h - (v - min) / (max - min || 1) * h).toFixed(1)}`).join(' '); return `<svg width="${w}" height="${h}" class="spark"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }

function buildAdmin() {
  const orders = Store.d.orders;
  const todayRev = Math.round(orders.reduce((s, o) => s + o.amt, 0) / 10000);
  document.getElementById('kpis').innerHTML = `
    <div class="kpi"><div class="ic" style="background:var(--green-soft)">💰</div><div class="k">이번달 객단가</div><div class="v">38,400<small>원</small></div><div class="d up">▲ 12.4% vs 전월</div>${spark([28,30,29,33,34,36,38], 'var(--green)')}</div>
    <div class="kpi"><div class="ic" style="background:var(--coral-soft)">🔁</div><div class="k">재주문율</div><div class="v">63<small>%</small></div><div class="d up">▲ 8.1%p</div>${spark([48,50,52,55,57,60,63], 'var(--coral)')}</div>
    <div class="kpi"><div class="ic" style="background:var(--purple-soft)">👥</div><div class="k">활성 회원</div><div class="v">2,841<small>명</small></div><div class="d up">▲ 마이그레이션 완료</div>${spark([2100,2300,2450,2600,2700,2780,2841], 'var(--purple)')}</div>
    <div class="kpi"><div class="ic" style="background:var(--amber-soft)">📦</div><div class="k">미처리 주문</div><div class="v">${orders.filter(o => o.st === 'recv').length}<small>건</small></div><div class="d dn">접수 대기 중</div>${spark([5,7,4,8,6,9,orders.filter(o=>o.st==='recv').length], 'var(--amber)')}</div>`;
  buildLineChart();
  const best = [{ ...POOL[12], v: 1284 }, { ...POOL[7], v: 1102 }, { ...POOL[0], v: 987 }, { ...POOL[16], v: 856 }, { ...POOL[8], v: 742 }], bmax = best[0].v;
  document.getElementById('bestRank').innerHTML = best.map((m, i) => `<div class="rank ${i < 3 ? 'top' + (i + 1) : ''}"><div class="no">${i + 1}</div><div class="em">${m.f}</div><div class="rn">${m.n}</div><div class="rbar"><i style="width:${m.v / bmax * 100}%"></i></div><div class="rv">${m.v.toLocaleString()}</div></div>`).join('');
  const grades = [{ l: 'VIP', v: 184, c: '#8b5cf6' }, { l: 'GOLD', v: 523, c: '#f5a524' }, { l: 'SILVER', v: 1098, c: '#90a0b0' }, { l: 'BASIC', v: 1036, c: '#c3b9a8' }], total = grades.reduce((s, g) => s + g.v, 0);
  let acc = 0; const R = 52, C = 2 * Math.PI * R;
  document.getElementById('donut').innerHTML = `<svg width="140" height="140">${grades.map(g => { const fr = g.v / total, dash = `${(fr * C).toFixed(1)} ${C.toFixed(1)}`, off = -acc * C; acc += fr; return `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${g.c}" stroke-width="20" stroke-dasharray="${dash}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 70 70)"/>`; }).join('')}<text x="70" y="66" text-anchor="middle" font-size="13" fill="#7c8a82" font-weight="700">전체</text><text x="70" y="86" text-anchor="middle" font-size="18" fill="#16201a" font-weight="800">${total.toLocaleString()}</text></svg>`;
  document.getElementById('donutLegend').innerHTML = grades.map(g => `<div class="dl"><i style="background:${g.c}"></i>${g.l}<b>${g.v.toLocaleString()}명</b><span>${(g.v / total * 100).toFixed(1)}%</span></div>`).join('');
  document.getElementById('dashRows').innerHTML = [15, 16, 17, 18, 19].map(day => { const m = menuOf(DEMO.y, DEMO.m, day), lim = limitOf(DEMO.y, DEMO.m, day), ord = orderedOf(DEMO.y, DEMO.m, day), pct = Math.round(ord / lim * 100), st = stateOf(DEMO.y, DEMO.m, day); const cls = pct >= 100 ? 'full' : pct >= 85 ? 'warn' : '', pill = st === 'out' ? '<span class="pill p-out">마감</span>' : st === 'hot' ? '<span class="pill p-hot">임박</span>' : '<span class="pill p-open">진행중</span>'; return `<tr><td><b>6/${day}</b></td><td>${m.f} ${m.n}</td><td>${ord} / ${lim}</td><td><div style="display:flex;align-items:center;gap:8px"><div class="capbar"><i class="${cls}" style="width:${Math.min(pct, 100)}%"></i></div><span style="font-size:11px;color:var(--sub);font-weight:700">${pct}%</span></div></td><td>${pill}</td></tr>`; }).join('');
  buildOrdersPanel(); buildSubsPanel(); buildMenuPanel(); buildMembers(); buildCrm('all'); buildKakao();
}
function buildLineChart() {
  const data = [288, 312, 301, 330, 348, 322, 360, 372, 355, 401, 419, 388, 410, 441], W = 560, H = 150, pad = 8;
  const max = Math.max(...data), min = Math.min(...data) - 20, X = i => pad + i / (data.length - 1) * (W - pad * 2), Y = v => H - ((v - min) / (max - min) * (H - 20)) - 6;
  const line = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' '), area = `${pad},${H} ${line} ${W - pad},${H}`;
  const dots = data.map((v, i) => i % 2 === 1 ? `<circle class="lc-dot" cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3"/>` : '').join('');
  document.getElementById('lineChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="linechart" preserveAspectRatio="none"><defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#12a85f" stop-opacity="0.22"/><stop offset="100%" stop-color="#12a85f" stop-opacity="0"/></linearGradient></defs><line class="lc-grid" x1="0" y1="${H * .33}" x2="${W}" y2="${H * .33}"/><line class="lc-grid" x1="0" y1="${H * .66}" x2="${W}" y2="${H * .66}"/><polygon class="lc-area" points="${area}"/><polyline class="lc-line" points="${line}"/>${dots}</svg>`;
}

/* ===== 주문 관리 ===== */
const ST_LABEL = { recv: '접수', prep: '준비중', ship: '배송중', done: '완료' };
function buildOrdersPanel() {
  const O = Store.d.orders, cnt = { recv: 0, prep: 0, ship: 0, done: 0 }; O.forEach(o => cnt[o.st]++);
  document.getElementById('orderStats').innerHTML = `<div class="ostat"><div class="l"><i style="background:#90a0b0"></i>신규 접수</div><div class="v">${cnt.recv}</div></div><div class="ostat"><div class="l"><i style="background:var(--amber)"></i>준비중</div><div class="v">${cnt.prep}</div></div><div class="ostat"><div class="l"><i style="background:var(--green)"></i>배송중</div><div class="v">${cnt.ship}</div></div><div class="ostat"><div class="l"><i style="background:#c3b9a8"></i>완료</div><div class="v">${cnt.done}</div></div>`;
  document.getElementById('adminOrderRows').innerHTML = O.map((o, i) => { const opts = Object.keys(ST_LABEL).map(k => `<option value="${k}" ${k === o.st ? 'selected' : ''}>${ST_LABEL[k]}</option>`).join(''); return `<tr class="${o.fresh ? 'fresh' : ''}"><td><b>${o.id}</b>${o.fresh ? '<span class="newbadge">NEW</span>' : ''}</td><td>${o.cust}</td><td>${o.m + 1}/${o.day}</td><td>${o.emoji} ${o.label}</td><td>${o.qty}개</td><td>${WON(o.amt)}</td><td><select class="statsel s-${o.st}" onchange="changeOrderStatus(${i},this)">${opts}</select></td></tr>`; }).join('');
  Store.d.orders.forEach(o => o.fresh = false);
}
function changeOrderStatus(i, sel) { Store.d.orders[i].st = sel.value; Store.save(); buildOrdersPanel(); toast(`📦 ${Store.d.orders[i].id} → ${ST_LABEL[sel.value]}`); }

/* ===== 구독 관리 ===== */
function buildSubsPanel() {
  document.getElementById('mrrCards').innerHTML = `<div class="m"><div class="l">활성 구독자</div><div class="v">684<small style="font-size:14px;color:var(--sub)">명</small></div><div class="d up" style="color:var(--green-d)">▲ 이번달 +112명</div></div><div class="m"><div class="l">월 반복매출(MRR)</div><div class="v">2,840<small style="font-size:14px;color:var(--sub)">만원</small></div><div class="d up" style="color:var(--green-d)">▲ 18.2%</div></div><div class="m"><div class="l">구독 이탈률</div><div class="v">3.1<small style="font-size:14px;color:var(--sub)">%</small></div><div class="d up" style="color:var(--green-d)">▼ 1.4%p 개선</div></div>`;
  const badge = { active: '<span class="subbadge sb-active">활성</span>', pause: '<span class="subbadge sb-pause">일시정지</span>', cancel: '<span class="subbadge sb-cancel">해지</span>' };
  document.getElementById('subRows').innerHTML = Store.d.subs.map(s => `<tr><td><b>${s.name}</b></td><td><span class="planmini">${s.plan}</span></td><td>${s.next}</td><td>${WON(s.amt)}/월</td><td>${badge[s.st]}</td><td><button class="btn btn-ghost" onclick="toast('구독 상세 (데모)')">관리</button></td></tr>`).join('');
}

/* ===== 메뉴·예약 제어 + 등록 ===== */
function buildMenuPanel() {
  const extra = Object.keys(Store.d.menuOverrides).map(k => k.split('-')).filter(a => +a[0] === DEMO.y && +a[1] === DEMO.m).map(a => +a[2]);
  const days = [...new Set([15, 16, 17, 18, 19, 22, 23, 24, ...extra])].sort((a, b) => a - b);
  document.getElementById('menuRows').innerHTML = days.map(day => { const m = menuOf(DEMO.y, DEMO.m, day); if (!m) return ''; const lim = limitOf(DEMO.y, DEMO.m, day), ord = orderedOf(DEMO.y, DEMO.m, day), st = stateOf(DEMO.y, DEMO.m, day), reg = Store.d.menuOverrides[KEY(DEMO.y, DEMO.m, day)]; const pill = st === 'out' ? '<span class="pill p-out">자동품절</span>' : (day >= 24 && !reg) ? '<span class="pill p-draft">작성중</span>' : '<span class="pill p-open">오픈</span>'; return `<tr><td><b>6/${day}</b> <span style="color:var(--sub);font-size:11px">(${DOW[new Date(DEMO.y, DEMO.m, day).getDay()]})</span></td><td>${m.f} ${m.n}${reg ? '<span class="newbadge" style="background:var(--green)">등록</span>' : ''}</td><td>옵션 4종</td><td>${ord} / <b>${lim}</b>개</td><td>${cutoffOf(DEMO.y, DEMO.m, day)}</td><td>${pill}</td><td><button class="btn btn-ghost" onclick="editMenu(${day})">수정</button></td></tr>`; }).join('');
}
let editDay = null;
function editMenu(day) { editDay = day; const m = menuOf(DEMO.y, DEMO.m, day); document.getElementById('emTitle').textContent = `6월 ${day}일 · ${m.n}`; document.getElementById('emLimit').value = limitOf(DEMO.y, DEMO.m, day); document.getElementById('emCutoff').value = cutoffOf(DEMO.y, DEMO.m, day); openModal('modalMenu'); }
function saveMenu() { const k = KEY(DEMO.y, DEMO.m, editDay); Store.d.menuOverrides[k] = Object.assign({}, Store.d.menuOverrides[k], { limit: parseInt(document.getElementById('emLimit').value) || 80, cutoff: document.getElementById('emCutoff').value }); Store.save(); closeModal('modalMenu'); buildMenuPanel(); buildCal(); toast(`✅ 6/${editDay} 예약 설정 저장 (고객 달력 반영)`); }
function openRegister() { document.getElementById('regDay').value = 25; document.getElementById('regEmoji').value = '🍱'; document.getElementById('regName').value = ''; document.getElementById('regPrice').value = 10800; document.getElementById('regWas').value = 12000; document.getElementById('regLimit').value = 80; document.getElementById('regCutoff').value = '전일 18:00'; openModal('modalRegister'); }
function saveRegister() {
  const day = parseInt(document.getElementById('regDay').value); const name = document.getElementById('regName').value.trim();
  if (!day || day < 1 || day > 30) return toast('배송일(1~30)을 확인하세요');
  if (new Date(DEMO.y, DEMO.m, day).getDay() % 6 === 0) return toast('주말은 휴무일입니다');
  if (!name) return toast('메뉴명을 입력하세요');
  Store.d.menuOverrides[KEY(DEMO.y, DEMO.m, day)] = { f: document.getElementById('regEmoji').value || '🍱', n: name, d: name + ' — 신규 등록 메뉴', p: parseInt(document.getElementById('regPrice').value) || 0, was: parseInt(document.getElementById('regWas').value) || 0, kcal: 400, tags: ['신규'], limit: parseInt(document.getElementById('regLimit').value) || 80, cutoff: document.getElementById('regCutoff').value, registered: true };
  Store.save(); closeModal('modalRegister'); buildMenuPanel(); buildCal(); toast(`✅ 6/${day} '${name}' 등록 완료 (고객 달력 즉시 반영)`);
}

/* ===== 회원 마이그레이션 + CSV ===== */
function buildMembers() {
  document.getElementById('migState').innerHTML = Store.d.migrated ? `<div class="ic">✅</div><b class="done">마이그레이션 완료</b><p>총 ${Store.d.customers.length.toLocaleString()}건 회원·구매이력 연동됨 (샘플 표시)</p>` : `<div class="ic">📤</div><b>엑셀 파일 업로드 (회원·구매이력)</b><p>클릭하여 기존 사이트 추출 엑셀을 업로드하세요</p>`;
  document.getElementById('memberRows').innerHTML = Store.d.customers.map(c => { const g = gradeOf(c.amt), dorm = isDormant(c.loginDays); return `<tr><td><b>${c.id}</b></td><td>${c.name}</td><td><span class="pill ${gcls(g)}">${g}</span></td><td>${WON(c.amt)}</td><td>${c.orders}회</td><td>${c.joined}</td><td>${dorm ? '<span class="pill p-out">휴면</span>' : '<span class="pill p-open">활성</span>'}</td></tr>`; }).join('');
}
function uploadMembers() { Store.d.migrated = true; Store.save(); buildMembers(); toast('📥 엑셀에서 회원·구매이력을 불러왔습니다 (데모)'); }

function downloadCSV(filename, header, rows) {
  const esc = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = '﻿' + [header, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }), url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  toast('⬇️ ' + filename + ' 다운로드');
}
function exportMembers() { downloadCSV('맘찬_회원목록.csv', ['회원ID', '이름', '등급', '누적구매액', '주문수', '가입월', '최근접속(일전)', '상태'], Store.d.customers.map(c => [c.id, c.name, gradeOf(c.amt), c.amt, c.orders, c.joined, c.loginDays, isDormant(c.loginDays) ? '휴면' : '활성'])); }
function exportOrders() { downloadCSV('맘찬_주문내역.csv', ['주문번호', '고객', '배송일', '메뉴', '옵션', '수량', '금액', '상태'], Store.d.orders.map(o => [o.id, o.cust, `6/${o.day}`, o.label, o.opt, o.qty, o.amt, ST_LABEL[o.st]])); }
function exportCrm() { const rows = currentCrm.map(c => { const g = gradeOf(c.amt); return [c.name, g, c.amt, c.orders, c.lastOrder, c.loginDays, isDormant(c.loginDays) ? '휴면' : '활성']; }); downloadCSV('맘찬_CRM세그먼트.csv', ['이름', '등급', '누적구매', '주문수', '최근주문', '최근접속(일전)', '상태'], rows); }

/* ===== CRM ===== */
let currentCrm = [];
function segOf(c) { const segs = []; const g = gradeOf(c.amt); if (g === 'VIP') segs.push('vip'); if (isDormant(c.loginDays)) segs.push('dormant'); else if (c.loginDays >= 30 && c.loginDays < 90) segs.push('atrisk'); if (c.orders <= 2 && c.loginDays < 30) segs.push('new'); return segs; }
function buildCrm(f) {
  currentCrm = Store.d.customers.filter(c => f === 'all' || segOf(c).includes(f));
  document.getElementById('crmRows').innerHTML = currentCrm.map(c => { const idx = Store.d.customers.indexOf(c), g = gradeOf(c.amt), segs = segOf(c); const tag = segs.includes('dormant') ? '<span class="pill p-out">휴면</span>' : segs.includes('atrisk') ? '<span class="pill p-out">이탈위험</span>' : segs.includes('new') ? '<span class="pill p-open">신규</span>' : '<span style="color:var(--faint)">정상</span>'; return `<tr class="click" onclick="openDrawer(${idx})"><td><b>${c.name}</b></td><td><span class="pill ${gcls(g)}">${g}</span></td><td>${WON(c.amt)}</td><td>${c.orders}회</td><td>${c.lastOrder}</td><td>${tag}</td><td><button class="btn btn-soft" onclick="event.stopPropagation();issueCoupon(${idx},this)">쿠폰발급</button></td></tr>`; }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--sub);padding:30px">해당 세그먼트 고객이 없습니다</td></tr>';
  const all = Store.d.customers;
  const counts = { all: all.length, vip: 184, dormant: 512, atrisk: 147, new: 286 };
  document.querySelectorAll('#crmSeg button').forEach(b => { const ct = b.querySelector('.ct'); if (ct) ct.textContent = counts[b.dataset.seg]; });
}
function filterCrm(f, btn) { document.querySelectorAll('#crmSeg button').forEach(b => b.classList.remove('on')); btn.classList.add('on'); buildCrm(f); }
let coupTargetIdx = null;
function issueCoupon(idx, btn) { coupTargetIdx = idx; document.getElementById('coupTarget').textContent = Store.d.customers[idx].name; window._coupBtn = btn; openModal('modalCoupon'); }
function confirmCoupon() {
  const t = document.getElementById('coupType').value, c = Store.d.customers[coupTargetIdx]; closeModal('modalCoupon');
  if (window._coupBtn) { window._coupBtn.textContent = '발급완료 ✓'; window._coupBtn.classList.add('done'); }
  // 발급 대상이 로그인 사용자면 쿠폰함에 실제 반영
  if (c.name === Store.d.user.name) { Store.d.user.coupons.unshift({ amt: t.includes('15%') ? '15%' : t.includes('12%') ? '12%' : '5,000', t: t.split('(')[0].trim() + ' 쿠폰', d: '관리자 발급 · ~말일' }); Store.save(); }
  toast(`🎟️ ${c.name}님께 ${t} 쿠폰 발급` + (c.name === Store.d.user.name ? ' (쿠폰함 반영)' : ''));
}
function openDrawer(idx) {
  const c = Store.d.customers[idx], g = gradeOf(c.amt), cyc = c.orders > 1 ? (Math.max(3, 120 / c.orders)).toFixed(1) : '-';
  document.getElementById('drAv').textContent = c.name[0];
  document.getElementById('drName').textContent = c.name + ' 님';
  document.getElementById('drGrade').innerHTML = `<span class="pill ${gcls(g)}" style="background:rgba(255,255,255,.22);color:#fff">${g}</span> · 마지막 접속 ${c.loginDays}일 전`;
  document.getElementById('drStat').innerHTML = `<div class="s"><div class="l">누적 구매액</div><div class="v">${(c.amt / 10000).toLocaleString()}만</div></div><div class="s"><div class="l">총 주문수</div><div class="v">${c.orders}회</div></div><div class="s"><div class="l">재주문 주기</div><div class="v">${cyc}${cyc !== '-' ? '일' : ''}</div></div><div class="s"><div class="l">최근 주문</div><div class="v" style="font-size:15px">${c.lastOrder}</div></div>`;
  const mine = Store.d.orders.filter(o => o.cust === c.name).slice(0, 4);
  document.getElementById('drTimeline').innerHTML = (mine.length ? mine.map(o => `<div class="ti"><div class="dt">6/${o.day} · ${ST_LABEL[o.st]}</div><div class="tx">${o.label} (${o.opt})</div></div>`).join('') : '<div class="ti"><div class="tx">주문 이력 없음</div></div>');
  openOverlay('drawerMask', 'drawer');
}
function closeDrawer() { closeOverlay('drawerMask', 'drawer'); }

/* ===== 카카오 ===== */
const KK = [
  { i: '🗓️', t: '익월 신규 메뉴 오픈 알림', msg: '[맘찬] 7월 메뉴표가 오픈되었어요! 이달의 신상 \'간장새우장\'을 가장 먼저 만나보세요 🍱', target: '전체 활성 회원', cnt: '2,841명', when: '7/1 오전 10시 예약', auto: 'CMS 월메뉴 등록 시 자동', reach: 96, click: 28, conv: 11 },
  { i: '⏰', t: '당일 주문 마감 임박', msg: '[맘찬] 오늘 18시 주문 마감! 내일(6/16) 받을 \'고등어무조림\'을 지금 담아보세요 ⏰', target: '오늘 미주문 단골', cnt: '1,204명', when: '매일 15:00 자동', auto: '마감 3시간 전 트리거', reach: 94, click: 34, conv: 19 },
  { i: '🎟️', t: '타겟 쿠폰 번호 발송', msg: '[맘찬] VIP님께 드리는 15% 감사 쿠폰! 코드 VIP15 (~6/30) 💚', target: 'VIP·GOLD 등급', cnt: '707명', when: '수동 발송', auto: 'CRM 세그먼트 연동', reach: 98, click: 41, conv: 24 },
  { i: '💤', t: '휴면 고객 재활성화', msg: '[맘찬] 오랜만이에요 :) 돌아오신 분께 첫 주문 5,000원 할인! 코드 MOM5000 🎁', target: '90일+ 미접속', cnt: '512명', when: '주 1회 자동', auto: '휴면 자동 필터 연동', reach: 89, click: 17, conv: 8 },
];
function buildKakao() { document.getElementById('kkList').innerHTML = KK.map((k, i) => `<div class="kkrow"><div class="kkico">${k.i}</div><div class="kkinfo"><b>${k.t}</b><div class="msg">${k.msg}</div><div class="meta"><span>👥 대상 <b>${k.target} (${k.cnt})</b></span><span>🕒 ${k.when}</span><span>⚙️ ${k.auto}</span></div><div class="kkstats"><div class="ks">발송<b>${k.cnt}</b></div><div class="ks">도달률<b>${k.reach}%</b></div><div class="ks">클릭률<b>${k.click}%</b></div><div class="ks">전환율<b class="g">${k.conv}%</b></div></div></div><button class="btn btn-pri" style="padding:11px 18px;align-self:flex-start" onclick="sendKakao(${i},this)">발송</button></div>`).join(''); }
function sendKakao(i, btn) { window._kkBtn = btn; window._kkIdx = i; document.getElementById('kkConfirm').innerHTML = `<b>${KK[i].t}</b><br>대상: ${KK[i].target} <b>${KK[i].cnt}</b>에게 알림톡을 발송할까요?`; openModal('modalKakao'); }
function confirmKakao() { closeModal('modalKakao'); if (window._kkBtn) { window._kkBtn.textContent = '발송완료 ✓'; window._kkBtn.classList.add('done'); } toast(`📨 ${KK[window._kkIdx].cnt}에게 발송 완료`); }

/* 모달 / 리셋 */
function openModal(id) { document.getElementById(id).classList.add('on'); }
function closeModal(id) { document.getElementById(id).classList.remove('on'); }
function resetDemo() { Store.reset(); cart = []; coupon = null; viewY = DEMO.y; viewM = DEMO.m; updateBadge(); renderUser(); buildCal(); buildAdmin(); document.getElementById('login').classList.remove('hide'); switchTabById('home'); toast('🔄 데모 데이터를 초기화했습니다'); }

/* ============================================================
   init
   ============================================================ */
Store.load();
renderUser();
buildCal();
buildPopular();
buildAdmin();
