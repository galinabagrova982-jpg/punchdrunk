// ================================================================
//  ARG ENGINE — "ЦИФРОВОЕ БЕЗУМИЕ"
// ================================================================

const output = document.getElementById('output');
const input  = document.getElementById('cmd');
const glitchOverlay = document.getElementById('glitch-overlay');

// ---- ПАМЯТЬ ИГРЫ ----
const state = {
  visited: 0,
  flags: new Set(),
  startTime: Date.now(),
};

// ---- "ИМЯ" ПОЛЬЗОВАТЕЛЯ (генерируется из localStorage) ----
function getVisitorName() {
  let name = localStorage.getItem('visitor_name');
  if (!name) {
    const hex = () => Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
    name = `СУБЪЕКТ_${hex()}-${hex()}`;
    localStorage.setItem('visitor_name', name);
  }
  return name;
}
document.getElementById('visitor-name').textContent = getVisitorName();

// ---- УТИЛИТЫ ----
function print(text, cls = '') {
  const p = document.createElement('p');
  p.className = 'line ' + cls;
  p.innerHTML = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
  return p;
}

function printSlow(text, cls = '', delay = 35) {
  return new Promise(resolve => {
    const p = document.createElement('p');
    p.className = 'line ' + cls;
    output.appendChild(p);
    let i = 0;
    const t = setInterval(() => {
      p.textContent = text.slice(0, ++i);
      output.scrollTop = output.scrollHeight;
      if (i >= text.length) {
        clearInterval(t);
        resolve(p);
      }
    }, delay);
  });
}

function triggerGlitch(duration = 500) {
  glitchOverlay.classList.add('active');
  setTimeout(() => glitchOverlay.classList.remove('active'), duration);
}

function beep(freq = 220, dur = 80) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.value = 0.02;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur / 1000);
  } catch (e) {}
}

// ---- КОМАНДЫ ----
const commands = {

  help: () => {
    print('Доступные команды:', 'system');
    print('&nbsp;&nbsp;<code>help</code> — этот список');
    print('&nbsp;&nbsp;<code>whoami</code> — кто ты');
    print('&nbsp;&nbsp;<code>ls</code> — файлы в текущем узле');
    print('&nbsp;&nbsp;<code>cat [файл]</code> — прочитать файл');
    print('&nbsp;&nbsp;<code>signal</code> — прослушать сигнал');
    print('&nbsp;&nbsp;<code>decode</code> — расшифровать перехват');
    print('&nbsp;&nbsp;<code>exit</code> — попытаться выйти');
    print('&nbsp;<span class="dim">Некоторые команды скрыты. Они появятся, когда ты будешь готов.</span>', 'dim');
  },

  whoami: () => {
    print(`Ты — ${getVisitorName()}.`, 'system');
    print('Или ты так думаешь.', 'whisper');
    state.flags.add('whoami');
  },

  ls: () => {
    print('УЗЕЛ_7/', 'system');
    const files = ['signal.log', 'manifest.txt', 'ПОМНИ.txt', '...дальше ничего нет'];
    files.forEach(f => print('&nbsp;&nbsp;' + f));
    print('<span class="dim">Один файл скрыт. Попробуй: cat ПОМНИ.txt</span>', 'dim');
  },

  'cat signal.log': () => {
    print('> ЧТЕНИЕ signal.log...', 'system');
    setTimeout(() => {
      print('[00:03] ...шум...', 'dim');
      print('[00:11] "он не должен был это найти"', 'whisper');
      print('[00:19] <span class="err">ПОТЕРЯ СИГНАЛА</span>');
      print('[00:44] ...шум...', 'dim');
      print('[01:02] ОНИ СЛЫШАТ ТЕБЯ', 'err');
      triggerGlitch(800);
      beep(110, 400);
    }, 600);
  },

  'cat manifest.txt': () => {
    print('> ЧТЕНИЕ manifest.txt...', 'system');
    setTimeout(() => {
      print('Это не игра.', '');
      print('Это <span class="glitch-text" data-text="ПРИГЛАШЕНИЕ">ПРИГЛАШЕНИЕ</span>.', '');
      print('Чтобы войти — произнеси имя, которое ты никогда не говорил.', 'dim');
      print('<span class="dim">Команда: say [имя]</span>', 'dim');
    }, 500);
  },

  'cat ПОМНИ.txt': () => {
    print('> ЧТЕНИЕ ПОМНИ.txt...', 'system');
    setTimeout(() => {
      print('7-7-7', 'err');
      print('Не оборачивайся.', 'whisper');
      state.flags.add('pomni');
      triggerGlitch(1200);
    }, 500);
  },

  signal: () => {
    print('> ПРОСЛУШИВАНИЕ...', 'system');
    let i = 0;
    const chars = '▁▂▃▄▅▆▇█▇▆▅▄▃▂▁';
    const wave = setInterval(() => {
      print(chars[Math.floor(Math.random() * chars.length)].repeat(40), 'dim');
      if (++i > 6) {
        clearInterval(wave);
        print('...в сигнале спрятано слово.', 'whisper');
        print('<span class="dim">Найди его: decode</span>', 'dim');
      }
    }, 150);
    beep(300, 200);
  },

  decode: () => {
    print('> ДЕКОДИРОВАНИЕ...', 'system');
    setTimeout(() => print('> 7 15 4 21 19 20', 'dim'), 400);
    setTimeout(() => print('> Подсказка: A=1, B=2, ... Я=33', 'dim'), 900);
    setTimeout(() => print('> Введи: answer [слово]', 'dim'), 1400);
    state.flags.add('decode');
  },

  exit: () => {
    print('Попытка выхода...', 'system');
    setTimeout(() => print('<span class="err">ОТКАЗАНО. ТЫ УЖЕ ВНУТРИ.</span>'), 700);
    triggerGlitch(1000);
    beep(80, 600);
  },
};

// ---- СПЕЦИАЛЬНАЯ ОБРАБОТКА ----
function processCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;

  print('&gt; ' + raw, 'user');
  beep(180, 40);

  // Прямое совпадение
  if (commands[cmd]) {
    commands[cmd]();
    return;
  }

  // "say [имя]"
  if (cmd.startsWith('say ')) {
    const name = raw.slice(4).trim();
    if (name.toLowerCase() === 'седьмой' || name.toLowerCase() === 'seventh') {
      secretEnding();
    } else {
      print(`"${name}"... нет. Это не то имя.`, 'dim');
      print('Попробуй ещё раз.', 'whisper');
    }
    return;
  }

  // "answer [слово]"
  if (cmd.startsWith('answer ')) {
    const word = cmd.slice(7).trim();
    if (word === 'godust' || word === 'годуст') {
      print('ВЕРНО.', 'ok');
      print('Ты слышишь нас. Мы слышим тебя.', 'whisper');
      state.flags.add('answer');
      secretEnding();
    } else {
      print('Неверно. Слушай внимательнее.', 'err');
    }
    return;
  }

  // Скрытая команда "7"
  if (cmd === '7') {
    print('...', 'dim');
    print('Ты нашёл СЕДЬМОЙ узел.', '');
    print('Теперь ты — <span class="err">ЧАСТЬ СИГНАЛА</span>.', 'err');
    state.flags.add('seven');
    triggerGlitch(2000);
    return;
  }

  print(`Команда "${raw}" не распознана. Введи <code>help</code>.`, 'dim');
}

// ---- СЕКРЕТНАЯ КОНЦОВКА ----
async function secretEnding() {
  triggerGlitch(3000);
  beep(60, 1000);
  await printSlow('ВНИМАНИЕ: ПРОТОКОЛ СЕДЬМОГО АКТИВИРОВАН', 'err', 25);
  await printSlow('...', 'dim', 200);
  await printSlow('ты слышишь это?', 'whisper', 80);
  await printSlow('мы всегда были здесь.', 'whisper', 80);
  await printSlow('спасибо, что открыл глаза.', 'whisper', 80);

  // Оставляем "артефакт" в localStorage — секрет для посвящённых
  localStorage.setItem('initiated', 'true');
  print('<span class="ok">// Ты посвящён. Метка сохранена.</span>', 'ok');
}

// ---- СОБЫТИЯ ----
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = input.value;
    input.value = '';
    processCommand(val);
  }
});

// Фокус на клик
document.body.addEventListener('click', () => input.focus());

// ---- СЛУЧАЙНЫЕ ГЛИТЧИ (атмосфера безумия) ----
setInterval(() => {
  if (Math.random() < 0.15) {
    triggerGlitch(150);
  }
}, 4000);

// ---- СЛУЧАЙНЫЙ ШЁПОТ ----
const whispers = [
  'ты не один',
  'обернись',
  'мы видим тебя',
  '7',
  'не выключай',
  'он врёт',
];
setInterval(() => {
  if (Math.random() < 0.1) {
    print(whispers[Math.floor(Math.random() * whispers.length)], 'whisper');
  }
}, 12000);

// ---- ПРИВЕТСТВИЕ В КОНСОЛИ (для разработчиков) ----
console.log(
  '%cТЫ НАШЁЛ КОНСОЛЬ. ХОРОШО.\\n%cВведи: "7" в терминале — но не говори никому.',
  'color:#ff0033;font-family:monospace;font-size:14px;',
  'color:#c8ffc8;font-family:monospace;font-size:12px;'
);

// ---- СЧЁТЧИК ПОСЕЩЕНИЙ ----
state.visited = parseInt(localStorage.getItem('visits') || '0') + 1;
localStorage.setItem('visits', state.visited);
if (state.visited > 3) {
  setTimeout(() => print(`Это твой ${state.visited}-й визит. Мы считаем.`, 'dim'), 3000);
}
