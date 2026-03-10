export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (nextValue: string) => void;
  onSearch?: (query: string) => void;
}
