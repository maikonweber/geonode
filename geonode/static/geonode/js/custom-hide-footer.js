// Script global para ocultar footer do GeoNode em todas as páginas de catálogo
(function() {
  'use strict';

  // Aguarda o carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideFooter);
  } else {
    hideFooter();
  }

  function hideFooter() {
    // Cria estilo para ocultar footers
    const style = document.createElement('style');
    style.textContent = `
      /* Ocultar footer em páginas de catálogo */
      body[class*="catalogue"] footer,
      body[class*="catalogue"] .footer,
      .gn-footer,
      .ms-footer {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Observer para elementos dinâmicos
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'FOOTER' ||
                node.classList && (
                  node.classList.contains('footer') ||
                  node.classList.contains('gn-footer') ||
                  node.classList.contains('ms-footer')
                )) {
              node.style.display = 'none';
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
