'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle } from 'lucide-react';

interface WorkoutSet {
    tempId: string;
    reps: number;
    weight: number;
}

interface WorkoutCardProps {
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
    onAddSet: (exerciseId: string, reps: number, weight: number) => void;
    onRemoveSet: (exerciseId: string, tempId: string) => void;
    onRemoveWorkout: (exerciseId: string) => void;
}

export function WorkoutCardComponent({
    exerciseId,
    exerciseName,
    sets,
    onAddSet,
    onRemoveSet,
    onRemoveWorkout,
}: WorkoutCardProps) {
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');

    const handleAddSet = () => {
        const repsNum = parseInt(reps, 10);
        const weightNum = parseFloat(weight);
        if (isNaN(repsNum) || repsNum < 0 || isNaN(weightNum) || weightNum < 0) return;
        onAddSet(exerciseId, repsNum, weightNum);
        setReps('');
        setWeight('');
    };

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{exerciseName}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => onRemoveWorkout(exerciseId)}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-2">
                    {sets.length === 0 && <div className="text-muted-foreground text-sm">セットがありません</div>}
                    {sets.map((set) => (
                        <div key={set.tempId} className="flex items-center gap-4 mb-2">
                            <div className="flex-1">{set.reps} 回</div>
                            <div className="flex-1">{set.weight} kg</div>
                            <Button variant="ghost" size="icon" onClick={() => onRemoveSet(exerciseId, set.tempId)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <Input
                        type="number"
                        placeholder="回数"
                        value={reps}
                        onChange={e => setReps(e.target.value)}
                        min="0"
                        step="1"
                        className="flex-1"
                    />
                    <Input
                        type="number"
                        placeholder="重量"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        min="0"
                        step="0.5"
                        className="flex-1"
                    />
                    <Button onClick={handleAddSet} disabled={!reps || !weight}>
                        <PlusCircle className="mr-1 h-4 w-4" /> 行追加
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
