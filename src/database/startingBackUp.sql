CREATE TABLE skater(
    id SERIAL,
    email VARCHAR(50),
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    password VARCHAR(25) NOT NULL,
    anos_experiencia INT NOT NULL,
    especialidad VARCHAR(50) NOT NULL,
    puntaje SMALLINT,
    foto VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL,
    PRIMARY KEY (email)
);