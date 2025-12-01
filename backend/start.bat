@echo off
echo Starting ML Model Builder Backend...
echo.
echo Make sure you have activated the virtual environment:
echo   venv\Scripts\activate
echo.
echo Installing dependencies if needed...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:5000
echo.
python -m uvicorn app.main:app --reload --port 5000

