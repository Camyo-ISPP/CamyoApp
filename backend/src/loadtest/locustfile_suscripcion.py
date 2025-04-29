from locust import HttpUser, task, constant
import random

class SuscripcionLoadTest(HttpUser):
    wait_time = constant(0.5)

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
            params={"nivel": "BASICO", "duracion": 30}
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
