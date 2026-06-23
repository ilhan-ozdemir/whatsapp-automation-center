import json
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates

app = FastAPI(
    title="WhatsApp Automation Center",
    version="0.1.0"
)

templates = Jinja2Templates(directory="/app/templates")

STATUS_FILE = Path("/storage/status.json")


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


@app.get("/api/status")
async def api_status():

    if not STATUS_FILE.exists():
        return JSONResponse(
            {
                "connected": False,
                "message": "Status file not found"
            }
        )

    try:

        with STATUS_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)

        return JSONResponse(data)

    except Exception as e:

        return JSONResponse(
            {
                "connected": False,
                "error": str(e)
            },
            status_code=500
        )
