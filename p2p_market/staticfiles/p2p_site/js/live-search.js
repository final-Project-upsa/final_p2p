document.addEventListener('DOMContentLoaded', function() {
    const desktopSearchInput = document.getElementById('search-query');
    const mobileSearchInput = document.getElementById('mobile-search-query');
    const desktopSuggestionsContainer = document.getElementById('search-suggestions');
    const mobileSuggestionsContainer = document.getElementById('mobile-search-suggestions');

    function setupSearchInput(searchInput, suggestionsContainer) {
        let debounceTimer;

        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = this.value.trim();
                if (query.length > 2) {
                    fetchSearchSuggestions(query, suggestionsContainer);
                } else {
                    clearSuggestions(suggestionsContainer);
                }
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
                clearSuggestions(suggestionsContainer);
            }
        });

        // Allow form submission with Enter key
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitSearch(searchInput.value);
            }
        });
    }

    function fetchSearchSuggestions(query, suggestionsContainer) {
        fetch(`/api/search-suggestions/?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                displaySuggestions(data.suggestions, suggestionsContainer, query);
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                clearSuggestions(suggestionsContainer);
            });
    }

    function displaySuggestions(suggestions, suggestionsContainer, query) {
        suggestionsContainer.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const div = document.createElement('div');
                div.textContent = suggestion;
                div.addEventListener('click', () => {
                    const associatedInput = suggestionsContainer.id === 'mobile-search-suggestions' ? mobileSearchInput : desktopSearchInput;
                    associatedInput.value = suggestion;
                    clearSuggestions(suggestionsContainer);
                    submitSearch(suggestion);
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            clearSuggestions(suggestionsContainer);
        }
    }

    function clearSuggestions(suggestionsContainer) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
    }

    function submitSearch(query) {
        if (query) {
            window.location.href = `/marketplace/?q=${encodeURIComponent(query)}`;
        }
    }

    // Set up desktop search
    if (desktopSearchInput && desktopSuggestionsContainer) {
        setupSearchInput(desktopSearchInput, desktopSuggestionsContainer);
    }

    // Set up mobile search
    if (mobileSearchInput && mobileSuggestionsContainer) {
        setupSearchInput(mobileSearchInput, mobileSuggestionsContainer);
    }

    //  event listener for search buttons
    const searchButtons = document.querySelectorAll('.search-bar button, .mobile-search-box button');
    searchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const associatedInput = button.closest('.search-bar') ? desktopSearchInput : mobileSearchInput;
            submitSearch(associatedInput.value);
        });
    });
});