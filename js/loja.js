   /* =====================================================================
      5. LOJA: filtros, catálogo e destaque da vitrine
      ===================================================================== */
   function renderChips() {
     if (filtro.genero && !porId(banco.generos, filtro.genero)) filtro.genero = 0;
     const opcoes = [{ id: 0, nome: 'Todos' }, ...banco.generos];
     $('#filtroGeneros').innerHTML = opcoes.map(g =>
       `<button class="chip" type="button" data-genero="${g.id}" aria-pressed="${filtro.genero === g.id}">${esc(g.nome)}</button>`
     ).join('');
   }
   
   function discosFiltrados() {
     const termo = normalizar(filtro.busca.trim());
     const lista = banco.vinis.filter(v => {
       const texto = normalizar(`${v.titulo} ${nomeDe(banco.artistas, v.artistaId)}`);
       return (!filtro.genero || v.generoId === filtro.genero) && (!termo || texto.includes(termo));
     });
     const ordens = {
       prateleira: (a, b) => a.id - b.id,
       chegada: (a, b) => b.id - a.id,
       menor: (a, b) => a.preco - b.preco,
       maior: (a, b) => b.preco - a.preco,
       ano: (a, b) => a.ano - b.ano,
     };
     return lista.sort(ordens[filtro.ordem] || ordens.prateleira);
   }
   
   function cardHTML(v) {
     const q = qtdEstoque(v.id);
     const artista = nomeDe(banco.artistas, v.artistaId);
     let aviso = '';
     if (q === 0) aviso = '<p class="disco-aviso esgotado">Esgotado</p>';
     else if (q === 1) aviso = '<p class="disco-aviso">Última unidade</p>';
     const botao = q === 0
       ? `<button class="botao botao-verde botao-pequeno" type="button" disabled>Esgotado</button>`
       : `<button class="botao botao-verde botao-pequeno" type="button" data-acao="adicionar" data-id="${v.id}" aria-label="Pôr ${esc(v.titulo)} na sacola">Pôr na sacola</button>`;
     return `
       <article class="disco${q === 0 ? ' disco-esgotado' : ''}">
         <a class="disco-capa-area" href="#disco/${v.id}" style="${coresCapa(v)}" tabindex="-1" aria-hidden="true">
           <div class="disco-bolacha"></div>
           ${capaHTML(v, false, temMouse ? v.foto2 : '', true)}
         </a>
         <div class="disco-info">
           <h3><a href="#disco/${v.id}">${esc(v.titulo)}</a></h3>
           <p class="disco-artista">${esc(artista)}</p>
           <p class="disco-detalhes">
             <span>${v.ano}, ${esc(nomeDe(banco.gravadoras, v.gravadoraId))}</span>
             <span class="etiqueta${v.condicao === 'Novo' ? ' etiqueta-novo' : ''}">${v.condicao}</span>
           </p>
           ${aviso}
           <div class="disco-rodape">
             <span class="disco-preco">${moeda(v.preco)}</span>
             ${botao}
           </div>
         </div>
       </article>`;
   }
   
   function renderGrade() {
     const lista = discosFiltrados();
     $('#contagemCatalogo').textContent = plural(lista.length, 'disco', 'discos');
     if (!lista.length) {
       const alvo = filtro.busca.trim() ? `para “${esc(filtro.busca.trim())}”` : 'nesse gênero';
       $('#gradeCatalogo').innerHTML = `
         <div class="vazio">
           <p>Nenhum disco encontrado ${alvo}. Tente outro nome ou veja todos os gêneros.</p>
           <button class="botao botao-contorno" type="button" id="btnLimparFiltros">Limpar filtros</button>
         </div>`;
       return;
     }
     $('#gradeCatalogo').innerHTML = lista.map(cardHTML).join('');
   }
   
   /* ---------- Carrossel da vitrine ---------- */
   // Discos marcados como destaque no painel. Se nenhum estiver marcado, usa os 5 primeiros.
   function listaDestaques() {
     const marcados = banco.vinis.filter(v => v.destaque);
     return marcados.length ? marcados : banco.vinis.slice(0, 5);
   }

   function renderDestaque() {
     const lista = listaDestaques();
     const botao = $('#btnDestaque');
     const conhecer = $('#btnConhecer');
     $('#controlesCarrossel').hidden = lista.length < 2;

     if (!lista.length) {
       $('#vitrolaCapa').innerHTML = '<img src="img/capas/logo-creme.png" alt="" width="251" height="240">';
       $('#vitrolaCapa').removeAttribute('href');
       $('#destaqueTitulo').textContent = 'Nenhum disco na vitrola';
       $('#destaqueArtista').textContent = 'Cadastre um disco no painel da loja.';
       $('#destaqueMeta').textContent = '';
       botao.hidden = true; conhecer.hidden = true;
       return;
     }

     destaqueAtual = Math.min(Math.max(destaqueAtual, 0), lista.length - 1);
     const v = lista[destaqueAtual];
     const link = `#disco/${v.id}`;
     const artista = nomeDe(banco.artistas, v.artistaId);

     // Capa da vitrola = capa do disco; clicar nela abre a página do disco
     const capa = $('#vitrolaCapa');
     capa.innerHTML = capaHTML(v);
     capa.href = link;
     capa.setAttribute('aria-label', `Ver a página de ${v.titulo}`);

     $('#destaqueLink').href = link;
     $('#destaqueTitulo').textContent = v.titulo;
     $('#destaqueArtista').textContent = artista;
     $('#destaqueMeta').textContent = `${v.ano} · ${nomeDe(banco.generos, v.generoId)} · ${moeda(v.preco)}`;

     const esgotado = qtdEstoque(v.id) === 0;
     botao.hidden = false; conhecer.hidden = false;
     botao.dataset.id = v.id;
     botao.disabled = esgotado;
     botao.textContent = esgotado ? 'Esgotado no momento' : 'Pôr esse na sacola';
     conhecer.href = link;

     // Bolinhas: uma por disco, a do disco atual fica preenchida
     $('#pontosDestaque').innerHTML = lista.map((d, i) =>
       `<button class="ponto" type="button" data-destaque="${i}" aria-label="Mostrar ${esc(d.titulo)}"${i === destaqueAtual ? ' aria-current="true"' : ''}></button>`
     ).join('');
   }

   // Troca o disco do carrossel: a capa some, troca, e aparece de novo
   let timerTroca;
   function irParaDestaque(indice) {
     const lista = listaDestaques();
     if (lista.length < 2) return;
     const novo = (indice + lista.length) % lista.length;   // dá a volta nas pontas
     if (novo === destaqueAtual) return;
     const v = lista[novo];
     $('#avisoDestaque').textContent = `${v.titulo}, ${nomeDe(banco.artistas, v.artistaId)}. Destaque ${novo + 1} de ${lista.length}.`;

     if (semMovimento) { destaqueAtual = novo; renderDestaque(); return; }
     const vitrola = $('#vitrola');
     vitrola.classList.add('guardando');
     $('#tocando').classList.add('trocando');
     clearTimeout(timerTroca);
     timerTroca = setTimeout(() => {
       destaqueAtual = novo;
       renderDestaque();
       vitrola.classList.remove('guardando');
       $('#tocando').classList.remove('trocando');
     }, 300);
   }
   
