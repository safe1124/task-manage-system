#!/bin/bash

# 백엔드 서버 자동 재시작 스크립트
# 서버가 크래시되면 자동으로 재시작됩니다

BACKEND_DIR="/workspace/backend"
LOG_FILE="$BACKEND_DIR/server.log"
PID_FILE="$BACKEND_DIR/backend.pid"

# 기존 프로세스 정리
cleanup() {
    echo "Cleaning up existing processes..."
    pkill -f "uvicorn.*main:app" 2>/dev/null
    pkill -f "python.*main.py" 2>/dev/null
    pkill -f "python.*run_server.py" 2>/dev/null
    rm -f "$PID_FILE"
    sleep 2
}

# 시그널 핸들러
handle_signal() {
    echo "Received signal, stopping backend server..."
    cleanup
    exit 0
}

# 시그널 트랩 설정
trap handle_signal SIGTERM SIGINT

echo "Starting backend server with auto-restart..."
cd "$BACKEND_DIR"

# 기존 프로세스 정리
cleanup

# 무한 루프로 서버 실행 및 재시작
while true; do
    echo "$(date): Starting backend server..." | tee -a "$LOG_FILE"
    
    # Python 환경 설정
    if [ -f "/workspace/.venv/bin/python" ]; then
        PYTHON_CMD="/workspace/.venv/bin/python"
    else
        PYTHON_CMD="python3"
    fi
    
    # 서버 시작
    $PYTHON_CMD run_server.py >> "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    echo "$(date): Backend server started with PID: $SERVER_PID" | tee -a "$LOG_FILE"
    
    # 서버 프로세스 모니터링
    wait $SERVER_PID
    EXIT_CODE=$?
    
    echo "$(date): Backend server stopped with exit code: $EXIT_CODE" | tee -a "$LOG_FILE"
    
    # 정상 종료가 아닌 경우에만 재시작
    if [ $EXIT_CODE -ne 0 ] && [ $EXIT_CODE -ne 130 ] && [ $EXIT_CODE -ne 143 ]; then
        echo "$(date): Server crashed, restarting in 5 seconds..." | tee -a "$LOG_FILE"
        sleep 5
    else
        echo "$(date): Server stopped normally, exiting..." | tee -a "$LOG_FILE"
        break
    fi
done

# 정리
rm -f "$PID_FILE"
echo "$(date): Backend monitor script stopped" | tee -a "$LOG_FILE"
