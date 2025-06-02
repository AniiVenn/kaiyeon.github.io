// 音乐可视化
const audio = document.getElementById('audio1');
const canvas = document.getElementById('visual-canvas');
if (audio && canvas) {
  const ctx = canvas.getContext('2d');
  let audioCtx, analyser, source, dataArray, bufferLength, animationId;

  function setupAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 64;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }

  function draw() {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] * 0.8;
      ctx.fillStyle = `hsl(${120 + i * 2}, 70%, 60%)`;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth * 0.7, barHeight);
    }
    animationId = requestAnimationFrame(draw);
  }

  audio.addEventListener('play', () => {
    setupAudio();
    audioCtx.resume();
    draw();
  });
  audio.addEventListener('pause', () => cancelAnimationFrame(animationId));
  audio.addEventListener('ended', () => cancelAnimationFrame(animationId));
}

const firstTime = parseFloat(lines[0].getAttribute('data-time'));
if (current < firstTime) {
  // 让第一句歌词紧贴歌词区顶部
  const activeSpan = lines[0];
  const scrollY = activeSpan.offsetTop;
  lyricContent.style.transform = `translateY(-${scrollY}px)`;
  return;
}

lines.forEach((span, idx) => {
  if (idx === curIdx) {
    if (!span.classList.contains('active')) {
      span.classList.add('active');
      // 重新触发动画
      span.style.animation = 'none';
      // 强制重绘
      void span.offsetWidth;
      span.style.animation = '';
    }
  } else {
    span.classList.remove('active');
    span.style.animation = 'none';
  }
});

function parseLRC(lrc) {
  const lines = lrc.split(/\\r?\\n/);
  const result = [];
  for (const line of lines) {
    const match = line.match(/^\\[(\\d{2}):(\\d{2})\\.(\\d{2})\\](.*)$/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3]);
      const time = min * 60 + sec + ms / 100;
      result.push({ time, text: match[4].trim() });
    }
  }
  // 按时间升序排序（防止LRC乱序）
  result.sort((a, b) => a.time - b.time);
  result = result.filter(item => item.text && item.text.trim() !== '' && item.text !== 'he');
  return result;
}

function renderLRC(lrcArr) {
  const lyricContent = document.getElementById('lyricContent');
  lyricContent.innerHTML = '';
  lrcArr.forEach((item, idx) => {
    const span = document.createElement('span');
    span.textContent = item.text;
    span.setAttribute('data-time', item.time);
    lyricContent.appendChild(span);
  });
}

function setupLrcSync(lrcArr) {
  const audio = document.getElementById('audio1');
  const lyricContent = document.getElementById('lyricContent');
  const lines = Array.from(lyricContent.querySelectorAll('span'));
  if (!audio || !lyricContent || lines.length === 0) return;
  function syncLyric() {
    const current = audio.currentTime;
    let curIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      const t = parseFloat(lines[i].getAttribute('data-time'));
      if (current >= t) curIdx = i;
    }
    lines.forEach((span, idx) => {
      if (idx === curIdx) {
        span.classList.add('active');
      } else {
        span.classList.remove('active');
      }
    });
    // 滚动到当前行（可选）
    const activeSpan = lines[curIdx];
    const lyricBlock = lyricContent.parentElement;
    const targetY = activeSpan.offsetTop + activeSpan.offsetHeight / 2 - lyricBlock.clientHeight * 0.7;
    const totalHeight = lyricContent.scrollHeight - lyricBlock.clientHeight;
    const scrollY = Math.max(0, Math.min(targetY, totalHeight));
    lyricContent.style.transform = `translateY(-${scrollY}px)`;
  }
  audio.addEventListener('timeupdate', syncLyric);
  audio.addEventListener('seeked', syncLyric);
  audio.addEventListener('play', syncLyric);
  audio.addEventListener('pause', syncLyric);
  syncLyric();
}

const lrcText = `
[00:00.00]作曲: Cj obassey / Tay Iwar / Timothy Oyesanya
[00:43.00]And after all you did
[00:46.00]It feels like chasing wind
[00:49.00]You still don't have the bills
[00:52.00]To pay for your sins
[00:55.00]And back when it started
[00:58.00]You thought that it would be
[01:01.00]A dream reality
[01:04.00]But nothing's ever what it seems
[01:07.00]Sometimes life come around
[01:10.00]And it hit you from both sides
[01:13.00]One minute you're up
[01:16.00]Then you're down in no time
[01:19.00]Takes a lot for me to get back to my right mind
[01:22.00]Someone tell the devil he can never control mine
[01:25.00]Melodies a come from Jah
[01:28.00]And I stay connected no matter how far
[01:31.00]No man fi ever interrupt the divine
[01:34.00]Pour the oil upon me and make me forehead shine like Woah
[01:37.00]I hope my mama knows that I'll be alright
[01:40.00]Cause every day I see the worry in her eyes
[01:43.00]But when I make it to the highest height
[01:46.00]I hope the moment will be frozen in time
[01:49.00]So they can all see your boy done did it
[01:52.00]And there can never be another like he
[01:55.00]Been manifesting what she praying for me
[01:58.00]Enemies all try fashion different weapons
[02:01.00]Dem no fi ever prosper
[02:04.00]Nuffa dem a know say Timmy Turnup
[02:07.00]Afi mashup d place in seconds
[02:10.00]Dem no fit ever stop am
[02:13.00]This a healing music
[02:16.00]I'm a musical doctor medicate your soul
[02:19.00]While the riddim is proper
[02:22.00]Highly recommended fi your sons and daughters
[02:25.00]Ain't nobody make 'em feel this way since Chaka
[02:28.00]Deep inna the chakra yuh
[02:31.00]Many things wey man dey see, we no fit talk am finish
[02:34.00]But we still gonna keep it movin with enough confidence
[02:37.00]Did it the most
[02:40.00]Did it the best
[02:43.00]Did it with too much finesse
[02:46.00]So you can see I'm not the type that you could try to finesse
[02:49.00]Oh no
[02:52.00]And if you got a problem
[02:55.00]I'll be with my dargs dem
[02:58.00]You might not last a day inna the place we come from
[03:01.00]You better keep running and maybe
[03:04.00]You'll get to where you wanna go too
[03:07.00]It's what they told you
[03:10.00]And after all you did
[03:13.00]It feels like chasing wind
[03:16.00]You still don't have the bills
[03:19.00]To pay for your sins
[03:22.00]And back when it started
[03:25.00]You thought that it would be
[03:28.00]A dream reality
[03:31.00]But nothing's ever what it seems
`;

function renderLyrics(lyrics) {
  const lyricContent = document.getElementById('lyricContent');
  if (!lyricContent) {
    console.log('未找到lyricContent容器');
    return;
  }
  lyricContent.innerHTML = '';
  console.log('渲染歌词', lyrics);
  lyrics.forEach(line => {
    const span = document.createElement('span');
    span.textContent = line;
    lyricContent.appendChild(span);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const lrcArr = parseLRC(lrcText);
  renderLRC(lrcArr);
  setupLrcSync(lrcArr);
});

function layoutWillowSubtitle() {
  const subtitle = document.getElementById('needleSubtitle');
  if (!subtitle) return;
  // 先清理所有行，合并所有span到一个数组
  const allSpans = Array.from(subtitle.querySelectorAll('span')).filter(s => s.textContent.trim());
  // 容器宽高
  const width = 420, height = 420;
  subtitle.style.position = 'relative';
  subtitle.style.width = width + 'px';
  subtitle.style.height = height + 'px';
  // 主干参数
  const trunkX = width / 2;
  const trunkY0 = 10;
  const trunkY1 = height - 40;
  // 分支参数
  const branchCount = 5; // 分几组分支
  const branchAmplitude = 90; // 最大左右摆幅
  const branchLength = Math.floor(allSpans.length / branchCount);
  // 分配字母到分支
  let idx = 0;
  for (let b = 0; b < branchCount; b++) {
    const startY = trunkY0 + (trunkY1 - trunkY0) * (b / branchCount);
    const endY = trunkY0 + (trunkY1 - trunkY0) * ((b + 1) / branchCount);
    const angle = (b - (branchCount-1)/2) * 0.5; // 分支弯曲角度
    for (let j = 0; j < branchLength && idx < allSpans.length; j++, idx++) {
      const t = j / branchLength;
      // 主干y
      const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 18;
      // 分支x
      const x = trunkX + Math.sin(t * Math.PI) * branchAmplitude * Math.sign(angle) * Math.abs(angle) + Math.sin(angle) * 18;
      const span = allSpans[idx];
      span.style.position = 'absolute';
      span.style.left = (x - 12) + 'px';
      span.style.top = (y - 8) + 'px';
    }
  }
  // 剩余字母（主干底部）
  while (idx < allSpans.length) {
    const y = trunkY1 + (idx - branchCount * branchLength) * 18;
    const x = trunkX;
    const span = allSpans[idx];
    span.style.position = 'absolute';
    span.style.left = (x - 12) + 'px';
    span.style.top = (y - 8) + 'px';
    idx++;
  }
}
layoutWillowSubtitle();

// 在黑胶右半边添加竖直波浪排列的英文单词
function addWavyWords() {
    const words = ['rock', 'rap', 'afro', 'pop', 'jazz', 'soul', 'funk', 'rnb'];
    const group = new THREE.Group();
    const baseX = 1.7; // 右侧偏移
    const baseY = TURNTABLE_Y + 0.1;
    const baseZ = 0;
    const wordCount = words.length;
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.152.2/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        for (let i = 0; i < wordCount; i++) {
            const word = words[i];
            const y = baseY + i * 0.45;
            const wave = Math.sin(i * 0.7) * 0.3;
            const textGeometry = new THREE.TextGeometry(word, {
                font: font,
                size: 0.22,
                height: 0.03,
                curveSegments: 8,
                bevelEnabled: false
            });
            textGeometry.center();
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00e6c3 });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(baseX + wave, y, baseZ);
            textMesh.rotation.y = -Math.PI / 2.5; // 轻微朝向中心
            group.add(textMesh);
        }
        scene.add(group);
    });
}
addWavyWords();

// 在黑胶上方添加不规则的蓝绿色线条和点阵
function addArtisticLines() {
    const group = new THREE.Group();
    const centerY = TURNTABLE_Y + 0.25; // 悬浮在黑胶上方
    const radiusMin = 0.6;
    const radiusMax = 1.4;
    const angleStart = Math.PI * 0.1;
    const angleEnd = Math.PI * 1.9;
    const dotColor = new THREE.Color(0x00e6c3); // 蓝绿色
    const dotMaterial = new THREE.PointsMaterial({ color: dotColor, size: 0.025 });
    const dots = [];
    // 生成极坐标点阵
    for (let r = radiusMin; r < radiusMax; r += 0.03) {
        for (let a = angleStart; a < angleEnd; a += 0.025 + Math.random() * 0.01) {
            // 随机决定是否绘制点，制造不规则性
            if (Math.random() > 0.82) continue;
            const x = r * Math.cos(a);
            const z = r * Math.sin(a);
            dots.push(x, centerY, z);
        }
    }
    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
    const points = new THREE.Points(dotGeometry, dotMaterial);
    group.add(points);
    // 可选：添加部分极坐标线条
    for (let i = 0; i < 8; i++) {
        const angle = angleStart + (angleEnd - angleStart) * Math.random();
        const linePoints = [];
        for (let r = radiusMin; r < radiusMax; r += 0.02) {
            const x = r * Math.cos(angle) + (Math.random() - 0.5) * 0.01;
            const z = r * Math.sin(angle) + (Math.random() - 0.5) * 0.01;
            linePoints.push(new THREE.Vector3(x, centerY, z));
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00e6c3, linewidth: 2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
    }
    scene.add(group);
}
addArtisticLines();

// 在needle pixel下方添加白色芦苇草
function addWhiteWillowGrass() {
    // 选择needle pixel标题元素
    const needleTitle = document.getElementById('needleTitle');
    if (!needleTitle) return;
    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '320');
    svg.setAttribute('height', '90');
    svg.style.position = 'absolute';
    svg.style.left = '50%';
    svg.style.top = '160px';
    svg.style.transform = 'translateX(-50%)';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '2';
    // 生成多根芦苇草
    for (let i = 0; i < 18; i++) {
        const x = 30 + i * 15 + Math.random() * 8;
        const y1 = 80;
        const y2 = 40 + Math.random() * 18;
        const cx = x + (Math.random() - 0.5) * 18;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x},${y1} Q${cx},${y2} ${x},10`);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '2.2');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.92');
        svg.appendChild(path);
    }
    document.body.appendChild(svg);
}
addWhiteWillowGrass();