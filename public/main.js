/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector('canvas#canvas');
const ctx = canvas.getContext('2d');


ctx.fillStyle = 'rgb(0, 0, 0)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.font = `${canvas.height * 0.8}pt "Arial"`;

ctx.fillStyle = 'rgb(255, 255, 255)';
ctx.fillText('hello', 0, canvas.height - canvas.height * 0.1, canvas.width);
