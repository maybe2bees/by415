document.addEventListener('DOMContentLoaded', () => {

  /* ============ 元素引用 ============ */
  const line2 = document.getElementById('line2');
  const emojiLayer = document.getElementById('emojiLayer');
  const cakeButton = document.getElementById('cakeButton');
  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');
  const letterContent = document.getElementById('letterContent');
  const videoSection = document.getElementById('videoSection');
  const paperSound = document.getElementById('paperSound');

  /* ============ 第一页：打字机效果 ============ */
  function typewriter(el, text, speed, onDone) {
    let i = 0;
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        el.classList.add('done');
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
    typewriter(line2, '生日快乐！！！', 170, () => {
      // 文字出现后，emoji开始密集掉落
      startRain(220);
      // 掉落一段时间后，转为轻柔的持续飘落，同时显示蛋糕按钮
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
      window.scrollTo(0, 0);
      startLetter();
    }, 650);
  }, { once: true });

  /* ============ 第二页：信件逐段浮现 ============ */
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

  let letterStarted = false;

  function playPaperSound() {
    if (!paperSound) return;
    try {
      paperSound.currentTime = 0;
      const p = paperSound.play();
      if (p && p.catch) p.catch(() => { /* 没有音频文件也不影响正常使用 */ });
    } catch (e) { /* 忽略 */ }
  }

  function startLetter() {
    if (letterStarted) return;
    letterStarted = true;

    let i = 0;
    function nextLine() {
      if (i >= LETTER_LINES.length) {
        setTimeout(() => {
          videoSection.style.display = 'block';
          requestAnimationFrame(() => videoSection.classList.add('show'));
          videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
        return;
      }

      const p = document.createElement('p');
      p.className = 'letter-line';
      p.textContent = LETTER_LINES[i];
      letterContent.appendChild(p);

      playPaperSound();
      requestAnimationFrame(() => p.classList.add('show'));
      p.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const readTime = 900 + Math.min(LETTER_LINES[i].length * 45, 4200);
      i++;
      setTimeout(nextLine, readTime);
    }
    nextLine();
  }
});
