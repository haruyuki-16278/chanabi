const isDebug = window.location.host.includes('localhost:800');
const apiUrlBase = isDebug ? 'http://localhost:8000/' : 'https://chanabi.deno.dev/';
const xhr = new XMLHttpRequest();

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector('canvas#canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgb(0, 0, 0)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let dots = [];

/**
 * @type {HTMLSelectElement}
 */
const select = document.querySelector('select');

/**
 * @type {HTMLInputElement}
 */
const input = document.querySelector('input#message');
let message = '';
input.addEventListener('change', (ev) => {
  if (!ev.target.value) return;
  console.log(select.value);
  /**
   * @type {string}
   * メッセージ花火で打ち上げる文字列
   */
  message = ev.target.value;
  const len = message.length;
  const rows = Math.ceil(Math.sqrt(len))
  const charSize = (canvas.height) / rows;
  console.log(charSize);

  // 文字の大きさを指定
  if (len > 0) ctx.font = `${charSize}px ${select.value}`;

  // canvasの初期化
  ctx.clearRect(0, 0, canvas.width, canvas.width);
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // canvasに文字列を描画
  ctx.fillStyle = 'rgb(255, 255, 255)';
  const translateFlag = len <= rows * (rows - 1);
  if (translateFlag) ctx.translate(0, canvas.height / (rows * 2));
  for(let i = 0; i < rows; i++) {
    const text = message.substring(i * rows, i * rows + rows);
    console.log(text)
    const textSize = ctx.measureText(text);
    const textBox = {
      h: textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent,
      w: textSize.width
    };
    ctx.fillText(
      text,
      (canvas.width - textBox.w) / 2,
      canvas.height * ((1 + 2 * i) / (rows * 2)) + textBox.h / 2
    );
  }
  if (translateFlag) ctx.translate(0, - canvas.height / (rows * 2));

  // 描画結果の画像から花火ドットを出す位置を計算
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  dots = calcDotPosFromImageData(imageData);

  drawDots(dots);
});

/**
 * 描画結果の画像から花火ドットを出す座標を計算
 * @param {ImageData} ImageData 
 * @returns {Array<Array<Number>>}
 */
const calcDotPosFromImageData = function (imageData) {
  const pixels = imageData.data;
  const res = [];
  const interval = 5;
  for (let i = 0; i < canvas.height; i++) {
    if (i % interval !== 0) continue;
    for (let j = 0; j < canvas.width; j++) {
      if (j % interval !== 0) continue;
      const base = (i * canvas.width + j) * 4;
      if (pixels[base] === 255 && pixels[base + 1] === 255 && pixels[base + 2] === 255) {
        res.push([j, i]);
      }
    }
  }
  return res;
};

/**
 * 座標の配列からドットを描画
 * @param {Array<Array<Number>>} dots
 */
const drawDots = function (dots) {
  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  dots.forEach((dot) => {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`
    ctx.arc(dot[0], dot[1], 2, 0, Math.PI * 2);
    ctx.fill();
  })
};

/**
 * @type {HTMLButtonElement}
 */
const submitButton = document.querySelector('input#submit[type="button"]');
submitButton.addEventListener('click', () => {
  if (!input.value) {
    window.alert('文字列が空です');
    return
  }

  const body = {
    message: input.value,
    dots: dots,
    color: `#${color.red.toString(16)}${color.green.toString(16)}${color.blue.toString(16)}`
  };
  console.log(body);

  // xhrを使ってAPIリクエストを行う
  // 参考: https://kinsta.com/jp/knowledgebase/javascript-http-request/
  xhr.open('post', apiUrlBase + 'message');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      console.log(JSON.parse(xhr.responseText));
      submitButton.blur();
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
  xhr.send(JSON.stringify(body));
})

/**
 * @type {HTMLDivElement}
 */
const colorWindow = document.querySelector('div.color');
/**
 * @type {Array<HTMLInputElement>}
 */
const colorSliders = document.querySelectorAll('input[type="range"]');
const color = {
  red: 51,
  green: 204,
  blue: 255
};
const colorCode = () => `#${('0' + color.red.toString(16)).slice(-2)}${('0' + color.green.toString(16)).slice(-2)}${('0' + color.blue.toString(16)).slice(-2)}`

colorSliders.forEach((colorSlider) => {
  colorSlider.addEventListener('input', (ev) => {
    color[colorSlider.id] = Number(ev.target.value);
    console.log(color, colorCode());
    colorWindow.style.backgroundColor = colorCode();
    drawDots(dots);
  })
})
