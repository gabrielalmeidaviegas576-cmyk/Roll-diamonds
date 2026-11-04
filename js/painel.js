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
         <td><div class="celula-disco">${capaHTML(v, true)}<div><strong>${esc(v.titulo)}</strong><span>${esc(nomeDe(banco.artistas, v.artistaId))}</span>${v.destaque ? '<span class="etiqueta etiqueta-destaque">No carrossel</span>' : ''}</div></div></td>
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
           <a class="botao-link" href="#disco/${v.id}">Ver</a>
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
               ${tipo.chave === 'artistas' ? `<button class="botao-link" type="button" data-acao="editar-artista" data-id="${item.id}" aria-label="Resumo de ${esc(item.nome)}">Resumo</button>` : ''}
               ${usos ? '' :`<button class="botao-link perigo" type="button" data-acao="remover-cadastro" data-tipo="${tipo.chave}" data-id="${item.id}" aria-label="Remover ${esc(item.nome)}">Remover</button>`}
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
     f.elements.pais.value = v?.pais ?? '';
     f.elements.tamanho.value = v?.tamanho ?? 12;
     f.elements.peso.value = v?.peso ?? '';
     f.elements.condicao.value = v ? v.condicao : 'Novo';
     f.elements.preco.value = v ? v.preco.toFixed(2) : '';
     f.elements.quantidade.value = v ? qtdEstoque(v.id) : 1;
     f.elements.capa.value = v?.capa ?? '';
     f.elements.foto2.value = v?.foto2 ?? '';
     f.elements.descricao.value = v?.descricao ?? '';
     f.elements.faixas.value = (v?.faixas ?? []).join('\n');
     f.elements.observacao.value = v?.observacao ?? '';
     f.elements.destaque.checked = !!v?.destaque;
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
       pais: f.elements.pais.value.trim(),
       tamanho: Number(f.elements.tamanho.value) || 12,
       peso: Math.round(Number(f.elements.peso.value)) || null,   // vazio = não informado
       condicao: f.elements.condicao.value,
       preco: Math.round(Number(f.elements.preco.value) * 100) / 100,
       capa: caminhoCapa(f.elements.capa.value),   // vazio = capa desenhada
       foto2: caminhoCapa(f.elements.foto2.value),  // vazio = sem segunda foto
       descricao: f.elements.descricao.value.trim(),
       faixas: f.elements.faixas.value.split('\n').map(t => t.trim()).filter(Boolean),   // uma faixa por linha
       observacao: f.elements.observacao.value.trim(),
       destaque: f.elements.destaque.checked,
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

   /* ---------- Resumo do artista ---------- */
   function abrirModalArtista(id) {
     const a = porId(banco.artistas, id);
     if (!a) return;
     const f = $('#formArtista');
     f.elements.id.value = a.id;
     f.elements.bio.value = a.bio ?? '';
     $('#tituloModalArtista').textContent = `Resumo de ${a.nome}`;
     $('#modalArtista').showModal();
   }
   function salvarArtista(evento) {
     evento.preventDefault();
     const f = evento.target;
     const a = porId(banco.artistas, Number(f.elements.id.value));
     if (!a) return;
     a.bio = f.elements.bio.value.trim();
     $('#modalArtista').close();
     atualizarTudo();
     avisar(`Resumo de ${a.nome} salvo.`);
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
   
