/*! Widget de indicadores de tgb.cl. Uso:
 *  <div data-tgb-widget="indicadores" data-valores="uf,dolar,utm" data-tema="claro"></div>
 *  <script src="https://tgb.cl/widget.js" async></script>
 */
(function () {
  var API = 'https://mindicador.cl/api'
  var NOMBRES = { uf: 'UF', dolar: 'Dólar', euro: 'Euro', utm: 'UTM', ipc: 'IPC', libra_cobre: 'Cobre (USD/lb)' }
  var PAGINAS = { uf: 'uf-hoy', dolar: 'dolar-hoy', euro: 'euro-hoy', utm: 'utm-hoy' }
  var CSS =
    '.tgbw{font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;border-radius:12px;padding:12px 14px;max-width:340px;box-sizing:border-box;border:1px solid}' +
    '.tgbw *{box-sizing:border-box}.tgbw-claro{background:#fff;color:#14213d;border-color:#dbe1e8}.tgbw-oscuro{background:#10233f;color:#f4f7fb;border-color:#20395f}' +
    '.tgbw-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 0 6px;font-weight:700}' +
    '.tgbw-h span{font-weight:400;font-size:12px;opacity:.7}' +
    '.tgbw ul{list-style:none;margin:0;padding:0}.tgbw li{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px solid rgba(127,140,160,.25)}' +
    '.tgbw li a{color:inherit;text-decoration:none}.tgbw li a:hover{text-decoration:underline}' +
    '.tgbw b{font-variant-numeric:tabular-nums}.tgbw-f{margin-top:6px;font-size:12px;opacity:.75}.tgbw-f a{color:inherit}'

  function fmt(n, d) {
    return n.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d })
  }

  function render(el, data) {
    var valores = (el.getAttribute('data-valores') || 'uf,dolar,euro,utm').split(',').map(function (s) { return s.trim() })
    var tema = el.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro'
    var hoy = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
    var filas = valores
      .filter(function (c) { return data[c] })
      .map(function (c) {
        var v = data[c].valor
        var txt = c === 'ipc' ? fmt(v, 1) + '%' : '$' + fmt(v, c === 'utm' ? 0 : 2)
        var nombre = NOMBRES[c] || c
        var link = PAGINAS[c] ? '<a href="https://tgb.cl/' + PAGINAS[c] + '/" target="_blank" rel="noopener">' + nombre + '</a>' : nombre
        return '<li><span>' + link + '</span><b>' + txt + '</b></li>'
      })
      .join('')
    el.innerHTML =
      '<div class="tgbw tgbw-' + tema + '"><p class="tgbw-h">Indicadores <span>' + hoy + '</span></p><ul>' + filas +
      '</ul><p class="tgbw-f">Fuente: Banco Central · <a href="https://tgb.cl/indicadores/" target="_blank" rel="noopener">tgb.cl</a></p></div>'
  }

  function init() {
    var els = document.querySelectorAll('[data-tgb-widget="indicadores"]')
    if (!els.length) return
    if (!document.getElementById('tgbw-css')) {
      var st = document.createElement('style')
      st.id = 'tgbw-css'
      st.textContent = CSS
      document.head.appendChild(st)
    }
    fetch(API)
      .then(function (r) { return r.json() })
      .then(function (data) {
        for (var i = 0; i < els.length; i++) render(els[i], data)
      })
      .catch(function () {
        for (var i = 0; i < els.length; i++) els[i].innerHTML = '<a href="https://tgb.cl/indicadores/">Ver indicadores en tgb.cl</a>'
      })
  }

  window.tgbWidget = { init: init }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
