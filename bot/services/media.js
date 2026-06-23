import fs from "fs";
import path from "path";

const ROOT = "/storage/uploads";

function extensionFromMime(mime){

    if(!mime)
        return "bin";

    const map={

        "image/jpeg":"jpg",
        "image/png":"png",
        "image/webp":"webp",

        "video/mp4":"mp4",

        "audio/ogg":"ogg",
        "audio/mpeg":"mp3",

        "application/pdf":"pdf",

        "application/zip":"zip"

    };

    return map[mime] || mime.split("/").pop();

}

function folderFromMime(mime){

    if(!mime)
        return "documents";

    if(mime.startsWith("image/"))
        return "images";

    if(mime.startsWith("video/"))
        return "videos";

    if(mime.startsWith("audio/"))
        return "audio";

    if(mime.includes("sticker"))
        return "stickers";

    return "documents";

}

export async function cacheMedia(message){

    if(!message.hasMedia)
        return null;

    const media=await message.downloadMedia();

    if(!media)
        return null;

    const ext=
        extensionFromMime(media.mimetype);

    const folder=
        folderFromMime(media.mimetype);

    const dir=
        path.join(ROOT,folder);

    fs.mkdirSync(dir,{
        recursive:true
    });

    const filename=
        `${message.id.id}.${ext}`;

    const fullpath=
        path.join(dir,filename);

    if(!fs.existsSync(fullpath)){

        fs.writeFileSync(

            fullpath,

            Buffer.from(
                media.data,
                "base64"
            )

        );

    }

    return{

        filename,

        path:fullpath,

        mime:media.mimetype,

        folder

    };

}
