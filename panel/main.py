import httpx

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(
    title="WhatsApp Automation Center",
    version="0.1.0"
)

app.mount(
    "/static",
    StaticFiles(directory="/app/static"),
    name="static"
)

templates = Jinja2Templates(directory="/app/templates")

BOT_API = "http://bot:3001"


@app.get("/")
async def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


@app.get("/api/status")
async def api_status():

    try:

        async with httpx.AsyncClient(timeout=5.0) as client:

            response = await client.get(
                f"{BOT_API}/status"
            )

        return JSONResponse(response.json())

    except Exception as e:

        return JSONResponse(
            {
                "connected": False,
                "error": str(e)
            },
            status_code=500
        )


@app.get("/api/chats")
async def api_chats():

    try:

        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.get(
                f"{BOT_API}/chats"
            )

        return JSONResponse(response.json())

    except Exception as e:

        return JSONResponse(
            {
                "success": False,
                "error": str(e)
            },
            status_code=500
        )


@app.get("/api/messages/{chat_id:path}")
async def api_messages(chat_id: str):

    try:

        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.get(
                f"{BOT_API}/messages/{chat_id}"
            )

        return JSONResponse(response.json())

    except Exception as e:

        return JSONResponse(
            {
                "success": False,
                "error": str(e)
            },
            status_code=500
        )


@app.post("/api/send-message")
async def api_send_message(request: Request):

    try:

        data = await request.json()

        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.post(
                f"{BOT_API}/send-message",
                json=data
            )

        return JSONResponse(response.json())

    except Exception as e:

        return JSONResponse(
            {
                "success": False,
                "error": str(e)
            },
            status_code=500
        )


@app.post("/api/send-file")
async def api_send_file(request: Request):

    try:

        data = await request.json()

        async with httpx.AsyncClient(timeout=60.0) as client:

            response = await client.post(
                f"{BOT_API}/send-file",
                json=data
            )

        return JSONResponse(response.json())

    except Exception as e:

        return JSONResponse(
            {
                "success": False,
                "error": str(e)
            },
            status_code=500
        )
