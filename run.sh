#!/bin/bash
# DevDen factory launcher
# Usage: ./run.sh [studio|cpe|all]

set -e

DEVDEN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DEVDEN_ROOT"

case "${1:-studio}" in
  studio)
    echo "🚀 Starting DevDen Studio..."
    echo "   → Opening http://localhost:3001"
    echo "   → All agents visible on canvas"
    cd studio && npm run dev
    ;;

  cpe)
    echo "🚀 Starting CPE (Chief Product Engineer)..."
    echo "   → Follow INTAKE-RUNBOOK.md for new missions"
    cd .agents/cpe && hermes
    ;;

  all)
    echo "🚀 Starting DevDen Studio in background..."
    cd studio && npm run dev > /tmp/devden-studio.log 2>&1 &
    STUDIO_PID=$!
    echo "   → Studio running at http://localhost:3001 (PID: $STUDIO_PID)"
    sleep 2

    echo "🚀 Starting CPE..."
    cd "$DEVDEN_ROOT/.agents/cpe" && hermes
    ;;

  *)
    echo "Usage: ./run.sh [studio|cpe|all]"
    echo ""
    echo "Commands:"
    echo "  studio  - Launch the canvas UI (default)"
    echo "  cpe     - Launch CPE for mission intake/orchestration"
    echo "  all     - Launch studio + CPE (studio runs in background)"
    exit 1
    ;;
esac
