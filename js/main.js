function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
  }
  
  if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star empty"></i>';
  }
  
  return starsHTML;
}

const createProducts = (products, container) => {
  container.innerHTML = '';
  
  let productsArray;
  if (typeof products === 'object' && !Array.isArray(products)) {
    productsArray = Object.values(products);
    productsArray.forEach((product, index) => {
      product.id = Object.keys(products)[index];
    });
  } else {
    productsArray = products;
  }
  
  if (productsArray.length === 0) {
    container.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
    return;
  }
  
  productsArray.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <a href="./product/product.html?shoe=${product.id || product.name.toLowerCase().replace(/\s+/g, '-')}">
            <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='img/placeholder.jpg'">
        </a> 
      </div>
      <div class="product-info">
          <a href="./product/product.html?shoe=${product.id || product.name.toLowerCase().replace(/\s+/g, '-')}">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-price">
                  <span class="current-price">R$${String(product.price.toFixed(2)).replace('.',',')}</span>
                  ${product.originalPrice ? `<span class="original-price">R$${String(product.originalPrice.toFixed(2)).replace('.',',')}</span>` : ''}
                  ${product.discount ? `<span class="discount">${product.discount}</span>` : ''}
              </div>
              ${product.installments ? `<div class="installments">${product.installments}</div>` : ''}
              <div class="product-rating">
                  <div class="stars">
                      ${renderStars(product.rating || 0)}
                  </div>
                  <span class="review-count">(${product.reviewCount || 0})</span>
              </div>
          </a> 
          <div class="product-actions">
              <a href="./product/product.html?shoe=${product.id || product.name.toLowerCase().replace(/\s+/g, '-')}" class="add-to-cart">Comprar</a>
          </div>
      </div>
    `;
    
    container.appendChild(productCard);
  });
}

function getBrandFromProduct(product) {
  const name = product.name.toLowerCase();
  if (name.includes('nike')) return 'Nike';
  if (name.includes('jordan')) return 'Jordan';
  if (name.includes('adidas')) return 'Adidas';
  if (name.includes('vans')) return 'Vans';
  return 'Outros';
}

function initFilters() {
  const filterLinks = document.querySelectorAll('.filter-list a');
  const sortSelect = document.querySelector('.sort-select');
  let allProducts = [];

  filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const filterValue = this.textContent.trim();
      filterProducts(filterValue);
      filterLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortProducts(this.value);
    });
  }

  function filterProducts(filterValue) {
    const filtered = allProducts.filter(product => {
      const brand = getBrandFromProduct(product);
      return brand === filterValue;
    });
    
    const container = document.querySelector('.filtered-products-grid');
    createProducts(filtered, container);
  }

  function sortProducts(sortValue) {
    let sortedProducts = [...allProducts];
    
    switch(sortValue) {
      case 'Preço: Menor ao Maior':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'Preço: Maior ao Menor':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'A - Z':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Z - A':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Mais Vendidos':
        sortedProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }
    
    const container = document.querySelector('.filtered-products-grid');
    createProducts(sortedProducts, container);
  }

  return {
    setProducts: (products) => {
      if (typeof products === 'object' && !Array.isArray(products)) {
        allProducts = Object.values(products).map((product, index) => {
          return {
            ...product,
            id: Object.keys(products)[index]
          };
        });
      } else {
        allProducts = products;
      }
    }
  };
}

function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
    const searchContainer = document.querySelector('.search-container');
    
    let allProducts = [];

    function getSearchResults(query) {
        return allProducts.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
    }

    function generateSuggestions(query) {
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        const filteredProducts = getSearchResults(query).slice(0, 5);
        displaySuggestions(filteredProducts, query);
    }

    function displaySuggestions(products, query) {
        if (products.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="no-suggestions">
                    Nenhum produto encontrado para "${query}"
                </div>
            `;
        } else {
            searchSuggestions.innerHTML = products.map(product => `
                <a href="./product/product.html?shoe=${product.id || product.name.toLowerCase().replace(/\s+/g, '-')}" class="suggestion-item" data-product-id="${product.id}">
                    <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='img/placeholder.jpg'">
                    <div class="suggestion-info">
                        <div class="suggestion-name">${highlightMatch(product.name, query)}</div>
                        <div class="suggestion-price">R$ ${String(product.price.toFixed(2)).replace('.', ',')}</div>
                    </div>
                </div>
            `).join('');
        }
        
        showSuggestions();
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    function showSuggestions() {
        searchSuggestions.classList.add('active');
        searchForm.classList.add('suggestions-active');
    }

    function hideSuggestions() {
        searchSuggestions.classList.remove('active');
        searchForm.classList.remove('suggestions-active');
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        performSearch(query);
        hideSuggestions();
    });

    searchInput.addEventListener('input', function() {
        generateSuggestions(this.value);
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.length >= 2) {
            generateSuggestions(this.value);
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            hideSuggestions();
        }
    });

    searchSuggestions.addEventListener('click', function(e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            const productId = suggestionItem.dataset.productId;
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                searchInput.value = product.name;
                performSearch(product.name);
                hideSuggestions();
            }
        }
    });

    mobileSearchToggle.addEventListener('click', function() {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('keydown', function(e) {
        const suggestions = searchSuggestions.querySelectorAll('.suggestion-item');
        const activeSuggestion = searchSuggestions.querySelector('.suggestion-item:hover');
        
        if (e.key === 'ArrowDown' && suggestions.length > 0) {
            e.preventDefault();
            const firstSuggestion = suggestions[0];
            if (!activeSuggestion) {
                firstSuggestion.style.backgroundColor = 'var(--secondary-color)';
            } else {
                activeSuggestion.style.backgroundColor = '';
                const nextSuggestion = activeSuggestion.nextElementSibling || firstSuggestion;
                nextSuggestion.style.backgroundColor = 'var(--secondary-color)';
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    return {
        setProducts: (products) => {
            if (typeof products === 'object' && !Array.isArray(products)) {
                allProducts = Object.values(products).map((product, index) => {
                    return {
                        ...product,
                        id: Object.keys(products)[index]
                    };
                });
            } else {
                allProducts = products;
            }
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const filterSystem = initFilters();
    const searchSystem = initSearch();

    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    let currentIndex = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let slideInterval;

    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.slider-dots span');
    if (dots.length > 0) dots[0].classList.add('active');

    slides.forEach((slide, index) => {
        slide.addEventListener('touchstart', touchStart(index));
        slide.addEventListener('touchend', touchEnd);
        slide.addEventListener('touchmove', touchMove);
        
        slide.addEventListener('mousedown', touchStart(index));
        slide.addEventListener('mouseup', touchEnd);
        slide.addEventListener('mouseleave', touchEnd);
        slide.addEventListener('mousemove', touchMove);
    });

    window.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        resetInterval();
    });
    
    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        resetInterval();
    });

    function startSlider() {
        slideInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startSlider();
    }

    function goToSlide(index) {
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        currentIndex = index;
        updateSlider();
    }

    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function touchStart(index) {
        return function(event) {
            isDragging = true;
            currentIndex = index;
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            track.style.transition = 'none';
            resetInterval();
        }
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -100 && currentIndex < slides.length - 1) {
            currentIndex += 1;
        }
        
        if (movedBy > 100 && currentIndex > 0) {
            currentIndex -= 1;
        }
        
        goToSlide(currentIndex);
    }

    function touchMove(event) {
        if (!isDragging) return;
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }

    function animation() {
        track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${currentTranslate}px))`;
        animationID = requestAnimationFrame(animation);
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    startSlider();

    Promise.all([
        fetch('lancamentos.json').then(r => r.json()),
        fetch('products.json').then(r => r.json())
    ]).then(([lancamentosData, productsData]) => {
        const lancamentosProducts = lancamentosData;
        const filteredProducts = productsData;
        
        createProducts(lancamentosProducts, document.querySelector('.products-grid'));
        createProducts(filteredProducts, document.querySelector('.filtered-products-grid'));
        
        const allProductsCombined = { ...lancamentosProducts, ...filteredProducts };
        filterSystem.setProducts(filteredProducts);
        searchSystem.setProducts(allProductsCombined);
        
    }).catch(error => {
        console.error('Error loading products:', error);
        document.querySelector('.products-grid').innerHTML = 
            '<p class="error-message">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
    });

    const filterGroups = document.querySelectorAll('.filter-group');
    if (window.innerWidth <= 768) {
        filterGroups.forEach(group => {
            const toggle = document.createElement('button');
            toggle.className = 'filter-mobile-toggle';
            toggle.textContent = group.querySelector('h3').textContent;
            group.insertBefore(toggle, group.querySelector('h3'));
            group.classList.remove('active');
            
            toggle.addEventListener('click', () => {
                group.classList.toggle('active');
            });
        });
    }

    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
    const searchContainer = document.querySelector('.search-container');
    
    if (mobileSearchToggle) {
        mobileSearchToggle.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                document.getElementById('search-input').focus();
            }
        });
    }
});
