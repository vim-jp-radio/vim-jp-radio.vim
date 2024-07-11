import type { Entrypoint } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import { assert } from "jsr:@core/unknownutil";
import { isItem, type Item, list, play } from "./podcast.ts";

export const main: Entrypoint = (denops) => {
  denops.dispatcher = {
    list(): Promise<Item[]> {
      return list();
    },

    play(item: unknown): Promise<void> {
      assert(item, isItem);
      return play(item);
    },
  };
};
