import type { GetAction } from "jsr:@lambdalisue/vim-fall@0.6.0/action";
import { is } from "jsr:@core/unknownutil";

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

export const getAction: GetAction = (denops) => {
  return {
    description: "Play vim-jp-radio item",

    invoke({ cursorItem }) {
      if (!cursorItem || !isItem(cursorItem.detail.vimJpRadio)) {
        return;
      }
      denops.dispatch(
        "vim-jp-radio",
        "play",
        cursorItem.detail.vimJpRadio,
      );
    },
  };
};
