from locust import HttpUser, task, constant
import random

class ResenaLoadTest(HttpUser):
    wait_time = constant(0.5)

    @task(3)
    def listar_resenas_comentado(self):
        user_id = random.randint(1, 100)
        self.client.get(f"/resenas/comentado/{user_id}")

    @task(3)
    def listar_resenas_comentador(self):
        user_id = random.randint(1, 100)
        self.client.get(f"/resenas/comentador/{user_id}")

    @task(2)
    def crear_resena(self):
        payload = {
            "valoracion": random.randint(1, 5),
            "comentarios": f"Comentario #{random.randint(1000,9999)}",
            "comentador": {"id": random.randint(1, 100)},
            "comentado": {"id": random.randint(1, 100)}
        }
        self.client.post("/resenas", json=payload)

    @task(1)
    def obtener_resena_por_id(self):
        resena_id = random.randint(1, 100)
        self.client.get(f"/resenas/{resena_id}")

    @task(1)
    def obtener_resenados_por_usuario(self):
        user_id = random.randint(1, 100)
        self.client.get(f"/resenas/resenados/{user_id}")
