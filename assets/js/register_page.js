        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#197fe6",
                        "primary-hover": "#166yc9", // A slightly darker shade for hover states
                        "background-light": "#f6f7f8",
                        "background-dark": "#111921",
                        "neutral-surface": "#ffffff",
                        "neutral-border": "#e2e8f0",
                        "text-main": "#1e293b",
                        "text-muted": "#64748b",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                    boxShadow: {
                        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    }
                },
            },
        }
    

