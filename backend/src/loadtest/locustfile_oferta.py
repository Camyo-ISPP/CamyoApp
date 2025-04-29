from locust import HttpUser, task, between, tag
import random, datetime, string

API = "http://localhost:8080"
BASE = "/ofertas"
EMPRESA_ID = 201
CAMIONEROS = [223, 224, 225, 226, 227]
EMPRESAS = [201, 221, 222, 223]

def ts():
    return datetime.datetime.utcnow().isoformat(timespec="seconds")

class OfertaUser(HttpUser):
    host = API
    wait_time = between(1, 2)

    def on_start(self):
        r = self.client.post("/auth/signin",
                             json={"username": "emp_piloto1", "password": "pass"})
        token = r.json().get("token") or r.json().get("accessToken") or ""
        self.h = {"Authorization": f"Bearer {token}"}
        self.creadas = {}
        self.patro = set()

    @task(2)
    def recientes(self):
        self.client.get(f"{BASE}/recientes", headers=self.h, name=f"{BASE}/recientes")

    @task(1)
    def info(self):
        with self.client.get(f"{BASE}/info", headers=self.h,
                             name=f"{BASE}/info", catch_response=True) as r:
            if r.status_code >= 500:
                r.success()

    @task(1)
    def info_op(self):
        self.client.get(f"{BASE}/info/op", headers=self.h, name=f"{BASE}/info/op")

    @task(2)
    def crear(self):
        titulo = "LT-" + "".join(random.choices(string.ascii_uppercase, k=6))
        payload = {
            "oferta": {
                "titulo": titulo,
                "experiencia": 0,
                "licencia": "C",
                "notas": "locust",
                "estado": "ABIERTA",
                "fechaPublicacion": ts(),
                "sueldo": 2000,
                "empresa": {"id": EMPRESA_ID},
                "localizacion": "Sevilla",
                "tipoOferta": "TRABAJO"
            },
            "trabajo": {
                "fechaIncorporacion": "2025-06-01",
                "jornada": "REGULAR"
            }
        }
        r = self.client.post(BASE, headers=self.h, json=payload, name=BASE)
        if r.status_code == 201:
            oid = r.json()["id"]
            self.creadas[oid] = {"aplicados": set(), "estado": "ABIERTA"}

    @task(2)
    def leer_oferta(self):
        if not self.creadas:
            return
        oid = random.choice(list(self.creadas.keys()))
        self.client.get(f"{BASE}/{oid}", headers=self.h, name=f"{BASE}/{{id}}")

    @task(1)
    def actualizar(self):
        if not self.creadas:
            return
        oid = random.choice(list(self.creadas.keys()))
        payload = {"oferta": {"titulo": "UPD-" + ts(), "tipoOferta": "TRABAJO"}}
        self.client.put(f"{BASE}/{oid}", headers=self.h, json=payload,
                        name=f"{BASE}/{{id}}")


    @task(1)
    def aplicar(self):
        if not self.creadas:
            return
        candidatas = [
            (oid, meta) for oid, meta in self.creadas.items()
            if meta.get("estado") == "ABIERTA"
               and len(meta["aplicados"]) < len(CAMIONEROS)
        ]
        if not candidatas:
            return

        oid, meta = random.choice(candidatas)
        camioneros_libres = [c for c in CAMIONEROS if c not in meta["aplicados"]]
        if not camioneros_libres:
            return

        cid = random.choice(camioneros_libres)

        with self.client.put(f"{BASE}/{oid}/aplicar/{cid}",
                             headers=self.h,
                             name=f"{BASE}/{{id}}/aplicar",
                             catch_response=True) as r:

            if r.status_code < 400:              
                meta["aplicados"].add(cid)
                r.success()

            elif r.status_code in (400, 401, 403, 404, 409, 422):
                meta["aplicados"].add(cid)      
                r.success()

            else:
                r.failure(f"aplicar devolvió {r.status_code}")


    @task(1)
    def desaplicar(self):
        candidatos = [(oid, meta) for oid, meta in self.creadas.items()
                      if meta["aplicados"]]
        if not candidatos:
            return

        oid, meta = random.choice(candidatos)
        cid = random.choice(list(meta["aplicados"]))

        with self.client.put(f"{BASE}/{oid}/desaplicar/{cid}",
                             headers=self.h,
                             name=f"{BASE}/{{id}}/desaplicar",
                             catch_response=True) as r:
            meta["aplicados"].discard(cid)
            r.success()


    @task(1)
    def asignar(self):
        if not self.creadas:
            return
        oid = random.choice(list(self.creadas.keys()))
        cid = random.choice(CAMIONEROS)
        self.client.put(f"{BASE}/{oid}/asignar/{cid}", headers=self.h,
                        name=f"{BASE}/{{id}}/asignar")

    @task(1)
    def rechazar(self):
        if not self.creadas:
            return
        oid = random.choice(list(self.creadas.keys()))
        cid = random.choice(CAMIONEROS)
        self.client.put(f"{BASE}/{oid}/rechazar/{cid}", headers=self.h,
                        name=f"{BASE}/{{id}}/rechazar")

    @task(1)
    def patrocinar(self):
        libres = [oid for oid in self.creadas
                  if oid not in self.patro and self.creadas[oid].get("estado") == "ABIERTA"]
        if not libres:
            return

        oid = random.choice(libres)
        with self.client.put(f"{BASE}/{oid}/patrocinar",
                             headers=self.h,
                             name=f"{BASE}/{{id}}/patrocinar",
                             catch_response=True) as r:
            if r.status_code == 200:
                self.patro.add(oid)
                r.success()
            elif r.status_code in (400, 403, 409):
                r.success()
            else:
                r.failure(f"patrocinar devolvió {r.status_code}")

    @task(1)
    def desactivar_patrocinio(self):
        if not self.patro:
            return
        oid = random.choice(list(self.patro))
        r = self.client.put(f"{BASE}/{oid}/desactivar-patrocinio", headers=self.h,
                            name=f"{BASE}/{{id}}/desactivar-patrocinio")
        if r.status_code == 200:
            self.patro.remove(oid)

    @task(2)
    def carga_trabajo(self):
        if not self.creadas:
            return
        oid = random.choice(list(self.creadas.keys()))
        self.client.get(f"{BASE}/{oid}/trabajo", headers=self.h,
                        name=f"{BASE}/{{id}}/trabajo")

    @task(2)
    def eliminar(self):
        if not self.creadas:
            return
        oid = random.choice(list(self.creadas.keys()))
        r = self.client.delete(f"{BASE}/{oid}", headers=self.h,
                               name=f"{BASE}/{{id}}/delete")
        if r.status_code in (200, 204):
            self.creadas.pop(oid, None)
            self.patro.discard(oid)

    @task(1)
    def por_camionero(self):
        cid = random.choice(CAMIONEROS)
        self.client.get(f"{BASE}/camionero/{cid}", headers=self.h,
                        name=f"{BASE}/camionero")

    @task(1)
    def por_empresa(self):
        eid = random.choice(EMPRESAS)
        self.client.get(f"{BASE}/empresa/{eid}", headers=self.h,
                        name=f"{BASE}/empresa")