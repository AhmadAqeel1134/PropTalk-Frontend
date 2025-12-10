# Agent & Voice Call UI Documentation

## Overview
This document provides a comprehensive overview of the Agent Portal and Voice Call UI components in the PropTalk frontend.

---

## Layout Structure

### Agent Layout (`app/agent/layout.tsx`)
- **Background**: Dark theme with `rgba(10, 15, 25, 0.95)`
- **Sidebar**: Fixed left sidebar (280px width) via `AgentSidebar` component
- **Main Content**: Offset by `lg:ml-[280px]` to account for sidebar
- **Authentication**: Checks for `agent_token` or `access_token` in localStorage

### Agent Sidebar (`components/layout/AgentSidebar.tsx`)
**Navigation Items:**
1. Dashboard (`/agent/dashboard`)
2. Contacts (`/agent/contacts`)
3. Properties (`/agent/properties`)
4. Documents (`/agent/documents`)
5. Call History (`/agent/calls`)
6. Voice Agent (`/agent/voice-agent`)
7. Profile (`/agent/profile`)

**Features:**
- Mobile responsive with hamburger menu
- Active route highlighting
- Logout functionality

---

## Main Pages

### 1. Dashboard (`app/agent/dashboard/page.tsx`)
**Component**: `AgentDashboard.tsx`

**Sections:**
- **Header**: Title, description, refresh button
- **Account Status**: Verification status, phone number display
- **Quick Actions**: Upload Document, Add Contact, View Contacts, Voice Agent actions
- **Voice Agent Status**: Shows `VoiceAgentStatusCard` or `VoiceAgentRequestCard`
- **Properties Stats**: Total, Available, Unavailable properties
- **Documents & Contacts Stats**: Total documents, contacts, linked contacts

**Key Features:**
- Real-time data updates
- Voice agent request/status integration
- Animated transitions with staggered delays
- Stats cards with icons

---

### 2. Voice Agent Page (`app/agent/voice-agent/page.tsx`)

**Main Components:**
- `VoiceAgentStatusCard`: Active voice agent status
- `VoiceAgentRequestCard`: Pending request status
- `VoiceAgentConfigurationSheet`: Configuration side panel
- `CallHistoryList`: Recent call history
- `CallInitiationModal`: Initiate new calls
- `CallDetailsSheet`: Detailed call information

**Features:**
- Status indicators (Active/Inactive)
- Call statistics (total calls, today's calls, avg duration, success rate)
- Configuration management
- Call initiation interface
- Call history with filters

---

### 3. Call History Page (`app/agent/calls/page.tsx`)
**Component**: `CallsList.tsx`

**Features:**
- **Search**: By contact name or phone number
- **Filters**:
  - Status: All, Initiated, Completed, No Answer
  - Direction: All, Inbound, Outbound
- **Timeline View**: Visual timeline with call cards
- **Call Details**: Click to view detailed call information
- **Pagination**: 20 calls per page

**Call Card Display:**
- Status icons (PhoneIncoming, PhoneOutgoing, PhoneOff, PhoneCall)
- Status badges with color coding:
  - Green: Completed
  - Red: Failed/Busy/No Answer
  - Blue: Initiated/Ringing/In Progress
- Caller/Receiver information
- Duration and timestamp
- Recording playback indicator

---

## Voice Agent Components

### VoiceAgentStatusCard
**Purpose**: Display active voice agent status with real-time indicators

**Displays:**
- Agent name and phone number
- Active/Inactive status with radio indicator
- Statistics:
  - Total Calls (30 days)
  - Today's Calls
  - Average Duration (7 days)
  - Success Rate (7 days)
- Action buttons: Activate/Deactivate, Configure

**Styling:**
- Gradient background: `from-gray-900 via-gray-900 to-gray-800`
- Border: `border-gray-800`
- Hover effects with border color changes

---

### VoiceAgentRequestCard
**Purpose**: Display voice agent request status (pending/approved/rejected)

**States:**
- Pending: Shows request submission date
- Approved: Shows approval date and next steps
- Rejected: Shows rejection reason

---

### VoiceAgentConfigurationSheet
**Purpose**: Advanced configuration panel for voice agent settings

**Tabs:**
1. **Basic Info**:
   - Agent Name
   - System Prompt (Default vs Custom)
   - Greeting Message

2. **Voice Settings**:
   - Voice Gender (Female/Male)
   - Voice Speed (Slow/Normal/Fast)
   - Language selection

3. **Advanced**:
   - Call Recording toggle
   - Custom Commands management

**Features:**
- Form validation
- Live preview
- Save/Cancel actions
- Side sheet UI (slides from right)

---

### CallInitiationModal
**Purpose**: Modal for initiating a single call

**Modes:**
1. **Contact Selection**: Search and select from contacts
2. **Manual Entry**: Enter phone number manually (E.164 format)

**Features:**
- Contact search functionality
- Phone number validation
- Error handling
- Success callbacks

---

## Call Management Components

### CallsList
**Purpose**: Comprehensive call history list with advanced filtering

**Features:**
- Search by contact name or phone
- Status filtering (All, Initiated, Completed, No Answer)
- Direction filtering (All, Inbound, Outbound)
- Timeline visualization
- Call detail sheets
- Pagination

**Call Status Colors:**
- `completed`: Green (`text-green-400 bg-green-500/10 border-green-500/20`)
- `failed/busy/no-answer`: Red (`text-red-400 bg-red-500/10 border-red-500/20`)
- `initiated/ringing/in-progress`: Blue (`text-blue-400 bg-blue-500/10 border-blue-500/20`)

---

### CallHistoryList
**Purpose**: Alternative call history view with grid layout

**Features:**
- Grid layout (1-3 columns responsive)
- Search and filter dropdowns
- Pagination with page numbers
- Empty state handling
- Uses `CallCard` component from Twilio components

---

### CallDetailsSheet
**Purpose**: Side sheet showing detailed call information

**Displays:**
- Call metadata (duration, timestamps, status)
- Recording playback
- Contact information
- Call transcript (if available)

---

## Design Patterns

### Color Scheme
**Dark Theme (Current)**:
- Background: `rgba(10, 15, 25, 0.95)`
- Cards: `bg-gray-900/60` with `border-gray-800/50`
- Text: White primary, gray-400 secondary
- Accents: Blue, Green, Red for status indicators

### Component Styling Patterns
1. **Cards**: 
   - `bg-gradient-to-br from-gray-900/80 to-gray-950/80`
   - `border border-gray-800/50`
   - `rounded-2xl`
   - `backdrop-blur-sm`
   - `shadow-xl`

2. **Buttons**:
   - Primary: `bg-gradient-to-r from-green-600 to-emerald-600`
   - Secondary: `bg-gray-800 border border-gray-700`
   - Hover effects: `hover:scale-105`, `hover:border-gray-600`

3. **Status Badges**:
   - Semi-transparent backgrounds with borders
   - Color-coded by status type
   - Rounded corners

### Animation Patterns
- **Page Transitions**: `PageTransition` wrapper component
- **Staggered Animations**: Delayed transitions for list items
- **Hover Effects**: `hover:-translate-y-1`, `hover:shadow-2xl`
- **Loading States**: `LoadingSpinner` component

---

## Component Hierarchy

```
AgentLayout
├── AgentSidebar
└── Main Content
    ├── Dashboard
    │   ├── AgentDashboard
    │   │   ├── VoiceAgentStatusCard
    │   │   ├── VoiceAgentRequestCard
    │   │   └── VoiceAgentRequestSheet
    ├── Voice Agent
    │   ├── VoiceAgentStatusCard
    │   ├── VoiceAgentConfigurationSheet
    │   ├── CallHistoryList
    │   ├── CallInitiationModal
    │   └── CallDetailsSheet
    ├── Call History
    │   ├── CallsList
    │   └── CallDetailsSheet
    └── Other Pages (Contacts, Properties, Documents, Profile)
```

---

## Key Features Summary

### Voice Agent Features
1. **Status Management**: Activate/Deactivate voice agent
2. **Configuration**: Customize voice, prompts, and behavior
3. **Call Initiation**: Start calls from contacts or manual entry
4. **Statistics**: Track calls, duration, success rates
5. **Request System**: Request voice agent access from admin

### Call Management Features
1. **Call History**: View all calls with filtering
2. **Search**: Find calls by contact or phone number
3. **Status Filtering**: Filter by call status
4. **Direction Filtering**: Filter inbound/outbound calls
5. **Call Details**: View detailed call information
6. **Recording Playback**: Listen to call recordings

### UI/UX Features
1. **Responsive Design**: Mobile and desktop support
2. **Dark Theme**: Consistent dark color scheme
3. **Animations**: Smooth transitions and hover effects
4. **Loading States**: Spinner components for async operations
5. **Error Handling**: Error message components
6. **Empty States**: Helpful messages when no data

---

## API Integration Points

### Voice Agent APIs
- `getVoiceAgentStatus()`: Get request status
- `getVoiceAgent()`: Get active voice agent
- `updateVoiceAgent()`: Update configuration
- `toggleVoiceAgentStatus()`: Activate/Deactivate

### Call APIs
- `getCalls()`: Get call history with filters
- `initiateCall()`: Start a new call
- `getCallStatistics()`: Get call statistics

### Dashboard APIs
- `getAgentDashboard()`: Get dashboard statistics

---

## Notes for Future Development

1. **Light Mode**: Currently only dark theme is implemented
2. **Real-time Updates**: Consider WebSocket integration for live call status
3. **Call Recording**: UI exists but may need backend integration
4. **Analytics**: Statistics display could be enhanced with charts
5. **Batch Operations**: `BatchCallButton` component exists but may need implementation

---

## File Structure

```
app/agent/
├── layout.tsx
├── dashboard/
│   └── page.tsx
├── voice-agent/
│   ├── page.tsx
│   └── request/
│       └── page.tsx
└── calls/
    └── page.tsx

components/agent/
├── AgentDashboard.tsx
├── VoiceAgentStatusCard.tsx
├── VoiceAgentRequestCard.tsx
├── VoiceAgentConfigurationSheet.tsx
├── CallInitiationModal.tsx
├── CallsList.tsx
├── CallHistoryList.tsx
├── CallDetailsSheet.tsx
└── [Other components...]
```

---

*Last Updated: Based on current codebase analysis*

