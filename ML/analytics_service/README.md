# Analytics Service (FastAPI)

Separate ML analytics server for supply chain insights.

## Run

```bash
cd ML
pip install -r requirements.txt
uvicorn analytics_service.main:app --host 0.0.0.0 --port 8001 --reload
```

## Dataset

By default it auto-detects:
- `ML/pharma_supply_chain_risk.csv`
- `ML/pharma_supply_chain_risk_data.csv`

Or set custom path:

```bash
set DATASET_PATH=C:\path\to\your\dataset.csv
```

## Endpoints

- `GET /health`
- `POST /reload`
- `GET /analytics/overview`
- `GET /analytics/single-point-of-failure?limit=20`
- `GET /analytics/geographic-concentration?top_n=10`
- `GET /analytics/supplier-reliability?limit=20`
- `GET /analytics/demand-supply-mismatch?limit=20`
