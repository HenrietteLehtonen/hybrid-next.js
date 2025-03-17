import { fetchAllMedia } from "@/models/mediaModel";
import {
  fetchAllTags,
  fetchMediaByTagName,
  fetchTagsByMediaId,
} from "@/models/tagModel";
import Image from "next/image";
import Link from "next/link";

const MediaList = async () => {
  // haetaan kaikki media
  // const mediaList = await fetchAllMedia();
  // näytä vain omat lisätyt mediat tagin nimellä
  const mediaList = await fetchMediaByTagName("omaAppitagi");

  if (!mediaList) {
    return <p>No media found</p>;
  }

  // haetaan medialist ja tagit
  const mediaListwTags = await Promise.all(
    mediaList.map(async (item) => {
      const tags = await fetchTagsByMediaId(item.media_id);
      return { ...item, tags }; // ...item kaikki jutut
    })
  );

  return (
    <section className="flex flex-col p-8">
      <ul className="grid grid-cols-3 gap-4">
        {mediaListwTags.map((item, index) => (
          <li
            key={index}
            className="flex flex-col items-center border border-gray-300 p-4 shadow-lg rounded-md bg-white"
          >
            <Link href={"/single/" + item.media_id}>
              <h3 className="text-lg font-bold self-start">{item.title}</h3>
              <Image
                src={item.thumbnail}
                alt=""
                width={200}
                height={200}
                className="h-[200px] w-[200px] object-cover"
              />
              <p>Description: {item.description}</p>
              <p>
                Date: {new Date(item.created_at).toLocaleDateString("fi-FI")}
              </p>
              {/* // tags */}
              <p>TAGS: {item.tags.map((tag) => tag.tag_name).join(", ")}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MediaList;
