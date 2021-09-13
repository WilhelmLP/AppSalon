let pagina = 1;

const cita = {
  nombre: "",
  fecha: "",
  hora: "",
  servicios: [],
};

document.addEventListener("DOMContentLoaded", function () {
  iniciarApp();
});

/* Aqui ejecuto mis funciones en una función que ejectuo hacia la funcion anterior donde hago selección del DOM */
function iniciarApp() {
  mostrarServicios();
  mostrarSeccion(); //Resalta el div actual segun el tab al que se presiona
  cambiarSeccion(); //Oculta o muestra segun el tab al que se presiona
  paginaSiguiente(); //Recorre a la paginacion siguiente anterior
  paginaAnterior(); //Recorre a la paginacion siguiente siguiente
  botonesPaginador(); //Comprueba la pagina actual para ocultar o mostrar la paginación
  mostrarResumen(); //Muestra el resumen de la cita (o mensaje de error en caso de no pasar la validación)
  nombreCita(); //Almacena el nombre de la cita en el objeto
  fechaCita();//Almacena la fecha de la cita en el objeto
  deshabilitarFechaAnterior(); //Desabilita la fecha del formilario de fecha 
  horaCita(); //Almacena la hora de la cita en el objeto
}

function mostrarSeccion() {
  //Eliminar mostrar-seccion de la seccion anterior
  const seccionAnterior = document.querySelector(".mostrar-seccion");
  if (seccionAnterior) {
    seccionAnterior.classList.remove("mostrar-seccion");
  }

  const seccionActual = document.querySelector(`#paso-${pagina}`);
  seccionActual.classList.add("mostrar-seccion");

  //Eliminar la clase de actual en el tab anterior
  const tabAnterior = document.querySelector(".tabs .actual");
  if (tabAnterior) {
    tabAnterior.classList.remove("actual");
  }

  //Resalta el tab actual
  const tab = document.querySelector(`[data-paso="${pagina}"]`);
  tab.classList.add("actual");
}

function cambiarSeccion() {
  const enlaces = document.querySelectorAll(".tabs button");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      pagina = parseInt(e.target.dataset.paso);

      //Llamar la función de mostrar sección
      mostrarSeccion();
      botonesPaginador();
    });
  });
}

//Para hacer peticiones de una API se utiliza un async/await
async function mostrarServicios() {
  try {
    const resultado = await fetch("./servicios.json");
    const db = await resultado.json();
    //Desestructuración del json
    const { servicios } = db;

    //Generar el HTML
    servicios.forEach((servicio) => {
      const { id, nombre, precio } = servicio;

      //DOM Scripting
      const nombreServicio = document.createElement("P");
      nombreServicio.textContent = nombre;
      nombreServicio.classList.add("nombre-servicio");

      const precioServicio = document.createElement("P");
      precioServicio.textContent = `$ ${precio}`;
      precioServicio.classList.add("precio-servicio");

      //Genera el div como elemento de html
      const servicioDiv = document.createElement("DIV");
      servicioDiv.classList.add("servicio");
      servicioDiv.dataset.idServicio = id;

      //Seleccion de cita con efecto hover estatico y dando click
      servicioDiv.onclick = seleccionarServicio; //Seleccionar Servicio es una funcion que se declara despues

      //Agregar precio y servicio al div de servicio creado con DOM
      servicioDiv.appendChild(nombreServicio);
      servicioDiv.appendChild(precioServicio);

      //Agregar todo lo creado con el DOM al HTML por su id
      document.querySelector("#servicios").appendChild(servicioDiv);
    });
  } catch (error) {
    console.log(error);
  }
}

function seleccionarServicio(e) {
  let elemento;

  //Forzar que el elemento al que se le da click sea el div
  if (e.target.tagName === "P") {
    elemento = e.target.parentElement;
  } else {
    elemento = e.target;
  }

  console.log(elemento.dataset.idServicio);

  //Verificar si un elemento de clase esta, hay que agregarlo o removerlo
  if (elemento.classList.contains("seleccionado")) {
    elemento.classList.remove("seleccionado");

    const id = parseInt(elemento.dataset.idServicio);

    eliminarServicio(id);
  } else {
    elemento.classList.add("seleccionado");

    const servicioObj = {
      id: parseInt(elemento.dataset.idServicio),
      nombre: elemento.firstElementChild.textContent,
      precio: elemento.firstElementChild.nextElementSibling.textContent,
    };

    agregarServicio(servicioObj);
  }
}

function eliminarServicio(id) {
  const { servicios } = cita;
  cita.servicios = servicios.filter((servicio) => servicio.id !== id);
  console.log(cita);
}

function agregarServicio(servicioObj) {
  const { servicios } = cita;
  cita.servicios = [...servicios, servicioObj];
  console.log(cita);
}

function paginaSiguiente() {
  const paginaSiguiente = document.querySelector("#siguiente");
  paginaSiguiente.addEventListener("click", () => {
    pagina++;
    console.log(pagina);
    botonesPaginador();
  });
}

function paginaAnterior() {
  const paginaAnterior = document.querySelector("#anterior");
  paginaAnterior.addEventListener("click", () => {
    pagina--;
    console.log(pagina);
    botonesPaginador();
  });
}

function botonesPaginador() {
  const paginaSiguiente = document.querySelector("#siguiente");
  const paginaAnterior = document.querySelector("#anterior");

  if (pagina === 1) {
    paginaAnterior.classList.add("ocultar");
  } else if (pagina === 3) {
    paginaSiguiente.classList.add("ocultar");
    paginaAnterior.classList.remove("ocultar");

    mostrarResumen(); //Estamos en la pagina 3, carga el resumen de la cita
  } else {
    paginaAnterior.classList.remove("ocultar");
    paginaSiguiente.classList.remove("ocultar");
  }

  mostrarSeccion(); //Cambia la seccion a mostar
}

function mostrarResumen() {
  //Desestructuración
  const { nombre, fecha, hora, servicios } = cita;
  const resumenDiv = document.querySelector(".contenido-resumen"); //Seleccionar el resumen

  //Limpia el HTML
  while(resumenDiv.firstChild){
    resumenDiv.removeChild(resumenDiv.firstChild);
  }

  //Validación
  if (Object.values(cita).includes("")) {
    const noServicios = document.createElement("P");
    noServicios.textContent = "Faltan datos de Servicios: hora, fecha o nombre";
    noServicios.classList.add("invalidar-cita");

    //Agregar a un resumenDiv
    resumenDiv.appendChild(noServicios);
    return;
  } 

  const headingCita = document.createElement('H3');
  headingCita.textContent = 'Resumen de Cita';

  //Mostrar el Resumen
  const nombreCita = document.createElement('P');
  nombreCita.innerHTML = `<span>Nombre:</span>${nombre}`;

  const fechaCita = document.createElement('P');
  nombreCita.innerHTML = `<span>Fecha:</span>${fecha}`;

  const horaCita = document.createElement('P');
  nombreCita.innerHTML = `<span>Hora:</span>${hora}`;

  const serviciosCita = document.createElement('DIV');
  serviciosCita.classList.add('resumen-servicios');

  const headingServicios = document.createElement('H3');
  headingServicios.textContent = 'Resumen de Servicios';

  serviciosCita.appendChild(headingServicios);


  let cantidad = 0; //Debe de ir por fuera para que no itere en cada servicio del forEach

  //Iterar sobre el arreglo de servicios
  servicios.forEach( servicio => {

    const { nombre, precio } = servicio;
    const contenedorServicio = document.createElement('DIV');
    contenedorServicio.classList.add('contenedor-servicio');

    const textoServicio = document.createElement('P');
    textoServicio.textContent = nombre;

    const precioServicio = document.createElement('P');
    precioServicio.textContent =  precio;
    precioServicio.classList.add('precio');

    //Suma de los Servicios
    const totalServicio = precio.split('$');
    cantidad += parseInt(totalServicio[1].trim());

    //Colocar texto y precio en el DIV
    contenedorServicio.appendChild(textoServicio);
    contenedorServicio.appendChild(precioServicio);

    serviciosCita.appendChild(contenedorServicio);
  });

  resumenDiv.appendChild(headingCita);
  resumenDiv.appendChild(nombreCita);
  resumenDiv.appendChild(fechaCita);
  resumenDiv.appendChild(horaCita);

  resumenDiv.appendChild(serviciosCita);

  const cantidadPagar = document.createElement('P');
  cantidadPagar.classList.add('total');
  cantidadPagar.innerHTML = `<span>Total a pagar:</span>$ ${cantidad}`;
  resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
  const nombreInput = document.querySelector("#nombre");
  nombreInput.addEventListener("input", (e) => {
    const nombreTexto = e.target.value.trim();

    //Validación de que nombre texto debe tener algo
    if (nombreTexto === "" || nombreTexto.length < 3) {

      mostarAlerta('El mensaje no es valido', 'error');

    } else {
      const alerta = document.querySelector('.alerta');
      if(alerta){
        alerta.remove();
      }
      cita.nombre = nombreTexto;
    }
  });
}

function mostarAlerta(mensaje, tipo){
  
  //Si hay una alerta previa, no crear otra
  const alertaPrevia = document.querySelector('.alerta');
  if(alertaPrevia){
    return;
  }

  const alerta = document.createElement('DIV');
  alerta.textContent = mensaje;
  alerta.classList.add('alerta')

  if(tipo === 'error'){
    alerta.classList.add('error');
  }

  //Incertando alerta en el HTML
  const formulario = document.querySelector('.formulario');
  formulario.appendChild(alerta);

  //Eliminar alerta despues de 3 segundos
  setTimeout(() =>{
    alerta.remove();
  }, 3000);
}

function fechaCita(){
  const fechaInput = document.querySelector('#fecha');
  fechaInput.addEventListener('input', e =>{
    const dia = new Date(e.target.value).getUTCDate();

    if([0, 6].includes(dia)){
      e.preventDefault();
      fechaInput.value = '';
      mostarAlerta('Fines de semana no validos', 'error');
    }else{
      cita.fecha = fechaInput.value;
      console.log(cita);
    }
    
  });
}

function deshabilitarFechaAnterior(){
  const inputFecha = document.querySelector('#fecha');

  const fechaAhora = new Date();
  const year = fechaAhora.getFullYear();
  const mes = fechaAhora.getMonth() + 1;
  const dia = fechaAhora.getDate() + 1;

  //Formato deseado: AAAA-MM-DD
  const fechaDeshabilitar = `${year}-${mes}-${dia}`;
  inputFecha.min = fechaDeshabilitar;
}

function horaCita(){
  const inputHora = document.querySelector('#hora');
  inputHora.addEventListener('input', e => {
    const horaCita = e.target.value;
    const hora = horaCita.split(':')

    if(hora[0] < 10 || hora[0] > 18){
      mostarAlerta('Hora no válida', 'error');
      setTimeout(()=>{
        inputHora.value = '';
      }, 3000);
      
    } else {
      cita.hora = horaCita;
    }

  })
}