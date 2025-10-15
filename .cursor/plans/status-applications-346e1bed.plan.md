<!-- 346e1bed-16fe-4235-99eb-dc34deb7c4b8 08f781ac-c920-4942-873a-b0c728a72254 -->
# Status Applications Table View Implementation

## Overview

Create a standalone page that displays all applications for a specific status in an Excel-like table format with inline editing capabilities, sorting, and filtering.

## Implementation Steps

### 1. Create API Function for getApplicationByStatus

**File**: `src/lib/api.ts`

Add new function to fetch applications by status:

```typescript
getApplicationsByStatus: async (status: JobStatus): Promise<JobApplication[]> => {
  const response = await fetch(`${API_BASE_URL}/applications/status/${status}`);
  if (!response.ok) throw new Error('Failed to fetch applications by status');
  const result = await response.json();
  return result.map(transformFromBackend);
}
```

### 2. Create New Page Component

**File**: `src/pages/StatusApplicationsPage.tsx` (new file)

Create a standalone page component that:

- Uses `useParams()` to get status from URL (`/status/:status`)
- Fetches applications using `getApplicationsByStatus` API
- Displays data in a table with columns: Status Badge, Company, Position, Link, Application Date, Tailored (checkbox), Referral (checkbox), Actions
- Implements sorting (click column headers)
- Implements filtering (search bar for company/position)
- Includes back button to return to kanban board
- Status column: displays status as colored rounded badge matching kanban colors
- Status is inline-editable: clicking opens dropdown with other statuses (uses PATCH API)
- Each row has Edit/Delete action buttons at the end

### 3. Add Route to App

**File**: `src/App.tsx`

Add new route:

```typescript
<Route path="/status/:status" element={<StatusApplicationsPage />} />
```

### 4. Update KanbanColumn Header to be Clickable

**File**: `src/components/KanbanColumn.tsx`

Make the header area (lines 38-45) clickable to navigate to the status page:

- Add `onClick` handler to header div (except the badge)
- Use `useNavigate()` to navigate to `/status/${status}`
- Add cursor-pointer and hover effects to indicate clickability

### 5. Create Inline Status Dropdown Component

**File**: `src/components/InlineStatusSelect.tsx` (new file)

Create a component that:

- Displays current status as a colored badge
- On click, shows dropdown with all other status options
- Uses PATCH API to update status when changed
- Handles loading/error states

## Key Technical Details

### Table Features

- **Sorting**: Click column headers to sort (company name, date, etc.)
- **Filtering**: Search input to filter by company name or position
- **Inline Editing**: Status column editable via dropdown
- **Actions**: Edit (opens EditJobModal) and Delete buttons per row
- **Responsive**: Table scrolls horizontally on mobile

### Status Badge Colors

Reuse existing color configuration from `KanbanColumn.tsx`:

```typescript
STATUS_CONFIG: {
  APPLIED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-gray-100 text-gray-800',
  ONLINE_ASSESSMENT: 'bg-purple-100 text-purple-800',
  INTERVIEW: 'bg-yellow-100 text-yellow-800',
  OFFER: 'bg-green-100 text-green-800'
}
```

### PATCH API Integration

Use existing `patchApplication` from `src/lib/api.ts` for status updates and row edits.

## Files to Create/Modify

**New Files**:

- `src/pages/StatusApplicationsPage.tsx` - Main table view page
- `src/components/InlineStatusSelect.tsx` - Inline status dropdown editor

**Modified Files**:

- `src/lib/api.ts` - Add getApplicationsByStatus function
- `src/App.tsx` - Add route for status page
- `src/components/KanbanColumn.tsx` - Make header clickable

## Future Enhancements (Not Implemented Now)

- Bulk selection with checkboxes
- Bulk actions (delete multiple, change status for multiple)
- Export to CSV/Excel functionality

### To-dos

- [ ] Add getApplicationsByStatus API function
- [ ] Create StatusApplicationsPage component with table layout
- [ ] Implement table sorting and filtering functionality
- [ ] Create InlineStatusSelect component for inline status editing
- [ ] Add route to App.tsx for status page
- [ ] Update KanbanColumn header to navigate to status page