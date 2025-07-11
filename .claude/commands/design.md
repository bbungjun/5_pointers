# Project Design Brief: Wedding Invitation UI Redesign

## 1. Overall Objective

The primary goal is to visually redesign the UI components of this project to create a beautiful, elegant, and romantic wedding invitation experience.

**The most critical instruction is to preserve all existing functionality.** This task is purely about visual and stylistic changes. Do not alter component logic, props, state management, or event handlers.

## 2. Core Design Principles & Keywords

Please base your design decisions on the following themes:

-   **Elegant & Timeless:** Classic, sophisticated, not overly trendy.
-   **Romantic & Soft:** Use soft colors, graceful fonts, and gentle spacing.
-   **Celebratory & Warm:** The design should feel joyful and welcoming.
-   **Minimalist:** Clean and uncluttered. The focus should be on the content.

## 3. Color Palette

Please use a warm and sophisticated color palette. Avoid harsh or overly bright colors.

-   **Primary Background:** A soft, off-white or ivory (e.g., `#FAF9F6` or `#FFFEF5`).
-   **Accent Color:** A muted, soft gold or champagne (e.g., `#BDB5A6` or `#D4AF37` used sparingly). This is for borders, important buttons, and headings.
-   **Primary Text Color:** A dark, warm charcoal instead of pure black (e.g., `#4A4A4A` or `#333333`).
-   **Subtle Accent/Hover:** A dusty rose or sage green for subtle highlights (e.g., `#D8BFD8` or `#B2C2B2`).

## 4. Typography

Fonts are key to achieving the desired feel. Please use web-safe fonts or suggest imports from a service like Google Fonts.

-   **Headings (H1, H2, Couple's Names):** An elegant, readable script or a classic serif font.
    -   *Suggestions:* "Great Vibes", "Playfair Display", "Cormorant Garamond".
-   **Body Text (Paragraphs, Labels, Details):** A clean and highly readable sans-serif or serif font that pairs well with the heading font.
    -   *Suggestions:* "Lato", "Montserrat", "Merriweather".

## 5. Critical Constraints (IMPORTANT)

-   **DO NOT** change any component's props, state, or event handling logic.
-   **DO NOT** alter the business logic or functionality in any way.
-   **DO NOT** add or remove components from the file structure.
-   Your task is to **ONLY** update the styling (CSS, Tailwind CSS classes, Styled-Components, etc.) within the existing component files.

---

## 6. Component-Specific Design Instructions

Here are detailed guidelines for key components. Please apply these principles to all other components as well.

### Main App Container / Layout
-   Use the **Primary Background** color (`#FAF9F6`).
-   Ensure there is ample whitespace and padding around the main content area to give it a spacious feel.

### Header / Navigation Bar
-   Display the couple's names (e.g., "Chloe & Liam") prominently, using the **Heading Font**.
-   Navigation links (e.g., "Our Story", "Gallery", "RSVP") should use the **Body Text Font**.
-   On hover, the navigation links should subtly change color to the **Accent Color** (`#BDB5A6`).
-   A thin, `1px` solid border at the bottom using the **Accent Color**.

### Invitation Card Component
-   This should be the visual centerpiece.
-   It should look like a physical card. Use a gentle `box-shadow` to lift it off the page.
-   Give it a thin (`1px` or `2px`) border using the **Accent Color**.
-   Center the text content. Use the **Heading Font** for names and the **Body Text Font** for the date, time, and venue details.

### Button Component
-   **Primary Button (e.g., "Submit RSVP"):**
    -   Background: **Accent Color** (`#BDB5A6`).
    -   Text: **Primary Background** color (`#FAF9F6`).
    -   Style: Rounded corners (`border-radius: 4px`).
    -   Hover Effect: Slightly lighten the background color.
-   **Secondary Button (e.g., "View Gallery"):**
    -   Background: Transparent or **Primary Background** color.
    -   Text: **Accent Color**.
    -   Border: `1px` solid border in the **Accent Color**.
    -   Hover Effect: The background could fill with a very light, almost transparent version of the accent color.

### Form & Input Fields
-   Labels should use the **Body Text Font**.
-   Input fields should have a light gray border by default.
-   On `:focus`, the border color should change to the **Accent Color**.
-   Use consistent padding inside the input fields for a comfortable typing experience.

### Photo Gallery
-   Arrange photos in a clean grid (CSS Grid or Flexbox).
-   Each photo can have a subtle `box-shadow` or a thin white border to separate them from the background.
-   On hover, slightly scale up the image (`transform: scale(1.03)`) with a smooth `transition`.

### Footer
-   Keep it simple and unobtrusive.
-   Use a smaller version of the **Body Text Font** in the **Primary Text Color**.
-   Content could be a simple message like "With Love, [Couple's Names]" or the wedding date.
-   A thin `1px` top border in the **Accent Color** can separate it from the content above.

Please proceed with the redesign, keeping these guidelines and constraints in mind. Thank you!