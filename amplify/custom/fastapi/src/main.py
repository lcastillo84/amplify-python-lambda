from fastapi import FastAPI

app = FastAPI()


@app.get("/celldata")
def read_celldata(event, context):
    return {"event":event, "context": context, "ruta": "/celldata"}

@app.get("/")
def read_root(event, context):
    return {"event":event, "context": context, "ruta": "/"}