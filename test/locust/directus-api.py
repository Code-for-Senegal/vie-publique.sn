from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    @task(1)
    def get_deputes(self):
        self.client.get("/items/Deputes")

    # Ajoutez d'autres tâches pour visiter différentes pages de votre site

class DeputesApiUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 3) # Temps d'attente entre les requêtes
