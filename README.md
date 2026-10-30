# Roll Diamonds · Discos de vinil

Loja virtual de discos de vinil novos e usados, com vitrine, catálogo, página de cada disco, sacola de compras e um painel administrativo para cuidar da loja.

Projeto Integrador do Curso Técnico em Desenvolvimento de Sistemas, SENAC.

**Site no ar:** https://gabrielalmeidaviegas576-cmyk.github.io/Roll-diamonds/

## Como abrir

- **Pela internet:** acesse o link acima.
- **No computador:** baixe ou clone o repositório e abra o arquivo `index.html` no navegador. Não precisa instalar nada.

### Acesso ao painel da loja

Clique em **Painel**, no canto esquerdo do cabeçalho, e entre com:

| Usuário | Senha     |
|---------|-----------|
| `admin` | `roll123` |

## O que o site faz

### Para quem compra
- **Vitrine com carrossel** dos discos em destaque: dá para trocar pelas setas, pelas bolinhas, pelo teclado (← →) ou arrastando a capa.
- **Catálogo** com busca por disco ou artista, filtro por gênero e ordenação (ordem da prateleira, chegaram por último, menor e maior preço, ano de lançamento). Passando o mouse na capa, aparece a contracapa.
- **Página de cada disco** com:
  - galeria (capa e segunda foto) com setas e **zoom**: com o mouse, a foto aumenta e acompanha o cursor; no celular, é só tocar na foto;
  - ficha com ano, país, gravadora, gênero, tamanho, peso e estado do exemplar;
  - lista de faixas (com "Ver mais"), resumo do álbum e resumo do artista;
  - sugestões de discos parecidos ("Compre também").
- **Sacola** com quantidades, total e finalização do pedido.
- **Tema claro e escuro**, que fica salvo para a próxima visita.
- Páginas de **dúvidas frequentes** e **mapa do site**, no rodapé.

### Para quem cuida da loja (painel)
- **Resumo:** números da loja (discos no estoque, títulos no catálogo, pedidos a despachar e total vendido).
- **Discos e estoque:** cadastrar, editar e excluir discos, com capa, segunda foto, faixas, textos e quantidade em estoque.
- **Clientes:** cadastrar, editar e excluir.
- **Pedidos:** acompanhar e mudar o status (aguardando pagamento, pago, enviado, entregue, cancelado).
- **Artistas, gêneros e gravadoras:** cadastrar, remover e escrever o resumo de cada artista.
- **Restaurar dados de exemplo:** volta a loja para os dados iniciais.

## Onde os dados ficam

O site não tem servidor: tudo funciona no navegador, com **HTML, CSS e JavaScript puro**. Os dados ficam salvos no `localStorage` do navegador.

Por isso, o que é cadastrado ou comprado vale **só no navegador e no aparelho em que foi feito**. Em outro computador, o site começa com os dados de exemplo.

Os dados seguem a estrutura do banco `roll_diamonds`: cada lista do `js/script.js` corresponde a uma tabela (`genero_musical`, `artista`, `gravadora`, `vinil`, `estoque`, `cliente`, `usuario`, `pedido` e `item_pedido`). As faixas de cada disco, que no site ficam numa lista dentro do disco, viram a tabela `faixa` no banco.

## Estrutura do projeto

```
Roll-diamonds/
├── index.html         página única: loja, página do disco, painel, FAQ e mapa do site
├── css/
│   ├── style.css      todo o visual do site
│   └── capas.css      regras das fotos de capa
├── js/
│   └── script.js      dados de exemplo, telas, sacola, painel e navegação
├── fonts/             fontes guardadas no projeto (Milesdane e Poppins)
└── img/
    ├── capas/         capas, contracapas e logo
    ├── favicon.png    ícone da aba do navegador
    └── compartilhar.jpg  imagem que aparece ao compartilhar o link
```

A navegação usa o `#` do endereço: `#catalogo`, `#disco/5` (página do disco de número 5), `#painel`, `#faq` e `#mapa-do-site`.

## Créditos

- **Fontes:** Milesdane (versão de teste), Poppins (só nos números), e pelo Google Fonts: Rye, Yellowtail, Alegreya Sans e Alegreya Sans SC.
- **Capas e contracapas** dos discos usadas apenas para fins didáticos; os direitos pertencem às gravadoras e aos artistas.
