# CareerQuest Design Guidelines

## Design Approach

**Reference-Based Approach** drawing inspiration from:
- **SoloLearn**: Gamified learning structure, progress visualization, achievement systems
- **Duolingo**: Playful gamification, level progression, streak mechanics
- **CodeCademy**: Integrated code editor experience, lesson structure
- **Linear**: Modern, clean interface with excellent typography and spatial hierarchy
- **Stripe**: Restrained elegance, purposeful use of space

**Core Principles:**
1. Playful Professionalism: Balance gaming aesthetics with educational credibility
2. Achievement Visibility: Make progress and accomplishments immediately apparent
3. Learning-First Design: Gamification enhances, never overshadows the learning experience
4. Progressive Disclosure: Reveal complexity gradually as users advance

## Typography System

**Font Families:**
- Primary: Inter (Google Fonts) - Interface text, body content, navigation
- Display: Space Grotesk (Google Fonts) - Hero headlines, section titles, achievement announcements
- Code: JetBrains Mono (Google Fonts) - Code editor, inline code snippets

**Type Scale:**
- Hero Display: text-6xl to text-8xl (Space Grotesk, font-bold)
- Section Headers: text-4xl to text-5xl (Space Grotesk, font-semibold)
- Card Titles: text-xl to text-2xl (Inter, font-semibold)
- Body Text: text-base to text-lg (Inter, font-normal)
- UI Labels: text-sm to text-base (Inter, font-medium)
- Code: text-sm (JetBrains Mono, font-normal)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Micro-spacing (icons, badges): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-6, gap-8

**Grid Systems:**
- Dashboard: 12-column grid (grid-cols-12)
- Content areas: 8-column grid (grid-cols-8)
- Leaderboards/Lists: Single column with max-w-4xl
- Landing page features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Component Library

### Landing Page Structure

**Hero Section (80vh):**
- Full-width background with abstract code-themed illustration (geometric patterns, circuit boards, or flowing data visualizations)
- Centered content with max-w-5xl
- Large headline emphasizing "Level Up Your Career"
- Dual CTA buttons: "Start Your Journey" (primary) + "Explore Paths" (secondary)
- Real-time stats ticker: "X Students Leveling Up" with animated counter
- Floating badge previews showing achievement examples

**Feature Showcase (6 sections):**
1. AI-Powered Pathfinding: 2-column split (illustration left, content right)
2. Gamification Overview: Card grid showing XP, badges, levels with icons
3. Code Editor Preview: Full-width interactive mockup with syntax highlighting
4. Career Progression Visualization: Timeline/roadmap showing Junior → Senior paths
5. Leaderboard Teaser: Live preview with anonymized top performers
6. Trust Section: Student testimonials in 3-column card layout

**Footer:**
- 4-column layout: Product, Resources, Community, Company
- Newsletter signup with AI-generated learning tip preview
- Social proof: "Join 10,000+ CS students leveling up their careers"

### Main Application Interface

**Dashboard Layout:**
- **Sidebar (fixed, w-64):** Profile summary with level/XP ring progress, main navigation with icons, daily streak indicator, quick stats
- **Main Content (flex-1):** Top bar with search, notifications bell, user avatar; Content area with max-w-7xl padding
- **Right Panel (w-80, optional):** Leaderboard widget, achievement notifications, daily challenge card

**Progress Visualization:**
- Circular progress rings for level advancement (inspired by Apple Watch)
- Horizontal XP bars with animated fill
- Badge showcase grid with locked/unlocked states using grayscale + overlay
- Level milestone markers with celebration micro-animations on achievement

### Code Editor Interface

**Layout:**
- Split-pane design: Editor (60%) | Output/Console (40%)
- Top toolbar: Language selector dropdown, Run button (prominent), Reset, Settings
- Line numbers in sidebar
- Syntax highlighting zones clearly differentiated
- Resizable divider between panes
- Bottom status bar: Line/column, language, character count

**Editor Features:**
- Monaco Editor integration styling
- Minimal distraction: Hidden line numbers toggle, zen mode option
- Success/error state indicators in gutter
- Console output with expandable sections

### Quiz & Assessment Interface

**Question Display:**
- Card-based layout with max-w-3xl centered
- Progress indicator: "Question 5 of 20" with linear progress bar
- Timer prominent in top-right corner with warning states (yellow <30s, red <10s)
- Question text: text-xl, ample line-height
- Code blocks within questions: rounded-lg, proper syntax highlighting
- Answer options: Large touch targets (min-h-16), radio/checkbox styled cards
- Navigation: "Previous" + "Next" buttons, question palette sidebar

**Security Features:**
- Full-screen mode toggle warning
- Tab switch detection overlay: "Assessment Paused - Return to Complete"
- Subtle background pattern indicating monitored state

### Career Path Selection Interface

**Path Discovery (Registration):**
- Two-card choice layout: "Choose My Path" vs "Let AI Guide Me"
- Each card: icon, title, description, bullet points, CTA button
- Hover state: subtle lift effect (transform translateY(-2px))

**Path Visualization (Level 20):**
- Branching tree diagram showing career progressions
- Interactive nodes: Junior → Mid-Level → Senior → Lead/Architect
- Each node: role title, salary range, key skills, time estimate
- Recommended path highlighted with animated border

**Interest Questionnaire (Level 20):**
- Multi-step wizard: Progress dots at top
- One question per screen with ample whitespace
- Sliding scale, multiple choice, ranking interfaces
- "Why we ask this" tooltips for transparency

### Gamification Elements

**Badges:**
- Grid display: 3-4 columns, equal-height cards
- Badge card: Large icon (w-24 h-24), title, description, unlock criteria
- States: Locked (grayscale + lock icon overlay), Unlocked (full vibrancy), New (pulsing glow effect)
- Rarity tiers: Common, Rare, Epic, Legendary (conveyed through border treatments)

**Leaderboard:**
- Table layout with sticky header
- Columns: Rank (#), Avatar, Name, Level, XP, Badges Count
- Top 3 podium treatment: 1st (larger, centered), 2nd/3rd (flanking)
- Current user row: highlighted background, "You" indicator
- Pagination: Load more for extended lists

### Admin Dashboard

**Layout:**
- Top navigation bar: Logo, section tabs, admin profile
- Sidebar filters: Date range, user segments, career paths
- Main content: Cards for key metrics, data tables, action buttons

**Syllabus Upload Interface:**
- Drag-drop zone: Dashed border, large file icon, "Drop PDF or Click to Upload"
- Upload progress: Linear bar with percentage, file name, cancel option
- AI processing indicator: "Generating questions..." with animated dots
- Success state: Preview of extracted content, question count, assign to paths

**Audit Logs:**
- Searchable/filterable table
- Columns: Timestamp, User, Action, Details, Status
- Expandable rows for detailed JSON view
- Export functionality

## Images

**Hero Image:** Full-width abstract illustration combining circuit boards, code syntax elements, and upward-trending career path visualization. Style: Modern, tech-forward with geometric shapes and flowing lines. Placement: Background of hero section with gradient overlay for text readability.

**Feature Section Images:**
1. AI Pathfinding: Illustration of branching decision tree with glowing nodes
2. Code Editor: Screenshot mockup showing syntax-highlighted code
3. Career Progression: Timeline graphic with milestone markers
4. Gamification: Collage of badge designs and progress visualizations

**Trust Section:** User avatars (placeholder circles with initials) paired with testimonial cards

## Animations (Minimal)

**Micro-interactions Only:**
- Badge unlock: Scale + fade-in (duration-300)
- Level up: Confetti burst at progress ring
- XP gain: Number counter animation
- Button hovers: Slight scale (scale-105)
- Card hovers: Shadow elevation change

**Navigation:** Smooth scrolling, instant tab switches (no page transitions)

## Accessibility

- Minimum touch target: 44x44px for all interactive elements
- Focus states: 2px offset ring on all focusable elements
- Skip navigation link for keyboard users
- ARIA labels for icon-only buttons
- Screen reader announcements for XP gains, level ups
- Keyboard shortcuts: "/" for search, "Esc" to close modals