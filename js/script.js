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
   /* Textos da página de cada disco (colunas da tabela vinil; as faixas ficam na tabela faixa):
      destaque   -> aparece no carrossel da página inicial
      descricao  -> "Sobre o disco"
      faixas     -> lista completa de faixas do disco (no banco, uma linha por faixa)
      observacao -> estado deste exemplar (mais útil nos usados) */
   const TEXTOS_DISCOS = {
     1: {
       destaque: true,
       descricao: 'Disco duplo que juntou Milton Nascimento, o jovem Lô Borges e a turma de músicos mineiros que ficou conhecida como Clube da Esquina. Mistura MPB, rock, jazz e a música de Minas Gerais, e aparece no topo de quase toda lista de maiores discos brasileiros.\nAs canções foram compostas numa casa de praia em Piratininga, em Niterói, onde Milton, Lô e os amigos passaram uma temporada, e gravadas nos estúdios da Odeon, no Rio, no fim de 1971. Beto Guedes toca em quase todas as faixas, Toninho Horta e Robertinho Silva estão na banda, Wagner Tiso e Eumir Deodato assinam os arranjos de orquestra e Alaíde Costa canta “Me Deixa em Paz”. As letras são de Márcio Borges, Fernando Brant e Ronaldo Bastos.\nO nome vem da esquina de Belo Horizonte onde a turma se encontrava. A foto da capa, de Cafi, mostra dois meninos numa estrada de terra perto de Nova Friburgo, e por muito tempo muita gente achou que fossem Milton e Lô crianças. Ficou em sétimo lugar na lista dos 100 maiores discos da música brasileira da Rolling Stone Brasil, em 2007, e em 2022 foi eleito o maior disco brasileiro de todos os tempos numa votação do podcast Discoteca Básica.',
       faixas: ['Tudo Que Você Podia Ser', 'Cais', 'O Trem Azul', 'Saídas e Bandeiras nº 1', 'Nuvem Cigana', 'Cravo e Canela', 'Dos Cruces', 'Um Girassol da Cor de Seu Cabelo', 'San Vicente', 'Estrelas', 'Clube da Esquina nº 2', 'Paisagem da Janela', 'Me Deixa em Paz', 'Os Povos', 'Saídas e Bandeiras nº 2', 'Um Gosto de Sol', 'Pelo Amor de Deus', 'Lilia', 'Trem de Doido', 'Nada Será Como Antes', 'Ao Que Vai Nascer'],
       observacao: 'Capa dupla com desgaste leve nas bordas. Os dois discos foram limpos e tocam sem pulos.',
     },
     2: {
       destaque: true,
       descricao: 'Segundo disco dos Novos Baianos, gravado depois que João Gilberto passou a visitar a banda e mostrou a eles o samba e o choro. O resultado junta guitarra elétrica com cavaquinho e pandeiro. Em 2007, a Rolling Stone Brasil o elegeu o maior disco da música brasileira.\nO título vem de uma história que João contou à banda: a filha dele, Bebel Gilberto, ainda pequena e misturando o português com o espanhol que tinha aprendido no México, dizia “acabou chorare” depois de cair e chorar. Foi João também quem sugeriu “Brasil Pandeiro”, samba de Assis Valente que abre o disco. Quase todo o resto é de Moraes Moreira e Luiz Galvão.\nA banda morava em comunidade num sítio em Jacarepaguá, no Rio, onde ensaiava, compunha e jogava futebol. No disco, a guitarra de Pepeu Gomes convive com o cavaquinho de Jorginho Gomes, e Baby Consuelo canta “A Menina Dança”. A crítica deu pouca atenção na época, mas o disco vendeu bem, ficou mais de 30 semanas nas paradas e virou referência para artistas como Marisa Monte e Céu.',
       faixas: ['Brasil Pandeiro', 'Preta Pretinha', 'Tinindo Trincando', 'Swing de Campo Grande', 'Acabou Chorare', 'Mistério do Planeta', 'A Menina Dança', 'Besta É Tu', 'Um Bilhete pra Didi', 'Preta Pretinha (reprise)'],
     },
     3: {
       descricao: 'Segundo disco de Tim Maia, lançado um ano depois da estreia, misturando soul e funk americanos com samba e baião. Daqui saíram os sucessos “Não Quero Dinheiro (Só Quero Amar)” e “Preciso Aprender a Ser Só”.\nO disco mostra as várias faces de Tim: o cantor romântico de “Você”, o compositor de “Não Vou Ficar”, que Roberto Carlos tinha gravado em 1969, e o intérprete que cantava em inglês, herança dos anos em que morou nos Estados Unidos, como em “I Don’t Know What to Do with Myself”, de Burt Bacharach e Hal David. “Preciso Aprender a Ser Só” é dos irmãos Marcos e Paulo Sérgio Valle.\nLançado pela Polydor, repetiu o sucesso da estreia e firmou o som que Tim desenvolveria ao longo da década, com metais, baixo marcado, guitarras de soul e uma voz que dava conta tanto da balada quanto do baile.',
       faixas: ['A Festa do Santo Reis', 'Não Quero Dinheiro (Só Quero Amar)', 'Salve Nossa Senhora', 'Um Dia Eu Chego Lá', 'Não Vou Ficar', 'Broken Heart', 'Você', 'Preciso Aprender a Ser Só', 'I Don’t Know What to Do with Myself', 'É por Você Que Vivo', 'Meu País', 'I Don’t Care'],
     },
     4: {
       descricao: 'Jorge Ben mergulhado na alquimia: a capa reproduz gravuras atribuídas a Nicolas Flamel, e as letras falam de alquimistas, de Hermes Trismegisto e de Zumbi. Violão suingado, samba e soul em um dos discos mais celebrados da carreira dele.\nO título vem da Tábua de Esmeralda, texto antigo atribuído a Hermes Trismegisto e considerado a base da alquimia. Jorge andava lendo sobre Paracelso, Nicolas Flamel e Tomás de Aquino, e transformou esses assuntos em canções dançantes, como “Os Alquimistas Estão Chegando os Alquimistas” e “O Homem da Gravata Florida”, inspirada numa gravata de Paracelso. “Zumbi” canta o líder do Quilombo dos Palmares.\nProduzido por Paulinho Tapajós e lançado pela Philips, foi o último trabalho de Jorge com o violão acústico em primeiro plano: dois anos depois, em África Brasil, ele passou para a guitarra elétrica. Ficou em sexto lugar na lista dos 100 maiores discos da música brasileira da Rolling Stone Brasil, em 2007.',
       faixas: ['Os Alquimistas Estão Chegando os Alquimistas', 'O Homem da Gravata Florida', 'Errare Humanum Est', 'Menina Mulher da Pele Preta', 'Eu Vou Torcer', 'Magnólia', 'Minha Teimosia, Uma Arma pra Te Conquistar', 'Zumbi', 'Brother', 'O Namorado da Viúva', 'Hermes Trismegisto e Sua Celeste Tábua de Esmeralda', 'Cinco Minutos'],
       observacao: 'Capa com marcas leves de manuseio. Disco sem riscos, com chiado mínimo entre as faixas.',
     },
     5: {
       destaque: true,
       descricao: 'O disco mais vendido da história do jazz. Miles Davis chegou ao estúdio com esboços de escalas em vez de músicas prontas, e o sexteto com John Coltrane, Cannonball Adderley e Bill Evans improvisou em cima delas. É o ponto de partida clássico pra quem quer começar no jazz.\nFoi gravado em duas sessões, em março e abril de 1959, no estúdio da Columbia em Nova York, e quase tudo saiu na primeira tentativa. Em vez de mudar de acorde a todo momento, como no bebop, as músicas se apoiam em poucas escalas, o que deixa os solistas mais livres. Essa ideia, o jazz modal, mudou a maneira de improvisar dali em diante.\nBill Evans, que toca piano em quase todo o disco e ajudou a criar “Blue in Green”, também escreveu o texto da contracapa. Paul Chambers no baixo e Jimmy Cobb na bateria completam o grupo, e Wynton Kelly assume o piano em “Freddie Freeloader”. Mais de 60 anos depois, o disco segue vendendo e aparecendo no topo das listas de melhores álbuns de todos os tempos.',
       faixas: ['So What', 'Freddie Freeloader', 'Blue in Green', 'All Blues', 'Flamenco Sketches'],
     },
     6: {
       destaque: true,
       descricao: 'O último disco que os Beatles gravaram juntos. O lado B emenda pequenas canções num medley que termina em “The End”, e a foto dos quatro atravessando a faixa de pedestres virou uma das capas mais imitadas do mundo.\nO nome é o da rua dos estúdios da EMI, em Londres, onde a banda gravou quase toda a carreira, e a foto da capa foi tirada ali na frente por Iain Macmillan, numa manhã de agosto de 1969. Com George Martin de volta à produção, o disco tem duas das canções mais conhecidas de George Harrison, “Something” e “Here Comes the Sun”, além de “Come Together”, de John Lennon, e um uso pioneiro do sintetizador Moog.\nSaiu em setembro de 1969 e foi um sucesso imediato. Poucos meses depois, em 1970, os Beatles anunciaram o fim. A capa, com Paul descalço, ainda alimentou o boato de que ele teria morrido, e a faixa de pedestres virou ponto turístico.',
       faixas: ['Come Together', 'Something', 'Maxwell’s Silver Hammer', 'Oh! Darling', 'Octopus’s Garden', 'I Want You (She’s So Heavy)', 'Here Comes the Sun', 'Because', 'You Never Give Me Your Money', 'Sun King', 'Mean Mr. Mustard', 'Polythene Pam', 'She Came In Through the Bathroom Window', 'Golden Slumbers', 'Carry That Weight', 'The End', 'Her Majesty'],
     },
     7: {
       descricao: 'Gravado enquanto os dois casais da banda se separavam, e as letras contam exatamente isso. Virou um dos discos mais vendidos de todos os tempos.\nChristine e John McVie estavam se divorciando, Lindsey Buckingham e Stevie Nicks tinham terminado e Mick Fleetwood passava pelo próprio divórcio. As músicas viram um diálogo: em “Go Your Own Way”, Lindsey canta para Stevie, que responde em “Dreams”, o único single da banda a chegar ao primeiro lugar nos Estados Unidos. “The Chain” é a única assinada pelos cinco.\nGravado principalmente no estúdio Record Plant, em Sausalito, na Califórnia, em 1976, o disco ficou 31 semanas no topo da parada americana, ganhou o Grammy de álbum do ano e já passou de 40 milhões de cópias vendidas.',
       faixas: ['Second Hand News', 'Dreams', 'Never Going Back Again', 'Don’t Stop', 'Go Your Own Way', 'Songbird', 'The Chain', 'You Make Loving Fun', 'I Don’t Want to Know', 'Oh Daddy', 'Gold Dust Woman'],
       observacao: 'Capa com leve amarelado do tempo. Disco limpo, toca sem pulos.',
     },
     8: {
       descricao: 'Estreia de Chico Science & Nação Zumbi e marco do manguebeat, o movimento que saiu do Recife nos anos 1990 misturando maracatu com hip hop, funk e guitarra pesada.\nO manguebeat tinha nascido pouco antes, com o manifesto “Caranguejos com Cérebro”, que comparava o Recife a um mangue e propunha ligar a cultura local ao que acontecia no mundo, na imagem de uma antena parabólica fincada na lama. A ideia do mangue vem do geógrafo Josué de Castro, que escreveu sobre a fome e os “homens-caranguejo” da cidade.\nNo disco, os tambores de maracatu dos percussionistas vindos do bloco Lamento Negro se juntam à guitarra de Lúcio Maia, ao baixo de Dengue e à voz de Chico Science. Produzido por Liminha e lançado pela Chaos, selo da Sony, tem “A Praieira”, “Rios, Pontes & Overdrives” e “A Cidade”. Dois anos depois veio Afrociberdelia, o último disco com Chico.',
       faixas: ['Monólogo ao Pé do Ouvido', 'Banditismo por Uma Questão de Classe', 'Rios, Pontes & Overdrives', 'A Cidade', 'A Praieira', 'Samba Makossa', 'Da Lama ao Caos', 'Maracatu de Tiro Certeiro', 'Salustiano Song', 'Antene-se', 'Risoflora', 'Lixo do Mangue', 'Computadores Fazem Arte', 'Côco Dub (Afrociberdelia)'],
     },
     9: {
       descricao: 'Chico Buarque em 1971, em plena ditadura, falando do país nas entrelinhas. A faixa-título narra o último dia de um operário em versos que terminam sempre em palavras proparoxítonas, com arranjo de orquestra de Rogério Duprat.\nChico tinha voltado em 1970 do exílio na Itália, e o disco reflete a volta a um país censurado: “Deus Lhe Pague” agradece com ironia, “Cordão” fala da censura e “Samba de Orly”, parceria com Toquinho e Vinicius de Moraes sobre o exílio, teve versos cortados pelos censores. Tom Jobim toca piano em “Olha Maria”, e o MPB-4 faz os coros em várias faixas.\nGravado no Rio, com direção de Roberto Menescal, saiu pela Philips no fim de 1971 e ficou em terceiro lugar na lista dos 100 maiores discos da música brasileira da Rolling Stone Brasil, em 2007. Também tem “Cotidiano”, “Valsinha”, com Vinicius, e “Minha História”, versão de uma canção do italiano Lucio Dalla.',
       faixas: ['Deus Lhe Pague', 'Cotidiano', 'Desalento', 'Construção', 'Cordão', 'Olha Maria (Amparo)', 'Samba de Orly', 'Valsinha', 'Minha História', 'Acalanto'],
       observacao: 'Pequena marca de etiqueta antiga no verso da capa. Disco em ótimo estado.',
     },
     10: {
       descricao: 'Gravado quando Tim Maia entrou para a seita Universo em Desencanto e lançado pelo selo dele, o Seroma. Tim renegou o disco anos depois, mas o soul e o funk dessa fase estão entre os melhores da carreira, e as cópias viraram item de colecionador.\nTim conheceu a Cultura Racional, liderada por Manoel Jacintho Coelho, em 1974, e mergulhou de cabeça: largou as drogas e a bebida, passou a se vestir de branco e encheu as letras de referências ao livro Universo em Desencanto, como em “Imunização Racional (Que Beleza)”. A banda Vitória Régia segura um groove pesado de soul e funk do começo ao fim.\nPouco depois do segundo volume, de 1976, Tim rompeu com a seita, tirou os discos de circulação e não quis que fossem relançados. Por isso os LPs originais ficaram raros. Décadas depois, a fase racional foi redescoberta e hoje é tratada como um dos pontos altos da carreira dele.',
       faixas: ['Imunização Racional (Que Beleza)', 'O Grão Mestre Varonil', 'Bom Senso', 'Energia Racional', 'Leia o Livro Universo em Desencanto', 'Contato com o Mundo Racional', 'Universo em Desencanto', 'You Don’t Know What I Know', 'Rational Culture'],
       observacao: 'Capa com amarelado natural do tempo. Disco revisado, com chiado leve no lado B.',
     },
     11: {
       destaque: true,
       descricao: 'Marvin Gaye trocou as canções de amor da Motown por um disco inteiro sobre guerra, pobreza e meio ambiente, contado pelo olhar de um veterano que volta do Vietnã. As faixas emendam umas nas outras como uma suíte.\nA ideia veio das cartas do irmão de Marvin, Frankie, que servia no Vietnã, e de uma cena de violência policial contra manifestantes presenciada por Renaldo Benson, dos Four Tops, coautor da faixa-título. Berry Gordy, dono da Motown, achou que o disco não ia vender e resistiu a lançá-lo, mas a faixa-título chegou ao segundo lugar nas paradas americanas.\nFoi o primeiro disco que Marvin produziu sozinho, com os músicos da Motown, os Funk Brothers, e arranjos de cordas que dão o clima de suíte. Em 2020, a revista Rolling Stone o colocou em primeiro lugar na lista dos 500 maiores álbuns de todos os tempos.',
       faixas: ['What’s Going On', 'What’s Happening Brother', 'Flyin’ High (In the Friendly Sky)', 'Save the Children', 'God Is Love', 'Mercy Mercy Me (The Ecology)', 'Right On', 'Wholy Holy', 'Inner City Blues (Make Me Wanna Holler)'],
     },
     12: {
       descricao: 'Elis Regina e Tom Jobim gravaram juntos em Los Angeles, em 1974, com arranjos de César Camargo Mariano. Tem o dueto definitivo de “Águas de Março”.\nGravado em poucas semanas nos estúdios da MGM, com produção de Aloysio de Oliveira, o disco começou com tensão: Tom desconfiava dos teclados elétricos e dos arranjos de César, marido de Elis na época, mas os três acabaram se acertando. O repertório é todo de Tom, com parcerias com Vinicius de Moraes e Chico Buarque.\nAlém de “Águas de Março”, tem “Corcovado”, “Retrato em Branco e Preto”, “Inútil Paisagem” e “Soneto de Separação”. Mais de 50 anos depois, segue entre os discos mais ouvidos da música brasileira e é um bom ponto de partida para conhecer tanto Elis quanto Tom.',
       faixas: ['Águas de Março', 'Pois É', 'Só Tinha de Ser com Você', 'Modinha', 'Triste', 'Corcovado', 'O Que Tinha de Ser', 'Retrato em Branco e Preto', 'Brigas, Nunca Mais', 'Por Toda a Minha Vida', 'Fotografia', 'Soneto de Separação', 'Chovendo na Roseira', 'Inútil Paisagem'],
     },
     13: {
       destaque: true,
       descricao: 'O disco que levou o rap dos Racionais MC’s para o Brasil inteiro, vendendo mais de um milhão de cópias por um selo independente. Anos depois, entrou na lista de leituras obrigatórias do vestibular da Unicamp.\nLançado pela Cosa Nostra, selo do próprio grupo, o disco abre com “Jorge da Capadócia”, de Jorge Ben, e segue com faixas longas e duras sobre a violência na periferia. “Diário de um Detento”, escrita com Jocenir, que esteve preso no Carandiru, conta o massacre de 1992 na Casa de Detenção, e o clipe foi premiado no VMB da MTV. “Capítulo 4, Versículo 3” começa com estatísticas sobre a violência contra jovens negros.\nA capa, com uma cruz e um trecho do Salmo 23, resume a mistura de fé e denúncia que atravessa as letras. Em 2018, as letras foram publicadas em livro pela Companhia das Letras.',
       faixas: ['Jorge da Capadócia', 'Gênesis', 'Capítulo 4, Versículo 3', 'Tô Ouvindo Alguém Me Chamar', 'Rapaz Comum', '...', 'Diário de um Detento', 'Periferia É Periferia', 'Qual Mentira Vou Acreditar', 'Mágico de Oz', 'Fórmula Mágica da Paz', 'Salve'],
     },
     14: {
       descricao: 'Suíte em quatro partes que John Coltrane compôs como uma oração de agradecimento. Foi gravada numa única sessão, em dezembro de 1964, com McCoy Tyner, Jimmy Garrison e Elvin Jones.\nNo texto do encarte, Coltrane conta que, em 1957, teve um despertar espiritual que o ajudou a largar a heroína e o álcool, e o disco é o agradecimento por isso. Na primeira parte, as palavras “a love supreme” são entoadas como um mantra; na última, “Psalm”, o saxofone “recita”, nota por nota, um poema que ele escreveu e publicou no encarte.\nGravado no estúdio de Rudy Van Gelder, em Englewood Cliffs, Nova Jersey, e lançado pela Impulse! em 1965, é considerado a obra-prima de Coltrane e um dos discos mais importantes do jazz. Foi o auge do quarteto clássico, que se desfez pouco depois.',
       faixas: ['Part I: Acknowledgement', 'Part II: Resolution', 'Part III: Pursuance', 'Part IV: Psalm'],
     },
     15: {
       descricao: 'Estreia de Rita Lee, Arnaldo Baptista e Sérgio Dias, a cara psicodélica da Tropicália. Guitarras com efeitos caseiros, humor e arranjos de Rogério Duprat.\nO repertório junta músicas dos amigos tropicalistas, como “Panis et Circenses” e “Bat Macumba”, de Caetano Veloso e Gilberto Gil, e “Baby”, de Caetano, com “A Minha Menina”, de Jorge Ben, “Le Premier Bonheur du Jour”, canção francesa gravada por Françoise Hardy, e composições do trio. Boa parte dos efeitos vem de equipamentos construídos por Cláudio César, irmão de Arnaldo e Sérgio.\nLançado pela Polydor, o disco virou cult fora do Brasil a partir dos anos 1990, com fãs como Kurt Cobain, Beck e David Byrne, cujo selo, o Luaka Bop, lançou uma coletânea da banda nos Estados Unidos.',
       faixas: ['Panis et Circenses', 'A Minha Menina', 'O Relógio', 'Maria Fulô', 'Baby', 'Senhor F', 'Bat Macumba', 'Le Premier Bonheur du Jour', 'Trem Fantasma', 'Tempo no Tempo', 'Ave Gengis Khan'],
       observacao: 'Capa com desgaste nas pontas. Disco revisado, toca sem pulos.',
     },
     16: {
       descricao: 'Primeiro disco do AC/DC com Brian Johnson, gravado meses depois da morte de Bon Scott. O disco inteiro foi pensado como homenagem a ele, a começar pela capa toda preta. Está entre os discos mais vendidos da história.\nCom o produtor Robert John “Mutt” Lange, a banda gravou nos estúdios Compass Point, nas Bahamas, poucos meses depois da morte de Bon. O disco abre com o sino de “Hells Bells” e traz “You Shook Me All Night Long” e a faixa-título, com um dos riffs mais famosos do rock.\nLançado em julho de 1980, marcou a volta por cima de uma banda que quase acabou. As estimativas de vendas passam de 50 milhões de cópias, o que o coloca, em várias listas, atrás apenas de Thriller, de Michael Jackson.',
       faixas: ['Hells Bells', 'Shoot to Thrill', 'What Do You Do for Money Honey', 'Given the Dog a Bone', 'Let Me Put My Love into You', 'Back in Black', 'You Shook Me All Night Long', 'Have a Drink on Me', 'Shake a Leg', 'Rock and Roll Ain’t Noise Pollution'],
     },
     17: {
       descricao: 'O encontro do saxofone de Stan Getz com a voz e o violão de João Gilberto, com Tom Jobim no piano, que levou a bossa nova para o mundo. Ganhou o Grammy de álbum do ano.\nFoi gravado em Nova York, em março de 1963, com produção de Creed Taylor, para o selo Verve. Astrud Gilberto, então mulher de João, cantou em inglês a versão de “The Girl from Ipanema”, na sua primeira gravação profissional. A faixa, editada para o rádio, virou um sucesso mundial e ganhou o Grammy de gravação do ano.\nA capa reproduz uma pintura da artista porto-riquenha Olga Albizu. Lançado em 1964, foi o primeiro disco de jazz a vencer na categoria de álbum do ano e segue entre os discos de jazz mais vendidos da história.',
       faixas: ['The Girl from Ipanema', 'Doralice', 'Para Machucar Meu Coração', 'Desafinado', 'Corcovado', 'Só Danço Samba', 'O Grande Amor', 'Vivo Sonhando'],
       observacao: 'Capa bem conservada. Disco com chiado leve, típico de vinil antigo.',
     },
     18: {
       descricao: 'Segundo disco do O Rappa, que firmou a mistura de reggae, rock, rap e samba da banda carioca, com letras sobre desigualdade e violência urbana. Tem “Pescador de Ilusões”, um dos maiores sucessos do grupo, e releituras de “Hey Joe” e “Vapor Barato”.\nProduzido por Liminha e gravado no estúdio Nas Nuvens, no Rio, em 1996, o disco tem a formação clássica da banda: Marcelo Falcão na voz, Marcelo Yuka na bateria e em boa parte das letras, Xandão na guitarra, Lauro Farias no baixo e Marcelo Lobato nos teclados. Marcelo D2 participa de “Hey Joe”.\nRendeu vários singles, como “Pescador de Ilusões”, “Miséria S.A.”, “A Feira”, “Vapor Barato” e “Uma Ajuda”, e foi o disco que tornou O Rappa conhecido no país inteiro. Ganhou disco de platina.',
       faixas: ['A Feira', 'Miséria S.A.', 'Vapor Barato', 'Ilê Ayê', 'Hey Joe', 'Pescador de Ilusões', 'Uma Ajuda', 'Eu Quero Ver Gol', 'Eu Não Sei Mentir Direito', 'O Homem Bomba', 'Tumulto', 'Lei da Sobrevivência (Palha de Cana)', 'Óia o Rapa'],
     },
     19: {
       descricao: 'Quinto disco de estúdio do O Rappa, lançado depois de cinco anos sem álbum inédito. Mantém o peso das guitarras e o reggae da banda, com faixas como “Meu Santo Tá Cansado” e “Monstro Invisível”, e uma releitura do clássico nordestino “Súplica Cearense”.\nO título marca o sétimo álbum da banda, contando os discos ao vivo e o Acústico MTV. A produção é de Ricardo Vidal, Tom Sabóia e do próprio grupo, e o som passeia pelo rock, pelo reggae, pelo dub e pelo hip hop, com os scratches do DJ Negralha.\n“Monstro Invisível” foi o primeiro single, seguido por “Meu Mundo É o Barro” e pela versão de “Súplica Cearense”, de Gordurinha e Nelinho. Foi o último disco de inéditas antes da pausa que a banda fez entre 2009 e 2011.',
       faixas: ['Meu Santo Tá Cansado', 'Verdade de Feirante', 'Hóstia', 'Meu Mundo É o Barro', 'Farpa Cortante', 'Em Busca do Porrão', '7 Vezes', 'Monstro Invisível', 'Maria', 'Súplica Cearense', 'Fininho da Vida', 'Documento', 'Respeito pela Mais Bela', 'Vários Holofotes'],
     },
     20: {
       descricao: 'Sexto disco de estúdio e o último da carreira do O Rappa. A capa em estilo de história em quadrinhos abre um disco com o rock pesado e o reggae que marcaram a banda. Saiu em LP duplo, prensado pela Polysom.\nVeio depois de cinco anos sem disco de inéditas, com produção e mixagem de Tom Sabóia e masterização feita na Califórnia. As ilustrações da capa e do encarte são de Mike Deodato Jr., desenhista brasileiro conhecido pelo trabalho nos quadrinhos da Marvel.\nOs singles foram “Anjos (Pra Quem Tem Fé)”, “Auto-Reverse”, “Boa Noite Xangô”, “Fronteira (D.U.C.A.)” e “Vida Rasteja”, e Edi Rock, dos Racionais MC’s, participa de “Um Dia Lindo”. Foi indicado ao Grammy Latino de melhor álbum de rock brasileiro. A banda fez os últimos shows em 2018.',
       faixas: ['O Horizonte É Logo Ali', 'Auto-Reverse', 'Boa Noite Xangô', 'Cruz de Tecido', 'Fronteira (D.U.C.A.)', 'Anjos (Pra Quem Tem Fé)', 'Doutor, Sim Senhor!', 'Sequência Terminal', 'Vida Rasteja', 'Um Dia Lindo'],
     },
     21: {
       descricao: 'Estreia da banda de Brasília liderada por Renato Russo, com a urgência do punk e do pós-punk. Daqui saíram “Será”, “Ainda É Cedo” e “Geração Coca-Cola”, que viraram hinos de uma geração no Brasil dos anos 1980.\nGravado entre outubro e dezembro de 1984 nos estúdios da EMI-Odeon, no Rio, com produção de José Emílio Rondeau, o disco tem Renato Russo na voz, Dado Villa-Lobos na guitarra, Marcelo Bonfá na bateria e Renato Rocha no baixo. As letras falam de política, amor e desencanto.\nCinco faixas viraram single, incluindo “Teorema” e “Soldados”, e o disco vendeu cerca de 550 mil cópias. Foi o começo de uma das trajetórias mais bem-sucedidas do rock brasileiro.',
       faixas: ['Será', 'A Dança', 'Petróleo do Futuro', 'Ainda É Cedo', 'Perdidos no Espaço', 'Geração Coca-Cola', 'O Reggae', 'Baader-Meinhof Blues', 'Soldados', 'Teorema', 'Por Enquanto'],
       observacao: 'Capa com leve amarelado e marca de etiqueta antiga. Disco limpo, toca sem pulos.',
     },
     22: {
       descricao: 'Segundo disco da Legião Urbana, mais melódico e acústico que a estreia. Reúne alguns dos maiores sucessos da banda, como “Tempo Perdido”, “Eduardo e Mônica”, “Quase Sem Querer” e “Índios”.\nRenato Russo queria um disco duplo, chamado Mitologia e Intuição, mas a gravadora não aceitou, e o repertório foi reduzido de 20 para 12 músicas. Gravado no começo de 1986, com produção de Mayrton Bahia, saiu em julho daquele ano. A foto da capa, de um casal olhando o mar, é de Ico Ouro Preto, ex-guitarrista da banda.\nVendeu mais de 1,5 milhão de cópias e é o disco mais vendido da Legião Urbana. “Eduardo e Mônica”, a história de um casal improvável, virou filme em 2022.',
       faixas: ['Daniel na Cova dos Leões', 'Quase Sem Querer', 'Acrilic on Canvas', 'Eduardo e Mônica', 'Central do Brasil', 'Tempo Perdido', 'Metrópole', 'Plantas Embaixo do Aquário', 'Música Urbana 2', 'Andrea Doria', 'Fábrica', 'Índios'],
       observacao: 'Capa com desgaste nas bordas, como na foto. Disco com chiado leve entre as faixas.',
     },
     23: {
       descricao: 'Disco duplo da Legião Urbana com gravações ao vivo, sobras de estúdio e versões de outros artistas, como “Gimme Shelter”, dos Rolling Stones, e “On the Way Home”, de Neil Young. Também traz “Faroeste Caboclo”, “Pais e Filhos” e “Há Tempos”.\nAs gravações vêm de shows, programas de rádio e do Acústico MTV, registrados entre 1986 e 1992: “Faroeste Caboclo”, por exemplo, foi gravada ao vivo no estádio Parque Antártica, em São Paulo, em 1990. A única faixa de estúdio é a demo de “A Canção do Senhor da Guerra”, que Renato gravou sozinho.\nA banda não queria lançar uma coletânea, mas resolveu montar o próprio disco quando a gravadora planejou uma sem consultá-la. Saiu em dezembro de 1992, com ilustrações de Marcelo Bonfá no encarte, e fecha com um trecho de “Rhapsody in Blue”, de George Gershwin.',
       faixas: ['Fábrica', 'Daniel na Cova dos Leões', 'A Canção do Senhor da Guerra', 'O Teatro dos Vampiros', 'Ainda É Cedo', 'Gimme Shelter', 'Baader-Meinhof Blues', 'A Montanha Mágica', 'Eu Sei', 'Índios', 'A Dança', 'Mais do Mesmo', 'Soldados', 'Música Urbana 2', 'On the Way Home', 'Maurício', 'Há Tempos', 'Pais e Filhos', 'Faroeste Caboclo', 'Exit Music: Rhapsody in Blue'],
       observacao: 'Capa dupla com pequenas marcas de manuseio. Os dois discos foram limpos e tocam sem pulos.',
     },
     24: {
       descricao: 'Terceiro disco de estúdio de Emicida, que mistura rap com samba, MPB e gospel. A faixa-título usa um trecho de “Sujeito de Sorte”, de Belchior, e tem participação de Majur e Pabllo Vittar. Ganhou o Grammy Latino e virou o documentário “AmarElo – É Tudo Pra Ontem”.\nO disco reúne convidados de várias gerações: Zeca Pagodinho e a banda japonesa Tokyo Ska Paradise Orchestra em “Quem Tem um Amigo (Tem Tudo)”, Marcos Valle em “Pequenas Alegrias da Vida Adulta”, Fernanda Montenegro em “Ismália”, Dona Onete em “Eminência Parda” e o duo franco-cubano Ibeyi em “Libre”. As letras falam de afeto, saúde mental e ancestralidade negra.\nO show de lançamento, no Theatro Municipal de São Paulo, deu origem ao documentário da Netflix. O álbum ganhou disco de platina e, em 2022, apareceu numa enquete do jornal O Globo entre os melhores discos brasileiros dos últimos 40 anos.',
       faixas: ['Principia', 'A Ordem Natural das Coisas', 'Pequenas Alegrias da Vida Adulta', 'Quem Tem um Amigo (Tem Tudo)', 'Paisagem', 'Cananéia, Iguape e Ilha Comprida', '9nha', 'Ismália', 'Eminência Parda', 'AmarElo', 'Libre'],
     },
     25: {
       descricao: 'Primeiro disco do maestro e arranjador Arthur Verocai, misturando MPB, soul, jazz e arranjos de orquestra. Passou quase despercebido na época, mas foi redescoberto por colecionadores e DJs e virou fonte de samples para o hip hop americano.\nGravado no Rio em 1972 e lançado pela Continental, tem músicos como Robertinho Silva na bateria e Paulo Moura no sax, e as vozes de Toninho Horta e Carlos Dafé em algumas faixas. A maior parte das letras é de Vitor Martins. O disco vendeu pouco, e Verocai passou décadas trabalhando com publicidade.\nA redescoberta veio nos anos 2000: MF Doom sampleou “Na Boca do Sol”, o grupo Little Brother usou “Caboclo” e o produtor Madlib já citou o disco entre seus favoritos. Em 2009, Verocai tocou o álbum com uma orquestra de 30 músicos em Los Angeles, e os LPs originais viraram peça cara entre colecionadores.',
       faixas: ['Caboclo', 'Pelas Sombras', 'Sylvia', 'Presente Grego', 'Dedicada a Ela', 'Seriado', 'Na Boca do Sol', 'Velho Parente', 'O Mapa', 'Karina (Domingo no Grajaú)'],
     },
     26: {
       descricao: 'Segundo disco do rapper paulistano Criolo, que saiu de graça na internet e fez dele um dos nomes mais comentados da música brasileira. Vai do rap ao samba, ao afrobeat e ao reggae, e tem “Não Existe Amor em SP”, um dos maiores sucessos dele.\nProduzido por Daniel Ganjaman e Marcelo Cabral, o disco saiu de graça na internet e, em formato físico, em CD e vinil. Passa pelo afrobeat em “Bogotá”, pelo brega em “Freguês da Meia-Noite”, pelo reggae e pelo samba, sem deixar o rap de lado em faixas como “Subirusdoistiozin” e “Grajauex”, homenagem ao bairro onde Criolo cresceu.\nEm 2011, ganhou os prêmios de disco do ano e música do ano no VMB da MTV, onde Criolo cantou “Não Existe Amor em SP” ao lado de Caetano Veloso. A Rolling Stone Brasil o elegeu o melhor disco brasileiro daquele ano.',
       faixas: ['Bogotá', 'Subirusdoistiozin', 'Não Existe Amor em SP', 'Mariô', 'Freguês da Meia-Noite', 'Grajauex', 'Samba Sambei', 'Sucrilhos', 'Lion Man', 'Linha de Frente'],
     },
     27: {
       descricao: 'Mixtape do rapper Froid com Santzu, lançada em 2019. São cinco faixas produzidas pelos dois, com mixagem e masterização do DJ LM e participações de Chris e Derek.\nA mixtape saiu numa fase de muita produção de Froid: um ano depois de Teoria do Ciclo da Água e no mesmo ano de Sol, o disco que ele fez com a cantora Cynthia Luz. Com cinco faixas, de “Ninguém Morre Me Devendo” a “Tô Cansado”, é um registro curto e direto, fora do formato de álbum. No verso da capa, além das faixas e dos créditos, aparece a frase “Diga não ao nazismo!”.',
       faixas: ['Ninguém Morre Me Devendo', 'Vem Tranquilo', 'Cannavaro', 'Lamborguini', 'Tô Cansado'],
     },
     28: {
       descricao: 'Sétimo disco de estúdio de Froid, lançado em 2026 pela ONErpm e apontado como um dos trabalhos mais pessoais da carreira dele. São 11 faixas, com participações de Ciça e Major RD, entre outros.\nO próprio Froid produziu 8 das 11 faixas, o maior número da carreira, e o disco levou cerca de um ano e meio para ficar pronto. As letras falam da frustração e da vulnerabilidade de um homem negro bem-sucedido no Brasil, celebrado quando está por cima e ignorado quando está triste, sem os personagens dos discos anteriores.\nO som mistura boom bap, passagens acústicas, dancehall e afrobeats. Em “Endrick”, ele usa o jogador de futebol como metáfora para as próprias frustrações, e, segundo ele, foi essa faixa que abriu caminho para o tom mais vulnerável do disco.',
       faixas: ['Algo Lúcido', 'Colômbia', 'Endrick', 'Futuro', 'Humor Negro', 'Área de Fumante', 'Ressaca Moral', 'Fique Rico ou Moralismo 2', 'Língua dos Anjos', 'Dark Dance Hall', '“Tilt”'],
     },
     29: {
       descricao: 'Disco de estreia do cantor canadense Daniel Caesar, um R&B lento com influência do gospel em que ele cresceu. “Best Part”, com H.E.R., ganhou o Grammy de melhor performance de R&B.\nLançado em agosto de 2017 de forma independente, pelo selo Golden Child, foi produzido por Daniel com Matthew Burnett e Jordan Evans, parceiros desde os primeiros trabalhos. Tem participações de Kali Uchis em “Get You”, H.E.R. em “Best Part”, Syd em “Take Me Away” e Charlotte Day Wilson em “Transform”.\nFoi indicado ao Grammy de melhor álbum urbano contemporâneo e fez de Daniel Caesar um dos nomes mais conhecidos da nova geração do R&B. O coro e o órgão de faixas como “We Find Love” e “Blessed” lembram a música gospel da igreja em que ele cresceu.',
       faixas: ['Get You', 'Best Part', 'Hold Me Down', 'Neu Roses (Transgressor’s Song)', 'Loose', 'We Find Love', 'Blessed', 'Take Me Away', 'Transform', 'Freudian'],
       observacao: 'Vinil colorido, em tons de azul e branco.',
     },
     30: {
       descricao: 'Álbum de 2026 do cantor norte-americano Brent Faiyaz, lançado pelo selo dele, a ISO Supremacy. São dez faixas de R&B de clima noturno, que ele mesmo coproduziu.\nÉ o terceiro álbum de estúdio de Brent, depois de Wasteland, de 2022. Estava marcado para setembro de 2025, mas ele descartou o material planejado pouco antes da data e lançou o disco em fevereiro de 2026, sem nenhum convidado. Raphael Saadiq assina a produção executiva, e a ficha tem nomes como Benny Blanco e Chad Hugo.\nO som mistura R&B com nu-disco e uma eletrônica inspirada nos anos 1980 e 1990. O single “Have To” chegou ao primeiro lugar da parada de R&B adulto da Billboard, e o álbum entrou no top 10 dos Estados Unidos. Dias depois, saiu uma versão estendida, a Director’s Cut, com faixas extras.',
       faixas: ['White Noise', 'Wrong Faces', 'Have To', 'Butterflies', 'Other Side', 'Strangers', 'World Is Yours', 'Four Seasons', 'Pure Fantasy', 'Vanilla Sky'],
     },
     31: {
       descricao: 'Disco de Junior Murvin produzido por Lee “Scratch” Perry no estúdio Black Ark, na Jamaica. A faixa-título, cantada em falsete, virou um clássico do reggae e ganhou versão do The Clash no primeiro disco da banda.\nA música foi gravada em maio de 1976 e saiu como single naquele ano. No Reino Unido, virou trilha do verão em que o carnaval de Notting Hill, em Londres, terminou em confronto com a polícia, e Joe Strummer e Paul Simonon, do Clash, que estavam lá, decidiram regravá-la.\nAlém de Murvin, o disco tem os Upsetters, a banda de Perry, com Boris Gardiner no baixo e Winston Wright nos teclados. É considerado, ao lado de Party Time, dos Heptones, e War Ina Babylon, de Max Romeo, um dos três grandes álbuns gravados no Black Ark.',
       faixas: ['Roots Train', 'Police and Thieves', 'Solomon', 'Rescue Jah Children', 'Tedious', 'False Teachin’', 'Easy Task', 'Lucifer', 'Workin’ in the Cornfield', 'I Was Appointed'],
       observacao: 'Prensagem antiga, capa com cantos gastos. Disco revisado, com chiado leve típico da época.',
     },
   };

   /* Resumo de cada artista ("Sobre o artista" na página do disco), pelo id do artista */
   const BIOS_ARTISTAS = {
     1: 'Milton Nascimento nasceu no Rio de Janeiro e cresceu em Três Pontas, Minas Gerais, e tem uma das vozes mais marcantes da música brasileira. Lô Borges, de Belo Horizonte, tinha 20 anos quando dividiu o Clube da Esquina com ele. Os dois lideraram a turma mineira que juntou MPB, rock e jazz.\nMilton, nascido em 1942, ficou conhecido em 1967, quando “Travessia” ficou em segundo lugar no Festival Internacional da Canção. Gravou com o saxofonista americano Wayne Shorter o disco Native Dancer, de 1975, ganhou um Grammy em 1998 e se despediu dos palcos em 2022, com a turnê A Última Sessão de Música.\nLô, nascido em 1952, era irmão do letrista Márcio Borges e lançou, no mesmo ano do Clube da Esquina, o primeiro disco solo, conhecido como “disco do tênis” por causa da capa. É autor de clássicos como “O Trem Azul”, “Paisagem da Janela” e “Um Girassol da Cor de Seu Cabelo”. Morreu em novembro de 2025, em Belo Horizonte, aos 73 anos.',
     2: 'Grupo formado na Bahia no fim dos anos 1960, com Moraes Moreira, Baby Consuelo, Pepeu Gomes, Paulinho Boca de Cantor e o letrista Luiz Galvão. Viviam em comunidade e, influenciados por João Gilberto, misturaram rock com samba, choro e frevo.\nEstrearam em 1970 com É Ferro na Boneca e, já no Rio, foram morar num sítio em Jacarepaguá, onde ensaiavam, compunham e mantinham até um time de futebol. Depois de Acabou Chorare, lançaram discos como Novos Baianos F.C. e seguiram juntos até o fim dos anos 1970.\nCada integrante seguiu carreira própria: Moraes Moreira virou um dos nomes do carnaval baiano, Pepeu Gomes se firmou como guitarrista e Baby Consuelo, hoje Baby do Brasil, fez sucesso solo. O grupo se reuniu de novo em 2016 para uma turnê de reencontro. Moraes Moreira morreu em 2020.',
     3: 'Cantor e compositor carioca (1942–1998), considerado o pai da soul music brasileira. Passou parte da juventude nos Estados Unidos, de onde trouxe o soul e o funk que misturou com a música brasileira. Dono de uma voz potente e de uma personalidade que virou lenda.\nNascido Sebastião Rodrigues Maia, na Tijuca, tocou na adolescência no grupo The Sputniks, ao lado de Roberto Carlos. Em 1959 foi para os Estados Unidos, onde viveu até ser deportado, em 1964. O primeiro disco, de 1970, já trouxe sucessos como “Primavera” e “Azul da Cor do Mar”.\nAo longo da carreira, emplacou músicas como “Gostava Tanto de Você”, “Me Dê Motivo”, “Do Leme ao Pontal” e “Vale Tudo”, e ficou famoso também pelos shows a que não aparecia. Morreu em 1998, depois de passar mal num show em Niterói. A vida dele virou livro, de Nelson Motta, e filme.',
     4: 'Cantor, compositor e violonista carioca, dono de um jeito único de tocar violão que mistura samba, rock, soul e funk. É autor de clássicos como "Mas, que nada!", "País Tropical" e "Taj Mahal". Desde o fim dos anos 1980 assina Jorge Ben Jor.\nEstreou em 1963 com Samba Esquema Novo, que tinha “Mas, que nada!”, sucesso no mundo inteiro na versão de Sérgio Mendes. Passou pela bossa nova, pela Jovem Guarda e pela Tropicália, e nos anos 1970 lançou discos celebrados como Força Bruta, A Tábua de Esmeralda e África Brasil, em que trocou o violão pela guitarra elétrica.\nAs músicas dele foram gravadas e sampleadas por artistas do mundo todo, e “Taj Mahal” ficou famosa também por ter sido aproveitada por Rod Stewart em “Da Ya Think I’m Sexy?”, caso que terminou em acordo. Flamenguista declarado, também é autor de “Fio Maravilha” e “W/Brasil”.',
     5: 'Trompetista e compositor norte-americano (1926–1991), um dos nomes mais importantes da história do jazz. Esteve à frente de várias viradas do gênero, do cool jazz e do jazz modal até a fusão com o rock.\nNascido em Alton, no Illinois, e criado em East St. Louis, foi estudar em Nova York e, ainda jovem, tocou com Charlie Parker. Gravou Birth of the Cool, formou um quinteto com John Coltrane e fez com o arranjador Gil Evans discos como Miles Ahead e Sketches of Spain.\nNos anos 1960, montou outro quinteto histórico, com Wayne Shorter e Herbie Hancock, e em 1970 lançou Bitches Brew, que misturou jazz com rock e funk. Muitos músicos que passaram pelas bandas dele viraram estrelas. Morreu em 1991, na Califórnia.',
     6: 'Banda de Liverpool formada por John Lennon, Paul McCartney, George Harrison e Ringo Starr. Entre 1962 e 1970 mudaram a música pop: começaram no rock dançante e terminaram usando o estúdio como instrumento.\nAntes da fama, tocaram por meses em clubes de Hamburgo, na Alemanha. Com o empresário Brian Epstein e o produtor George Martin, lançaram “Love Me Do” em 1962 e, em 1964, conquistaram os Estados Unidos, no auge da beatlemania. Em 1966, pararam de fazer shows para se dedicar ao estúdio, de onde saíram discos como Revolver e Sgt. Pepper’s.\nA banda acabou em 1970, e cada um seguiu carreira solo. John Lennon foi assassinado em 1980, e George Harrison morreu em 2001. Em 2023, Paul e Ringo lançaram “Now and Then”, apresentada como a última música dos Beatles. São a banda que mais vendeu discos na história.',
     7: 'Banda formada em Londres em 1967. Começou tocando blues e virou um fenômeno do rock nos anos 1970, com a formação que reunia Mick Fleetwood, John McVie, Christine McVie, Lindsey Buckingham e Stevie Nicks.\nO nome junta os sobrenomes do baterista Mick Fleetwood e do baixista John McVie. Nos primeiros anos, liderada pelo guitarrista Peter Green, a banda foi uma das principais do blues britânico, com músicas como “Albatross” e “Black Magic Woman”, que depois fez sucesso com Santana.\nChristine McVie entrou em 1970, e Lindsey Buckingham e Stevie Nicks chegaram no fim de 1974, trazendo o pop que levou a banda ao topo com os discos Fleetwood Mac e Rumours. Entrou para o Hall da Fama do Rock em 1998. Christine McVie morreu em 2022.',
     8: 'Grupo do Recife que, no começo dos anos 1990, liderou o manguebeat, movimento que misturou maracatu, rock, hip hop e funk. Chico Science morreu em 1997, aos 30 anos, e a Nação Zumbi seguiu com a banda.\nChico Science, nascido em Olinda, juntou a banda de rock Loustal ao bloco afro Lamento Negro, e da mistura nasceu a Nação Zumbi. Com o manifesto “Caranguejos com Cérebro”, de 1992, o grupo e outras bandas do Recife, como o Mundo Livre S/A, transformaram a cidade num polo da música brasileira.\nCom Chico, gravaram Da Lama ao Caos (1994) e Afrociberdelia (1996) e tocaram em festivais nos Estados Unidos e na Europa. Depois da morte dele, num acidente de carro, Jorge du Peixe assumiu os vocais, e a Nação Zumbi seguiu lançando discos.',
     9: 'Cantor, compositor e escritor carioca, um dos maiores letristas da música brasileira. Durante a ditadura militar, driblou a censura com canções de duplo sentido. Também é romancista premiado.\nFilho do historiador Sérgio Buarque de Holanda, ficou conhecido em 1966, quando “A Banda” venceu o festival da TV Record. Viveu exilado na Itália entre 1969 e 1970 e, de volta, compôs canções como “Apesar de Você” e “Cálice”, esta com Gilberto Gil, ambas alvo da censura.\nTambém escreveu peças, como Roda Viva, Gota d’Água e Ópera do Malandro, e romances como Estorvo, Budapeste e Leite Derramado, premiados com o Jabuti. Em 2019, recebeu o Prêmio Camões, o mais importante da literatura em língua portuguesa.',
     10: 'Cantor e compositor norte-americano (1939–1984), um dos grandes nomes da gravadora Motown. Começou com sucessos românticos e, a partir de What\'s Going On, passou a cantar sobre guerra, pobreza e meio ambiente.\nFilho de um pastor, cresceu cantando na igreja, em Washington. Na Motown, fez duetos de sucesso com Tammi Terrell, como “Ain’t No Mountain High Enough”, e estourou sozinho com “I Heard It Through the Grapevine”, em 1968.\nDepois de What’s Going On, lançou Let’s Get It On, de 1973, e ganhou seus primeiros Grammys com “Sexual Healing”, em 1983. Morreu em 1984, um dia antes de completar 45 anos, baleado pelo próprio pai durante uma briga.',
     11: 'Elis Regina (1945–1982), gaúcha, é considerada por muitos a maior cantora do Brasil. Tom Jobim (1927–1994), carioca, maestro e compositor, foi um dos criadores da bossa nova e é autor de "Garota de Ipanema". Os dois gravaram juntos em Los Angeles, em 1974.\nElis ficou conhecida em 1965, quando venceu o festival da TV Excelsior com “Arrastão”, e no mesmo ano passou a apresentar o programa O Fino da Bossa, com Jair Rodrigues. Ajudou a revelar compositores como Milton Nascimento, Belchior, João Bosco e Aldir Blanc, e morreu em 1982, aos 36 anos.\nTom compôs com Vinicius de Moraes “Chega de Saudade”, que João Gilberto gravou em 1958 dando início à bossa nova, e “Garota de Ipanema”, uma das músicas mais gravadas do mundo. Gravou com Frank Sinatra em 1967, e o aeroporto internacional do Rio leva o nome dele.',
     12: 'Grupo de rap da zona sul de São Paulo formado em 1988 por Mano Brown, Ice Blue, Edi Rock e KL Jay. Com letras sobre a vida na periferia, o racismo e a violência, é o grupo mais influente do rap brasileiro.\nMano Brown e Ice Blue vinham do Capão Redondo, na zona sul, e Edi Rock e KL Jay, da zona norte. Estrearam em 1988 na coletânea Consciência Black e lançaram discos como Holocausto Urbano, Raio X do Brasil, Sobrevivendo no Inferno, Nada Como um Dia Após o Outro Dia e Cores & Valores.\nSempre independentes, recusaram por anos aparecer na TV e construíram o público na base dos shows pela periferia. Mano Brown também comanda o podcast de entrevistas Mano a Mano.',
     13: 'Saxofonista e compositor norte-americano (1926–1967). Tocou com Miles Davis e Thelonious Monk antes de liderar o próprio quarteto, levando o jazz para caminhos cada vez mais livres e espirituais.\nNascido em Hamlet, na Carolina do Norte, ganhou projeção no quinteto de Miles Davis, a partir de 1955, e tocou com Thelonious Monk em 1957. Como líder, lançou Giant Steps, de 1960, famoso pela velocidade das mudanças de acorde, e popularizou o sax soprano em “My Favorite Things”.\nCom McCoy Tyner, Jimmy Garrison e Elvin Jones, formou o quarteto clássico, e nos últimos anos partiu para o free jazz, em discos como Ascension. Morreu em 1967, aos 40 anos, de câncer no fígado. Em São Francisco, uma igreja o tem como santo.',
     14: 'Banda paulistana formada por Rita Lee e pelos irmãos Arnaldo Baptista e Sérgio Dias. Ligados à Tropicália, misturaram rock psicodélico, humor e música brasileira, e são cultuados até hoje no mundo todo.\nFormados em 1966, acompanharam Gilberto Gil em “Domingo no Parque”, no festival da TV Record de 1967, e Caetano Veloso em “É Proibido Proibir”, em 1968. Muitos dos efeitos e instrumentos eram construídos por Cláudio César, irmão de Arnaldo e Sérgio.\nRita Lee saiu em 1972 e virou uma das cantoras mais populares do Brasil; Arnaldo deixou a banda no ano seguinte, e Sérgio seguiu com uma formação de rock progressivo. A banda voltou em 2006, num show em Londres, e tem admiradores como Kurt Cobain, Beck e David Byrne. Rita Lee morreu em 2023.',
     15: 'Banda de hard rock formada em Sydney, na Austrália, em 1973 pelos irmãos Malcolm e Angus Young. Conhecida pelos riffs diretos e pelo uniforme escolar de Angus, é uma das bandas de rock que mais venderam discos no mundo.\nBon Scott foi o vocalista de 1974 até morrer, em fevereiro de 1980, pouco depois do sucesso de Highway to Hell. Com Brian Johnson no lugar, a banda gravou Back in Black e seguiu lotando estádios.\nMalcolm Young deixou a banda em 2014, por causa de uma demência, e morreu em 2017. O AC/DC entrou para o Hall da Fama do Rock em 2003 e lançou Power Up em 2020, com Brian Johnson de volta depois de se afastar por problemas de audição.',
     16: 'Stan Getz (1927–1991), saxofonista norte-americano de som suave, ajudou a levar a bossa nova para os Estados Unidos. João Gilberto (1931–2019), baiano de Juazeiro, criou a batida de violão que define a bossa nova. Com Tom Jobim, gravaram Getz/Gilberto em 1963.\nGetz, que ficou famoso na orquestra de Woody Herman, lançou em 1962, com o violonista Charlie Byrd, o disco Jazz Samba, que chegou ao primeiro lugar nos Estados Unidos e abriu as portas para a bossa nova por lá.\nJoão gravou “Chega de Saudade” em 1958, e aquela batida de violão com voz sussurrada inaugurou a bossa nova. Morou nos Estados Unidos e no México entre 1963 e 1980, ficou conhecido pelo perfeccionismo e pela vida reclusa e morreu em 2019, no Rio.',
     17: 'Banda carioca formada em 1993, que misturou reggae, rock, rap e samba com letras sobre desigualdade e violência nas cidades brasileiras. Marcelo Falcão foi o vocalista na maior parte da carreira.\nA banda nasceu para acompanhar o cantor jamaicano Papa Winnie numa turnê pelo Brasil e decidiu seguir junta depois dela. Na formação clássica, Marcelo Yuka tocava bateria e escrevia boa parte das letras; em 2000, ele foi baleado num assalto, ficou paraplégico e deixou o grupo.\nLançou seis discos de estúdio, de O Rappa (1994) a Nunca Tem Fim... (2013), além do Acústico MTV, de 2005. Depois de uma pausa entre 2009 e 2011, anunciou em 2017 uma parada sem previsão de volta e fez os últimos shows em 2018, no Rio.',
     18: 'Rapper, cantor e compositor paulistano, criado na zona norte de São Paulo. Ficou conhecido nas batalhas de rima e fundou com o irmão, Evandro Fióti, o Laboratório Fantasma, gravadora e marca que lança os discos dele.\nNascido Leandro Roque de Oliveira, em 1985, tirou o nome artístico da junção de MC com homicida, porque “matava” os adversários nas batalhas. Em 2009 lançou a mixtape Pra Quem Já Mordeu um Cachorro por Comida, Até que Eu Cheguei Longe..., vendida de mão em mão, e depois os discos O Glorioso Retorno de Quem Nunca Esteve Aqui (2013) e Sobre Crianças, Quadris, Pesadelos e Lições de Casa (2015).\nCom AmarElo, de 2019, chegou a um público ainda maior, e o show do disco virou documentário na Netflix. O Laboratório Fantasma também tem uma marca de roupas, que já desfilou na São Paulo Fashion Week.',
     19: 'Compositor, arranjador e maestro carioca, que escreveu arranjos para vários nomes da MPB nos anos 1970. O disco que gravou em 1972 ficou esquecido por décadas até ser redescoberto por DJs e produtores de hip hop.\nNascido em 1945, formou-se em engenharia civil antes de se dedicar à música, incentivado por Roberto Menescal. Fez arranjos para Jorge Ben, Gal Costa, Elis Regina, Ivan Lins e Marcos Valle, entre outros. Depois do fracasso comercial do disco de 1972, passou cerca de 30 anos trabalhando com jingles de publicidade.\nA redescoberta pelo hip hop o trouxe de volta: lançou Saudade Demais (2002), Encore (2007) e No Voo do Urubu (2016), fez em 2009 um show com orquestra em Los Angeles, que virou o disco ao vivo Timeless, e trabalhou com artistas como BadBadNotGood e Hiatus Kaiyote.',
     20: 'Banda formada em Brasília em 1982 por Renato Russo e Marcelo Bonfá, com Dado Villa-Lobos na guitarra a partir de 1983. As letras de Renato Russo sobre amor, política e juventude fizeram dela uma das bandas mais populares do rock brasileiro. Acabou em 1996, com a morte do vocalista.\nAntes, Renato tinha tocado no Aborto Elétrico, banda punk de Brasília que também deu origem ao Capital Inicial. A Legião lançou discos como Dois, Que País É Este, As Quatro Estações, V e O Descobrimento do Brasil, com músicas como “Faroeste Caboclo”, “Pais e Filhos” e “Há Tempos”.\nRenato Russo morreu em outubro de 1996, e Dado e Bonfá anunciaram o fim da banda pouco depois. A Legião Urbana segue entre as bandas que mais venderam discos no Brasil, e suas músicas viraram filmes, como Faroeste Caboclo e Eduardo e Mônica.',
     21: 'Encontro do rapper Froid com Santzu, que produziram juntos a mixtape O Homem Não Para Nunca Vol. 1, em 2019. Froid nasceu em Belo Horizonte e começou nas batalhas de rima de Brasília.\nNa época da mixtape, Froid vinha de Teoria do Ciclo da Água (2018) e, no mesmo ano, lançou Sol, em parceria com a cantora Cynthia Luz. Antes da carreira solo, fez parte do grupo Um Barril de Rap, entre 2011 e 2017.',
     22: 'Rapper nascido em Belo Horizonte em 1993, que começou nas batalhas de rima de Brasília e no grupo Um Barril de Rap. Seguiu carreira solo a partir de 2017, com discos como O Pior Disco do Ano e Teoria do Ciclo da Água.\nDepois desses discos, lançou Sol, com Cynthia Luz (2019), Oxigênio (Corona Disco) (2020), Gado (2022), O Queridinho de Deus (2024) e os dois volumes de O Veneno do Escorpião (2024 e 2025), além de parcerias como a mixtape com Santzu. Em 2026, lançou Humor Negro, o trabalho mais pessoal da carreira.\nAlém de rimar, produz boa parte das próprias músicas: em Humor Negro, assina a produção de 8 das 11 faixas.',
     23: 'Cantor e compositor canadense, de Ontário, criado numa família religiosa e marcado pela música gospel. Começou lançando os trabalhos de forma independente e virou um dos nomes mais conhecidos do R&B atual.\nNascido Ashton Simmonds, em 1995, em Oshawa, cresceu numa família adventista e saiu de casa aos 17 anos. Lançou os EPs Praise Break (2014) e Pilgrim’s Paradise (2015) antes da estreia com Freudian, de 2017.\nDepois vieram Case Study 01 (2019) e Never Enough (2023), e ele participou, com Giveon, de “Peaches”, de Justin Bieber, um dos maiores sucessos de 2021. Ganhou o Grammy de melhor performance de R&B por “Best Part”, com H.E.R.',
     24: 'Cantor e compositor norte-americano, de Maryland, conhecido pelo R&B de clima noturno. Lança os discos de forma independente, pelo próprio selo, a ISO Supremacy.\nNascido Christopher Brent Wood, em 1995, em Columbia, começou no trio Sonder e ficou conhecido em 2016 com “Crew”, do rapper GoldLink, indicada ao Grammy. Depois da estreia com Sonder Son (2017), lançou Wasteland, de 2022, que estreou em segundo lugar nos Estados Unidos mesmo sem uma grande gravadora.\nDepois vieram Larger Than Life (2023) e Icon (2026). As músicas dele, de clima noturno e letras sobre relacionamentos e fama, fizeram dele um dos nomes mais ouvidos do R&B atual.',
     25: 'Rapper e cantor paulistano, nascido e criado no Grajaú, na zona sul de São Paulo. Começou nas rodas de rap e, a partir de Nó na Orelha, passou a misturar o rap com samba, MPB e ritmos africanos.\nNascido Kleber Cavalcante Gomes, em 1975, filho de pais cearenses, usou por muito tempo o nome Criolo Doido. Em 2006, criou com DJ Dan Dan a Rinha dos MCs, batalha de rimas que revelou muitos artistas, e lançou o primeiro disco, Ainda Há Tempo.\nDepois de Nó na Orelha, lançou Convoque Seu Buda (2014), Espiral de Ilusão (2017), um disco só de samba, e Sobre Viver (2022). Antes da fama, trabalhou como arte-educador com crianças e jovens.',
     26: 'Cantor e compositor jamaicano, morto em 2013, conhecido pelo falsete. “Police and Thieves”, gravada com o produtor Lee “Scratch” Perry, é uma das músicas de reggae mais conhecidas dos anos 1970.\nNascido Murvin Junior Smith, em Port Antonio, começou a cantar nos anos 1960, inspirado por Curtis Mayfield, e chegou a se apresentar como Junior Soul. Em 1976, levou “Police and Thieves” para uma audição com Lee Perry no Black Ark, e a música virou o maior sucesso da carreira dele.',
   };

   function dadosExemplo() {
     return {
       generos: [
         { id: 1, nome: 'MPB' }, { id: 2, nome: 'Rock' }, { id: 3, nome: 'Jazz' },
         { id: 4, nome: 'Soul e Funk' }, { id: 5, nome: 'Bossa Nova' }, { id: 6, nome: 'Rap' },
         { id: 7, nome: 'R&B' }, { id: 8, nome: 'Reggae' },
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
         { id: 17, nome: 'O Rappa' }, { id: 18, nome: 'Emicida' }, { id: 19, nome: 'Arthur Verocai' },
         { id: 20, nome: 'Legião Urbana' }, { id: 21, nome: 'Froid & Santzu' }, { id: 22, nome: 'Froid' },
         { id: 23, nome: 'Daniel Caesar' }, { id: 24, nome: 'Brent Faiyaz' }, { id: 25, nome: 'Criolo' },
         { id: 26, nome: 'Junior Murvin' },
       ].map(a => ({ ...a, bio: BIOS_ARTISTAS[a.id] ?? '' })),   // junta o resumo de cada artista
       gravadoras: [
         { id: 1, nome: 'EMI-Odeon' }, { id: 2, nome: 'Som Livre' }, { id: 3, nome: 'Polydor' },
         { id: 4, nome: 'Philips' }, { id: 5, nome: 'Columbia' }, { id: 6, nome: 'Apple' },
         { id: 7, nome: 'Warner' }, { id: 8, nome: 'Chaos' }, { id: 9, nome: 'Seroma' },
         { id: 10, nome: 'Tamla' }, { id: 11, nome: 'Cosa Nostra' }, { id: 12, nome: 'Impulse!' },
         { id: 13, nome: 'Atlantic' }, { id: 14, nome: 'Verve' },
         { id: 15, nome: 'Laboratório Fantasma' }, { id: 16, nome: 'Continental' }, { id: 17, nome: 'EMI' },
         { id: 18, nome: 'Independente' }, { id: 19, nome: 'ONErpm' }, { id: 20, nome: 'Golden Child' },
         { id: 21, nome: 'ISO Supremacy' }, { id: 22, nome: 'Oloko Records' }, { id: 23, nome: 'Island' },
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
        { id: 18, titulo: 'Rappa Mundi',             artistaId: 17, generoId: 2, gravadoraId: 7,  ano: 1996, pais: 'Brasil', tamanho: 12, peso: 180, preco: 229.90, condicao: 'Novo',  capa: 'img/capas/rappa-mundi.jpg', foto2: 'img/capas/contracapa-rappa-mundi.jpg' },
        { id: 19, titulo: '7 Vezes',                 artistaId: 17, generoId: 2, gravadoraId: 7,  ano: 2008, pais: 'Brasil', tamanho: 12, peso: 180, preco: 219.90, condicao: 'Novo',  capa: 'img/capas/7-vezes.jpg', foto2: 'img/capas/contracapa-7-vezes.jpg' },
        { id: 20, titulo: 'Nunca Tem Fim...',        artistaId: 17, generoId: 2, gravadoraId: 7,  ano: 2013, pais: 'Brasil', tamanho: 12, peso: 180, preco: 299.90, condicao: 'Novo',  capa: 'img/capas/nunca-tem-fim.jpg', foto2: 'img/capas/contracapa-nunca-tem-fim.jpg' },
        { id: 21, titulo: 'Legião Urbana',           artistaId: 20, generoId: 2, gravadoraId: 1,  ano: 1985, pais: 'Brasil', tamanho: 12, peso: 140, preco: 199.90, condicao: 'Usado', capa: 'img/capas/legiao-urbana.jpg', foto2: 'img/capas/contracapa-legiao-urbana.jpg' },
        { id: 22, titulo: 'Dois',                    artistaId: 20, generoId: 2, gravadoraId: 17, ano: 1986, pais: 'Brasil', tamanho: 12, peso: 140, preco: 189.90, condicao: 'Usado', capa: 'img/capas/dois.jpg', foto2: 'img/capas/contracapa-dois.jpg' },
        { id: 23, titulo: 'Música p/ Acampamentos',  artistaId: 20, generoId: 2, gravadoraId: 17, ano: 1992, pais: 'Brasil', tamanho: 12, peso: 140, preco: 279.90, condicao: 'Usado', capa: 'img/capas/musica-p-acampamentos.jpg', foto2: 'img/capas/contracapa-musica-p-acampamentos.jpg' },
        { id: 24, titulo: 'AmarElo',                 artistaId: 18, generoId: 6, gravadoraId: 15, ano: 2019, pais: 'Brasil', tamanho: 12, peso: 180, preco: 249.90, condicao: 'Novo',  capa: 'img/capas/amarelo.jpg', foto2: 'img/capas/contracapa-amarelo.jpg' },
        { id: 25, titulo: 'Arthur Verocai',          artistaId: 19, generoId: 1, gravadoraId: 16, ano: 1972, pais: 'Brasil', tamanho: 12, peso: 180, preco: 289.90, condicao: 'Novo',  capa: 'img/capas/arthur-verocai-1972.jpg', foto2: 'img/capas/contracapa-arthur-verocai-1972.jpg' },
        { id: 26, titulo: 'Nó na Orelha',            artistaId: 25, generoId: 6, gravadoraId: 22, ano: 2011, pais: 'Brasil', tamanho: 12, peso: 180, preco: 229.90, condicao: 'Novo',  capa: 'img/capas/no-na-orelha.jpg', foto2: 'img/capas/contracapa-no-na-orelha.jpg' },
        { id: 27, titulo: 'O Homem Não Para Nunca Vol. 1', artistaId: 21, generoId: 6, gravadoraId: 18, ano: 2019, pais: 'Brasil', tamanho: 12, peso: 180, preco: 169.90, condicao: 'Novo',  capa: 'img/capas/o-homem-nao-para-nunca.jpg', foto2: 'img/capas/contracapa-o-homem-nao-para-nunca.jpg' },
        { id: 28, titulo: 'Humor Negro',             artistaId: 22, generoId: 6, gravadoraId: 19, ano: 2026, pais: 'Brasil', tamanho: 12, peso: 180, preco: 199.90, condicao: 'Novo',  capa: 'img/capas/humor-negro.jpg', foto2: 'img/capas/contracapa-humor-negro.jpg' },
        { id: 29, titulo: 'Freudian',                artistaId: 23, generoId: 7, gravadoraId: 20, ano: 2017, pais: 'Canadá', tamanho: 12, peso: 180, preco: 259.90, condicao: 'Novo',  capa: 'img/capas/freudian.jpg', foto2: 'img/capas/lp-freudian.jpg' },
        { id: 30, titulo: 'Icon',                    artistaId: 24, generoId: 7, gravadoraId: 21, ano: 2026, pais: 'EUA', tamanho: 12, peso: 180, preco: 279.90, condicao: 'Novo',  capa: 'img/capas/icon.jpg', foto2: 'img/capas/contracapa-icon.jpg' },
        { id: 31, titulo: 'Police & Thieves',        artistaId: 26, generoId: 8, gravadoraId: 23, ano: 1977, pais: 'Jamaica', tamanho: 12, peso: 130, preco: 239.90, condicao: 'Usado', capa: 'img/capas/police-and-thieves.jpg', foto2: 'img/capas/contracapa-police-and-thieves.jpg' },
      ].map(v => ({ ...v, destaque: false, descricao: '', faixas: [], observacao: '', ...TEXTOS_DISCOS[v.id] })), // junta os textos da página de cada disco
       estoque: [
         { vinilId: 1, quantidade: 2 }, { vinilId: 2, quantidade: 4 }, { vinilId: 3, quantidade: 3 },
         { vinilId: 4, quantidade: 1 }, { vinilId: 5, quantidade: 5 }, { vinilId: 6, quantidade: 6 },
         { vinilId: 7, quantidade: 2 }, { vinilId: 8, quantidade: 4 }, { vinilId: 9, quantidade: 1 },
         { vinilId: 10, quantidade: 0 }, { vinilId: 11, quantidade: 3 }, { vinilId: 12, quantidade: 5 },
         { vinilId: 13, quantidade: 7 }, { vinilId: 14, quantidade: 3 }, { vinilId: 15, quantidade: 2 },
         { vinilId: 16, quantidade: 4 }, { vinilId: 17, quantidade: 2 },
         { vinilId: 18, quantidade: 3 }, { vinilId: 19, quantidade: 2 }, { vinilId: 20, quantidade: 4 },
         { vinilId: 21, quantidade: 1 }, { vinilId: 22, quantidade: 1 }, { vinilId: 23, quantidade: 2 },
         { vinilId: 24, quantidade: 5 }, { vinilId: 25, quantidade: 3 }, { vinilId: 26, quantidade: 4 },
         { vinilId: 27, quantidade: 6 }, { vinilId: 28, quantidade: 5 }, { vinilId: 29, quantidade: 3 },
         { vinilId: 30, quantidade: 4 }, { vinilId: 31, quantidade: 1 },
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
     banco = completarCampos(dadosExemplo());   // já marca todos os discos de exemplo como vistos
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