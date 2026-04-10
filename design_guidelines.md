{
  "product": {
    "name": "CodHER",
    "type": "hackathon-management-saas-dashboard",
    "audience": ["hackathon organizers (admin)", "mentors/judges", "student teams"],
    "north_star_actions": [
      "Admin imports teams/mentors reliably (Excel/Sheets) and assigns mentors",
      "Mentor completes multi-round rubric evaluations quickly and consistently",
      "Teams track submissions + status and communicate with mentors",
      "Admin releases results safely (gated) and publishes outcomes"
    ],
    "brand_attributes": [
      "confident",
      "high-signal (data dense but calm)",
      "inclusive + community-forward",
      "competition-grade (auditability, gating, clarity)",
      "premium SaaS (polished, fast, responsive)"
    ]
  },

  "visual_personality": {
    "style_fusion": {
      "layout_principle": "Bento grid + data-table first (Horizon UI / modern admin templates vibe)",
      "surface_style": "Soft glassmorphism for nav + hero only; solid surfaces for reading/table areas",
      "accent_language": "Violet ink + lilac tints + a single warm accent (apricot) for urgency",
      "texture": "Subtle grain/noise overlay on app background and hero header only",
      "avoid": [
        "overly neon cyberpunk",
        "purple gradients on content cards",
        "centered landing-page layouts",
        "heavy shadows everywhere"
      ]
    },
    "density": {
      "default": "comfortable",
      "tables": "compact option via toggle (admin power users)",
      "mobile": "single-column with sticky action bars"
    }
  },

  "typography": {
    "font_pairing": {
      "headings": {
        "family": "Space Grotesk",
        "google_font_url": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
        "usage": "App shell titles, page H1/H2, KPI numbers"
      },
      "body": {
        "family": "Inter",
        "google_font_url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        "usage": "Tables, forms, helper text, chat"
      },
      "mono": {
        "family": "IBM Plex Mono",
        "google_font_url": "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
        "usage": "IDs, tokens, import mapping keys, timestamps"
      }
    },
    "tailwind_text_hierarchy": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "section_title": "text-lg font-semibold tracking-tight",
      "kpi_number": "text-2xl md:text-3xl font-semibold tabular-nums",
      "body": "text-sm md:text-base",
      "small": "text-xs text-muted-foreground"
    },
    "rules": [
      "Use tabular-nums for scores, marks, counts.",
      "Never use all-caps for long labels; reserve for badges only (tracking-wide)."
    ]
  },

  "color_system": {
    "notes": [
      "Purple/violet is allowed and desired for CodHER.",
      "Gradients must be mild and limited to hero/background accents (<=20% viewport).",
      "Tables and reading areas must be solid backgrounds for legibility."
    ],
    "design_tokens_css": {
      "where": "/app/frontend/src/index.css (replace :root and .dark tokens)",
      "light": {
        "--background": "270 33% 99%",
        "--foreground": "255 25% 12%",
        "--card": "0 0% 100%",
        "--card-foreground": "255 25% 12%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "255 25% 12%",

        "--primary": "262 83% 58%",
        "--primary-foreground": "0 0% 100%",

        "--secondary": "260 30% 96%",
        "--secondary-foreground": "255 25% 18%",

        "--muted": "260 22% 96%",
        "--muted-foreground": "255 10% 42%",

        "--accent": "268 55% 94%",
        "--accent-foreground": "255 25% 18%",

        "--destructive": "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",

        "--border": "258 20% 90%",
        "--input": "258 20% 90%",
        "--ring": "262 83% 58%",

        "--chart-1": "262 83% 58%",
        "--chart-2": "198 88% 45%",
        "--chart-3": "152 55% 40%",
        "--chart-4": "32 92% 55%",
        "--chart-5": "286 65% 60%",

        "--radius": "0.75rem"
      },
      "dark": {
        "--background": "255 30% 6%",
        "--foreground": "0 0% 98%",
        "--card": "255 28% 8%",
        "--card-foreground": "0 0% 98%",
        "--popover": "255 28% 8%",
        "--popover-foreground": "0 0% 98%",

        "--primary": "262 90% 72%",
        "--primary-foreground": "255 30% 10%",

        "--secondary": "255 20% 14%",
        "--secondary-foreground": "0 0% 98%",

        "--muted": "255 18% 14%",
        "--muted-foreground": "255 10% 70%",

        "--accent": "262 35% 18%",
        "--accent-foreground": "0 0% 98%",

        "--destructive": "0 62% 35%",
        "--destructive-foreground": "0 0% 98%",

        "--border": "255 18% 16%",
        "--input": "255 18% 16%",
        "--ring": "262 90% 72%",

        "--chart-1": "262 90% 72%",
        "--chart-2": "198 88% 55%",
        "--chart-3": "152 55% 50%",
        "--chart-4": "32 92% 60%",
        "--chart-5": "286 65% 70%",

        "--radius": "0.75rem"
      }
    },
    "semantic_accents": {
      "success": {
        "bg": "hsl(152 55% 40% / 0.12)",
        "fg": "hsl(152 55% 32%)",
        "border": "hsl(152 55% 40% / 0.25)"
      },
      "warning": {
        "bg": "hsl(32 92% 55% / 0.12)",
        "fg": "hsl(32 92% 40%)",
        "border": "hsl(32 92% 55% / 0.25)"
      },
      "info": {
        "bg": "hsl(198 88% 45% / 0.12)",
        "fg": "hsl(198 88% 35%)",
        "border": "hsl(198 88% 45% / 0.25)"
      }
    },
    "allowed_gradients": {
      "hero_only": [
        "radial-gradient(900px circle at 10% 0%, hsl(268 80% 70% / 0.18), transparent 55%)",
        "radial-gradient(700px circle at 90% 10%, hsl(198 88% 55% / 0.10), transparent 50%)"
      ],
      "restriction": "Do not exceed 20% viewport coverage; never behind tables/forms; never on small UI elements."
    },
    "texture": {
      "css_noise_snippet": "background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.035) 1px, transparent 0); background-size: 3px 3px;",
      "usage": "Apply to app background wrapper at 4–6% opacity via pseudo-element; not inside cards."
    }
  },

  "layout_and_grid": {
    "app_shell": {
      "desktop": "Left sidebar (collapsible) + top command bar; content uses max-w-[1400px] but NOT centered text; align content to left with generous padding.",
      "mobile": "Bottom nav for primary sections per role + sheet-based sidebar for secondary links.",
      "page_padding": "px-4 sm:px-6 lg:px-8 py-6",
      "content_grid": "grid gap-4 md:gap-6",
      "bento": "Use 12-col grid on lg: 'lg:grid-cols-12' with KPI cards spanning 3, charts 6-8, tables 12."
    },
    "tables": {
      "pattern": "Sticky table header + sticky first column for names on wide tables; filters in a toolbar above.",
      "toolbar": "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
      "empty_state": "Card with icon + 1 sentence + primary CTA (import/add)."
    },
    "forms": {
      "pattern": "Two-column on md+ for admin settings/import mapping; single column on mobile.",
      "helper_text": "Always show examples under inputs (muted)."
    }
  },

  "components": {
    "component_path": {
      "shadcn_ui": "/app/frontend/src/components/ui",
      "primary_components_to_use": [
        { "name": "button", "path": "/app/frontend/src/components/ui/button.jsx" },
        { "name": "card", "path": "/app/frontend/src/components/ui/card.jsx" },
        { "name": "table", "path": "/app/frontend/src/components/ui/table.jsx" },
        { "name": "tabs", "path": "/app/frontend/src/components/ui/tabs.jsx" },
        { "name": "dialog", "path": "/app/frontend/src/components/ui/dialog.jsx" },
        { "name": "drawer", "path": "/app/frontend/src/components/ui/drawer.jsx" },
        { "name": "sheet", "path": "/app/frontend/src/components/ui/sheet.jsx" },
        { "name": "select", "path": "/app/frontend/src/components/ui/select.jsx" },
        { "name": "command", "path": "/app/frontend/src/components/ui/command.jsx" },
        { "name": "badge", "path": "/app/frontend/src/components/ui/badge.jsx" },
        { "name": "avatar", "path": "/app/frontend/src/components/ui/avatar.jsx" },
        { "name": "tooltip", "path": "/app/frontend/src/components/ui/tooltip.jsx" },
        { "name": "scroll-area", "path": "/app/frontend/src/components/ui/scroll-area.jsx" },
        { "name": "calendar", "path": "/app/frontend/src/components/ui/calendar.jsx" },
        { "name": "sonner", "path": "/app/frontend/src/components/ui/sonner.jsx" }
      ]
    },

    "app_shell_components": {
      "sidebar": {
        "structure": "Use Sheet for mobile + Collapsible sidebar for desktop. Sidebar items grouped by role.",
        "item_style": "h-9 px-3 rounded-md text-sm flex items-center gap-2 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        "active_style": "bg-accent text-foreground font-medium",
        "data_testids": [
          "app-shell-sidebar",
          "app-shell-sidebar-toggle",
          "app-shell-nav-item"
        ]
      },
      "topbar": {
        "structure": "Top command bar with global search (Command), notifications, profile menu.",
        "search": "Command dialog opens with Ctrl/⌘K; includes Teams, Mentors, Rounds, Chats.",
        "data_testids": [
          "app-shell-command-open",
          "app-shell-profile-menu",
          "app-shell-notifications-button"
        ]
      }
    },

    "page_level_patterns": {
      "login": {
        "layout": "Split-screen on lg: left brand panel with mild radial gradient + noise; right auth card. On mobile: stacked.",
        "components": ["card", "tabs", "input", "button", "separator"],
        "microcopy": "Role selection as Tabs (Admin/Mentor/Team) to reduce confusion.",
        "data_testids": [
          "login-role-tabs",
          "login-email-input",
          "login-password-input",
          "login-submit-button"
        ]
      },

      "admin_overview": {
        "layout": "Bento KPI row + deadlines card + import status + recent chats + evaluation progress.",
        "components": ["card", "badge", "progress", "tabs", "table"],
        "kpis": ["Teams", "Mentors", "Rounds", "Evaluations submitted", "Pending reviews"],
        "data_testids": [
          "admin-kpi-teams",
          "admin-kpi-mentors",
          "admin-kpi-evaluations",
          "admin-deadlines-card",
          "admin-recent-chats"
        ]
      },

      "import_wizard": {
        "layout": "Stepper-like flow inside Card: Source -> Preview -> Mapping -> Confirm.",
        "components": ["tabs", "card", "table", "select", "dialog", "progress"],
        "ux": [
          "Always show a preview table with first 20 rows.",
          "Mapping step uses Select per required field (team_name, email, mentor_email, etc.).",
          "Confirm step shows diff summary (new/updated/skipped)."
        ],
        "data_testids": [
          "import-source-tabs",
          "import-excel-upload-input",
          "import-sheets-url-input",
          "import-preview-table",
          "import-confirm-button"
        ]
      },

      "teams_management": {
        "layout": "Toolbar (search, filters, bulk actions) + Table + right-side Drawer for team details.",
        "components": ["table", "input", "select", "drawer", "badge", "avatar"],
        "table_columns": ["Team", "Track", "Round", "Submission", "Mentor", "Eval status", "Actions"],
        "data_testids": [
          "admin-teams-search-input",
          "admin-teams-filter-select",
          "admin-teams-table",
          "admin-team-row-action-menu",
          "admin-team-details-drawer"
        ]
      },

      "mentors_management": {
        "layout": "Cards for mentor capacity + Table; capacity shown as Progress with thresholds.",
        "components": ["card", "progress", "table", "badge", "dialog"],
        "capacity_badges": "Use Badge variants: 'available', 'near-capacity', 'full'.",
        "data_testids": [
          "admin-mentors-table",
          "admin-mentor-capacity-progress",
          "admin-add-mentor-button"
        ]
      },

      "team_mentor_mapping": {
        "layout": "Split view on lg: left teams list, right mentor pool; drag-like reassignment via Select + quick actions.",
        "components": ["resizable", "table", "select", "dialog", "badge"],
        "ux": [
          "Auto-assign button opens Dialog with constraints (capacity, track match).",
          "Manual reassign uses inline Select in table row.",
          "Show conflict warnings inline (warning semantic colors)."
        ],
        "data_testids": [
          "mapping-auto-assign-button",
          "mapping-teams-table",
          "mapping-mentor-select",
          "mapping-save-button"
        ]
      },

      "evaluation_monitoring": {
        "layout": "Round Tabs + summary KPIs + table of evaluations; optional chart.",
        "components": ["tabs", "card", "table", "badge", "tooltip"],
        "chart_library": {
          "recommended": "recharts",
          "install": "npm i recharts",
          "use": "Small line/bar charts for submissions over time and evaluation completion per round. Keep charts minimal and readable."
        },
        "data_testids": [
          "admin-evaluation-round-tabs",
          "admin-evaluation-table",
          "admin-evaluation-export-button"
        ]
      },

      "email_composer": {
        "layout": "Two-pane: left recipients + templates, right editor + preview.",
        "components": ["tabs", "select", "textarea", "dialog", "scroll-area"],
        "ux": [
          "Template variables shown as chips (e.g., {{team_name}}) with copy-to-clipboard.",
          "Preview renders in a Card with email chrome.",
          "Send action requires AlertDialog confirmation."
        ],
        "data_testids": [
          "email-template-select",
          "email-recipients-filter",
          "email-body-textarea",
          "email-preview-card",
          "email-send-button"
        ]
      },

      "chat_monitor": {
        "layout": "Three-column on lg: conversations list, messages, participant details; on mobile: list -> thread.",
        "components": ["tabs", "scroll-area", "avatar", "badge", "textarea", "button"],
        "ux": [
          "Unread badge + last message preview.",
          "Admin can join thread; show 'Admin joined' system message style.",
          "Message composer sticky at bottom with attachment placeholder."
        ],
        "data_testids": [
          "chat-conversation-list",
          "chat-thread",
          "chat-message-input",
          "chat-send-button",
          "chat-join-button"
        ]
      },

      "release_results": {
        "layout": "Round-wise release cards with gating toggles + audit log table.",
        "components": ["card", "switch", "alert-dialog", "table", "badge"],
        "ux": [
          "Switch toggles open AlertDialog explaining impact.",
          "Show 'Released' badge and timestamp.",
          "Teams see status only until released."
        ],
        "data_testids": [
          "release-round-switch",
          "release-confirm-dialog",
          "release-audit-table"
        ]
      },

      "mentor_evaluation": {
        "layout": "Left assigned teams sidebar + main rubric panel with Round Tabs.",
        "components": ["tabs", "card", "slider", "textarea", "badge", "progress"],
        "rubric": {
          "categories": ["Innovation", "Technical Execution", "Impact", "Design/UX", "Pitch/Clarity"],
          "scoring": "0–20 each; show per-category slider with tick marks at 0/5/10/15/20; total auto-sums to /100.",
          "interaction": "When slider changes, animate total count-up (200ms) and show 'Unsaved changes' dot."
        },
        "data_testids": [
          "mentor-assigned-teams-list",
          "mentor-round-tabs",
          "mentor-rubric-slider",
          "mentor-feedback-textarea",
          "mentor-submit-evaluation-button"
        ]
      },

      "team_dashboard": {
        "layout": "Deadline timeline card + submission status per round + mentor card + evaluation status.",
        "components": ["card", "badge", "progress", "tabs"],
        "gating": "Results page shows locked state until admin release; show explanation and next deadline.",
        "data_testids": [
          "team-deadlines-card",
          "team-submission-status",
          "team-mentor-card",
          "team-results-lock-state"
        ]
      }
    }
  },

  "buttons_and_interactions": {
    "button_tokens": {
      "radius": "rounded-xl",
      "primary": "bg-primary text-primary-foreground hover:bg-primary/90",
      "secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      "ghost": "hover:bg-accent hover:text-accent-foreground",
      "focus": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "press": "active:scale-[0.98]",
      "transition": "transition-colors duration-200"
    },
    "micro_interactions": [
      "Sidebar collapse/expand: 180–220ms ease-out width transition (only width/opacity; no transition: all).",
      "Table row hover: background tint + subtle left border accent (primary at 20% opacity).",
      "Dialogs/Drawers: use shadcn motion defaults; add slight blur backdrop.",
      "Chat send: optimistic bubble appears immediately; pending state shows subtle shimmer skeleton.",
      "Import wizard: progress indicator animates between steps; preview table fades in (opacity only)."
    ],
    "motion_library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage": "Use for page transitions (opacity/translateY 6px), KPI count-up, and subtle list reordering. Respect prefers-reduced-motion."
    }
  },

  "data_viz": {
    "charts": {
      "library": "recharts",
      "style": "Minimal axes, muted gridlines, primary line color, tooltip in Card.",
      "empty_state": "Show skeleton chart + 'Waiting for data from imports/evaluations'.",
      "data_testids": ["evaluation-completion-chart", "submissions-over-time-chart"]
    }
  },

  "accessibility": {
    "requirements": [
      "WCAG AA contrast for text on surfaces.",
      "Visible focus rings using --ring token.",
      "Keyboard navigable tables (row actions via dropdown-menu).",
      "Respect prefers-reduced-motion (disable count-up and parallax).",
      "Use aria-labels for icon-only buttons."
    ],
    "testing": {
      "data_testid_rule": "All interactive and key informational elements MUST include data-testid in kebab-case describing role (not appearance).",
      "examples": [
        "data-testid=\"admin-import-confirm-button\"",
        "data-testid=\"mentor-submit-evaluation-button\"",
        "data-testid=\"team-results-lock-state\""
      ]
    }
  },

  "images": {
    "image_urls": [
      {
        "category": "login_brand_panel",
        "description": "Inclusive hackathon/team vibe for the login split-screen brand panel (use with overlay + blur).",
        "url": "https://images.unsplash.com/photo-1581560337214-9106a9c16d7b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGNvZGluZyUyMGhhY2thdGhvbiUyMHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDB8fHxwdXJwbGV8MTc3NTcyOTE0N3ww&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "background_texture",
        "description": "Subtle purple mesh background for hero/header areas only (keep coverage <=20%).",
        "url": "https://images.unsplash.com/photo-1615715410069-21cfbc5401c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGdyYWRpZW50JTIwbWVzaCUyMHB1cnBsZSUyMGJhY2tncm91bmQlMjBzdWJ0bGV8ZW58MHx8fHB1cnBsZXwxNzc1NzI5MTUwfDA&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "mentor_dashboard_header",
        "description": "Clean desk/laptop image for mentor dashboard header card (use as faint background image with 10–14% opacity).",
        "url": "https://images.unsplash.com/photo-1566476927456-446189d7b1ca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxtZW50b3IlMjBjb2FjaGluZyUyMG1lZXRpbmclMjBsYXB0b3B8ZW58MHx8fHB1cnBsZXwxNzc1NzI5MTU0fDA&ixlib=rb-4.1.0&q=85"
      }
    ]
  },

  "instructions_to_main_agent": {
    "global_css_updates": [
      "Replace default CRA App.css centered header styles; do not center the app container.",
      "Update /app/frontend/src/index.css tokens to the provided violet semantic system (light + dark).",
      "Add font imports (Space Grotesk, Inter, IBM Plex Mono) in index.html or via CSS import; set body font to Inter and headings to Space Grotesk via utility classes or base styles.",
      "Add subtle noise overlay on the app background wrapper using a ::before pseudo-element; keep opacity low."
    ],
    "component_usage": [
      "Use shadcn/ui components from /app/frontend/src/components/ui (JS files) for all interactive UI (no raw HTML dropdowns/calendars/toasts).",
      "Use Sonner for toasts (already present).",
      "For tables: build a reusable TableToolbar (search + filters + bulk actions) and TableEmptyState.",
      "For chat: use ScrollArea for message list and keep composer sticky."
    ],
    "role_based_navigation": [
      "Admin: Overview, Import, Teams, Mentors, Mapping, Evaluations, Email, Chat Monitor, Release, Settings.",
      "Mentor: Dashboard, Evaluations, Chat.",
      "Team: Dashboard, Submissions, Chat, Results (locked until release)."
    ],
    "data_testids": [
      "Add data-testid to every button/input/select/tab trigger/table row action and key status text.",
      "Use kebab-case describing function (e.g., 'admin-teams-search-input')."
    ],
    "libraries": [
      {
        "name": "framer-motion",
        "why": "micro-animations for page transitions, KPI count-up, subtle list transitions",
        "install": "npm i framer-motion"
      },
      {
        "name": "recharts",
        "why": "evaluation completion + submissions charts",
        "install": "npm i recharts"
      }
    ]
  },

  "general_ui_ux_design_guidelines": [
    "You must not apply universal transition. Eg: transition: all. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms",
    "You must not center align the app container, ie do not add .App { text-align: center; } in the css file. This disrupts the human natural reading flow of text",
    "NEVER: use AI assistant Emoji characters like🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use FontAwesome cdn or lucid-react library already installed in the package.json",
    "GRADIENT RESTRICTION RULE",
    "NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element. Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc",
    "NEVER use dark gradients for logo, testimonial, footer etc",
    "NEVER let gradients cover more than 20% of the viewport.",
    "NEVER apply gradients to text-heavy content or reading areas.",
    "NEVER use gradients on small UI elements (<100px width).",
    "NEVER stack multiple gradient layers in the same viewport.",
    "ENFORCEMENT RULE:",
    "Id gradient area exceeds 20% of viewport OR affects readability, THEN use solid colors",
    "How and where to use:",
    "Section backgrounds (not content backgrounds)",
    "Hero section header content. Eg: dark to light to dark color",
    "Decorative overlays and accent elements only",
    "Hero section with 2-3 mild color",
    "Gradients creation can be done for any angle say horizontal, vertical or diagonal",
    "For AI chat, voice application, do not use purple color. Use color like light green, ocean blue, peach orange etc",
    "Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead.",
    "Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.",
    "Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.",
    "Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly",
    "Component Reuse:",
    "Prioritize using pre-existing components from src/components/ui when applicable",
    "Create new components that match the style and conventions of existing components when needed",
    "Examine existing components to understand the project's component patterns before creating new ones",
    "IMPORTANT: Do not use HTML based component like dropdown, calendar, toast etc. You MUST always use /app/frontend/src/components/ui/ only as a primary components as these are modern and stylish component",
    "Best Practices:",
    "Use Shadcn/UI as the primary component library for consistency and accessibility",
    "Import path: ./components/[component-name]",
    "Export Conventions:",
    "Components MUST use named exports (export const ComponentName = ...)",
    "Pages MUST use default exports (export default function PageName() {...})",
    "Toasts:",
    "Use sonner for toasts",
    "Sonner component are located in /app/src/components/ui/sonner.tsx",
    "Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
  ]
}
