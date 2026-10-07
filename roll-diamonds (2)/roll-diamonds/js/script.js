'use strict';

/* =====================================================================
   1. CONSTANTES E FUNÇÕES DE APOIO
   ===================================================================== */
const CHAVE_BANCO  = 'rolldiamonds:banco:v1';
const CHAVE_SACOLA = 'rolldiamonds:sacola:v1';
const CHAVE_TEMA   = 'rolldiamonds:tema';
const CHAVE_SESSAO = 'rolldiamonds:sessao';

const STATUS = ['Aguardando pagamento', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];

// Cores das capas geradas: [fundo, desenho, letra do título]
const PALETAS = [
  ['#1d4630', '#dbbb7e', '#f0ddb3'],
  ['#8a3b22', '#e2b659', '#f6e6c4'],
  ['#2b1c12', '#b99155', '#f0ddb3'],
  ['#e8d3a4', '#006635', '#23170f'],
  ['#2c3e57', '#d9a441', '#f3e4c6'],
  ['#b5552b', '#2b1c12', '#f6e6c4'],
  ['#4d2a38', '#dbbb7e', '#f0ddb3'],
  ['#c9a15a', '#2b1c12', '#23170f'],
];
const ESTILOS = ['listras', 'sol', 'circulos', 'dividido', 'ponto'];

const $  = (seletor, base = document) => base.querySelector(seletor);
const $$ = (seletor, base = document) => [...base.querySelectorAll(seletor)];

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moeda = valor => formatoMoeda.format(valor);
const dataBR = iso => iso.split('-').reverse().join('/');
function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Tira acentos e deixa minúsculo (pra busca achar "joao" em "João")
const normalizar = texto => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// Protege contra HTML digitado pelo usuário
function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// localStorage pode estar bloqueado: por isso sempre dentro de try/catch
function ler(chave) {
  try { const t = localStorage.getItem(chave); return t ? JSON.parse(t) : null; } catch (e) { return null; }
}
function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* segue só na memória */ }
}

/* =====================================================================
   2. DADOS DE EXEMPLO
   Cada lista espelha uma tabela do banco roll_diamonds:
   genero_musical, artista, gravadora, vinil, estoque, cliente,
   usuario, pedido e item_pedido.
   ===================================================================== */
function dadosExemplo() {
  return {
    generos: [
      { id: 1, nome: 'MPB' }, { id: 2, nome: 'Rock' }, { id: 3, nome: 'Jazz' },
      { id: 4, nome: 'Soul e Funk' }, { id: 5, nome: 'Bossa Nova' }, { id: 6, nome: 'Rap' },
    ],
    artistas: [
      { id: 1, nome: 'Milton Nascimento & Lô Borges' }, { id: 2, nome: 'Novos Baianos' },
      { id: 3, nome: 'Tim Maia' }, { id: 4, nome: 'Jorge Ben' }, { id: 5, nome: 'Miles Davis' },
      { id: 6, nome: 'The Beatles' }, { id: 7, nome: 'Fleetwood Mac' },
      { id: 8, nome: 'Chico Science & Nação Zumbi' }, { id: 9, nome: 'Chico Buarque' },
      { id: 10, nome: 'Marvin Gaye' }, { id: 11, nome: 'Elis Regina & Tom Jobim' },
      { id: 12, nome: "Racionais MC's" }, { id: 13, nome: 'John Coltrane' },
      { id: 14, nome: 'Os Mutantes' }, { id: 15, nome: 'AC/DC' },
      { id: 16, nome: 'Stan Getz & João Gilberto' },
    ],
    gravadoras: [
      { id: 1, nome: 'EMI-Odeon' }, { id: 2, nome: 'Som Livre' }, { id: 3, nome: 'Polydor' },
      { id: 4, nome: 'Philips' }, { id: 5, nome: 'Columbia' }, { id: 6, nome: 'Apple' },
      { id: 7, nome: 'Warner' }, { id: 8, nome: 'Chaos' }, { id: 9, nome: 'Seroma' },
      { id: 10, nome: 'Tamla' }, { id: 11, nome: 'Cosa Nostra' }, { id: 12, nome: 'Impulse!' },
      { id: 13, nome: 'Atlantic' }, { id: 14, nome: 'Verve' },
    ],
    vinis: [
      { id: 1,  titulo: 'Clube da Esquina',        artistaId: 1,  generoId: 1, gravadoraId: 1,  ano: 1972, preco: 289.90, condicao: 'Usado' },
      { id: 2,  titulo: 'Acabou Chorare',          artistaId: 2,  generoId: 1, gravadoraId: 2,  ano: 1972, preco: 249.90, condicao: 'Novo' },
      { id: 3,  titulo: 'Tim Maia',                artistaId: 3,  generoId: 4, gravadoraId: 3,  ano: 1971, preco: 199.90, condicao: 'Novo' },
      { id: 4,  titulo: 'A Tábua de Esmeralda',    artistaId: 4,  generoId: 1, gravadoraId: 4,  ano: 1974, preco: 229.90, condicao: 'Usado' },
      { id: 5,  titulo: 'Kind of Blue',            artistaId: 5,  generoId: 3, gravadoraId: 5,  ano: 1959, preco: 219.90, condicao: 'Novo' },
      { id: 6,  titulo: 'Abbey Road',              artistaId: 6,  generoId: 2, gravadoraId: 6,  ano: 1969, preco: 329.90, condicao: 'Novo' },
      { id: 7,  titulo: 'Rumours',                 artistaId: 7,  generoId: 2, gravadoraId: 7,  ano: 1977, preco: 279.90, condicao: 'Usado' },
      { id: 8,  titulo: 'Da Lama ao Caos',         artistaId: 8,  generoId: 2, gravadoraId: 8,  ano: 1994, preco: 239.90, condicao: 'Novo' },
      { id: 9,  titulo: 'Construção',              artistaId: 9,  generoId: 1, gravadoraId: 4,  ano: 1971, preco: 269.90, condicao: 'Usado' },
      { id: 10, titulo: 'Racional Vol. 1',         artistaId: 3,  generoId: 4, gravadoraId: 9,  ano: 1975, preco: 349.90, condicao: 'Usado' },
      { id: 11, titulo: "What's Going On",         artistaId: 10, generoId: 4, gravadoraId: 10, ano: 1971, preco: 239.90, condicao: 'Novo' },
      { id: 12, titulo: 'Elis & Tom',              artistaId: 11, generoId: 5, gravadoraId: 4,  ano: 1974, preco: 259.90, condicao: 'Novo' },
      { id: 13, titulo: 'Sobrevivendo no Inferno', artistaId: 12, generoId: 6, gravadoraId: 11, ano: 1997, preco: 279.90, condicao: 'Novo' },
      { id: 14, titulo: 'A Love Supreme',          artistaId: 13, generoId: 3, gravadoraId: 12, ano: 1965, preco: 189.90, condicao: 'Novo' },
      { id: 15, titulo: 'Os Mutantes',             artistaId: 14, generoId: 2, gravadoraId: 3,  ano: 1968, preco: 299.90, condicao: 'Usado' },
      { id: 16, titulo: 'Back in Black',           artistaId: 15, generoId: 2, gravadoraId: 13, ano: 1980, preco: 259.90, condicao: 'Novo' },
      { id: 17, titulo: 'Getz/Gilberto',           artistaId: 16, generoId: 5, gravadoraId: 14, ano: 1964, preco: 239.90, condicao: 'Usado' },
    ],
    estoque: [
      { vinilId: 1, quantidade: 2 }, { vinilId: 2, quantidade: 4 }, { vinilId: 3, quantidade: 3 },
      { vinilId: 4, quantidade: 1 }, { vinilId: 5, quantidade: 5 }, { vinilId: 6, quantidade: 6 },
      { vinilId: 7, quantidade: 2 }, { vinilId: 8, quantidade: 4 }, { vinilId: 9, quantidade: 1 },
      { vinilId: 10, quantidade: 0 }, { vinilId: 11, quantidade: 3 }, { vinilId: 12, quantidade: 5 },
      { vinilId: 13, quantidade: 7 }, { vinilId: 14, quantidade: 3 }, { vinilId: 15, quantidade: 2 },
      { vinilId: 16, quantidade: 4 }, { vinilId: 17, quantidade: 2 },
    ],
    clientes: [
      { id: 1, nome: 'Marina Couto',        email: 'marina.couto@email.com',   telefone: '(11) 98765-4321', cidade: 'São Paulo' },
      { id: 2, nome: 'Rafael Tanaka',       email: 'rafael.tanaka@email.com',  telefone: '(11) 97654-3210', cidade: 'Santo André' },
      { id: 3, nome: 'Beatriz Alencar',     email: 'bia.alencar@email.com',    telefone: '(11) 96543-2109', cidade: 'São Paulo' },
      { id: 4, nome: 'João Pedro Siqueira', email: 'jp.siqueira@email.com',    telefone: '(19) 99876-5432', cidade: 'Campinas' },
      { id: 5, nome: 'Lúcia Fernandes',     email: 'lucia.fernandes@email.com', telefone: '(11) 95432-1098', cidade: 'Guarulhos' },
    ],
    // Senha em texto puro só porque é demonstração.
    // Num sistema de verdade a senha fica no servidor, guardada com hash.
    usuarios: [{ id: 1, login: 'admin', senha: 'roll123', nome: 'Administrador' }],
    pedidos: [
      { id: 1001, clienteId: 1, data: '2026-09-03', status: 'Entregue' },
      { id: 1002, clienteId: 2, data: '2026-09-11', status: 'Entregue' },
      { id: 1003, clienteId: 3, data: '2026-09-18', status: 'Enviado' },
      { id: 1004, clienteId: 4, data: '2026-09-24', status: 'Pago' },
      { id: 1005, clienteId: 1, data: '2026-09-28', status: 'Aguardando pagamento' },
      { id: 1006, clienteId: 5, data: '2026-09-29', status: 'Cancelado' },
    ],
    itensPedido: [
      { id: 1, pedidoId: 1001, vinilId: 5,  quantidade: 1, precoUnitario: 219.90 },
      { id: 2, pedidoId: 1001, vinilId: 12, quantidade: 1, precoUnitario: 259.90 },
      { id: 3, pedidoId: 1002, vinilId: 6,  quantidade: 1, precoUnitario: 329.90 },
      { id: 4, pedidoId: 1003, vinilId: 13, quantidade: 1, precoUnitario: 279.90 },
      { id: 5, pedidoId: 1003, vinilId: 8,  quantidade: 1, precoUnitario: 239.90 },
      { id: 6, pedidoId: 1004, vinilId: 3,  quantidade: 1, precoUnitario: 199.90 },
      { id: 7, pedidoId: 1005, vinilId: 14, quantidade: 1, precoUnitario: 189.90 },
      { id: 8, pedidoId: 1006, vinilId: 7,  quantidade: 1, precoUnitario: 279.90 },
    ],
  };
}

/* =====================================================================
   3. ESTADO DO SISTEMA
   ===================================================================== */
let banco = ler(CHAVE_BANCO);
if (!banco || !Array.isArray(banco.vinis) || !Array.isArray(banco.itensPedido)) banco = dadosExemplo();

let sacola = ler(CHAVE_SACOLA);            // [{ vinilId, quantidade }]
if (!Array.isArray(sacola)) sacola = [];

let logado = false;
try { logado = sessionStorage.getItem(CHAVE_SESSAO) === '1'; } catch (e) { /* sem sessão salva */ }

const filtro = { busca: '', genero: 0, ordem: 'prateleira' };
let abaAtual = 'resumo';
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
  if (logado && !$('#painel').hidden) renderPainel();
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

/* =====================================================================
   4. CAPAS GERADAS (sem imagem externa)
   ===================================================================== */
function coresCapa(v) {
  const [c1, c2, c3] = PALETAS[(v.id * 5) % PALETAS.length];
  return `--c1:${c1};--c2:${c2};--c3:${c3}`;
}
function capaHTML(v, mini = false) {
  const estilo = ESTILOS[v.id % ESTILOS.length];
  const classes = `capa capa-${estilo}${v.condicao === 'Usado' ? ' capa-usada' : ''}${mini ? ' capa-mini' : ''}`;
  const titulo = mini ? '' : `<span class="capa-titulo">${esc(v.titulo)}</span>`;
  return `<div class="${classes}" style="${coresCapa(v)}" aria-hidden="true">${titulo}</div>`;
}

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
      <div class="disco-capa-area" style="${coresCapa(v)}">
        <div class="disco-bolacha" aria-hidden="true"></div>
        ${capaHTML(v)}
      </div>
      <div class="disco-info">
        <h3>${esc(v.titulo)}</h3>
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

function renderDestaque() {
  const v = porId(banco.vinis, 1) || banco.vinis[0];
  const botao = $('#btnDestaque');
  if (!v) {
    $('#destaqueTitulo').textContent = 'Nenhum disco na vitrola';
    $('#destaqueArtista').textContent = 'Cadastre um disco no painel da loja.';
    botao.hidden = true;
    return;
  }
  $('#destaqueTitulo').textContent = v.titulo;
  $('#destaqueArtista').textContent = nomeDe(banco.artistas, v.artistaId);
  const esgotado = qtdEstoque(v.id) === 0;
  botao.hidden = false;
  botao.dataset.id = v.id;
  botao.disabled = esgotado;
  botao.textContent = esgotado ? 'Esgotado no momento' : 'Pôr esse na sacola';
}

/* Sulcos do disco da vitrine (círculos finos + 3 separações de faixa) */
function desenharSulcos() {
  let html = '';
  for (let r = 76; r <= 192; r += 2.4) {
    const separacao = [104, 138, 168].some(x => Math.abs(r - x) < 1.3);
    const cor = separacao ? 'rgba(240,221,179,.11)' : 'rgba(240,221,179,.035)';
    html += `<circle cx="200" cy="200" r="${r.toFixed(1)}" fill="none" stroke="${cor}" stroke-width="${separacao ? 1.8 : 1}"/>`;
  }
  $('#sulcos').innerHTML = html;
}

/* =====================================================================
   6. SACOLA E FINALIZAÇÃO DO PEDIDO
   ===================================================================== */
function adicionarNaSacola(vinilId) {
  const v = porId(banco.vinis, vinilId);
  if (!v) return;
  const disponivel = qtdEstoque(vinilId);
  const item = sacola.find(i => i.vinilId === vinilId);
  const jaTem = item ? item.quantidade : 0;
  if (jaTem >= disponivel) {
    avisar(disponivel === 0 ? 'Esse disco está esgotado.' : `Temos só ${plural(disponivel, 'unidade', 'unidades')} de “${v.titulo}”, e ${disponivel === 1 ? 'ela já está' : 'todas já estão'} na sua sacola.`);
    return;
  }
  if (item) item.quantidade++; else sacola.push({ vinilId, quantidade: 1 });
  renderSacola();
  avisar(`“${v.titulo}” foi para a sacola.`);
}

function renderSacola() {
  sacola = sacola.filter(i => porId(banco.vinis, i.vinilId));
  gravar(CHAVE_SACOLA, sacola);

  const total = sacola.reduce((s, i) => s + i.quantidade * porId(banco.vinis, i.vinilId).preco, 0);
  const n = sacola.reduce((s, i) => s + i.quantidade, 0);
  const contagem = $('#contagemSacola');
  contagem.textContent = n;
  contagem.hidden = n === 0;
  $('#btnSacola').setAttribute('aria-label', n ? `Sacola, ${plural(n, 'disco', 'discos')}` : 'Sacola, vazia');

  $('#sacolaVazia').hidden = n > 0;
  $('#sacolaRodape').hidden = n === 0;
  $('#totalSacola').textContent = moeda(total);
  $('#listaSacola').innerHTML = sacola.map(i => {
    const v = porId(banco.vinis, i.vinilId);
    const limite = qtdEstoque(v.id);
    return `
      <li class="item-sacola">
        ${capaHTML(v, true)}
        <div class="item-sacola-info">
          <strong>${esc(v.titulo)}</strong>
          <span>${esc(nomeDe(banco.artistas, v.artistaId))}</span>
          <span>${moeda(v.preco)} cada</span>
        </div>
        <div class="item-sacola-acoes">
          <div class="contador">
            <button type="button" data-acao="sacola-menos" data-id="${v.id}" aria-label="Tirar uma unidade de ${esc(v.titulo)}">−</button>
            <output aria-label="Quantidade">${i.quantidade}</output>
            <button type="button" data-acao="sacola-mais" data-id="${v.id}" aria-label="Pôr mais uma unidade de ${esc(v.titulo)}" ${i.quantidade >= limite ? 'disabled' : ''}>+</button>
          </div>
          <button class="botao-link perigo" type="button" data-acao="sacola-remover" data-id="${v.id}">Remover</button>
        </div>
      </li>`;
  }).join('');
}

function finalizarPedido(evento) {
  evento.preventDefault();
  const form = evento.target;
  const nome = form.elements.nome.value.trim();
  const email = form.elements.email.value.trim();
  const erro = $('#erroCheckout');
  erro.textContent = '';
  if (!sacola.length) return;
  if (!nome) { erro.textContent = 'Informe seu nome.'; return; }

  // Confere o estoque de novo antes de fechar o pedido
  for (const i of sacola) {
    const v = porId(banco.vinis, i.vinilId);
    if (i.quantidade > qtdEstoque(i.vinilId)) {
      erro.textContent = `“${v.titulo}” tem só ${plural(qtdEstoque(i.vinilId), 'unidade', 'unidades')} agora. Ajuste a quantidade e finalize de novo.`;
      renderSacola();
      return;
    }
  }

  // Cliente: usa o cadastro existente (mesmo e-mail) ou cria um novo
  let cliente = banco.clientes.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (!cliente) {
    cliente = { id: proximoId(banco.clientes), nome, email, telefone: '', cidade: '' };
    banco.clientes.push(cliente);
  }

  // INSERT em pedido + item_pedido, e baixa no estoque
  const pedido = { id: proximoId(banco.pedidos), clienteId: cliente.id, data: hojeISO(), status: 'Aguardando pagamento' };
  banco.pedidos.push(pedido);
  for (const i of sacola) {
    const v = porId(banco.vinis, i.vinilId);
    banco.itensPedido.push({ id: proximoId(banco.itensPedido), pedidoId: pedido.id, vinilId: v.id, quantidade: i.quantidade, precoUnitario: v.preco });
    definirEstoque(v.id, qtdEstoque(v.id) - i.quantidade);
  }

  sacola = [];
  form.reset();
  $('#sacola').close();
  atualizarTudo();
  avisar(`Pedido nº ${pedido.id} registrado. Ele já aparece no painel da loja.`);
}

/* =====================================================================
   7. PAINEL
   ===================================================================== */
function renderPainel() {
  $('#painelLogin').hidden = logado;
  $('#painelConteudo').hidden = !logado;
  if (!logado) return;

  $$('.aba').forEach(aba => {
    const ativa = aba.dataset.aba === abaAtual;
    aba.setAttribute('aria-selected', ativa);
    aba.tabIndex = ativa ? 0 : -1;
  });
  $$('.aba-painel').forEach(sec => { sec.hidden = sec.id !== `aba-${abaAtual}`; });

  const desenhar = { resumo: renderResumo, discos: renderDiscos, clientes: renderClientes, pedidos: renderPedidos, cadastros: renderCadastros };
  desenhar[abaAtual]();
}

function renderResumo() {
  $('#dataHoje').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const unidades = banco.estoque.reduce((s, e) => s + e.quantidade, 0);
  const aDespachar = banco.pedidos.filter(p => p.status === 'Aguardando pagamento' || p.status === 'Pago').length;
  const vendido = banco.pedidos.filter(p => p.status !== 'Cancelado').reduce((s, p) => s + totalPedido(p.id), 0);
  const numeros = [
    ['Discos no estoque', unidades],
    ['Títulos no catálogo', banco.vinis.length],
    ['Pedidos a despachar', aDespachar],
    ['Total vendido', moeda(vendido)],
  ];
  $('#numeros').innerHTML = numeros.map(([rotulo, valor]) => `<div class="numero"><dt>${rotulo}</dt><dd>${valor}</dd></div>`).join('');

  const baixos = banco.vinis.filter(v => qtdEstoque(v.id) <= 2).sort((a, b) => qtdEstoque(a.id) - qtdEstoque(b.id));
  $('#listaEstoqueBaixo').innerHTML = baixos.length
    ? baixos.map(v => {
        const q = qtdEstoque(v.id);
        return `<li>
          ${capaHTML(v, true)}
          <div class="cresce"><strong>${esc(v.titulo)}</strong><span>${q === 0 ? 'Esgotado' : plural(q, 'unidade', 'unidades')}</span></div>
          <button class="botao botao-contorno botao-pequeno" type="button" data-acao="repor" data-id="${v.id}" aria-label="Repor uma unidade de ${esc(v.titulo)}">Repor 1</button>
        </li>`;
      }).join('')
    : '<li class="vazio-linha">Todos os discos têm 3 unidades ou mais.</li>';

  const ultimos = [...banco.pedidos].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id).slice(0, 5);
  $('#listaUltimosPedidos').innerHTML = ultimos.length
    ? ultimos.map(p => `<li>
        <div class="cresce"><strong>Nº ${p.id}, ${esc(nomeDe(banco.clientes, p.clienteId))}</strong><span>${dataBR(p.data)}, ${p.status.toLowerCase()}</span></div>
        <span class="num">${moeda(totalPedido(p.id))}</span>
      </li>`).join('')
    : '<li class="vazio-linha">Nenhum pedido ainda. Eles aparecem aqui quando alguém finaliza a sacola.</li>';
}

function renderDiscos() {
  const termo = normalizar(buscaPainel.trim());
  const lista = banco.vinis.filter(v => !termo || normalizar(`${v.titulo} ${nomeDe(banco.artistas, v.artistaId)}`).includes(termo));
  $('#corpoDiscos').innerHTML = lista.length ? lista.map(v => {
    const q = qtdEstoque(v.id);
    return `<tr>
      <td><div class="celula-disco">${capaHTML(v, true)}<div><strong>${esc(v.titulo)}</strong><span>${esc(nomeDe(banco.artistas, v.artistaId))}</span></div></div></td>
      <td>${esc(nomeDe(banco.generos, v.generoId))}</td>
      <td><div class="celula-dupla">${v.ano}<span>${esc(nomeDe(banco.gravadoras, v.gravadoraId))}</span></div></td>
      <td>${v.condicao}</td>
      <td class="num">${moeda(v.preco)}</td>
      <td>
        <div class="contador">
          <button type="button" data-acao="estoque-menos" data-id="${v.id}" aria-label="Tirar uma unidade de ${esc(v.titulo)} do estoque" ${q === 0 ? 'disabled' : ''}>−</button>
          <output aria-label="Unidades em estoque">${q}</output>
          <button type="button" data-acao="estoque-mais" data-id="${v.id}" aria-label="Pôr uma unidade de ${esc(v.titulo)} no estoque">+</button>
        </div>
      </td>
      <td class="acoes-celula">
        <button class="botao-link" type="button" data-acao="editar-disco" data-id="${v.id}">Editar</button>
        <button class="botao-link perigo" type="button" data-acao="excluir-disco" data-id="${v.id}">Excluir</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="7">Nenhum disco encontrado${termo ? ` para “${esc(buscaPainel.trim())}”` : ''}.</td></tr>`;
}

function renderClientes() {
  const lista = [...banco.clientes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  $('#corpoClientes').innerHTML = lista.length ? lista.map(c => {
    const qtd = banco.pedidos.filter(p => p.clienteId === c.id).length;
    return `<tr>
      <td><strong>${esc(c.nome)}</strong></td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.telefone) || '<span class="contagem-texto">Não informado</span>'}</td>
      <td>${esc(c.cidade) || '<span class="contagem-texto">Não informada</span>'}</td>
      <td class="num">${qtd}</td>
      <td class="acoes-celula">
        <button class="botao-link" type="button" data-acao="editar-cliente" data-id="${c.id}">Editar</button>
        <button class="botao-link perigo" type="button" data-acao="excluir-cliente" data-id="${c.id}">Excluir</button>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="6">Nenhum cliente cadastrado ainda.</td></tr>';
}

function renderPedidos() {
  const select = $('#filtroStatus');
  if (!select.options.length) {
    select.innerHTML = `<option value="todos">Todos os pedidos</option>` + STATUS.map(s => `<option value="${s}">${s}</option>`).join('');
  }
  select.value = filtroStatus;

  const lista = banco.pedidos
    .filter(p => filtroStatus === 'todos' || p.status === filtroStatus)
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);

  $('#corpoPedidos').innerHTML = lista.length ? lista.map(p => {
    const cancelado = p.status === 'Cancelado';
    return `<tr class="${cancelado ? 'status-cancelado' : ''}">
      <td><strong>${p.id}</strong></td>
      <td>${dataBR(p.data)}</td>
      <td>${esc(nomeDe(banco.clientes, p.clienteId))}</td>
      <td class="num">${qtdItensPedido(p.id)}</td>
      <td class="num">${moeda(totalPedido(p.id))}</td>
      <td>
        <select class="select-status" data-acao="status" data-id="${p.id}" aria-label="Situação do pedido ${p.id}" ${cancelado ? 'disabled' : ''}>
          ${STATUS.map(s => `<option${s === p.status ? ' selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="acoes-celula"><button class="botao-link" type="button" data-acao="ver-itens" data-id="${p.id}">Ver discos</button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7">Nenhum pedido com essa situação.</td></tr>';
}

const TIPOS_CADASTRO = [
  { chave: 'generos',    titulo: 'Gêneros musicais', campo: 'generoId',    rotulo: 'Novo gênero' },
  { chave: 'artistas',   titulo: 'Artistas',         campo: 'artistaId',   rotulo: 'Novo artista' },
  { chave: 'gravadoras', titulo: 'Gravadoras',       campo: 'gravadoraId', rotulo: 'Nova gravadora' },
];
function renderCadastros() {
  $('#gradeCadastros').innerHTML = TIPOS_CADASTRO.map(tipo => {
    const itens = [...banco[tipo.chave]].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return `<div class="bloco">
      <h3>${tipo.titulo}</h3>
      <p class="bloco-sub">${plural(itens.length, 'cadastrado', 'cadastrados')}</p>
      <form class="form-cadastro" data-tipo="${tipo.chave}">
        <label class="sr" for="novo-${tipo.chave}">${tipo.rotulo}</label>
        <input id="novo-${tipo.chave}" name="nome" placeholder="${tipo.rotulo}" required maxlength="80" autocomplete="off">
        <button class="botao botao-verde botao-pequeno" type="submit">Adicionar</button>
      </form>
      <ul class="lista-simples">
        ${itens.map(item => {
          const usos = banco.vinis.filter(v => v[tipo.campo] === item.id).length;
          return `<li>
            <div class="cresce"><strong>${esc(item.nome)}</strong><span>${usos ? plural(usos, 'disco', 'discos') : 'Nenhum disco'}</span></div>
            ${usos ? '' : `<button class="botao-link perigo" type="button" data-acao="remover-cadastro" data-tipo="${tipo.chave}" data-id="${item.id}" aria-label="Remover ${esc(item.nome)}">Remover</button>`}
          </li>`;
        }).join('')}
      </ul>
    </div>`;
  }).join('');
}

/* ---------- Formulário de disco ---------- */
function preencherSelect(seletor, lista, selecionado) {
  const ordenada = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  $(seletor).innerHTML = '<option value="">Escolha…</option>' +
    ordenada.map(i => `<option value="${i.id}"${i.id === selecionado ? ' selected' : ''}>${esc(i.nome)}</option>`).join('');
}
function abrirModalDisco(id) {
  const v = id ? porId(banco.vinis, id) : null;
  const f = $('#formDisco');
  f.reset();
  $('#erroDisco').textContent = '';
  $('#tituloModalDisco').textContent = v ? 'Editar disco' : 'Cadastrar disco';
  $('#btnSalvarDisco').textContent = v ? 'Salvar alterações' : 'Cadastrar disco';
  preencherSelect('#discoArtista', banco.artistas, v?.artistaId);
  preencherSelect('#discoGenero', banco.generos, v?.generoId);
  preencherSelect('#discoGravadora', banco.gravadoras, v?.gravadoraId);
  f.elements.id.value = v ? v.id : '';
  f.elements.titulo.value = v ? v.titulo : '';
  f.elements.ano.value = v ? v.ano : '';
  f.elements.condicao.value = v ? v.condicao : 'Novo';
  f.elements.preco.value = v ? v.preco.toFixed(2) : '';
  f.elements.quantidade.value = v ? qtdEstoque(v.id) : 1;
  $('#modalDisco').showModal();
}
function salvarDisco(evento) {
  evento.preventDefault();
  const f = evento.target;
  const id = Number(f.elements.id.value) || 0;
  const dados = {
    titulo: f.elements.titulo.value.trim(),
    artistaId: Number(f.elements.artista.value),
    generoId: Number(f.elements.genero.value),
    gravadoraId: Number(f.elements.gravadora.value),
    ano: Number(f.elements.ano.value),
    condicao: f.elements.condicao.value,
    preco: Math.round(Number(f.elements.preco.value) * 100) / 100,
  };
  const quantidade = Math.max(0, Math.floor(Number(f.elements.quantidade.value) || 0));
  if (!dados.titulo) { $('#erroDisco').textContent = 'Informe o título do disco.'; return; }
  if (!(dados.preco > 0)) { $('#erroDisco').textContent = 'Informe um preço maior que zero.'; return; }

  if (id) {
    Object.assign(porId(banco.vinis, id), dados);
    definirEstoque(id, quantidade);
    avisar(`Alterações em “${dados.titulo}” salvas.`);
  } else {
    const novo = { id: proximoId(banco.vinis), ...dados };
    banco.vinis.push(novo);
    definirEstoque(novo.id, quantidade);
    avisar(`“${dados.titulo}” cadastrado. Ele já aparece no catálogo.`);
  }
  $('#modalDisco').close();
  atualizarTudo();
}

/* ---------- Formulário de cliente ---------- */
function abrirModalCliente(id) {
  const c = id ? porId(banco.clientes, id) : null;
  const f = $('#formCliente');
  f.reset();
  $('#erroCliente').textContent = '';
  $('#tituloModalCliente').textContent = c ? 'Editar cliente' : 'Cadastrar cliente';
  $('#btnSalvarCliente').textContent = c ? 'Salvar alterações' : 'Cadastrar cliente';
  f.elements.id.value = c ? c.id : '';
  f.elements.nome.value = c ? c.nome : '';
  f.elements.email.value = c ? c.email : '';
  f.elements.telefone.value = c ? c.telefone : '';
  f.elements.cidade.value = c ? c.cidade : '';
  $('#modalCliente').showModal();
}
function salvarCliente(evento) {
  evento.preventDefault();
  const f = evento.target;
  const id = Number(f.elements.id.value) || 0;
  const dados = {
    nome: f.elements.nome.value.trim(),
    email: f.elements.email.value.trim(),
    telefone: f.elements.telefone.value.trim(),
    cidade: f.elements.cidade.value.trim(),
  };
  if (!dados.nome) { $('#erroCliente').textContent = 'Informe o nome do cliente.'; return; }
  const repetido = banco.clientes.find(c => c.id !== id && c.email.toLowerCase() === dados.email.toLowerCase());
  if (repetido) { $('#erroCliente').textContent = `Esse e-mail já é de ${repetido.nome}. Use outro e-mail.`; return; }

  if (id) { Object.assign(porId(banco.clientes, id), dados); avisar(`Cadastro de ${dados.nome} atualizado.`); }
  else { banco.clientes.push({ id: proximoId(banco.clientes), ...dados }); avisar(`${dados.nome} cadastrado.`); }
  $('#modalCliente').close();
  atualizarTudo();
}

/* ---------- Pedidos ---------- */
function abrirItensPedido(id) {
  const p = porId(banco.pedidos, id);
  if (!p) return;
  $('#tituloModalItens').textContent = `Pedido nº ${p.id}`;
  $('#infoPedido').textContent = `${nomeDe(banco.clientes, p.clienteId)}, ${dataBR(p.data)}. Situação: ${p.status}.`;
  $('#listaItensPedido').innerHTML = itensDoPedido(p.id).map(i => {
    const v = porId(banco.vinis, i.vinilId) || { id: i.vinilId, titulo: 'Disco excluído', condicao: 'Novo' };
    return `<li>
      ${capaHTML(v, true)}
      <div class="cresce"><strong>${esc(v.titulo)}</strong><span>${i.quantidade} × ${moeda(i.precoUnitario)}</span></div>
      <span class="num">${moeda(i.quantidade * i.precoUnitario)}</span>
    </li>`;
  }).join('');
  $('#totalItensPedido').textContent = moeda(totalPedido(p.id));
  $('#modalItens').showModal();
}

async function mudarStatus(id, novo, select) {
  const p = porId(banco.pedidos, id);
  if (!p || p.status === 'Cancelado') return;
  if (novo === 'Cancelado') {
    const ok = await confirmar({
      titulo: `Cancelar o pedido nº ${id}?`,
      texto: 'Os discos desse pedido voltam para o estoque. Um pedido cancelado não pode ser reaberto.',
      botao: 'Cancelar pedido',
    });
    if (!ok) { select.value = p.status; return; }
    itensDoPedido(id).forEach(i => definirEstoque(i.vinilId, qtdEstoque(i.vinilId) + i.quantidade));
    p.status = 'Cancelado';
    atualizarTudo();
    avisar(`Pedido nº ${id} cancelado. Os discos voltaram para o estoque.`);
    return;
  }
  p.status = novo;
  atualizarTudo();
  avisar(`Pedido nº ${id} agora está como “${novo}”.`);
}

/* ---------- Exclusões (respeitando as chaves estrangeiras) ---------- */
async function excluirDisco(id) {
  const v = porId(banco.vinis, id);
  if (!v) return;
  if (banco.itensPedido.some(i => i.vinilId === id)) {
    await confirmar({
      titulo: 'Esse disco não pode ser excluído',
      texto: `“${v.titulo}” aparece em pedidos registrados. Para tirá-lo da loja, zere o estoque: ele fica como esgotado no catálogo.`,
      soAviso: true,
    });
    return;
  }
  const ok = await confirmar({ titulo: `Excluir “${v.titulo}”?`, texto: 'O disco sai do catálogo e do estoque. Essa ação não pode ser desfeita.', botao: 'Excluir disco' });
  if (!ok) return;
  banco.vinis = banco.vinis.filter(x => x.id !== id);
  banco.estoque = banco.estoque.filter(e => e.vinilId !== id);
  atualizarTudo();
  avisar(`“${v.titulo}” excluído.`);
}
async function excluirCliente(id) {
  const c = porId(banco.clientes, id);
  if (!c) return;
  if (banco.pedidos.some(p => p.clienteId === id)) {
    await confirmar({
      titulo: 'Esse cliente não pode ser excluído',
      texto: `${c.nome} tem pedidos registrados. O histórico de pedidos precisa continuar ligado ao cadastro.`,
      soAviso: true,
    });
    return;
  }
  const ok = await confirmar({ titulo: `Excluir ${c.nome}?`, texto: 'O cadastro do cliente será apagado. Essa ação não pode ser desfeita.', botao: 'Excluir cliente' });
  if (!ok) return;
  banco.clientes = banco.clientes.filter(x => x.id !== id);
  atualizarTudo();
  avisar(`${c.nome} excluído.`);
}

/* =====================================================================
   8. NAVEGAÇÃO ENTRE LOJA E PAINEL (pelo # do endereço)
   ===================================================================== */
function mostrarView() {
  const painel = location.hash === '#painel';
  const mudou = $('#painel').hidden === painel;
  $('#loja').hidden = painel;
  $('#painel').hidden = !painel;
  $$('.nav-link[data-view]').forEach(link => {
    if (link.dataset.view === (painel ? 'painel' : 'loja')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (painel) renderPainel();
  if (location.hash === '#catalogo') $('#catalogo').scrollIntoView();
  else if (mudou) window.scrollTo(0, 0);
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

/* =====================================================================
   9. EVENTOS
   ===================================================================== */
// Um único "ouvinte" de cliques para todos os botões com data-acao
document.addEventListener('click', evento => {
  // Fechar janelas
  const fechar = evento.target.closest('[data-fechar]');
  if (fechar) { fechar.closest('dialog')?.close(); return; }

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
    case 'adicionar': adicionarNaSacola(id); return;
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

// Vitrola: pausar / tocar
$('#btnGiro').addEventListener('click', e => {
  const pausada = $('#vitrola').classList.toggle('pausada');
  e.currentTarget.textContent = pausada ? 'Tocar o disco' : 'Pausar o disco';
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
  banco = dadosExemplo();
  sacola = [];
  atualizarTudo();
  avisar('Dados de exemplo restaurados.');
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
$('#buscaDiscos').addEventListener('input', e => { buscaPainel = e.target.value; renderDiscos(); });
$('#filtroStatus').addEventListener('change', e => { filtroStatus = e.target.value; renderPedidos(); });

window.addEventListener('hashchange', mostrarView);

/* =====================================================================
   10. INICIALIZAÇÃO
   ===================================================================== */
aplicarTema(ler(CHAVE_TEMA));
desenharSulcos();
atualizarTudo();
mostrarView();
