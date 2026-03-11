const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authStorage = {
  getToken(): string | null {
    return typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  setUser<T>(user: T): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};