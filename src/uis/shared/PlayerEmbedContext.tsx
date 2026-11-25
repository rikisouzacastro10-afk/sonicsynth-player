import { createContext, useContext } from 'react';

export const PlayerEmbedContext = createContext(false);

export function useIsEmbeddedPlayer(): boolean {
  return useContext(PlayerEmbedContext);
}
