// Los papeles de envoltura, iguales a los de la app (`design/Theme.kt` y `design/PaperPattern.kt`).
// Cada uno se dibuja una vez en una loseta cuadrada que el fondo de la página repite.
var PAPERS = {
  lunares: ['#2743A6', '#F7C948', '#F28CA9', 'dots'],
  caramelo: ['#F6EAD7', '#E4572E', '#2A9D8F', 'diagonal'],
  mantel: ['#FBE3E6', '#D7263D', '#D7263D', 'gingham'],
  olas: ['#F6C445', '#1D3557', '#FFFAEB', 'waves'],
  confeti: ['#17665C', '#FFD166', '#FF9FB2', 'confetti'],
  destellos: ['#2E2547', '#F2B5D4', '#F7D06B', 'sparkles'],
  zigzag: ['#E8623F', '#FFF1D6', '#5B2A86', 'zigzag'],
  anillos: ['#CDE9DC', '#2F6B4F', '#F08A4B', 'rings'],
  picado: ['#D4186C', '#FFE9F3', '#FFC93C', 'diamonds'],
  talavera: ['#FBF6E9', '#1F4FA8', '#F2B632', 'tile'],
  sarape: ['#C73A2B', '#F5C542', '#157F78', 'bands'],
  corazones: ['#FFE1DD', '#E63950', '#F59AAA', 'hearts'],
  reyes: ['#1E2A5A', '#F6D55C', '#FFFFFF', 'stars'],
  banderines: ['#FFF3D4', '#F2542D', '#0E9594', 'pennants'],
  cuadricula: ['#FCFCF7', '#9DBFE0', '#EE8A7E', 'grid'],
  terrazo: ['#F1EBE1', '#2D6A6A', '#E07A5F', 'terrazzo']
};

// Devuelve { ground, url } para poner de fondo, o null si el papel no existe o no hay canvas.
function paperTile(id, scale) {
  var paper = PAPERS[id];
  if (!paper || typeof document === 'undefined') return null;
  var u = Math.round(96 * (scale || 1));
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = u;
  var g = canvas.getContext('2d');
  if (!g) return null;
  var ink = paper[1], ink2 = paper[2];

  function dot(color, r, x, y, alpha) { g.globalAlpha = alpha == null ? 1 : alpha; g.fillStyle = color; g.beginPath(); g.arc(x * u, y * u, r * u, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
  function ring(color, r, x, y, w) { g.strokeStyle = color; g.lineWidth = w * u; g.beginPath(); g.arc(x * u, y * u, r * u, 0, Math.PI * 2); g.stroke(); }
  function rect(color, x, y, w, h, alpha) { g.globalAlpha = alpha == null ? 1 : alpha; g.fillStyle = color; g.fillRect(x * u, y * u, w * u, h * u); g.globalAlpha = 1; }
  function line(color, x1, y1, x2, y2, w, cap, alpha) { g.globalAlpha = alpha == null ? 1 : alpha; g.strokeStyle = color; g.lineWidth = w * u; g.lineCap = cap || 'butt'; g.beginPath(); g.moveTo(x1 * u, y1 * u); g.lineTo(x2 * u, y2 * u); g.stroke(); g.globalAlpha = 1; }
  function poly(color, points) { g.fillStyle = color; g.beginPath(); points.forEach(function (p, i) { if (i) g.lineTo(p[0] * u, p[1] * u); else g.moveTo(p[0] * u, p[1] * u); }); g.closePath(); g.fill(); }
  function stroke(color, points, w, join, cap) { g.strokeStyle = color; g.lineWidth = w * u; g.lineJoin = join; g.lineCap = cap || 'butt'; g.beginPath(); points.forEach(function (p, i) { if (i) g.lineTo(p[0] * u, p[1] * u); else g.moveTo(p[0] * u, p[1] * u); }); g.stroke(); }
  function turned(deg, x, y, draw) { g.save(); g.translate(x * u, y * u); g.rotate(deg * Math.PI / 180); g.translate(-x * u, -y * u); draw(); g.restore(); }
  function sparkle(color, x, y, r) {
    var w = r * .22;
    g.fillStyle = color; g.beginPath(); g.moveTo(x * u, (y - r) * u);
    g.quadraticCurveTo((x + w) * u, (y - w) * u, (x + r) * u, y * u);
    g.quadraticCurveTo((x + w) * u, (y + w) * u, x * u, (y + r) * u);
    g.quadraticCurveTo((x - w) * u, (y + w) * u, (x - r) * u, y * u);
    g.quadraticCurveTo((x - w) * u, (y - w) * u, x * u, (y - r) * u);
    g.fill();
  }
  function heart(color, x, y, r) {
    g.fillStyle = color; g.beginPath(); g.moveTo(x * u, (y + r * .9) * u);
    g.bezierCurveTo((x - r * 1.4) * u, (y - r * .1) * u, (x - r * .6) * u, (y - r * 1.1) * u, x * u, (y - r * .35) * u);
    g.bezierCurveTo((x + r * .6) * u, (y - r * 1.1) * u, (x + r * 1.4) * u, (y - r * .1) * u, x * u, (y + r * .9) * u);
    g.fill();
  }
  function star(color, x, y, R) {
    var points = [];
    for (var i = 0; i < 10; i++) { var r = i % 2 ? R * .42 : R, a = -Math.PI / 2 + i * Math.PI / 5; points.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    poly(color, points);
  }

  rect(paper[0], 0, 0, 1, 1);
  var i, k, row, y0, points;
  switch (paper[3]) {
    case 'dots':
      dot(ink, .105, .25, .25); dot(ink, .105, .75, .75); dot(ink2, .05, .75, .25); dot(ink2, .05, .25, .75);
      break;
    case 'diagonal':
      for (k = 0; k <= 5; k++) { line(ink, k / 2, -.05, k / 2 - 1.1, 1.05, .1); line(ink2, k / 2 + .25, -.05, k / 2 + .25 - 1.1, 1.05, .022); }
      break;
    case 'gingham':
      rect(ink, 0, 0, 1, .25, .34); rect(ink, 0, .5, 1, .25, .34); rect(ink, 0, 0, .25, 1, .34); rect(ink, .5, 0, .25, 1, .34);
      break;
    case 'confetti':
      var bits = [.14, .18, 25, .46, .1, -40, .8, .22, 70, .27, .47, -15, .62, .44, 35, .9, .6, -65, .12, .78, 55, .44, .8, 5, .74, .84, -30];
      for (i = 0; i < bits.length; i += 3) (function (x, y, deg, n) {
        var color = n % 2 === 0 ? ink : ink2;
        if (n % 3 === 2) dot(color, .032, x, y); else turned(deg, x, y, function () { rect(color, x - .05, y - .018, .1, .036); });
      })(bits[i], bits[i + 1], bits[i + 2], i / 3);
      break;
    case 'waves':
      for (row = 0; row < 3; row++) {
        y0 = (row + .5) / 3; points = [];
        for (k = -2; k <= 50; k++) points.push([k / 48, y0 + .055 * Math.sin(2 * Math.PI * k / 48 * 2)]);
        stroke(row === 1 ? ink2 : ink, points, .04, 'round', 'round');
      }
      break;
    case 'sparkles':
      sparkle(ink, .26, .28, .13); sparkle(ink2, .74, .72, .1); dot(ink2, .022, .7, .2); dot(ink, .022, .22, .76); dot(ink, .014, .5, .5);
      break;
    case 'zigzag':
      for (row = 0; row < 3; row++) {
        y0 = (row + .5) / 3; points = [];
        for (k = -1; k <= 9; k++) points.push([k / 8, y0 + (k % 2 === 0 ? -1 : 1) * .06]);
        stroke(row === 1 ? ink2 : ink, points, .035, 'miter');
      }
      break;
    case 'rings':
      for (i = 0; i <= 2; i++) for (k = 0; k <= 2; k++) ring(ink, .2, i / 2, k / 2, .028);
      dot(ink2, .045, .25, .25); dot(ink2, .045, .75, .75);
      break;
    case 'diamonds':
      [[.25, .25], [.75, .75]].forEach(function (c) { poly(ink, [[c[0], c[1] - .13], [c[0] + .13, c[1]], [c[0], c[1] + .13], [c[0] - .13, c[1]]]); });
      [[.75, .25], [.25, .75]].forEach(function (c) { dot(ink2, .032, c[0] - .07, c[1]); dot(ink2, .032, c[0] + .07, c[1]); dot(ink2, .032, c[0], c[1] - .07); dot(ink2, .032, c[0], c[1] + .07); });
      break;
    case 'tile':
      dot(ink, .11, .36, .5); dot(ink, .11, .64, .5); dot(ink, .11, .5, .36); dot(ink, .11, .5, .64); dot(ink2, .075, .5, .5);
      ring(ink, .22, 0, 0, .03); ring(ink, .22, 1, 0, .03); ring(ink, .22, 0, 1, .03); ring(ink, .22, 1, 1, .03);
      dot(ink2, .04, .5, 0); dot(ink2, .04, .5, 1); dot(ink2, .04, 0, .5); dot(ink2, .04, 1, .5);
      break;
    case 'bands':
      var bands = [0, .12, 0, .15, .04, 1, .22, .02, 2, .36, .16, 1, .55, .04, 0, .62, .02, 2, .72, .1, 0, .85, .04, 1, .92, .02, 2];
      for (i = 0; i < bands.length; i += 3) rect(bands[i + 2] === 0 ? ink : bands[i + 2] === 1 ? ink2 : '#FFFFFF', 0, bands[i], 1, bands[i + 1], bands[i + 2] === 2 ? .8 : 1);
      break;
    case 'hearts':
      heart(ink, .25, .27, .13); heart(ink2, .75, .77, .1); dot(ink2, .025, .75, .25); dot(ink, .025, .25, .75);
      break;
    case 'stars':
      star(ink, .27, .27, .14); star(ink, .75, .73, .09); dot(ink2, .02, .72, .2); dot(ink2, .02, .2, .75); dot(ink2, .013, .5, .5);
      break;
    case 'pennants':
      for (row = 0; row <= 1; row++) {
        y0 = .08 + .5 * row;
        for (k = 0; k < 4; k++) poly((k + row) % 2 === 0 ? ink : ink2, [[k / 4, y0], [(k + 1) / 4, y0], [(k + .5) / 4, y0 + .2]]);
        line(ink, 0, y0, 1, y0, .014);
      }
      break;
    case 'grid':
      for (k = 0; k < 4; k++) { var at = (k + .5) / 4; line(ink, at, 0, at, 1, .012); line(ink, 0, at, 1, at, .012); }
      dot(ink2, .028, .125, .125); dot(ink2, .028, .625, .625);
      break;
    case 'terrazzo':
      var chips = [.15, .2, 20, .07, .05, 0, .5, .12, -30, .05, .04, 1, .82, .25, 60, .06, .045, 0, .3, .5, -10, .055, .04, 1, .65, .52, 35, .075, .05, 0, .9, .7, -50, .045, .035, 1, .12, .8, 45, .06, .04, 1, .45, .85, -25, .07, .045, 0, .72, .88, 10, .04, .03, 1];
      for (i = 0; i < chips.length; i += 6) (function (x, y, deg, w, h, which) {
        turned(deg, x, y, function () { poly(which === 0 ? ink : ink2, [[x - w, y - h * .6], [x + w * .7, y - h], [x + w, y + h * .5], [x - w * .5, y + h]]); });
      })(chips[i], chips[i + 1], chips[i + 2], chips[i + 3], chips[i + 4], chips[i + 5]);
      break;
  }
  return { ground: paper[0], url: canvas.toDataURL('image/png') };
}

if (typeof module !== 'undefined') module.exports = { PAPERS: PAPERS };
