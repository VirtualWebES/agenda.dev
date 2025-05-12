import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { todos, comments, workspaces, workspaceMembers } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

// Validation schemas
const todoCreateSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  dueDate: z.string().nullable().optional(),
  urgency: z.number().int().min(1).max(5).default(1),
  workspaceId: z.string().uuid().nullable().optional(),
});

const todoUpdateSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean(),
});

const commentCreateSchema = z.object({
  todoId: z.string().uuid(),
  text: z.string().min(1).max(1000).trim(),
});

// Helper function to find personal workspace
async function findOrCreatePersonalWorkspace(userId: string) {
  // Find personal workspace
  const personalWorkspace = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .innerJoin(
      workspaceMembers,
      eq(workspaces.id, workspaceMembers.workspaceId)
    )
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaces.name, 'Personal')
      )
    )
    .limit(1);
    
  // If personal workspace exists, return it
  if (personalWorkspace.length > 0) {
    return personalWorkspace[0].id;
  }
  
  // Create a new personal workspace
  const workspaceId = uuidv4();
  const now = new Date();
  
  await db.transaction(async (tx) => {
    // Create the workspace
    await tx.insert(workspaces).values({
      id: workspaceId,
      name: 'Personal',
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Add owner as member
    await tx.insert(workspaceMembers).values({
      workspaceId,
      userId,
      role: 'owner',
    });
  });
  
  return workspaceId;
}

const handlerWithAuth = async (request: Request) => {
  // Get session and validate auth
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return createMcpHandler(async (server) => {
    // Add todo tool
    server.tool(
      "add_todo",
      "Add a new todo with name, date, time, and urgency",
      {
        name: z.string().min(1).max(500),
        date: z.string(),
        time: z.string(),
        urgency: z.number().int().min(1).max(5),
      },
      async ({ name, date, time, urgency }) => {
        try {
          // Combine date and time
          const dueDate = new Date(`${date}T${time}`);
          
          // Get or create personal workspace
          const workspaceId = await findOrCreatePersonalWorkspace(session.user.id);
          
          const todo = await db.insert(todos).values({
            id: uuidv4(),
            title: name,
            userId: session.user.id,
            workspaceId,
            completed: false,
            dueDate: dueDate.toISOString(),
            urgency,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();

          return {
            content: [
              {
                type: "text",
                text: `✅ Todo "${name}" added successfully with due date ${dueDate.toLocaleString()} and urgency ${urgency}`,
              },
            ],
          };
        } catch (error) {
          console.error("Error adding todo:", error);
          throw new Error("Failed to add todo");
        }
      }
    );

    // Complete todo tool
    server.tool(
      "complete_todo",
      "Mark a todo as complete",
      {
        todoId: z.string().uuid(),
      },
      async ({ todoId }) => {
        try {
          const todo = await db.update(todos)
            .set({ 
              completed: true,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(todos.id, todoId),
                eq(todos.userId, session.user.id)
              )
            )
            .returning();

          if (!todo.length) {
            throw new Error("Todo not found or unauthorized");
          }

          return {
            content: [
              {
                type: "text",
                text: `✅ Todo marked as complete`,
              },
            ],
          };
        } catch (error) {
          console.error("Error completing todo:", error);
          throw new Error("Failed to complete todo");
        }
      }
    );

    // Add comment tool
    server.tool(
      "add_comment",
      "Add a comment to a todo",
      {
        todoId: z.string().uuid(),
        text: z.string().min(1).max(1000),
      },
      async ({ todoId, text }) => {
        try {
          // First verify the todo exists and belongs to the user
          const todoExists = await db.query.todos.findFirst({
            where: and(
              eq(todos.id, todoId),
              eq(todos.userId, session.user.id)
            ),
          });

          if (!todoExists) {
            throw new Error("Todo not found or unauthorized");
          }

          const comment = await db.insert(comments).values({
            id: uuidv4(),
            text,
            todoId,
            userId: session.user.id,
            createdAt: new Date(),
          }).returning();

          return {
            content: [
              {
                type: "text",
                text: `💬 Comment added successfully`,
              },
            ],
          };
        } catch (error) {
          console.error("Error adding comment:", error);
          throw new Error("Failed to add comment");
        }
      }
    );
  })(request);
};

export { handlerWithAuth as GET, handlerWithAuth as POST, handlerWithAuth as DELETE };