// types/dotenv.d.ts
declare module 'dotenv' {
  const content: {
    config: () => {
      parsed?: Record<string, string>;
      error?: Error;
    };
  };
  export = content;
}
