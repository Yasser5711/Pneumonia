#!/bin/bash

# Fail fast
set -euo pipefail

if [[ -z "${SERVICE_ID:-}" || -z "${API_TOKEN:-}" ]]; then
    echo "❌ Missing SERVICE_ID or API_TOKEN"
    exit 1
fi

echo "🔄 Waiting for deployment to complete on Render (service: $SERVICE_ID)..."

MAX_ATTEMPTS=60
SLEEP_INTERVAL=5
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    RESPONSE=$(curl -s -H "Authorization: Bearer $API_TOKEN" \
        "https://api.render.com/v1/services/$SERVICE_ID/deploys")

    STATUS=$(echo "$RESPONSE" | jq -r '.[0].deploy.status')
    DEPLOY_ID=$(echo "$RESPONSE" | jq -r '.[0].deploy.id')
    UPDATED_AT=$(echo "$RESPONSE" | jq -r '.[0].deploy.updatedAt')

    echo "⏱️ Attempt $ATTEMPT: Deploy $DEPLOY_ID status = $STATUS (updated at $UPDATED_AT)"

    if [[ "$STATUS" == "live" ]]; then
        echo "✅ Deployment completed successfully."
        exit 0
    elif [[ "$STATUS" =~ ^(build_failed|update_failed|canceled)$ ]]; then
        echo "❌ Deployment failed (status: $STATUS)"
        exit 1
    fi

    ATTEMPT=$((ATTEMPT + 1))
    sleep $SLEEP_INTERVAL
done

echo "⚠️ Deployment did not complete within expected time."
exit 1
