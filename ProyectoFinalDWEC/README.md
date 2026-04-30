La aplicación contara con una pantalla principal la cual al hacer click en cualquier parte nos llevara a la pagina del calendario , donde podremos iniciar sesión , reservar citas, modificarlas o eliminarlas si somos pacientes y si somos medicos podemos ver una lista con las consultas que tenemos en el dia al hacer click en una hora libre o en el borde de donde se tenga una cita y si hacemos click en la cita como los pacientes nos saldra la misma pantalla con la posibilidad de poder modificar el estado de la cita.


3 clases : 
Medico --> id_med , nombre ,apellidos , especialidad , telefono, dni_medico.
Cita_medica --> id_cita ,fecha_cita, hora_cita, id_med , DNI_paciente.  
Paciente --> DNI, nombre , apellidos.

Los datos se almacenaran en un .JSON donde tendremos 3 para simular una "base de datos", tambien contaremos con un localStorage.
 
Medicos.JSON 
Citas.JSON
Pacientes.JSON

/* 
   El unico problema que tengo en si es que a la hora de guardar las horas en el .json al utilizar toLocaleString se me guarda con la hora que tenga el dispositivo la cual es 
   dos horas adelantado en comparación a la hora del meridiano y automaticamente se regula y se me guarda en el .json como si fuera la hora del meridiano pero en la pagina web
   a la hora de verlo me sale normal
*/

COSAS TERMINADAS :

¡IMPORTANTE! La unica manera que he visto de poder hacer que haya dos citas el mismo dia (Sin que sea el mismo medico ni el mismo paciente) es modificando una cita que hemos creado.

¡COSA A TENER EN CUENTA! se que si vas al seguro puedes tener más de una cita el mismo dia pero si es de algo diferente o con medico diferente , si vas a ver a tu medico de 
cabecera solo podrias ir una vez , si vas a la cita con tu medico de cabecera y depues a hacerte ( una radiografia , una cura , una extracción de sangre ...) si podrias
pero en mi proyecto de momento vamos a suponer que los medicos que tenemos son de cabecera todos (aunque tengan su especialidad).

- Creacción de todas las clases que necesitamos (Medicos,Pacientes,Cita,GestionaCitas...).
- Creacción de todas las paginas html.
- Implementación de la API fullCalendar.
- Creacción del diseño de las paginas con css. 
- Creacción de la ventana auxiliar con modales desde JS.
- Creación de elementos del arbol DOM.
- Identidad Corporativa de la junta de andalucía y del hospital de antequera.
- Creacción de los archivos .json.
- Llamadas a los .json haciendo una promesa a todos y llamandolos por fetch. 
- Lectura del json de citas.
- Añadir citas al json.
- Borrar citas del json.
- Al modificar la cita en el modal que se actualice tambien en el json.
- Creacción de localStorage.
- Al modificar solo nos deja tramos de cada 15 min ( :00 , :15 , :30 , :45).
- Al modificar podemos tener mas de una cita el mismo dia pero si el medico no es el mismo en las dos citas y si el paciente no tiene ya una cita ese dia.
- Al modificar una cita depues de cambiarle el dia o la fecha que nos siga dejando poder pinchar en ella para editarla.
- Detecta si es medico o paciente al loogearse.
- Si te logueas como medico tienes la posibilidad de dando click en cualquier hueco del dia te sale un alert con una lista de las consultas que tienes ese dia.
- Creacción de un modal para ver las agendas de los medicos con las citas que tengna en el dia.

EVENTOS : 
  - click : Por ejemplo al loogearse , al clickar sobre una cita , al hacer alguna acción sobre el modal de la cita para modificarlo.
  - mouseover y mouseout : Al pasar el raton por encima de las citas cambia a un color aleatorio y cuando sales vuelve a su color.
  - keyup : Al darle y soltar la tecla " Enter " el color de la barra y el color de la línea se cambia aleatoriamente y al resfrescar la pagina vuelve a su color.
  - focus y blur : Cuando pones el foco encima del campo contraseña para loogearte te sale un mensaje de ayuda abajo recordandote que la contraseña es el dni y cuando le quitas el foco desaparece. 

  FLUJO DE LA APP 

  Ventana de Inicio, darle click donde sea para que te salga la ventana principal con el calendario.

  Una vez estes en el calendario , te saldra vacio ya que una vez que inicies sesión ya sea como medico o como paciente , te saldra las citas que tengas.

  Si eres paciente tienes la posibilidad de poder hacer click en la franga horaria que deses y poder reservar una cita , en el caso de que quieras modificarla puedes volver a
  darle click y te saldra una ventana emerjente (Modal) para que puedas hacer tres opciones , te sale infromacion de la cita : Nombre paciente , Nombre medico ,hora de inicio
  y hora de finalización . Las tres opciones que tienes es poder modificarla ya sea hora o dia , poder eliminar la cita o salir para atras y no hacer nada.

  Si entras como Medico te saldra el calendario pero con las consultas que tengas ese dia si haces click en alguna hora que tengas libre o si no tienes en el borde de las casillas donde se ve las citas te saldra otra ventana emerjete (Modal) para que puedas ver la lista de las consultas que tienes en forma de lista de forma ordenada por hora 
  de más temprano a más tarde y si le damos click directamente a la cita que tenemos nos sale lo mismo que el modal del paciente solo que al darle a modificar solo podremos cambiar el estado de la cita por ( realizada / no realizada).
