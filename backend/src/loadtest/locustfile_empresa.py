from locust import HttpUser, task, between
import random, datetime

API_URL      = "http://localhost:8080"         
USERNAME     = "emp_piloto1"                   
PASSWORD     = "pass"

EMPRESAS_ID  = [201, 202, 203, 204, 205, 221, 222, 223]   
USUARIOS_EMP = [222, 223, 224, 225, 226, 249, 250]       


class EmpresaUser(HttpUser):
    host = API_URL
    wait_time = between(1, 2)       


    def on_start(self):
        """
        Se ejecuta una sola vez al iniciar el usuario virtual.
        Autenticamos y guardamos el JWT en self.h
        """
        resp = self.client.post(
            "/auth/signin",
            json={"username": USERNAME, "password": PASSWORD},
            name="/auth/signin"
        )
        token = resp.json().get("token") or resp.json().get("accessToken", "")
        self.h = {"Authorization": f"Bearer {token}"}

    @task(2)
    def todas_empresas(self):
        """
        GET /empresas – listado completo
        """
        with self.client.get(
            "/empresas",
            headers=self.h,
            name="/empresas",
            catch_response=True
        ) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"/empresas → {r.status_code}")

    @task(3)
    def empresa_por_id(self):
        """
        GET /empresas/{id}
        80 % con ID válido, 20 % fuerza un 404 con ID inexistente.
        """
        if random.random() < 0.8:
            eid = random.choice(EMPRESAS_ID)
        else:
            eid = 99999                            

        with self.client.get(
            f"/empresas/{eid}",
            headers=self.h,
            name="/empresas/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"/empresas/{eid} → {r.status_code}")

    @task(3)
    def empresa_por_usuario(self):
        """
        GET /empresas/por_usuario/{usuarioId}
        80 % con usuario válido, 20 % usuario inexistente (404).
        """
        if random.random() < 0.8:
            uid = random.choice(USUARIOS_EMP)
        else:
            uid = 88888                          

        with self.client.get(
            f"/empresas/por_usuario/{uid}",
            headers=self.h,
            name="/empresas/por_usuario/{id}",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"/empresas/por_usuario/{uid} → {r.status_code}")
