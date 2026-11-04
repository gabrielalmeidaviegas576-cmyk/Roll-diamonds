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
     if (viewAtual === 'disco') renderCompraProduto();   // atualiza "na sua sacola" na página do disco

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
   
