# PropTalk Design System - Quick Reference

## 🎨 Color Palette Quick Reference

### Backgrounds
```
Primary:    #000 (Pure Black)
Secondary:  rgba(10, 15, 25, 0.95) - Dark blue-black
Cards:      from-gray-800/60 to-gray-900/60 (gradient)
Sections:   bg-gray-900/60
```

### Text Colors
```
Primary:    text-white
Secondary:  text-gray-300
Tertiary:   text-gray-400
Subtle:     text-gray-500
```

### Accent Colors
```
Blue:       text-blue-300 / text-blue-400
Green:      text-green-400 (success)
Red:        text-red-400 (error)
Yellow:     text-yellow-400 (warning)
```

### Borders
```
Default:    border-gray-700/50
Hover:      border-gray-600/50
Blue:       rgba(77, 184, 255, 0.2)
```

---

## 🧩 Component Templates

### Card/Tile
```tsx
<div className="rounded-xl p-6 
                bg-gradient-to-br from-gray-800/60 to-gray-900/60 
                border border-gray-700/50 
                transition-all duration-300 ease-out 
                hover:-translate-y-1 
                hover:shadow-2xl hover:shadow-black/30 
                hover:border-gray-600/50 
                hover:bg-gray-800/80 
                backdrop-blur-sm">
  {/* Content */}
</div>
```

### Button (Primary)
```tsx
<button className="px-5 py-2.5 rounded-xl 
                   bg-gray-800/60 border border-gray-700/50 
                   text-gray-300 
                   hover:border-gray-600 hover:text-white hover:bg-gray-800 
                   transition-all duration-200 
                   shadow-lg hover:shadow-xl">
  Button Text
</button>
```

### Button (Filter/Secondary)
```tsx
<button className="px-4 py-2 rounded-lg text-sm font-medium 
                   bg-gray-800/50 border border-gray-700 
                   text-gray-400 
                   hover:border-gray-600 
                   transition-all duration-200">
  Filter
</button>
```

### Status Badge
```tsx
{/* Success/Verified */}
<span className="px-3 py-1.5 rounded-lg text-xs font-semibold
                 text-green-400 bg-green-400/10 border border-green-400/20">
  Verified
</span>

{/* Error/Inactive */}
<span className="px-3 py-1.5 rounded-lg text-xs font-semibold
                 text-red-400 bg-red-400/10 border border-red-400/20">
  Inactive
</span>

{/* Warning/Unverified */}
<span className="px-3 py-1.5 rounded-lg text-xs font-semibold
                 text-yellow-400 bg-yellow-400/10 border border-yellow-400/20">
  Unverified
</span>
```

### Input Field
```tsx
<input className="w-full px-4 py-3 rounded-lg 
                  text-white placeholder-gray-500 
                  bg-gray-800 border border-gray-700 
                  focus:outline-none focus:border-gray-600 
                  transition-colors duration-200" />
```

### Icon Container
```tsx
<div className="p-2 rounded-lg 
                bg-gray-800/60 border border-gray-700/50 
                text-gray-300">
  <Icon size={20} />
</div>
```

---

## ✨ Hover Effects

### Card Hover
```
hover:-translate-y-1          // Move up 4px
hover:scale-[1.01]            // Scale 1% (optional)
hover:shadow-xl              // Larger shadow
hover:shadow-black/30        // Shadow color
hover:border-gray-600/50     // Lighter border
hover:bg-gray-800/80         // More opaque background
```

### Button Hover
```
hover:border-gray-600        // Lighter border
hover:text-white             // White text
hover:bg-gray-800            // Solid background
hover:shadow-xl              // Larger shadow
hover:scale-105              // Scale 5% (optional)
```

---

## 🎭 Effects & Animations

### Transitions
```
duration-200    // Fast (buttons, inputs)
duration-300    // Medium (cards)
duration-500    // Slow (page transitions)
ease-out        // Easing function
```

### Backdrop Blur
```
backdrop-blur-sm    // 4px blur (glassmorphism)
```

### Shadows
```
shadow-lg           // Base shadow
shadow-xl           // Larger shadow
shadow-2xl          // Extra large shadow
shadow-black/30     // Shadow with opacity
```

---

## 📐 Spacing

### Padding
```
p-6        // Cards (24px)
p-6 md:p-8 // Responsive sections
px-5 py-2.5 // Buttons
px-4 py-3  // Inputs
```

### Margins & Gaps
```
mb-8       // Section spacing (32px)
gap-4      // Grid gaps (16px)
gap-2      // Small gaps (8px)
gap-3      // Medium gaps (12px)
```

### Border Radius
```
rounded-lg  // 8px (buttons, inputs, badges)
rounded-xl  // 12px (cards, containers)
```

---

## 🎨 Admin Dashboard Specific

### Dashboard Container
```tsx
<div style={{ background: 'rgba(10, 15, 25, 0.95)' }}
     className="min-h-screen p-6 md:p-8">
```

### Section Container
```tsx
<div className="bg-gray-900/60 border border-gray-800/50 
                rounded-2xl p-6 md:p-8 
                backdrop-blur-sm shadow-xl">
```

### Section Header
```tsx
<div className="flex items-center gap-3 mb-6 pb-4 
                border-b border-gray-800/50">
  <div className="p-2 rounded-lg 
                  bg-gray-800/60 border border-gray-700/50">
    <Icon size={20} className="text-gray-300" />
  </div>
  <h2 className="text-xl font-bold text-white">Title</h2>
</div>
```

---

## 🔵 Blue Accent System

### Gradient
```css
background: linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%);
```

### Glow Effect
```css
box-shadow: 0 4px 20px rgba(59, 158, 255, 0.4);
text-shadow: 0 0 20px rgba(77, 184, 255, 0.3);
```

### Active Navigation Link
```tsx
<Link style={{
  background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
  boxShadow: '0 4px 20px rgba(59, 158, 255, 0.4)',
}}
className="text-white">
  Dashboard
</Link>
```

---

## 📱 Responsive Patterns

### Grid Layouts
```tsx
{/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

{/* Agent Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

### Responsive Text
```tsx
<h1 className="text-3xl md:text-4xl font-bold text-white">
```

### Responsive Padding
```tsx
<div className="p-6 md:p-8">
```

### Responsive Visibility
```tsx
<span className="hidden md:inline">Full Text</span>
<span className="md:hidden">Short</span>
```

---

## 🎯 Common Patterns

### Loading State
```tsx
<div className="animate-spin text-blue-400">
  <RefreshCw size={20} />
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <Icon size={48} className="text-gray-400 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-white mb-2">No Items</h3>
  <p className="text-gray-400">Description</p>
</div>
```

### Page Transition
```tsx
<div className={`transition-all duration-500 ease-out ${
  isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
}`}>
  {children}
</div>
```

---

## 🎨 Color Usage Matrix

| Context | Background | Border | Text | Hover |
|---------|-----------|--------|------|-------|
| **Card** | gray-800/60→900/60 | gray-700/50 | white | gray-600/50 border, gray-800/80 bg |
| **Button** | gray-800/60 | gray-700/50 | gray-300 | gray-600 border, white text |
| **Input** | gray-800 | gray-700 | white | gray-600 border (focus) |
| **Badge ✓** | green-400/10 | green-400/20 | green-400 | - |
| **Badge ✗** | red-400/10 | red-400/20 | red-400 | - |
| **Badge ⚠** | yellow-400/10 | yellow-400/20 | yellow-400 | - |
| **Sidebar Active** | blue gradient | - | white | - |
| **Sidebar Inactive** | transparent | - | blue-300 | blue-950 bg, white text |

---

## 💡 Pro Tips

1. **Always use backdrop-blur-sm** on cards for glassmorphism
2. **Use gradients** (`from-X to-Y`) for depth
3. **Opacity levels** (`/50`, `/60`, `/80`) create layering
4. **Stagger animations** with `transitionDelay` for cascading effects
5. **Consistent hover** - always change border, text, and shadow together
6. **Status colors** - Green (good), Red (bad), Yellow (warning)
7. **Blue accents** - Reserved for navigation and branding
8. **Responsive first** - Always include mobile styles, then enhance

---

**For detailed documentation, see `DESIGN_SYSTEM.md`**

