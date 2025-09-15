import { type FastifyInstance } from "fastify";
import type { Tag, Note, Comment } from "./types.js";
import z from "zod";

export const tags: Tag[] = [
  { id: 1, name: "work" },
  { id: 2, name: "personal" },
  { id: 3, name: "urgent" },
];

export const notes: Note[] = [
  {
    id: 1,
    title: "Finish report",
    content: "Complete report by Friday",
    tags: [tags[0]!, tags[2]!],
    createdAt: new Date(),
  },
  {
    id: 2,
    title: "Buy groceries",
    content: "Milk, bread, eggs",
    tags: [tags[1]!],
    createdAt: new Date(),
  },
];

export const comments: Comment[] = [];

export async function appRoute(app: FastifyInstance) {
  app.get("/notes", (req, reply) => {
    return notes;
  });

  app.get("/notes/:id", (req, reply) => {
    const { id } = req.params as { id: string };

    const noteId = Number(id);

    const note = notes.find((n) => n.id === noteId);

    if (!note) {
      return reply.status(404).send({ message: "Note not found" });
    }

    return note;
  });

  app.post("/notes", (req, reply) => {
    const noteBodySchema = z.object({
      title: z.string(),
      content: z.string(),
      tagIds: z.array(z.number()),
    });

    const noteBody = noteBodySchema.parse(req.body);

    const noteTags = tags.filter((t) => noteBody.tagIds.includes(t.id));

    const newNote = {
      id: notes.length + 1,
      title: noteBody.title,
      content: noteBody.content,
      tags: noteTags,
      createdAt: new Date(),
    };

    notes.push(newNote);

    return reply.status(201).send(newNote);
  });

  app.patch("/notes/:id", (req, reply) => {
    const { id } = req.params as { id: string };

    const noteId = Number(id);

    const noteFind = notes.find((n) => n.id === noteId);
    if (!noteFind) {
      return reply.status(404).send({ message: "Note not found" });
    }

    const notePatchSchema = z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      tagIds: z.array(z.number()).optional(),
    });

    const patchBody = notePatchSchema.parse(req.body);

    if (patchBody.title !== undefined) {
      noteFind.title = patchBody.title;
    }
    if (patchBody.content !== undefined) {
      noteFind.content = patchBody.content;
    }
    if (patchBody.tagIds !== undefined) {
      noteFind.tags = tags.filter((t) => patchBody.tagIds!.includes(t.id));
    }

    return reply.send(noteFind);
  });

  app.delete("/notes/:id", (req, reply) => {
    const { id } = req.params as { id: string };

    const noteId = Number(id);

    const index = notes.findIndex((n) => n.id === noteId);

    if (index === -1) {
      return reply.code(404).send({ message: "Note not found" });
    }

    const noteDelete = notes.splice(index, 1);

    return noteDelete;
  });

  app.get("/tags", (req, reply) => {
    return tags;
  });

  app.post("/tags", (req, reply) => {
    const tagBodySchema = z.object({
      name: z.string(),
    });

    const tagBody = tagBodySchema.parse(req.body);

    const tag = {
      id: tags.length + 1,
      name: tagBody.name,
    };

    tags.push(tag);

    return reply.send(tagBody);
  });

  app.post("/notes/:id/comments", (req, reply) => {
    const { id } = req.params as { id: String };

    const noteId = Number(id);

    const findNote = notes.find((n) => n.id === noteId);

    if (!findNote) {
      return reply.status(404).send({ message: "Note not found" });
    }

    const commentBodySchema = z.object({
      text: z.string(),
      author: z.string(),
    });

    const commentBody = commentBodySchema.parse(req.body);

    const newComment = {
      id: comments.length + 1,
      noteId: findNote.id,
      text: commentBody.text,
      author: commentBody.author,
      createdAt: new Date(),
      likes: 0,
    };

    comments.push(newComment);

    return reply.status(201).send(newComment);
  });

  app.get("/notes/:id/comments", (req, reply) => {
    const { id } = req.params as { id: string };

    const noteId = Number(id);

    const findNote = notes.find((n) => n.id === noteId);

    if (!findNote) {
      return reply.send({ message: "No comments" });
    }

    const noteComments = comments.filter((c) => c.noteId === noteId);

    return reply.send(noteComments);
  });

  app.delete("/notes/:noteId/comments/:commentId", (req, reply) => {
    const { noteId } = req.params as { noteId: string };

    const { commentId } = req.params as { commentId: string };

    const noteIdNum = Number(noteId);
    const commentIdNum = Number(commentId);

    const findNote = notes.find((n) => n.id === noteIdNum);
    if (!findNote) {
      return reply.status(404).send({ message: "Note not found" });
    }

    const index = comments.findIndex(
      (c) => c.id === commentIdNum && c.noteId === noteIdNum
    );

    if (index === -1) {
      return reply.status(404).send({ message: "Comment not found" });
    }

    const deletedComment = comments.splice(index, 1);

    return reply.send(deletedComment);
  });

  app.post("/notes/:noteId/comments/:commentId/like", (req, reply) => {
    const { noteId } = req.params as { noteId: string };
    const { commentId } = req.params as { commentId: string };

    const noteIdNum = Number(noteId);
    const commentIdNum = Number(commentId);

    const findNote = notes.find((n) => n.id === noteIdNum);
    if (!findNote) {
      return reply.status(404).send({ message: "Note not found" });
    }

    const findComment = comments.find(
      (c) => c.id === commentIdNum && c.noteId === noteIdNum
    );

    if (!findComment) {
      return reply.send({ message: "Not found" });
    }

    findComment.likes += 1;

    return reply.send(findComment);
  });

  app.post("/notes/:noteId/comments/:commentId/unlike", (req, reply) => {
    const { noteId } = req.params as { noteId: string };
    const { commentId } = req.params as { commentId: string };

    const noteIdNum = Number(noteId);
    const commentIdNum = Number(commentId);

    const findNote = notes.find((n) => n.id === noteIdNum);
    if (!findNote) {
      return reply.status(404).send({ message: "Note not found" });
    }

    const findComment = comments.find(
      (c) => c.id === commentIdNum && c.noteId === noteIdNum
    );

    if (!findComment) {
      return reply.send({ message: "Not found" });
    }

    if (findComment.likes > 0) {
      findComment.likes -= 1;
    }

    return reply.send(findComment);
  });

  app.get("/notes/search", (req, reply) => {
    const { q } = req.query as { q?: string };

    if (!q) {
      return reply
        .status(400)
        .send({ message: "Query parameter q is required" });
    }

    const keyword = q.toLowerCase();

    const results = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(keyword) ||
        n.content.toLowerCase().includes(keyword)
    );

    return reply.send(results);
  });

  app.get("/notes/filter", (req, reply) => {
    const { tags } = req.query as { tags?: string };
    if (!tags) {
      return reply.status(400).send({ message: "Query parameter required" });
    }

    const requestedTags = tags.split(",").map((t) => t.trim().toLowerCase());

    const results = notes.filter((n) =>
      requestedTags.every((tagName) =>
        n.tags.some((t) => t.name.trim().toLowerCase() === tagName)
      )
    );

    console.log(results);
    return reply.send(results);
  });

  app.get("/notes/sort", (req, reply) => {
    const { by, order } = req.query as { by?: string; order?: string };

    if (!by || !["title", "createdAt"].includes(by)) {
      return reply
        .status(400)
        .send({ message: "Query parameter required 'by'" });
    }

    const sortNotes = order === "desc" ? "desc" : "asc";

    const sortedNotes = [...notes].sort((a, b) => {
      if (by === "title") {
        return a.title.localeCompare(b.title);
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

    if (sortNotes === "desc") {
      sortedNotes.reverse();
    }

    return reply.send(sortedNotes);
  });
}
