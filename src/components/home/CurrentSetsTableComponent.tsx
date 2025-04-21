'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import dayjs from 'dayjs';

// Define the structure for a set being displayed
interface WorkoutSet {
  tempId: string;
  exerciseName: string;
  reps: number;
  weight: number;
}

interface CurrentSetsTableComponentProps {
  currentSets: WorkoutSet[];
  selectedDate: Date | undefined;
  onRemoveSet: (tempId: string) => void;
}

export function CurrentSetsTableComponent({
  currentSets,
  selectedDate,
  onRemoveSet,
}: CurrentSetsTableComponentProps) {
  if (currentSets.length === 0) {
    return null; // Don't render the table if there are no sets
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Current Workout Sets ({selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : 'No Date'})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead className="text-right">Reps</TableHead>
              <TableHead className="text-right">Weight (kg)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSets.map((set) => (
              <TableRow key={set.tempId}>
                <TableCell>{set.exerciseName}</TableCell>
                <TableCell className="text-right">{set.reps}</TableCell>
                <TableCell className="text-right">{set.weight}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onRemoveSet(set.tempId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
