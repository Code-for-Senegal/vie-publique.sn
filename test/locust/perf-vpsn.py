from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    @task(1)
    def index_page(self):
        self.client.get("/")
    
    @task(2)
    def about_page(self):
        self.client.get("/about/us")

    # Ajoutez d'autres tâches pour visiter différentes pages de votre site

class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)

# Remplacez "/" et "/about" par les routes spécifiques de votre application Nuxt 3.
