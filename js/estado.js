   /* =====================================================================
      3. ESTADO DO SISTEMA
      ===================================================================== */
   let banco = ler(CHAVE_BANCO);
   if (!banco || !Array.isArray(banco.vinis) || !Array.isArray(banco.itensPedido)) banco = dadosExemplo();

   // Textos de exemplo antigos que foram corrigidos (não só ganharam parágrafos)
   const TEXTOS_CORRIGIDOS = [
     'Sétimo disco de estúdio de Froid, lançado em 2026 pela ONErpm e apontado como um dos trabalhos mais pessoais da carreira dele. São 11 faixas, com participações de Nabhi, Cica e Major RD.',
   ];
   // Os textos de exemplo ganharam parágrafos novos. Se o texto salvo é só o começo do atual
   // (ou um texto antigo corrigido), ninguém mexeu nele pelo painel e ele pode ser atualizado.
   function textoDesatualizado(salvo, atual) {
     return Boolean(salvo) && salvo !== atual && (atual.startsWith(salvo) || TEXTOS_CORRIGIDOS.includes(salvo));
   }

   // Dados salvos por uma versão antiga do site não têm os campos novos.
   // Completa cada disco com os textos de exemplo (se for o mesmo disco) ou com valores vazios.
   function completarCampos(b) {
     adicionarDiscosNovos(b);
     const exemplo = dadosExemplo().vinis;
     b.vinis.forEach(v => {
       const base = exemplo.find(e => e.id === v.id && e.titulo === v.titulo) || {};
       if (v.capa === undefined) v.capa = base.capa ?? '';
       // Segunda foto: só preenche quando o disco de exemplo tem uma. Sem gravar '' aqui,
       // uma foto colocada depois nos dados de exemplo ainda chega em quem já tem dados salvos.
       if (v.foto2 === undefined && base.foto2) v.foto2 = base.foto2;
       if (v.pais === undefined) v.pais = base.pais ?? '';
       if (v.tamanho === undefined) v.tamanho = base.tamanho ?? 12;
       if (v.peso === undefined) v.peso = base.peso ?? null;
       if (v.descricao === undefined) v.descricao = base.descricao ?? '';
       else if (base.descricao && textoDesatualizado(v.descricao, base.descricao)) v.descricao = base.descricao;
       if (!Array.isArray(v.faixas)) v.faixas = base.faixas ?? [];
       // Versões antigas só tinham as faixas em destaque: troca pela lista completa
       // (só se ninguém mexeu nelas pelo painel, ou seja, se todas estão na lista nova)
       else if (base.faixas && v.faixas.length < base.faixas.length && v.faixas.every(f => base.faixas.includes(f))) v.faixas = base.faixas;
       if (v.observacao === undefined) v.observacao = base.observacao ?? '';
       if (v.destaque === undefined) v.destaque = base.destaque ?? false;
     });
     // Artistas salvos antes do "Sobre o artista" ganham o resumo de exemplo (se for o mesmo artista)
     const artistasExemplo = dadosExemplo().artistas;
     b.artistas.forEach(a => {
       const base = artistasExemplo.find(e => e.id === a.id && e.nome === a.nome);
       if (a.bio === undefined && base?.bio) a.bio = base.bio;
       else if (base?.bio && textoDesatualizado(a.bio, base.bio)) a.bio = base.bio;
     });
     return b;
   }

   // Discos que entraram nos dados de exemplo depois que o navegador já tinha dados salvos.
   // Cada um entra uma vez só: "exemplosVistos" guarda os que já foram oferecidos, assim um
   // disco apagado pelo painel não volta. Dados salvos antes dessa lista já tinham os discos 1 a 17.
   function adicionarDiscosNovos(b) {
     const ex = dadosExemplo();
     const vistos = new Set(Array.isArray(b.exemplosVistos) ? b.exemplosVistos : ex.vinis.filter(v => v.id <= 17).map(v => v.id));
     const maiorId = lista => lista.reduce((maior, item) => Math.max(maior, item.id), 0);
     // Artista, gênero ou gravadora: usa o cadastro de mesmo nome ou cria (com outro id se o de exemplo já estiver em uso)
     const garantir = (lista, listaExemplo, id) => {
       const modelo = listaExemplo.find(item => item.id === id);
       const igual = lista.find(item => item.nome === modelo.nome);
       if (igual) return igual.id;
       const novo = { ...modelo, id: lista.some(item => item.id === id) ? maiorId(lista) + 1 : id };
       lista.push(novo);
       return novo.id;
     };
     ex.vinis.forEach(e => {
       if (vistos.has(e.id)) return;
       vistos.add(e.id);
       if (b.vinis.some(v => v.titulo === e.titulo)) return;   // a loja já tem esse disco
       const id = b.vinis.some(v => v.id === e.id) ? maiorId(b.vinis) + 1 : e.id;
       b.vinis.push({
         ...e, id,
         artistaId: garantir(b.artistas, ex.artistas, e.artistaId),
         generoId: garantir(b.generos, ex.generos, e.generoId),
         gravadoraId: garantir(b.gravadoras, ex.gravadoras, e.gravadoraId),
       });
       b.estoque = b.estoque.filter(linha => linha.vinilId !== id);
       b.estoque.push({ vinilId: id, quantidade: ex.estoque.find(linha => linha.vinilId === e.id)?.quantidade ?? 0 });
     });
     b.exemplosVistos = [...vistos];
   }
   banco = completarCampos(banco);
   
   let sacola = ler(CHAVE_SACOLA);            // [{ vinilId, quantidade }]
   if (!Array.isArray(sacola)) sacola = [];
   
   let logado = false;
   try { logado = sessionStorage.getItem(CHAVE_SESSAO) === '1'; } catch (e) { /* sem sessão salva */ }
   
   const filtro = { busca: '', genero: 0, ordem: 'prateleira' };
   let abaAtual = 'resumo';
   let viewAtual = '';          // 'loja', 'painel' ou 'disco'
   let discoAberto = 0;         // id do disco mostrado na página do disco
   let fotoProduto = 0;         // foto aberta na página do disco (0 = capa, 1 = segunda foto)
   let destaqueAtual = 0;       // posição do disco no carrossel
   let posicaoLoja = null;      // onde a loja estava rolada antes de abrir um disco
   let irParaCatalogo = false;  // true quando um link pede o catálogo do topo (filtro de gênero)
   const TITULO_SITE = document.title;
   const semMovimento = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
   // Só aparelho com mouse vê a segunda foto (no celular ela nem é baixada)
   const temMouse = window.matchMedia && matchMedia('(hover: hover)').matches;
   let buscaPainel = '';
   let filtroStatus = 'todos';
   
   /* Consultas rápidas (fazem o papel dos SELECT com JOIN) */
   const porId = (lista, id) => lista.find(item => item.id === id);
   const nomeDe = (lista, id) => porId(lista, id)?.nome ?? 'Sem cadastro';
   const proximoId = lista => lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
   function qtdEstoque(vinilId) {
     return banco.estoque.find(e => e.vinilId === vinilId)?.quantidade ?? 0;
   }
   function definirEstoque(vinilId, quantidade) {
     let linha = banco.estoque.find(e => e.vinilId === vinilId);
     if (!linha) { linha = { vinilId, quantidade: 0 }; banco.estoque.push(linha); }
     linha.quantidade = Math.max(0, quantidade);
   }
   const itensDoPedido = pedidoId => banco.itensPedido.filter(i => i.pedidoId === pedidoId);
   const totalPedido = pedidoId => itensDoPedido(pedidoId).reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);
   const qtdItensPedido = pedidoId => itensDoPedido(pedidoId).reduce((s, i) => s + i.quantidade, 0);
   
   /* Salva e redesenha tudo depois de qualquer alteração */
   function atualizarTudo() {
     gravar(CHAVE_BANCO, banco);
     renderChips();
     renderGrade();
     renderDestaque();
     renderSacola();
     if (viewAtual === 'disco') renderRelacionados();
     if (logado && !$('#pagina-painel').hidden) renderPainel();
   }
   
   /* Aviso rápido na parte de baixo da tela */
   let timerAviso;
   function avisar(mensagem) {
     const el = $('#aviso');
     el.textContent = mensagem;
     el.classList.add('visivel');
     clearTimeout(timerAviso);
     timerAviso = setTimeout(() => el.classList.remove('visivel'), 3800);
   }
   
   /* Janela de confirmação (devolve true ou false) */
   function confirmar({ titulo, texto, botao = 'Confirmar', soAviso = false }) {
     const janela = $('#modalConfirmar');
     $('#tituloConfirmar').textContent = titulo;
     $('#textoConfirmar').textContent = texto;
     const sim = $('#btnConfirmarSim');
     sim.textContent = soAviso ? 'Entendi' : botao;
     sim.className = 'botao ' + (soAviso ? 'botao-verde' : 'botao-perigo');
     $('#btnConfirmarNao').hidden = soAviso;
     janela.returnValue = '';
     janela.showModal();
     return new Promise(resolve => {
       janela.addEventListener('close', () => resolve(!soAviso && janela.returnValue === 'sim'), { once: true });
     });
   }
   
