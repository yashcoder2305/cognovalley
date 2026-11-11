"""
BinBuzz garbage detection service.

Local FastAPI wrapper around the YOLOv8 model trained in E:\\Project\\garbage-detector.

Run from the cognovalley folder with the project venv:
    ..\\..\\..\\venv\\Scripts\\python.exe server\\inference_service.py

or simply:
    npm run scan:server
"""

from __future__ import annotations

import base64
import io
import os
import threading
import time
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from PIL import Image, ImageOps
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parent
REPO_ROOT = PROJECT_DIR.parent.parent  # E:\Project\garbage-detector


def _find_model_path() -> Path:
    env_path = os.environ.get("GARBAGE_MODEL_PATH")
    if env_path:
        candidate = Path(env_path).expanduser().resolve()
        if candidate.exists():
            return candidate
        raise FileNotFoundError(f"GARBAGE_MODEL_PATH does not exist: {candidate}")

    # Prefer the most recently trained best.pt
    best_weights = sorted(
        REPO_ROOT.glob("runs/detect/*/weights/best.pt"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    if best_weights:
        return best_weights[0]

    fallback = REPO_ROOT / "yolov8n.pt"
    if fallback.exists():
        return fallback

    raise FileNotFoundError(
        "No YOLO weights found. Expected runs/detect/*/weights/best.pt or yolov8n.pt "
        f"under {REPO_ROOT}"
    )


MODEL_PATH = _find_model_path()
_model: Any = None
_model_lock = threading.Lock()


def get_model() -> Any:
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                from ultralytics import YOLO

                _model = YOLO(str(MODEL_PATH))
    return _model


class ScanRequest(BaseModel):
    imageBase64: str = Field(..., description="Raw base64 or data URL of the image")
    conf: float = Field(0.25, ge=0.01, le=0.99)
    iou: float = Field(0.45, ge=0.01, le=0.99)
    filename: str | None = None


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Detection(BaseModel):
    id: str
    label: str
    className: str
    confidence: float
    coordinates: BoundingBox
    pixelBox: list[float]


class ScanResponse(BaseModel):
    success: bool
    model: str
    classes: list[str]
    inferenceMs: int
    image: dict[str, int]
    detections: list[Detection]


app = FastAPI(title="BinBuzz Garbage Scanner", version="1.0.0")


def _decode_image(raw: str) -> Image.Image:
    payload = raw.split(",", 1)[1] if raw.startswith("data:") else raw
    try:
        data = base64.b64decode(payload, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid base64 image payload") from exc

    try:
        image = Image.open(io.BytesIO(data))
        image = ImageOps.exif_transpose(image)
        return image.convert("RGB")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file") from exc


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model": str(MODEL_PATH),
        "loaded": _model is not None,
    }


@app.post("/scan", response_model=ScanResponse)
def scan(request: ScanRequest) -> ScanResponse:
    image = _decode_image(request.imageBase64)
    width, height = image.size
    if width == 0 or height == 0:
        raise HTTPException(status_code=400, detail="Image has no pixels")

    model = get_model()
    frame = np.asarray(image)

    started = time.perf_counter()
    results = model.predict(
        source=frame,
        conf=request.conf,
        iou=request.iou,
        verbose=False,
    )
    elapsed_ms = int((time.perf_counter() - started) * 1000)

    names = model.names if isinstance(model.names, dict) else dict(enumerate(model.names))
    detections: list[Detection] = []

    if results:
        boxes = results[0].boxes
        if boxes is not None:
            for index, (coords, confidence, cls_id) in enumerate(
                zip(boxes.xyxy.tolist(), boxes.conf.tolist(), boxes.cls.tolist())
            ):
                x1, y1, x2, y2 = (float(v) for v in coords)
                x1, x2 = max(0.0, min(x1, width)), max(0.0, min(x2, width))
                y1, y2 = max(0.0, min(y1, height)), max(0.0, min(y2, height))
                box_width, box_height = x2 - x1, y2 - y1
                if box_width <= 1 or box_height <= 1:
                    continue

                class_name = str(names.get(int(cls_id), int(cls_id)))
                detections.append(
                    Detection(
                        id=f"det-{index}",
                        label=class_name.replace("_", " ").title(),
                        className=class_name,
                        confidence=round(float(confidence), 4),
                        coordinates=BoundingBox(
                            x=round(x1 / width * 100, 2),
                            y=round(y1 / height * 100, 2),
                            width=round(box_width / width * 100, 2),
                            height=round(box_height / height * 100, 2),
                        ),
                        pixelBox=[round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                    )
                )

    detections.sort(key=lambda d: d.confidence, reverse=True)

    return ScanResponse(
        success=True,
        model=MODEL_PATH.name,
        classes=[str(v) for v in names.values()],
        inferenceMs=elapsed_ms,
        image={"width": width, "height": height},
        detections=detections,
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("SCANNER_PORT", "8000"))
    print(f"[BinBuzz] Model: {MODEL_PATH}")
    print(f"[BinBuzz] Scanner listening on http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
