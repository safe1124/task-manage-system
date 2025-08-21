#!/usr/bin/env python3
"""
데이터베이스 관리 도구
사용법: python3 db_manager.py [명령어]

명령어:
  users          - 모든 유저 목록 표시
  tasks          - 모든 태스크 목록 표시  
  user [유저ID]  - 특정 유저의 태스크 보기
  clean          - 익명 유저와 그들의 태스크 삭제
  stats          - 통계 정보
"""

import sqlite3
import sys
from datetime import datetime

DB_PATH = "backend/app.db"

def connect_db():
    return sqlite3.connect(DB_PATH)

def show_users():
    conn = connect_db()
    cursor = conn.cursor()
    
    print("=== 등록된 유저 목록 ===")
    cursor.execute("""
        SELECT id, name, mail, session_id,
               (SELECT COUNT(*) FROM tasks WHERE user_id = user_table.id) as task_count
        FROM user_table 
        ORDER BY name
    """)
    
    print(f"{'ID':<40} {'이름':<15} {'이메일':<25} {'태스크수':<8} {'세션ID'}")
    print("-" * 100)
    
    for row in cursor.fetchall():
        user_id, name, mail, session_id, task_count = row
        session_short = (session_id[:8] + "...") if session_id else "없음"
        print(f"{user_id:<40} {name:<15} {mail:<25} {task_count:<8} {session_short}")
    
    conn.close()

def show_tasks():
    conn = connect_db()
    cursor = conn.cursor()
    
    print("=== 모든 태스크 목록 ===")
    cursor.execute("""
        SELECT t.id, t.title, t.status, t.priority, t.due_date, 
               u.name as user_name, t.created_at
        FROM tasks t 
        LEFT JOIN user_table u ON t.user_id = u.id 
        ORDER BY t.created_at DESC
    """)
    
    print(f"{'ID':<4} {'제목':<20} {'상태':<12} {'우선도':<6} {'유저':<15} {'생성일'}")
    print("-" * 80)
    
    for row in cursor.fetchall():
        task_id, title, status, priority, due_date, user_name, created_at = row
        title_short = (title[:17] + "...") if len(title) > 20 else title
        created_short = created_at[:10] if created_at else ""
        print(f"{task_id:<4} {title_short:<20} {status:<12} {priority:<6} {user_name or 'Unknown':<15} {created_short}")
    
    conn.close()

def show_user_tasks(user_id):
    conn = connect_db()
    cursor = conn.cursor()
    
    # 유저 정보 확인
    cursor.execute("SELECT name, mail FROM user_table WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        print(f"유저 ID '{user_id}'를 찾을 수 없습니다.")
        conn.close()
        return
    
    name, mail = user
    print(f"=== {name} ({mail})의 태스크 목록 ===")
    
    cursor.execute("""
        SELECT id, title, description, status, priority, due_date, created_at 
        FROM tasks 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    """, (user_id,))
    
    tasks = cursor.fetchall()
    if not tasks:
        print("태스크가 없습니다.")
    else:
        print(f"{'ID':<4} {'제목':<25} {'상태':<12} {'우선도':<6} {'생성일'}")
        print("-" * 60)
        for task in tasks:
            task_id, title, desc, status, priority, due_date, created_at = task
            title_short = (title[:22] + "...") if len(title) > 25 else title
            created_short = created_at[:10] if created_at else ""
            print(f"{task_id:<4} {title_short:<25} {status:<12} {priority:<6} {created_short}")
    
    conn.close()

def clean_anonymous_users():
    conn = connect_db()
    cursor = conn.cursor()
    
    # 익명 유저들의 태스크 삭제
    cursor.execute("DELETE FROM tasks WHERE user_id IN (SELECT id FROM user_table WHERE name LIKE '익명사용자_%')")
    deleted_tasks = cursor.rowcount
    
    # 익명 유저들 삭제
    cursor.execute("DELETE FROM user_table WHERE name LIKE '익명사용자_%'")
    deleted_users = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    print(f"정리 완료: 익명 유저 {deleted_users}명, 태스크 {deleted_tasks}개 삭제")

def show_stats():
    conn = connect_db()
    cursor = conn.cursor()
    
    print("=== 데이터베이스 통계 ===")
    
    # 유저 통계
    cursor.execute("SELECT COUNT(*) FROM user_table")
    total_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_table WHERE name LIKE '익명사용자_%'")
    anon_users = cursor.fetchone()[0]
    
    # 태스크 통계
    cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = cursor.fetchone()[0]
    
    cursor.execute("SELECT status, COUNT(*) FROM tasks GROUP BY status")
    task_stats = cursor.fetchall()
    
    print(f"총 유저: {total_users}명 (익명: {anon_users}명, 등록: {total_users - anon_users}명)")
    print(f"총 태스크: {total_tasks}개")
    
    print("\n태스크 상태별 분포:")
    for status, count in task_stats:
        print(f"  {status}: {count}개")
    
    conn.close()

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    command = sys.argv[1].lower()
    
    if command == "users":
        show_users()
    elif command == "tasks":
        show_tasks()
    elif command == "user" and len(sys.argv) > 2:
        show_user_tasks(sys.argv[2])
    elif command == "clean":
        clean_anonymous_users()
    elif command == "stats":
        show_stats()
    else:
        print(__doc__)

if __name__ == "__main__":
    main()
