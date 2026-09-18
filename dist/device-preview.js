// Presentation-only wrapper. The app runs independently at /app.html.
const stage = document.querySelector('.preview-stage');
const frame = document.querySelector('#app-preview');
const appLink = document.querySelector('#open-app');
function fitDevice() {
  const style = getComputedStyle(stage);
  const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 8;
  const availableHeight = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - document.querySelector('.preview-footer').offsetHeight - parseFloat(style.gap);
  stage.style.setProperty('--device-scale', Math.min(1, availableWidth / 414, availableHeight / 868));
}
function loadRoute() {
  const hash = /^#(?:home|feed(?:\/[a-z]+)?)$/.test(location.hash) ? location.hash : '#feed';
  frame.src = '/app.html' + hash;
  appLink.href = '/app.html' + hash;
}
new ResizeObserver(fitDevice).observe(stage);
window.addEventListener('hashchange', loadRoute);
loadRoute();
fitDevice();
