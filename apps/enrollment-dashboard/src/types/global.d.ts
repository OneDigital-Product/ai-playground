export {};

declare global {
  interface Window {
    __toastInstance?: {
      success: (message: string) => void;
      error: (message: string) => void;
      warn?: (message: string) => void;
      info?: (message: string) => void;
    };
  }
}

