Comment versionner sur directus ?
si le schemas de base de données chance ?

si j'utilise api key côté front web, risque sécu ?

une élection est de type présidentielle, législative, municipales, dépertementale
une coalition/parti participe à une élection
une coalition/parti est de type coalition, parti ou entité indépendante
une coalition à des listes de candidat sur une élection donnée (national/proportionelle ou departemental/majoritaire)
les listes sont liée à une élection données
une coalition peut avoir des listes de candidats différents sur différentes élections
une coalition à une tête de liste
une liste est nationale ou départementale
une liste départementale est liée à une circonscription
une liste nationale n'est liée à aucune circonscription, elle est unique pour une coalition sur une élection
une circonscription est de type nationale ou diaspora
une liste d'une coalition est composé de candidat titulaire et suppléant
les candidats sur une liste sont classés par ordre d'investiture
un candidat peut être élu ou non sur une élection

je veux pouvoir afficher mes données en listant les coalition dabord
puis en affichant les listes de candidats pour une coalition donnée (regroupé par type de liste et par cirsconscription)

je veux pouvoir afficher les candidats élus pour l'Assemblée et les candidats élus pour les listes départementales et nationale

## Approche

1. une collections avec tout

mais, difficulté d'affichage côté front

2. approche, distinger la personnes du candiats, trop scompliqué

3. je traite juste l'élection en cours
