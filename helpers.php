<?php
/**
 * helpers.php: biblioteca de funções de apoio do Roll Diamonds.
 *
 * Responsabilidade única: processar, validar e formatar os dados
 * antes de irem para a tela (index.php).
 * Precisa do configuracao.php carregado antes (usa SITE_URL).
 */

/**
 * Deixa um texto seguro para ir dentro do HTML, trocando < > " ' & pelos
 * códigos do HTML. Assim um texto nunca quebra a página nem injeta código.
 *
 * @see https://www.php.net/manual/pt_BR/function.htmlspecialchars.php
 *
 * @param string $texto Texto que vai aparecer na página.
 * @return string O mesmo texto, com os caracteres especiais convertidos.
 */
function escaparHtml(string $texto): string
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}

/**
 * Limpa um texto (tira tags HTML e espaços nas pontas) e corta no limite de
 * caracteres sem partir palavra no meio, colocando "…" no fim.
 * As tags saem antes do corte, porque elas também contam como caracteres.
 *
 * @see https://www.php.net/manual/pt_BR/function.strip-tags.php
 * @see https://www.php.net/manual/pt_BR/function.mb-substr.php
 *
 * @param string $texto  Texto original, pode ter HTML e espaços sobrando.
 * @param int    $limite Quantidade máxima de caracteres do resultado.
 * @return string Texto limpo com no máximo $limite caracteres.
 */
function resumirTexto(string $texto, int $limite): string
{
    $limpo = trim(strip_tags($texto));

    if ($limite <= 0) {
        return '';
    } elseif (mb_strlen($limpo) <= $limite) {
        return $limpo;                                   // já cabe: não corta
    } else {
        $cortado = mb_substr($limpo, 0, $limite - 1);    // -1 para caber o "…"
        $ultimoEspaco = mb_strrpos($cortado, ' ');
        if ($ultimoEspaco !== false) {
            $cortado = mb_substr($cortado, 0, $ultimoEspaco);   // volta até o fim da última palavra inteira
        }
        return rtrim($cortado, ' ,.;:') . '…';
    }
}

/**
 * Formata um valor em reais no padrão brasileiro.
 * Ex.: 1234.5 vira "R$ 1.234,50" e -10 vira "-R$ 10,00".
 *
 * @see https://www.php.net/manual/pt_BR/function.number-format.php
 *
 * @param float $valor Valor em reais.
 * @return string Valor com "R$", ponto nos milhares e vírgula nos centavos.
 */
function formatarMoeda(float $valor): string
{
    $sinal = '';
    if ($valor < 0) {
        $sinal = '-';
    }
    return $sinal . 'R$ ' . number_format(abs($valor), 2, ',', '.');
}

/**
 * Escreve uma data por extenso em português, no mesmo formato do painel.
 * Ex.: "quarta-feira, 25 de novembro".
 * O date() do PHP devolve os nomes em inglês, por isso os nomes ficam nas listas abaixo.
 *
 * @see https://www.php.net/manual/pt_BR/function.date.php
 *
 * @param int $momento Data a escrever, em segundos desde 1970 (o que o time() devolve).
 * @return string Dia da semana, dia e mês por extenso.
 */
function formatarDataExtenso(int $momento): string
{
    $diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    $meses = [1 => 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
              'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    $diaDaSemana = $diasDaSemana[(int) date('w', $momento)];   // w = 0 (domingo) a 6 (sábado)
    $dia = date('j', $momento);                                // j = dia sem zero na frente
    $mes = $meses[(int) date('n', $momento)];                  // n = mês de 1 a 12

    return $diaDaSemana . ', ' . $dia . ' de ' . $mes;
}

/**
 * Confere se um endereço de internet é válido e começa com http:// ou https://.
 * Usado nos links das redes sociais, que vêm do configuracao.php.
 *
 * @see https://www.php.net/manual/pt_BR/function.filter-var.php
 *
 * @param string $url Endereço a conferir.
 * @return bool true se o endereço pode virar um link, false se não pode.
 */
function validarUrl(string $url): bool
{
    if (filter_var($url, FILTER_VALIDATE_URL) === false) {
        return false;
    }

    $protocolo = parse_url($url, PHP_URL_SCHEME);
    return $protocolo === 'http' || $protocolo === 'https';
}

/**
 * Monta o endereço completo de um arquivo do site a partir do SITE_URL.
 * As redes sociais só aceitam endereço completo na prévia do link.
 *
 * @param string $caminho Caminho dentro do site, ex.: "img/compartilhar.jpg".
 *                        Vazio ('') devolve o endereço do próprio site.
 * @return string Endereço completo, ex.: "https://.../img/compartilhar.jpg".
 */
function urlCompleta(string $caminho): string
{
    return rtrim(SITE_URL, '/') . '/' . ltrim($caminho, '/');
}

/**
 * Coloca no fim do caminho de um CSS ou JS a data da última alteração (?v=...).
 * Quando o arquivo muda, o endereço muda junto e o navegador baixa a versão
 * nova em vez de usar a cópia que guardou.
 *
 * @see https://www.php.net/manual/pt_BR/function.filemtime.php
 *
 * @param string $caminho Caminho do arquivo a partir da pasta do site, ex.: "css/style.css".
 * @return string Caminho com "?v=" e a data, ou o caminho sem mudança se o arquivo não existir.
 */
function versionarArquivo(string $caminho): string
{
    $arquivoNoDisco = __DIR__ . '/' . $caminho;

    if (is_file($arquivoNoDisco)) {
        return $caminho . '?v=' . filemtime($arquivoNoDisco);
    } else {
        return $caminho;
    }
}

/**
 * Devolve o desenho (SVG) de um ícone do site pelo nome.
 *
 * @param string $nome   Nome do ícone: painel, sacola, tema, seta-esquerda, seta-direita,
 *                       diamante, instagram, facebook, youtube ou whatsapp.
 * @param string $classe Classe CSS do <svg>; vazio ('') para não colocar classe.
 * @return string Código <svg> pronto para a página, ou texto vazio se o nome não existir.
 */
function icone(string $nome, string $classe = ''): string
{
    // nome => [viewBox, desenho]
    $icones = [
        'painel' => ['0 0 24 24',
            '<rect x="3.5" y="3.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<rect x="13.5" y="3.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<rect x="3.5" y="13.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<rect x="13.5" y="13.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/>'],
        'sacola' => ['0 0 24 24',
            '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
          . '<path d="M9 10V6.5a3 3 0 0 1 6 0V10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'],
        'tema' => ['0 0 24 24',
            '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>'],
        'seta-esquerda' => ['0 0 24 24',
            '<path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'],
        'seta-direita' => ['0 0 24 24',
            '<path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'],
        'diamante' => ['0 0 24 20',
            '<path d="M5 1h14l4 6-11 12L1 7z M1 7h22 M8 1 6 7l6 12 6-12-2-6 M6 7l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'],
        'instagram' => ['0 0 24 24',
            '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>'],
        'facebook' => ['0 0 24 24',
            '<path d="M13.5 21v-7.5H16l.5-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.5V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.4H7v3h2.5V21z" fill="currentColor"/>'],
        'youtube' => ['0 0 24 24',
            '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.7"/>'
          . '<path d="M10 9.2v5.6l5-2.8z" fill="currentColor"/>'],
        'whatsapp' => ['0 0 24 24',
            '<path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
          . '<path d="M9.2 8.6c.3-.4.7-.4.9 0l.7 1.5c.1.3 0 .5-.2.7l-.4.4c.5 1.1 1.4 2 2.5 2.5l.4-.4c.2-.2.5-.3.7-.2l1.5.7c.4.2.4.6 0 .9-.6.6-1.5.9-2.4.5a8.3 8.3 0 0 1-4.2-4.2c-.4-.9-.1-1.8.5-2.4z" fill="currentColor"/>'],
    ];

    if (!isset($icones[$nome])) {
        return '';
    }

    [$viewBox, $desenho] = $icones[$nome];
    $atributoClasse = '';
    if ($classe !== '') {
        $atributoClasse = ' class="' . escaparHtml($classe) . '"';
    }

    return '<svg' . $atributoClasse . ' viewBox="' . $viewBox . '" aria-hidden="true">' . $desenho . '</svg>';
}
