from locust import HttpUser, task, constant
import random

class PagoLoadTest(HttpUser):
    wait_time = constant(0.5)

    @task(3)
    def simular_pago_eliminar_anuncios(self):
        self.client.post("/pago/integrated", json={"compra": "ELIMINAR_ANUNCIOS"})

    @task(2)
    def simular_pago_suscripcion(self):
        self.client.post("/pago/integrated", json={"compra": "BASICO"})

    @task(1)
    def simular_aplicacion_pago(self):
        self.client.post("/pago/apply_compra", json={
            "intent": "pi_test_1234567890",
            "compra": "BASICO"
        })
