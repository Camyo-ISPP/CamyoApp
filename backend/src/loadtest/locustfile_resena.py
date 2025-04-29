from locust import HttpUser, task, between
import random

API_URL = "http://localhost:8080"
USERNAME = "emp_piloto1"
PASSWORD = "pass"
COMENTADORES_VALIDOS = [101, 102, 103]
COMENTADOS_VALIDOS = [201, 202, 203]
class ResenaUser(HttpUser):
    host = API_URL
    wait_time = between(0.5, 1)  # Más rápido, pero no instantáneo

    def on_start(self):
        resp = self.client.post("/auth/signin", json={"username": USERNAME, "password": PASSWORD})
        token = resp.json().get("token") or resp.json().get("accessToken", "")
        self.h = {"Authorization": f"Bearer {token}"}

    @task(4)
    def listar_resenas_comentado(self):
        user_id = random.randint(1, 100)
        with self.client.get(f"/resenas/comentado/{user_id}", headers=self.h, name="/resenas/comentado/{user_id}", catch_response=True) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Comentado {user_id} → {r.status_code}")

    @task(3)
    def listar_resenas_comentador(self):
        user_id = random.randint(1, 100)
        with self.client.get(f"/resenas/comentador/{user_id}", headers=self.h, name="/resenas/comentador/{user_id}", catch_response=True) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Comentador {user_id} → {r.status_code}")


    @task(2)
    def ver_resena_aleatoria(self):
        resena_id = random.randint(1, 300)
        with self.client.get(f"/resenas/{resena_id}", headers=self.h, name="/resenas/{id}", catch_response=True) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"Ver reseña {resena_id} → {r.status_code}")

    @task(1)
    def ver_usuarios_reseñados(self):
        user_id = random.randint(1, 100)
        with self.client.get(f"/resenas/resenados/{user_id}", headers=self.h, name="/resenas/resenados/{id}", catch_response=True) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"Reseñados {user_id} → {r.status_code}")