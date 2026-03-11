export interface CommentPayload {
  body: string;
}

export interface Comment {
  id: number;
  body: string;
  authorName: string;
  authorEmail?: string | null;
  createdAt: string;
}
