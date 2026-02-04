import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function PawnTableSkeleton() {
  const skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-[320px]" aria-hidden="true">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Ticket #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Loan Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((row) => (
          <TableRow key={row} className="hover:bg-transparent">
            <TableCell>
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell className="text-right">
              <div className="h-8 w-20 rounded bg-gray-200 animate-pulse ml-auto"></div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}