import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Adjust path if needed
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

// Consider creating a singleton Prisma instance in e.g., src/lib/prisma.ts
const prisma = new PrismaClient();

// GET /api/exercises - Fetch exercises for the logged-in user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated and we have the user ID
  if (!session?.user?.id) { // Check for user.id specifically
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const exercises = await prisma.exercise.findMany({
      where: {
        userId: userId, // Filter by the logged-in user's ID
      },
      orderBy: {
        name: 'asc', // Order alphabetically
      },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create a new exercise for the logged-in user
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated and we have the user ID
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Create the exercise linked to the user
    const newExercise = await prisma.exercise.create({
      data: {
        name: trimmedName,
        userId: userId, // Link to the logged-in user
      },
    });

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    // Handle potential unique constraint violation (userId, name)
    if (error.code === 'P2002' && error.meta?.target?.includes('userId') && error.meta?.target?.includes('name')) {
      return NextResponse.json(
        { error: 'You already have an exercise with this name' },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
