class QuantumFavoritesSystem {
  constructor(gallery) {
    this.gallery = gallery;
    this.favorites = new Set();
    this.favoritesOrder = [];
    this.init();
  }

  init() {
    this.loadFavorites();
    this.setupEventListeners();
    this.setupDragAndDrop();
  }

  loadFavorites() {
    const saved = localStorage.getItem("nexus_favorites_13");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.favorites = new Set(data.favorites || []);
        this.favoritesOrder = data.order || Array.from(this.favorites);
      } catch (e) {
        this.favorites = new Set();
        this.favoritesOrder = [];
      }
    }
  }

  saveFavorites() {
    const data = {
      favorites: Array.from(this.favorites),
      order: this.favoritesOrder,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("nexus_favorites_13", JSON.stringify(data));
  }

  toggleFavorite(id) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
      this.favoritesOrder = this.favoritesOrder.filter((favId) => favId !== id);
      this.gallery.showToast("❤️ REMOVIDO DOS FAVORITOS");
    } else {
      this.favorites.add(id);
      this.favoritesOrder.push(id);
      this.gallery.showToast("⭐ ADICIONADO AOS FAVORITOS 13/10");
    }
    this.saveFavorites();
    this.updateFavoritesCount();
    this.updateFavoritesStats();
    this.updateFavoriteButton(id);

    // Atualizar contador no terminal
    this.updateTerminalCount();
  }

  isFavorite(id) {
    return this.favorites.has(id);
  }

  getFavorites() {
    return this.favoritesOrder
      .map((id) => this.gallery.charactersData.find((char) => char.id === id))
      .filter(Boolean);
  }

  updateFavoritesCount() {
    const favoritesToggle = document.getElementById("favoritesToggle");
    const favoritesCount = document.getElementById("favoritesCount");
    const count = this.favorites.size;

    if (favoritesToggle) {
      favoritesToggle.setAttribute("data-count", count);
    }

    if (favoritesCount) {
      favoritesCount.textContent = count;
      favoritesCount.style.background = this.getCountColor(count);
    }

    this.updateFavoritesStats();
  }

  updateTerminalCount() {
    const terminalCount = document.getElementById("favoritesCountTerminal");
    if (terminalCount) {
      terminalCount.textContent = this.favorites.size;
    }
  }

  getCountColor(count) {
    if (count === 0) return "linear-gradient(135deg, #ff2a6d, #ff00aa)";
    if (count < 5) return "linear-gradient(135deg, #00ffea, #00b3ff)";
    if (count < 10) return "linear-gradient(135deg, #00ff9d, #00ffea)";
    return "var(--quantum-gradient)";
  }

  updateFavoritesStats() {
    const statsElement = document.getElementById("favoritesStats");
    if (!statsElement) return;

    const count = this.favorites.size;
    if (count === 0) {
      statsElement.textContent = "Nenhum favorito adicionado";
    } else if (count === 1) {
      statsElement.textContent = "1 item premium na sua coleção";
    } else {
      statsElement.textContent = `${count} itens premium na sua coleção 13/10`;
    }
  }

  setupEventListeners() {
    const clearAllFavorites = document.getElementById("clearAllFavorites");
    if (clearAllFavorites) {
      clearAllFavorites.addEventListener("click", () => {
        this.clearAllFavorites();
      });
    }

    const browseCharacters = document.getElementById("browseCharacters");
    if (browseCharacters) {
      browseCharacters.addEventListener("click", () => {
        this.gallery.showGalleryPage();
      });
    }

    const shareFavoritesBtn = document.getElementById("shareFavoritesBtn");
    if (shareFavoritesBtn) {
      shareFavoritesBtn.addEventListener("click", () => {
        this.shareFavorites();
      });
    }
  }

  // TERCEIRA ALTERAÇÃO: Notificação personalizada para "Limpar coleção"
  clearAllFavorites() {
    if (this.favorites.size === 0) {
      this.showClearNotification("Sua coleção já está vazia!", "info");
      return;
    }

    // Criar notificação customizada
    const notification = this.createClearNotification();
    document.body.appendChild(notification);

    // Mostrar notificação
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Configurar botões da notificação
    const confirmBtn = notification.querySelector(".clear-confirm");
    const cancelBtn = notification.querySelector(".clear-cancel");

    confirmBtn.addEventListener("click", () => {
      const removedIds = Array.from(this.favorites);
      this.favorites.clear();
      this.favoritesOrder = [];
      this.saveFavorites();
      this.updateFavoritesCount();
      this.updateTerminalCount();
      this.renderFavoritesPage();
      this.gallery.showToast("🗑️ TODOS OS FAVORITOS REMOVIDOS");

      removedIds.forEach((id) => this.updateFavoriteButton(id));

      // Fechar notificação
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });

    cancelBtn.addEventListener("click", () => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });

    // Fechar automaticamente após 10 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove("show");
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 10000);
  }

  createClearNotification() {
    const notification = document.createElement("div");
    notification.className = "clear-notification";
    notification.innerHTML = `
            <div class="clear-notification-content">
                <div class="clear-notification-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Limpar Coleção de Favoritos</h3>
                </div>
                <div class="clear-notification-body">
                    <p>Tem certeza que deseja remover <strong>${this.favorites.size}</strong> favoritos?</p>
                    <p class="warning-text">Esta ação não pode ser desfeita!</p>
                    <div class="clear-notification-stats">
                        <div class="stat-item">
                            <i class="fas fa-heart"></i>
                            <span>${this.favorites.size} itens</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span>Ação permanente</span>
                        </div>
                    </div>
                </div>
                <div class="clear-notification-footer">
                    <button class="clear-confirm">
                        <i class="fas fa-trash"></i>
                        LIMPAR TUDO
                    </button>
                    <button class="clear-cancel">
                        <i class="fas fa-times"></i>
                        CANCELAR
                    </button>
                </div>
            </div>
        `;

    // Adicionar estilos dinâmicos
    const style = document.createElement("style");
    style.textContent = `
            .clear-notification {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .clear-notification.show {
                opacity: 1;
                visibility: visible;
            }
            
            .clear-notification-content {
                background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(30, 30, 60, 0.9));
                border: 3px solid transparent;
                background-clip: padding-box;
                border-radius: var(--border-radius-xl);
                padding: 40px;
                max-width: 500px;
                width: 90%;
                position: relative;
                box-shadow: 0 0 100px rgba(255, 42, 109, 0.5),
                            inset 0 0 50px rgba(255, 42, 109, 0.1);
                transform: scale(0.8) translateY(-50px);
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .clear-notification.show .clear-notification-content {
                transform: scale(1) translateY(0);
            }
            
            .clear-notification-content::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                background: linear-gradient(45deg, #ff2a6d, #ff00aa, #ff2a6d);
                border-radius: var(--border-radius-xl);
                z-index: -1;
                opacity: 0.6;
                filter: blur(20px);
                animation: borderPulse 2s linear infinite;
            }
            
            @keyframes borderPulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 0.9; }
            }
            
            .clear-notification-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
                color: var(--quantum-danger);
            }
            
            .clear-notification-header i {
                font-size: 2.5rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .clear-notification-header h3 {
                font-size: 1.8rem;
                font-family: 'Orbitron', monospace;
                letter-spacing: 2px;
                background: linear-gradient(45deg, #ff2a6d, #ff00aa);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
            }
            
            .clear-notification-body {
                margin-bottom: 40px;
            }
            
            .clear-notification-body p {
                color: var(--text-primary);
                font-size: 1.2rem;
                margin-bottom: 15px;
                line-height: 1.6;
            }
            
            .clear-notification-body strong {
                color: var(--quantum-danger);
                font-size: 1.4rem;
            }
            
            .warning-text {
                color: var(--quantum-danger) !important;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-size: 1.1rem !important;
                animation: warningFlash 1s ease-in-out infinite alternate;
            }
            
            @keyframes warningFlash {
                from { opacity: 0.7; }
                to { opacity: 1; }
            }
            
            .clear-notification-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-top: 30px;
                background: rgba(0, 0, 0, 0.3);
                padding: 20px;
                border-radius: var(--border-radius-lg);
                border: 1px solid rgba(255, 42, 109, 0.3);
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 15px;
                color: var(--text-secondary);
                font-size: 1rem;
            }
            
            .stat-item i {
                color: var(--quantum-danger);
                font-size: 1.3rem;
            }
            
            .clear-notification-footer {
                display: flex;
                gap: 20px;
                justify-content: space-between;
            }
            
            .clear-confirm, .clear-cancel {
                flex: 1;
                padding: 18px 30px;
                border: none;
                border-radius: var(--border-radius-lg);
                font-family: 'Rajdhani', sans-serif;
                font-weight: 700;
                font-size: 1.1rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .clear-confirm {
                background: linear-gradient(135deg, #ff2a6d, #ff00aa);
                color: white;
                box-shadow: 0 5px 25px rgba(255, 42, 109, 0.4);
            }
            
            .clear-confirm:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(255, 42, 109, 0.6);
            }
            
            .clear-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .clear-cancel:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
                transform: translateY(-5px);
            }
            
            @media (max-width: 576px) {
                .clear-notification-content {
                    padding: 30px 20px;
                }
                
                .clear-notification-footer {
                    flex-direction: column;
                }
                
                .clear-notification-stats {
                    grid-template-columns: 1fr;
                }
            }
        `;

    document.head.appendChild(style);
    return notification;
  }

  showClearNotification(message, type = "warning") {
    this.gallery.showToast(message);
  }

  renderFavoritesPage() {
    const container = document.getElementById("favoritesGrid");
    const empty = document.getElementById("emptyFavorites");

    if (!container || !empty) return;

    const favorites = this.getFavorites();

    if (favorites.length === 0) {
      container.style.display = "none";
      empty.style.display = "flex";
      return;
    }

    container.style.display = "grid";
    empty.style.display = "none";
    container.innerHTML = "";

    favorites.forEach((character) => {
      const card = this.createFavoriteCard(character);
      container.appendChild(card);
    });

    this.setupDragAndDrop();
  }

  createFavoriteCard(character) {
    const card = document.createElement("div");
    card.className = "favorites-card";
    card.dataset.id = character.id;
    card.draggable = true;

    const normalizedPath = this.gallery.cache.normalizePath(character.image);
    const cachedImg = this.gallery.cache.imageCache.get(normalizedPath);
    const imgSrc = cachedImg ? cachedImg.src : character.image;

    card.innerHTML = `
            <div class="favorites-card-image">
                <img src="${imgSrc}" alt="${character.name}" loading="lazy">
                <div class="favorites-card-category">${character.category}</div>
                <button class="favorites-card-remove" data-id="${character.id}" aria-label="Remover dos favoritos">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="favorites-card-content">
                <h3 class="favorites-card-title">${character.name}</h3>
                <p class="favorites-card-description">${character.description.substring(0, 100)}...</p>
                <div class="favorites-card-actions">
                    <button class="favorites-card-view" data-id="${character.id}">
                        <i class="fas fa-eye"></i> VER DETALHES
                    </button>
                    <div class="favorites-card-drag-handle" title="Arraste para reordenar">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                </div>
            </div>
        `;

    const removeBtn = card.querySelector(".favorites-card-remove");
    const viewBtn = card.querySelector(".favorites-card-view");

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.dataset.id);
      this.toggleFavorite(id);
      this.renderFavoritesPage();
      this.gallery.audio.play("click");
    });

    // SEGUNDA ALTERAÇÃO: Quando clicar em "VER DETALHES" na página de favoritos,
    // abrir o modal mantendo o usuário na página de favoritos
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.dataset.id);
      const character = this.gallery.charactersData.find(
        (char) => char.id === id,
      );
      if (character) {
        // Abrir modal diretamente na página de favoritos
        this.gallery.openModalFromFavorites(character);
      }
    });

    return card;
  }

  setupDragAndDrop() {
    const container = document.getElementById("favoritesGrid");
    if (!container) return;

    let draggedItem = null;
    let dropZone = null;

    container.querySelectorAll(".favorites-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        draggedItem = card;
        setTimeout(() => {
          card.classList.add("dragging");
        }, 0);
      });

      card.addEventListener("dragend", (e) => {
        setTimeout(() => {
          card.classList.remove("dragging");
          if (dropZone) {
            dropZone.classList.remove("favorites-drop-zone");
            dropZone = null;
          }
          draggedItem = null;
        }, 0);
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (draggedItem !== card) {
          card.classList.add("favorites-drop-zone");
          dropZone = card;
        }
      });

      card.addEventListener("dragleave", (e) => {
        if (draggedItem !== card) {
          card.classList.remove("favorites-drop-zone");
          if (dropZone === card) {
            dropZone = null;
          }
        }
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedItem !== card) {
          const draggedId = parseInt(draggedItem.dataset.id);
          const targetId = parseInt(card.dataset.id);

          const draggedIndex = this.favoritesOrder.indexOf(draggedId);
          const targetIndex = this.favoritesOrder.indexOf(targetId);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            this.favoritesOrder.splice(draggedIndex, 1);
            this.favoritesOrder.splice(targetIndex, 0, draggedId);
            this.saveFavorites();
            this.renderFavoritesPage();
            this.gallery.showToast("🔄 COLEÇÃO REORGANIZADA 13/10");
          }
        }
        card.classList.remove("favorites-drop-zone");
        dropZone = null;
      });
    });
  }

  updateFavoriteButton(id) {
    const card = document.querySelector(`.quantum-card[data-id="${id}"]`);
    if (card) {
      const favoriteBtn = card.querySelector(".quantum-favorite");
      const icon = favoriteBtn.querySelector("i");
      const isFavorite = this.isFavorite(id);
      if (isFavorite) {
        icon.className = "fas fa-heart";
        favoriteBtn.classList.add("active");
      } else {
        icon.className = "far fa-heart";
        favoriteBtn.classList.remove("active");
      }
    }

    const modalFavoriteBtn = document.querySelector(
      `.modal-quantum .quantum-favorite[data-id="${id}"]`,
    );
    if (modalFavoriteBtn) {
      const modalIcon = modalFavoriteBtn.querySelector("i");
      if (this.isFavorite(id)) {
        modalIcon.className = "fas fa-heart";
        modalFavoriteBtn.classList.add("active");
      } else {
        modalIcon.className = "far fa-heart";
        modalFavoriteBtn.classList.remove("active");
      }
    }
  }

  shareFavorites() {
    const favorites = this.getFavorites();
    if (favorites.length === 0) {
      this.gallery.showToast("❌ NENHUM FAVORITO PARA COMPARTILHAR");
      return;
    }

    const shareText = `Minha coleção Nexus Universe 13/10 (${favorites.length} favoritos):\n\n${favorites
      .map((char, i) => `${i + 1}. ${char.name} (${char.category})`)
      .join("\n")}\n\nExplore em: ${window.location.href}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Minha Coleção Nexus Universe 13/10",
          text: shareText,
          url: window.location.href,
        })
        .then(() => {
          this.gallery.showToast("✅ COLEÇÃO COMPARTILHADA!");
        })
        .catch(() => {
          this.copyToClipboard(shareText);
        });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.gallery.showToast(
          "📋 COLEÇÃO COPIADA PARA A ÁREA DE TRANSFERÊNCIA!",
        );
      })
      .catch(() => {
        this.gallery.showToast("❌ ERRO AO COPIAR");
      });
  }
}
