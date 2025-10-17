import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'kanban' | 'table';
  onViewChange: (view: 'kanban' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
          'hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          currentView === 'kanban'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Grouped by Stage
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
          'hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          currentView === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        All Applications
      </button>
    </div>
  );
};
