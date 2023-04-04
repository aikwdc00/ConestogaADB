// FU-TING, LI, Student No: 8819152

const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const getNewFontSize = document.querySelector('#getNewFontSize')
const setHtmlFont = document.querySelector('html')

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

function changeFontSizeHandler() {
  setHtmlFont.style.fontSize = getNewFontSize.value + 'px'
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);
getNewFontSize.addEventListener('change', changeFontSizeHandler)
