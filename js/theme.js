// Dark mode functionality

class ThemeManager {
    constructor() {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            this.theme = savedTheme;
        }
        this.init();
    }


    init() {
        this.applyTheme();
        this.bindEvents();
    }

    applyTheme() {
        const body = document.body;
        const toggleBtn = document.getElementById('theme-toggle');

        if (this.theme === 'dark') {
            body.classList.add('dark-mode');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i data-feather="sun"></i>';
            }
        } else {
            body.classList.remove('dark-mode');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i data-feather="moon"></i>';
            }
        }

        // Re-initialize feather icons if available
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }



    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    bindEvents() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    window.themeManager = themeManager;
});
