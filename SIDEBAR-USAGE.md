# Collapsible Sidebar Usage Guide

## Overview
The Aegis application now features a collapsible sidebar that can be hidden or shown to maximize screen space and improve user experience.

## How to Use

### 1. Desktop Toggle Button
- **Location**: Top-left corner of the main content area
- **Icon**: Chevron left/right arrows
- **Function**: Click to collapse/expand the sidebar
- **Tooltip**: Shows current state and keyboard shortcut

### 2. Sidebar Header Toggle
- **Location**: Top-right corner of the sidebar header
- **Icon**: Chevron left/right arrows
- **Function**: Same as desktop toggle button
- **Availability**: Only visible on desktop (lg+ screens)

### 3. Keyboard Shortcut
- **Shortcut**: `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac)
- **Function**: Instantly toggle sidebar state
- **Global**: Works anywhere in the application

## Sidebar States

### Expanded State (Default)
- **Width**: 256px (16rem)
- **Features**: Full navigation labels, section headers, blockchain switcher
- **Content**: Complete sidebar with all information visible

### Collapsed State
- **Width**: 64px (4rem)
- **Features**: Icon-only navigation, compact layout
- **Content**: Navigation icons remain visible, text is hidden

## Responsive Behavior

### Mobile Devices
- **Behavior**: Sidebar is always hidden by default
- **Access**: Use hamburger menu button to show/hide
- **Overlay**: Sidebar appears as overlay with backdrop

### Desktop Devices
- **Behavior**: Sidebar is visible by default
- **Access**: Use toggle buttons or keyboard shortcut
- **Layout**: Sidebar pushes main content to the right

## Persistence
- **Storage**: Sidebar state is saved to localStorage
- **Remember**: Your preference is remembered between sessions
- **Reset**: Refresh page to restore default state

## Benefits

### Space Efficiency
- **More Content**: Maximize screen real estate for main content
- **Clean Interface**: Reduce visual clutter when needed
- **Flexible Layout**: Adapt to different screen sizes and preferences

### User Experience
- **Quick Access**: Keyboard shortcuts for power users
- **Intuitive Controls**: Visual indicators for current state
- **Smooth Transitions**: Animated collapse/expand with CSS transitions

## Technical Details

### State Management
- **React State**: `sidebarCollapsed` boolean
- **Local Storage**: Persistent across browser sessions
- **Event Handling**: Keyboard and click events

### CSS Transitions
- **Duration**: 300ms ease-in-out
- **Properties**: Width, padding, transform
- **Performance**: Hardware-accelerated transforms

### Accessibility
- **ARIA Labels**: Proper button descriptions
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML structure

## Troubleshooting

### Sidebar Won't Toggle
1. Check if you're on desktop (lg+ screen size)
2. Try refreshing the page
3. Check browser console for errors
4. Verify localStorage is enabled

### Keyboard Shortcut Not Working
1. Ensure no other application is capturing Ctrl+B/Cmd+B
2. Check if focus is on an input field
3. Try clicking outside input fields first
4. Verify browser supports keyboard events

### State Not Persisting
1. Check if localStorage is enabled in browser
2. Try clearing browser cache
3. Verify browser supports localStorage
4. Check for browser privacy settings

## Future Enhancements

### Planned Features
- **Custom Widths**: User-defined sidebar widths
- **Multiple Collapse Levels**: Intermediate collapse states
- **Animation Preferences**: Customizable transition speeds
- **Theme Integration**: Dark/light mode support

### User Requests
- **Drag to Resize**: Manual sidebar width adjustment
- **Auto-hide**: Sidebar hides after inactivity
- **Contextual Collapse**: Smart collapse based on content
- **Gesture Support**: Touch/swipe gestures for mobile
