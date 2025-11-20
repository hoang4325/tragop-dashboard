import React from 'react'
import clsx from 'clsx'

export default function Badge({ children, color = 'default' }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100',
    danger: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100',
  }
  return <span className={clsx(base, variants[color])}>{children}</span>
}
