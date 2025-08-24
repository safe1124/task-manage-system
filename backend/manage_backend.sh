#!/bin/bash

# 백엔드 서버 관리 스크립트

BACKEND_DIR="/workspace/backend"
PID_FILE="$BACKEND_DIR/backend.pid"
LOG_FILE="$BACKEND_DIR/server.log"

case "$1" in
    start)
        echo "Starting backend server with auto-restart..."
        cd "$BACKEND_DIR"
        nohup ./start_backend_with_restart.sh > /dev/null 2>&1 &
        echo "Backend server monitor started in background"
        ;;
    stop)
        echo "Stopping backend server..."
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            kill -TERM $PID 2>/dev/null
            rm -f "$PID_FILE"
        fi
        pkill -f "start_backend_with_restart.sh" 2>/dev/null
        pkill -f "uvicorn.*main:app" 2>/dev/null
        pkill -f "python.*main.py" 2>/dev/null
        pkill -f "python.*run_server.py" 2>/dev/null
        echo "Backend server stopped"
        ;;
    restart)
        $0 stop
        sleep 3
        $0 start
        ;;
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                echo "Backend server is running (PID: $PID)"
                # 포트 확인
                if netstat -tulpn 2>/dev/null | grep ":8000" > /dev/null; then
                    echo "Server is listening on port 8000"
                else
                    echo "Warning: Server process exists but port 8000 is not open"
                fi
            else
                echo "Backend server is not running (stale PID file)"
                rm -f "$PID_FILE"
            fi
        else
            if pgrep -f "uvicorn.*main:app\|python.*run_server.py" > /dev/null; then
                echo "Backend server processes found but no PID file"
            else
                echo "Backend server is not running"
            fi
        fi
        ;;
    logs)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "No log file found at $LOG_FILE"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start backend server with auto-restart"
        echo "  stop    - Stop backend server"
        echo "  restart - Restart backend server"
        echo "  status  - Check server status"
        echo "  logs    - Show server logs (follow mode)"
        exit 1
        ;;
esac
