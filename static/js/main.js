// ===== Code Copy Buttons =====
(function() {
  document.querySelectorAll('.post-content pre').forEach(function(pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function() {
      var code = pre.querySelector('code') || pre;
      var text = code.textContent;
      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
      });
    });
    pre.appendChild(btn);
  });
})();

// ===== Back to Top =====
(function() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ===== Client-Side Search =====
(function() {
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results) return;

  var posts = [];
  var loaded = false;

  input.addEventListener('focus', function() {
    if (!loaded) {
      input.placeholder = 'Loading index...';
      fetch('/index.json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          posts = data;
          loaded = true;
          input.placeholder = 'Search articles...';
          doSearch();
        })
        .catch(function() {
          input.placeholder = 'Search unavailable';
        });
    }
  });

  input.addEventListener('input', doSearch);

  function doSearch() {
    var q = input.value.trim().toLowerCase();
    if (q.length < 1) {
      results.style.display = 'none';
      results.innerHTML = '';
      return;
    }
    var hits = [];
    for (var i = 0; i < posts.length; i++) {
      var title = (posts[i].title || '').toLowerCase();
      var summary = (posts[i].summary || '').toLowerCase();
      var tags = (posts[i].tags || []).join(' ').toLowerCase();
      var score = 0;
      if (title.indexOf(q) !== -1) score += 10;
      if (tags.indexOf(q) !== -1) score += 5;
      if (summary.indexOf(q) !== -1) score += 2;
      if (score > 0) {
        hits.push({ post: posts[i], score: score });
      }
    }
    hits.sort(function(a, b) { return b.score - a.score; });
    hits = hits.slice(0, 8);

    if (hits.length === 0) {
      results.style.display = 'block';
      results.innerHTML = '<div class="search-empty">No results found</div>';
      return;
    }
    var html = '';
    for (var j = 0; j < hits.length; j++) {
      var p = hits[j].post;
      html += '<a class="search-item" href="' + p.url + '">';
      html += '<span class="search-item-title">' + escapeHtml(p.title) + '</span>';
      if (p.tags && p.tags.length) {
        html += '<span class="search-item-tags">' + p.tags.map(escapeHtml).join(', ') + '</span>';
      }
      html += '</a>';
    }
    results.style.display = 'block';
    results.innerHTML = html;
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.style.display = 'none';
    }
  });
})();
