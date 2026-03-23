"""
Tennis DNA Test - 后端API
"""
import os
import json
import pymysql
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

# 加载环境变量文件
load_dotenv()

app = FastAPI(title="Tennis DNA Test API")

# CORS 配置 - 允许静态资源的跨域加载
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# ========== 数据库配置（通过环境变量获取） ==========
DB_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "11.142.154.110"),
    "port": int(os.environ.get("MYSQL_PORT", 3306)),
    "user": os.environ.get("MYSQL_USER", "with_sazkfmchaeaxolys"),
    "password": os.environ.get("MYSQL_PASSWORD", "oaU#G0uzr&UDr4"),
    "database": os.environ.get("MYSQL_DATABASE", "txm34vvf"),
    "charset": "utf8mb4",
}

# 基础完成人数
BASE_COUNT = 99


def get_db():
    """获取数据库连接"""
    return pymysql.connect(**DB_CONFIG)


# ========== 数据模型 ==========
class TestResult(BaseModel):
    eng_name: Optional[str] = None
    chn_name: Optional[str] = None
    main_type: str
    sub_type: Optional[str] = None
    type_scores: Optional[dict] = None
    level: Optional[int] = None
    freq: Optional[int] = None


# ========== API接口 ==========
@app.get("/")
async def root():
    """根路径重定向到静态页面"""
    return RedirectResponse(url="/static/index.html")


@app.post("/api/submit_result")
async def submit_result(result: TestResult):
    """提交测试结果"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        sql = """
            INSERT INTO test_results (eng_name, chn_name, main_type, sub_type, type_scores, level, freq)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        type_scores_json = json.dumps(result.type_scores) if result.type_scores else None
        cursor.execute(sql, (
            result.eng_name,
            result.chn_name,
            result.main_type,
            result.sub_type,
            type_scores_json,
            result.level,
            result.freq,
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return {"code": 0, "msg": "提交成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"提交失败: {str(e)}")


@app.get("/api/test_count")
async def get_test_count():
    """获取完成测试的总人数（基础数 + 数据库记录数）"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM test_results")
        row = cursor.fetchone()
        db_count = row[0] if row else 0
        cursor.close()
        conn.close()
        total = BASE_COUNT + db_count
        return {"code": 0, "count": total}
    except Exception as e:
        # 数据库异常时返回基础数
        return {"code": 0, "count": BASE_COUNT}


# ========== 挂载静态文件（必须放在最后） ==========
app.mount("/static", StaticFiles(directory="static", html=True), name="static")
