export {};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, handler: (response: { error?: { description?: string }; [key: string]: unknown }) => void): void;
    };
  }
}
