/* Creado por Adib Abud Jaso el 07/07/16. */
$(function() {
    //Configuración de diálogo jQuery UI (Se usa para mensaje de calificacion e informativos)
    var uiDialogo = $("#dialog");
    uiDialogo.dialog({
        title:"Mensaje",
        modal:true,
        show:"slideDown",
        hide:"slideUp",
        autoOpen:false,
        buttons: [
            {
                text: "Aceptar",
                icons: {
                    primary: "ui-icon-check"
                },
                click: function() {
                    $(this).dialog( "close" );
                }
            }
        ]
    });
    /*
    Agrega el comportamiento para arrastrarse y colocarse.
    */
    var ATRIBUTO_COLOCADO = "objColocado";
    $(".draggable").draggable({
        revert : function(event, ui) {
            //La propiedad originalPosition se usa para regresar
            //el draggable a su punto original cuando no es arrastrado 
            //a algún droppable que lo acepte.
            $(this).data("uiDraggable").originalPosition = {
                top : 0,
                left : 0
            };
            //Asigna el dropable a una propiedad del draggable para posterior revisión (false si no hay droppable)
            $(this).data(ATRIBUTO_COLOCADO, event);
            //console.log("evento", event);
            return !event;//event regresa falso si no hay droppable event
        },
        stack: ".draggable"//poner z-index automático
    });
    $(".droppable").droppable({
        hoverClass: "ui-droppable-hover",//Tuve que cambiar la clase por defecto (ui-state-hover) por el bug de firefox
        drop: function( event, ui ) {
            //Cambiar opciones de algún elemento de jQuery UI
            //$(this).droppable("option", "disabled", false);
            //console.log(ui.draggable, $(this));
            
            //Cambia las classes CSS
            var $this = $(this);
            $(".highlight").removeClass("highlight");
            $this.addClass("highlight");

            //Ajusta el ancho
            $this.width(ui.draggable.width());
            //Ajusta y anima la posición al centro
            ui.draggable.position({
                my: "center",
                at: "center",
                of: $this,
                using: function(pos) {
                  $(this).animate(pos, "fast", "linear", function(){actualizarPosiciones();});
                }
            });

        },
        accept: function(dropElem) {//Si el droppable ya está ocupado, no lo acepta
            //Obtiene dragables
            var lstDraggables = $(".draggable");
            //De ellos extrae los que están colocados (ATRIBUTO_COLOCADO);
            var lstOcupados = lstDraggables.map(function(i, elemento){
                return $(elemento).data(ATRIBUTO_COLOCADO);
            });
            //Convierte en arreglo
            var arrOcupados = [];
            lstOcupados.each(function(i, ocupado){
                arrOcupados.push(ocupado);
            });
            //Revisa en el arreglo si en ellos está el destino y acepta si no está
            var self = $(this);
            var resultado = arrOcupados.some(function(elemento){
                return elemento[0] === self[0];
            });
            return !resultado;
        }
    });
    /*
    Calificar 
    */
    $("button#btnRevisar").button().click(function(event) {
        event.preventDefault();
        //Guarda todas las propiedades de los draggable en un arreglo para revisar si todas han sido asignadas
        var arrContestado = [];
        var lstDraggables = $(".draggable");
        lstDraggables.each(function(i, element){
            arrContestado.push($(element).data(ATRIBUTO_COLOCADO));
        });
        var bolHaTerminado = arrContestado.every(function(elemento){
            return elemento;
        });
        //Si se  han colocado todos los draggables, se procede a mostrar correctas e incorrectas y la calificación
        if(bolHaTerminado){
            var intContadorBuenas = 0;
            lstDraggables.each(function(i, element){
                //busca el lugar donde debió colocarse y en lugar dónde se colocó.
                var strCorrecta = $(element).data("respuesta");
                var strContestado = $(element).data(ATRIBUTO_COLOCADO).data("respuesta");
                //Si es correcta, se contabiliza y asigna clase de correcta
                if(strContestado === strCorrecta){
                    $(element).addClass("bien");
                    $(element).removeClass("mal");
                    intContadorBuenas++;
                } else {//sino, se asigna clase de incorrecta
                    $(element).addClass("mal");
                }
            });
            uiDialogo.text("Obtuviste " + intContadorBuenas + " de " + arrContestado.length + ".").dialog( "option", "title", "Mensaje" ).dialog("open");
            //CREDITARIA_EXTRAS.popUpRetro.mostrar("Obtuviste " + intContadorBuenas + " de " + arrContestado.length + ".");
            verRespuestas(true);
        } else{//Sino se informa al usuario que debe terminar
            //CREDITARIA_EXTRAS.popUpRetro.mostrar("Por favor, arrastra todas las respuestas a los recuadros.");
            uiDialogo.text("Por favor, arrastra todas las respuestas a los recuadros.").dialog( "option", "title", "Alerta" ).dialog("open");
        }
    });
    //Reiniciar todas las propiedades y atributos
    $("button#btnReiniciar").button().click(function(){
        var lstDraggables = $(".draggable");
        verRespuestas(false);
        lstDraggables.removeClass("bien");
        lstDraggables.removeClass("mal");
        lstDraggables.each(function(i, element){
            $(element).data(ATRIBUTO_COLOCADO, false);
            $(element).css({
                'left': 0,
                'top': 0
            })
        })
    });
    //Función para actualizar la posición de los objetos ya colocados
    function actualizarPosiciones(){
        var lstDraggables = $(".draggable");
        lstDraggables.each(function(i, elemento){
            var objAbajo = $(elemento).data(ATRIBUTO_COLOCADO);
            if(objAbajo !== undefined && objAbajo !== false){
                /*//Ajusta el ancho
                var numAnchuraAmbos = $(elemento).width();
                $(elemento).width(numAnchuraAmbos);
                objAbajo.width(numAnchuraAmbos);*/
                //Ajusta la posición
                $(elemento).position({
                    my: "center",
                    at: "center",
                    of: objAbajo
                });
            }
        });

    }
    $(window).resize(actualizarPosiciones);


    //Revolver arrastrables
    var revolverLista = (function () {
        function randomInt(maxNum) { //returns a random integer from 0 to maxNum-1
            return Math.floor(Math.random() * maxNum);
        }
        return function shuffleList(selectorPadre, selectorHijos) {
            var origList = $(selectorHijos).detach();
            var newList = origList.clone();

            for (var i = 0; i < newList.length; i++) {
                //select a random index; the number range will decrease by 1 on each iteration
                var randomIndex = randomInt(newList.length - i);

                //place the randomly-chosen element into our copy and remove from the original:
                newList[i] = origList.splice(randomIndex, 1);

                //place the element back into into the HTML
                $(selectorPadre).append(newList[i]);
            }
        }
    })();
    revolverLista("div.preguntas","div.preguntas > .draggable");

    function verRespuestas(estado){
        if(estado){
            $("div.draggable.mal").each(function(i, boton){
                var palabras = $(boton).data(ATRIBUTO_COLOCADO).data("respuesta");
                $(boton).append("<div class='retroIndividualFinal'>"+palabras+"</div>")
            });
        } else {
            $("div.draggable.mal").each(function(i, boton){
                //console.log(i, boton);
                $(boton).children(".retroIndividualFinal").remove();
            });
        }

    }


});
