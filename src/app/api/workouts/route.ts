import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client'; // Import Prisma for TransactionClient type
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { setSchema, workoutLogSchema } from '@/lib/schemas/workout-schemas';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// POST /api/workouts - Create a new workout log with sets
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = workoutLogSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { exerciseId, date, sets } = validationResult.data;

    // --- Data Integrity Check (Optional but recommended) ---
    // Verify that the exerciseId belongs to the current user
    const userExercise = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        userId: userId,
      },
    });
    if (!userExercise) {
      return NextResponse.json(
        { error: 'Exercise not found or does not belong to the user' },
        { status: 400 }
      );
    }
    // --- End Integrity Check ---

    // Use a transaction to ensure atomicity: create log and all sets together
    const newWorkoutLog = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Add type to tx
      // 1. Create the WorkoutLog entry
      const log = await tx.workoutLog.create({
        data: {
          date: new Date(date), // Convert ISO string to Date object
          userId: userId,
          exerciseId: exerciseId,
        },
      });

      // 2. Create all Set entries linked to the WorkoutLog
      await tx.set.createMany({
        data: sets.map((set: z.infer<typeof setSchema>) => ({
          reps: set.reps,
          weight: set.weight,
          workoutLogId: log.id, // Link to the created log
        })),
      });

      // Return the created log (sets are implicitly included via the transaction)
      // Optionally, fetch the log with sets included if needed for the response
      return log;
    });

    // Optionally fetch the full log with sets to return
    const fullLog = await prisma.workoutLog.findUnique({
      where: { id: newWorkoutLog.id },
      include: { sets: true }, // No exercise relation in Set anymore
    });

    return NextResponse.json(fullLog, { status: 201 });
  } catch (error) {
    console.error('Error creating workout log:', error);
    // Handle specific errors if necessary (e.g., foreign key constraints)
    return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 });
  }
}

// GET /api/workouts - Fetch workout logs for a specific date
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  if (!dateParam) {
    return NextResponse.json({ error: 'Date query parameter is required' }, { status: 400 });
  }

  // Validate date format (simple check, consider more robust validation)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }

  try {
    // Parse the date and calculate the start and end of the day
    const targetDate = new Date(dateParam + 'T00:00:00Z'); // Assume UTC or handle timezone appropriately
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: userId,
        date: {
          gte: startOfDay, // Greater than or equal to start of day
          lte: endOfDay, // Less than or equal to end of day
        },
      },
      include: {
        sets: {
          orderBy: {
            createdAt: 'asc', // Order sets by creation time within the log
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Order logs by creation time (most recent first for the day)
      },
    });

    return NextResponse.json(workoutLogs);
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 });
  }
}
