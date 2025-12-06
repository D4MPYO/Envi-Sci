<?php
header('Content-Type: application/json');

$jsonFile = 'survey-results.json';

// Clear data by creating empty structure
$emptyData = [
    'totalResponses' => 0,
    'responses' => []
];

file_put_contents($jsonFile, json_encode($emptyData, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'All data cleared'
]);
?>
