document.addEventListener('DOMContentLoaded', () => {

  /* ============ 元素引用 ============ */
  const line2 = document.getElementById('line2');
  const emojiLayer = document.getElementById('emojiLayer');
  const cakeButton = document.getElementById('cakeButton');
  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');
  const letterContent = document.getElementById('letterContent');
  const videoSection = document.getElementById('videoSection');
  const continueHint = document.getElementById('continueHint');
  const bgm = document.getElementById('bgm');
  const bgmToggle = document.getElementById('bgmToggle');
  const bgmIcon = bgmToggle.querySelector('.bgm-icon');

  /* =========================================================
     背景音乐：常驻播放
     手机浏览器规定网页不能在用户操作前自动出声，
     所以第一次点击页面任意位置时才会开始播放。
     右上角 🔊 按钮可以随时暂停/继续。
  ========================================================= */
  let bgmStarted = false;

  function updateBgmIcon() {
    bgmIcon.textContent = bgm.paused ? '🔇' : '🔊';
  }

  function tryStartBgm() {
    if (bgmStarted) return;
    bgmStarted = true;
    bgm.volume = 0.55;
    bgm.play().then(updateBgmIcon).catch(() => { /* 还没放音乐文件时会失败，忽略即可 */ });
  }

  document.addEventListener('click', tryStartBgm, { once: true });

  bgmToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!bgmStarted) {
      tryStartBgm();
      return;
    }
    if (bgm.paused) {
      bgm.play().catch(() => {});
    } else {
      bgm.pause();
    }
    updateBgmIcon();
  });

  bgm.addEventListener('play', updateBgmIcon);
  bgm.addEventListener('pause', updateBgmIcon);

  /* ============ 第一页：打字机效果 ============ */
  function typewriterLine2(text, speed, onDone) {
    let i = 0;
    const timer = setInterval(() => {
      line2.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        line2.classList.add('done');
        if (onDone) onDone();
      }
    }, speed);
  }

  /* ============ emoji 掉落 ============ */
  const EMOJIS = ['🎉', '🎈', '🎊', '✨', '🌟', '💖', '🎁', '🍰', '🌸', '💫'];
  let rainTimer = null;

  function spawnEmoji() {
    const span = document.createElement('span');
    span.className = 'falling-emoji';
    span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    span.style.left = Math.random() * 96 + 'vw';
    const duration = 3.2 + Math.random() * 2.4;
    span.style.animationDuration = duration + 's';
    span.style.fontSize = (1.3 + Math.random() * 1.4) + 'rem';
    emojiLayer.appendChild(span);
    setTimeout(() => span.remove(), duration * 1000 + 200);
  }

  function startRain(intervalMs) {
    if (rainTimer) clearInterval(rainTimer);
    rainTimer = setInterval(spawnEmoji, intervalMs);
  }

  /* ============ 第一页流程 ============ */
  setTimeout(() => {
    typewriterLine2('生日快乐！！！', 170, () => {
      startRain(220);
      setTimeout(() => {
        startRain(850);
        cakeButton.classList.add('show');
      }, 3200);
    });
  }, 1600);

  /* ============ 点击蛋糕，进入信件页 ============ */
  cakeButton.addEventListener('click', () => {
    if (rainTimer) clearInterval(rainTimer);
    page1.classList.add('exit');
    setTimeout(() => {
      page1.classList.remove('active');
      page2.classList.add('active');
      document.body.classList.add('on-letter');
      window.scrollTo(0, 0);
      startLetter();
    }, 650);
  }, { once: true });

  /* =========================================================
     第二页：信件逐段揭示
     每段文字逐字渐变出现，一整段出现完后，
     轻触屏幕再出现下一段，以此类推。
     再次轻触"仍在打字"的段落，会让这段文字立刻完整显示（跳过动画）。
  ========================================================= */
  const LETTER_LINES = [
    '致我那个总是一个人扛着事的好友：',
    '一眨眼你就也20岁啦，还记得我们刚认识时也才18岁的年龄、一起奋斗高考，那会我以为自己可能也不会再交什么新朋友了，毕竟都已经是最后一年了。',
    '然后或许是缘分？你就这样突然出现、闯入了我的生活！当时你主动找我借书看，那本书现在想想还是挺适合你的？因为讲的课题分离那些很实用的、能从自己身上出发并实践的内容。',
    '上一年你过生日，我给你送了拼图，那会经费实在有限T^T，今天给你用心准备了这个网站以及你收到的生日礼物，至于我如何制作的这个网站……这是个秘密！不告诉你^ ^',
    '提醒：其实这网站你可以存起来，那样之后你就可以在手机上每次想起来时，都能随时随地查看啦！',
    '有点跑题了！总之，我很感谢你能够在我们认识的这段时间一直支持我，以及一直支持我和柏源的感情😭我相信他肯定也很高兴我能够拥有你这样的朋友！',
    '听到你说你生日期间可能会去珠海旅游时，我还是有点失落又有些高兴的，毕竟我自己其实也很想去珠海玩，我之前也和你说过我很想去珠海长隆玩，不过你知道我总是存不下钱，所以更多的还是高兴你能够去珠海那好好放松！',
    '这就是我为什么特意给你准备了这份生日礼物的原因——！请查收接下来的视频^ ^'
  ];

  const CHAR_SPEED = 55; // 每个字之间的间隔（毫秒），数值越小打字越快

  let letterStarted = false;
  let letterFinished = false;
  let currentIndex = -1;
  let isTyping = false;
  let typingTimer = null;

  function typeParagraph(text, el, onComplete) {
    isTyping = true;
    // 用 Array.from 按 Unicode 码位拆分，避免把 emoji（比如 😭）拆成乱码
    const chars = Array.from(text);
    chars.forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      el.appendChild(span);
    });
    const spans = el.querySelectorAll('.char');
    let i = 0;
    function revealNext() {
      if (i >= spans.length) {
        isTyping = false;
        onComplete();
        return;
      }
      spans[i].classList.add('show');
      i++;
      typingTimer = setTimeout(revealNext, CHAR_SPEED);
    }
    revealNext();
  }

  function finishTypingInstantly() {
    clearTimeout(typingTimer);
    typingTimer = null;
    const currentEl = letterContent.lastElementChild;
    if (currentEl) {
      currentEl.querySelectorAll('.char').forEach((s) => s.classList.add('show'));
    }
    isTyping = false;
  }

  function showContinueHint() {
    continueHint.classList.add('show');
  }

  function hideContinueHint() {
    continueHint.classList.remove('show');
  }

  function revealVideoSection() {
    hideContinueHint();
    letterFinished = true;
    setTimeout(() => {
      videoSection.style.display = 'block';
      requestAnimationFrame(() => videoSection.classList.add('show'));
      videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  function showNextParagraph() {
    currentIndex++;
    if (currentIndex >= LETTER_LINES.length) {
      revealVideoSection();
      return;
    }
    hideContinueHint();
    const p = document.createElement('p');
    p.className = 'letter-line';
    letterContent.appendChild(p);

    typeParagraph(LETTER_LINES[currentIndex], p, () => {
      showContinueHint();
    });
    p.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function startLetter() {
    if (letterStarted) return;
    letterStarted = true;
    showNextParagraph();
  }

  page2.addEventListener('click', (e) => {
    if (letterFinished) return;
    if (!letterStarted) return;
    if (isTyping) {
      finishTypingInstantly();
      showContinueHint();
    } else {
      showNextParagraph();
    }
  });
});
