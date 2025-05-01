# locustfile_suscripcion.py
from locust import HttpUser, task, between
import random


API_URL          = "http://localhost:8080"      # Ajusta host/puerto si hace falta
USERNAME         = "emp_piloto1"                # Credenciales válidas
PASSWORD         = "pass"

EMPRESAS_ID      = [201, 202, 203, 204, 205]    # IDs de empresas reales
SUSCRIPCIONES_ID = [301, 302, 303, 304, 305]    # IDs de suscripciones existentes
PLANES           = ["GRATIS", "BASICO", "PREMIUM"]



class SuscripcionUser(HttpUser):
    host = API_URL
    wait_time = between(1, 2)        # pausa aleatoria entre peticiones

   
    def on_start(self):
        resp = self.client.post(
            "/auth/signin",
            json={"username": USERNAME, "password": PASSWORD},
            name="/auth/signin"
        )
        token = resp.json().get("token") or resp.json().get("accessToken", "")
        self.h = {"Authorization": f"Bearer {token}"}

    

    @task(4)
    def suscripcion_activa(self):
        """
        GET /suscripciones/activa/{empresaId}
        80 % empresa válida → 200, 20 % inexistente → 404.
        """
        if random.random() < 0.8:
            eid = random.choice(EMPRESAS_ID)
        else:
            eid = 99999                           # empresa inexistente

        with self.client.get(
            f"/suscripciones/activa/{eid}",
            headers=self.h,
            name="/suscripciones/activa/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"/suscripciones/activa/{eid} → {r.status_code}")

    @task(3)
    def nivel_suscripcion(self):
        """
        GET /suscripciones/nivel/{empresaId}
        80 % empresa válida → 200, 20 % inexistente → 404.
        """
        if random.random() < 0.8:
            eid = random.choice(EMPRESAS_ID)
        else:
            eid = 88888

        with self.client.get(
            f"/suscripciones/nivel/{eid}",
            headers=self.h,
            name="/suscripciones/nivel/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"/suscripciones/nivel/{eid} → {r.status_code}")

    @task(2)
    def asignar_o_cambiar_suscripcion(self):
        """
        POST /suscripciones/{empresaId}?nivel=&duracion=
        – 80 % empresa válida, 20 % inexistente.
        – Plan aleatorio y duración aleatoria 15-60 d para BASICO/PREMIUM.
        """
        nivel = random.choice(PLANES)
        if nivel == "GRATIS":
            duracion = ""               # no se pasa duración
        else:
            duracion = random.randint(15, 60)

        if random.random() < 0.8:
            eid = random.choice(EMPRESAS_ID)
        else:
            eid = 77777

        url = f"/suscripciones/{eid}?nivel={nivel}"
        if duracion:
            url += f"&duracion={duracion}"

        with self.client.post(
            url,
            headers=self.h,
            name="/suscripciones/{id} (POST)",
            catch_response=True
        ) as r:
            # 201 si OK, 404 si empresa no existe
            if r.status_code in (201, 404):
                r.success()
            else:
                r.failure(f"POST suscripción {eid} → {r.status_code}")

    @task(1)
    def desactivar_suscripcion(self):
        """
        PUT /suscripciones/desactivar/{id}
        70 % ID válido, 30 % fuerza 404.
        """
        if random.random() < 0.7:
            sid = random.choice(SUSCRIPCIONES_ID)
        else:
            sid = 123456

        with self.client.put(
            f"/suscripciones/desactivar/{sid}",
            headers=self.h,
            name="/suscripciones/desactivar/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"PUT desactivar {sid} → {r.status_code}")
