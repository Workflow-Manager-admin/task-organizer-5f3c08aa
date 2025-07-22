#!/bin/bash
cd /home/kavia/workspace/code-generation/task-organizer-5f3c08aa/frontend_web
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

