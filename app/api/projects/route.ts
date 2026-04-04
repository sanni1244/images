import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db('portfolioData'); 
}

export async function GET() {
  try {
    const db = await getDb();
    // Using ai_projects collection
    const projects = await db.collection('ai_projects').find({}).toArray();
    const formattedProjects = projects.map(p => ({ ...p, id: p._id.toString(), _id: undefined }));
    return NextResponse.json(formattedProjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProject = await request.json();
    const db = await getDb();
    const result = await db.collection('ai_projects').insertOne(newProject);
    return NextResponse.json({ message: 'Project saved', project: { ...newProject, id: result.insertedId.toString() } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    const db = await getDb();
    
    await db.collection('ai_projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ message: 'Project updated', project: { id, ...updateData } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const db = await getDb();
    await db.collection('ai_projects').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Project deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}