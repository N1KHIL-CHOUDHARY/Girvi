import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table"

export default function PawnTableSkeleton() {
  const skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm min-h-[400px]" aria-hidden="true">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200/60 dark:border-white/[0.06] hover:bg-transparent">
            <TableHead className="w-[100px] text-[10px] font-mono uppercase tracking-widest text-zinc-400">Ticket #</TableHead>
            <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Customer</TableHead>
            <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Item</TableHead>
            <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Loan Amount</TableHead>
            <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Status</TableHead>
            <TableHead className="text-right text-[10px] font-mono uppercase tracking-widest text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
          {skeletonRows.map((row) => (
            <TableRow key={row} className="hover:bg-transparent border-none">
              <TableCell className="py-5">
                <div className="h-4 w-16 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse"></div>
              </TableCell>
              <TableCell className="py-5">
                <div className="h-4 w-32 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse"></div>
              </TableCell>
              <TableCell className="py-5">
                <div className="h-4 w-24 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse"></div>
              </TableCell>
              <TableCell className="py-5">
                <div className="h-4 w-20 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse"></div>
              </TableCell>
              <TableCell className="py-5">
                <div className="h-6 w-20 rounded-lg bg-zinc-200 dark:bg-white/5 animate-pulse"></div>
              </TableCell>
              <TableCell className="py-5 text-right">
                <div className="h-9 w-24 rounded-xl bg-zinc-200 dark:bg-white/5 animate-pulse ml-auto"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}