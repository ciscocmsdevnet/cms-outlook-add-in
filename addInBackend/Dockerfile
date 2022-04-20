FROM python:3.8.12-slim-buster

WORKDIR /code

RUN mkdir /certs

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9443", "--ssl-keyfile=/certs/certificate.key", "--ssl-certfile=/certs/certificate.cer"]
