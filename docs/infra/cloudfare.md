# Configuration Cloudflare - Vie Publique Sénégal

_Date : 09/07/2026_

## Objectifs

- Améliorer les performances du site
- Renforcer la sécurité
- Conserver un excellent référencement (SEO)
- Permettre l'accès aux moteurs IA (ChatGPT, Gemini, Copilot, Claude, Perplexity...)
- Limiter les faux positifs et éviter de bloquer des utilisateurs légitimes

---

# DNS

## Nameservers

**Configuration retenue**

```
heidi.ns.cloudflare.com
ryan.ns.cloudflare.com
```

**Statut**

✅ Migration OVH → Cloudflare terminée.

---

## DNSSEC

**Configuration retenue**

```
Désactivé
```

**Pourquoi**

- recommandé lors de la migration
- évite les erreurs de validation DNSSEC
- pourra être réactivé ultérieurement directement depuis Cloudflare

---

# SSL / TLS

## Encryption mode

**Configuration retenue**

```
Full (Strict)
```

**Pourquoi**

- chiffrement de bout en bout
- validation du certificat de l'origine
- niveau de sécurité recommandé en production

---

## Edge Certificate

Configuration automatique Cloudflare.

```
Universal SSL
```

- certificat automatique
- renouvellement automatique
- couvre :

```
vie-publique.sn
*.vie-publique.sn
```

---

# Cache

## Caching Level

```
Standard
```

Conserve le comportement recommandé par Cloudflare.

---

## Browser Cache TTL

```
4 heures
```

Laisse le navigateur conserver les ressources statiques.

---

## Development Mode

```
Désactivé
```

À activer uniquement lors du développement.

---

## Always Online

```
Désactivé
```

Pas nécessaire actuellement.

---

## Cache Rules

```
Aucune
```

Décision :

- attendre plusieurs jours de métriques
- optimiser ensuite selon les pages les plus consultées

---

# Sécurité

## WAF

```
Activé
```

Utilisation des règles managées Cloudflare.

Objectifs :

- SQL Injection
- XSS
- scanners
- bots malveillants
- exploits connus

---

## DDoS Protection

```
Activée
```

Protection automatique Cloudflare.

---

## Bot Fight Mode

```
OFF
```

Pourquoi :

- éviter les faux positifs
- les règles WAF sont suffisantes actuellement

À réévaluer si du trafic malveillant apparaît.

---

# AI Crawl Control

## Block AI Bots

Configuration retenue

```
Do not block (allow crawlers)
```

---

## Mixed purpose crawlers

Configuration retenue

```
Mixed purpose crawlers will continue to be allowed
```

---

### Pourquoi

Vie Publique est une plateforme de diffusion d'information publique.

Objectifs :

- indexation Google
- Google AI
- Gemini
- ChatGPT
- Claude
- Copilot
- Perplexity
- Facebook / WhatsApp / LinkedIn Preview

Le bénéfice de visibilité est largement supérieur au coût du crawl.

---

# Analytics

## Activés

- HTTP Analytics
- Security Analytics
- AI Crawl Analytics
- Performance Analytics

---

# Résultats observés après migration

## SSL

✅ Certificat Cloudflare actif

---

## HTTPS

✅ Full (Strict)

---

## DNS

✅ Propagation terminée

---

## Redirection

```
https://vie-publique.sn
    ↓
https://www.vie-publique.sn
```

Fonctionnelle.

---

## Sous-domaines

Validation :

- www
- cms
- admin
- n8n
- autres sous-domaines

Tous opérationnels.

---

# KPI à suivre (48 à 72h)

## Performance

- Cache Hit Ratio
- Temps de réponse
- Bande passante économisée

---

## Sécurité

- WAF Blocks
- Faux positifs
- Pays d'origine
- Top IP
- Top Paths

---

## IA

- ChatGPT-User
- Googlebot
- Claude SearchBot
- BingBot
- PerplexityBot
- MistralAI-User

---

# Optimisations prévues (phase 2)

- Cache Rules ciblées
- Rate Limiting API
- Cache des PDF
- Optimisation des assets Nuxt
- Compression et cache des images
- Firewall Rules personnalisées si nécessaire
- Monitoring des faux positifs WAF

---

# Décisions retenues

| Élément | Valeur |
|---------|--------|
| DNS | Cloudflare |
| DNSSEC | Désactivé |
| SSL | Full (Strict) |
| Universal SSL | ✅ |
| WAF | ✅ |
| DDoS | ✅ |
| Bot Fight Mode | OFF |
| AI Bots | Autorisés |
| Mixed Crawlers | Autorisés |
| Cache Rules | Aucune (pour le moment) |
| Browser Cache TTL | 4 h |
| Development Mode | OFF |
| Always Online | OFF |

---

## Prochaine étape

Laisser Cloudflare collecter des métriques pendant **48 à 72 heures**, puis analyser :

- efficacité du cache ;
- trafic IA ;
- blocs WAF ;
- éventuels faux positifs ;
- optimisation des règles de cache et de sécurité.
