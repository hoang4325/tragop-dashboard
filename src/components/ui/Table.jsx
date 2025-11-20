import React from 'react'
import clsx from 'clsx'

export function Table({ children, className }) {
  return (
    <div className={clsx('overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800', className)}>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return <thead className="bg-slate-50 dark:bg-slate-900/40">{children}</thead>
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">{children}</tbody>
}

export function Th({ children, align = 'left' }) {
  return (
    <th
      scope="col"
      className={clsx(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, align = 'left' }) {
  return (
    <td
      className={clsx(
        'whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-200',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
      )}
    >
      {children}
    </td>
  )
}
