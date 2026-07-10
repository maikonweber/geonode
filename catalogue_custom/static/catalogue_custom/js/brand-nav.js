/**
 * 8D Tecnologia — navegação compartilhada (navbar interna + mobile)
 */
document.addEventListener('DOMContentLoaded', function () {
  // Menu mobile
  var toggle = document.getElementById('navbarInternalToggle');
  var menu = document.getElementById('navbarInternalMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    document.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.classList.remove('active');
    });
  }

  // Link ativo por URL
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.navbar-internal-menu a').forEach(function (link) {
    var href = link.getAttribute('href').split('#')[0].replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });

  // Dropdown usuário
  var userButton = document.getElementById('userMenuButton');
  var userDropdown = document.getElementById('userMenuDropdown');
  if (userButton && userDropdown) {
    userButton.addEventListener('click', function (e) {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    document.addEventListener('click', function () {
      userDropdown.classList.remove('show');
    });
  }
});
