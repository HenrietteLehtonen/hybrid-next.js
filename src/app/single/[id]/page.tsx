/* export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  slug -> id (media_id)
*/

import { fetchMediaById } from "@/models/mediaModel";
import Image from "next/image";

// tyyppi tähän -> ei funkkikseen
type singleProps = {
  params: Promise<{ id: string }>;
};

const Single = async ({ params }: singleProps) => {
  const { id } = await params;
  const mediaItem = await fetchMediaById(Number(id)); // Number tai parseInt

  return (
    <div>
      {mediaItem.media_type.includes("video") ? (
        <video
          src={mediaItem.filename}
          controls
          className="max-h-[80vh] mx-auto object-contain"
        />
      ) : (
        <Image
          src={mediaItem.filename}
          alt={mediaItem.title}
          width={1000}
          height={800}
          className="max-h-[80vh] mx-auto object-contain"
        />
      )}
    </div>
  );
};

export default Single;
