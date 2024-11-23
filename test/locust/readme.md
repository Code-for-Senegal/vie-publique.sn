# Performance test with locust

- installer python et pip

- install locust

```
pip install locust
```

## Vie publique test

- Exécution de Locust

```
locust -f .\perf-vpsn.py --host=https://www.vie-publique.sn
```

- Utilisation de l'Interface Web de Locust

Une fois Locust démarré, ouvrez votre navigateur et accédez à http://localhost:8089

Configurer le nombre d'utilisateurs simulés et Démarrer le test

L'interface web de Locust affiche en temps réel des informations sur la performance de votre site, y compris le temps de réponse, le nombre de requêtes par seconde, et les taux d'erreur.

## api test

```
locust -f .\directus-api.py --host=https://directus.malick.tech
```
