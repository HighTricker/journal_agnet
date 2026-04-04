# Design System Specification: Editorial Serenity

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Fluid Sanctuary."** 

Moving beyond the rigid, boxy constraints of traditional enterprise software, this system treats the digital interface as a high-end editorial experience. It prioritizes cognitive ease, mindfulness, and professional authority through the use of expansive white space, intentional asymmetry, and a "depth-first" layering logic. 

We reject the "template" look of modern SaaS. Instead of separating content with lines and borders, we use tonal shifts and sophisticated typographic scales to guide the eye. The interface should feel like a serene, high-end gallery—quiet, premium, and focused.

---

## 2. Colors & Surface Logic
The palette is rooted in deep oceanic tones and atmospheric sky blues, designed to evoke trust without the clinical coldness of standard "tech blue."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. 
*   **Boundaries:** Defined solely through background color shifts.
*   **Execution:** A `surface-container-low` section sitting on a `surface` background provides all the separation a professional user needs. Contrast is achieved through tone, not strokes.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, like stacked sheets of fine, heavy-weight paper or frosted glass. Use the `surface-container` tiers to create "nested" depth:
*   **Base:** `surface` (#f7f9fb) for the primary application background.
*   **Secondary Content Areas:** `surface-container-low` (#f2f4f6).
*   **Interactive Cards/Modules:** `surface-container-lowest` (#ffffff) to provide a "lifted" feel against the background.
*   **Overlays/Modals:** `surface-bright` (#f7f9fb) with high-end glassmorphism.

### The "Glass & Gradient" Rule
To add "soul" to the interface, avoid flat primary blocks. 
*   **CTAs:** Use a subtle linear gradient from `primary` (#00288e) to `primary_container` (#1e40af) at a 135-degree angle.
*   **Floating Elements:** Utilize `backdrop-blur` (12px–20px) with semi-transparent versions of `surface_container_lowest` to allow the oceanic blues to bleed through the UI, softening the experience.

---

## 3. Typography: Editorial Authority
We utilize **Manrope** for its geometric clarity and modern humanist touch. The typographic rhythm is the primary driver of the brand's trustworthy vibe.

*   **Display Scale (`display-lg` to `display-sm`):** Reserved for hero moments and data-heavy dashboards. Use high-contrast sizing to create an editorial feel.
*   **Headline Scale:** Bold and authoritative. These should always utilize the `on_surface` (#191c1e) token to ensure maximum readability and a grounded feel.
*   **Body & Labels:** `body-md` is our workhorse. We prioritize generous line-heights (1.6x) to ensure the "Mindful" vibe is maintained; tight leading is forbidden.
*   **The Hierarchy Rule:** Hierarchy is established by skipping steps in the scale (e.g., placing a `label-md` directly under a `headline-lg`) to create dramatic, intentional negative space.

---

## 4. Elevation & Depth
In this system, depth is felt, not seen. We move away from traditional drop shadows in favor of **Tonal Layering.**

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that mimics natural light on premium paper.

### Ambient Shadows
Where floating elements (like dropdowns or modals) require separation, use "Ambient Shadows":
*   **Color:** Tinted with `on_surface` at 5% opacity.
*   **Blur:** Extra-diffused (20px to 40px).
*   **Offset:** Vertical-only (Y: 4px to 8px) to simulate a top-down light source.

### The "Ghost Border" Fallback
If a border is legally or functionally required for accessibility, use the **Ghost Border**:
*   **Token:** `outline-variant` (#c4c5d5) at **15% opacity**. 
*   **Constraint:** Never use 100% opaque, high-contrast borders.

---

## 5. Components

### Buttons & CTAs
*   **Primary:** Gradient-filled (`primary` to `primary_container`) with `on_primary` text. Roundedness: `md` (0.375rem).
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary:** Text-only with `primary` color. High vertical padding (spacing token `2`) to ensure a large hit-target while maintaining a minimalist aesthetic.

### Cards & Modules
*   **Construction:** Use `surface_container_lowest` (#ffffff) with no border.
*   **Separation:** Use spacing token `8` (2.75rem) to separate internal card elements instead of divider lines. 

### Input Fields
*   **State:** The default state uses `surface_variant` for the background with a "Ghost Border."
*   **Focus State:** A 2px transition to `primary` color, but only on the bottom edge or as a soft glow, never a harsh 4-sided stroke.

### Specialized Component: The "Zen Navigation"
A sidebar or top-nav that uses `surface_container_low` and `backdrop-blur`. Selected items are indicated by a change in text weight and a subtle `surface_tint` indicator, avoiding heavy blocks of color that "clutter" the user's focus.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left while leaving large, expressive gutters on the right (Spacing Scale `16` or `20`).
*   **Use Tonal Shifts:** Distinguish the "Sidebar" from the "Main Content" solely by moving from `surface-container-low` to `surface`.
*   **Prioritize Manrope:** Use the full weight range of Manrope to create hierarchy without changing colors.

### Don’t:
*   **Don't Use Dividers:** Never use a horizontal rule (`<hr>`) to separate list items. Use spacing token `3` or `4` to create breathing room.
*   **Don't Use Pure Black:** All "dark" elements must use `on_surface` (#191c1e), which carries a faint blue undertone to stay within the "Fluid Sanctuary" palette.
*   **Don't Crowd:** If a screen feels "busy," increase the spacing scale values by one tier (e.g., move from `4` to `5`). This system is about breathing.

---

## 7. Token Reference Summary

| Property | Token | Value |
| :--- | :--- | :--- |
| **Primary Base** | `primary` | #00288e |
| **Primary Deep** | `primary_container` | #1e40af |
| **Soft Sky** | `secondary_container` | #d5e4f8 |
| **Neutral Base** | `surface` | #f7f9fb |
| **Inner Card** | `surface_container_lowest` | #ffffff |
| **Text Primary** | `on_surface` | #191c1e |
| **Border Soft** | `outline_variant` | #c4c5d5 (at 15% opacity) |
| **Corner Radius** | `md` | 0.375rem |
| **Standard Gap** | `4` | 1.4rem |