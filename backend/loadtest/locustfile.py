from locust import HttpUser, task, between
import random

class SuscripcionLoadTest(HttpUser):
    wait_time = between(1, 2)  # Espera entre peticiones

    @task(4)
    def obtener_suscripcion_activa(self):
        empresa_id = random.randint(1, 100)
        self.client.get(f"/suscripciones/activa/{empresa_id}")

    @task(2)
    def obtener_nivel_suscripcion(self):
        empresa_id = random.randint(1, 100)
        self.client.get(f"/suscripciones/nivel/{empresa_id}")

    @task(2)
    def asignar_suscripcion_basico(self):
        empresa_id = random.randint(1, 100)
        self.client.post(
            f"/suscripciones/{empresa_id}",
            params={"nivel": "BASICO", "duracion": 20}
        )

    @task(1)
    def asignar_suscripcion_gratis(self):
        empresa_id = random.randint(1, 100)
        self.client.post(
            f"/suscripciones/{empresa_id}",
            params={"nivel": "GRATIS"}
        )

    @task(1)
    def desactivar_suscripcion(self):
        suscripcion_id = random.randint(1, 100)
        self.client.put(f"/suscripciones/desactivar/{suscripcion_id}")
class ResenaLoadTest(HttpUser):
    wait_time = between(1, 2)

    @task(3)
    def listar_resenas_comentado(self):
        user_id = random.randint(1, 50)
        self.client.get(f"/resenas/comentado/{user_id}")

    @task(3)
    def listar_resenas_comentador(self):
        user_id = random.randint(1, 50)
        self.client.get(f"/resenas/comentador/{user_id}")

    @task(2)
    def crear_resena(self):
        payload = {
            "valoracion": random.randint(1, 5),
            "comentarios": f"Comentario de prueba #{random.randint(1000,9999)}",
            "comentador": {"id": random.randint(1, 50)},
            "comentado": {"id": random.randint(1, 50)}
        }
        self.client.post("/resenas", json=payload)

    @task(1)
    def obtener_resena_por_id(self):
        resena_id = random.randint(1, 100)
        self.client.get(f"/resenas/{resena_id}")

    @task(1)
    def obtener_resenados_por_usuario(self):
        user_id = random.randint(1, 50)
        self.client.get(f"/resenas/resenados/{user_id}")