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
   
   /* =====================================================================
      2. DADOS DE EXEMPLO
      Cada lista espelha uma tabela do banco roll_diamonds:
      genero_musical, artista, gravadora, vinil, estoque, cliente,
      usuario, pedido e item_pedido.
      ===================================================================== */
   /* Textos da página de cada disco (colunas novas da tabela vinil):
      destaque   -> aparece no carrossel da página inicial
      descricao  -> "Sobre o disco"
      faixas     -> lista completa de faixas do disco
      observacao -> estado deste exemplar (mais útil nos usados) */
   const TEXTOS_DISCOS = {
     1: {
       destaque: true,
       descricao: 'Disco duplo que juntou Milton Nascimento, o jovem Lô Borges e a turma de músicos mineiros que ficou conhecida como Clube da Esquina. Mistura MPB, rock, jazz e a música de Minas Gerais, e aparece no topo de quase toda lista de maiores discos brasileiros.',
       faixas: ['Tudo Que Você Podia Ser', 'Cais', 'O Trem Azul', 'Saídas e Bandeiras nº 1', 'Nuvem Cigana', 'Cravo e Canela', 'Dos Cruces', 'Um Girassol da Cor de Seu Cabelo', 'San Vicente', 'Estrelas', 'Clube da Esquina nº 2', 'Paisagem da Janela', 'Me Deixa em Paz', 'Os Povos', 'Saídas e Bandeiras nº 2', 'Um Gosto de Sol', 'Pelo Amor de Deus', 'Lilia', 'Trem de Doido', 'Nada Será Como Antes', 'Ao Que Vai Nascer'],
       observacao: 'Capa dupla com desgaste leve nas bordas. Os dois discos foram limpos e tocam sem pulos.',
     },
     2: {
       destaque: true,
       descricao: 'Segundo disco dos Novos Baianos, gravado depois que João Gilberto passou a visitar a banda e mostrou a eles o samba e o choro. O resultado junta guitarra elétrica com cavaquinho e pandeiro. Em 2007, a Rolling Stone Brasil o elegeu o maior disco da música brasileira.',
       faixas: ['Brasil Pandeiro', 'Preta Pretinha', 'Tinindo Trincando', 'Swing de Campo Grande', 'Acabou Chorare', 'Mistério do Planeta', 'A Menina Dança', 'Besta É Tu', 'Um Bilhete pra Didi', 'Preta Pretinha (reprise)'],
     },
     3: {
       descricao: 'Segundo disco de Tim Maia, lançado um ano depois da estreia, misturando soul e funk americanos com samba e baião. Daqui saíram os sucessos “Não Quero Dinheiro (Só Quero Amar)” e “Preciso Aprender a Ser Só”.',
       faixas: ['A Festa do Santo Reis', 'Não Quero Dinheiro (Só Quero Amar)', 'Salve Nossa Senhora', 'Um Dia Eu Chego Lá', 'Não Vou Ficar', 'Broken Heart', 'Você', 'Preciso Aprender a Ser Só', 'I Don’t Know What to Do with Myself', 'É por Você Que Vivo', 'Meu País', 'I Don’t Care'],
     },
     4: {
       descricao: 'Jorge Ben mergulhado na alquimia: a capa reproduz gravuras atribuídas a Nicolas Flamel, e as letras falam de alquimistas, de Hermes Trismegisto e de Zumbi. Violão suingado, samba e soul em um dos discos mais celebrados da carreira dele.',
       faixas: ['Os Alquimistas Estão Chegando os Alquimistas', 'O Homem da Gravata Florida', 'Errare Humanum Est', 'Menina Mulher da Pele Preta', 'Eu Vou Torcer', 'Magnólia', 'Minha Teimosia, Uma Arma pra Te Conquistar', 'Zumbi', 'Brother', 'O Namorado da Viúva', 'Hermes Trismegisto e Sua Celeste Tábua de Esmeralda', 'Cinco Minutos'],
       observacao: 'Capa com marcas leves de manuseio. Disco sem riscos, com chiado mínimo entre as faixas.',
     },
     5: {
       destaque: true,
       descricao: 'O disco mais vendido da história do jazz. Miles Davis chegou ao estúdio com esboços de escalas em vez de músicas prontas, e o sexteto com John Coltrane, Cannonball Adderley e Bill Evans improvisou em cima delas. É o ponto de partida clássico pra quem quer começar no jazz.',
       faixas: ['So What', 'Freddie Freeloader', 'Blue in Green', 'All Blues', 'Flamenco Sketches'],
     },
     6: {
       destaque: true,
       descricao: 'O último disco que os Beatles gravaram juntos. O lado B emenda pequenas canções num medley que termina em “The End”, e a foto dos quatro atravessando a faixa de pedestres virou uma das capas mais imitadas do mundo.',
       faixas: ['Come Together', 'Something', 'Maxwell’s Silver Hammer', 'Oh! Darling', 'Octopus’s Garden', 'I Want You (She’s So Heavy)', 'Here Comes the Sun', 'Because', 'You Never Give Me Your Money', 'Sun King', 'Mean Mr. Mustard', 'Polythene Pam', 'She Came In Through the Bathroom Window', 'Golden Slumbers', 'Carry That Weight', 'The End', 'Her Majesty'],
     },
     7: {
       descricao: 'Gravado enquanto os dois casais da banda se separavam, e as letras contam exatamente isso. Virou um dos discos mais vendidos de todos os tempos.',
       faixas: ['Second Hand News', 'Dreams', 'Never Going Back Again', 'Don’t Stop', 'Go Your Own Way', 'Songbird', 'The Chain', 'You Make Loving Fun', 'I Don’t Want to Know', 'Oh Daddy', 'Gold Dust Woman'],
       observacao: 'Capa com leve amarelado do tempo. Disco limpo, toca sem pulos.',
     },
     8: {
       descricao: 'Estreia de Chico Science & Nação Zumbi e marco do manguebeat, o movimento que saiu do Recife nos anos 1990 misturando maracatu com hip hop, funk e guitarra pesada.',
       faixas: ['Monólogo ao Pé do Ouvido', 'Banditismo por Uma Questão de Classe', 'Rios, Pontes & Overdrives', 'A Cidade', 'A Praieira', 'Samba Makossa', 'Da Lama ao Caos', 'Maracatu de Tiro Certeiro', 'Salustiano Song', 'Antene-se', 'Risoflora', 'Lixo do Mangue', 'Computadores Fazem Arte', 'Côco Dub (Afrociberdelia)'],
     },
     9: {
       descricao: 'Chico Buarque em 1971, em plena ditadura, falando do país nas entrelinhas. A faixa-título narra o último dia de um operário em versos que terminam sempre em palavras proparoxítonas, com arranjo de orquestra de Rogério Duprat.',
       faixas: ['Deus Lhe Pague', 'Cotidiano', 'Desalento', 'Construção', 'Cordão', 'Olha Maria (Amparo)', 'Samba de Orly', 'Valsinha', 'Minha História', 'Acalanto'],
       observacao: 'Pequena marca de etiqueta antiga no verso da capa. Disco em ótimo estado.',
     },
     10: {
       descricao: 'Gravado quando Tim Maia entrou para a seita Universo em Desencanto e lançado pelo selo dele, o Seroma. Tim renegou o disco anos depois, mas o soul e o funk dessa fase estão entre os melhores da carreira, e as cópias viraram item de colecionador.',
       faixas: ['Imunização Racional (Que Beleza)', 'O Grão Mestre Varonil', 'Bom Senso', 'Energia Racional', 'Leia o Livro Universo em Desencanto', 'Contato com o Mundo Racional', 'Universo em Desencanto', 'You Don’t Know What I Know', 'Rational Culture'],
       observacao: 'Capa com amarelado natural do tempo. Disco revisado, com chiado leve no lado B.',
     },
     11: {
       destaque: true,
       descricao: 'Marvin Gaye trocou as canções de amor da Motown por um disco inteiro sobre guerra, pobreza e meio ambiente, contado pelo olhar de um veterano que volta do Vietnã. As faixas emendam umas nas outras como uma suíte.',
       faixas: ['What’s Going On', 'What’s Happening Brother', 'Flyin’ High (In the Friendly Sky)', 'Save the Children', 'God Is Love', 'Mercy Mercy Me (The Ecology)', 'Right On', 'Wholy Holy', 'Inner City Blues (Make Me Wanna Holler)'],
     },
     12: {
       descricao: 'Elis Regina e Tom Jobim gravaram juntos em Los Angeles, em 1974, com arranjos de César Camargo Mariano. Tem o dueto definitivo de “Águas de Março”.',
       faixas: ['Águas de Março', 'Pois É', 'Só Tinha de Ser com Você', 'Modinha', 'Triste', 'Corcovado', 'O Que Tinha de Ser', 'Retrato em Branco e Preto', 'Brigas, Nunca Mais', 'Por Toda a Minha Vida', 'Fotografia', 'Soneto de Separação', 'Chovendo na Roseira', 'Inútil Paisagem'],
     },
     13: {
       destaque: true,
       descricao: 'O disco que levou o rap dos Racionais MC’s para o Brasil inteiro, vendendo mais de um milhão de cópias por um selo independente. Anos depois, entrou na lista de leituras obrigatórias do vestibular da Unicamp.',
       faixas: ['Jorge da Capadócia', 'Gênesis', 'Capítulo 4, Versículo 3', 'Tô Ouvindo Alguém Me Chamar', 'Rapaz Comum', '...', 'Diário de um Detento', 'Periferia É Periferia', 'Qual Mentira Vou Acreditar', 'Mágico de Oz', 'Fórmula Mágica da Paz', 'Salve'],
     },
     14: {
       descricao: 'Suíte em quatro partes que John Coltrane compôs como uma oração de agradecimento. Foi gravada numa única sessão, em dezembro de 1964, com McCoy Tyner, Jimmy Garrison e Elvin Jones.',
       faixas: ['Part I: Acknowledgement', 'Part II: Resolution', 'Part III: Pursuance', 'Part IV: Psalm'],
     },
     15: {
       descricao: 'Estreia de Rita Lee, Arnaldo Baptista e Sérgio Dias, a cara psicodélica da Tropicália. Guitarras com efeitos caseiros, humor e arranjos de Rogério Duprat.',
       faixas: ['Panis et Circenses', 'A Minha Menina', 'O Relógio', 'Maria Fulô', 'Baby', 'Senhor F', 'Bat Macumba', 'Le Premier Bonheur du Jour', 'Trem Fantasma', 'Tempo no Tempo', 'Ave Gengis Khan'],
       observacao: 'Capa com desgaste nas pontas. Disco revisado, toca sem pulos.',
     },
     16: {
       descricao: 'Primeiro disco do AC/DC com Brian Johnson, gravado meses depois da morte de Bon Scott. O disco inteiro foi pensado como homenagem a ele, a começar pela capa toda preta. Está entre os discos mais vendidos da história.',
       faixas: ['Hells Bells', 'Shoot to Thrill', 'What Do You Do for Money Honey', 'Given the Dog a Bone', 'Let Me Put My Love into You', 'Back in Black', 'You Shook Me All Night Long', 'Have a Drink on Me', 'Shake a Leg', 'Rock and Roll Ain’t Noise Pollution'],
     },
     17: {
       descricao: 'O encontro do saxofone de Stan Getz com a voz e o violão de João Gilberto, com Tom Jobim no piano, que levou a bossa nova para o mundo. Ganhou o Grammy de álbum do ano.',
       faixas: ['The Girl from Ipanema', 'Doralice', 'Para Machucar Meu Coração', 'Desafinado', 'Corcovado', 'Só Danço Samba', 'O Grande Amor', 'Vivo Sonhando'],
       observacao: 'Capa bem conservada. Disco com chiado leve, típico de vinil antigo.',
     },
   };

   /* Resumo de cada artista ("Sobre o artista" na página do disco), pelo id do artista */
   const BIOS_ARTISTAS = {
     1: 'Milton Nascimento nasceu no Rio de Janeiro e cresceu em Três Pontas, Minas Gerais, e tem uma das vozes mais marcantes da música brasileira. Lô Borges, de Belo Horizonte, tinha 20 anos quando dividiu o Clube da Esquina com ele. Os dois lideraram a turma mineira que juntou MPB, rock e jazz.',
     2: 'Grupo formado na Bahia no fim dos anos 1960, com Moraes Moreira, Baby Consuelo, Pepeu Gomes, Paulinho Boca de Cantor e o letrista Luiz Galvão. Viviam em comunidade e, influenciados por João Gilberto, misturaram rock com samba, choro e frevo.',
     3: 'Cantor e compositor carioca (1942–1998), considerado o pai da soul music brasileira. Passou parte da juventude nos Estados Unidos, de onde trouxe o soul e o funk que misturou com a música brasileira. Dono de uma voz potente e de uma personalidade que virou lenda.',
     4: 'Cantor, compositor e violonista carioca, dono de um jeito único de tocar violão que mistura samba, rock, soul e funk. É autor de clássicos como "Mas, que nada!", "País Tropical" e "Taj Mahal". Desde o fim dos anos 1980 assina Jorge Ben Jor.',
     5: 'Trompetista e compositor norte-americano (1926–1991), um dos nomes mais importantes da história do jazz. Esteve à frente de várias viradas do gênero, do cool jazz e do jazz modal até a fusão com o rock.',
     6: 'Banda de Liverpool formada por John Lennon, Paul McCartney, George Harrison e Ringo Starr. Entre 1962 e 1970 mudaram a música pop: começaram no rock dançante e terminaram usando o estúdio como instrumento.',
     7: 'Banda formada em Londres em 1967. Começou tocando blues e virou um fenômeno do rock nos anos 1970, com a formação que reunia Mick Fleetwood, John McVie, Christine McVie, Lindsey Buckingham e Stevie Nicks.',
     8: 'Grupo do Recife que, no começo dos anos 1990, liderou o manguebeat, movimento que misturou maracatu, rock, hip hop e funk. Chico Science morreu em 1997, aos 30 anos, e a Nação Zumbi seguiu com a banda.',
     9: 'Cantor, compositor e escritor carioca, um dos maiores letristas da música brasileira. Durante a ditadura militar, driblou a censura com canções de duplo sentido. Também é romancista premiado.',
     10: 'Cantor e compositor norte-americano (1939–1984), um dos grandes nomes da gravadora Motown. Começou com sucessos românticos e, a partir de What\'s Going On, passou a cantar sobre guerra, pobreza e meio ambiente.',
     11: 'Elis Regina (1945–1982), gaúcha, é considerada por muitos a maior cantora do Brasil. Tom Jobim (1927–1994), carioca, maestro e compositor, foi um dos criadores da bossa nova e é autor de "Garota de Ipanema". Os dois gravaram juntos em Los Angeles, em 1974.',
     12: 'Grupo de rap da zona sul de São Paulo formado em 1988 por Mano Brown, Ice Blue, Edi Rock e KL Jay. Com letras sobre a vida na periferia, o racismo e a violência, é o grupo mais influente do rap brasileiro.',
     13: 'Saxofonista e compositor norte-americano (1926–1967). Tocou com Miles Davis e Thelonious Monk antes de liderar o próprio quarteto, levando o jazz para caminhos cada vez mais livres e espirituais.',
     14: 'Banda paulistana formada por Rita Lee e pelos irmãos Arnaldo Baptista e Sérgio Dias. Ligados à Tropicália, misturaram rock psicodélico, humor e música brasileira, e são cultuados até hoje no mundo todo.',
     15: 'Banda de hard rock formada em Sydney, na Austrália, em 1973 pelos irmãos Malcolm e Angus Young. Conhecida pelos riffs diretos e pelo uniforme escolar de Angus, é uma das bandas de rock que mais venderam discos no mundo.',
     16: 'Stan Getz (1927–1991), saxofonista norte-americano de som suave, ajudou a levar a bossa nova para os Estados Unidos. João Gilberto (1931–2019), baiano de Juazeiro, criou a batida de violão que define a bossa nova. Com Tom Jobim, gravaram Getz/Gilberto em 1963.',
   };

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
       ].map(a => ({ ...a, bio: BIOS_ARTISTAS[a.id] ?? '' })),   // junta o resumo de cada artista
       gravadoras: [
         { id: 1, nome: 'EMI-Odeon' }, { id: 2, nome: 'Som Livre' }, { id: 3, nome: 'Polydor' },
         { id: 4, nome: 'Philips' }, { id: 5, nome: 'Columbia' }, { id: 6, nome: 'Apple' },
         { id: 7, nome: 'Warner' }, { id: 8, nome: 'Chaos' }, { id: 9, nome: 'Seroma' },
         { id: 10, nome: 'Tamla' }, { id: 11, nome: 'Cosa Nostra' }, { id: 12, nome: 'Impulse!' },
         { id: 13, nome: 'Atlantic' }, { id: 14, nome: 'Verve' },
       ],
       vinis: [
        { id: 1,  titulo: 'Clube da Esquina',        artistaId: 1,  generoId: 1, gravadoraId: 1,  ano: 1972, pais: 'Brasil', tamanho: 12, peso: 130, preco: 289.90, condicao: 'Usado', capa: 'img/capas/clube-da-esquina.jpg', foto2: 'img/capas/contracapa-clube-da-esquina.jpg' },
        { id: 2,  titulo: 'Acabou Chorare',          artistaId: 2,  generoId: 1, gravadoraId: 2,  ano: 1972, pais: 'Brasil', tamanho: 12, peso: 180, preco: 249.90, condicao: 'Novo',  capa: 'img/capas/acabou-chorare.jpg', foto2: 'img/capas/lp-acabou-chorare.jpg' },
        { id: 3,  titulo: 'Tim Maia',                artistaId: 3,  generoId: 4, gravadoraId: 3,  ano: 1971, pais: 'Brasil', tamanho: 12, peso: 180, preco: 199.90, condicao: 'Novo',  capa: 'img/capas/tim-maia-1971.jpg', foto2: 'img/capas/contracapa-tim-maia-1971.jpg' },
        { id: 4,  titulo: 'A Tábua de Esmeralda',    artistaId: 4,  generoId: 1, gravadoraId: 4,  ano: 1974, pais: 'Brasil', tamanho: 12, peso: 130, preco: 229.90, condicao: 'Usado', capa: 'img/capas/tabua-de-esmeralda.jpg', foto2: 'img/capas/contracapa-tabua-de-esmeralda.jpg' },
        { id: 5,  titulo: 'Kind of Blue',            artistaId: 5,  generoId: 3, gravadoraId: 5,  ano: 1959, pais: 'EUA', tamanho: 12, peso: 180, preco: 219.90, condicao: 'Novo',  capa: 'img/capas/kind-of-blue.jpg', foto2: 'img/capas/contracapa-kind-of-blue.jpg' },
        { id: 6,  titulo: 'Abbey Road',              artistaId: 6,  generoId: 2, gravadoraId: 6,  ano: 1969, pais: 'Reino Unido', tamanho: 12, peso: 180, preco: 329.90, condicao: 'Novo',  capa: 'img/capas/abbey-road.jpg', foto2: 'img/capas/contracapa-abbey-road.jpg' },
        { id: 7,  titulo: 'Rumours',                 artistaId: 7,  generoId: 2, gravadoraId: 7,  ano: 1977, pais: 'EUA', tamanho: 12, peso: 120, preco: 279.90, condicao: 'Usado', capa: 'img/capas/rumours.jpg', foto2: 'img/capas/contracapa-rumours.jpg' },
        { id: 8,  titulo: 'Da Lama ao Caos',         artistaId: 8,  generoId: 2, gravadoraId: 8,  ano: 1994, pais: 'Brasil', tamanho: 12, peso: 180, preco: 239.90, condicao: 'Novo',  capa: 'img/capas/da-lama-ao-caos.jpg', foto2: 'img/capas/contracapa-da-lama-ao-caos.jpg' },
        { id: 9,  titulo: 'Construção',              artistaId: 9,  generoId: 1, gravadoraId: 4,  ano: 1971, pais: 'Brasil', tamanho: 12, peso: 130, preco: 269.90, condicao: 'Usado', capa: 'img/capas/construcao.jpg', foto2: 'img/capas/contracapa-construcao.jpg' },
        { id: 10, titulo: 'Racional Vol. 1',         artistaId: 3,  generoId: 4, gravadoraId: 9,  ano: 1975, pais: 'Brasil', tamanho: 12, peso: 130, preco: 349.90, condicao: 'Usado', capa: 'img/capas/racional-vol1.jpg', foto2: 'img/capas/contracapa-racional-vol1.jpg' },
        { id: 11, titulo: "What's Going On",         artistaId: 10, generoId: 4, gravadoraId: 10, ano: 1971, pais: 'EUA', tamanho: 12, peso: 180, preco: 239.90, condicao: 'Novo',  capa: 'img/capas/whats-going-on.jpg', foto2: 'img/capas/contracapa-whats-going-on.jpg' },
        { id: 12, titulo: 'Elis & Tom',              artistaId: 11, generoId: 5, gravadoraId: 4,  ano: 1974, pais: 'Brasil', tamanho: 12, peso: 180, preco: 259.90, condicao: 'Novo',  capa: 'img/capas/elis-e-tom.jpg', foto2: 'img/capas/contracapa-elis-e-tom.jpg' },
        { id: 13, titulo: 'Sobrevivendo no Inferno', artistaId: 12, generoId: 6, gravadoraId: 11, ano: 1997, pais: 'Brasil', tamanho: 12, peso: 180, preco: 279.90, condicao: 'Novo',  capa: 'img/capas/sobrevivendo-no-inferno.jpg', foto2: 'img/capas/contracapa-sobrevivendo-no-inferno.jpg' },
        { id: 14, titulo: 'A Love Supreme',          artistaId: 13, generoId: 3, gravadoraId: 12, ano: 1965, pais: 'EUA', tamanho: 12, peso: 180, preco: 189.90, condicao: 'Novo',  capa: 'img/capas/a-love-supreme.jpg', foto2: 'img/capas/contracapa-a-love-supreme.jpg' },
        { id: 15, titulo: 'Os Mutantes',             artistaId: 14, generoId: 2, gravadoraId: 3,  ano: 1968, pais: 'Brasil', tamanho: 12, peso: 140, preco: 299.90, condicao: 'Usado', capa: 'img/capas/os-mutantes.jpg', foto2: 'img/capas/contracapa-os-mutantes.jpg' },
        { id: 16, titulo: 'Back in Black',           artistaId: 15, generoId: 2, gravadoraId: 13, ano: 1980, pais: 'Austrália', tamanho: 12, peso: 180, preco: 259.90, condicao: 'Novo',  capa: 'img/capas/back-in-black.jpg', foto2: 'img/capas/contracapa-back-in-black.jpg' },
        { id: 17, titulo: 'Getz/Gilberto',           artistaId: 16, generoId: 5, gravadoraId: 14, ano: 1964, pais: 'EUA', tamanho: 12, peso: 150, preco: 239.90, condicao: 'Usado', capa: 'img/capas/getz-gilberto.jpg', foto2: 'img/capas/contracapa-getz-gilberto.jpg' },
      ].map(v => ({ ...v, destaque: false, descricao: '', faixas: [], observacao: '', ...TEXTOS_DISCOS[v.id] })), // junta os textos da página de cada disco
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

   // Dados salvos por uma versão antiga do site não têm os campos novos.
   // Completa cada disco com os textos de exemplo (se for o mesmo disco) ou com valores vazios.
   function completarCampos(b) {
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
     });
     return b;
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

   // foto2: segunda foto, por cima da capa, que aparece ao passar o mouse (só no catálogo)
   function capaHTML(v, mini = false, foto2 = '') {
     const extra = mini ? ' capa-mini' : '';
     const segunda = foto2 && !capasQuebradas.has(foto2)
       ? `<img class="capa-foto2" src="${esc(foto2)}" alt="" loading="lazy" decoding="async">` : '';
     // Com foto: usa a imagem (as regras estão no capas.css)
     if (v.capa && !capasQuebradas.has(v.capa)) {
       return `<div class="capa capa-com-foto${extra}" data-id="${v.id}" aria-hidden="true">` +
         `<img class="capa-foto" src="${esc(v.capa)}" alt="" loading="lazy" decoding="async">${segunda}</div>`;
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
     // Dados salvos por uma versão antiga podem ter o nome antigo da foto
     // (ex.: "clube_da_esquina.jpg"). Se o disco de exemplo tem outra foto, usa ela.
     const base = dadosExemplo().vinis.find(e => e.id === v.id && e.titulo === v.titulo);
     if (base && base.capa && base.capa !== v.capa && !capasQuebradas.has(base.capa)) {
       capasQuebradas.add(v.capa);
       v.capa = base.capa;
       gravar(CHAVE_BANCO, banco);
       caixa.outerHTML = capaHTML(v, mini, foto2);
       return;
     }
     capasQuebradas.add(v.capa);
     caixa.outerHTML = capaHTML(v, mini, foto2);
   }, true);
   
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
           ${capaHTML(v, false, temMouse ? v.foto2 : '')}
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
           <div class="produto-capa" id="produtoCapa" style="${coresCapa(v)}">${capaHTML(v, false, v.foto2)}${lupa}${galeria}</div>
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
   // Mouse: passando por cima, a foto aumenta e acompanha o cursor.
   // Toque: um toque liga o zoom naquele ponto, arrastar o dedo mexe a foto e outro toque desliga.
   const FOTO_ZOOM = '.produto-capa .capa-com-foto';
   let toqueZoom = null;   // onde o dedo encostou (pra separar toque de arrasto)
   function apontarZoom(capa, e) {
     const r = capa.getBoundingClientRect();
     const x = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
     const y = Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100));
     capa.style.setProperty('--zoom-x', `${x}%`);
     capa.style.setProperty('--zoom-y', `${y}%`);
   }
   $('#produto').addEventListener('pointermove', e => {
     const capa = e.target.closest(FOTO_ZOOM);
     if (!capa) return;
     if (e.pointerType === 'mouse') capa.classList.add('zoom-ativo');
     if (capa.classList.contains('zoom-ativo')) apontarZoom(capa, e);
   });
   $('#produto').addEventListener('pointerout', e => {
     const capa = e.target.closest(FOTO_ZOOM);
     if (capa && e.pointerType === 'mouse' && !capa.contains(e.relatedTarget)) capa.classList.remove('zoom-ativo');
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
   $('#formArtista').addEventListener('submit', salvarArtista);
   $('#buscaDiscos').addEventListener('input', e => { buscaPainel = e.target.value; renderDiscos(); });
   $('#filtroStatus').addEventListener('change', e => { filtroStatus = e.target.value; renderPedidos(); });
   
   window.addEventListener('hashchange', mostrarView);
   
   /* =====================================================================
      10. INICIALIZAÇÃO
      ===================================================================== */
   aplicarTema(ler(CHAVE_TEMA));
   $('#anoAtual').textContent = new Date().getFullYear();   // ano dos direitos no rodapé
   atualizarTudo();
   mostrarView();
   // A capa da vitrine aparece logo depois que a página abre
   setTimeout(() => $('#vitrola').classList.remove('guardando'), semMovimento ? 0 : 250);