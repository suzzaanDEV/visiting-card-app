import React from 'react';

const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found.',
  className = '',
  rowKey = 'id',
  onRowClick = null,
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-brand-border/60 dark:border-slate-800 bg-brand-surface dark:bg-slate-900 ${className}`}>
      <table className="w-full min-w-[600px] border-collapse text-left text-sm text-brand-text">
        {/* Table Head */}
        <thead className="bg-brand-background dark:bg-slate-800 text-xs font-semibold text-brand-textMuted uppercase tracking-wider border-b border-brand-border dark:border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`px-6 py-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                style={col.style || {}}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-brand-border/40 dark:divide-slate-800/80">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-brand-textMuted">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-brand-textMuted font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[rowKey] || row._id || rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`
                  transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-brand-background dark:hover:bg-slate-850' : 'hover:bg-brand-background/40 dark:hover:bg-slate-800/40'}
                `}
              >
                {columns.map((col, colIdx) => {
                  const val = row[col.dataIndex];
                  return (
                    <td
                      key={col.key || colIdx}
                      className={`px-6 py-4 align-middle whitespace-nowrap text-brand-text dark:text-brand-text/95 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(val, row, rowIdx) : (val !== undefined && val !== null ? String(val) : '-')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
export { Table };
