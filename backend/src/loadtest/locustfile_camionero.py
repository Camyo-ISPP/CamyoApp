from locust import HttpUser, task, between
import random

class CamioneroLoadTest(HttpUser):
    wait_time = between(1, 3)

    @task(2)
    def obtener_camionero_por_id(self):
        camionero_id = random.randint(1, 100)
        self.client.get(f"/camioneros/{camionero_id}")

    @task(1)
    def obtener_camionero_por_usuario(self):
        usuario_id = random.randint(1, 100)
        self.client.get(f"/camioneros/por_usuario/{usuario_id}")
