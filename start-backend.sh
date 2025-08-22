#!/bin/bash

# Kill any process using port 9080
echo "Checking for processes using port 9080..."
PID=$(lsof -ti:9080)

if [ ! -z "$PID" ]; then
    echo "Killing process $PID using port 9080..."
    kill -9 $PID
    sleep 1
    echo "Process killed."
else
    echo "No process found using port 9080."
fi

# Start the backend with nodemon
echo "Starting backend server..."
nodemon
