import { useState } from "react";

/**
 * Use Buffered State gives buffer functionality to the state.
 * Adding elements more than the buffered state length will add 
 * to the first of the state and old values will be deleted from state.
 * 
 * ##### NOTE
 * - https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
 * There is use of callback function in setState so that current state can be accessed inside event listner instead of 
 * Previous state
 */
const useBufferedState = (len: number): [string[], (str: string) => void] => {
  const [buffer, setBuffer] = useState<string[]>([]);

  const push = (str: string) => {
    setBuffer((currentBuffer) => {
      if (len === currentBuffer.length) {
        return [str, ...currentBuffer.slice(0, buffer.length - 1)];
      } else {
        return [str, ...currentBuffer];
      }
    });
  };

  return [buffer, push];
};

export { useBufferedState };
