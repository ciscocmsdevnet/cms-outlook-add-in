
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=9443, log_level="info", ssl_keyfile="certs/key.pem", ssl_certfile="certs/cert.pem")
