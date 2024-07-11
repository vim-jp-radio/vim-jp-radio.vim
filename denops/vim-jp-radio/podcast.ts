import Player from "npm:play-sound";
import { parse } from "jsr:@libs/xml";
import { ensure, is } from "jsr:@core/unknownutil";

const player = new Player();
const rssFeed = "https://feeds.megaphone.fm/TFM9640066968";

export type Item = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  enclosure: {
    url: string;
    length: string;
    type: string;
  };
};

export const isItem = is.ObjectOf({
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

const isRss = is.ObjectOf({
  rss: is.ObjectOf({
    channel: is.ObjectOf({
      item: is.ArrayOf(
        is.ObjectOf({
          title: is.String,
          link: is.String,
          description: is.String,
          pubDate: is.String,
          enclosure: is.ObjectOf({
            "@url": is.String,
            "@length": is.String,
            "@type": is.String,
          }),
        }),
      ),
    }),
  }),
});

export async function play(
  item: Item,
  { signal }: { signal?: AbortSignal } = {},
): Promise<void> {
  const data = await fetch(item.enclosure.url);
  const file = await Deno.makeTempFile();
  await using _ = {
    [Symbol.asyncDispose]: async () => {
      await Deno.remove(file);
    },
  };
  await Deno.writeFile(file, new Uint8Array(await data.arrayBuffer()));
  await new Promise<void>((resolve, reject) => {
    const audio = player.play(file, (err: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    signal?.addEventListener("abort", () => {
      audio.kill();
    });
  });
}

export async function list(
  options: { signal?: AbortSignal } = {},
): Promise<Item[]> {
  const resp = await fetch(rssFeed, options);
  const xml = ensure(parse(await resp.text()), isRss);
  return xml.rss.channel.item.map((v) => {
    return {
      title: v.title,
      link: v.link,
      description: v.description,
      pubDate: v.pubDate,
      enclosure: {
        url: v.enclosure["@url"],
        length: v.enclosure["@length"],
        type: v.enclosure["@type"],
      },
    };
  });
}
