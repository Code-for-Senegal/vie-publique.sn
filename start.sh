#!/bin/sh
# Script de démarrage avec logs explicites pour diagnostiquer les problèmes Coolify

echo "========================================"
echo "🚀 Démarrage du serveur Nuxt/Nitro"
echo "========================================"
echo "HOST: ${HOST:-0.0.0.0}"
echo "PORT: ${PORT:-3000}"
echo "NODE_ENV: ${NODE_ENV:-production}"
echo "CWD: $(pwd)"
echo "========================================"

# Vérifier que .output/server/index.mjs existe
if [ ! -f ".output/server/index.mjs" ]; then
    echo "❌ ERREUR: .output/server/index.mjs n'existe pas!"
    echo "Le build n'a probablement pas réussi correctement."
    exit 1
fi

echo "✅ Fichier serveur trouvé: .output/server/index.mjs"
echo ""
echo "🔄 Démarrage du serveur Node.js..."
echo "========================================"

# Démarrer le serveur avec HOST et PORT explicites
exec node .output/server/index.mjs
