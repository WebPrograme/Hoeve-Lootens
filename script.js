// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1 - 79
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

// Edge (based on chromium) detection
var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

if (isIE){
  var alert = document.querySelector('.alert-browser')
  alert.style.display = 'block'
}

document.getElementById('januariNext').addEventListener('click', januariNext);
document.getElementById('januariPrev').addEventListener('click', januariPrev);
document.getElementById('februariNext').addEventListener('click', februariNext);
document.getElementById('februariPrev').addEventListener('click', februariPrev);
document.getElementById('maartNext').addEventListener('click', maartNext);
document.getElementById('maartPrev').addEventListener('click', maartPrev);
document.getElementById('aprilNext').addEventListener('click', aprilNext);
document.getElementById('aprilPrev').addEventListener('click', aprilPrev);
document.getElementById('meiNext').addEventListener('click', meiNext);
document.getElementById('meiPrev').addEventListener('click', meiPrev);
document.getElementById('juniNext').addEventListener('click', juniNext);
document.getElementById('juniPrev').addEventListener('click', juniPrev);
document.getElementById('juliNext').addEventListener('click', juliNext);
document.getElementById('juliPrev').addEventListener('click', juliPrev);
document.getElementById('augustusNext').addEventListener('click', augustusNext);
document.getElementById('augustusPrev').addEventListener('click', augustusPrev);
document.getElementById('septemberNext').addEventListener('click', septemberNext);
document.getElementById('septemberPrev').addEventListener('click', septemberPrev);
document.getElementById('oktoberNext').addEventListener('click', oktoberNext);
document.getElementById('oktoberPrev').addEventListener('click', oktoberPrev);
document.getElementById('novemberNext').addEventListener('click', novemberNext);
document.getElementById('novemberPrev').addEventListener('click', novemberPrev);
document.getElementById('decemberNext').addEventListener('click', decemberNext);
document.getElementById('decemberPrev').addEventListener('click', decemberPrev);

function januariNext(){
  document.getElementById('januari').style.display='none';
  document.getElementById('februari').style.display='block';
}

function januariPrev(){
  document.getElementById('januari').style.display='none';
  document.getElementById('december').style.display='block';
}

function februariNext(){
  document.getElementById('februari').style.display='none';
  document.getElementById('maart').style.display='block';
}

function februariPrev(){
  document.getElementById('februari').style.display='none';
  document.getElementById('januari').style.display='block';
}

function maartNext(){
  document.getElementById('maart').style.display='none';
  document.getElementById('april').style.display='block';
}

function maartPrev(){
  document.getElementById('maart').style.display='none';
  document.getElementById('februari').style.display='block';
}

function aprilNext(){
  document.getElementById('april').style.display='none';
  document.getElementById('mei').style.display='block';
}

function aprilPrev(){
  document.getElementById('april').style.display='none';
  document.getElementById('maart').style.display='block';
}

function meiNext(){
  document.getElementById('mei').style.display='none';
  document.getElementById('juni').style.display='block';
}

function meiPrev(){
  document.getElementById('mei').style.display='none';
  document.getElementById('april').style.display='block';
}

function juniNext(){
  document.getElementById('juni').style.display='none';
  document.getElementById('juli').style.display='block';
}

function juniPrev(){
  document.getElementById('juni').style.display='none';
  document.getElementById('mei').style.display='block';
}

function juliNext(){
  document.getElementById('juli').style.display='none';
  document.getElementById('augustus').style.display='block';
}

function juliPrev(){
  document.getElementById('juli').style.display='none';
  document.getElementById('juni').style.display='block';
}

function augustusNext(){
  document.getElementById('augustus').style.display='none';
  document.getElementById('september').style.display='block';
}

function augustusPrev(){
  document.getElementById('augustus').style.display='none';
  document.getElementById('juli').style.display='block';
}

function septemberNext(){
  document.getElementById('september').style.display='none';
  document.getElementById('oktober').style.display='block';
}

function septemberPrev(){
  document.getElementById('september').style.display='none';
  document.getElementById('augustus').style.display='block';
}

function oktoberNext(){
  document.getElementById('oktober').style.display='none';
  document.getElementById('november').style.display='block';
}

function oktoberPrev(){
  document.getElementById('oktober').style.display='none';
  document.getElementById('september').style.display='block';
}

function novemberNext(){
  document.getElementById('november').style.display='none';
  document.getElementById('december').style.display='block';
}

function novemberPrev(){
  document.getElementById('november').style.display='none';
  document.getElementById('oktober').style.display='block';
}

function decemberNext(){
  document.getElementById('december').style.display='none';
  document.getElementById('januari').style.display='block';
}

function decemberPrev(){
  document.getElementById('december').style.display='none';
  document.getElementById('november').style.display='block';
}