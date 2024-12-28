document.addEventListener('DOMContentLoaded', function() {
    // Sidebar adjustment
    const sidebar = document.querySelector('.sidebar');
    const footer = document.querySelector('.footer');

    function adjustSidebar() {
        const sidebarHeight = sidebar.offsetHeight;
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (footerTop - windowHeight < 0) {
            const difference = windowHeight - footerTop;
            sidebar.style.top = `${20 - difference}px`; 
        } else {
            sidebar.style.top = '20px';
        }
    }

    window.addEventListener('scroll', adjustSidebar);
    window.addEventListener('resize', adjustSidebar);

    // Cart item count
    let cartItemCount = 0;
    const cartItemCountElements = document.querySelectorAll('.cartItemCount');

    function updateCartItemCount(count) {
        cartItemCount = count;
        cartItemCountElements.forEach(element => {
            element.textContent = cartItemCount;
        });
    }

    // User favorites
    let userFavourites = [];

    // Function to load user favourites
    function loadUserFavourites() {
        fetch('/api/get_user_favourites')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userFavourites = data.favourites;
                    updateFavouriteIcons();
                    updateCartItemCount(userFavourites.length);
                }
            })
            .catch(error => console.error('Error loading favourites:', error));
    }

    // Function to update favourite icons
    function updateFavouriteIcons() {
        document.querySelectorAll('.heart-btn').forEach(button => {
            const productId = parseInt(button.dataset.productId);
            if (userFavourites.includes(productId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Heart button functionality
    document.querySelectorAll('.heart-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(this.dataset.productId);
            const isFavourite = !userFavourites.includes(productId);
            
            saveFavouriteStatus(productId, isFavourite);
        });
    });

    // Buy now button functionality
    document.querySelectorAll('.buy-now-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const sellerId = this.dataset.sellerId;
            const productId = this.dataset.productId;
            window.location.href = `/create_chat/${sellerId}/${productId}/`;
        });
    });

    // Function to show popup
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.textContent = message;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.style.display = 'block';
        }, 100);
    
        setTimeout(() => {
            popup.style.display = 'none';
            setTimeout(() => {
                popup.remove();
            }, 500);
        }, 2000);
    }

    // Function to save favourite status
    function saveFavouriteStatus(productId, isFavourite) {
        fetch('/api/save_favourite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                productId: productId,
                isFavourite: isFavourite
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showPopup(data.message);
                updateCartItemCount(data.newCount);
                if (isFavourite) {
                    userFavourites.push(productId);
                } else {
                    userFavourites = userFavourites.filter(id => id !== productId);
                }
                updateFavouriteIcons();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showPopup('Failed to update favourite status');
        });
    }

    // Function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Load user favourites when the page loads
    loadUserFavourites();
});