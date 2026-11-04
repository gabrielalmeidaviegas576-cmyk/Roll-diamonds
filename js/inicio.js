   /* =====================================================================
      10. INICIALIZAÇÃO
      ===================================================================== */
   aplicarTema(ler(CHAVE_TEMA));
   $('#anoAtual').textContent = new Date().getFullYear();   // ano dos direitos no rodapé
   atualizarTudo();
   mostrarView();
   // A capa da vitrine aparece logo depois que a página abre
   setTimeout(() => $('#vitrola').classList.remove('guardando'), semMovimento ? 0 : 250);