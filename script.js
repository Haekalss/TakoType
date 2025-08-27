// ====== Word lists (ringkas) ======
const WORDS = {
  basic: "dan di ke dari untuk dengan pada oleh sebagai atau tidak sudah akan bisa kalau karena maka namun jadi hanya sangat lebih masih harus telah dapat dalam antara oleh tentang setelah sebelum sampai waktu orang anak hari tahun kita kamu saya mereka itu ini ada juga sudah belum baru baik benar salah besar kecil panjang pendek mudah sulit cepat lambat dekat jauh tinggi rendah berat ringan".split(" "),
  extended: ("adalah apabila akibat aktivitas alamat ambil anak aneh angka antar apa aplikasi arti asal asli atas awal ayah baca badan bagian baik banyak baru bawah bebas beda belajar belum benar bentuk besar bicara bidang bila bingung bisa buat buka bulan bumi budaya buka butuh cari cara catat cepat cerita coba cocok contoh cuaca cukup curah daftar dalam datang daerah dasar data dekat depan derajat desain detik dokter dunia duduk dulu ekonomi efek email empat enak energi enggak enkripsi es evaluasi fakta faktor fasilitas famili fungsi gabung gagal gambar gampang ganjaran garam garis garpu gas gaya gelap gelas gempa generasi geografis gerak geser getar giat gigih gigi gitar golongan goreng gotong guru habis hadiah hafal halaman halus hambatan hampir handal hangat hari hasil hati hidup hijau hilang himpunan hobi hukum hujan huruf ibu ide identitas iklan ilmu imajinasi impian indah industri informasi ingat ingin inisiatif inspirasi instruksi integrasi internet investasi isi istirahat izin jadwal jaga jalan jam jaminan jangkauan jauh jadi jaga jalur jari jasa jatuh jejak jelaskan jemput jendela jenuh jeruk jumlah jumat juga jujur julukan jumlah kabar kaca kaki kalimat kali kamar kampus kamu kanal kantor kapasitas karir kartu kasih kata kawin kaya kerja keras kereta kerjaan kesehatan kesulitan ketua khawatir kita kualitas kuat kuota kurang kusut kutip lagu lain latihan laki-laki lama lambat lampu langit lantai lapangan lapar larangan larut latar lawan layar layu lebar lebih lega lewat listrik lokasi logika lomba luas lupa lurus luwes".split(" ")),
  numbers: Array.from({length:400},()=> String(Math.floor(Math.random() * Math.pow(10, Math.floor(Math.random()*4)+1)))),
  code: (
    [
      // Kata
      "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "oleh", "sebagai", "atau", "tidak", "sudah", "akan", "bisa", "kalau", "karena", "maka", "namun", "jadi", "hanya", "sangat", "lebih", "masih", "harus", "telah", "dapat", "dalam", "antara", "tentang", "setelah", "sebelum", "sampai", "waktu", "orang", "anak", "hari", "tahun", "kita", "kamu", "saya", "mereka", "itu", "ini", "ada", "juga", "belum", "baru", "baik", "benar", "salah", "besar", "kecil", "panjang", "pendek", "mudah", "sulit", "cepat", "lambat", "dekat", "jauh", "tinggi", "rendah", "berat", "ringan",
      // Angka random 1-4 digit
      ...Array.from({length:100},()=> String(Math.floor(Math.random() * Math.pow(10, Math.floor(Math.random()*4)+1)))),
      // Simbol spesial
      "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "]", "{", "}", ":", ";", "'", "\"", "<", ">", ",", ".", "?", "/", "|"
    ]
  )
};
  // ====== State ======
  const state = {
    started:false, finished:false,
    duration:30, timeLeft:30, timerId:null,
  words:[], wordIndex:0, charIndex:0,
    typed:0, correct:0, errors:0, extraMap:new Map(),
  // per-second typing data for charting
  charsPerSecond: [],
  errorsPerSecond: []
  };

  // ====== Elements ======
  const el = (id)=>document.getElementById(id);
  const wordsEl = el('words');
  const timeVal = el('timeVal');
  const wpmVal = el('wpmVal');
  const accVal = el('accVal');
  const errVal = el('errVal');
  const hiddenInput = el('hiddenInput');
  const modeSel = el('mode');
  const diffSel = el('difficulty');
  const durationSel = el('duration');
  const wordCountSel = el('wordCount');
  const testTypeSel = el('testType');
  const durationBox = el('durationBox');
  // start button removed: start is automatic
  const customBox = el('customBox');
  const customText = el('customText');
  const controlsSection = el('controlsSection');
  const typingBox = el('typingBox');
  const app = el('app');
  const statsSection = el('statsSection');
  const resultSection = el('resultSection');
  const backBtn = el('backBtn');
  const footerSection = el('footerSection');
  const rWpm = el('rwpm');
  const rAcc = el('racc');
  const rErr = el('rerr');
  const rTime = el('rtime');
  const rSum = el('rsum');
  const bestVal = el('bestVal');
  // wordCounter wrapper present in HTML; individual parts used directly
  const wordsDoneEl = el('wordsDone');
  const wordsTotalEl = el('wordsTotal');

  // ====== Helpers ======
  const rnd = (arr)=> arr[Math.floor(Math.random()*arr.length)];
  const clamp = (n,min,max)=> Math.min(max, Math.max(min,n));
  function setTheme(next){
    // force dark-only theme, ignore any stored preference
    const theme = 'dark';
    try{ document.documentElement.dataset.theme = theme; }catch(e){}
  }

  function saveBest(wpm){
    const best = Number(localStorage.getItem('mini-best')||0);
    if(wpm>best){ localStorage.setItem('mini-best', String(Math.round(wpm))); }
    bestVal.textContent = localStorage.getItem('mini-best')||'0';
  }

  // central helper to show/hide stats consistently
  function setStatsVisible(show){
    try{
      if(!statsSection) return;
      if(show) {
        statsSection.style.display = '';
      } else {
        statsSection.style.display = 'none';
      }
    }catch(e){}
  }

  function buildWords(){
    wordsEl.innerHTML = '';
    state.words.forEach((w,wi)=>{
      const wEl = document.createElement('div'); wEl.className='word'; wEl.dataset.index=wi;
      for(let i=0;i<w.length;i++){
        const c = document.createElement('span'); c.className='char'; c.textContent=w[i]; c.dataset.ci=i; wEl.appendChild(c);
      }
      // placeholder for extra
      const extraSpan = document.createElement('span'); extraSpan.className='extra-holder'; wEl.appendChild(extraSpan);
      wordsEl.appendChild(wEl);
    });
  markCurrent();
  }

  function markCurrent(){
    document.querySelectorAll('.current').forEach(n=>n.classList.remove('current'));
    document.querySelectorAll('.current-word').forEach(n=>n.classList.remove('current-word'));
    const wEl = wordsEl.children[state.wordIndex]; if(!wEl) return;
    wEl.classList.add('current-word');
    const chars = wEl.querySelectorAll('.char');
    const ci = clamp(state.charIndex, 0, chars.length-1);
    if(chars[ci]) chars[ci].classList.add('current');
    else {
      // caret after last char -> show on last char
      if(chars.length) chars[chars.length-1].classList.add('current');
    }
  }

  function regenWords(){
  const count = Number(wordCountSel.value);
  const mode = modeSel.value;
  // Pilih pool sesuai difficulty
    // if regen called repeatedly, debounce and reuse the same timer
    if(regenWords._timer){ clearTimeout(regenWords._timer); regenWords._timer = null; }
    // animate out
    try{ wordsEl.classList.add('refreshing'); }catch(e){}
    regenWords._timer = setTimeout(()=>{
      try{
        if(mode==='custom'){
          const text = (customText.value||'Ketik itu seni; konsistensi adalah kuncinya.').trim().replace(/\s+/g,' ');
          state.words = text ? text.split(' ') : [];
        } else {
          const diff = diffSel.value;
          if(diff === 'code') {
            // Kombinasi: proporsi manusiawi
            const kataPool = WORDS.basic;
            const angkaPool = Array.from({length:100},()=> String(Math.floor(Math.random() * Math.pow(10, Math.floor(Math.random()*4)+1))));
            const simbolPool = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "]", "{", "}", ":", ";", "'", "\"", "<", ">", ",", ".", "?", "/", "|"];
            const nKata = Math.round(count * 0.7);
            const nAngka = Math.round(count * 0.2);
            const nSimbol = count - nKata - nAngka;
            let arr = [];
            for(let i=0;i<nKata;i++) arr.push(rnd(kataPool));
            for(let i=0;i<nAngka;i++) arr.push(rnd(angkaPool));
            for(let i=0;i<nSimbol;i++) arr.push(rnd(simbolPool));
            // acak urutan agar tidak berurutan
            for(let i=arr.length-1;i>0;i--){
              const j = Math.floor(Math.random()*(i+1));
              [arr[i],arr[j]]=[arr[j],arr[i]];
            }
            state.words = arr;
          } else {
            const pool = WORDS[diff] || WORDS.basic;
            state.words = Array.from({length:count},()=> rnd(pool));
          }
        }
        buildWords();
        if(wordsTotalEl) wordsTotalEl.textContent = String(state.words.length);
      }catch(e){}
      // animate in
      try{ wordsEl.classList.remove('refreshing'); }catch(e){}
      regenWords._timer = null;
    }, 180);
  }

  function reset(){
    state.started=false; state.finished=false; state.timeLeft=Number(durationSel.value); state.duration=state.timeLeft;
    state.wordIndex=0; state.charIndex=0; state.typed=0; state.correct=0; state.errors=0; state.extraMap.clear();
    timeVal.textContent=String(state.timeLeft); wpmVal.textContent='0'; accVal.textContent='100%'; errVal.textContent='0';
    clearInterval(state.timerId); state.timerId=null;
    regenWords();
    hiddenInput.value='';
    setStatsVisible(false);
  // ensure controls state classes cleared to avoid leftover reserved space
  try{ controlsSection.classList.remove('collapsed','visual-hidden','swapped','controls--timer','controls--nontimer'); }catch(e){}
  // re-apply the correct controls class based on current test type
  try{ if(controlsSection && testTypeSel) controlsSection.classList.add(testTypeSel.value === 'timer' ? 'controls--timer' : 'controls--nontimer'); }catch(e){}
    if (testTypeSel.value === 'timer') {
      if (testTypeSel && testTypeSel.value === 'timer') {
        timeVal.parentElement.style.display = '';
      } else {
        timeVal.parentElement.style.display = 'none';
      }
    } else {
      timeVal.parentElement.style.display = 'none';
    }
  // reset word counter UI
  if(wordsDoneEl) wordsDoneEl.textContent = '0';
  if(wordsTotalEl) wordsTotalEl.textContent = String(state.words.length || 0);
  markCurrent();
  }

  function showSection(section) {
    // helper to temporarily disable CSS transitions for immediate swaps
    function withInstant(fn){
      try{ document.documentElement.classList.add('instant'); fn(); }
      finally{ setTimeout(()=> document.documentElement.classList.remove('instant'), 20); }
    }
    // We'll avoid using display:none on controls to prevent layout jumps.
    // Instead: keep controls in layout (visibility hidden) and size statsSection to the same height.
  // keep a reference to observer so we can disconnect later
  let _controlsObserver = null;
  const insertStats = () => {
      try{
        // For timer mode: move the stats panel into the controls section and hide other controls
        if(testTypeSel && testTypeSel.value === 'timer'){
    // If already inserted correctly, no-op
    if(statsSection.parentNode === controlsSection && controlsSection.firstChild === statsSection) {
      // already inserted
    } else {
      // ensure statsSection is not present elsewhere (prevent duplicates)
        try{
        // remove any existing instance reference
        if(statsSection.parentNode) statsSection.parentNode.removeChild(statsSection);
      }catch(e){}
      // insert as first child so CSS .controls.swapped > #statsSection rules apply
      try{
        // lock current height to avoid layout gaps while we hide other children
        const h = Math.max(0, Math.round(controlsSection.getBoundingClientRect().height));
        // keep reserved space on controls, but make the stats panel fill it so there's no empty gap
        controlsSection.style.minHeight = h + 'px';
        controlsSection.insertBefore(statsSection, controlsSection.firstChild);
  try{ statsSection.style.height = 'auto'; statsSection.style.boxSizing = 'border-box'; statsSection.style.overflow = ''; }catch(e){}
      }catch(e){ /* ignore */ }
    }
          // clear any absolute/overlay styles
          statsSection.style.height = '';
          statsSection.style.overflow = '';
          statsSection.style.position = '';
          statsSection.style.top = '';
          statsSection.style.left = '';
          statsSection.style.width = '';
          statsSection.style.zIndex = '';
          // mark controls swapped so CSS hides the original controls children
          controlsSection.classList.add('swapped');
          statsSection.classList.remove('hiding'); statsSection.classList.add('showing');
          setStatsVisible(true);
        } else {
          // non-timer: ensure stats hidden and controls shown
          statsSection.classList.remove('showing'); statsSection.classList.add('hiding');
          setStatsVisible(false);
          controlsSection.classList.remove('swapped');
          try{ if(statsSection.parentNode === controlsSection) controlsSection.removeChild(statsSection); }catch(e){}
          try{ if(statsSection.parentNode !== app) app.insertBefore(statsSection, typingBox); }catch(e){}
        }
      }catch(e){
        // fallback: conservative behavior
        if(testTypeSel && testTypeSel.value === 'timer'){
          setStatsVisible(true);
          controlsSection.classList.add('swapped');
        } else {
          setStatsVisible(false);
          controlsSection.classList.remove('swapped');
        }
      }
    };

  const resetStats = () => {
  // animate hiding then restore controls
  statsSection.classList.remove('showing'); statsSection.classList.add('hiding');
  setTimeout(()=>{
    setStatsVisible(false);
  try{ controlsSection.style.display = ''; }catch(e){}
  // remove locked min-height so layout can settle back to normal
  try{ controlsSection.style.minHeight = ''; }catch(e){}
  statsSection.classList.remove('centered');
  }, 260);
  // remove inline height/overflow we set when swapping
  try{ statsSection.style.height = ''; statsSection.style.overflow = ''; statsSection.style.boxSizing = ''; }catch(e){}
      // remove overlay styles
      statsSection.style.height = '';
      statsSection.style.overflow = '';
      statsSection.style.position = '';
      statsSection.style.top = '';
      statsSection.style.left = '';
      statsSection.style.width = '';
      statsSection.style.zIndex = '';
  // disconnect observer and detach from controls if we inserted it there
  try{ if(_controlsObserver){ _controlsObserver.disconnect(); _controlsObserver = null; } }catch(e){}
  try{ if(statsSection.parentNode === controlsSection) controlsSection.removeChild(statsSection); }catch(e){}
      // ensure it's placed back near typingBox only if not already there
      try{ if(statsSection.parentNode !== app) app.insertBefore(statsSection, typingBox); }catch(e){}
  // restore control interactivity
  controlsSection.style.pointerEvents = 'auto';
    };

  // control visibility helpers
  const showControls = () => {
    // ensure animated expand
    controlsSection.classList.remove('collapsed');
    controlsSection.style.display = '';
  controlsSection.style.pointerEvents = 'auto';
    // ensure visible after a tick
    setTimeout(()=> controlsSection.style.visibility = 'visible', 20);
  };

  const hideControls = () => {
    // animate collapse but keep layout flow (controls.collapsed will compress)
    controlsSection.classList.add('collapsed');
    // keep visibility hidden for pointer-events; allow CSS transition to run
    setTimeout(()=> controlsSection.style.visibility = 'hidden', 220);
  };

  // Collapse controls but keep visibility so overlayed stats (inserted inside) remain visible.
  const collapseControlsKeepVisible = () => {
    controlsSection.classList.add('collapsed');
    // do not change visibility so inserted overlay can be seen
    controlsSection.style.visibility = 'visible';
  };

  // completely remove controls from layout (no reserved space)
  const removeControlsSpace = () => {
    // collapse then set display:none after transition
    controlsSection.classList.add('collapsed');
    const onEnd = (ev)=>{
      if(ev.target !== controlsSection) return;
      controlsSection.style.display = 'none';
      controlsSection.removeEventListener('transitionend', onEnd);
    };
    controlsSection.addEventListener('transitionend', onEnd);
  };

    if (section === 'typing') {
      // show typing area
      // ensure typing visible immediately
      typingBox.style.display = '';
      // hide result with a smooth transition
  if(resultSection){ resultSection.classList.remove('show'); document.documentElement.classList.remove('result-visible'); setTimeout(()=>{ try{ resultSection.style.display = 'none'; }catch(e){} }, 300); }
      if (testTypeSel.value === 'timer' && state.started) {
          // timer mode: overlay stats on the controls area without collapsing controls
          withInstant(()=>{
            // make controls non-interactive while stats overlay is active
            controlsSection.style.pointerEvents = 'none';
            setStatsVisible(true);
            insertStats();
          });
      } else if (testTypeSel.value === 'non-timer' && state.started) {
        // non-timer mode: visually hide controls when typing starts but keep layout
        withInstant(()=>{
          // use visual-hidden class so typing box doesn't shift
          controlsSection.classList.add('visual-hidden');
          // make sure collapsed/layout removal is not active
          controlsSection.classList.remove('collapsed');
          resetStats();
        });
      } else {
        // menu or not-started: keep controls visible and hide stats (non-timer should hide stats)
        withInstant(()=>{
          // ensure fully visible
          controlsSection.classList.remove('visual-hidden');
          showControls();
          setStatsVisible(false);
          resetStats();
        });
      }
    } else if (section === 'result') {
      // show result screen: remove the controls area entirely (no reserved space)
      withInstant(()=>{
        // hide typing smoothly
        typingBox.style.display = 'none';
  // show result with class-based animation
  if(resultSection){ resultSection.style.display = ''; /* ensure it participates in layout for animation */ document.documentElement.classList.add('result-visible'); setTimeout(()=> resultSection.classList.add('show'), 20); }
        // remove controls from layout so result can flow naturally
        removeControlsSpace();
        resetStats();
        if (testTypeSel && testTypeSel.value === 'timer') {
          timeVal.parentElement.style.display = '';
        } else {
          timeVal.parentElement.style.display = 'none';
        }
      });
    } else {
      // menu
      // show controls, hide typing/result/stats
      withInstant(()=>{
        showControls();
        typingBox.style.display = '';
  if(resultSection){ resultSection.classList.remove('show'); document.documentElement.classList.remove('result-visible'); setTimeout(()=>{ try{ resultSection.style.display = 'none'; }catch(e){} }, 300); }
        resetStats();
      });
  // ensure the hidden input is focused so typing resumes immediately when returning to menu
  try{ setTimeout(()=>{ focusHiddenInput(); }, 30); }catch(e){}
    }

    footerSection.style.display = section === 'menu' ? '' : 'none';
  }

  function start(){
    if(state.started) return; state.started=true; state.finished=false;
  hiddenInput.focus();
  state.started = true;
  showSection('typing');
  hiddenInput.disabled = false;
    // Statistik hanya muncul setelah mulai jika mode timer
    if (testTypeSel.value === 'timer') {
      setStatsVisible(true);
      if (testTypeSel && testTypeSel.value === 'timer') {
        timeVal.parentElement.style.display = '';
      } else {
        timeVal.parentElement.style.display = 'none';
      }
    } else {
      setStatsVisible(false);
    }
    // start unified per-second sampling for both timer and non-timer modes
    state.charsPerSecond = [];
    state.errorsPerSecond = [];
    state.elapsedSeconds = 0;
    let prevTyped = state.typed || 0;
    let prevErrors = state.errors || 0;
    state.timerId = setInterval(()=>{
      // timer mode: count down
      if(testTypeSel && testTypeSel.value === 'timer'){
        if(state.timeLeft<=0){
          clearInterval(state.timerId);
          state.timeLeft = 0;
          timeVal.textContent = '0';
          updateWpm();
          finish();
          hiddenInput.disabled = true;
          return;
        }
        state.timeLeft--;
        timeVal.textContent = String(state.timeLeft);
      } else {
        // non-timer: track elapsed seconds for WPM calculation and charting
        state.elapsedSeconds = (state.elapsedSeconds || 0) + 1;
        // keep timeVal empty (UI choice), but we could show elapsed if desired
      }
      // record chars and errors typed in the last second
      const nowTyped = state.typed || 0;
      const nowErrors = state.errors || 0;
      state.charsPerSecond.push(Math.max(0, nowTyped - prevTyped));
      state.errorsPerSecond.push(Math.max(0, nowErrors - prevErrors));
      prevTyped = nowTyped; prevErrors = nowErrors;
      updateWpm();
    },1000);
  }

  function finish(){
  if(state.finished) return;
  state.finished=true;
  clearInterval(state.timerId);
  const wpm = calcWpm();
  const acc = calcAcc();
  rWpm.textContent = String(Math.round(wpm));
  rAcc.textContent = Math.round(acc) + '%';
  rErr.textContent = String(state.errors);
  // Show correct time for timer/non-timer mode
  if (testTypeSel && testTypeSel.value === 'timer') {
    rTime.textContent = state.duration + 's';
  } else {
    rTime.textContent = (state.elapsedSeconds || 0) + 's';
  }
  rSum.textContent = `Kamu mengetik ${state.typed} karakter dengan ${state.errors} salah. Mantap!`;
  // big stats on left
  try{ const b = document.getElementById('rwpmBig'); if(b) b.textContent = String(Math.round(wpm)); }catch(e){}
  try{ const bb = document.getElementById('raccBig'); if(bb) bb.textContent = Math.round(acc) + '%'; }catch(e){}
  saveBest(wpm);
  // ensure word counter shows completed total
  if(wordsDoneEl) wordsDoneEl.textContent = String(state.words.length);
  showSection('result');
  hiddenInput.blur();
  hiddenInput.disabled = true;
  // draw chart if available (delay slightly to ensure result panel visible)
  setTimeout(()=>{
    try{ drawResultChart(); }catch(e){}
  }, 350);
  }

  // draw a dual-series smoothed line chart (WPM and Errors) into #resultChart
  function drawResultChart(){
    const canvas = document.getElementById('resultChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
  const seconds = (state.charsPerSecond && state.charsPerSecond.length) ? state.charsPerSecond.length : (state.elapsedSeconds || 1);
    // convert chars-per-second to approximate WPM-per-second (chars/5 -> words)
  const wpmSeries = (state.charsPerSecond && state.charsPerSecond.length) ? state.charsPerSecond.map(c=> (c/5)*60) : [ Math.round(calcWpm()) ];
  const errSeries = (state.errorsPerSecond && state.errorsPerSecond.length) ? state.errorsPerSecond : [ state.errors || 0 ];

    // canvas sizing for HiDPI
    const DPR = devicePixelRatio || 1;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,cw,ch);

  // use symmetric, tighter horizontal padding so chart aligns closer to small-stats
  const padding = {left:18, right:18, top:12, bottom:22};
    const innerW = cw - padding.left - padding.right;
    const innerH = ch - padding.top - padding.bottom;

    // draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    const gridSteps = 4;
    for(let i=0;i<=gridSteps;i++){
      const y = padding.top + (i/gridSteps)*innerH;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left+innerW, y); ctx.stroke();
    }

    // scales
    const maxWpm = Math.max(10, ...wpmSeries);
    const maxErr = Math.max(1, ...errSeries);

    // helper to get point coords
    const getX = (i)=> padding.left + (i/(Math.max(1,wpmSeries.length-1)))*innerW;
    const getYw = (v)=> padding.top + innerH - (v / maxWpm) * innerH;
    const getYe = (v)=> padding.top + innerH - (v / maxErr) * innerH;

    // draw smoothed line for WPM (yellow)
    ctx.lineWidth = 2.5;
    // area under WPM
    ctx.beginPath();
    for(let i=0;i<wpmSeries.length;i++){
      const x = getX(i); const y = getYw(wpmSeries[i]);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = 'rgba(255,199,0,1)'; ctx.stroke();

    // draw points for WPM
    ctx.fillStyle = 'rgba(255,199,0,1)';
    for(let i=0;i<wpmSeries.length;i++){
      const x = getX(i); const y = getYw(wpmSeries[i]);
      ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    }

    // draw errors line (muted gray) on separate scale (right axis)
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(180,180,180,0.9)'; ctx.fillStyle = 'rgba(180,180,180,0.9)';
    for(let i=0;i<errSeries.length;i++){
      const x = getX(i); const y = getYe(errSeries[i]);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    for(let i=0;i<errSeries.length;i++){
      const x = getX(i); const y = getYe(errSeries[i]);
      ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2); ctx.fill();
    }

    // left axis label (WPM)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '11px monospace'; ctx.textAlign='left'; ctx.textBaseline='middle';
    for(let i=0;i<=gridSteps;i++){
      const val = Math.round(((gridSteps-i)/gridSteps)*maxWpm);
      const y = padding.top + (i/gridSteps)*innerH;
      ctx.fillText(String(val), 6, y);
    }
    // right axis labels (errors)
    ctx.textAlign='right';
    for(let i=0;i<=gridSteps;i++){
      const val = Math.round(((gridSteps-i)/gridSteps)*maxErr);
      const y = padding.top + (i/gridSteps)*innerH;
      ctx.fillText(String(val), cw - 6, y);
    }

    // x-axis ticks (seconds)
    ctx.textAlign='center'; ctx.textBaseline='top'; ctx.font='11px monospace';
    // x-axis ticks: if elapsedSeconds available (non-timer), label according to elapsed time
    const totalPoints = Math.max(1, wpmSeries.length);
    for(let i=0;i<totalPoints;i+= Math.max(1, Math.floor(totalPoints/8))){
      const x = getX(i); ctx.fillText(String(i+1), x, padding.top + innerH + 6);
    }

    // capture point coords for interaction (transform already 1:1 for CSS pixels)
    const points = [];
    for(let i=0;i<wpmSeries.length;i++){
      points.push({
        i,
        x: getX(i),
        yW: getYw(wpmSeries[i]),
        yE: getYe(errSeries[i] || 0),
        wpm: Math.round(wpmSeries[i]),
        err: errSeries[i] || 0
      });
    }

    // restore default transform
    ctx.setTransform(1,0,0,1,0,0);

    // attach tooltip handlers (init once per canvas)
    try{
      const wrap = canvas.parentElement; // .chart-wrap
      if(!wrap) return;
      let tip = wrap.querySelector('#chartTooltip');
      if(!tip) tip = document.getElementById('chartTooltip');
      if(!tip) return;
      // only attach once
      if(canvas._tooltipInit) return;
      const onMove = (ev) => {
        const rect = canvas.getBoundingClientRect();
        const mx = ev.clientX - rect.left; // CSS pixels inside canvas
        // nearest point by x
        let nearest = null; let best = Infinity;
        for(const p of points){ const d = Math.abs(p.x - mx); if(d < best){ best = d; nearest = p; } }
        if(!nearest){ tip.style.display='none'; tip.setAttribute('aria-hidden','true'); return; }
        tip.innerHTML = `Detik ${nearest.i+1} — WPM: ${nearest.wpm} — Err: ${nearest.err}`;
        // position relative to wrap (wrap is positioned)
        tip.style.left = Math.round(nearest.x) + 'px';
        tip.style.top = Math.round(nearest.yW) + 'px';
        tip.style.display = 'block'; tip.setAttribute('aria-hidden','false');
      };
      const onLeave = ()=>{ tip.style.display='none'; tip.setAttribute('aria-hidden','true'); };
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseleave', onLeave);
      canvas._tooltipInit = true;
    }catch(e){ /* ignore */ }
  }

  function calcWpm(){
  // Hitung WPM berdasarkan durasi tes
  // If running in non-timer mode, prefer elapsedSeconds if available to compute rate
  const mins = (testTypeSel && testTypeSel.value === 'timer') ? (state.duration / 60) : ((state.elapsedSeconds||0)/60 || (state.duration/60) || 1/60);
  return (state.correct / 5) / (mins || 1);
  }
  function calcAcc(){
    return state.typed ? (state.correct / state.typed) * 100 : 100;
  }
  function updateWpm(){
    wpmVal.textContent = String(Math.round(calcWpm()));
    accVal.textContent = Math.round(calcAcc()) + '%';
    errVal.textContent = String(state.errors);
  }

  function handleChar(input){
    if(state.finished) return; // tidak bisa ngetik lagi setelah selesai
    if (testTypeSel.value === 'non-timer') {
      // Jika huruf terakhir dari kata terakhir sudah diinput, langsung finish (benar/salah)
      if (
        state.wordIndex === state.words.length - 1 &&
        state.charIndex === state.words[state.wordIndex].length - 1
      ) {
        // input terakhir apapun
        state.charIndex++;
        markCurrent();
        updateWpm();
        finish();
        return;
      }
    }
    if(!state.started) start();

    // Jika semua kata sudah selesai, langsung tampilkan statistik
    if(state.wordIndex >= state.words.length) {
      finish();
      return;
    }

    const wEl = wordsEl.children[state.wordIndex]; if(!wEl) return finish();
    const target = state.words[state.wordIndex];

    if(input === ' '){ // move to next word
      // mark remaining as missed
      const remaining = target.length - state.charIndex;
      if(remaining>0){
        for(let i=state.charIndex;i<target.length;i++){
          wEl.children[i].classList.add('incorrect');
          state.errors++; state.typed++;
        }
      }
      // clear caret position
      state.wordIndex++; state.charIndex=0; markCurrent(); updateWpm();
      // update words done counter
      if(wordsDoneEl) wordsDoneEl.textContent = String(state.wordIndex);
      // Jika semua kata sudah selesai, langsung tampilkan statistik
      if(state.wordIndex>=state.words.length) {
        finish();
        return;
      }
      return;
    }

    if(input === '\b'){ // backspace
      const extras = state.extraMap.get(state.wordIndex) || [];
      if(extras.length>0){
        extras.pop();
        const holder = wEl.querySelector('.extra-holder');
        if(holder.lastChild) holder.removeChild(holder.lastChild);
        // Tidak menambah error saat backspace
        return updateWpm();
      }
      if(state.charIndex>0){
        state.charIndex--;
        const chEl = wEl.querySelector(`.char[data-ci="${state.charIndex}"]`);
        if(chEl.classList.contains('incorrect')) state.errors = Math.max(0, state.errors-1);
        if(chEl.classList.contains('correct')) state.correct = Math.max(0, state.correct-1);
        chEl.classList.remove('correct','incorrect');
        state.typed = Math.max(0, state.typed-1);
        markCurrent();
        updateWpm();
      }
      return;
    }

    // normal char
    const ci = state.charIndex;
    const targetChar = target[ci];

    if(targetChar === undefined){ // extra char beyond word length
      const holder = wEl.querySelector('.extra-holder');
      const extraSpan = document.createElement('span'); extraSpan.className='extra'; extraSpan.textContent=input; holder.appendChild(extraSpan);
      const arr = state.extraMap.get(state.wordIndex) || []; arr.push(input); state.extraMap.set(state.wordIndex, arr);
      state.errors++; state.typed++; updateWpm(); return;
    }

    const chEl = wEl.querySelector(`.char[data-ci="${ci}"]`);
    if(input === targetChar){ chEl.classList.add('correct'); state.correct++; }
    else { chEl.classList.add('incorrect'); state.errors++; }
    state.typed++; state.charIndex++; markCurrent(); updateWpm();
  }

  // ====== Events ======
  hiddenInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab'){ e.preventDefault(); }
    if(e.key === 'Enter'){ e.preventDefault(); start(); return; }
    if(e.key === 'Escape'){
      e.preventDefault();
      location.reload();
      return;
    }
    if(e.key === 'Backspace'){ e.preventDefault(); handleChar('\b'); return; }
    if(e.key.length === 1){ // printable
      e.preventDefault(); handleChar(e.key);
    }
  });
  document.addEventListener('keydown', (e)=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  if(e.ctrlKey && (e.key==='l' || e.key==='L')){ e.preventDefault(); /* theme toggle disabled */ }
    if(e.key==='Enter'){ e.preventDefault(); start(); hiddenInput.focus(); }
    if(e.key==='Escape'){
      e.preventDefault();
      location.reload();
    }
  });
  // Mode tes: timer/non-timer
  testTypeSel.addEventListener('change', function(){
    if(testTypeSel.value === 'timer'){
      durationBox.style.display = '';
    } else {
      durationBox.style.display = 'none';
    }
    // adjust controls container class to match selected test type
    if(controlsSection){
      controlsSection.classList.remove('controls--timer','controls--nontimer');
      controlsSection.classList.add(testTypeSel.value === 'timer' ? 'controls--timer' : 'controls--nontimer');
    }
    reset();
    showSection('menu');
  });

  // ensure appropriate class on load
  if(controlsSection && testTypeSel){
    controlsSection.classList.add(testTypeSel.value === 'timer' ? 'controls--timer' : 'controls--nontimer');
  }

  // ====== Persist control preferences (save/load) ======
  function saveControls(){
    const prefs = {
      mode: modeSel.value,
      testType: testTypeSel.value,
      duration: durationSel.value,
      difficulty: diffSel.value,
      wordCount: wordCountSel.value,
      customText: customText.value
    };
    try{ localStorage.setItem('mini-controls', JSON.stringify(prefs)); }catch(e){}
  }

  function loadControls(){
    try{
      const raw = localStorage.getItem('mini-controls');
      if(!raw) return;
      const prefs = JSON.parse(raw);
      if(prefs.mode) modeSel.value = prefs.mode;
      if(prefs.testType) testTypeSel.value = prefs.testType;
      if(prefs.duration) durationSel.value = prefs.duration;
      if(prefs.difficulty) diffSel.value = prefs.difficulty;
      if(prefs.wordCount) wordCountSel.value = prefs.wordCount;
      if(prefs.customText) customText.value = prefs.customText;
      // reflect UI for custom box
      customBox.style.display = modeSel.value==='custom' ? 'block' : 'none';
      // show/hide duration box
      durationBox.style.display = testTypeSel.value==='timer' ? '' : 'none';
    }catch(e){ /* ignore */ }
  }

  // ====== Custom styled dropdowns (replace native selects in controls) ======
  function createCustomSelect(sel){
    sel.classList.add('native-hidden');
    const wrapper = document.createElement('div'); wrapper.className = 'custom-select';
    const trigger = document.createElement('button'); trigger.type='button'; trigger.className='trigger'; trigger.tabIndex=0;
    const label = document.createElement('span'); label.className='label'; label.textContent = sel.options[sel.selectedIndex]?.textContent || '';
    const arrow = document.createElement('span'); arrow.className='arrow'; arrow.innerHTML = '▾';
    trigger.appendChild(label); trigger.appendChild(arrow);

    const optionsEl = document.createElement('div'); optionsEl.className='custom-options';
    Array.from(sel.options).forEach((opt, i)=>{
      const o = document.createElement('div'); o.className='custom-option'; o.tabIndex=0; o.dataset.value = opt.value; o.textContent = opt.textContent;
      if(opt.selected) o.classList.add('selected');
      o.addEventListener('click', ()=>{
        sel.value = opt.value; sel.dispatchEvent(new Event('change'));
        label.textContent = opt.textContent; optionsEl.querySelectorAll('.custom-option').forEach(x=>x.classList.remove('selected'));
        o.classList.add('selected'); wrapper.classList.remove('open');
      });
      optionsEl.appendChild(o);
    });

    // keyboard support
    let focusedIndex = Array.from(sel.options).findIndex(o=>o.selected);
    function focusOption(idx){
      const nodes = optionsEl.querySelectorAll('.custom-option');
      nodes.forEach(n=>n.classList.remove('focused'));
      if(idx<0) idx=0; if(idx>nodes.length-1) idx=nodes.length-1;
      nodes[idx].classList.add('focused'); nodes[idx].scrollIntoView({block:'nearest'});
      focusedIndex = idx;
    }

    trigger.addEventListener('click', (e)=>{ wrapper.classList.toggle('open'); if(wrapper.classList.contains('open')) focusOption(focusedIndex); });
    trigger.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowDown'){ e.preventDefault(); wrapper.classList.add('open'); focusOption((focusedIndex+1)); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); wrapper.classList.add('open'); focusOption((focusedIndex-1)); }
      else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); const opt = optionsEl.querySelectorAll('.custom-option')[focusedIndex]; if(opt){ opt.click(); } }
      else if(e.key === 'Escape'){ wrapper.classList.remove('open'); }
    });

    optionsEl.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowDown'){ e.preventDefault(); focusOption(focusedIndex+1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); focusOption(focusedIndex-1); }
      else if(e.key === 'Enter'){ e.preventDefault(); const opt = optionsEl.querySelectorAll('.custom-option')[focusedIndex]; if(opt) opt.click(); }
      else if(e.key === 'Escape'){ wrapper.classList.remove('open'); trigger.focus(); }
    });

    // close when clicking outside
    document.addEventListener('click', (ev)=>{ if(!wrapper.contains(ev.target)) wrapper.classList.remove('open'); });

    // insert
    wrapper.appendChild(trigger); wrapper.appendChild(optionsEl);
    sel.parentNode.insertBefore(wrapper, sel.nextSibling);
  }

  // initialize all selects inside controls
  // load saved control prefs then build custom selects
  loadControls();
  // ensure controls class matches loaded test type (fix: avoid leftover grid columns on refresh)
  try{
    if(controlsSection && testTypeSel){
      controlsSection.classList.remove('controls--timer','controls--nontimer');
      controlsSection.classList.add(testTypeSel.value === 'timer' ? 'controls--timer' : 'controls--nontimer');
    }
  }catch(e){}
  document.querySelectorAll('#controlsSection select').forEach(s=> createCustomSelect(s));

  // save whenever user changes a control
  [modeSel, testTypeSel, durationSel, diffSel, wordCountSel].forEach(s => s.addEventListener('change', ()=>{ saveControls(); }));
  customText.addEventListener('input', ()=> saveControls());

  function backToMenu(){
  reset();
  showSection('menu');
  }
  backBtn.addEventListener('click', backToMenu);

  // Robust focus helper: focuses the hidden input without scrolling and places caret at end
  function focusHiddenInput(){
    if(!hiddenInput) return;
    try{
      const style = window.getComputedStyle(hiddenInput);
      if(style.display === 'none' || style.visibility === 'hidden') return;
    }catch(e){ /* ignore */ }
    try{ hiddenInput.focus({ preventScroll: true }); }
    catch(e){ try{ hiddenInput.focus(); }catch(e){} }
    try{
      const len = hiddenInput.value ? hiddenInput.value.length : 0;
      hiddenInput.setSelectionRange(len, len);
    }catch(e){ /* ignore if not supported */ }
  }

  wordsEl.addEventListener('click', focusHiddenInput);
  // focus button removed from DOM; input auto-focus handled by helper

  // Auto-focus the hidden input when user changes selects (so typing can resume)
  [modeSel, testTypeSel, durationSel, diffSel, wordCountSel].forEach(s => {
    if(!s) return;
    s.addEventListener('change', ()=> setTimeout(focusHiddenInput, 0));
  });

  // If the user tabs out of the controls area, focus the typing input (but don't override
  // if focus is moving to another control inside the section)
  if(controlsSection){
    controlsSection.addEventListener('focusout', ()=>{
      setTimeout(()=>{
        const active = document.activeElement;
        if(controlsSection.contains(active)) return;
        focusHiddenInput();
      },0);
    });
  }
  // start is automatic; old modal controls removed

  modeSel.addEventListener('change', ()=>{ customBox.style.display = modeSel.value==='custom' ? 'block' : 'none'; reset(); });
  diffSel.addEventListener('change', reset);
  durationSel.addEventListener('change', ()=>{ timeVal.textContent = durationSel.value; reset(); });
  wordCountSel.addEventListener('change', reset);
  customText.addEventListener('input', ()=>{ if(modeSel.value==='custom') reset(); });

  // theme toggle removed; ensure theme is dark-only

  // ====== Init ======
  setTheme(); saveBest(0); regenWords();
  reset(); // ensure fresh UI
  // autofocus on load (mobile safe)
  setTimeout(()=> hiddenInput.focus(), 200);