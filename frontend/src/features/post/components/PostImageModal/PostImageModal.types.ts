export interface PostImageModalProps {
  authorName: string;
  description: string;
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}
