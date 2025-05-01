# locustfile_pago.py
from locust import HttpUser, task, between
import random
import re
import json

API_URL  = "http://localhost:8080"
USERNAME = "emp_piloto1"
PASSWORD = "pass"

# Tipos de compra según tu enum Compra
COMPRAS = ["BASICO", "PREMIUM", "PATROCINAR", "ELIMINAR_ANUNCIOS"]

# ID’s de ofertas reales (usa los tuyos) para la ruta PATROCINAR
OFERTAS_ID = [501, 502, 503]




class PagoUser(HttpUser):
    host = API_URL
    wait_time = between(1, 2)

    
    def on_start(self):
        r = self.client.post(
            "/auth/signin",
            json={"username": USERNAME, "password": PASSWORD},
            name="/auth/signin"
        )
        token = r.json().get("token") or r.json().get("accessToken", "")
        self.h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    
    @task(4)
    def integrated_checkout(self):
        """
        POST /pago/integrated
        - Envía un tipo de compra aleatorio.
        - 90 % espera 200 OK, 10 % provoca un 400 enviando 'compra': null.
        - Si recibe un secret válido, guarda (intent, compra) en memoria para
          que otra tarea pueda llamar a /pago/apply_compra.
        """
        # 10 % request inválida
        if random.random() < 0.1:
            payload = {"compra": None}
        else:
            payload = {"compra": random.choice(COMPRAS)}

        with self.client.post(
            "/pago/integrated",
            headers=self.h,
            data=json.dumps(payload),
            name="/pago/integrated",
            catch_response=True
        ) as r:
            if r.status_code in (200, 400):
                r.success()
                if r.status_code == 200:
                    # guardar PaymentIntent ID si viene un secret tipo "pi_XXX_secret_YYY"
                    secret = r.text.strip('"')                # la API devuelve un String
                    m = re.match(r"(pi_[^_]+)", secret or "")
                    if m:
                        self.intent_cache = (m.group(1), payload["compra"])
            else:
                r.failure(f"/pago/integrated → {r.status_code}")

    @task(2)
    def apply_compra(self):
        """
        POST /pago/apply_compra
        - Solo se lanza si se ha almacenado previamente un intent.
        - Para PATROCINAR añade ofertaId.
        - Se considera éxito cualquier 2xx o 4xx coherente (Stripe puede
          devolver 402/400 si el intent no es válido en modo test).
        """
        if not hasattr(self, "intent_cache"):
            return  # todavía no hicimos integrated_checkout con éxito

        intent_id, compra = self.intent_cache
        body = {"intent": intent_id, "compra": compra}

        if compra == "PATROCINAR":
            body["ofertaId"] = random.choice(OFERTAS_ID)

        with self.client.post(
            "/pago/apply_compra",
            headers=self.h,
            data=json.dumps(body),
            name="/pago/apply_compra",
            catch_response=True
        ) as r:
            if r.status_code in (200, 400, 402):
                r.success()
            else:
                r.failure(f"/pago/apply_compra → {r.status_code}")
