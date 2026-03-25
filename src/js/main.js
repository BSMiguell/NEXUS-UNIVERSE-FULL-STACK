// ===== INICIALIZAÇÃO =====
window.gallery = null;
window.CONFIG = CONFIG;

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM Carregado - Iniciando Nexus Universe 13/10");

  new QuantumPreloader();

  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  document.documentElement.classList.add("js-enabled");

  // Handler para Newsletter do Footer
  const footerSubscribe = document.getElementById("footerSubscribe");
  if (footerSubscribe) {
    footerSubscribe.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = footerSubscribe.querySelector("input");
      if (input && input.value) {
        if (window.gallery && typeof window.gallery.showToast === "function") {
          window.gallery.showToast(
            "FREQUÊNCIA SINCRONIZADA! BEM-VINDO AO MULTIVERSO.",
          );
        } else {
          alert("FREQUÊNCIA SINCRONIZADA!");
        }
        input.value = "";
      }
    });
  }

  console.log("✅ Sistema 13/10 inicializado com sucesso");
});

window.addEventListener("beforeunload", () => {
  if (window.gallery) {
    window.gallery.cleanup();
  }
});
