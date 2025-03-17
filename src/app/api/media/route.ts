import { getSession, requireAuth } from "@/lib/authActions";
import { fetchData } from "@/lib/functions";
import { postMedia } from "@/models/mediaModel";
import { NextRequest, NextResponse } from "next/server";
import { MediaResponse, UploadResponse } from "hybrid-types";

export async function POST(request: NextRequest) {
  // tarkastaa tokenin
  requireAuth();
  try {
    // get the form data from the request
    const formData = await request.formData();

    // get the token from the cookie
    const token = request.cookies.get("session")?.value;
    if (!token) {
      //   throw new CustomError("Not authorized", 401);
      return new NextResponse("Not authorized!", { status: 401 });
    }

    // send the form data to the uppload server. See apiHooks from previous classes.
    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    const uploadResult = await fetchData<UploadResponse>(
      process.env.UPLOAD_SERVER + "/upload",
      options
    );
    // if the upload response(dataa ei löydy) is not valid, return an error response with NextResponse
    if (!uploadResult.data) {
      return new NextResponse("Error while uploading media!", { status: 500 });
    }
    // get title and description from the form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // get the filename, filesize and media_type  from the upload response
    // const { filename, filesize, media_type } = uploadResult.data;
    // get user_id from getSession() function -> tokencontent
    // TODO: create a media item object, see what postMedia funcion in mediaModel wants for input.

    const tokenContent = await getSession();
    if (!tokenContent) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const media = {
      title,
      description,
      filename: uploadResult.data.filename,
      filesize: uploadResult.data.filesize,
      media_type: uploadResult.data.media_type,
      user_id: tokenContent?.user_id,
    };
    const postResult = await postMedia(media);

    // TODO: use the postMedia function from the mediaModel to add the media to the database. Since we are putting data to the database in the same app, we dont need to use a token.

    if (!postResult) {
      return new NextResponse("Error adding media to database", {
        status: 500,
      });
    }

    const uploadResponse: MediaResponse = {
      message: "Media added to database",
      media: postResult,
    };

    return new NextResponse(JSON.stringify(uploadResponse), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error((error as Error).message, error);
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
