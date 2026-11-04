   /* =====================================================================
      8. NAVEGAÇÃO (pelo # do endereço)
         #painel    -> painel da loja
         #disco/5   -> página do disco de id 5
         #faq       -> dúvidas frequentes
         #mapa-do-site -> mapa do site
         o resto    -> loja (vitrine + catálogo)
      ===================================================================== */
   function rotaAtual() {
     const h = location.hash;
     if (h === '#painel') return { view: 'painel' };
     if (h === '#faq') return { view: 'faq' };
     if (h === '#mapa-do-site') return { view: 'mapa' };
     const m = h.match(/^#disco\/(\d+)$/);
     if (m) return { view: 'disco', id: Number(m[1]) };
     return { view: 'loja' };
   }

   // Mapa do site: montado na hora, pra lista de discos e gêneros acompanhar o painel
   function renderMapa() {
     const generos = [...banco.generos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
     const discos = [...banco.vinis].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
     $('#mapaSite').innerHTML = `
       <section>
         <h2>Loja</h2>
         <ul>
           <li><a href="#loja">Página inicial</a></li>
           <li><a href="#catalogo">Catálogo</a></li>
           <li><button class="botao-link" type="button" data-abrir-sacola>Sacola</button></li>
         </ul>
       </section>
       <section>
         <h2>Gêneros</h2>
         <ul>${generos.map(g => `<li><a href="#catalogo" data-filtrar-genero="${g.id}">${esc(g.nome)}</a></li>`).join('')}</ul>
       </section>
       <section>
         <h2>Discos</h2>
         <ul>${discos.map(v => `<li><a href="#disco/${v.id}">${esc(v.titulo)}</a> <span>${esc(nomeDe(banco.artistas, v.artistaId))}</span></li>`).join('')}</ul>
       </section>
       <section>
         <h2>Ajuda</h2>
         <ul>
           <li><a href="#faq">Dúvidas frequentes</a></li>
           <li><a href="#painel">Painel da loja</a></li>
         </ul>
       </section>`;
   }

   function mostrarView() {
     const rota = rotaAtual();
     const anterior = viewAtual;
     if (anterior === 'loja' && rota.view !== 'loja') posicaoLoja = window.scrollY;  // guarda onde a pessoa estava
     viewAtual = rota.view;

     $('#loja').hidden = rota.view !== 'loja';
     $('#pagina-painel').hidden = rota.view !== 'painel';   // o id não é "painel" pra o navegador não rolar até ele ao abrir #painel
     $('#pagina-disco').hidden = rota.view !== 'disco';
     $('#pagina-faq').hidden = rota.view !== 'faq';
     $('#pagina-mapa').hidden = rota.view !== 'mapa';
     const ativo = rota.view === 'painel' ? 'painel' : 'loja';
     $$('.nav-link[data-view]').forEach(link => {
       if (link.dataset.view === ativo) link.setAttribute('aria-current', 'page');
       else link.removeAttribute('aria-current');
     });

     if (rota.view === 'painel') {
       document.title = `Painel | ${TITULO_SITE}`;
       renderPainel();
       if (anterior !== 'painel') window.scrollTo(0, 0);
       return;
     }
     if (rota.view === 'disco') {
       renderProduto(rota.id);
       window.scrollTo(0, 0);
       $('#tituloProduto')?.focus({ preventScroll: true });   // leitor de tela começa pelo nome do disco
       return;
     }
     if (rota.view === 'faq' || rota.view === 'mapa') {
       const faq = rota.view === 'faq';
       document.title = `${faq ? 'Dúvidas frequentes' : 'Mapa do site'} | ${TITULO_SITE}`;
       if (!faq) renderMapa();
       window.scrollTo(0, 0);
       $(faq ? '#tituloFaq' : '#tituloMapa').focus({ preventScroll: true });
       return;
     }

     // Loja
     document.title = TITULO_SITE;
     if (anterior === 'disco' && posicaoLoja !== null && !irParaCatalogo) {
       window.scrollTo(0, posicaoLoja);           // volta pro mesmo ponto do catálogo
     } else if (location.hash === '#catalogo') {
       $('#catalogo').scrollIntoView();
     } else if (anterior && anterior !== 'loja') {
       window.scrollTo(0, 0);
     }
     irParaCatalogo = false;
   }
   
   /* Tema claro/escuro */
   function temaAtual() {
     return document.documentElement.dataset.theme ||
       (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
   }
   function aplicarTema(tema) {
     if (tema) document.documentElement.dataset.theme = tema;
     $('#btnTema').setAttribute('aria-label', temaAtual() === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
   }
   
