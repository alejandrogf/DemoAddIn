'use strict';

//Es un tipo de namespace, para encapsular, como si fuese una clase.
//Así tienes esta clase privada y al finalizar defines un pbjeto publico para devolver la información
//Coincide que se llama como la lista, pero no tiene porqué ser igual.
var Minions = Window.Minions || {};

//Es un tipo de "clase" donde todo es privado, menos lo que indiques como publico
Minions.App = function () {
    //Todo lo que esté aquí será privado para cualquiera de fuera
    var personasList;
    var personas;
    var context;

    var initial = function () {
        //Primero se accede al contexto, se recupera el contexto actual
        context = SP.ClientContext.get_current();
        //Así en la primera ejecución se ejecuta también la llamada, por si se tienen datos almacenados
        getAllPersonas();
    };

    var getAllPersonas = function () {
        //Accedes al contexto->a la aplicación web->todas las listas->la que se llama XXXX
        //Si buscas por nombre, tiene que coincidir con la que hemos definido
        personasList = context.get_web().get_lists().getByTitle("Personas");
        //Necesito los items de la lista
        personas = personasList.getItems(new SP.CamlQuery());
        //No haces la busqueda, cno esto lo que haces es cargar la búsqueda para la siguiente
        //vez que se conecta al servidor.
        context.load(personas);
        //Siempre lleva las dos funciones, una de success y otra de fail. Solo puede ser asincrona
        context.executeQueryAsync(onPersonasSuccess, onPersonasFail);
    };
    //Args son los argumentos que se van a usar en la función
    //El que genera la llamada a la función, en este caso getAllPersonas
    var onPersonasSuccess = function (sender, args) {
        var html = "<ul>";
        //La enumeración de todos los items. en c# se haria con un foreach.
        //Pero como aquí no hay, lo hacemos con un enumerador que nos permite movernos por él
        var personasEnum = personas.getEnumerator();
        while (personasEnum.moveNext()) {
            var actual = personasEnum.get_current();
            html += "<li>" + actual.get_item("Nombre") + "" + actual.get_item("Edad") + "</li>";
        }
        html += "</ul>";
        //En el html del default.aspx indicas donde quieres añadirlo, en este caso
        //en el div que tiene el id "lista".
        $("#lista").html(html);
    };
    var onPersonasFail = function (sender, args) {
        alert("Maldición! Tus minions han desaparecido!" + args.get_message());
    };


    var crearPersona = function () {
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var actual = personasList.addItem(itemCreateInfo);
        //$XXX es el nombre del campo definido en el html, y obtienes su valor.
        actual.set_item("Nombre", $("#input-nombre").val());
        actual.set_item("Edad", $("#input-edad").val());
        actual.update;
        context.load(actual);
        //Reutilizo la función para el error. Pero se puede usar una específica
        //para cada vez que se llama
        context.executeQueryAsync(onCreateSuccess, onPersonasFail);
    };
    var onCreateSuccess = function (sender, args) {
        getAllPersonas;
    };
 
    //Para que sean públicas uso lo siguiente para indicar que el resultado es público.
    //Todo lo que no esté en el return NO será público.
    //La llamada será Minions.App.getPersonas//Minions.App.init//Minions.App.createPersona
    return {
        getPersonas: getAllPersonas,
        createPersona: crearPersona,
        initial: initial
    };
};

$(document).ready(function () {
    $("btnAdd").bind("click", Minions.App.createPersona);
    ExecuteOrDelayUntilScriptLoaded(Minions.App.initial, "sp.js");
});