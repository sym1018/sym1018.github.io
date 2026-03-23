document.addEventListener('DOMContentLoaded', function () {
  // Remove fa-shake class from announcement icon to stop flashing
  document.querySelectorAll('.fa-shake').forEach(function (el) {
    el.classList.remove('fa-shake');
  });
});
