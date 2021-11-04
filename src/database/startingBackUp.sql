CREATE TABLE skater(
    id SERIAL,
    email VARCHAR(50),
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    password VARCHAR(100) NOT NULL,
	created_on TIMESTAMP NOT NULL,
    anos_experiencia INT NOT NULL,
    especialidad VARCHAR(50) NOT NULL,
    puntaje FLOAT,
    foto VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL,
    PRIMARY KEY (email)
);
/* Creditos a https://www.postgresqltutorial.com/postgresql-create-table/ */
CREATE TABLE account (
	user_id serial PRIMARY KEY,
	nombre VARCHAR ( 50 ) UNIQUE NOT NULL,
    apellido VARCHAR ( 50 ) UNIQUE NOT NULL,
	password VARCHAR ( 100 ) NOT NULL,
	email VARCHAR ( 255 ) UNIQUE NOT NULL,
	created_on TIMESTAMP NOT NULL,
        last_login TIMESTAMP 
);
CREATE TABLE rol(
   role_id serial PRIMARY KEY,
   role_name VARCHAR (255) UNIQUE NOT NULL
);
CREATE TABLE account_rol (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  grant_date TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (role_id)
      REFERENCES rol (role_id),
  FOREIGN KEY (user_id)
      REFERENCES account (user_id)
);