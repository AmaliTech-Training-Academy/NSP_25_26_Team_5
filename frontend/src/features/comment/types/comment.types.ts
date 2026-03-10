export interface CommentPayload {
  content: string;
}

export interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail?: string | null;
  createdAt: string;
}
