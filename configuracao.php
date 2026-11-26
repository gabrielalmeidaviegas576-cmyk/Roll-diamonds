<?php
/*
 * Configurações do site Roll Diamonds.
 * Tudo o que muda de um lugar para outro (nome, endereço, redes sociais, banco)
 * fica aqui, num lugar só. O index.php lê estes valores.
 */

// Fuso horário usado nas datas (ano do rodapé, por exemplo)
date_default_timezone_set('America/Sao_Paulo');

// ---------- Site ----------
define('SITE_NOME', 'Roll Diamonds');
define('SITE_TITULO', 'Roll Diamonds | Discos de Vinil');
define('SITE_DESCRICAO', 'Discos de vinil novos e usados, ouvidos lado A e lado B antes de irem pra prateleira. Da MPB ao jazz.');
define('COR_TEMA', '#23170f');   // cor da barra do navegador no celular

// Endereço completo do site, terminando com "/".
// As redes sociais só aceitam endereço completo na prévia do link (imagem, título).
define('SITE_URL', 'https://gabrielalmeidaviegas576-cmyk.github.io/Roll-diamonds/');

// ---------- Redes sociais (rodapé) ----------
// Troque os links pelos perfis da loja. "icone" é o nome do desenho em helpers.php.
define('REDES_SOCIAIS', [
    ['nome' => 'Instagram', 'icone' => 'instagram', 'link' => 'https://www.instagram.com/'],
    ['nome' => 'Facebook',  'icone' => 'facebook',  'link' => 'https://www.facebook.com/'],
    ['nome' => 'YouTube',   'icone' => 'youtube',   'link' => 'https://www.youtube.com/'],
    ['nome' => 'WhatsApp',  'icone' => 'whatsapp',  'link' => 'https://wa.me/'],
]);

// ---------- Banco de dados (XAMPP) ----------
// O site ainda guarda os dados no navegador; estes valores ficam prontos
// para quando ele for ligado ao banco roll_diamonds.
define('DB_HOST', 'localhost');
define('DB_PORTA', 3306);
define('DB_NOME', 'roll_diamonds');
define('DB_USUARIO', 'root');
define('DB_SENHA', '');
