<?php
// Cabeceras para permitir la comunicación con el Frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Manejo de peticiones preflight (OPTIONS) para evitar errores de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Definir la ruta absoluta al archivo citas.json
// __DIR__ asegura que busque el archivo en la misma carpeta que este PHP
$archivoDestino = __DIR__ . '/Citas.json';

//Obtener los datos enviados desde el JS
$jsonRecibido = file_get_contents('php://input');

// Validaciones
if (!$jsonRecibido) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos (Cuerpo vacío)"]);
    exit;
}

// Verificar si el JSON es válido antes de guardar
$datosDecodificados = json_decode($jsonRecibido);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["status" => "error", "message" => "El JSON recibido no es válido"]);
    exit;
}

// Intento de escritura
// Usamos LOCK_EX para evitar que dos personas escriban al mismo tiempo y corrompan el archivo
if (file_put_contents($archivoDestino, $jsonRecibido, LOCK_EX) !== false) {
    echo json_encode([
        "status" => "success", 
        "message" => "Citas guardadas correctamente",
        "bytes_escritos" => strlen($jsonRecibido)
    ]);
} else {
    // Si falla aquí, suele ser por falta de permisos de escritura en la carpeta
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Error de permisos: No se pudo escribir en " . $archivoDestino
    ]);
}
?>