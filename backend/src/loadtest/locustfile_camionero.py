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

from locust import HttpUser, task, between
import random


API_URL         = "http://localhost:8080"  # cambia si tu API vive en otro host
USERNAME        = "emp_piloto1"            # credenciales válidas en tu /auth/signin
PASSWORD        = "pass"

CAMIONEROS_ID   = [101, 102, 103, 104, 105]      # ← IDs reales existentes
USUARIOS_CAM    = [301, 302, 303, 304, 305]      # ← usuarios con rol Camionero


class CamioneroUser(HttpUser):
    host = API_URL
    wait_time = between(1, 2)    # espera aleatoria (s) entre peticiones

    def on_start(self):
        """
        Se ejecuta una sola vez al iniciar cada usuario virtual.
        Autentica en /auth/signin y guarda el JWT en self.h.
        """
        resp = self.client.post(
            "/auth/signin",
            json={"username": USERNAME, "password": PASSWORD},
            name="/auth/signin"
        )
        token = resp.json().get("token") or resp.json().get("accessToken", "")
        self.h = {"Authorization": f"Bearer {token}"}

   

    @task(4)
    def camionero_por_id(self):
        """
        GET /camioneros/{id}
        80 % usa un ID válido, 20 % fuerza un 404 con ID inexistente.
        """
        if random.random() < 0.8:
            cid = random.choice(CAMIONEROS_ID)
        else:
            cid = 99999                                 # ID seguro inexistente

        with self.client.get(
            f"/camioneros/{cid}",
            headers=self.h,
            name="/camioneros/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"/camioneros/{cid} → {r.status_code}")

    @task(3)
    def camionero_por_usuario(self):
        """
        GET /camioneros/por_usuario/{usuarioId}
        80 % con usuario válido, 20 % usuario inexistente (404).
        """
        if random.random() < 0.8:
            uid = random.choice(USUARIOS_CAM)
        else:
            uid = 88888                                # usuario inexistente

        with self.client.get(
            f"/camioneros/por_usuario/{uid}",
            headers=self.h,
            name="/camioneros/por_usuario/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"/camioneros/por_usuario/{uid} → {r.status_code}")
