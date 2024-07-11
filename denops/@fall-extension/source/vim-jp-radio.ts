import type { GetSource } from "jsr:@lambdalisue/vim-fall@0.6.0/source";
import { ensure, is } from "jsr:@core/unknownutil";

const isItem = is.ObjectOf({
  title: is.String,
  link: is.String,
  description: is.String,
  pubDate: is.String,
  enclosure: is.ObjectOf({
    url: is.String,
    length: is.String,
    type: is.String,
  }),
});

export const getSource: GetSource = (denops) => {
  return {
    async stream() {
      const items = ensure(
        await denops.dispatch("vim-jp-radio", "list", []),
        is.ArrayOf(isItem),
      );
      return ReadableStream.from(items.map((v) => ({
        value: `${v.title} (${v.pubDate})`,
        detail: {
          vimJpRadio: v,
        },
      })));
    },
  };
};
