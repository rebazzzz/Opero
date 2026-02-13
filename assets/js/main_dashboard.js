        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#197fe6",
                        "background-light": "#f6f7f8",
                        "background-dark": "#111921",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    

        // Mobile menu toggle
        document.getElementById('mobile-menu-btn')?.addEventListener('click', function () {
            const sidebar = document.querySelector('aside');
            const overlay = document.getElementById('sidebar-overlay');
            sidebar.classList.toggle('hidden');
            overlay.classList.toggle('hidden');
        });

        // Close sidebar when overlay is clicked
        document.getElementById('sidebar-overlay')?.addEventListener('click', function () {
            const sidebar = document.querySelector('aside');
            sidebar.classList.add('hidden');
            this.classList.add('hidden');
        });
    

