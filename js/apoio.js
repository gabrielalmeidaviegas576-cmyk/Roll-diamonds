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

   // Quantas faixas aparecem na página do disco antes do "Ver mais"
   const FAIXAS_VISIVEIS = 6;

   // Tamanho do vinil (em polegadas) -> texto da ficha do disco
   const TAMANHOS = { 7: '7" (18\u00a0cm)', 10: '10" (25\u00a0cm)', 12: '12" (30\u00a0cm)' };
   
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
   
