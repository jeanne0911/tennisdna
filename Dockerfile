FROM python:3.11-slim

WORKDIR /app

ENV TZ=Asia/Shanghai

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 确保.env文件存在（如果未提供，将使用main.py中的默认值）
RUN if [ ! -f .env ]; then echo "# 环境变量文件未提供，将使用默认配置" > .env; fi

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
