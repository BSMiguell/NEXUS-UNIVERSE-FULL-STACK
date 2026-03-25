#!/bin/bash

echo "🚀 Teste rápido de CI"
echo "===================="

# TypeScript
echo "📋 TypeScript..."
npm run type-check

# Lint
echo "🔍 Lint..."
npm run lint

# Build
echo "🏗️  Build..."
npm run build

echo "✅ Teste rápido concluído!"
