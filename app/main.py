import httpx

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates

app = FastAPI(
    title="WhatsApp Automation Center",
    version="0.1.0"
)

templates = Jinja2Templates(directory="/app/templates")

BOT_API = "http://bot:3001/status"


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
            response = await client.get(BOT_API)

        return JSONResponse(response.json())

    except Exception as e:

        return JSONResponse(
            {
                "connected": False,
                "error": str(e)
            },
            status_code=500
        )