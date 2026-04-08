<?php
// Permitir peticiones desde tu frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Recibir el cuerpo de la petición 
$jsonRecibido = file_get_contents('php://input');

if ($jsonRecibido) {
    // Guardar físicamente en el archivo citas.json
    // FILE_USE_INCLUDE_PATH ayuda a encontrarlo en la misma carpeta
    if (file_put_contents('citas.json', $jsonRecibido)) {
        echo json_encode(["status" => "success", "message" => "Archivo actualizado"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se pudo escribir en el archivo"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos"]);
}
?>
