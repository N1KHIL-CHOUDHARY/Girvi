import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function TableSkeleton() {
  const skeletonRows = [1, 2, 3, 4, 5]; // Create 5 skeleton rows

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Photo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((row) => (
          <TableRow key={row} className="hover:bg-transparent">
            <TableCell>
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-48 rounded bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell className="text-right">
              <div className="h-8 w-20 rounded bg-gray-200 animate-pulse ml-auto"></div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}