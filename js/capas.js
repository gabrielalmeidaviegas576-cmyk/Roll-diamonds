   /* =====================================================================
      4. CAPAS (foto quando o disco tem "capa"; senão, capa desenhada)
      ===================================================================== */
   function coresCapa(v) {
     const [c1, c2, c3] = PALETAS[(v.id * 5) % PALETAS.length];
     return `--c1:${c1};--c2:${c2};--c3:${c3}`;
   }

   // Fotos que falharam ao carregar (arquivo faltando ou nome errado).
   // Guardamos aqui pra não tentar de novo a cada redesenho da tela.
   const capasQuebradas = new Set();

   // Aceita só o nome do arquivo ("abbey-road.jpg") e completa com a pasta
   function caminhoCapa(texto) {
     const t = String(texto ?? '').trim();
     if (!t) return '';
     return t.includes('/') ? t : `img/capas/${t}`;
   }

   // Miniatura (400px) das fotos de img/capas, pra onde a capa aparece pequena: fica em img/capas/mini/
   function caminhoMiniatura(caminho) {
     const m = String(caminho).match(/^img\/capas\/([^/]+)$/);
     return m ? `img/capas/mini/${m[1]}` : caminho;
   }
   // <img> da foto: com miniatura, guarda o caminho da grande em data-grande (se a miniatura faltar, usa ela)
   function fotoHTML(classe, caminho, miniatura) {
     const src = miniatura ? caminhoMiniatura(caminho) : caminho;
     const grande = src !== caminho ? ` data-grande="${esc(caminho)}"` : '';
     return `<img class="${classe}" src="${esc(src)}"${grande} alt="" loading="lazy" decoding="async">`;
   }

   // foto2: segunda foto, por cima da capa, que aparece ao passar o mouse (catálogo) ou pelas setas (página do disco)
   // miniatura: usa a foto de 400px (a capa pequena, mini, sempre usa)
   function capaHTML(v, mini = false, foto2 = '', miniatura = false) {
     const extra = mini ? ' capa-mini' : '';
     const pequena = mini || miniatura;
     const segunda = foto2 && !capasQuebradas.has(foto2) ? fotoHTML('capa-foto2', foto2, pequena) : '';
     // Com foto: usa a imagem (as regras estão no capas.css)
     if (v.capa && !capasQuebradas.has(v.capa)) {
       return `<div class="capa capa-com-foto${extra}" data-id="${v.id}" aria-hidden="true">` +
         `${fotoHTML('capa-foto', v.capa, pequena)}${segunda}</div>`;
     }
     // Sem foto: capa desenhada com CSS
     const estilo = ESTILOS[v.id % ESTILOS.length];
     const classes = `capa capa-${estilo}${v.condicao === 'Usado' ? ' capa-usada' : ''}${extra}`;
     const titulo = mini ? '' : `<span class="capa-titulo">${esc(v.titulo)}</span>`;
     return `<div class="${classes}" style="${coresCapa(v)}" aria-hidden="true">${titulo}${segunda}</div>`;
   }

   // Se uma foto não carregar, troca só aquela capa pela capa desenhada.
   // O "true" no final faz o evento ser ouvido mesmo sem borbulhar (erro de imagem não borbulha).
   document.addEventListener('error', evento => {
     const img = evento.target;
     if (!(img instanceof HTMLImageElement)) return;
     // Miniatura que não existe (ex.: disco cadastrado pelo painel): usa a foto grande
     if (img.dataset.grande) {
       img.src = img.dataset.grande;
       delete img.dataset.grande;
       return;
     }
     // Segunda foto que não carregou: só tira ela, a capa continua normal
     if (img.classList.contains('capa-foto2')) {
       capasQuebradas.add(img.getAttribute('src'));
       // Na página do disco, sem a segunda foto não tem o que trocar: tira as setas
       const produtoCapa = img.closest('.produto-capa');
       if (produtoCapa) { produtoCapa.classList.remove('ver-foto2'); produtoCapa.querySelector('.galeria-controles')?.remove(); }
       img.remove();
       return;
     }
     if (!img.classList.contains('capa-foto')) return;
     const caixa = img.closest('.capa');
     const v = caixa && porId(banco.vinis, Number(caixa.dataset.id));
     if (!v) return;
     const mini = caixa.classList.contains('capa-mini');
     const foto2 = caixa.querySelector('.capa-foto2') ? v.foto2 : '';   // mantém a segunda foto, se tinha
     const miniatura = !!caixa.closest('.disco-capa-area');              // capa do catálogo usa miniatura
     // Dados salvos por uma versão antiga podem ter o nome antigo da foto
     // (ex.: "clube_da_esquina.jpg"). Se o disco de exemplo tem outra foto, usa ela.
     const base = dadosExemplo().vinis.find(e => e.id === v.id && e.titulo === v.titulo);
     if (base && base.capa && base.capa !== v.capa && !capasQuebradas.has(base.capa)) {
       capasQuebradas.add(v.capa);
       v.capa = base.capa;
       gravar(CHAVE_BANCO, banco);
       caixa.outerHTML = capaHTML(v, mini, foto2, miniatura);
       return;
     }
     capasQuebradas.add(v.capa);
     caixa.outerHTML = capaHTML(v, mini, foto2, miniatura);
   }, true);
   
