import { Config } from './config'

export const logRequest = async <T>(
    request: () => Promise<T>,
    requestName: string
  ): Promise<T | null> => {
    if (!Config.LogRequestEnabled) return request();
  
    const startTime = performance.now();
    try {
      const result = await request();
      const endTime = performance.now();
      console.log(`\x1b[32m [API] ${requestName} completed in ${(endTime - startTime).toFixed(2)}ms\x1b[0m`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`\x1b[31m [ERROR API] ${requestName} failed after ${(endTime - startTime).toFixed(2)}ms\x1b[0m`, error);
      return null;
    }
  };