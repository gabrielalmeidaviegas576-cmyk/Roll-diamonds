   /* =====================================================================
      9. EVENTOS
      ===================================================================== */
   // Um único "ouvinte" de cliques para todos os botões com data-acao
   document.addEventListener('click', evento => {
     // Fechar janelas
     const fechar = evento.target.closest('[data-fechar]');
     if (fechar) { fechar.closest('dialog')?.close(); return; }
   
     // Bolinhas do carrossel
     const ponto = evento.target.closest('[data-destaque]');
     if (ponto) { irParaDestaque(Number(ponto.dataset.destaque)); return; }

     // "Ver mais" das faixas: abre e fecha a lista inteira
     const verFaixas = evento.target.closest('[data-ver-faixas]');
     if (verFaixas) {
       const lista = $('#listaFaixas');
       const aberta = lista.classList.toggle('faixas-recolhidas') === false;
       verFaixas.setAttribute('aria-expanded', aberta);
       verFaixas.textContent = aberta ? 'Ver menos' : `Ver mais (${lista.children.length} faixas)`;
       if (!aberta) lista.closest('.produto-bloco').scrollIntoView({ block: 'nearest' });   // ao fechar, não deixa a página "pular" pra baixo
       return;
     }

     // Galeria da página do disco: setas andam uma foto, bolinhas vão direto
     const passoFoto = evento.target.closest('[data-galeria-passo]');
     if (passoFoto) { mostrarFotoProduto(fotoProduto + Number(passoFoto.dataset.galeriaPasso)); return; }
     const escolhaFoto = evento.target.closest('[data-galeria-foto]');
     if (escolhaFoto) { mostrarFotoProduto(Number(escolhaFoto.dataset.galeriaFoto)); return; }

     // Gênero na trilha da página do disco: filtra o catálogo e deixa o link levar até ele
     const generoLink = evento.target.closest('[data-filtrar-genero]');
     if (generoLink) {
       filtro.genero = Number(generoLink.dataset.filtrarGenero);
       filtro.busca = '';
       $('#buscaCatalogo').value = '';
       renderChips(); renderGrade();
       irParaCatalogo = true;
       return;   // sem preventDefault: o navegador segue pro #catalogo
     }

     // "Abrir sacola" na página do disco
     if (evento.target.closest('[data-abrir-sacola]')) { $('#btnSacola').click(); return; }

     // Filtro de gênero
     const chip = evento.target.closest('[data-genero]');
     if (chip) {
       filtro.genero = Number(chip.dataset.genero);
       $$('.chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
       renderGrade();
       return;
     }
   
     if (evento.target.closest('#btnLimparFiltros')) {
       filtro.busca = ''; filtro.genero = 0;
       $('#buscaCatalogo').value = '';
       renderChips(); renderGrade();
       $('#buscaCatalogo').focus();
       return;
     }
   
     const alvo = evento.target.closest('[data-acao]');
     if (!alvo || alvo.tagName === 'SELECT') return;
     const id = Number(alvo.dataset.id);
     const acao = alvo.dataset.acao;
     const item = sacola.find(i => i.vinilId === id);
   
     switch (acao) {
       case 'adicionar': {
         const naPaginaDoDisco = !!alvo.closest('#produtoCompra');   // conferir antes: o botão é redesenhado
         adicionarNaSacola(id);
         // Na página do disco o botão é redesenhado: devolve o foco pra caixa de compra
         if (naPaginaDoDisco) {
           ($('#produtoCompra [data-acao="adicionar"]:not(:disabled)') || $('#produtoCompra [data-abrir-sacola]'))?.focus();
         }
         return;
       }
       case 'sacola-mais':
         if (item && item.quantidade < qtdEstoque(id)) item.quantidade++;
         renderSacola(); break;
       case 'sacola-menos':
         if (item) item.quantidade--;
         sacola = sacola.filter(i => i.quantidade > 0);
         renderSacola(); break;
       case 'sacola-remover':
         sacola = sacola.filter(i => i.vinilId !== id);
         renderSacola(); break;
       case 'estoque-mais':
       case 'repor':
         definirEstoque(id, qtdEstoque(id) + 1); atualizarTudo(); break;
       case 'estoque-menos':
         definirEstoque(id, qtdEstoque(id) - 1); atualizarTudo(); break;
       case 'editar-disco': abrirModalDisco(id); return;
       case 'excluir-disco': excluirDisco(id); return;
       case 'editar-cliente': abrirModalCliente(id); return;
       case 'editar-artista': abrirModalArtista(id); return;
       case 'excluir-cliente': excluirCliente(id); return;
       case 'ver-itens': abrirItensPedido(id); return;
       case 'remover-cadastro': {
         const lista = alvo.dataset.tipo;
         const nome = nomeDe(banco[lista], id);
         banco[lista] = banco[lista].filter(x => x.id !== id);
         atualizarTudo();
         avisar(`“${nome}” removido.`);
         return;
       }
       default: return;
     }
   
     // Depois de redesenhar, devolve o foco pro mesmo botão (bom pra quem usa teclado)
     const mesmo = $(`[data-acao="${acao}"][data-id="${id}"]`);
     if (mesmo && !mesmo.disabled) mesmo.focus();
   });
   
   // Troca de situação do pedido
   document.addEventListener('change', evento => {
     const select = evento.target.closest('select[data-acao="status"]');
     if (select) mudarStatus(Number(select.dataset.id), select.value, select);
   });
   
   // Formulários de cadastro rápido (gênero, artista, gravadora)
   document.addEventListener('submit', evento => {
     const form = evento.target.closest('.form-cadastro');
     if (!form) return;
     evento.preventDefault();
     const lista = form.dataset.tipo;
     const nome = form.elements.nome.value.trim();
     if (!nome) return;
     if (banco[lista].some(x => normalizar(x.nome) === normalizar(nome))) {
       avisar(`“${nome}” já está cadastrado.`);
       return;
     }
     banco[lista].push({ id: proximoId(banco[lista]), nome });
     atualizarTudo();
     avisar(`“${nome}” adicionado.`);
     $(`#novo-${lista}`)?.focus();
   });
   
   // Fechar janela clicando fora dela
   $$('dialog').forEach(janela => {
     janela.addEventListener('click', evento => { if (evento.target === janela) janela.close(); });
   });
   
   // Busca e ordenação do catálogo
   $('#buscaCatalogo').addEventListener('input', e => { filtro.busca = e.target.value; renderGrade(); });
   $('#ordemCatalogo').addEventListener('change', e => { filtro.ordem = e.target.value; renderGrade(); });
   
   // Sacola
   $('#btnSacola').addEventListener('click', () => { renderSacola(); $('#erroCheckout').textContent = ''; $('#sacola').showModal(); });
   $('#formCheckout').addEventListener('submit', finalizarPedido);
   
   // Carrossel: setas, teclado e arrastar com o dedo/mouse
   $('#btnAnterior').addEventListener('click', () => irParaDestaque(destaqueAtual - 1));
   $('#btnProximo').addEventListener('click', () => irParaDestaque(destaqueAtual + 1));
   $('#carrossel').addEventListener('keydown', e => {
     if (e.key === 'ArrowLeft') { e.preventDefault(); irParaDestaque(destaqueAtual - 1); }
     if (e.key === 'ArrowRight') { e.preventDefault(); irParaDestaque(destaqueAtual + 1); }
   });
   let inicioToque = null;
   let arrastou = false;
   $('#vitrola').addEventListener('pointerdown', e => { inicioToque = e.clientX; arrastou = false; });
   $('#vitrola').addEventListener('pointerup', e => {
     if (inicioToque === null) return;
     const distancia = e.clientX - inicioToque;
     inicioToque = null;
     if (Math.abs(distancia) > 45) {               // arrastou de verdade (não foi só um clique)
       arrastou = true;
       irParaDestaque(destaqueAtual + (distancia < 0 ? 1 : -1));
     }
   });
   $('#vitrola').addEventListener('pointercancel', () => { inicioToque = null; });
   $('#vitrola').addEventListener('dragstart', e => e.preventDefault());
   // Se arrastou, o clique que vem junto não abre a página do disco
   $('#vitrolaCapa').addEventListener('click', e => { if (arrastou) { e.preventDefault(); arrastou = false; } });

   // Galeria da página do disco pelo teclado: com o foco nas setas ou bolinhas, ← e → trocam a foto
   $('#produto').addEventListener('keydown', e => {
     if (!e.target.closest('.galeria-controles')) return;
     if (e.key === 'ArrowLeft') { e.preventDefault(); mostrarFotoProduto(fotoProduto - 1); }
     if (e.key === 'ArrowRight') { e.preventDefault(); mostrarFotoProduto(fotoProduto + 1); }
   });

   // Zoom na foto da página do disco.
   // Mouse: uma lente acompanha o cursor e o pedaço dentro dela aparece aumentado numa janela
   // ao lado da capa. Sem espaço do lado (tela estreita), a própria foto aumenta e acompanha o cursor.
   // Toque: um toque liga o zoom naquele ponto, arrastar o dedo mexe a foto e outro toque desliga.
   const FOTO_ZOOM = '.produto-capa .capa-com-foto';
   const ZOOM_JANELA = 2.5;   // as fotos têm 800px (algumas 1000px): aumentando mais que isso fica borrado
   let toqueZoom = null;   // onde o dedo encostou (pra separar toque de arrasto)
   function apontarZoom(capa, e) {
     const r = capa.getBoundingClientRect();
     const x = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
     const y = Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100));
     capa.style.setProperty('--zoom-x', `${x}%`);
     capa.style.setProperty('--zoom-y', `${y}%`);
   }
   // Mostra a lente e a janela no ponto do mouse. Devolve false se não couber a janela do lado.
   function zoomNaJanela(capa, e) {
     const moldura = capa.closest('.produto-capa');
     const m = moldura.getBoundingClientRect();
     const r = capa.getBoundingClientRect();
     const livre = moldura.closest('.produto-grade').getBoundingClientRect().right - m.right - 16;   // 16 = o 1rem do .zoom-janela
     if (livre < 220) { moldura.classList.remove('zoom-janela-ativa'); return false; }
     // Janela da altura da moldura; a lente marca o pedaço da foto que cabe nela
     const altJanela = m.height;
     const largJanela = Math.min(livre, altJanela * 1.2);
     const largLente = Math.min(r.width, largJanela / ZOOM_JANELA);
     const altLente = Math.min(r.height, altJanela / ZOOM_JANELA);
     // Lente centrada no cursor, sem sair da foto (as posições contam de dentro da borda da moldura)
     const x = Math.min(r.width - largLente, Math.max(0, e.clientX - r.left - largLente / 2));
     const y = Math.min(r.height - altLente, Math.max(0, e.clientY - r.top - altLente / 2));
     const borda = moldura.clientLeft;
     moldura.querySelector('.zoom-lente').style.cssText =
       `left:${r.left - m.left - borda + x}px; top:${r.top - m.top - borda + y}px; width:${largLente}px; height:${altLente}px`;
     const janela = moldura.querySelector('.zoom-janela');
     janela.style.cssText = `top:${-borda}px; width:${largJanela}px; height:${altJanela}px`;
     // Na janela vai a foto que está aparecendo (capa ou segunda foto), aumentada e com o mesmo corte
     const foto = moldura.querySelector(moldura.classList.contains('ver-foto2') ? '.capa-foto2' : '.capa-foto');
     const img = janela.querySelector('img');
     if (img.getAttribute('src') !== foto.getAttribute('src')) img.src = foto.src;
     img.style.cssText = `width:${r.width * ZOOM_JANELA}px; height:${r.height * ZOOM_JANELA}px; ` +
       `object-fit:${getComputedStyle(foto).objectFit}; transform:translate(${-x * ZOOM_JANELA}px, ${-y * ZOOM_JANELA}px)`;
     moldura.classList.add('zoom-janela-ativa');
     return true;
   }
   $('#produto').addEventListener('pointermove', e => {
     const capa = e.target.closest(FOTO_ZOOM);
     if (!capa) return;
     if (e.pointerType === 'mouse') capa.classList.toggle('zoom-ativo', !zoomNaJanela(capa, e));
     if (capa.classList.contains('zoom-ativo')) apontarZoom(capa, e);
   });
   $('#produto').addEventListener('pointerout', e => {
     const capa = e.target.closest(FOTO_ZOOM);
     if (capa && e.pointerType === 'mouse' && !capa.contains(e.relatedTarget)) {
       capa.classList.remove('zoom-ativo');
       capa.closest('.produto-capa').classList.remove('zoom-janela-ativa');
     }
   });
   $('#produto').addEventListener('pointerdown', e => {
     toqueZoom = e.pointerType !== 'mouse' && e.target.closest(FOTO_ZOOM) ? { x: e.clientX, y: e.clientY } : null;
   });
   $('#produto').addEventListener('pointercancel', () => { toqueZoom = null; });
   $('#produto').addEventListener('pointerup', e => {
     const capa = e.target.closest(FOTO_ZOOM);
     if (!capa || !toqueZoom) return;
     const arrastou = Math.hypot(e.clientX - toqueZoom.x, e.clientY - toqueZoom.y) > 10;
     toqueZoom = null;
     if (arrastou) return;
     apontarZoom(capa, e);
     capa.classList.toggle('zoom-ativo');
   });

   // Tema
   $('#btnTema').addEventListener('click', () => {
     const novo = temaAtual() === 'dark' ? 'light' : 'dark';
     aplicarTema(novo);
     gravar(CHAVE_TEMA, novo);
   });
   
   // Login e saída
   $('#formLogin').addEventListener('submit', e => {
     e.preventDefault();
     const usuario = e.target.elements.usuario.value.trim();
     const senha = e.target.elements.senha.value;
     const encontrado = banco.usuarios.find(u => u.login === usuario && u.senha === senha);
     if (!encontrado) {
       $('#erroLogin').textContent = 'Usuário ou senha incorretos. Confira e tente de novo.';
       return;
     }
     $('#erroLogin').textContent = '';
     logado = true;
     try { sessionStorage.setItem(CHAVE_SESSAO, '1'); } catch (err) { /* sessão só na memória */ }
     e.target.reset();
     abaAtual = 'resumo';
     renderPainel();
     $('#tab-resumo').focus();
   });
   $('#btnSair').addEventListener('click', () => {
     logado = false;
     try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (err) { /* nada a fazer */ }
     renderPainel();
   });
   $('#btnRestaurar').addEventListener('click', async () => {
     const ok = await confirmar({
       titulo: 'Restaurar os dados de exemplo?',
       texto: 'Tudo o que foi cadastrado, editado ou vendido volta ao estado inicial, e a sacola é esvaziada.',
       botao: 'Restaurar dados',
     });
     if (!ok) return;
     banco = completarCampos(dadosExemplo());   // já marca todos os discos de exemplo como vistos
     sacola = [];
     atualizarTudo();
     avisar('Dados de exemplo restaurados.');
   });

   // Exportar: baixa um arquivo .json com todos os dados da loja (pra levar pra outro computador)
   const LISTAS_BANCO = ['generos', 'artistas', 'gravadoras', 'vinis', 'estoque', 'clientes', 'usuarios', 'pedidos', 'itensPedido'];
   $('#btnExportar').addEventListener('click', () => {
     const conteudo = JSON.stringify({ sistema: 'roll-diamonds', exportadoEm: hojeISO(), banco }, null, 2);
     const link = document.createElement('a');
     link.href = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }));
     link.download = `roll-diamonds-dados-${hojeISO()}.json`;
     document.body.append(link);
     link.click();
     link.remove();
     setTimeout(() => URL.revokeObjectURL(link.href), 1000);
     avisar('Arquivo com os dados da loja baixado.');
   });

   // Importar: lê um arquivo exportado e troca os dados da loja pelos dele
   $('#btnImportar').addEventListener('click', () => $('#arquivoImportar').click());
   $('#arquivoImportar').addEventListener('change', async e => {
     const arquivo = e.target.files[0];
     e.target.value = '';   // assim dá pra escolher o mesmo arquivo de novo
     if (!arquivo) return;
     let novo = null;
     try { novo = JSON.parse(await arquivo.text()).banco; } catch (erro) { /* não é JSON */ }
     if (!novo || !LISTAS_BANCO.every(lista => Array.isArray(novo[lista]))) {
       await confirmar({ titulo: 'Arquivo inválido', texto: 'Esse arquivo não é uma exportação de dados da Roll Diamonds.', soAviso: true });
       return;
     }
     const ok = await confirmar({
       titulo: 'Importar os dados do arquivo?',
       texto: `Os dados atuais da loja serão trocados pelos do arquivo (${plural(novo.vinis.length, 'disco', 'discos')}, ${plural(novo.clientes.length, 'cliente', 'clientes')} e ${plural(novo.pedidos.length, 'pedido', 'pedidos')}), e a sacola é esvaziada.`,
       botao: 'Importar dados',
     });
     if (!ok) return;
     banco = completarCampos(novo);
     sacola = [];
     atualizarTudo();
     avisar('Dados importados.');
   });
   
   // Abas do painel (clique e setas do teclado)
   $$('.aba').forEach(aba => aba.addEventListener('click', () => { abaAtual = aba.dataset.aba; renderPainel(); }));
   $('.abas').addEventListener('keydown', e => {
     const abas = $$('.aba');
     const atual = abas.findIndex(a => a.dataset.aba === abaAtual);
     let prox = null;
     if (e.key === 'ArrowDown' || e.key === 'ArrowRight') prox = (atual + 1) % abas.length;
     if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prox = (atual - 1 + abas.length) % abas.length;
     if (prox === null) return;
     e.preventDefault();
     abaAtual = abas[prox].dataset.aba;
     renderPainel();
     abas[prox].focus();
   });
   
   // Botões e filtros do painel
   $('#btnNovoDisco').addEventListener('click', () => abrirModalDisco(0));
   $('#btnNovoCliente').addEventListener('click', () => abrirModalCliente(0));
   $('#formDisco').addEventListener('submit', salvarDisco);
   $('#formCliente').addEventListener('submit', salvarCliente);
   $('#formArtista').addEventListener('submit', salvarArtista);
   $('#buscaDiscos').addEventListener('input', e => { buscaPainel = e.target.value; renderDiscos(); });
   $('#filtroStatus').addEventListener('change', e => { filtroStatus = e.target.value; renderPedidos(); });
   
   window.addEventListener('hashchange', mostrarView);
   
