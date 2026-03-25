// ===== SISTEMA DE HISTÓRIA E ESTADO =====
class QuantumHistory {
  constructor(gallery) {
    this.gallery = gallery;
    this.init();
  }

  init() {
    this.applyInitialState();
  }

  applyInitialState() {
    const initialState = {
      category: "all",
      sort: "original",
      page: 1,
    };

    this.applyState(initialState);
  }

  applyState(state) {
    if (state.category !== this.gallery.state.currentCategory) {
      this.gallery.setCategory(state.category, true);
    }

    if (state.sort !== this.gallery.state.currentSort) {
      this.gallery.setSort(state.sort, true);
    }

    if (state.page !== this.gallery.state.currentPage) {
      this.gallery.setPage(state.page, true);
    }
  }
}
