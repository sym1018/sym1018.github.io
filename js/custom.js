document.addEventListener('DOMContentLoaded', function () {
  // Remove announcement bullhorn icon
  document.querySelectorAll('#card-announcement .fa-bullhorn').forEach(function (el) {
    el.remove();
  });
});
