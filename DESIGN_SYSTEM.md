# PropTalk Frontend Design System Documentation

## Complete Color Scheme & Styling Guide

### 🎨 **Base Color Palette**

#### **Background Colors**
- **Primary Background**: `#000` (Pure Black)
  - Applied to: `html`, `body` elements
  - Used in: Main page backgrounds
  
- **Secondary Background**: `rgba(10, 15, 25, 0.95)` (Dark Blue-Black with transparency)
  - Applied to: Admin dashboard containers, sidebars, sheets
  - Backdrop blur: `blur(10px)`
  
- **Card Backgrounds**:
  - `rgba(15, 31, 58, 0.9)` - Login containers
  - `from-gray-900/80 to-gray-950/80` - Gradient backgrounds (dark gray)
  - `from-gray-800/60 to-gray-900/60` - Card gradients
  - `bg-gray-900/60` - Section containers
  - `bg-gray-800/60` - Nested elements

#### **Text Colors**
- **Primary Text**: `#fff` (White)
  - Headings, main content
  
- **Secondary Text**: 
  - `text-gray-300` - Secondary headings, icons
  - `text-gray-400` - Descriptions, labels
  - `text-gray-500` - Subtle text, metadata
  - `text-gray-600` - Very subtle text

- **Accent Text**:
  - `text-blue-300` - Links, highlights
  - `text-blue-400` - Active states, icons
  - `text-green-400` - Success states, verified badges
  - `text-red-400` - Error states, inactive badges
  - `text-yellow-400` - Warning states, unverified badges

#### **Border Colors**
- **Primary Borders**: 
  - `border-gray-800/50` - Main container borders
  - `border-gray-700/50` - Card borders
  - `border-gray-600/50` - Hover state borders
  
- **Accent Borders**:
  - `rgba(77, 184, 255, 0.2)` - Blue accent borders (sidebar)
  - `rgba(77, 184, 255, 0.3)` - Blue accent borders (mobile menu)
  - `border-blue-900` - Dark blue dividers
  
- **Status Borders**:
  - `border-green-400/20` - Success/verified states
  - `border-red-400/20` - Error/inactive states
  - `border-yellow-400/20` - Warning/unverified states

---

### 🎯 **Component Styling Patterns**

#### **1. Cards/Tiles**

**StatsCard Component**:
```tsx
className="rounded-xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 
           border border-gray-700/50 transition-all duration-300 ease-out 
           hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 
           hover:border-gray-600/50 hover:bg-gray-800/80 cursor-default 
           backdrop-blur-sm"
```

**AgentCard Component**:
```tsx
className="rounded-xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 
           border-2 border-gray-700/50 transition-all duration-500 ease-out 
           hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl 
           hover:shadow-black/30 hover:border-gray-500 hover:bg-gray-800/80 
           cursor-pointer backdrop-blur-sm group"
```

**Key Card Features**:
- Border radius: `rounded-xl` (12px)
- Gradient backgrounds: `from-gray-800/60 to-gray-900/60`
- Border: `border-gray-700/50` (2px on AgentCard, 1px on StatsCard)
- Backdrop blur: `backdrop-blur-sm`
- Hover effects:
  - Translate up: `hover:-translate-y-1`
  - Scale: `hover:scale-[1.01]` (AgentCard only)
  - Shadow: `hover:shadow-xl hover:shadow-black/30`
  - Border color change: `hover:border-gray-600/50` or `hover:border-gray-500`
  - Background opacity increase: `hover:bg-gray-800/80`
- Transition: `duration-300` or `duration-500` with `ease-out`

#### **2. Buttons**

**Primary Action Buttons**:
```tsx
className="px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 
           text-gray-300 hover:border-gray-600 hover:text-white 
           hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 
           shadow-lg hover:shadow-xl"
```

**Filter/Secondary Buttons**:
```tsx
className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
           bg-gray-800/50 border border-gray-700 text-gray-400 
           hover:border-gray-600"
```

**Active Button State**:
```tsx
className="bg-gray-800 border border-gray-600 text-white"
```

**Button Hover Effects**:
- Border color: `hover:border-gray-600`
- Text color: `hover:text-white`
- Background: `hover:bg-gray-800`
- Shadow: `hover:shadow-xl`
- Scale (on some buttons): `hover:scale-105`
- Transition: `duration-200` or `duration-300`

**Special Button Types**:
- **Logout Button**: `text-red-400 hover:text-white hover:bg-red-950`
- **Close Button**: `p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white`
- **Icon Buttons**: Similar styling with padding adjustments

#### **3. Admin Dashboard Specific Styling**

**Dashboard Container**:
```tsx
style={{ background: 'rgba(10, 15, 25, 0.95)' }}
className="min-h-screen p-6 md:p-8"
```

**Header Section**:
```tsx
className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 
           border border-gray-800/50 rounded-2xl p-6 md:p-8 
           backdrop-blur-sm shadow-xl"
```

**Section Containers**:
```tsx
className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 md:p-8 
           backdrop-blur-sm shadow-xl"
```

**Section Headers**:
```tsx
className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50"
```

**Icon Containers**:
```tsx
className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50"
```

**Platform Health Cards**:
```tsx
className="text-center p-6 rounded-xl bg-gray-800/40 border border-gray-700/30 
           hover:border-gray-600/50 transition-all duration-300 
           hover:bg-gray-800/60"
```

#### **4. Sidebar Styling**

**Sidebar Container**:
```tsx
style={{
  width: '280px',
  background: 'rgba(10, 15, 25, 0.95)',
  borderRight: '1px solid rgba(77, 184, 255, 0.2)',
  backdropFilter: 'blur(10px)',
}}
```

**Logo/Brand Container**:
```tsx
className="p-6 border-b border-blue-900"
```

**Logo Icon Background**:
```tsx
style={{
  background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
  boxShadow: '0 4px 15px rgba(59, 158, 255, 0.4)',
}}
```

**Navigation Links**:
- **Active State**:
  ```tsx
  style={{
    background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
    boxShadow: '0 4px 20px rgba(59, 158, 255, 0.4)',
  }}
  className="text-white"
  ```
  
- **Inactive State**:
  ```tsx
  className="text-blue-300 hover:text-white hover:bg-blue-950"
  ```

**User Info Container**:
```tsx
style={{
  background: 'rgba(59, 158, 255, 0.05)',
  border: '1px solid rgba(77, 184, 255, 0.2)',
}}
```

#### **5. Status Badges**

**Active/Verified Badge**:
```tsx
className="text-green-400 bg-green-400/10 border border-green-400/20"
```

**Inactive/Unverified Badge**:
```tsx
className="text-red-400 bg-red-400/10 border border-red-400/20"
// OR
className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
```

**Badge Styling Pattern**:
- Text color: Status-specific (green/red/yellow-400)
- Background: `bg-[color]-400/10` (10% opacity)
- Border: `border-[color]-400/20` (20% opacity)
- Padding: `px-3 py-1.5`
- Border radius: `rounded-lg`
- Font: `text-xs font-semibold`

#### **6. Input Fields**

**Text Inputs**:
```tsx
className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 
           bg-gray-800 border border-gray-700 focus:outline-none 
           focus:border-gray-600 transition-colors duration-200"
```

**Input Features**:
- Background: `bg-gray-800`
- Border: `border-gray-700` → `focus:border-gray-600`
- Text: `text-white`
- Placeholder: `placeholder-gray-500`
- Border radius: `rounded-lg`
- Transition: `transition-colors duration-200`

#### **7. Sheets/Modals**

**Sheet Container**:
```tsx
style={{
  background: 'rgba(10, 15, 25, 0.95)',
  width: 'calc(100vw - 300px)',
  minWidth: '600px',
  maxWidth: '1600px',
}}
className="fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-800"
```

**Backdrop**:
```tsx
className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
```

**Sheet Header**:
```tsx
className="p-6 border-b border-gray-800"
```

---

### ✨ **Effects & Animations**

#### **Hover Effects**

**Card Hover**:
- Translate: `-translate-y-1` (moves up 4px)
- Scale: `scale-[1.01]` (1% larger)
- Shadow: `shadow-xl shadow-black/30`
- Border: Changes from `gray-700/50` to `gray-600/50` or `gray-500`
- Background: Increases opacity from `/60` to `/80`

**Button Hover**:
- Border: `border-gray-600` (lighter)
- Text: `text-white` (from gray-300/400)
- Background: `bg-gray-800` (from gray-800/60)
- Shadow: `shadow-xl` (from shadow-lg)
- Scale: `scale-105` (on some buttons)

**Link Hover**:
- Text color change: `hover:text-white` (from blue-300)
- Background: `hover:bg-blue-950` (subtle background)

#### **Transitions**

**Standard Transitions**:
- Duration: `duration-200` (buttons, inputs)
- Duration: `duration-300` (cards, general)
- Duration: `duration-500` (page transitions, complex animations)
- Easing: `ease-out` (most common)

**Page Transitions**:
```tsx
className="transition-all duration-500 ease-out 
           opacity-100 translate-y-0" // mounted
// OR
className="opacity-0 translate-y-4" // initial
```

**Staggered Animations**:
- Cards appear with delays: `0ms`, `50ms`, `100ms`, `150ms`, `200ms`, etc.
- Creates cascading effect

#### **Keyframe Animations**

**Fade In**:
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide In from Bottom**:
```css
@keyframes slide-in-from-bottom {
  from {
    transform: translateY(0.5rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Card Pop In**:
```css
@keyframes card-pop-in {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Pulse Animation**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

### 📐 **Spacing & Layout**

#### **Padding**
- Cards: `p-6` (24px)
- Sections: `p-6 md:p-8` (responsive)
- Buttons: `px-5 py-2.5` or `px-4 py-2`
- Inputs: `px-4 py-3` or `pl-10 pr-4 py-3`

#### **Margins**
- Section spacing: `mb-8` (32px)
- Card spacing: `gap-4` (16px) in grids
- Element spacing: `gap-2`, `gap-3`, `gap-4` (8px, 12px, 16px)

#### **Border Radius**
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-xl` (12px) or `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)
- Badges: `rounded-lg` (8px)
- Icons: `rounded-lg` (8px) or `rounded-xl` (12px)

#### **Grid Layouts**
- Stats grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` or `lg:grid-cols-5`
- Agent cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Gap: `gap-4` (16px)

---

### 🎭 **Visual Effects**

#### **Backdrop Blur**
- Applied to: Cards, containers, sidebars
- Value: `backdrop-blur-sm` (4px blur)
- Creates glassmorphism effect

#### **Shadows**
- Card shadows: `shadow-xl shadow-black/30`
- Hover shadows: `hover:shadow-2xl hover:shadow-black/30`
- Button shadows: `shadow-lg hover:shadow-xl`
- Glow effects: `boxShadow: '0 4px 20px rgba(59, 158, 255, 0.4)'` (blue glow)

#### **Gradients**
- Background gradients: `bg-gradient-to-br from-gray-800/60 to-gray-900/60`
- Button gradients: `linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)`
- Direction: `to-br` (to bottom-right)

#### **Opacity Levels**
- `/10` - Very subtle backgrounds (badges)
- `/20` - Subtle borders (status borders)
- `/30` - Light overlays
- `/40` - Medium backgrounds
- `/50` - Borders, dividers
- `/60` - Card backgrounds
- `/80` - Section backgrounds
- `/90` - Container backgrounds
- `/95` - Main backgrounds

---

### 🔵 **Blue Accent Color System**

The sidebar and some elements use a blue accent system:

**Blue Colors**:
- Primary: `#3b9eff` (Bright blue)
- Secondary: `#1e5fb8` (Darker blue)
- Border: `rgba(77, 184, 255, 0.2)` (Light blue with transparency)
- Text: `text-blue-300`, `text-blue-400`

**Blue Gradient**:
```css
linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)
```

**Blue Glow**:
```css
box-shadow: 0 4px 20px rgba(59, 158, 255, 0.4)
text-shadow: 0 0 20px rgba(77, 184, 255, 0.3)
```

---

### 📱 **Responsive Design**

#### **Breakpoints**
- Mobile: Default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large Desktop: `xl:` (1280px+)

#### **Responsive Patterns**
- Padding: `p-6 md:p-8`
- Text sizes: `text-3xl md:text-4xl`
- Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Visibility: `hidden md:inline`

---

### 🎨 **Color Usage Summary**

| Element | Background | Border | Text | Hover Border | Hover Text |
|---------|-----------|--------|------|--------------|------------|
| Cards | gray-800/60 → gray-900/60 | gray-700/50 | white | gray-600/50 | white |
| Buttons | gray-800/60 | gray-700/50 | gray-300 | gray-600 | white |
| Active Buttons | gray-800 | gray-600 | white | - | - |
| Inputs | gray-800 | gray-700 | white | gray-600 (focus) | - |
| Badges (Success) | green-400/10 | green-400/20 | green-400 | - | - |
| Badges (Error) | red-400/10 | red-400/20 | red-400 | - | - |
| Badges (Warning) | yellow-400/10 | yellow-400/20 | yellow-400 | - | - |
| Sidebar Links (Active) | blue gradient | - | white | - | - |
| Sidebar Links (Inactive) | transparent | - | blue-300 | blue-950 bg | white |

---

### 🎯 **Design Principles**

1. **Dark Theme**: Pure black base with dark gray overlays
2. **Glassmorphism**: Backdrop blur effects throughout
3. **Subtle Gradients**: Gray gradients for depth
4. **Smooth Transitions**: 200-500ms transitions for interactions
5. **Hover Feedback**: Clear visual feedback on all interactive elements
6. **Consistent Spacing**: 4px base unit (Tailwind spacing scale)
7. **Status Colors**: Green (success), Red (error), Yellow (warning)
8. **Blue Accents**: Used for navigation and branding
9. **Layered Shadows**: Multiple shadow layers for depth
10. **Responsive First**: Mobile-first approach with progressive enhancement

---

This design system creates a modern, dark-themed admin dashboard with smooth animations, clear visual hierarchy, and consistent styling throughout the application.

