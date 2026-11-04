   /* =====================================================================
      5b. PÁGINA DE CADA DISCO (endereço #disco/ID)
      ===================================================================== */
   const ICONE_DIAMANTE = '<svg viewBox="0 0 24 20" aria-hidden="true"><path d="M5 1h14l4 6-11 12L1 7z M1 7h22 M8 1 6 7l6 12 6-12-2-6 M6 7l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

   function renderProduto(id) {
     discoAberto = id;
     fotoProduto = 0;
     const v = porId(banco.vinis, id);
     const caixa = $('#produto');

     if (!v) {
       document.title = `Disco não encontrado | ${TITULO_SITE}`;
       $('#trilhaDisco').innerHTML = '<a href="#catalogo">Catálogo</a>';
       caixa.innerHTML = `
         <div class="vazio">
           <h1 class="produto-titulo" id="tituloProduto" tabindex="-1">Disco não encontrado</h1>
           <p>Esse disco saiu do catálogo ou o endereço está errado.</p>
           <a class="botao botao-contorno" href="#catalogo">Ver o catálogo</a>
         </div>`;
       return;
     }

     const artista = nomeDe(banco.artistas, v.artistaId);
     const genero = nomeDe(banco.generos, v.generoId);
     const gravadora = nomeDe(banco.gravadoras, v.gravadoraId);
     document.title = `${v.titulo}, ${artista} | Roll Diamonds`;

     $('#trilhaDisco').innerHTML = `
       <a href="#catalogo">Catálogo</a><span class="sep" aria-hidden="true">/</span>
       <a href="#catalogo" data-filtrar-genero="${v.generoId}">${esc(genero)}</a><span class="sep" aria-hidden="true">/</span>
       <span aria-current="page">${esc(v.titulo)}</span>`;

     const usado = v.condicao === 'Usado';
     const estado = usado
       ? 'Limpo e ouvido no lado A e no lado B antes de ir pra prateleira.'
       : 'Lacrado de fábrica.';
     const observacao = v.observacao?.trim()
       ? ` <strong>Este exemplar:</strong> ${esc(v.observacao)}` : '';
     const sobre = v.descricao?.trim()
       ? `<section class="produto-bloco"><h2>Sobre o álbum</h2>${v.descricao.trim().split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}</section>` : '';
     const bio = porId(banco.artistas, v.artistaId)?.bio?.trim();
     const sobreArtista = bio
       ? `<section class="produto-bloco"><h2>Sobre o artista</h2>${bio.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}</section>` : '';
     // Faixas: mostra só as primeiras e um "Ver mais" abre o resto (o CSS esconde as outras)
     const muitas = v.faixas?.length > FAIXAS_VISIVEIS;
     const verMais = muitas
       ? `<button class="botao-link ver-faixas" type="button" data-ver-faixas aria-expanded="false" aria-controls="listaFaixas">Ver mais (${v.faixas.length} faixas)</button>` : '';
     const faixas = v.faixas?.length
       ? `<section class="produto-bloco"><h2>Faixas</h2><ol class="faixas${muitas ? ' faixas-recolhidas' : ''}" id="listaFaixas">${v.faixas.map(f => `<li>${esc(f)}</li>`).join('')}</ol>${verMais}</section>` : '';
     // Com segunda foto: setas pra trocar entre a capa e ela, e bolinhas mostrando qual está aberta
     const galeria = v.foto2 && !capasQuebradas.has(v.foto2) ? `
       <div class="galeria-controles">
         <button class="seta galeria-anterior" type="button" data-galeria-passo="-1" aria-label="Foto anterior">
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
         </button>
         <button class="seta galeria-proxima" type="button" data-galeria-passo="1" aria-label="Próxima foto">
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
         </button>
         <div class="pontos galeria-pontos">
           <button class="ponto" type="button" data-galeria-foto="0" aria-label="Ver a capa" aria-current="true"></button>
           <button class="ponto" type="button" data-galeria-foto="1" aria-label="Ver a segunda foto"></button>
         </div>
         <p class="sr" id="avisoGaleria" aria-live="polite"></p>
       </div>` : '';
     // Lupa no canto da foto: avisa que dá pra dar zoom
     const lupa = `<span class="zoom-icone" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 15l5 5M10.5 8v5M8 10.5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>`;
     // Lente e janela do zoom com mouse (ficam escondidas até o mouse passar na foto)
     const zoomJanela = '<div class="zoom-lente" aria-hidden="true"></div><div class="zoom-janela" aria-hidden="true"><img alt=""></div>';

     caixa.className = `produto${qtdEstoque(v.id) === 0 ? ' produto-esgotado' : ''}`;
     caixa.innerHTML = `
       <header class="produto-cabeca">
         <p class="produto-artista">${esc(artista)}</p>
         <h1 class="produto-titulo" id="tituloProduto" tabindex="-1">${esc(v.titulo)}</h1>
         <p class="produto-etiquetas">
           <span class="etiqueta">${esc(genero)}</span>
           <span class="etiqueta${usado ? '' : ' etiqueta-novo'}">${v.condicao}</span>
           ${v.destaque ? '<span class="etiqueta etiqueta-destaque">Destaque da loja</span>' : ''}
         </p>
       </header>

       <div class="produto-grade">
         <div class="produto-midia">
           <div class="produto-capa" id="produtoCapa" style="${coresCapa(v)}">${capaHTML(v, false, v.foto2)}${lupa}${zoomJanela}${galeria}</div>
           <dl class="ficha">
             <div><dt>Ano</dt><dd>${v.ano}</dd></div>
             <div><dt>País</dt><dd>${esc(v.pais || 'Não informado')}</dd></div>
             <div><dt>Gravadora</dt><dd>${esc(gravadora)}</dd></div>
             <div><dt>Gênero</dt><dd>${esc(genero)}</dd></div>
             <div><dt>Tamanho</dt><dd>${TAMANHOS[v.tamanho] ?? 'Não informado'}</dd></div>
             <div><dt>Peso</dt><dd>${v.peso ? `${v.peso}\u00a0g` : 'Não informado'}</dd></div>
             <div><dt>Estado</dt><dd>${v.condicao}</dd></div>
           </dl>
           <p class="ficha-nota">${estado}${observacao}</p>
         </div>

         <div class="produto-info">
           ${faixas}
         </div>

         <aside class="produto-lateral">
           <div class="produto-compra" id="produtoCompra"></div>
           <p class="produto-garantia">${ICONE_DIAMANTE}<span>Todo disco da Roll Diamonds tem o estado da capa e do vinil descrito sem enrolação. Se chegar diferente do que está aqui, a gente troca.</span></p>
         </aside>

         <!-- Ao lado da capa, embaixo das faixas e da compra -->
         <div class="produto-textos">
           ${sobre}
           ${sobreArtista}
         </div>
       </div>

       <!-- Embaixo, na largura toda: sugestões lado a lado -->
       <section class="produto-relacionados produto-largo" id="relacionados" aria-labelledby="tituloRelacionados">
         <h2 id="tituloRelacionados">Compre também</h2>
         <ul class="mini-lista" id="listaRelacionados"></ul>
       </section>`;

     renderCompraProduto();
     renderRelacionados();
   }

   // Troca a foto da página do disco: são só duas, então as setas dão a volta
   function mostrarFotoProduto(indice) {
     fotoProduto = (indice + 2) % 2;
     $('#produtoCapa').classList.toggle('ver-foto2', fotoProduto === 1);
     $('#produtoCapa .capa')?.classList.remove('zoom-ativo');   // troca a foto sem zoom
     $('#produtoCapa').classList.remove('zoom-janela-ativa');
     $$('[data-galeria-foto]').forEach(p => {
       if (Number(p.dataset.galeriaFoto) === fotoProduto) p.setAttribute('aria-current', 'true');
       else p.removeAttribute('aria-current');
     });
     $('#avisoGaleria').textContent = fotoProduto === 1 ? 'Mostrando a segunda foto' : 'Mostrando a capa';
   }

   // Só a caixa de preço/estoque/botão: é redesenhada quando a sacola ou o estoque mudam,
   // sem refazer a página inteira (assim a animação do disco não recomeça).
   function renderCompraProduto() {
     const v = porId(banco.vinis, discoAberto);
     const caixa = $('#produtoCompra');
     if (!v || !caixa) return;
     const q = qtdEstoque(v.id);
     const naSacola = sacola.find(i => i.vinilId === v.id)?.quantidade ?? 0;

     let estoque = `${plural(q, 'unidade', 'unidades')} na prateleira`;
     let classe = '';
     if (q === 0) { estoque = 'Esgotado'; classe = ' esgotado'; }
     else if (q === 1) { estoque = 'Última unidade'; classe = ' pouco'; }

     const podePor = q > 0 && naSacola < q;
     const botao = q === 0
       ? '<button class="botao botao-verde" type="button" disabled>Esgotado no momento</button>'
       : `<button class="botao botao-verde" type="button" data-acao="adicionar" data-id="${v.id}" ${podePor ? '' : 'disabled'}>${podePor ? 'Pôr na sacola' : 'Todas já estão na sacola'}</button>`;
     const aviso = naSacola
       ? `<p class="produto-na-sacola">${plural(naSacola, 'unidade', 'unidades')} na sua sacola. <button class="botao-link" type="button" data-abrir-sacola>Abrir sacola</button></p>` : '';

     caixa.innerHTML = `
       <div class="produto-preco-linha">
         <span class="produto-preco">${moeda(v.preco)}</span>
         <span class="produto-estoque${classe}">${estoque}</span>
       </div>
       <div class="produto-botoes">${botao}${aviso}</div>`;
   }

   // "Compre também": primeiro do mesmo artista, depois do mesmo gênero, depois o resto
   function renderRelacionados() {
     const v = porId(banco.vinis, discoAberto);
     const secao = $('#relacionados');
     if (!v || !secao) return;
     const pontos = d => (d.artistaId === v.artistaId ? 2 : 0) + (d.generoId === v.generoId ? 1 : 0);
     const lista = banco.vinis
       .filter(d => d.id !== v.id)
       .sort((a, b) => pontos(b) - pontos(a) || a.id - b.id)
       .slice(0, 3);
     secao.hidden = !lista.length;
     $('#listaRelacionados').innerHTML = lista.map(miniDiscoHTML).join('');
   }

   function miniDiscoHTML(d) {
     const esgotado = qtdEstoque(d.id) === 0;
     return `
       <li class="mini-disco">
         <a class="mini-capa" href="#disco/${d.id}" style="${coresCapa(d)}" tabindex="-1" aria-hidden="true">${capaHTML(d, true)}</a>
         <div class="mini-info">
           <span class="mini-artista">${esc(nomeDe(banco.artistas, d.artistaId))}</span>
           <a class="mini-titulo" href="#disco/${d.id}">${esc(d.titulo)}</a>
           <span class="mini-preco">${moeda(d.preco)}</span>
         </div>
         <button class="mini-sacola" type="button" data-acao="adicionar" data-id="${d.id}" aria-label="Pôr ${esc(d.titulo)} na sacola" ${esgotado ? 'disabled' : ''}>
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
         </button>
       </li>`;
   }

