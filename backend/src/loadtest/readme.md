# Pruebas de carga con Locust

Este proyecto contiene varios scripts para realizar pruebas de carga sobre los diferentes endpoints del backend de Camyo usando **Locust**.

## Estructura de los scripts

Los archivos están organizados por entidad o módulo:

- `locustfile_suscripcion.py` — pruebas sobre endpoints de suscripciones.
- `locustfile_oferta.py` — pruebas sobre ofertas (listar, aplicar, desaplicar, etc.)
- `locustfile_pago.py` — simulación de pagos por Stripe.
- `locustfile_empresa.py` — pruebas sobre empresas.
- `locustfile_camionero.py` — pruebas sobre camioneros.
- `locustfile_resena.py` — pruebas sobre reseñas.

## Requisitos

- Python 3.8+
- `locust`

Instalación de dependencias:

```bash
pip install locust
```

## Uso

Puedes ejecutar cualquier archivo usando el siguiente comando:


```bash
cd backend
cd src
cd loadtest


```bash
locust -f locustfile_<modulo>.py --host=http://localhost:8080
```

Ejemplo para suscripciones:

```bash
locust -f locustfile_suscripcion.py --host=http://localhost:8080
```

Luego abre tu navegador en:

```
http://localhost:8089
```

Ahí podrás configurar el número de usuarios concurrentes y la tasa de generación de peticiones.

## Recomendaciones

- Asegúrate de que tu backend esté corriendo en `localhost:8080`.
- Personaliza los IDs aleatorios en cada archivo según tus datos.
- Usa perfiles de datos realistas en tu base de datos para tener resultados más significativos.

---

Para más información sobre Locust: https://docs.locust.io/en/stable/

