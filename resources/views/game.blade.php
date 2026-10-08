<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Sort Adventure · Învață prin joacă</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🐧%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="{{ asset('assets/game.css') }}">
</head>
<body>
<header class="topbar"><a class="brand" href="/" aria-label="Sort Adventure, pagina principală"><span class="brand-icon">↗</span> Sort<span>Adventure</span></a><span class="tagline">Numere mici. Aventuri mari.</span><button id="sound" class="quiet" aria-pressed="false">♫ Sunet oprit</button></header>
<main class="layout">
<aside class="journey"><div class="eyebrow">HARTA AVENTURII</div><h1>Un pas mai departe.</h1><p class="muted">{{ count($initial['levels']) }} niveluri, o nouă superputere:<br>numerele în ordinea potrivită.</p><nav id="levels" aria-label="Alege un nivel"></nav><div class="journey-note"><span>✦</span><div><strong>În ritmul tău</strong><p>Progresul se salvează automat.<br>Poți reveni oricând.</p></div></div></aside>
<section class="play-area" aria-labelledby="level-title">
<div class="heading"><div><div id="mode-tag" class="eyebrow">MUTARE DIRECTĂ</div><h2 id="level-title">Expediția polară</h2><p id="subtitle" class="muted"></p></div><div class="level-badge"><span>NIVEL</span><strong id="level-number">01</strong></div></div>
<div id="scene" class="scene ice">
<div class="scene-top"><span id="direction" class="pill">Crescător ↗</span><span id="counter" class="pill">0 schimburi</span></div>
<div class="scenery" aria-hidden="true"><div class="stars">✦ · ✧ · ✦ · ✧</div><div class="mountain m1"></div><div class="mountain m2"></div><div class="igloo"><div></div></div><div class="tree t1"></div><div class="tree t2"></div><div class="hill h1"></div><div class="hill h2"></div></div>
<div class="scene-caption"><span id="scene-label">BUN VENIT LA POLUL NORD</span><p id="scene-instruction">Fiecare prieten are locul lui.</p></div>
<div class="arena" tabindex="0" aria-label="Tabla jocului; pe ecrane mici poți derula orizontal"><div class="board"><div id="objects" class="objects" aria-label="Obiecte numerotate"></div><div id="targets" class="targets" aria-label="Ordinea finală"></div></div></div>
<div class="snow-dot d1"></div><div class="snow-dot d2"></div><div class="snow-dot d3"></div>
</div>
<div class="toolbar"><p id="status" role="status" aria-live="polite"></p><div class="actions"><button id="hint" class="quiet">✧ Indiciu</button><button id="retry" class="quiet">↻ Reîncearcă</button></div></div>
<div class="learning-grid"><article class="learn-card"><span class="card-icon">☝</span><div><h3 id="help-title">Apasă. Mută. Descoperă.</h3><p id="help-text"></p><button id="compare" class="primary" hidden>Compară vecinii →</button><button id="pass" class="quiet" hidden>Animează o trecere</button></div></article><article class="learn-card goal"><span class="card-icon">↗</span><div><h3>Destinația numerelor</h3><p id="target-text"></p><div class="progress-track"><div id="progress-bar"></div></div><span id="placed" class="small"></span></div></article></div>
<p class="footer-note">Creat pentru curiozitate. Fără grabă, fără limite de timp.</p>
</section>
</main>
<dialog id="win" aria-labelledby="win-title"><div class="win-icon">✦</div><div class="eyebrow">AVENTURĂ REUȘITĂ</div><h2 id="win-title">Ai pus lumea în ordine!</h2><p id="win-detail"></p><button id="next" class="primary">Următoarea aventură →</button><button id="close-win" class="quiet">Privește rezultatul</button></dialog>
<script id="initial-state" type="application/json">{!! json_encode($initial, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
<script type="module" src="{{ asset('assets/game.js') }}"></script>
</body></html>
