# Metamorphosys

Système Foundry VTT `metamorphosys`.

## Installation

Dans Foundry : **Systèmes de jeu** → **Installer** → coller ce lien dans « URL du manifeste » :

```
https://github.com/cedrictorres0427-ops/fvtt-system-metamorphosys/releases/latest/download/system.json
```

## Publier une nouvelle version

1. Augmenter `version` dans `system.json` et remplacer la version dans `download`.
2. Commit, puis tag `v<version>` poussé sur GitHub : l'action « Release » construit le zip et la release.
