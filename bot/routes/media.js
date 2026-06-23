import { Router } from "express";
import client from "../services/whatsapp.js";
import { cacheMedia } from "../services/media.js";

const router = Router();

router.get("/media/:messageId", async(req,res)=>{

    try{

        const chats=await client.getChats();

        for(const chat of chats){

            const messages=await chat.fetchMessages({
                limit:100
            });

            const message=messages.find(
                m=>m.id.id===req.params.messageId
            );

            if(!message)
                continue;

            const file=
                await cacheMedia(message);

            if(!file){

                return res
                    .status(404)
                    .json({
                        success:false
                    });

            }

            return res.sendFile(file.path);

        }

        res.status(404).json({

            success:false,

            error:"Message not found"

        });

    }catch(err){

        res.status(500).json({

            success:false,

            error:err.message

        });

    }

});

export default router;
