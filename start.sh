#!/bin/bash

# 设置端口号
PORT=41303

# 获取当前脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 进入项目目录
cd "$SCRIPT_DIR"

echo "正在启动 加密货币现货抄底计算器 应用..."
echo "端口: $PORT"

# 查找并杀死占用端口的进程
echo "检查端口 $PORT 是否被占用..."
PID=$(lsof -ti:$PORT)

if [ ! -z "$PID" ]; then
    echo "发现端口 $PORT 被进程 $PID 占用，正在终止..."
    kill -9 $PID
    sleep 2
    echo "进程已终止"
else
    echo "端口 $PORT 未被占用"
fi

# 查找并杀死可能存在的 node 进程（加密货币现货抄底计算器 相关）
echo "检查是否有其他 加密货币现货抄底计算器 相关进程..."
EXISTING_PIDS=$(ps aux | grep -E "(react-scripts|crypto-spot-dip-calc)" | grep -v grep | awk '{print $2}')

if [ ! -z "$EXISTING_PIDS" ]; then
    echo "发现现有的 加密货币现货抄底计算器 进程，正在终止..."
    echo "$EXISTING_PIDS" | xargs kill -9 2>/dev/null
    sleep 2
    echo "现有进程已终止"
fi

# 检查是否存在 node_modules
if [ ! -d "node_modules" ]; then
    echo "未找到 node_modules，正在安装依赖..."
    npm install
fi

# 设置环境变量并启动应用
export PORT=$PORT

echo "正在启动应用..."
echo "访问地址: http://localhost:$PORT"
echo "按 Ctrl+C 停止应用"

# 启动应用（后台运行）
nohup npm start > /tmp/dipcalc.log 2>&1 &
echo "应用已在后台启动，PID: $!"
echo "日志位置: /tmp/dipcalc.log"
echo "停止应用: kill $!"