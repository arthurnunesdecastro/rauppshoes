function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHTML = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
  }
  
  // Half star
  if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star empty"></i>';
  }
  
  return starsHTML;
}

const createProducts = (products, container) => {
  for (const productId in products) {
    const product = products[productId];
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
    
        <div class="product-image">
          <a href="./product/product.html?shoe=${productId}">
              <img src="${product.images[0]}" alt="${product.name}">
          </a> 
      </div>
      <div class="product-info">
          <a href="./product/product.html?shoe=${productId}">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-price">
                  <span class="current-price">R$${String(product.price.toFixed(2)).replace('.',',')}</span>
                  <span class="original-price">R$${String(product.originalPrice.toFixed(2)).replace('.',',')}</span>
                  <span class="discount">${product.discount}</span>
              </div>
              <div class="installments">${product.installments}</div>
              <div class="product-rating">
                  <div class="stars">
                      ${renderStars(product.rating)}
                  </div>
                  <span class="review-count">(${product.reviewCount})</span>
              </div>
          </a> 
          <div class="product-actions">
              <a href="./product/product.html?shoe=${productId}" class="add-to-cart" data-product='${JSON.stringify(product).replace(/'/g, "\\'")}'>Comprar</a>
          </div>
      </div>
    `;
    
    container.appendChild(productCard);
  }
}


document.addEventListener("DOMContentLoaded", () => {
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

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.slider-dots span');
  dots[0].classList.add('active');

  // Set up touch and mouse events
  slides.forEach((slide, index) => {
    // Touch events
    slide.addEventListener('touchstart', touchStart(index));
    slide.addEventListener('touchend', touchEnd);
    slide.addEventListener('touchmove', touchMove);
    
    // Mouse events
    slide.addEventListener('mousedown', touchStart(index));
    slide.addEventListener('mouseup', touchEnd);
    slide.addEventListener('mouseleave', touchEnd);
    slide.addEventListener('mousemove', touchMove);
  });

  // Prevent image drag (native browser behavior)
  window.oncontextmenu = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Navigation buttons
  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetInterval();
  });
  
  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetInterval();
  });

  // Start autoplay
  startSlider();

  function startSlider() {
    slideInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 21000);
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startSlider();
  }

  function goToSlide(index) {
    // Wrap aound if at ends
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    currentIndex = index;
    updateSlider();
  }

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  // Touch/Mouse handlers
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
    fetch('lancamentos.json')
    .then(response => response.json())
    .then(products => {
        const container = document.querySelector('.products-grid');
        createProducts(products, container)
        
    })
    .catch(error => {
        console.error('Error loading products:', error);
        document.querySelector('.products-grid').innerHTML = 
            '<p class="error-message">Error loading products. Please try again later.</p>';
    });

    fetch('products.json')
    .then(response => response.json())
    .then(products => {
        const container = document.querySelector('.filtered-products-grid');
        createProducts(products, container)
        
    })
    .catch(error => {
        console.error('Error loading products:', error);
        document.querySelector('.products-grid').innerHTML = 
            '<p class="error-message">Error loading products. Please try again later.</p>';
    });
  
  // Add mobile filter toggle functionality
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
  // Mobile search toggle
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