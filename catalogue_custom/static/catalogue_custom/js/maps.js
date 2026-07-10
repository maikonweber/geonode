/**
 * maps.js
 * Script para gerenciar a página de Mapas
 */

var siteUrl = window.SITEURL ? window.SITEURL.replace(/\/?$/, '/') : '/';

// Função para ocultar header e footer do MapStore dentro do iframe
function hideMapStoreHeader() {
  try {
    const iframe = document.getElementById('catalogue-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Carrega o CSS de overrides no iframe com timestamp para evitar cache
    const link = iframeDoc.createElement('link');
    link.rel = 'stylesheet';
    link.href = siteUrl + 'static/catalogue_custom/css/iframe-overrides.css?t=' + new Date().getTime();
    iframeDoc.head.appendChild(link);

    console.log('CSS de overrides injetado no iframe');
  } catch(e) {
    console.log('Não foi possível acessar iframe (CORS):', e);
  }
}

// Toggle user menu
document.addEventListener('DOMContentLoaded', function() {
  const userButton = document.getElementById('userMenuButton');
  const userDropdown = document.getElementById('userMenuDropdown');

  if (userButton && userDropdown) {
    userButton.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function() {
      userDropdown.classList.remove('show');
    });
  }
});
