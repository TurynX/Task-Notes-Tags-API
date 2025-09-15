export type Tag = {
  id: number;
  name: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  tags: Tag[];
  createdAt: Date;
};

export type Comment = {
  id: number;
  noteId: number;
  text: string;
  author: string;
  createdAt: Date;
  likes: number;
};
