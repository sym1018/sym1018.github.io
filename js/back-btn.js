document.addEventListener('DOMContentLoaded', function () {
  // 仅在文章页生效
  if (!document.body.classList.contains('post')) return;

  var btn = document.createElement('a');
  btn.className = 'back-btn';
  btn.innerHTML = '<span class="back-arrow">‹</span> 返回';

  if (window.history.length > 1 && document.referrer && new URL(document.referrer).origin === window.location.origin) {
    btn.href = 'javascript:void(0)';
    btn.addEventListener('click', function () { window.history.back(); });
  } else {
    btn.href = '/';
  }

  document.body.appendChild(btn);
});
