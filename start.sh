#!/bin/bash
# Render startup script - must run uvicorn from inside the backend folder
# so that relative imports like 'from core.config import settings' work correctly
cd backend
exec uvicorn main:app --host 0.0.0.0 --port $PORT
