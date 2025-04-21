import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma for TransactionClient type
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod'; // Using Zod for validation
import prisma  from '@/lib/prisma'; 

// Define validation schema for a single set
const setSchema = z.object({
  exerciseId: z.string().cuid(), // Ensure it's a valid CUID
  reps: z.number().int().min(0), // Reps must be a non-negative integer
  weight: z.number().min(0), // Weight must be non-negative
});

// Define validation schema for the workout log request body
const workoutLogSchema = z.object({
  date: z.string().datetime(), // Expect ISO 8601 date string
  sets: z.array(setSchema).min(1), // Must have at least one set
});

// POST /api/workouts - Create a new workout log with sets
export async function POST(request: NextRequest) {
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

    const { date, sets } = validationResult.data;

    // --- Data Integrity Check (Optional but recommended) ---
    // Verify that all exercise IDs belong to the current user
    const exerciseIds = sets.map((set: z.infer<typeof setSchema>) => set.exerciseId); // Add type to set
    const userExercisesCount = await prisma.exercise.count({
        where: {
            id: { in: exerciseIds },
            userId: userId,
        },
    });
    if (userExercisesCount !== exerciseIds.length) {
        return NextResponse.json({ error: 'One or more exercises not found or do not belong to the user' }, { status: 400 });
    }
    // --- End Integrity Check ---


    // Use a transaction to ensure atomicity: create log and all sets together
    const newWorkoutLog = await prisma.$transaction(async (tx: Prisma.TransactionClient) => { // Add type to tx
      // 1. Create the WorkoutLog entry
      const log = await tx.workoutLog.create({
        data: {
          date: new Date(date), // Convert ISO string to Date object
          userId: userId,
        },
      });

      // 2. Create all Set entries linked to the WorkoutLog
      await tx.set.createMany({
        data: sets.map((set: z.infer<typeof setSchema>) => ({ // Add type to set
          reps: set.reps,
          weight: set.weight,
          exerciseId: set.exerciseId,
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
        include: { sets: { include: { exercise: true } } } // Include sets and their exercises
    });


    return NextResponse.json(fullLog, { status: 201 });

  } catch (error: any) {
    console.error('Error creating workout log:', error);
    // Handle specific errors if necessary (e.g., foreign key constraints)
    return NextResponse.json(
      { error: 'Failed to create workout log' },
      { status: 500 }
    );
  }
}

// GET /api/workouts - Fetch workout logs for a specific date
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // Expecting date in 'YYYY-MM-DD' format

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
          lte: endOfDay,   // Less than or equal to end of day
        },
      },
      include: {
        sets: { // Include the sets for each log
          include: {
            exercise: true, // Include the exercise details for each set
          },
          orderBy: {
            createdAt: 'asc', // Order sets by creation time within the log
          }
        },
      },
      orderBy: {
        createdAt: 'desc', // Order logs by creation time (most recent first for the day)
      },
    });

    return NextResponse.json(workoutLogs);

  } catch (error: any) {
    console.error('Error fetching workout logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout logs' },
      { status: 500 }
    );
  }
}
