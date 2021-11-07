# Examen de salida Bootcamp FullStack JavaScript
![javascript](https://img.shields.io/badge/JavaScript-323330?style=plastic&logo=javascript&logoColor=F7DF1E)
![nodejs](https://img.shields.io/badge/Node.js-339933?style=plastic&logo=nodedotjs&logoColor=white)
![expressjs](https://img.shields.io/badge/Express.js-000000?style=plastic&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Express.js-000000?style=plastic&logo=jsonwebtokens&logoColor=white)
![postgresql](https://img.shields.io/badge/PostgreSQL-0000bb?style=plastic&logo=postgresql&logoColor=white)
![handlebars](https://img.shields.io/badge/Handlebars-bb0000.svg?style=plastic&logo=Handlebars.js&logoColor=white)

## 👩‍💻 Prueba final
- Autor: *Mario Flores C.*
- dependencias FrontEnd: [bootstrap,axios]
- dependencias Backend:
  - despliegue
  >[express, pg, express-fileupload, express-handlebars, bcrypt, dotenv]
  - desarrollo
  >[nodemon, morgan]
- Tecnologías:
  - NodeJS
  - PostgreSQL
- Práctica aplicada:
  - Variables
    - SQL lenguaje -> snake_case
    - JavaScript lenguaje -> camel_case
  - Comentarios
    - Comentarios simples [//] -> Inglés
    - Comentarios complejos [/**/] -> Español
  - Conexión a ddbb
    - Uso de singleton

## 🚀 Presentación del caso

La Municipalidad de Santiago, ha organizado una competencia de Skate para impulsar el
nivel deportivo de los jóvenes que desean representar a Chile en los X Games del próximo
año, y han iniciado con la gestión para desarrollar la plataforma web en la que los
participantes se podrán registrar y revisar el estado de su solicitud.

### Requerimientos:

Inicialmente se deben cumplir las siguiente indicaciones
- El sistema debe permitir registrar nuevos participantes.
- Se debe crear una vista para que los participantes puedan iniciar sesión con su correo y contraseña.
- Luego de iniciar la sesión, los participantes deberán poder modificar sus datos, exceptuando el correo electrónico y su foto. Esta vista debe estar protegida con JWT y los datos que se utilicen en la plantilla deben ser extraídos del token.
- La vista correspondiente a la ruta raíz debe mostrar todos los participantes registrados y su estado de revisión.
- La vista del administrador debe mostrar los participantes registrados y permitir aprobarlos para cambiar su estado.

En cuanto a los requerimientos específicos, la aplicación web debe cumplir con:
1. Crear una API REST con el Framework Express.
2. Servir contenido dinámico con express-handlebars.
3. Ofrecer la funcionalidad Upload File con express-fileupload.
4. Implementar seguridad y restricción de recursos o contenido con JWT.

## 💻 Instrucciones de uso
1. Se debe de habilitar un archivo en la raiz de nombre ".env", dentro se debe ingresar la siguiente información:
```bash
#Configuración de la base de datos
DB_HOST={host de la DDBB (en nuestro caso sería: localhost)}
DB_PORT={puerto de la DDBB (en nuestro caso sería: 5432)}
DB_USER={usuario con el cual se conectará a la DDBB}
DB_PASS={contraseña del usuario registrado anteriormente}
DB_NAME={Nombre de la DDBB}
#Configuración información del administrador
ADMIN_NAME={Nombre del administrador}
ADMIN_LASTNAME={Apellido del administrador}
ADMIN_PASS={Contraseña del administrador}
ADMIN_EMAIL={Email con el cual accederá el administrador}
#Configuración información del colaborador
COLAB_NAME={Nombre del colaborador}
COLAB_LASTNAME={Apellido del colaborador}
COLAB_PASS={Contraseña del colaborador}
COLAB_EMAIL={Email con el cual accederá el colaborador}
#Configuración adicional
SALT_ROUNDS={Cantidad de rounds para la semilla del Hash}
APP_STATE={Estado de la App} #Estados posibles [dev,prod]
```
>Nota: la información se registra de forma literal a continuación del signo "=", es decir, no se debe declarar el "tipo" de dato, utilizar el archivo adjunto a modo de ejemplo.

1. Iniciar el paquete de modulos de node, a modo de descargar las dependencias.
2. Iniciar el servidor con el comando personalizado "npm run dev".
3. Una vez creada la ddbb y configurado el archivo ".env", las tablas y usuarios internos (administrador & colaborador) se generan de forma automática al iniciar el servidor y con el btn "Crear tablas" disponible en el dashboard exclusivo del administrador.
4. Terminadas las pruebas, se puede limpiar la ddbb por medio del btn "Eliminar tablas" disponible en el dashboard del administrador.


##  Consideraciones
>El Administrador posee el rol que le autoriza acceder a las funcionalidades de:
>- Acceso a home, ingresar, listar postulantes, *intranet* y cerrar sesion.
>- Siempre visualizar tanto a los skaters "aprobados" como a los "en revisión".
>- Evaluar usuarios/skaters por medio del dashboard interno. 
>- Eliminar usuarios/skaters por medio del dashboard interno.
>- Acceso a un *dashboard exclusivo* que le permite:
>>- Crear las tablas.
>>- Crear nuevos usuarios/skaters (por medio del consumo de RandomUser).
>>- Habilitar al colaborador para poder evaluar a los usuarios/skaters registrados.
>>- Eliminar las tablas.
---
>El Colaborador ***habilitado*** posee el rol que le autoriza acceder a las funcionalidades de:
>- Acceso a home, ingresar, listar postulantes y cerrar sesion.
>- Siempre visualizar tanto a los skaters "aprobados" como a los "en revisión".
>- Evaluar usuarios/skaters por medio del dashboard interno. 
>- Eliminar usuarios/skaters por medio del dashboard interno.
>
>El colaborador **NO** *habilitado* posee el rol que le autoriza acceder a las funcionalidades de:
>- Acceso a home, ingresar, listar postulantes y cerrar sesion.
>- Siempre visualizar tanto a los skaters "aprobados" como a los "en revisión".
---
>Los usuarios/skaters registrados poseen la autorización para acceder a las funcionalidades de:
>- Acceso a home, ingresar, editar cuenta y cerrar sesion.
>- Visualizar en home tanto a los skaters "aprobados" como a los "en revisión".
>- Editar información personal de su cuenta, a excepción de su email e imagen.
>- Eliminar su cuenta.
---
>Los usuarios no registrados tendrán acceso a las funcionalidades de:
>- Acceso a home, registrarse e ingresar.
>- Visualizar en inicio únicamente a los usuarios/skater "aprobados" una vez hayan sido "evaluados".