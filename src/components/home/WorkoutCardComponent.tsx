'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, Pencil, Check } from 'lucide-react';
import { SwipeableList, SwipeableListItem, Type as SwipeableListType } from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { useTranslations } from 'next-intl';

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
    onEditSet?: (exerciseId: string, tempId: string, reps: number, weight: number) => void;
}

function SetRow({
    set,
    exerciseId,
    onRemoveSet,
    onEditSet,
}: {
    set: WorkoutSet;
    exerciseId: string;
    onRemoveSet: (exerciseId: string, tempId: string) => void;
    onEditSet?: (exerciseId: string, tempId: string, reps: number, weight: number) => void;
}) {
    const t = useTranslations('home');
    const [editing, setEditing] = useState(false);
    const [editReps, setEditReps] = useState(String(set.reps));
    const [editWeight, setEditWeight] = useState(String(set.weight));

    const handleSave = () => {
        const repsNum = parseInt(editReps, 10);
        const weightNum = parseFloat(editWeight);
        if (isNaN(repsNum) || repsNum < 0 || isNaN(weightNum) || weightNum < 0) return;
        onEditSet?.(exerciseId, set.tempId, repsNum, weightNum);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex gap-2 mb-2">
                <Input
                    type="number"
                    value={editReps}
                    onChange={e => setEditReps(e.target.value)}
                    min="0"
                    step="1"
                    className="flex-1"
                    placeholder={t('reps')}
                    size={6}
                />
                <Input
                    type="number"
                    value={editWeight}
                    onChange={e => setEditWeight(e.target.value)}
                    min="0"
                    step="0.5"
                    className="flex-1"
                    placeholder={t('weight')}
                    size={6}
                />
                <Button variant="ghost" size="icon" onClick={handleSave}>
                    <Check className="h-4 w-4 text-green-600" />
                </Button>
            </div>
        );
    }
    return (
        <SwipeableListItem
            {...{
                swipeLeft: {
                    action: () => onRemoveSet(exerciseId, set.tempId),
                    content: (
                        <div className="flex items-center justify-end h-full pr-4 bg-red-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveSet(exerciseId, set.tempId)}
                            >
                                <Trash2 className="h-5 w-5 text-red-500" />
                            </Button>
                        </div>
                    ),
                },
            }}
        >
            <div className="flex items-center gap-4 mb-1 transition-colors w-full">
                <div className="flex-1">{set.reps} {t('reps')}</div>
                <div className="flex-1">{set.weight} {t('weight')} (kg)</div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
        </SwipeableListItem>
    );
}

export function WorkoutCardComponent({
    exerciseId,
    exerciseName,
    sets,
    onAddSet,
    onRemoveSet,
    onRemoveWorkout,
    onEditSet,
}: WorkoutCardProps) {
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const t = useTranslations('home');

    const handleAddSet = () => {
        const repsNum = parseInt(reps, 10);
        const weightNum = parseFloat(weight);
        if (isNaN(repsNum) || repsNum < 0 || isNaN(weightNum) || weightNum < 0) return;
        onAddSet(exerciseId, repsNum, weightNum);
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
                    {sets.length === 0 && <div className="text-muted-foreground text-sm">{t('noSetsInWorkout')}</div>}
                    <SwipeableList threshold={0.25} type={SwipeableListType.IOS}>
                        {sets.map((set) => (
                            <SetRow
                                key={set.tempId}
                                set={set}
                                exerciseId={exerciseId}
                                onRemoveSet={onRemoveSet}
                                onEditSet={onEditSet}
                            />
                        ))}
                    </SwipeableList>
                </div>
                <div className="flex gap-2 mt-2">
                    <Input
                        type="number"
                        placeholder={t('reps')}
                        value={reps}
                        onChange={e => setReps(e.target.value)}
                        min="0"
                        step="1"
                        className="flex-1"
                    />
                    <Input
                        type="number"
                        placeholder={t('weight')}
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        min="0"
                        step="0.5"
                        className="flex-1"
                    />
                </div>
                <Button
                    onClick={handleAddSet}
                    disabled={!reps || !weight}
                    size="sm"
                    className="mt-1 w-full"
                >
                    <PlusCircle className="mr-1 h-4 w-4" /> {t('addRow')}
                </Button>
            </CardContent>
        </Card>
    );
}
